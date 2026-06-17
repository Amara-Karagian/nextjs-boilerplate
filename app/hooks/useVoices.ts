"use client";
import { useState, useEffect } from "react";
import { VoiceOption } from "../types";

const ACCENT_MAP: Record<string, string> = {
  "en-US": "American",
  "en-GB": "British",
  "en-AU": "Australian",
  "en-IN": "Indian",
  "en-IE": "Irish",
  "en-ZA": "South African",
  "en-NZ": "New Zealand",
  "en-CA": "Canadian",
  "fr-FR": "French",
  "fr-CA": "French Canadian",
  "de-DE": "German",
  "es-ES": "Spanish",
  "es-MX": "Mexican",
  "es-US": "Latin American",
  "it-IT": "Italian",
  "pt-BR": "Brazilian",
  "pt-PT": "Portuguese",
  "ja-JP": "Japanese",
  "ko-KR": "Korean",
  "zh-CN": "Mandarin",
  "zh-TW": "Taiwanese",
  "hi-IN": "Hindi",
  "ar-SA": "Arabic",
  "ru-RU": "Russian",
  "nl-NL": "Dutch",
  "sv-SE": "Swedish",
  "nb-NO": "Norwegian",
  "da-DK": "Danish",
  "fi-FI": "Finnish",
  "pl-PL": "Polish",
  "tr-TR": "Turkish",
  "he-IL": "Hebrew",
};

const FEMALE_NAMES = new Set([
  "samantha", "victoria", "karen", "moira", "fiona", "tessa", "veena",
  "kyoko", "amelie", "paulina", "sara", "anna", "alice", "alva", "elsa",
  "emma", "isabella", "joana", "zuzana", "mariska", "lekha", "ioana",
  "milena", "katja", "soledad", "monica", "yuna", "nora", "ellen", "ewa",
  "zosia", "luciana", "carmit", "damayanti", "satu", "laura", "steffi",
  "hana", "klara", "montserrat", "julia", "tunde", "ida", "sissel",
  "tingting", "sin-ji", "mei-jia", "yuna", "otoya", "marie",
]);

const MALE_NAMES = new Set([
  "alex", "daniel", "fred", "lee", "rishi", "thomas", "diego", "jorge",
  "carlos", "seamus", "luca", "giovanni", "magnus", "felix", "yannick",
  "arthur", "oliver", "james", "tom", "george", "mike", "david",
]);

function detectGender(voice: SpeechSynthesisVoice): VoiceOption["gender"] {
  const lower = voice.name.toLowerCase().replace(/\s+/g, "");
  if (lower.includes("female") || lower.includes("woman")) return "female";
  if (lower.includes("male") || lower.includes("man")) return "male";
  const firstName = lower.split(/[\s_-]/)[0];
  if (FEMALE_NAMES.has(firstName)) return "female";
  if (MALE_NAMES.has(firstName)) return "male";
  return "unknown";
}

function cleanName(raw: string): string {
  return raw
    .replace(/^Google\s+/i, "")
    .replace(/^Microsoft\s+/i, "")
    .replace(/^Apple\s+/i, "")
    .replace(/\s*\(.*?\)\s*/g, "")
    .trim();
}

export function useVoices(): VoiceOption[] {
  const [voices, setVoices] = useState<VoiceOption[]>([]);

  useEffect(() => {
    const load = () => {
      const raw = window.speechSynthesis.getVoices();
      setVoices(
        raw.map((v) => ({
          id: v.name,
          displayName: cleanName(v.name),
          lang: v.lang,
          accent: ACCENT_MAP[v.lang] ?? v.lang,
          gender: detectGender(v),
          nativeVoice: v,
        }))
      );
    };
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);

  return voices;
}
