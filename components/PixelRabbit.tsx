import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ClockState, WeatherData, WeatherCondition } from '../types';

interface RabbitProps {
  clockState: ClockState;
  weather: WeatherData | null;
}

// --- CONFIGURATION ---
// Grid: 64x64
// Style: "Soft Pixel" - Colored outlines (Anti-aliased feel), No harsh blacks.

type PixelGrid = string[];

const PALETTE: Record<string, string> = {
  '.': 'transparent',
  
  // BUNNY
  'W': '#ffffff', // White Fur
  'S': '#94a3b8', // Fur Shadow/Outline (Soft Blue-Grey)
  'P': '#fbcfe8', // Pink (Ear Inner / Cheeks)
  'D': '#f472b6', // Dark Pink (Ear Outline)
  'E': '#334155', // Eyes (Dark Slate - Softer than black)
  '-': '#334155', // Closed Eye

  // PROPS - CLOTHES (BLUE)
  'B': '#60a5fa', // Blue Light
  'N': '#2563eb', // Blue Shadow/Outline

  // PROPS - ACCESSORIES (RED)
  'R': '#f87171', // Red Light
  'K': '#dc2626', // Red Shadow/Outline

  // PROPS - OBJECTS (ORANGE/YELLOW)
  'O': '#fb923c', // Orange
  'Q': '#ea580c', // Orange Shadow
  'Y': '#facc15', // Yellow
  'Z': '#ca8a04', // Yellow Shadow

  // PROPS - SNOWMAN
  'M': '#f1f5f9', // Snow White
  'I': '#cbd5e1', // Snow Shadow

  // PROPS - MISC
  'T': '#94a3b8', // String
  'G': '#475569', // Dark Grey (Road/Tires)
  'L': '#0f172a', // Black/Text (High contrast for glasses)
};

// Helper to generate empty space
const E = "................................................................"; 

// --- SPRITES (64x64) ---
// The rabbit acts in the bottom center (~32x32 area).
// Props can extend anywhere.

