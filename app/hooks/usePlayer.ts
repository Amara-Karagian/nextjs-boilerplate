"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { Chapter, VoiceOption } from "../types";

export function usePlayer(voices: VoiceOption[]) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState<string | null>(null);
  const [rate, setRate] = useState(1);
  const rateRef = useRef(rate);
  const onEndRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentChapterId(null);
    onEndRef.current = undefined;
  }, []);

  const play = useCallback(
    (chapter: Chapter, voiceId: string | null, onEnd?: () => void) => {
      window.speechSynthesis.cancel();

      const utt = new SpeechSynthesisUtterance(chapter.content);
      utt.rate = rateRef.current;

      if (voiceId) {
        const match = voices.find((v) => v.id === voiceId);
        if (match) utt.voice = match.nativeVoice;
      }

      onEndRef.current = onEnd;

      utt.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentChapterId(null);
        onEndRef.current?.();
        onEndRef.current = undefined;
      };

      utt.onerror = (e) => {
        if (e.error !== "interrupted" && e.error !== "canceled") {
          setIsPlaying(false);
          setIsPaused(false);
        }
      };

      setCurrentChapterId(chapter.id);
      setIsPlaying(true);
      setIsPaused(false);
      window.speechSynthesis.speak(utt);
    },
    [voices]
  );

  const pause = useCallback(() => {
    window.speechSynthesis.pause();
    setIsPlaying(false);
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    window.speechSynthesis.resume();
    setIsPlaying(true);
    setIsPaused(false);
  }, []);

  const changeRate = useCallback(
    (newRate: number, chapter: Chapter | null, voiceId: string | null) => {
      rateRef.current = newRate;
      setRate(newRate);
      if (chapter && (isPlaying || isPaused)) {
        // Restart at new rate (Web Speech API doesn't support mid-speech rate change)
        play(chapter, voiceId, onEndRef.current);
      }
    },
    [isPlaying, isPaused, play]
  );

  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  return {
    isPlaying,
    isPaused,
    currentChapterId,
    rate,
    play,
    pause,
    resume,
    stop,
    changeRate,
  };
}
