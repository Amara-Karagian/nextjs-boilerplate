"use client";
import { useState, useCallback } from "react";
import { usePDF } from "./hooks/usePDF";
import { useVoices } from "./hooks/useVoices";
import { usePlayer } from "./hooks/usePlayer";
import { DropZone } from "./components/DropZone";
import { ChapterList } from "./components/ChapterList";
import { VoiceSelector } from "./components/VoiceSelector";
import { PlayerBar } from "./components/PlayerBar";
import { Chapter, VoiceAssignment } from "./types";

export default function Page() {
  const { chapters, bookTitle, loading, error, parsePDF, reset } = usePDF();
  const voices = useVoices();
  const player = usePlayer(voices);

  const [voiceAssignment, setVoiceAssignment] = useState<VoiceAssignment>({});
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [pickerChapterId, setPickerChapterId] = useState<string | null>(null);

  const currentChapter = chapters.find((c) => c.id === player.currentChapterId) ?? null;

  // Play or toggle a chapter
  const handlePlay = useCallback(
    (chapter: Chapter) => {
      if (player.currentChapterId === chapter.id) {
        if (player.isPlaying) player.pause();
        else if (player.isPaused) player.resume();
        else player.play(chapter, voiceAssignment[chapter.id] ?? null);
      } else {
        const idx = chapters.indexOf(chapter);
        player.play(chapter, voiceAssignment[chapter.id] ?? null, () => {
          // Auto-advance to next chapter
          const next = chapters[idx + 1];
          if (next) {
            player.play(next, voiceAssignment[next.id] ?? null);
            setSelectedChapter(next);
          }
        });
        setSelectedChapter(chapter);
      }
    },
    [player, chapters, voiceAssignment]
  );

  const handlePrev = useCallback(() => {
    const idx = chapters.findIndex((c) => c.id === player.currentChapterId);
    const target = chapters[idx - 1];
    if (target) {
      setSelectedChapter(target);
      player.play(target, voiceAssignment[target.id] ?? null);
    }
  }, [chapters, player, voiceAssignment]);

  const handleNext = useCallback(() => {
    const idx = chapters.findIndex((c) => c.id === player.currentChapterId);
    const target = chapters[idx + 1];
    if (target) {
      setSelectedChapter(target);
      player.play(target, voiceAssignment[target.id] ?? null);
    }
  }, [chapters, player, voiceAssignment]);

  const handleVoiceSelect = useCallback(
    (voiceId: string, applyToAll: boolean) => {
      if (!pickerChapterId) return;
      if (applyToAll) {
        const all: VoiceAssignment = {};
        chapters.forEach((c) => { all[c.id] = voiceId; });
        setVoiceAssignment(all);
      } else {
        setVoiceAssignment((prev) => ({ ...prev, [pickerChapterId]: voiceId }));
      }
      setPickerChapterId(null);
    },
    [pickerChapterId, chapters]
  );

  const handleLoadNew = useCallback(() => {
    player.stop();
    setVoiceAssignment({});
    setSelectedChapter(null);
    reset();
  }, [player, reset]);

  const pickerChapter = pickerChapterId ? chapters.find((c) => c.id === pickerChapterId) : null;

  const hasBook = chapters.length > 0;

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col">
      {/* ── Header ── */}
      <header className="shrink-0 border-b border-white/10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-rose-500 flex items-center justify-center text-lg shrink-0">
            📖
          </div>
          <div>
            <h1 className="font-bold text-base leading-none">BookVoice</h1>
            <p className="text-white/35 text-xs mt-0.5">Personal audiobook reader</p>
          </div>

          {hasBook && (
            <div className="ml-auto flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white/80 truncate max-w-[200px]">{bookTitle}</p>
                <p className="text-xs text-white/30">{chapters.length} chapters</p>
              </div>
              <button
                onClick={handleLoadNew}
                className="text-xs text-white/40 hover:text-white border border-white/10 hover:border-white/25 px-3 py-1.5 rounded-lg transition-colors"
              >
                Change book
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        {!hasBook ? (
          /* Landing / drop zone */
          <div className="flex flex-col items-center justify-center min-h-[65vh]">
            <div className="w-full max-w-lg">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-300 to-rose-300 bg-clip-text text-transparent">
                  Your book, your voices
                </h2>
                <p className="text-white/45 mt-2 text-sm leading-relaxed">
                  Drop any PDF — BookVoice auto-detects chapters and lets you assign
                  a different voice, accent, and personality to each one.
                </p>
              </div>
              <DropZone onFile={parsePDF} loading={loading} />
              {error && (
                <p className="mt-4 text-center text-rose-400 text-sm">{error}</p>
              )}
            </div>
          </div>
        ) : (
          /* Book view */
          <div className="flex gap-6 pb-28">
            {/* Chapter sidebar */}
            <aside className="w-64 shrink-0">
              <div className="sticky top-6">
                <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3 px-1">
                  Chapters
                </p>
                <ChapterList
                  chapters={chapters}
                  voices={voices}
                  voiceAssignment={voiceAssignment}
                  currentChapterId={player.currentChapterId}
                  isPlaying={player.isPlaying}
                  selectedChapterId={selectedChapter?.id ?? null}
                  onSelectChapter={setSelectedChapter}
                  onOpenVoicePicker={setPickerChapterId}
                  onPlay={handlePlay}
                />
              </div>
            </aside>

            {/* Chapter preview area */}
            <div className="flex-1 min-w-0">
              {selectedChapter ? (
                <div>
                  {/* Chapter header */}
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <h2 className="text-2xl font-bold text-white leading-tight">
                      {selectedChapter.title}
                    </h2>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setPickerChapterId(selectedChapter.id)}
                        className="flex items-center gap-2 text-sm border border-white/15 hover:border-violet-500/40 text-white/50 hover:text-violet-300 px-3 py-2 rounded-xl transition-all"
                      >
                        🎙{" "}
                        {voiceAssignment[selectedChapter.id]
                          ? voices.find((v) => v.id === voiceAssignment[selectedChapter.id])?.displayName ?? "Voice"
                          : "Choose voice"}
                      </button>
                      <button
                        onClick={() => handlePlay(selectedChapter)}
                        className="flex items-center gap-2 text-sm bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl font-medium transition-all shadow-lg shadow-violet-500/20 active:scale-95"
                      >
                        {player.isPlaying && player.currentChapterId === selectedChapter.id
                          ? "⏸ Pause"
                          : player.isPaused && player.currentChapterId === selectedChapter.id
                          ? "▶ Resume"
                          : "▶ Play"}
                      </button>
                    </div>
                  </div>

                  {/* Word count + voice badge */}
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-xs text-white/25">
                      ~{selectedChapter.wordCount.toLocaleString()} words
                    </span>
                    {voiceAssignment[selectedChapter.id] && (
                      <>
                        <span className="text-white/15">·</span>
                        <span className="text-xs text-violet-400">
                          {(() => {
                            const v = voices.find((vv) => vv.id === voiceAssignment[selectedChapter.id]);
                            return v ? `${v.displayName} · ${v.accent}` : "";
                          })()}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Text preview */}
                  <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 max-h-[420px] overflow-y-auto">
                    <p className="text-white/60 leading-relaxed text-sm whitespace-pre-wrap">
                      {selectedChapter.content.slice(0, 800)}
                      {selectedChapter.content.length > 800 && (
                        <span className="text-white/25">
                          &nbsp;…&nbsp;(
                          {(selectedChapter.wordCount - 120).toLocaleString()} more words will be read aloud)
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Tip when no voice assigned */}
                  {!voiceAssignment[selectedChapter.id] && (
                    <div className="mt-4 px-4 py-3 rounded-xl bg-violet-600/8 border border-violet-500/15 flex items-center gap-3">
                      <span className="text-violet-400 text-lg">💡</span>
                      <p className="text-xs text-violet-300/70">
                        No voice assigned — click{" "}
                        <button
                          onClick={() => setPickerChapterId(selectedChapter.id)}
                          className="underline hover:text-violet-200 transition-colors"
                        >
                          Choose voice
                        </button>{" "}
                        to pick one, or just hit Play to use your browser&apos;s default.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-white/20 gap-3">
                  <span className="text-4xl">👈</span>
                  <p className="text-sm">Select a chapter from the sidebar</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ── Voice picker modal ── */}
      {pickerChapter && (
        <VoiceSelector
          voices={voices}
          selectedVoiceId={voiceAssignment[pickerChapter.id] ?? null}
          chapterTitle={pickerChapter.title}
          onSelect={handleVoiceSelect}
          onClose={() => setPickerChapterId(null)}
        />
      )}

      {/* ── Player bar ── */}
      <PlayerBar
        chapter={currentChapter}
        isPlaying={player.isPlaying}
        isPaused={player.isPaused}
        rate={player.rate}
        voices={voices}
        voiceAssignment={voiceAssignment}
        onPlay={() => currentChapter && handlePlay(currentChapter)}
        onPause={player.pause}
        onResume={player.resume}
        onStop={player.stop}
        onPrev={handlePrev}
        onNext={handleNext}
        onRateChange={(r) =>
          player.changeRate(
            r,
            currentChapter,
            currentChapter ? (voiceAssignment[currentChapter.id] ?? null) : null
          )
        }
      />
    </div>
  );
}