const SPRITES: Record<string, PixelGrid[]> = {
  IDLE: [
    [
      ...Array(34).fill(E),
      "...........................SSSS...SSSS..........................", // Ear Tips
      "..........................SWWWDS.SWWWDS.........................",
      "..........................SWWPPDSWWPPD..........................",
      "..........................SWWPPDSWWPPD..........................",
      "..........................SWWPPDSWWPPD..........................",
      "..........................SWWPPDSWWPPD..........................",
      "...........................SWWDS.SWWDS..........................",
      "............................SSSS..SSSS..........................",
      "..........................SSSSSSSSSSSSSS........................", // Head Top
      ".........................SWWWWWWWWWWWWWWS.......................",
      "........................SWWWWWWWWWWWWWWWWS......................",
      "........................SWWWWWWWWWWWWWWWWS......................",
      ".......................SWWWEWWWWWWWWWWEWWWS.....................", // Eyes
      ".......................SWWWEWWWWWWWWWWEWWWS.....................",
      ".......................SWWWWWWWPPWWPPWWWWWS.....................", // Cheeks
      "........................SWWWWWWWWWWWWWWWWS......................",
      ".........................SSSSSSSSSSSSSSSS.......................",
      "........................SWWWWWWWWWWWWWWWWS......................", // Body
      ".......................SWWWWWWWWWWWWWWWWWWS.....................",
      ".......................SWWWWWWWWWWWWWWWWWWS.....................",
      ".......................SWWWWWWWWWWWWWWWWWWS.....................",
      ".......................SWSSSSSWWWWWWSSSSSWS.....................", // Arms (Soft outline)
      ".......................SWSWWWSSSSSSSSWWWSWS.....................",
      ".......................SWSWWWSSSSSSSSWWWSWS.....................",
      "........................SSSWWWWWWWWWWWWSSS......................",
      "..........................SWSSSWWWWSSSWS........................", // Feet
      "..........................SWS.SWWWWS.SWS........................",
      "...........................SS..SSSS..SS.........................",
      "................................................................",
      "................................................................",
    ],
    // Blink Frame
    [
      ...Array(34).fill(E),
      "...........................SSSS...SSSS..........................",
      "..........................SWWWDS.SWWWDS.........................",
      "..........................SWWPPDSWWPPD..........................",
      "..........................SWWPPDSWWPPD..........................",
      "..........................SWWPPDSWWPPD..........................",
      "..........................SWWPPDSWWPPD..........................",
      "...........................SWWDS.SWWDS..........................",
      "............................SSSS..SSSS..........................",
      "..........................SSSSSSSSSSSSSS........................",
      ".........................SWWWWWWWWWWWWWWS.......................",
      "........................SWWWWWWWWWWWWWWWWS......................",
      "........................SWWWWWWWWWWWWWWWWS......................",
      ".......................SWWW--WWWWWWWW--WWWS.....................", // Eyes Closed
      ".......................SWWW--WWWWWWWW--WWWS.....................",
      ".......................SWWWWWWWPPWWPPWWWWWS.....................",
      "........................SWWWWWWWWWWWWWWWWS......................",
      ".........................SSSSSSSSSSSSSSSS.......................",
      "........................SWWWWWWWWWWWWWWWWS......................",
      ".......................SWWWWWWWWWWWWWWWWWWS.....................",
      ".......................SWWWWWWWWWWWWWWWWWWS.....................",
      ".......................SWWWWWWWWWWWWWWWWWWS.....................",
      ".......................SWSSSSSWWWWWWSSSSSWS.....................",
      ".......................SWSWWWSSSSSSSSWWWSWS.....................",
      ".......................SWSWWWSSSSSSSSWWWSWS.....................",
      "........................SSSWWWWWWWWWWWWSSS......................",
      "..........................SWSSSWWWWSSSWS........................",
      "..........................SWS.SWWWWS.SWS........................",
      "...........................SS..SSSS..SS.........................",
      "................................................................",
      "................................................................",
    ]
  ],

  SLEEP: [
    [
      ...Array(40).fill(E),
      "................................................................",
      "...................................NNNN.........................", // Cap Tip
      "..................................NBBBBN........................",
      ".................................NBBBBBBN.......................",
      "................................NBBBBBBBBN......................",
      "...............................SWWWWWWWWWWS.....................",
      "..............................SWWWWWWWWWWWWS....................",
      ".............................SWWW--WWWWW--WWS...................", // Sleeping Face
      ".............................SWWWWWWWWWWWWWWS...................",
      ".............................SWWWWWPPWWWPPWWS...................",
      "............................SWWWWWWWWWWWWWWWWS..................",
      "...........................SWWWWWWWWWWWWWWWWWWS.................",
      "..........................SWWWWWWWWWWWWWWWWWWWWS................",
      "..........................SWWWWWWWWWWWWWWWWWWWWS................",
      "..........................SWWWWWWWWWWWWWWWWWWWWS................",
      "...........................SWWWWWWWWWWWWWWWWWWS.................",
      "...........................NBNWWWWWWWWWWWWWWWWS.................", // Cap Tail on back
      "...........................NBN...SSSSSSSSSSSSSS.................", // Loaf shape
      "..........................NBN...................................",
      "..........................NNN...................................",
      "................................................................",
      "................................................................",
      "................................................................",
    ]
  ],

  STORY: [
    [
      ...Array(30).fill(E),
      "...........................SSSS...SSSS..........................",
      "..........................SWWWDS.SWWWDS.........................",
      "..........................SWWPPDSWWPPD..........................",
      "..........................SWWPPNNNWWPPD.........................", // Glasses Strap
      "..........................SLLLLLLLLLLLLS........................", // Glasses Rim
      "..........................SLLLLLLLLLLLLS........................",
      "..........................SWWWWWWWWWWWWS........................",
      "..........................SSSSSSSSSSSSSS........................",
      ".........................SWWWWWWWWWWWWWWS.......................",
      "........................SWWWWWWWWWWWWWWWWS......................",
      ".......................SWWWWWWWWWWWWWWWWWWS.....................",
      ".......................SWWWLWWWWWWWWWWEWWWS.....................", // Lenses
      ".......................SWWWLWWWWWWWWWWEWWWS.....................",
      ".......................SWWWWWWWPPWWPPWWWWWS.....................",
      "........................SWWWWWWWWWWWWWWWWS......................",
      ".......................SSWWWWWWWWWWWWWWWWSS.....................",
      "......................SWSNNNNNNNNNNNNNNNNSWS....................", // Arms holding book
      "......................SWSNOOOOOOOOOOOOOONSWS....................", // Book Cover
      "......................SWSNOQQQQQQQQQQQQONSWS....................", // Pages
      "......................SWSNOQWWWWWWWWWWQONSWS....................",
      "......................SWSNOQLLLL..LLLLQONSWS....................", // Text
      "......................SWSNOQLLLL..LLLLQONSWS....................",
      ".......................SSNOQWWWWWWWWWWQONSS.....................",
      "..........................NOOOOOOOOOOOOOON......................",
      "..........................SWSSSWWWWSSSWS........................",
      "..........................SWS.SWWWWS.SWS........................",
      "...........................SS..SSSS..SS.........................",
      "................................................................",
      "................................................................",
      "................................................................",
    ]
  ],

  KITE: [
    [
      ".................................................K..............", // 0
      "................................................KRK.............", // 1
      "...............................................KRRRK............", // 2
      "..............................................KRRRRRK...........", // 3
      ".............................................KRRRRRRRK..........", // 4 - Kite
      "..............................................KRRRRRK...........", // 5
      "...............................................KRRRK............", // 6
      "................................................KRK.............", // 7
      ".................................................K..............", // 8
      "................................................T...............", // 9 - String
      "...............................................T................", // 10
      "..............................................T.................", // 11
      ".............................................T..................", // 12
      "............................................T...................", // 13
      "...........................................T....................", // 14
      "..........................................T.....................", // 15
      ".........................................T......................", // 16
      "........................................T.......................", // 17
      ".......................................T........................", // 18
      "......................................T.........................", // 19
      ".....................................T..........................", // 20
      "....................................T...........................", // 21
      "...........................SSSS....T..SSSS......................", // 22
      "..........................SWWWDS..T..SWWWDS.....................", // 23
      "..........................SWWPPDS.T.SWWPPD......................",
      "..........................SWWPPDS.T.SWWPPD......................",
      "..........................SWWPPDS.T.SWWPPD......................",
      "..........................SWWPPDS.T.SWWPPD......................",
      "...........................SWWDS..T..SWWDS......................",
      "............................SSSS..T...SSSS......................",
      "..........................SSSSSSSSTSSSSSS.......................",
      ".........................SWWWWWWWWTWWWWWS.......................",
      "........................SWWWWWWWWWTWWWWWWS......................",
      "........................SWWWWWWWWWTWWWWWWS......................",
      ".......................SWWWEWWWWWWTWWEWWWS......................",
      ".......................SWWWEWWWWWWTWWEWWWS......................",
      ".......................SWWWWWWWPPWTWPPWWWS......................",
      "........................SWWWWWWWWWTWWWWWWS......................",
      ".........................SSSSSSSSSTSSSSSS.......................",
      "........................SWWWWWWWWWTWWWWWWS......................",
      ".......................SWWWWWWWWWWTWWWWWWWS.....................",
      ".......................SWWWWWWWWWWTWWWWWWWS.....................",
      ".......................SWSSSSSWWWWTWWSSSSSWS....................",
      ".......................SWSWWWSSSSSTSSWWWSWS.....................",
      ".......................SWSWWWSSSSS TSSWWWSWS....................", // Holding String
      "........................SSSWWWWWWWWWWWWSSS......................",
      "..........................SWSSSWWWWSSSWS........................",
      "..........................SWS.SWWWWS.SWS........................",
      "...........................SS..SSSS..SS.........................",
      "................................................................",
    ]
  ],

  SNOWMAN: [
    [
      ...Array(25).fill(E),
      "...........................SSSS.................................",
      "..........................SWWWDS................................",
      "..........................SWWPPDS...........NNNN................",
      "..........................SWWPPDS..........NBBBBN...............", // Snowman Hat
      "..........................SWWPPDS.........NBBBBBBN..............",
      "..........................SWWPPDS.........NMMMMMMN..............",
      "...........................SWWDS..........NMIMMMIN..............",
      "............................SSSS..........NMMMMMMN..............",
      "..........................SSSSSSSS........NMMQMMMN..............", // Nose
      ".........................SWWWWWWWS........NMMMMMMN..............",
      "........................SWWWWWWWWWS......NMMMMMMMMN.............",
      ".......................SWWWWWWWWWWWS.....NMMMMMMMMN.............",
      ".......................SWWEWWWWEWWWS.....NMIIMMIIMN.............", // Buttons
      ".......................SWWEWWWWEWWWS.....NMMMMMMMMN.............",
      ".......................SWWWWPPWWWWWS.....NMMMMMMMMN.............",
      "........................SWWWWWWWWWS.......NNNNNNNN..............",
      ".........................SSSSSSSSS.......NMMMMMMMMN.............",
      "........................SWWWWWWWWWS......NMMMMMMMMN.............",
      ".......................SWWWWWWWWWWWS.....NMMMMMMMMN.............",
      ".......................SWWWWWWWWWWWS.....NMIIMMIIMN.............",
      ".......................SWSSSSSWSSSWS.....NMMMMMMMMN.............",
      ".......................SWSWWWSSWWSWS.....NMMMMMMMMN.............",
      ".......................SWSWWWSSWWSWS.....NMMMMMMMMN.............",
      "........................SSSWWWWWSSS.......NNNNNNNN..............",
      "..........................SWSSSWWS..............................",
      "..........................SWS.SWS...............................",
      "...........................SS..SS...............................",
      "................................................................",
    ]
  ],

  SNOW: [
    [
      ...Array(30).fill(E),
      "...........................SSSS...SSSS..........................",
      "..........................SWWWDS.SWWWDS.........................",
      "..........................SWWPPNNNWWPPD.........................",
      "..........................NBBBBBBBBBBBN.........................", // Beanie
      "..........................NBBBBBBBBBBBN.........................",
      "..........................NBNNBNNNNBNBN.........................",
      "..........................NBBBBBBBBBBBN.........................",
      "...........................SWWWWWWWWWS..........................",
      "..........................SSSSSSSSSSSS..........................",
      ".........................SWWWWWWWWWWWWS.........................",
      "........................SWWWWWWWWWWWWWWS........................",
      ".......................SWWWWWWWWWWWWWWWWS.......................",
      ".......................SWWWEWWWWWWWWWWEWS.......................",
      ".......................SWWWEWWWWWWWWWWEWS.......................",
      ".......................SWWWWWWWPPWWPPWWWS.......................",
      "........................KKKKKKKKKKKKKKKK........................", // Scarf
      "........................KRRRRRRRRRRRRRRK........................",
      ".......................SWWWWWWWWWWWWWWWWS.......................",
      ".......................SWWWWWWWWWWWWWWWWS.......................",
      ".......................SWWWWWWWWWWWWWWWWS.......................",
      ".......................SWSSSSSWWWWWWSSSSSWS.....................",
      ".......................SWSWWWSSSSSSSSWWWSWS.....................",
      ".......................SWSWWWSSSSSSSSWWWSWS.....................",
      "........................SSSWWWWWWWWWWWWSSS......................",
      "..........................SWS.KRK.S.SWS.........................", // Scarf tails
      "..........................SWS.KRK.S.SWS.........................",
      "...........................SS..K...SS...........................",
      "................................................................",
      "................................................................",
    ]
  ],

  CAR: [
    [
      ...Array(38).fill(E),
      ".............................SSSS....SSSS.......................",
      "............................SWWWDS..SWWWDS......................",
      "............................SWWPPDS.SWWPPD......................",
      "............................SWWPPDS.SWWPPD......................",
      "............................SWWWWWWWWWWWWS......................",
      "...........................SWWWWWWWWWWWWWWS.....................",
      "...........................SWWEWWWWWWWWEWWS.....................",
      "...........................SWWWWWWWWWWWWWWS.....................",
      "..........................NNNBBBBBBBBBBNNN......................", // Windshield
      ".........................NMMMMMMMMMMMMMMMMN.....................", // Glass
      "........................NBBBBBBBBBBBBBBBBBBN....................", // Car Hood
      ".......................NBBBBBBBBBBBBBBBBBBBBN...................",
      "......................NYBBBBBBBBBBBBBBBBBBBBRN..................", // Lights
      "......................NBBBBBBBBBBBBBBBBBBBBBBN..................",
      "......................NGGGNNNNNNNNNNNNNNNNGGGN..................", // Wheels
      "......................NGGG................GGGN..................",
      "................................................................",
      "................................................................",
    ]
  ],

  HOP: [
    // Frame 1
    [
      ...Array(32).fill(E),
      "...........................SSSS...SSSS..........................",
      "..........................SWWWDS.SWWWDS.........................",
      "..........................SWWPPDSWWPPD..........................",
      "..........................SWWPPDSWWPPD..........................",
      "..........................SWWPPDSWWPPD..........................",
      "..........................SWWPPDSWWPPD..........................",
      "...........................SWWDS.SWWDS..........................",
      "............................SSSS..SSSS..........................",
      "..........................SSSSSSSSSSSSSS........................",
      ".........................SWWWWWWWWWWWWWWS.......................",
      "........................SWWWWWWWWWWWWWWWWS......................",
      "........................SWWWWWWWWWWWWWWWWS......................",
      ".......................SWWWEWWWWWWWWWWEWWWS.....................",
      ".......................SWWWEWWWWWWWWWWEWWWS.....................",
      ".......................SWWWWWWWPPWWPPWWWWWS.....................",
      "........................SWWWWWWWWWWWWWWWWS......................",
      ".........................SSSSSSSSSSSSSSSS.......................",
      "........................SWWWWWWWWWWWWWWWWS......................",
      ".......................SWWWWWWWWWWWWWWWWWWS.....................",
      ".......................SWWWWWWWWWWWWWWWWWWS.....................",
      ".......................SWWWWWWWWWWWWWWWWWWS.....................",
      ".......................SWSSSSSWWWWWWSSSSSWS.....................",
      ".......................SWSWWWSSSSSSSSWWWSWS.....................",
      ".......................SWSWWWSSSSSSSSWWWSWS.....................",
      "........................SSSWWWWWWWWWWWWSSS......................",
      "..........................SWSSSWWWWSSSWS........................",
      "..........................SWS.SWWWWS.SWS........................",
      "...........................SS..SSSS..SS.........................",
      "................................................................",
    ],
    // Frame 2 (Paws Up)
    [
      ...Array(32).fill(E),
      "..........................SSSS......SSSS........................",
      ".........................SWWWDS....SWWWDS.......................",
      ".........................SWWPPDS...SWWPPD.......................",
      ".........................SWWPPDS...SWWPPD.......................",
      ".........................SWWPPDS...SWWPPD.......................",
      ".........................SWWPPDS...SWWPPD.......................",
      "..........................SWWDS.....SWWDS.......................",
      "...........................SSSS......SSSS.......................",
      "..........................SSSSSSSSSSSSSS........................",
      ".........................SWWWWWWWWWWWWWWS.......................",
      "........................SWWWWWWWWWWWWWWWWS......................",
      "........................SWWWWWWWWWWWWWWWWS......................",
      ".......................SWWWEWWWWWWWWWWEWWWS.....................",
      ".......................SWWWEWWWWWWWWWWEWWWS.....................",
      ".......................SWWWWWWWPPWWPPWWWWWS.....................",
      "........................SWWWWWWWWWWWWWWWWS......................",
      ".........................SSSSSSSSSSSSSSSS.......................",
      "........................SWWWWWWWWWWWWWWWWS......................",
      ".......................SWWWWWWWWWWWWWWWWWWS.....................",
      ".......................SWWWWWWWWWWWWWWWWWWS.....................",
      ".......................SWWWWWWWWWWWWWWWWWWS.....................",
      ".......................SWSSSSSWWWWWWSSSSSWS.....................", // Paws Up
      ".......................SWSWWWSSSSSSSSWWWSWS.....................",
      ".......................SWSWWWSSSSSSSSWWWSWS.....................",
      "........................SSSWWWWWWWWWWWWSSS......................",
      "..........................SWSSSWWWWSSSWS........................",
      "..........................SWS.SWWWWS.SWS........................",
      "...........................SS..SSSS..SS.........................",
      "................................................................",
    ]
  ],
  
  UMBRELLA: [
      [
        ...Array(20).fill(E),
        "..............................NNNN..............................",
        ".............................NBBBBN.............................",
        "............................NBBBBBBN............................",
        "...........................NBBBBBBBBN...........................",
        "..........................NBBBBBBBBBBN..........................",
        ".........................NBBBBBBBBBBBBN.........................",
        "........................NBBBBBBBBBBBBBBN........................",
        ".......................NBBBBBBBBBBBBBBBBN.......................",
        "........................NBBBBBBBBBBBBBBN........................",
        ".........................N......T.......N.......................",
        "........................NNN.....T......NNN......................",
        ".......................SWWDS....T....SWWDS......................",
        ".......................SWWDS....T....SWWDS......................",
        ".......................SWWDSNNNNTNNNNSWWDS......................",
        ".......................SWWWWWWWWWWWWWWWWS.......................",
        "......................SWWWWWWWWWWWWWWWWWWS......................",
        "......................SWWWWWWWWWWWWWWWWWWS......................",
        "......................SWWWEWWWWWWWWWWEWWWS......................",
        "......................SWWWEWWWWWWWWWWEWWWS......................",
        "......................SWWWWWWWPPWWPPWWWWWS......................",
        ".......................SWWWWWWWWWWWWWWWWS.......................",
        ".......................SWWWWWWWWWWWWWWWWS.......................",
        "......................SWWWWWWWWWWWWWWWWWWS......................",
        "......................SWSSSSSWWWWWWWWSSSSWS.....................",
        "......................SWSWWWSSSSSSSSWWWWWSWS....................",
        ".......................SSSWWWWWWWWWWWWWWSSS.....................",
        ".........................SWSSSWWWWSSSSWS........................",
        ".........................SWS.SWWWWS..SWS........................",
        "..........................SS..SSSS...SS.........................",
        "................................................................",
        "................................................................",
        "................................................................",
        "................................................................",
      ]
  ]
};

