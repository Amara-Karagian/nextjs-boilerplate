"use client";
import { Chapter, VoiceAssignment, VoiceOption } from "../types";

const RATES = [0.75, 1, 1.25, 1.5, 1.75, 2];

interface Props {
  chapter: Chapter | null;
  isPlaying: boolean;
  isPaused: boolean;
  rate: number;
  voices: VoiceOption[];
  voiceAssignment: VoiceAssignment;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onPrev: () => void;
  onNext: () => void;
  onRateChange: (rate: number) => void;
}

export function PlayerBar({
  chapter,
  isPlaying,
  isPaused,
  rate,
  voices,
  voiceAssignment,
  onPlay,
  onPause,
  onResume,
  onStop,
  onPrev,
  onNext,
  onRateChange,
}: Props) {
  if (!chapter) return null;

  const voiceId = voiceAssignment[chapter.id];
  const voice = voices.find((v) => v.id === voiceId);

  const handlePlayPause = () => {
    if (isPlaying) onPause();
    else if (isPaused) onResume();
    else onPlay();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      {/* Glass blur bar */}
      <div className="bg-[#0d0d1a]/90 backdrop-blur-xl border-t border-white/10 px-4 py-3 shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          {/* Track info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{chapter.title}</p>
            <p className="text-xs text-white/40 mt-0.5 truncate">
              {voice ? `🎙 ${voice.displayName}` : "Default voice"} · {voice?.accent ?? ""}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onPrev}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors text-sm"
              title="Previous chapter"
            >
              ⏮
            </button>

            <button
              onClick={handlePlayPause}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-lg shadow-violet-500/30 active:scale-95"
            >
              {isPlaying ? "⏸" : "▶"}
            </button>

            <button
              onClick={onNext}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors text-sm"
              title="Next chapter"
            >
              ⏭
            </button>

            <button
              onClick={onStop}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors text-sm ml-1"
              title="Stop"
            >
              ⏹
            </button>
          </div>

          {/* Speed */}
          <div className="hidden sm:flex items-center gap-1 shrink-0">
            {RATES.map((r) => (
              <button
                key={r}
                onClick={() => onRateChange(r)}
                className={`text-xs px-2 py-1 rounded-lg transition-all ${
                  rate === r
                    ? "bg-violet-600/50 text-violet-200 border border-violet-500/50"
                    : "text-white/30 hover:text-white/60 hover:bg-white/8"
                }`}
              >
                {r}×
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
