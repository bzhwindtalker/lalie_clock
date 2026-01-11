import React, { useMemo } from 'react';
import { WeatherCondition } from '../types';

interface WeatherOverlayProps {
  condition: WeatherCondition;
}

const WeatherOverlay: React.FC<WeatherOverlayProps> = React.memo(({ condition }) => {
  if (condition === WeatherCondition.CLEAR) return null;

  // --- PRE-CALCULATE PARTICLE DATA ---

  // CLOUDS: Seamless loop
  const cloudData = useMemo(() => {
    const cloudCount = 8;
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
    return Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: -(Math.random() * 2), 
      duration: 0.5 + Math.random() * 0.3, // Faster fall
      opacity: 0.6 + Math.random() * 0.4
    }));
  }, []);

  // SNOW
  const snowData = useMemo(() => {
    return Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 6 + Math.random() * 6,
      delay: -(Math.random() * 10),
      duration: 3 + Math.random() * 5,
      opacity: 0.7 + Math.random() * 0.3
    }));
  }, []);

  // WIND
  const windData = useMemo(() => {
    return Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      top: Math.random() * 80 + 10,
      width: 150 + Math.random() * 250, // Longer streaks
      delay: -(Math.random() * 5),
      duration: 0.5 + Math.random() * 1.0,
      opacity: 0.4 + Math.random() * 0.5 // Higher opacity
    }));
  }, []);

  // --- RENDER HELPERS ---

  const renderCloudShape = (type: string) => (
    <div className="relative">
       {/* Main Body */}
       <div className="absolute w-32 h-12 bg-white rounded-full blur-[4px]" />
       {/* Fluffs */}
       <div className="absolute -top-6 left-4 w-16 h-16 bg-white rounded-full blur-[4px]" />
       <div className="absolute -top-4 left-14 w-12 h-12 bg-white rounded-full blur-[4px]" />
       <div className="absolute -top-3 left-20 w-10 h-10 bg-white/90 rounded-full blur-[4px]" />
       {/* Shadow */}
       <div className="absolute top-4 left-4 w-24 h-6 bg-gray-200/50 rounded-full blur-[6px]" />
    </div>
  );

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden select-none">
      
      {/* ATMOSPHERIC FOG */}
      {condition === WeatherCondition.FOG && (
        <div className="absolute inset-0 z-20 overflow-hidden">
          <div className="absolute inset-[-20%] bg-white/40 blur-[80px] animate-fog-drift" />
          <div className="absolute inset-[-20%] bg-gray-300/30 blur-[60px] animate-fog-drift-slow mix-blend-overlay" />
        </div>
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
                 className="absolute h-1 bg-white/30 rounded-full blur-[1px] animate-wind-blow"
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
            {/* Flying Debris/Leaves */}
            {[...Array(12)].map((_, i) => (
                <div 
                  key={`leaf-${i}`}
                  className="absolute w-3 h-3 bg-green-300 rounded-sm animate-debris-fly"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: '-10%',
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${0.8 + Math.random()}s`
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
                        width: '4px', // Thicker
                        height: '40px', // Longer
                        opacity: drop.opacity,
                        boxShadow: '0 0 8px #00ffff', // Stronger glow
                        animationDuration: `${drop.duration}s`,
                        animationDelay: `${drop.delay}s`
                    }}
                />
            ))}
             {/* Splash Sprites at Bottom */}
             <div className="absolute bottom-0 w-full h-16">
                {[...Array(20)].map((_, i) => (
                    <div 
                        key={`splash-${i}`}
                        className="absolute bottom-4 w-3 h-3 bg-white rounded-full animate-ping"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDuration: '0.6s',
                            animationDelay: `${Math.random()}s`,
                            opacity: 0.8
                        }}
                    />
                ))}
             </div>
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
                      boxShadow: '0 0 8px white',
                      animationDuration: `${flake.duration}s`,
                      animationDelay: `${flake.delay}s`
                  }}
              />
            ))}
            {/* Ground Snow Layer */}
            <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white via-white/80 to-transparent blur-md opacity-90" />
            <div className="absolute bottom-[-10px] left-[-10%] w-[120%] h-16 bg-white rounded-t-[50%] blur-xl opacity-60" />
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
        .animate-debris-fly { animation-name: debris-fly; animation-timing-function: linear; animation-iteration-count: infinite; }
        .animate-lightning-strike { animation: lightning-strike 5s infinite; }
        .animate-fog-drift { animation: fog-drift 20s ease-in-out infinite alternate; }
        .animate-fog-drift-slow { animation: fog-drift-slow 30s ease-in-out infinite alternate; }
        .animate-wave-fast { animation: wave 5s linear infinite; }

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
        @keyframes debris-fly {
            0% { transform: translateX(0) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateX(120vw) rotate(720deg); opacity: 0; }
        }
        @keyframes lightning-strike {
            0%, 90%, 93%, 96%, 100% { opacity: 0; }
            91%, 94% { opacity: 0.9; }
            92%, 95% { opacity: 0.3; }
        }
        @keyframes fog-drift {
            0%, 100% { transform: translateX(-2%) scale(1.1); }
            50% { transform: translateX(2%) scale(1.15); }
        }
        @keyframes fog-drift-slow {
            0%, 100% { transform: translateX(2%) scale(1.1); }
            50% { transform: translateX(-2%) scale(1.15); }
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