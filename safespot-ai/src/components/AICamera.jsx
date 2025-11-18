import React, { useRef, useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function AICamera({ onAutoFill, onClose }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  // Start camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment', // Use back camera on mobile
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setStream(mediaStream);
      } catch (error) {
        console.error('Camera error:', error);
        setError('Could not access camera. Please allow camera permissions.');
      }
    };
    startCamera();

    // Cleanup
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Capture and analyze
  const captureAndAnalyze = async () => {
    if (!videoRef.current) return;

    setAnalyzing(true);
    setError(null);

    try {
      // Capture image from video
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);

      // Get API key
      const apiKey = process.env.REACT_APP_GEMINI_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key not found. Add REACT_APP_GEMINI_KEY to .env file');
      }

      // Initialize Gemini
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `You are analyzing an image for a community safety reporting app called SafeSpot.

Your job: Identify the safety or infrastructure issue in this image.

Provide a JSON response with:
1. "category" - Choose EXACTLY ONE from: lighting, vandalism, noise, waste, infrastructure, other
2. "description" - Write 2-3 detailed sentences describing what you see in the image
3. "urgency" - Choose EXACTLY ONE from: low, medium, high

Rules:
- If you see a pothole, damaged road, broken sidewalk → category: "infrastructure"
- If you see graffiti, vandalism, property damage → category: "vandalism"
- If you see garbage, litter, overflowing bins → category: "waste"
- If you see broken/dark streetlights → category: "lighting"
- If image is unclear or no obvious issue → category: "other"
- Urgency "high" = immediate safety risk, "medium" = should be fixed soon, "low" = minor issue

Return ONLY valid JSON (no markdown, no extra text):
{
  "category": "one of: lighting, vandalism, noise, waste, infrastructure, other",
  "description": "detailed description of what you see",
  "urgency": "one of: low, medium, high"
}`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageData.split(',')[1], // Remove data:image/jpeg;base64,
            mimeType: "image/jpeg"
          }
        }
      ]);

      const responseText = result.response.text();
      console.log('AI Response:', responseText);

      // Clean up response (remove markdown code blocks if present)
      const cleanJson = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const analysis = JSON.parse(cleanJson);

      // Validate response
      const validCategories = ['lighting', 'vandalism', 'noise', 'waste', 'infrastructure', 'other'];
      const validUrgencies = ['low', 'medium', 'high'];

      if (!validCategories.includes(analysis.category)) {
        throw new Error('Invalid category from AI');
      }
      if (!validUrgencies.includes(analysis.urgency)) {
        throw new Error('Invalid urgency from AI');
      }

      // Pass data back to parent
      onAutoFill({
        category: analysis.category,
        description: analysis.description,
        urgency: analysis.urgency,
        imageData: imageData
      });

      // Stop camera
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // Close modal
      onClose();

    } catch (error) {
      console.error('Analysis error:', error);
      setError('Failed to analyze image. Please try again or fill manually.');
      setAnalyzing(false);
    }
  };

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-black text-xl flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              AI Vision Mode
            </h3>
            <p className="text-white/80 text-sm">Point camera at issue for auto-detection</p>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Crosshair overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 border-4 border-white/50 rounded-xl relative">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500"></div>
          </div>
        </div>

        {/* Analyzing overlay */}
        {analyzing && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-purple-600 rounded-full animate-spin animation-delay-150"></div>
              </div>
              <h4 className="text-white font-black text-2xl mb-2 animate-pulse">🤖 AI Analyzing...</h4>
              <p className="text-white/80 text-lg mb-1">Detecting issue type</p>
              <p className="text-white/60 text-sm">Writing description</p>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="absolute top-20 left-4 right-4 bg-red-500/90 backdrop-blur-sm text-white p-4 rounded-xl">
            <p className="font-bold text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gradient-to-t from-black via-black/80 to-transparent p-6">
        <div className="max-w-md mx-auto">
          {/* Instructions */}
          <div className="mb-4 text-center">
            <p className="text-white/90 text-sm font-semibold">
              📸 Center the issue in frame, then capture
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleClose}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-bold border-2 border-white/20 hover:bg-white/20 transition-all"
            >
              Cancel
            </button>

            <button
              onClick={captureAndAnalyze}
              disabled={analyzing || !!error}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl font-black text-lg shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <span className="text-2xl">📸</span>
                  Capture & Auto-Fill
                </>
              )}
            </button>
          </div>

          {/* Features */}
          <div className="mt-4 flex items-center justify-center gap-6 text-white/60 text-xs">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
              </svg>
              Auto-Detect
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z"/>
              </svg>
              Auto-Write
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
              </svg>
              Instant
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}