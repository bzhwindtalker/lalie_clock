import React from 'react';
import { ClockState, WeatherData } from '../types';
import WeatherOverlay from './WeatherOverlay';

interface WaveBackgroundProps {
  clockState: ClockState;
  weather: WeatherData | null;
}

const WaveBackground: React.FC<WaveBackgroundProps> = ({ clockState, weather }) => {
  
  // 1. Base Gradient Config (Dictated by App State for Sleep Training)
  const getGradientConfig = () => {
    switch (clockState) {
      case ClockState.SLEEP:
        return { start: '#020024', mid: '#090979', end: '#000000', wave1: '#4B0082', wave2: '#8A2BE2' };
      case ClockState.NAP:
        return { start: '#1e3a8a', mid: '#3b82f6', end: '#93c5fd', wave1: '#60a5fa', wave2: '#bfdbfe' };
      case ClockState.STORY:
        return { start: '#4a044e', mid: '#a21caf', end: '#fb923c', wave1: '#c026d3', wave2: '#fdba74' };
      case ClockState.QUIET:
        return { start: '#451e3e', mid: '#651e3e', end: '#851e3e', wave1: '#FFB6C1', wave2: '#FFA07A' };
      case ClockState.WAKE:
        return { start: '#164e63', mid: '#115e59', end: '#581c87', wave1: '#7FFFD4', wave2: '#00FFFF' };
      default:
        return { start: '#000', mid: '#111', end: '#222', wave1: '#333', wave2: '#444' };
    }
  };

  const colors = getGradientConfig();

  // 2. Astronomical Position Calculation
  const now = new Date();
  
  // Default values if no weather data (assume day/night based on 6am/6pm)
  let sunY = 150; // Off screen
  let sunX = 50;
  let moonY = 150;
  let moonX = 50;
  let phase = 0.5; // Full

  if (weather) {
      const { sunrise, sunset, moonPhase } = weather;
      phase = moonPhase;

      const nowTs = now.getTime();
      const riseTs = sunrise.getTime();
      const setTs = sunset.getTime();

      // Sun Logic
      if (nowTs >= riseTs && nowTs <= setTs) {
          // Daytime
          const totalDay = setTs - riseTs;
          const progress = (nowTs - riseTs) / totalDay; // 0.0 to 1.0
          sunX = progress * 100;
          // Parabola for Y (0 at ends, -20 at 0.5)
          // y = 4 * (x - 0.5)^2  -> ranges 0 to 1
          // We want it high (low %) at 0.5
          // Input 0 -> 1, 0.5 -> 0, 1 -> 1
          const arc = Math.pow((progress - 0.5) * 2, 2); 
          sunY = 10 + (arc * 100); // 10% (noon) to 110% (horizon)
      } else {
          sunY = 150; // Below horizon
      }

      // Moon Logic (Simplified: Opposite of Sun for visualization, though technically complex)
      // If sun is down, put moon up.
      if (sunY > 100) {
          // Night time
          // Estimate position based on time since sunset or until sunrise
          // This is a "fake" visual position because real moon rise/set varies wildly
          // But for a kid's clock, moon at night = good.
          
          let nightProgress = 0;
          if (nowTs > setTs) {
             // After sunset, before midnight
             nightProgress = (nowTs - setTs) / (86400000 / 2); // Rough estimate
             if (nightProgress > 0.5) nightProgress = 0.5;
          } else if (nowTs < riseTs) {
              // After midnight, before sunrise
              nightProgress = 0.5 + ((nowTs - (riseTs - 43200000)) / 43200000);
          }
          
          // Force moon to be somewhat visible at night
          moonX = (now.getHours() * 60 + now.getMinutes()) / 1440 * 100;
          moonY = 20; // High in sky
      } else {
          moonY = 150;
      }
  } else {
      // Fallback Visuals without API
      const hour = now.getHours();
      if (hour > 6 && hour < 18) {
          sunY = 20; sunX = ((hour - 6) / 12) * 100;
          moonY = 150;
      } else {
          sunY = 150;
          moonY = 20; moonX = 50;
      }
  }

  // Moon Phase Rendering (CSS Masking)
  // Phase 0 = New, 0.25 = First Quarter, 0.5 = Full, 0.75 = Last Quarter
  // We need to shift a shadow over the moon disc.
  
  // Calculate offset for the "Shadow" circle
  // Full moon (0.5) -> Shadow is far away. New Moon (0 or 1) -> Shadow covers it.
  const getMoonShadowStyle = (p: number) => {
      // Normalize 0-1. 
      // 0.5 is full (white circle).
      // 0.0 is new (black circle).
      // Let's simplify: A white circle. A dark circle moves across it.
      
      // If phase is 0.5 (Full), we want full visibility.
      // If phase is 0 (New), we want 0 visibility.
      
      // Visual approximation for pixel art style
      const phaseType = p < 0.5 ? 'waxing' : 'waning'; // Growing vs Shrinking
      const visiblePercent = 1 - Math.abs((p - 0.5) * 2); // 0 to 1

      // We will render a white circle, and use a clip path or secondary circle to hide part
      return { visiblePercent, phaseType };
  };

  const moonVisuals = getMoonShadowStyle(phase);

  return (
    <div style={{
        background: `linear-gradient(to bottom, ${colors.start}, ${colors.mid}, ${colors.end})`,
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0,
        transition: 'background 3s ease'
    }}>
      
      {/* Weather Effects Layer */}
      {weather && <WeatherOverlay condition={weather.condition} />}

      {/* Background Waves */}
      <div className="absolute inset-0 opacity-60 mix-blend-screen overflow-hidden z-0">
         <div className="absolute bottom-0 left-0 w-[200%] h-1/2 flex animate-wave-slow">
             <svg className="w-1/2 h-full block" viewBox="0 0 1440 320" preserveAspectRatio="none">
                <path fill={colors.wave1} fillOpacity="0.6" d="M0,224 C360,180 1080,260 1440,224 L1440,320 L0,320 Z" />
             </svg>
             <svg className="w-1/2 h-full block" viewBox="0 0 1440 320" preserveAspectRatio="none">
                <path fill={colors.wave1} fillOpacity="0.6" d="M0,224 C360,180 1080,260 1440,224 L1440,320 L0,320 Z" />
             </svg>
         </div>
         <div className="absolute bottom-0 left-0 w-[200%] h-3/4 flex animate-wave-slower">
             <svg className="w-1/2 h-full block" viewBox="0 0 1440 320" preserveAspectRatio="none">
                <path fill={colors.wave2} fillOpacity="0.4" d="M0,192 C360,240 1080,140 1440,192 L1440,320 L0,320 Z" />
             </svg>
             <svg className="w-1/2 h-full block" viewBox="0 0 1440 320" preserveAspectRatio="none">
                <path fill={colors.wave2} fillOpacity="0.4" d="M0,192 C360,240 1080,140 1440,192 L1440,320 L0,320 Z" />
             </svg>
         </div>
      </div>

      {/* Stars - Only show if Sun is down or it's SLEEP mode */}
      <div 
        className="absolute inset-[-50%] w-[200%] h-[200%] z-0 transition-opacity duration-2000 animate-spin-slow"
        style={{ 
            opacity: (sunY > 80 || clockState === ClockState.SLEEP) ? 0.8 : 0, 
            transformOrigin: 'center center' 
        }}
      >
        {[...Array(50)].map((_, i) => (
             <div key={i} className="absolute bg-white rounded-full"
              style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, width: `${Math.random() * 2 + 1}px`, height: `${Math.random() * 2 + 1}px` }}
            />
        ))}
      </div>

      {/* SUN */}
      <div 
        className="absolute w-32 h-32 rounded-full blur-md transition-all duration-[5000ms]"
        style={{
            background: 'radial-gradient(circle, #fde047 20%, #ea580c 100%)',
            boxShadow: '0 0 60px #fb923c',
            top: `${sunY}%`,
            left: `${sunX}%`,
            opacity: sunY > 110 ? 0 : 1
        }}
      />

      {/* MOON */}
      <div 
        className="absolute w-24 h-24 rounded-full transition-all duration-[5000ms]"
        style={{
            top: `${moonY}%`,
            left: `${moonX}%`,
            opacity: moonY > 110 ? 0 : 1,
            backgroundColor: 'transparent',
            // Create phase using box-shadow offset for a "Crescent" look
            // This is a stylistic simplification for the pixel art aesthetic
            boxShadow: moonVisuals.visiblePercent > 0.9 
                ? '0 0 40px #ffffff, inset -2px -2px 10px #ddd' // Full Moon Glow
                : `inset ${moonVisuals.phaseType === 'waxing' ? '10px' : '-10px'} 0px 0px 0px #ffffff` // Crescent
        }}
      >
          {/* Moon Glow only if visible */}
          {moonVisuals.visiblePercent > 0.2 && (
             <div className="absolute inset-0 rounded-full bg-white opacity-20 blur-xl" />
          )}
      </div>
      
    </div>
  );
};

export default WaveBackground;