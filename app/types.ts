export interface Chapter {
  id: string;
  title: string;
  content: string;
  wordCount: number;
}

export interface VoiceOption {
  id: string;
  displayName: string;
  lang: string;
  accent: string;
  gender: "male" | "female" | "unknown";
  nativeVoice: SpeechSynthesisVoice;
}

export type VoiceAssignment = Record<string, string>; // chapterId → voice id (voice.name)
