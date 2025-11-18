import React, { useState, useEffect, useRef } from 'react';
import { Camera, Clock, AlertTriangle, CheckCircle, XCircle, Loader } from 'lucide-react';
import { useEmployeeStore } from '../store/employeeStore';
import { supabase } from '../lib/supabase';

interface VerificationSession {
  id: string;
  triggered_at: string;
  expires_at: string;
  status: string;
}

export function RandomVerification() {
  const [activeSession, setActiveSession] = useState<VerificationSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; matchScore?: number } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [countdown, setCountdown] = useState(3);

  const { currentUser } = useEmployeeStore();

  useEffect(() => {
    if (currentUser) {
      checkForActiveSession();
      const interval = setInterval(checkForActiveSession, 15000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  useEffect(() => {
    if (activeSession && activeSession.status === 'pending') {
      const interval = setInterval(() => {
        const remaining = Math.max(0, new Date(activeSession.expires_at).getTime() - Date.now());
        setTimeRemaining(Math.floor(remaining / 1000));

        if (remaining <= 0 && activeSession.status === 'pending') {
          handleExpired();
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [activeSession]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const checkForActiveSession = async () => {
    if (!currentUser) return;

    const { data } = await supabase
      .from('verification_sessions')
      .select('*')
      .eq('employee_id', currentUser.id)
      .eq('status', 'pending')
      .order('triggered_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data && new Date(data.expires_at) > new Date()) {
      if (!activeSession || activeSession.id !== data.id) {
        setActiveSession(data);

        if ('Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification('Random Verification Required!', {
              body: `You have ${Math.floor((new Date(data.expires_at).getTime() - Date.now()) / 60000)} minutes to complete verification.`,
              icon: '/favicon.ico',
              requireInteraction: true,
            });
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                new Notification('Random Verification Required!', {
                  body: `You have ${Math.floor((new Date(data.expires_at).getTime() - Date.now()) / 60000)} minutes to complete verification.`,
                });
              }
            });
          }
        }
      }
    } else if (activeSession?.status === 'pending') {
      setActiveSession(null);
    }
  };

  const handleExpired = async () => {
    if (!activeSession) return;

    setResult({
      success: false,
      message: 'Verification expired - Session marked as unverified. Your manager has been notified.',
    });

    setTimeout(() => {
      setActiveSession(null);
      setResult(null);
    }, 5000);
  };

  const startVerification = async () => {
    setIsCapturing(true);
    setResult(null);
    setCountdown(3);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            captureAndVerify(mediaStream);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error) {
      console.error('Camera access denied:', error);
      setResult({ success: false, message: 'Camera access denied. Please enable camera permissions.' });
      setIsCapturing(false);
    }
  };

  const captureAndVerify = async (mediaStream: MediaStream) => {
    if (!videoRef.current || !canvasRef.current || !currentUser || !activeSession) return;

    setIsVerifying(true);

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);

    mediaStream.getTracks().forEach(track => track.stop());
    setStream(null);
    setIsCapturing(false);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trigger-random-verification?action=respond`;
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          session_id: activeSession.id,
          employee_id: currentUser.id,
          selfie_image: imageData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: data.message,
          matchScore: data.match_score,
        });

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Verification Successful', {
            body: `Face verified with ${data.match_score.toFixed(1)}% match`,
          });
        }

        setTimeout(() => {
          setActiveSession(null);
          setResult(null);
        }, 5000);
      } else {
        setResult({
          success: false,
          message: data.message || data.error,
          matchScore: data.match_score,
        });

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Verification Failed', {
            body: 'Face verification failed - flagged for review',
          });
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
      setResult({ success: false, message: 'Failed to verify. Please try again.' });
    } finally {
      setIsVerifying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!activeSession || activeSession.status !== 'pending') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Verification</h3>
            <p className="text-gray-600">You'll be notified when a random check is triggered</p>
            <p className="text-sm text-gray-500 mt-2">Random checks help ensure workplace security</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-6">
          <div className="flex items-start space-x-3">
            <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-blue-900 mb-2">How Random Verification Works:</p>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• You'll receive a notification during work hours</li>
                <li>• You must complete face verification within the time limit</li>
                <li>• Missed verifications are flagged as "Unverified Session"</li>
                <li>• Your manager will be notified of missed checks</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`rounded-2xl shadow-xl p-6 text-white ${
        timeRemaining < 60 ? 'bg-gradient-to-r from-red-600 to-rose-600 animate-pulse' : 'bg-gradient-to-r from-amber-500 to-orange-500'
      }`}>
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <AlertTriangle className="w-8 h-8 flex-shrink-0" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-2">Random Verification Required!</h3>
            <p className="text-white/90 mb-4">Complete face verification within the time limit or session will be marked as unverified</p>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-white/80 mb-1">Time Remaining</p>
              <p className="text-5xl font-bold">{formatTime(timeRemaining)}</p>
              {timeRemaining < 60 && (
                <p className="text-sm text-white/90 mt-2 font-semibold">⚠️ Less than 1 minute left!</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {!isCapturing && !isVerifying && !result && (
        <button
          onClick={startVerification}
          className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg transform hover:scale-105"
        >
          <span className="flex items-center justify-center space-x-2">
            <Camera className="w-6 h-6" />
            <span>Start Face Verification Now</span>
          </span>
        </button>
      )}

      {(isCapturing || isVerifying) && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="aspect-video bg-gray-900 relative flex items-center justify-center">
            {isCapturing && (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                {countdown > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="text-white text-9xl font-bold animate-pulse">
                      {countdown}
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 border-4 border-blue-500 rounded-lg m-4 pointer-events-none">
                  <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                </div>
              </>
            )}
            {isVerifying && (
              <div className="flex flex-col items-center space-y-4">
                <Loader className="w-16 h-16 text-blue-500 animate-spin" />
                <p className="text-white text-lg">Verifying your face...</p>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {result && (
        <div className={`rounded-2xl shadow-xl p-6 text-white ${
          result.success
            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
            : 'bg-gradient-to-r from-red-600 to-rose-600'
        }`}>
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              {result.success ? (
                <CheckCircle className="w-8 h-8" />
              ) : (
                <XCircle className="w-8 h-8" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">
                {result.success ? 'Verification Successful!' : 'Verification Failed'}
              </h3>
              <p className="text-white/90 text-lg mb-3">{result.message}</p>
              {result.matchScore !== undefined && (
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-sm text-white/80">Face Match Score</p>
                  <p className="text-3xl font-bold">{result.matchScore.toFixed(1)}%</p>
                  {!result.success && <p className="text-sm text-white/80 mt-1">Required: 90%</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Important Information</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>• This is a random security check during work hours</p>
          <p>• You must complete verification before the timer expires</p>
          <p>• If you miss the deadline, your session will be marked as "Unverified"</p>
          <p>• Your manager will receive a notification of any missed verifications</p>
          <p>• Ensure good lighting and look directly at the camera</p>
        </div>
      </div>
    </div>
  );
}
