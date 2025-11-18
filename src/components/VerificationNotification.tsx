import React, { useState, useRef } from 'react';
import { Camera, X, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface VerificationNotificationProps {
  sessionId: string;
  expiresAt: string;
  onClose: () => void;
  onComplete: () => void;
}

export function VerificationNotification({ sessionId, expiresAt, onClose, onComplete }: VerificationNotificationProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
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
      console.error('Camera error:', error);
      setResult({ success: false, message: 'Camera access denied' });
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsProcessing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      // Stop camera
      const stream = video.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      
      // Simulate face recognition (in real app, this would call AI service)
      await new Promise(resolve => setTimeout(resolve, 2000));
      const faceMatchScore = 85 + Math.random() * 10; // Mock score 85-95%
      
      // Update verification session
      const { error } = await supabase
        .from('verification_sessions')
        .update({
          status: faceMatchScore >= 90 ? 'verified' : 'failed',
          face_match_score: faceMatchScore,
          response_time_seconds: Math.floor((Date.now() - new Date(expiresAt).getTime() + 5 * 60 * 1000) / 1000)
        })
        .eq('id', sessionId);
      
      if (error) {
        setResult({ success: false, message: 'Failed to update verification' });
      } else {
        setResult({ 
          success: faceMatchScore >= 90, 
          message: faceMatchScore >= 90 
            ? `Verification successful! Match score: ${faceMatchScore.toFixed(1)}%`
            : `Verification failed. Match score: ${faceMatchScore.toFixed(1)}% (Required: 90%)`
        });
        
        setTimeout(() => {
          onComplete();
          onClose();
        }, 3000);
      }
    }
    
    setIsProcessing(false);
  };

  const timeLeft = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Identity Verification Required</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center mb-4">
          <div className="text-2xl font-mono font-bold text-red-600">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
          <p className="text-sm text-gray-600">Time remaining</p>
        </div>

        {!isCapturing && !result && (
          <div className="text-center">
            <Camera className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Please take a selfie to verify your identity. Make sure your face is clearly visible.
            </p>
            <button
              onClick={startCamera}
              className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Camera
            </button>
          </div>
        )}

        {isCapturing && !result && (
          <div className="text-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-48 bg-gray-100 rounded-lg mb-4"
            />
            <canvas ref={canvasRef} className="hidden" />
            <button
              onClick={capturePhoto}
              disabled={isProcessing}
              className="w-full py-3 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Capture Photo'}
            </button>
          </div>
        )}

        {result && (
          <div className={`text-center p-4 rounded-lg ${
            result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center justify-center mb-2">
              {result.success ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <AlertCircle className="w-8 h-8 text-red-600" />
              )}
            </div>
            <p className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
              {result.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}