import React, { useMemo } from 'react';
import { WeatherCondition } from '../types';

interface WeatherOverlayProps {
  condition: WeatherCondition;
}

const WeatherOverlay: React.FC<WeatherOverlayProps> = React.memo(({ condition }) => {
  if (condition === WeatherCondition.CLEAR) return null;

  // --- PRE-CALCULATE PARTICLE DATA ---
  // OPTIMIZED FOR RASPBERRY PI ZERO 2W
  // drastically reduced counts to prevent GPU hang

  // CLOUDS: Seamless loop
  const cloudData = useMemo(() => {
    const cloudCount = 4; // Reduced from 8
    return Array.from({ length: cloudCount }).map((_, i) => ({
      id: i,
      left: (i * (100 / cloudCount)) + (Math.random() * 5), 
      top: 5 + Math.random() * 25,
      scale: 0.8 + Math.random() * 0.4,
      opacity: 0.8 + Math.random() * 0.2,
      type: Math.random() > 0.5 ? 'fluffy' : 'flat'
    }));
  }, []);

  // RAIN
  const rainData = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({ // Reduced from 150
      id: i,
      left: Math.random() * 100,
      delay: -(Math.random() * 2), 
      duration: 0.5 + Math.random() * 0.3, // Faster fall
      opacity: 0.6 + Math.random() * 0.4
    }));
  }, []);

  // SNOW
  const snowData = useMemo(() => {
    return Array.from({ length: 25 }).map((_, i) => ({ // Reduced from 100
      id: i,
      left: Math.random() * 100,
      size: 4 + Math.random() * 4,
      delay: -(Math.random() * 10),
      duration: 3 + Math.random() * 5,
      opacity: 0.7 + Math.random() * 0.3
    }));
  }, []);

  // WIND
  const windData = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => ({ // Reduced from 25
      id: i,
      top: Math.random() * 80 + 10,
      width: 150 + Math.random() * 250, // Longer streaks
      delay: -(Math.random() * 5),
      duration: 0.5 + Math.random() * 1.0,
      opacity: 0.3 + Math.random() * 0.3
    }));
  }, []);

  // --- RENDER HELPERS ---

  const renderCloudShape = (type: string) => (
    <div className="relative">
       {/* Main Body */}
       <div className="absolute w-32 h-12 bg-white rounded-full blur-[2px]" />
       {/* Fluffs - simplified for performance */}
       <div className="absolute -top-6 left-4 w-16 h-16 bg-white rounded-full blur-[2px]" />
       <div className="absolute -top-4 left-14 w-12 h-12 bg-white rounded-full blur-[2px]" />
    </div>
  );

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden select-none">
      
      {/* ATMOSPHERIC FOG - Simplified for Pi */}
      {condition === WeatherCondition.FOG && (
        <div className="absolute inset-0 z-20 overflow-hidden bg-white/20" />
      )}

      {/* CLOUDS - Seamless Scrolling */}
      {(condition === WeatherCondition.CLOUDY || condition === WeatherCondition.RAIN || condition === WeatherCondition.STORM || condition === WeatherCondition.SNOW || condition === WeatherCondition.FOG || condition === WeatherCondition.WINDY) && (
        <div className={`absolute top-0 left-0 w-[200%] h-full z-0 pointer-events-none ${condition === WeatherCondition.WINDY ? 'animate-wave-fast' : 'animate-wave-slow'}`}>
           {/* FIRST SET (0-50%) */}
           {cloudData.map((cloud) => (
             <div 
                key={`c1-${cloud.id}`} 
                className="absolute transform transition-transform"
                style={{ 
                  left: `${cloud.left / 2}%`, 
                  top: `${cloud.top}%`, 
                  transform: `scale(${cloud.scale})`,
                  opacity: cloud.opacity
                }}
             >
                {renderCloudShape(cloud.type)}
             </div>
           ))}
           {/* DUPLICATE SET (50-100%) */}
           {cloudData.map((cloud) => (
             <div 
                key={`c2-${cloud.id}`} 
                className="absolute transform transition-transform"
                style={{ 
                  left: `${(cloud.left / 2) + 50}%`,
                  top: `${cloud.top}%`, 
                  transform: `scale(${cloud.scale})`,
                  opacity: cloud.opacity
                }}
             >
                {renderCloudShape(cloud.type)}
             </div>
           ))}
        </div>
      )}

      {/* WIND VISUALIZATION */}
      {condition === WeatherCondition.WINDY && (
        <div className="absolute inset-0 z-30 overflow-hidden">
            {windData.map((line) => (
               <div 
                 key={`wind-${line.id}`}
                 className="absolute h-1 bg-white/30 rounded-full animate-wind-blow"
                 style={{
                    top: `${line.top}%`,
                    left: '-20%', // Start off screen
                    width: `${line.width}px`,
                    opacity: line.opacity,
                    animationDuration: `${line.duration}s`,
                    animationDelay: `${line.delay}s`
                 }}
               />
            ))}
        </div>
      )}

      {/* RAIN SYSTEM - High Visibility */}
      {(condition === WeatherCondition.RAIN || condition === WeatherCondition.STORM) && (
        <div className="absolute inset-0 z-30 overflow-hidden">
            {rainData.map((drop) => (
                <div 
                    key={`rain-${drop.id}`}
                    className="absolute bg-cyan-400 rounded-full animate-rain-fall"
                    style={{
                        left: `${drop.left}%`,
                        top: '-10%', // Start slightly above viewport to ensure animation entry
                        width: '3px', 
                        height: '30px', 
                        opacity: drop.opacity,
                        // Removed box-shadow for performance on Pi
                        animationDuration: `${drop.duration}s`,
                        animationDelay: `${drop.delay}s`
                    }}
                />
            ))}
        </div>
      )}

      {/* SNOW SYSTEM - High Visibility & Ground Layer */}
      {condition === WeatherCondition.SNOW && (
        <div className="absolute inset-0 z-30 overflow-hidden">
            {snowData.map((flake) => (
              <div 
                  key={`snow-${flake.id}`}
                  className="absolute bg-white rounded-full animate-snow-fall"
                  style={{
                      left: `${flake.left}%`,
                      top: '-20px',
                      width: `${flake.size}px`,
                      height: `${flake.size}px`,
                      opacity: flake.opacity,
                      animationDuration: `${flake.duration}s`,
                      animationDelay: `${flake.delay}s`
                  }}
              />
            ))}
            {/* Ground Snow Layer */}
            <div className="absolute bottom-0 left-0 w-full h-8 bg-white/80 blur-sm" />
        </div>
      )}

      {/* LIGHTNING */}
      {condition === WeatherCondition.STORM && (
        <div className="absolute inset-0 bg-white opacity-0 animate-lightning-strike mix-blend-hard-light z-50 pointer-events-none" />
      )}
      
      <style>{`
        /* Animation Classes */
        .animate-rain-fall { animation-name: rain-fall; animation-timing-function: linear; animation-iteration-count: infinite; }
        .animate-snow-fall { animation-name: snow-fall; animation-timing-function: linear; animation-iteration-count: infinite; }
        .animate-wind-blow { animation-name: wind-blow; animation-timing-function: linear; animation-iteration-count: infinite; }
        .animate-lightning-strike { animation: lightning-strike 5s infinite; }
        .animate-wave-fast { animation: wave 5s linear infinite; }
        .animate-wave-slow { animation: wave 20s linear infinite; }

        /* Keyframes */
        @keyframes rain-fall {
            0% { transform: translateY(0) skewX(-10deg); }
            100% { transform: translateY(120vh) skewX(-10deg); }
        }
        @keyframes snow-fall {
            0% { transform: translateY(0) translateX(0) rotate(0deg); }
            25% { transform: translateY(30vh) translateX(15px) rotate(45deg); }
            50% { transform: translateY(60vh) translateX(-15px) rotate(90deg); }
            75% { transform: translateY(90vh) translateX(10px) rotate(135deg); }
            100% { transform: translateY(120vh) translateX(0) rotate(180deg); }
        }
        @keyframes wind-blow {
            0% { transform: translateX(0); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateX(120vw); opacity: 0; }
        }
        @keyframes lightning-strike {
            0%, 90%, 93%, 96%, 100% { opacity: 0; }
            91%, 94% { opacity: 0.9; }
            92%, 95% { opacity: 0.3; }
        }
        @keyframes wave {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
});

export default WeatherOverlay;