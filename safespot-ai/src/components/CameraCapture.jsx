import React, { useRef, useState, useEffect } from 'react';

const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const [facingMode, setFacingMode] = useState('environment');
  const [isCapturing, setIsCapturing] = useState(false);
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      setError('');
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (err) {
      console.error('Camera error:', err);
      
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permission in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else {
        setError('Could not access camera. Please try again.');
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;

    setIsCapturing(true);
    setShowFlash(true);

    // Flash effect
    setTimeout(() => setShowFlash(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
        stopCamera();
      }
      setIsCapturing(false);
    }, 'image/jpeg', 0.95);
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black animate-fade-in">
      {/* Flash Effect */}
      {showFlash && (
        <div className="absolute inset-0 bg-white z-50 animate-flash"></div>
      )}

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/90 to-transparent p-4 animate-slide-down">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button
            onClick={handleClose}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all duration-300 group"
          >
            <svg className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <h3 className="text-white font-bold text-lg tracking-wide">Take Photo</h3>
          </div>
          
          <button
            onClick={switchCamera}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all duration-300 group"
          >
            <svg className="w-6 h-6 text-white group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Video Preview */}
      <div className="relative w-full h-full flex items-center justify-center">
        {error ? (
          <div className="text-center px-6 animate-fade-in-up">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center backdrop-blur-sm border border-red-500/20">
              <svg className="w-12 h-12 text-red-400 animate-bounce-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-white text-xl font-bold mb-3">Camera Error</p>
            <p className="text-gray-300 text-sm mb-6 max-w-md">{error}</p>
            <button
              onClick={startCamera}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            <canvas ref={canvasRef} className="hidden" />

            {/* Enhanced Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="border border-white/10"></div>
                ))}
              </div>
            </div>

            {/* Corner Frame */}
            <div className="absolute inset-8 pointer-events-none">
              {/* Top Left */}
              <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-white/40"></div>
              {/* Top Right */}
              <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-white/40"></div>
              {/* Bottom Left */}
              <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-white/40"></div>
              {/* Bottom Right */}
              <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-white/40"></div>
            </div>

            {/* Center Focus Circle */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="w-32 h-32 rounded-full border-2 border-white/30 animate-pulse-slow"></div>
              <div className="absolute inset-0 w-32 h-32 rounded-full border-2 border-white/20 animate-ping"></div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Controls */}
      {!error && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-8 animate-slide-up">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-12 mb-6">
              {/* Cancel Button */}
              <button
                onClick={handleClose}
                className="w-16 h-16 rounded-full border-4 border-white/30 flex items-center justify-center hover:border-white/50 hover:bg-white/10 backdrop-blur-sm transition-all duration-300 group"
              >
                <svg className="w-8 h-8 text-white group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Capture Button */}
              <button
                onClick={capturePhoto}
                disabled={isCapturing}
                className="relative w-24 h-24 rounded-full bg-white border-8 border-gray-900 shadow-2xl hover:scale-110 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                {isCapturing && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-gray-400 border-t-gray-800 rounded-full animate-spin"></div>
                  </div>
                )}
              </button>

              {/* Gallery Button */}
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/20 hover:scale-110 transition-all duration-300 group">
                <svg className="w-8 h-8 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            {/* Instructions */}
            <div className="text-center space-y-2">
              <p className="text-white/90 text-base font-semibold">
                Position the issue in the frame
              </p>
              <p className="text-white/60 text-sm font-medium">
                Tap the white button to capture photo
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes flash {
          0% { opacity: 0; }
          50% { opacity: 0.8; }
          100% { opacity: 0; }
        }
        
        .animate-flash {
          animation: flash 0.3s ease-out;
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-down {
          animation: slide-down 0.4s ease-out;
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out;
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default CameraCapture;