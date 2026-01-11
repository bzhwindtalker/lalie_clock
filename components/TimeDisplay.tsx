import React from 'react';

interface TimeDisplayProps {
  date: Date;
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({ date }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div className="flex flex-col items-center justify-center p-2">
      {/* Reduced font size slightly to fit 480px height better */}
      <h1 className="text-[7rem] md:text-[9rem] font-vcr text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] leading-none select-none">
        {formatTime(date)}
      </h1>
      <p className="text-lg md:text-xl font-vcr text-neon-blue tracking-widest mt-2 animate-pulse">
        WIFI SYNC ACTIVE
      </p>
    </div>
  );
};

export default TimeDisplay;