const PixelRabbit: React.FC<RabbitProps> = ({ clockState, weather }) => {
  const isRain = weather?.condition === WeatherCondition.RAIN || weather?.condition === WeatherCondition.STORM;
  const isSnow = weather?.condition === WeatherCondition.SNOW;
  const isWindy = weather?.condition === WeatherCondition.WINDY;

  const [frameIdx, setFrameIdx] = useState(0);
  const [action, setAction] = useState<'IDLE' | 'HOP' | 'SLEEP' | 'UMBRELLA' | 'CAR' | 'STORY' | 'SNOW' | 'SNOWMAN' | 'KITE'>('IDLE');
  const [posX, setPosX] = useState(50); 
  const [posY, setPosY] = useState(20); 
  const [direction, setDirection] = useState(1);
  const [isMoving, setIsMoving] = useState(false);
  
  const lastLogicTick = useRef(0);
  const animationTimer = useRef<NodeJS.Timeout | null>(null);

  const renderSprite = useCallback((grid: PixelGrid) => {
    const pixels: React.ReactNode[] = [];
    const size = 64; 
    
    if (!grid) return null;

    grid.forEach((row, y) => {
      if (!row) return;
      for (let x = 0; x < row.length; x++) {
        const char = row[x];
        if (char !== '.' && char !== ' ') {
          const color = PALETTE[char] || '#000';
          pixels.push(
            <rect 
              key={`${x}-${y}`} 
              x={x} y={y} 
              width={1.05} height={1.05} 
              fill={color} 
            />
          );
        }
      }
    });

    return (
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full shape-rendering-crispEdges">
        {pixels}
      </svg>
    );
  }, []);

  useEffect(() => {
    const tickRate = 200; 

    const tick = () => {
      const now = Date.now();
      
      // 1. DECISION LOGIC (Runs every 4.5s)
      if (now - lastLogicTick.current > 4500) {
        lastLogicTick.current = now;
        
        let nextAction: typeof action = 'IDLE';
        
        // Priority 1: State
        if (clockState === ClockState.SLEEP || clockState === ClockState.NAP) {
           nextAction = 'SLEEP';
        } 
        else if (clockState === ClockState.STORY) {
            nextAction = 'STORY';
        }
        // Priority 2: Weather
        else if (isSnow) {
            nextAction = Math.random() > 0.5 ? 'SNOWMAN' : 'SNOW';
        }
        else if (isWindy) {
            nextAction = 'KITE';
        }
        else if (isRain) {
            nextAction = 'UMBRELLA';
        }
        // Priority 3: Random Idle Fun
        else {
           const rand = Math.random();
           if (rand > 0.90) nextAction = 'CAR'; 
           else if (rand > 0.40) {
             nextAction = 'HOP'; 
             // Random Direction
             if (Math.random() > 0.5) {
                 const newDir = Math.random() > 0.5 ? 1 : -1;
                 if (posX < 10) setDirection(1);
                 else if (posX > 90) setDirection(-1);
                 else setDirection(newDir);
             }
           } else {
             nextAction = 'IDLE';
           }
        }

        setAction(nextAction);
        setIsMoving(nextAction === 'HOP' || nextAction === 'CAR');
      }

      setFrameIdx(prev => prev + 1);

      // 3. PHYSICS UPDATE
      if (isMoving) {
         if (action === 'HOP') {
             // Linear Movement
             setPosX(prev => Math.min(95, Math.max(5, prev + (direction * 0.8))));
             
             // Very subtle visual bob
             const bounce = (frameIdx % 2 === 0) ? 0 : 0.5;
             setPosY(20 + bounce);

         } else if (action === 'CAR') {
             setPosX(prev => {
                const next = prev + (direction * 1.5);
                if (next > 95) setDirection(-1);
                if (next < 5) setDirection(1);
                return next;
             });
             setPosY(20 + (frameIdx % 2 === 0 ? 0.2 : 0));
         }
      } else {
          // IDLE Reset
          setPosY(20); 
      }
    };

    animationTimer.current = setInterval(tick, tickRate);
    return () => {
      if (animationTimer.current) clearInterval(animationTimer.current);
    };
  }, [clockState, isRain, isSnow, isWindy, isMoving, direction, action, frameIdx, posX, posY]);

  const getCurrentSprite = () => {
    let spriteSet = SPRITES.IDLE;
    
    if (action === 'SLEEP') spriteSet = SPRITES.SLEEP;
    else if (action === 'HOP') spriteSet = SPRITES.HOP;
    else if (action === 'UMBRELLA') spriteSet = SPRITES.UMBRELLA;
    else if (action === 'STORY') spriteSet = SPRITES.STORY;
    else if (action === 'CAR') spriteSet = SPRITES.CAR;
    else if (action === 'SNOW') spriteSet = SPRITES.SNOW;
    else if (action === 'SNOWMAN') spriteSet = SPRITES.SNOWMAN;
    else if (action === 'KITE') spriteSet = SPRITES.KITE;

    if (action === 'IDLE' && frameIdx % 20 === 0) {
        if (SPRITES.IDLE[1]) return SPRITES.IDLE[1];
    }

    const index = frameIdx % spriteSet.length;
    return spriteSet[index];
  };

  const sprite = getCurrentSprite();

  const renderZzz = () => {
     if (action !== 'SLEEP') return null;
     const step = Math.floor(frameIdx / 4) % 3; 
     return (
       <div className="absolute top-[35%] right-[25%] pointer-events-none">
         {step >= 0 && <div className="absolute -top-1 right-0 w-1 h-1 bg-white opacity-80" />}
         {step >= 1 && <div className="absolute -top-3 right-2 w-1 h-1 bg-white opacity-60" />}
         {step >= 2 && <div className="absolute -top-5 right-4 w-2 h-2 bg-white opacity-40 text-[8px] leading-none font-pixel text-blue-200">z</div>}
       </div>
     );
  };
  
  return (
    <div 
        className="absolute z-40 transition-all duration-300 ease-linear will-change-transform"
        style={{ 
            left: `${posX}%`, 
            bottom: `${posY}%`,
            transform: `translateX(-50%)`,
            // Canvas size increased to handle the 64x64 density while keeping rabbit visible
            width: '320px', 
            height: '320px'
        }}
    >
        <div 
          className="relative w-full h-full"
          style={{ transform: `scaleX(${direction})` }}
        >
            {renderSprite(sprite)}
            {renderZzz()}
        </div>

        <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-20 h-3 bg-black/40 rounded-full blur-[4px]" />
    </div>
  );
};

export default PixelRabbit;