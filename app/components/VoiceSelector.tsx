"use client";
import { useMemo, useState } from "react";
import { VoiceOption } from "../types";

type GenderFilter = "all" | "female" | "male";

interface Props {
  voices: VoiceOption[];
  selectedVoiceId: string | null;
  chapterTitle: string;
  onSelect: (voiceId: string, applyToAll: boolean) => void;
  onClose: () => void;
}

const GENDER_EMOJI: Record<VoiceOption["gender"], string> = {
  female: "👩",
  male: "👨",
  unknown: "🎙️",
};

export function VoiceSelector({ voices, selectedVoiceId, chapterTitle, onSelect, onClose }: Props) {
  const [gender, setGender] = useState<GenderFilter>("all");
  const [search, setSearch] = useState("");
  const [previewing, setPreviewing] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return voices.filter((v) => {
      if (gender !== "all" && v.gender !== gender) return false;
      const q = search.toLowerCase();
      return (
        !q ||
        v.displayName.toLowerCase().includes(q) ||
        v.accent.toLowerCase().includes(q) ||
        v.lang.toLowerCase().includes(q)
      );
    });
  }, [voices, gender, search]);

  // Group by accent
  const grouped = useMemo(() => {
    const map = new Map<string, VoiceOption[]>();
    for (const v of filtered) {
      const key = v.accent;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(v);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const preview = (voice: VoiceOption) => {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(
      "Hey there! I'm your audiobook narrator. How do I sound?"
    );
    utt.voice = voice.nativeVoice;
    utt.onend = () => setPreviewing(null);
    utt.onerror = () => setPreviewing(null);
    setPreviewing(voice.id);
    window.speechSynthesis.speak(utt);
  };

  const stopPreview = () => {
    window.speechSynthesis.cancel();
    setPreviewing(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => { stopPreview(); onClose(); }}
      />

      {/* Panel */}
      <div className="relative bg-[#13132b] border border-white/10 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg flex flex-col max-h-[85vh] shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-white/10 shrink-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-lg">Pick a voice</h3>
              <p className="text-white/40 text-sm mt-0.5 truncate max-w-xs">{chapterTitle}</p>
            </div>
            <button
              onClick={() => { stopPreview(); onClose(); }}
              className="text-white/40 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-lg transition-colors"
            >
              ×
            </button>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search by name or accent…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-violet-500/60 mb-3 transition-colors"
          />

          {/* Gender filter */}
          <div className="flex gap-2">
            {(["all", "female", "male"] as GenderFilter[]).map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`flex-1 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  gender === g
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                    : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                }`}
              >
                {g === "all" ? "✨ All" : g === "female" ? "♀ Female" : "♂ Male"}
              </button>
            ))}
          </div>
        </div>

        {/* Voice list */}
        <div className="overflow-y-auto flex-1 p-3">
          {voices.length === 0 && (
            <div className="text-center py-10 text-white/30">
              <p className="text-2xl mb-2">🎙️</p>
              <p className="text-sm">Loading voices from your browser…</p>
              <p className="text-xs mt-1 text-white/20">Voices depend on your OS and browser</p>
            </div>
          )}
          {voices.length > 0 && filtered.length === 0 && (
            <p className="text-center py-10 text-white/30 text-sm">No voices match</p>
          )}

          {grouped.map(([accent, group]) => (
            <div key={accent} className="mb-4">
              <p className="text-xs font-semibold text-white/30 uppercase tracking-wider px-2 mb-2">
                {accent}
              </p>
              <div className="space-y-1">
                {group.map((voice) => {
                  const isSelected = selectedVoiceId === voice.id;
                  const isPreviewing = previewing === voice.id;
                  return (
                    <div
                      key={voice.id}
                      onClick={() => onSelect(voice.id, false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? "bg-violet-600/20 border border-violet-500/40"
                          : "hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <span className="text-xl shrink-0">{GENDER_EMOJI[voice.gender]}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isSelected ? "text-violet-300" : "text-white/85"}`}>
                          {voice.displayName}
                        </p>
                        <p className="text-xs text-white/30">{voice.lang}</p>
                      </div>
                      {isSelected && (
                        <span className="text-violet-400 text-xs font-medium">✓</span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          isPreviewing ? stopPreview() : preview(voice);
                        }}
                        className={`text-xs px-2.5 py-1 rounded-lg transition-colors shrink-0 ${
                          isPreviewing
                            ? "bg-violet-500/30 text-violet-300 border border-violet-500/40"
                            : "bg-white/5 text-white/40 hover:bg-violet-500/20 hover:text-violet-300 border border-white/10"
                        }`}
                      >
                        {isPreviewing ? "■ Stop" : "▶ Try"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Apply to all footer */}
        {selectedVoiceId && (
          <div className="p-4 border-t border-white/10 shrink-0">
            <button
              onClick={() => {
                stopPreview();
                onSelect(selectedVoiceId, true);
              }}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-violet-600/20 text-white/60 hover:text-violet-300 text-sm border border-white/10 hover:border-violet-500/40 transition-all"
            >
              Apply this voice to all chapters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
