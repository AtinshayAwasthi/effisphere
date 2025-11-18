import React, { useState, useEffect } from 'react';
import { Play, Pause, Square } from 'lucide-react';

interface TimeTrackerProps {
  isCheckedIn: boolean;
  onCheckIn: () => void;
  onCheckOut: () => void;
  checkInTime?: Date | null;
}

export function TimeTracker({ isCheckedIn, onCheckIn, onCheckOut, checkInTime }: TimeTrackerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isCheckedIn && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCheckedIn, startTime]);

  const handleCheckIn = () => {
    onCheckIn();
  };

  const handleCheckOut = () => {
    onCheckOut();
  };

  useEffect(() => {
    if (isCheckedIn && checkInTime) {
      setStartTime(checkInTime);
      // Calculate elapsed time from actual check-in time
      const elapsed = Math.floor((Date.now() - checkInTime.getTime()) / 1000);
      setElapsedTime(elapsed);
    } else if (!isCheckedIn) {
      setStartTime(null);
      setElapsedTime(0);
    }
  }, [isCheckedIn, checkInTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-center">
      <div className="text-4xl font-mono font-bold text-gray-900 mb-4">
        {formatTime(elapsedTime)}
      </div>
      
      {!isCheckedIn ? (
        <button
          onClick={handleCheckIn}
          className="flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium mx-auto"
        >
          <Play className="w-5 h-5" />
          <span>Start Work</span>
        </button>
      ) : (
        <button
          onClick={handleCheckOut}
          className="flex items-center justify-center space-x-2 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors font-medium mx-auto"
        >
          <Square className="w-5 h-5" />
          <span>End Work</span>
        </button>
      )}
    </div>
  );
}