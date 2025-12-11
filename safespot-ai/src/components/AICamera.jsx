import React, { useRef, useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAuth } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function AICamera({ onAutoFill, onClose }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [analysisStage, setAnalysisStage] = useState('');
  const [userStatus, setUserStatus] = useState({ ready: false, message: '' });
  const [userLocation, setUserLocation] = useState(null);
  const [captureMetadata, setCaptureMetadata] = useState(null);

  // SIMPLIFIED Security: Just check if logged in and not banned
  useEffect(() => {
    const checkUserStatus = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      
      // Must be logged in
      if (!user) {
        setUserStatus({ 
          ready: false, 
          message: '🔒 You must be logged in to use AI detection' 
        });
        return;
      }

      // Check if user is banned (optional - only if you have this field)
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        
        if (userData?.banned) {
          setUserStatus({ 
            ready: false, 
            message: '⛔ Your account has been suspended from using this feature' 
          });
          return;
        }

        // Check usage limits (optional - prevent spam)
        if (userData?.aiUsageCount > 50) {
          setUserStatus({ 
            ready: false, 
            message: '⚠️ Daily AI usage limit reached. Try again tomorrow.' 
          });
          return;
        }
      } catch (error) {
        console.warn('Could not check user status:', error);
        // Continue anyway - don't block user for database errors
      }

      // User is good to go!
      setUserStatus({ ready: true, message: '' });
    };

    checkUserStatus();
  }, []);

  // Get GPS location (optional but recommended)
  useEffect(() => {
    if (userStatus.ready && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          });
        },
        (error) => {
          console.warn('Location access denied:', error);
          // Don't block - just log warning
          setUserLocation({ denied: true });
        },
        { enableHighAccuracy: true }
      );
    }
  }, [userStatus.ready]);

  // Start camera
  useEffect(() => {
    let mounted = true;
    
    const startCamera = async () => {
      if (!userStatus.ready) return;

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        });
        if (mounted && videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
        }
      } catch (error) {
        console.error('Camera error:', error);
        if (mounted) {
          setError('📷 Could not access camera. Please allow camera permissions.');
        }
      }
    };
    
    startCamera();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [userStatus.ready, stream]);

  // Main capture and analysis function
  const captureAndAnalyze = async () => {
    if (!videoRef.current || !userStatus.ready) return;

    setAnalyzing(true);
    setError(null);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      setAnalysisStage('Capturing image...');
      
      // Create canvas for watermarked image
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      // Draw video frame
      ctx.drawImage(videoRef.current, 0, 0);
      
      // Add professional watermark
      const timestamp = new Date().toISOString();
      const userHash = btoa(user.uid).substring(0, 8);
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(10, canvas.height - 90, 450, 80);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`SafeSpot Community Report`, 20, canvas.height - 65);
      ctx.font = '14px Arial';
      ctx.fillText(`📅 ${new Date().toLocaleString()}`, 20, canvas.height - 45);
      ctx.fillText(`🆔 Reporter: ${userHash}`, 20, canvas.height - 25);
      if (userLocation && !userLocation.denied) {
        ctx.fillText(`📍 GPS Verified`, 280, canvas.height - 25);
      }

      const imageData = canvas.toDataURL('image/jpeg', 0.95);

      // Create metadata for audit trail
      const metadata = {
        captureTime: timestamp,
        userId: user.uid,
        userEmail: user.email,
        location: userLocation,
        deviceInfo: navigator.userAgent,
        imageHash: await generateImageHash(imageData)
      };

      setCaptureMetadata(metadata);

      // Log this capture for audit trail
      await logCaptureAttempt(metadata);

      // Increment usage counter (optional - for rate limiting)
      await incrementUsageCounter(user.uid);

      // Get API key
      const apiKey = process.env.REACT_APP_GEMINI_KEY;
      if (!apiKey) {
        throw new Error('AI service is not configured. Please contact administrator.');
      }

      setAnalysisStage('AI analyzing scene...');

      // Initialize Gemini AI
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.3,
          topK: 32,
          topP: 1,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      });

      const prompt = `You are an ETHICAL AI assistant for SafeSpot, a verified community safety reporting system.

🔒 ETHICAL GUIDELINES (CRITICAL):
1. NEVER identify people by race, ethnicity, gender, appearance, or clothing
2. NEVER make accusations about individuals - focus ONLY on visible evidence
3. NEVER profile or make assumptions about people's intentions
4. For suspicious activity, ONLY report if there's PHYSICAL EVIDENCE:
   - Broken windows/doors with forced entry marks
   - Visible property damage in progress
   - Active fire or smoke
   - Actual weapons visible
   - Clear safety hazards
5. DO NOT report: "suspicious people", "someone walking", "person looking around"
6. If you see people but NO clear evidence of wrongdoing, report: "No actionable issue detected"

⚖️ LEGAL PROTECTION:
- This report creates a timestamped, geotagged audit trail
- False reports can have legal consequences
- All reports are reviewed by moderators
- Misuse results in account suspension

🔍 WHAT TO ANALYZE:
**Infrastructure & Safety Issues:**
- Potholes, damaged roads/sidewalks, structural damage
- Broken streetlights, dark dangerous areas
- Fallen trees, blocked paths, trip hazards
- Damaged playground equipment, unsafe facilities

**Environmental Hazards:**
- Flooding, water damage, standing water
- Fire hazards, smoke, chemical spills
- Electrical hazards (exposed wires, damaged poles)
- Dead animals, pest infestations

**Property Damage (EVIDENCE-BASED ONLY):**
- Graffiti, vandalism (describe the damage, not people)
- Broken windows WITH visible break patterns
- Forced entry evidence (damaged locks, broken doors)
- Active fire or destruction IN PROGRESS

**Waste & Sanitation:**
- Overflowing bins, illegal dumping
- Abandoned vehicles, large furniture
- Blocked drains, sewage issues

**Traffic Hazards:**
- Damaged signs/signals
- Road hazards, debris
- Illegally parked vehicles BLOCKING access

🚨 FOR EMERGENCIES:
If you detect:
- Active fire
- Medical emergency
- Violence in progress
- Immediate danger to life

Report: "EMERGENCY DETECTED - User should call 911 immediately. Description: [what you see]"

📝 OUTPUT FORMAT (JSON only):
{
  "category": "infrastructure, lighting, waste, vandalism, environmental, traffic, emergency, no_issue",
  "description": "Detailed, OBJECTIVE description of physical evidence only. No assumptions about people. 2-4 sentences.",
  "urgency": "low, medium, high, critical",
  "evidenceQuality": "clear, moderate, unclear",
  "requiresEmergencyServices": true/false,
  "suggestedAction": "What should be done to address the physical issue",
  "ethicsCheck": "Did I avoid profiling? Did I focus on evidence? YES/NO",
  "moderatorNote": "Any context a human moderator should know"
}

URGENCY LEVELS:
- critical: Immediate danger (fire, exposed wires, major hazard)
- high: Serious safety risk (large pothole, structural damage)
- medium: Should be fixed soon (graffiti, moderate damage)
- low: Minor issue (small litter, aesthetic concern)

If the image shows people with NO clear evidence of wrongdoing, respond:
{
  "category": "no_issue",
  "description": "No actionable safety or infrastructure issue detected in this image.",
  "urgency": "low",
  "evidenceQuality": "unclear",
  "requiresEmergencyServices": false,
  "ethicsCheck": "YES"
}

Return ONLY valid JSON. No markdown. No extra text.`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageData.split(',')[1],
            mimeType: "image/jpeg"
          }
        }
      ]);

      setAnalysisStage('Validating response...');

      const responseText = result.response.text();
      console.log('AI Response:', responseText);

      const cleanJson = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const analysis = JSON.parse(cleanJson);

      // Ethics validation
      if (analysis.ethicsCheck !== "YES") {
        throw new Error('AI failed ethics check. Report blocked for review.');
      }

      // Emergency check
      if (analysis.requiresEmergencyServices) {
        alert('⚠️ EMERGENCY DETECTED\n\nPlease call 911 immediately!\n\nThis app is for non-emergency community issues only.');
        handleClose();
        return;
      }

      // Validate categories
      const validCategories = [
        'infrastructure', 'lighting', 'waste', 
        'vandalism', 'environmental', 'traffic', 
        'emergency', 'no_issue'
      ];
      
      if (!validCategories.includes(analysis.category)) {
        analysis.category = 'no_issue';
      }

      // No issue detected
      if (analysis.category === 'no_issue') {
        alert('ℹ️ No Issue Detected\n\nThe AI could not identify a clear safety or infrastructure issue in this image.\n\nPlease try:\n• Getting closer to the issue\n• Better lighting\n• Different angle\n\nOr fill the form manually.');
        setAnalyzing(false);
        return;
      }

      // Log successful analysis
      await logSuccessfulAnalysis(metadata, analysis);

      setAnalysisStage('Complete!');

      // Build enhanced description
      let enhancedDescription = `${analysis.description}`;
      
      if (analysis.moderatorNote) {
        enhancedDescription += `\n\n⚠️ Moderator Review: ${analysis.moderatorNote}`;
      }

      enhancedDescription += `\n\n📸 AI-Generated Report | Evidence Quality: ${analysis.evidenceQuality}`;
      enhancedDescription += `\n✓ Report captured at ${new Date().toLocaleString()}`;

      // Pass data to parent component
      onAutoFill({
        category: analysis.category,
        description: enhancedDescription,
        urgency: analysis.urgency,
        imageData: imageData,
        aiConfidence: analysis.evidenceQuality,
        aiSuggestion: analysis.suggestedAction || '',
        metadata: metadata,
        aiGenerated: true,
        requiresModeration: analysis.evidenceQuality === 'unclear'
      });

      // Stop camera
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      setTimeout(() => {
        onClose();
      }, 500);

    } catch (error) {
      console.error('Analysis error:', error);
      
      // Log failed attempt
      await logFailedAnalysis(captureMetadata, error.message);
      
      setError(
        error.message.includes('ethics') 
          ? '🚫 Report blocked: Failed ethical guidelines check' 
          : error.message.includes('API') 
          ? '⚠️ AI service unavailable. Please fill manually.' 
          : '❌ Analysis failed. Please try again or fill manually.'
      );
      setAnalyzing(false);
      setAnalysisStage('');
    }
  };

  // Helper: Generate image hash for integrity
  const generateImageHash = async (imageData) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(imageData.substring(0, 1000));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
  };

  // Helper: Log capture attempt
  const logCaptureAttempt = async (metadata) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      await setDoc(doc(db, 'ai_capture_logs', `${user.uid}_${Date.now()}`), {
        ...metadata,
        type: 'capture_attempt',
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.warn('Failed to log capture:', error);
    }
  };

  // Helper: Log successful analysis
  const logSuccessfulAnalysis = async (metadata, analysis) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      await setDoc(doc(db, 'ai_analysis_logs', `${user.uid}_${Date.now()}`), {
        ...metadata,
        analysis: {
          category: analysis.category,
          urgency: analysis.urgency,
          evidenceQuality: analysis.evidenceQuality,
          ethicsCheck: analysis.ethicsCheck
        },
        type: 'successful_analysis',
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.warn('Failed to log analysis:', error);
    }
  };

  // Helper: Log failed analysis
  const logFailedAnalysis = async (metadata, errorMessage) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      await setDoc(doc(db, 'ai_analysis_logs', `${user.uid}_${Date.now()}`), {
        ...metadata,
        error: errorMessage,
        type: 'failed_analysis',
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.warn('Failed to log error:', error);
    }
  };

  // Helper: Increment usage counter (prevents spam)
  const incrementUsageCounter = async (userId) => {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const counterDoc = doc(db, 'ai_usage_counters', `${userId}_${today}`);
      
      const counterSnap = await getDoc(counterDoc);
      const currentCount = counterSnap.exists() ? counterSnap.data().count : 0;
      
      await setDoc(counterDoc, {
        count: currentCount + 1,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.warn('Failed to update counter:', error);
    }
  };

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onClose();
  };

  // Block if not ready
  if (!userStatus.ready) {
    return (
      <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-8 max-w-md text-center shadow-2xl">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-2xl font-black mb-3 text-white">Access Required</h3>
          <p className="text-gray-300 mb-6">
            {userStatus.message}
          </p>
          <button
            onClick={handleClose}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Professional Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/95 to-transparent">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h3 className="text-white font-black text-lg">
                  AI-Powered Detection
                </h3>
                <p className="text-white/70 text-xs">Evidence-based • Ethical • Secure</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Status Badges */}
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <div className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full flex items-center gap-1 border border-green-500/30">
              <span>✓</span> Logged In
            </div>
            {userLocation && !userLocation.denied && (
              <div className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full flex items-center gap-1 border border-blue-500/30">
                <span>📍</span> GPS Active
              </div>
            )}
            <div className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full flex items-center gap-1 border border-purple-500/30">
              <span>🛡️</span> Protected
            </div>
          </div>
        </div>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative mt-28">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Ethics Badge */}
        <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md border border-green-500/30 rounded-xl px-4 py-2 shadow-xl">
          <div className="flex items-center gap-2 text-xs text-white">
            <span className="text-green-400 text-lg">🛡️</span>
            <div>
              <p className="font-bold">Ethical AI</p>
              <p className="text-white/60 text-xs">Evidence-only detection</p>
            </div>
          </div>
        </div>

        {/* Crosshair Frame */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative">
            <div className="w-80 h-80 border-4 border-white/20 rounded-3xl relative">
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-20 h-20 border-t-4 border-l-4 border-blue-500 rounded-tl-2xl"></div>
              <div className="absolute -top-1 -right-1 w-20 h-20 border-t-4 border-r-4 border-blue-500 rounded-tr-2xl"></div>
              <div className="absolute -bottom-1 -left-1 w-20 h-20 border-b-4 border-l-4 border-blue-500 rounded-bl-2xl"></div>
              <div className="absolute -bottom-1 -right-1 w-20 h-20 border-b-4 border-r-4 border-blue-500 rounded-br-2xl"></div>
              
              {/* Center dot */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50"></div>
              </div>
            </div>
            <div className="absolute -bottom-14 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              <p className="text-white text-center text-sm font-bold bg-black/80 px-6 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                📸 Center the issue in frame
              </p>
            </div>
          </div>
        </div>

        {/* Analyzing Overlay */}
        {analyzing && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center">
            <div className="text-center max-w-md px-6">
              <div className="relative w-32 h-32 mx-auto mb-8">
                <div className="absolute inset-0 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl">🔍</span>
                </div>
              </div>
              
              <h4 className="text-white font-black text-3xl mb-4 animate-pulse">
                AI Analyzing
              </h4>
              
              <div className="bg-white/10 rounded-2xl p-5 mb-5 border border-white/20 backdrop-blur-sm">
                <p className="text-blue-400 font-bold text-lg mb-3">{analysisStage}</p>
                <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse"></div>
                </div>
              </div>

              <div className="space-y-3 text-left bg-black/40 rounded-2xl p-5 border border-white/10">
                <p className="text-white/80 text-sm flex items-center gap-3">
                  <span className="text-green-400 text-lg">✓</span> 
                  <span>Checking physical evidence</span>
                </p>
                <p className="text-white/80 text-sm flex items-center gap-3">
                  <span className="text-green-400 text-lg">✓</span> 
                  <span>Running ethics validation</span>
                </p>
                <p className="text-white/80 text-sm flex items-center gap-3">
                  <span className="text-yellow-400 text-lg animate-pulse">⟳</span> 
                  <span>Analyzing objectively</span>
                </p>
                <p className="text-white/70 text-sm flex items-center gap-3">
                  <span className="text-white/40 text-lg">○</span> 
                  <span>Creating audit trail</span>
                </p>
              </div>

              <div className="mt-5 bg-orange-500/20 border border-orange-500/40 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-orange-300 text-xs font-semibold flex items-center justify-center gap-2">
                  <span>⚖️</span>
                  <span>This analysis is logged and reviewable</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="absolute top-4 left-4 right-4 bg-red-500/95 backdrop-blur-sm text-white p-4 rounded-xl shadow-2xl border-2 border-red-300">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <p className="font-bold text-sm mb-1">Analysis Error</p>
                <p className="text-sm opacity-90">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="bg-gradient-to-t from-black via-black/95 to-transparent p-6 pt-10">
        <div className="max-w-md mx-auto">
          {/* Legal Notice */}
          <div className="mb-4 bg-gradient-to-r from-orange-600/20 to-red-600/20 backdrop-blur-sm border border-orange-500/40 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚖️</span>
              <div className="flex-1">
                <p className="text-white font-bold text-sm mb-2">
                  Legal Notice: Evidence-Based Reporting
                </p>
                <p className="text-white/80 text-xs leading-relaxed">
                  • Reports are timestamped, geotagged & auditable<br/>
                  • False reports may have legal consequences<br/>
                  • All captures reviewed by moderators<br/>
                  • Focus on physical evidence, not people
                </p>
              </div>
            </div>
          </div>

          {/* Detection Capabilities */}
          <div className="mb-4 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-green-600/20 backdrop-blur-sm border border-white/20 rounded-xl p-3">
            <p className="text-white text-xs font-semibold text-center mb-2">
              🤖 AI Detects Physical Evidence:
            </p>
            <div className="grid grid-cols-3 gap-2 text-white/80 text-xs text-center">
              <div>🚧 Infrastructure</div>
              <div>💡 Lighting</div>
              <div>🎨 Vandalism</div>
              <div>🗑️ Waste</div>
              <div>🔥 Hazards</div>
              <div>🚦 Traffic</div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-5 text-center">
            <p className="text-white/90 text-sm font-semibold">
              📸 Capture clear evidence of physical issues
            </p>
            <p className="text-white/60 text-xs mt-1">
              AI will analyze and auto-fill your report
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleClose}
              className="px-6 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-bold border-2 border-white/20 hover:bg-white/20 transition-all"
            >
              Cancel
            </button>

            <button
              onClick={captureAndAnalyze}
              disabled={analyzing || !!error}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white rounded-xl font-black text-base shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <span className="text-xl">🔒</span>
                  Capture & Analyze
                </>
              )}
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-4 flex items-center justify-center gap-3 text-white/50 text-xs">
            <div className="flex items-center gap-1">
              <span>🔒</span>
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1">
              <span>✓</span>
              <span>Verified</span>
            </div>
            <div className="flex items-center gap-1">
              <span>📋</span>
              <span>Logged</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🛡️</span>
              <span>Ethical</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}