import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Rect, Path, Filter, FeGaussianBlur, FeMerge, FeMergeNode } from 'react-native-svg';

export default function AppLogo({ width = 100, height = 100 }: { width?: number | string, height?: number | string }) {
  return (
    <Svg viewBox="0 0 512 512" width={width} height={height}>
      <Defs>
        <LinearGradient id="bgDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#08140c" />
          <Stop offset="100%" stopColor="#020603" />
        </LinearGradient>

        <LinearGradient id="neonGreen" x1="0%" y1="100%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#00E676" />
          <Stop offset="50%" stopColor="#39FF14" />
          <Stop offset="100%" stopColor="#76FF03" />
        </LinearGradient>

        <Filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <FeGaussianBlur stdDeviation="8" result="blur" />
          <FeMerge>
            <FeMergeNode in="blur" />
            <FeMergeNode in="SourceGraphic" />
          </FeMerge>
        </Filter>
      </Defs>

      <Rect width="512" height="512" rx="115" fill="url(#bgDark)" />

      <Path 
        d="M 95 375 C 68 375 58 345 82 315 L 190 170 C 205 148 225 158 235 178 L 260 222 C 270 238 285 238 295 218 L 360 135 C 375 115 400 120 415 145 L 445 285 C 460 325 440 375 395 375 C 340 375 310 325 256 325 C 200 325 150 375 95 375 Z"
        fill="none" 
        stroke="url(#neonGreen)" 
        strokeWidth="44" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        filter="url(#glow)" 
      />
    </Svg>
  );
}
