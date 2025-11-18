import React, { useState, useRef } from 'react';
import { Camera, User, CheckCircle, XCircle } from 'lucide-react';

interface BiometricVerificationProps {
  onVerificationComplete: (success: boolean) => void;
}

export function BiometricVerification({ onVerificationComplete }: BiometricVerificationProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [verificationResult, setVerificationResult] = useState<'pending' | 'success' | 'failed'>('pending');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      setIsCapturing(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        // Simulate biometric verification (in real app, send to ML service)
        setTimeout(() => {
          const success = Math.random() > 0.1; // 90% success rate
          setVerificationResult(success ? 'success' : 'failed');
          onVerificationComplete(success);
          
          // Stop camera
          const stream = video.srcObject as MediaStream;
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
          setIsCapturing(false);
        }, 2000);
      }
    }
  };

  const resetVerification = () => {
    setVerificationResult('pending');
    setIsCapturing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Biometric Verification</h3>
        <p className="text-gray-600 mb-6">Verify your identity using facial recognition</p>

        {verificationResult === 'pending' && (
          <div className="space-y-4">
            {!isCapturing ? (
              <button
                onClick={startCamera}
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              >
                <Camera className="w-5 h-5" />
                <span>Start Verification</span>
              </button>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-64 h-48 bg-gray-100 rounded-lg mx-auto"
                  />
                  <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
                    <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-blue-500"></div>
                    <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-blue-500"></div>
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-blue-500"></div>
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-blue-500"></div>
                  </div>
                </div>
                <button
                  onClick={captureImage}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Capture & Verify
                </button>
              </div>
            )}
          </div>
        )}

        {verificationResult === 'success' && (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-green-700 mb-2">Verification Successful</h4>
            <p className="text-gray-600 mb-4">Identity confirmed successfully</p>
            <button
              onClick={resetVerification}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Verify Again
            </button>
          </div>
        )}

        {verificationResult === 'failed' && (
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-red-700 mb-2">Verification Failed</h4>
            <p className="text-gray-600 mb-4">Please try again or contact support</p>
            <button
              onClick={resetVerification}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}