import { WeatherData, WeatherCondition, LocationConfig } from '../types';

// WMO Weather interpretation codes (https://open-meteo.com/en/docs)
const getWeatherCondition = (code: number): WeatherCondition => {
  // Priority to dangerous/precipitating conditions
  if (code >= 95 && code <= 99) return WeatherCondition.STORM;
  if (code >= 71 && code <= 77) return WeatherCondition.SNOW;
  if (code >= 85 && code <= 86) return WeatherCondition.SNOW;
  if (code >= 51 && code <= 67) return WeatherCondition.RAIN;
  if (code >= 80 && code <= 82) return WeatherCondition.RAIN;
  
  // Code 0, 1: Clear / Mainly Clear
  if (code === 0 || code === 1) return WeatherCondition.CLEAR;

  // Code 2: Partly Cloudy
  if (code === 2) return WeatherCondition.PARTLY_CLOUDY;
  
  // Code 3: Overcast
  if (code === 3) return WeatherCondition.CLOUDY;
  
  if (code >= 45 && code <= 48) return WeatherCondition.FOG;
  
  return WeatherCondition.CLEAR;
};

const getCardinalDirection = (angle: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(angle / 22.5) % 16;
  return directions[index];
};

const getCoordinates = async (config?: LocationConfig): Promise<{lat: number, lng: number} | null> => {
    // 1. Manual Override (Primary)
    if (config?.useManual && config.lat !== 0 && config.lng !== 0) {
        console.log("Using manual coordinates from config");
        return { lat: config.lat, lng: config.lng };
    }

    // 2. Browser Geolocation (Secondary)
    try {
        const pos: any = await new Promise((resolve, reject) => {
            if (!navigator.geolocation) reject("No Geo");
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 });
        });
        console.log("Using browser geolocation");
        return { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch (e) {
        console.warn("Browser geo failed, trying IP fallback...", e);
    }

    // 3. IP Geolocation Fallback (Tertiary)
    try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
            const data = await res.json();
            if (data.latitude && data.longitude) {
                console.log("Using IP geolocation");
                return { lat: data.latitude, lng: data.longitude };
            }
        }
    } catch (e) {
        console.warn("IP Geo failed", e);
    }

    // 4. Hard Fallback (Lyon 69008)
    // Ensures the app never crashes due to missing location
    console.log("All geo methods failed. Falling back to default (Lyon 69008).");
    return { lat: 45.7485, lng: 4.8706 };
};

export const fetchWeather = async (locationConfig?: LocationConfig): Promise<WeatherData | null> => {
    try {
        let coords = await getCoordinates(locationConfig);
        
        // Final safety net for coords
        if (!coords || (coords.lat === 0 && coords.lng === 0)) {
            console.warn("Coordinates invalid, using hardcoded default");
            coords = { lat: 45.7485, lng: 4.8706 };
        }

        // Clamp coordinates to valid ranges to prevent API 400 errors
        const lat = Math.max(-90, Math.min(90, Number(coords.lat)));
        const lng = Math.max(-180, Math.min(180, Number(coords.lng)));

        if (isNaN(lat) || isNaN(lng)) throw new Error("Invalid coordinates");

        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code,is_day,wind_speed_10m,wind_direction_10m&daily=sunrise,sunset&timezone=auto&forecast_days=1`
        );

        if (!response.ok) {
            const errorText = await response.text().catch(() => "No error body");
            console.error(`Weather API Error: ${response.status} ${response.statusText}`, errorText);
            throw new Error(`API responded with ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.current || !data.daily) {
            throw new Error("Invalid API response structure");
        }

        const current = data.current;
        const daily = data.daily;
        const windSpeed = current.wind_speed_10m || 0;
        const windDir = current.wind_direction_10m || 0;

        // Decoupled Logic:
        // 1. Determine sky condition based purely on code (Clear, Partly, Cloudy, Rain...)
        const skyCondition = getWeatherCondition(current.weather_code);

        // 2. Determine wind flag based on speed (> 18km/h)
        const isWindy = windSpeed > 18;

        // Fallback: Calculate moon phase based on date
        const getMoonPhase = (date: Date) => {
          let year = date.getFullYear();
          let month = date.getMonth() + 1;
          let day = date.getDate();
          if (month < 3) { year--; month += 12; }
          ++month;
          let c = 365.25 * year;
          let e = 30.6 * month;
          let jd = c + e + day - 694039.09; 
          jd /= 29.5305882; 
          let b = parseInt(jd.toString()); 
          jd -= b; 
          b = Math.round(jd * 8); 
          if (b >= 8) b = 0; 
          return b / 8;
        };

        const moonPhase = getMoonPhase(new Date());

        return {
          condition: skyCondition,
          temp: current.temperature_2m,
          sunrise: new Date(daily.sunrise[0]),
          sunset: new Date(daily.sunset[0]),
          moonPhase: moonPhase,
          isDay: current.is_day === 1,
          isWindy: isWindy,
          windSpeed: Math.round(windSpeed),
          windDir: getCardinalDirection(windDir)
        };

    } catch (error) {
        console.error("Error fetching weather, using fallback data:", error);
        
        const now = new Date();
        const isDay = now.getHours() >= 7 && now.getHours() < 20;
        
        return {
             condition: WeatherCondition.CLEAR,
             temp: 20,
             sunrise: new Date(now.setHours(7, 0, 0, 0)),
             sunset: new Date(now.setHours(20, 0, 0, 0)),
             moonPhase: 0.5,
             isDay: isDay,
             isWindy: false,
             windSpeed: 5,
             windDir: 'N'
        };
    }
};
