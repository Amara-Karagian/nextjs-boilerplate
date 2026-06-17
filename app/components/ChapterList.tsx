"use client";
import { Chapter, VoiceAssignment, VoiceOption } from "../types";

interface Props {
  chapters: Chapter[];
  voices: VoiceOption[];
  voiceAssignment: VoiceAssignment;
  currentChapterId: string | null;
  isPlaying: boolean;
  selectedChapterId: string | null;
  onSelectChapter: (chapter: Chapter) => void;
  onOpenVoicePicker: (chapterId: string) => void;
  onPlay: (chapter: Chapter) => void;
}

export function ChapterList({
  chapters,
  voices,
  voiceAssignment,
  currentChapterId,
  isPlaying,
  selectedChapterId,
  onSelectChapter,
  onOpenVoicePicker,
  onPlay,
}: Props) {
  const getVoice = (chapterId: string) => {
    const id = voiceAssignment[chapterId];
    return id ? voices.find((v) => v.id === id) : undefined;
  };

  return (
    <div className="space-y-0.5">
      {chapters.map((chapter, idx) => {
        const isActive = chapter.id === currentChapterId;
        const isSelected = chapter.id === selectedChapterId;
        const voice = getVoice(chapter.id);

        return (
          <div
            key={chapter.id}
            onClick={() => onSelectChapter(chapter)}
            className={`group rounded-xl px-3 py-2.5 cursor-pointer transition-all ${
              isActive
                ? "bg-violet-600/15 border border-violet-500/30"
                : isSelected
                ? "bg-white/8 border border-white/10"
                : "border border-transparent hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {/* Index / playing indicator */}
              <div className="w-5 shrink-0 flex items-center justify-center">
                {isActive && isPlaying ? (
                  <div className="flex items-end gap-[2px] h-4">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-[3px] bg-violet-400 rounded-full sound-bar"
                        style={{
                          height: `${10 + i * 3}px`,
                          animationDelay: `${i * 0.15}s`,
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-white/25">{idx + 1}</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium truncate ${
                    isActive ? "text-violet-300" : "text-white/80"
                  }`}
                >
                  {chapter.title}
                </p>
                <p className="text-xs text-white/25 mt-0.5">
                  ~{chapter.wordCount.toLocaleString()} words
                </p>
              </div>
            </div>

            {/* Controls row */}
            <div className="flex items-center gap-2 mt-2 pl-7">
              <button
                onClick={(e) => { e.stopPropagation(); onOpenVoicePicker(chapter.id); }}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all ${
                  voice
                    ? "bg-violet-600/15 border-violet-500/30 text-violet-300 hover:bg-violet-600/25"
                    : "bg-white/5 border-white/10 text-white/35 hover:border-violet-500/30 hover:text-white/60"
                }`}
              >
                <span>{voice ? "🎙" : "+"}</span>
                <span className="truncate max-w-[90px]">
                  {voice ? voice.displayName : "Add voice"}
                </span>
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); onPlay(chapter); }}
                className={`ml-auto text-xs px-2.5 py-1 rounded-lg border transition-all ${
                  isActive
                    ? "bg-violet-600/20 border-violet-500/30 text-violet-300"
                    : "bg-white/5 border-white/10 text-white/35 hover:bg-violet-600/15 hover:text-violet-300 hover:border-violet-500/30"
                }`}
              >
                {isActive && isPlaying ? "⏸" : "▶"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
