export enum ClockState {
  SLEEP = 'SLEEP', // Don't wake parents
  QUIET = 'QUIET', // Can play in room
  WAKE = 'WAKE',   // Party time
  NAP = 'NAP',     // Mid-day sleep
  STORY = 'STORY', // Bedtime routine
}

export enum WeatherCondition {
  CLEAR = 'CLEAR',
  CLOUDY = 'CLOUDY',
  RAIN = 'RAIN',
  SNOW = 'SNOW',
  STORM = 'STORM',
  FOG = 'FOG',
  WINDY = 'WINDY'
}

export interface WeatherData {
  condition: WeatherCondition;
  temp: number;
  sunrise: Date;
  sunset: Date;
  moonPhase: number; // 0.0 (New) to 0.5 (Full) to 1.0 (New)
  isDay: boolean;
}

export interface TimeSchedule {
  startHour: number;
  startMinute: number;
}

export interface BrightnessConfig {
  sleep: number;
  quiet: number;
  wake: number;
  nap: number;
  story: number;
}

export interface LocationConfig {
  lat: number;
  lng: number;
  useManual: boolean;
}

export interface AppConfig {
  sleepTime: TimeSchedule;
  quietTime: TimeSchedule;
  wakeTime: TimeSchedule;
  napTime: TimeSchedule;
  storyTime: TimeSchedule;
  napDuration: number; // Duration in minutes
  brightness: BrightnessConfig;
  location: LocationConfig;
  demoMode: boolean;
}

export const DEFAULT_CONFIG: AppConfig = {
  wakeTime: { startHour: 7, startMinute: 0 },
  napTime: { startHour: 13, startMinute: 0 },
  napDuration: 90, // 1.5 hours default
  quietTime: { startHour: 15, startMinute: 0 },
  storyTime: { startHour: 19, startMinute: 0 },
  sleepTime: { startHour: 19, startMinute: 30 },
  brightness: {
    sleep: 5,
    quiet: 40,
    wake: 80,
    nap: 10,
    story: 30
  },
  location: {
    lat: 45.7485, // Lyon 69008
    lng: 4.8706,
    useManual: true // Default to manual to ensure it works on Pi Zero immediately
  },
  demoMode: false,
};