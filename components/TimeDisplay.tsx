import React, { useState, useEffect } from 'react';

const TimeDisplay: React.FC = () => {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    // Independent timer only for this component
    const timer = setInterval(() => {
      setDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div className="flex flex-col items-center justify-center p-2">
      {/* Optimized shadow for Pi Zero - removed filter:drop-shadow */}
      <h1 
        className="text-[7rem] md:text-[9rem] font-vcr text-white leading-none select-none"
        style={{ textShadow: '0 0 10px rgba(255,255,255,0.6)' }}
      >
        {formatTime(date)}
      </h1>
      <p className="text-lg md:text-xl font-vcr text-neon-blue tracking-widest mt-2 animate-pulse">
        WIFI SYNC ACTIVE
      </p>
    </div>
  );
};

export default TimeDisplay;