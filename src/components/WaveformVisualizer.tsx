import React, { useEffect, useState } from 'react';

interface WaveformVisualizerProps {
  isListening: boolean;
  isSpeaking: boolean;
  barCount?: number;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  isListening,
  isSpeaking,
  barCount = 28,
}) => {
  const [heights, setHeights] = useState<number[]>(() =>
    Array.from({ length: barCount }, () => 8)
  );

  useEffect(() => {
    let animId: number;

    const updateWave = () => {
      setHeights(() =>
        Array.from({ length: barCount }, (_, i) => {
          if (isSpeaking) {
            // High dynamic speech fluctuation with center weight
            const centerDist = Math.abs(i - barCount / 2) / (barCount / 2);
            const factor = 1 - centerDist * 0.45;
            return Math.floor(Math.random() * 42 * factor) + 10;
          } else if (isListening) {
            // Microphone active rhythmic wave
            const wave = Math.sin(Date.now() / 140 + i * 0.35);
            return Math.floor(Math.abs(wave) * 36) + 8;
          } else {
            // Calm idle ambient breathing
            const wave = Math.sin(Date.now() / 600 + i * 0.2);
            return Math.floor(Math.abs(wave) * 12) + 5;
          }
        })
      );
      animId = requestAnimationFrame(updateWave);
    };

    animId = requestAnimationFrame(updateWave);
    return () => cancelAnimationFrame(animId);
  }, [isListening, isSpeaking, barCount]);

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-1.5 h-14 px-4 py-2 w-full max-w-md mx-auto">
      {heights.map((h, idx) => {
        let barColor = 'bg-cyan-500/40';
        let barGlow = '';

        if (isSpeaking) {
          barColor = 'bg-gradient-to-t from-cyan-400 via-sky-300 to-amber-300';
          barGlow = 'shadow-[0_0_8px_rgba(0,240,255,0.8)]';
        } else if (isListening) {
          barColor = 'bg-gradient-to-t from-emerald-500 via-teal-300 to-cyan-300';
          barGlow = 'shadow-[0_0_8px_rgba(16,185,129,0.8)]';
        }

        return (
          <div
            key={idx}
            style={{ height: `${h}px` }}
            className={`w-1 sm:w-1.5 rounded-full transition-all duration-75 ${barColor} ${barGlow}`}
          />
        );
      })}
    </div>
  );
};
