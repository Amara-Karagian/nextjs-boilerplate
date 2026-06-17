"use client";
import { useState, useCallback } from "react";
import { Chapter } from "../types";

// Lazy-load pdf.js so it never runs on the server
async function getPdfLib() {
  const lib = await import("pdfjs-dist");
  lib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${lib.version}/build/pdf.worker.min.mjs`;
  return lib;
}

const CHAPTER_RE =
  /^(chapter|prologue|epilogue|introduction|preface|foreword|afterword|part)\s*(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|[ivxlcdm]+)?[.:–—\s]*$/i;

function detectChapters(pageTexts: string[]): Chapter[] {
  const chapters: Chapter[] = [];
  let title = "";
  let body = "";
  let idx = 0;

  const flush = () => {
    const trimmed = body.trim();
    if (trimmed.length < 80) return; // skip near-empty sections
    const words = trimmed.split(/\s+/).length;
    chapters.push({ id: `ch-${idx++}`, title: title || "Beginning", content: trimmed, wordCount: words });
    body = "";
  };

  for (const pageText of pageTexts) {
    const lines = pageText.split(/\n/).map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (CHAPTER_RE.test(line)) {
        flush();
        title = line;
      } else {
        body += (body ? " " : "") + line;
      }
    }
  }
  flush();

  // Fallback: no chapters found → split into ~600-word sections
  if (chapters.length <= 1) {
    const allText = pageTexts.join(" ").replace(/\s+/g, " ").trim();
    const words = allText.split(" ");
    const size = 600;
    const result: Chapter[] = [];
    for (let i = 0; i < words.length; i += size) {
      const chunk = words.slice(i, i + size).join(" ");
      result.push({
        id: `ch-${result.length}`,
        title: `Section ${result.length + 1}`,
        content: chunk,
        wordCount: Math.min(size, words.length - i),
      });
    }
    return result;
  }

  return chapters;
}

export function usePDF() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [bookTitle, setBookTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsePDF = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    setChapters([]);
    try {
      const lib = await getPdfLib();
      const buf = await file.arrayBuffer();
      const pdf = await lib.getDocument({ data: buf }).promise;

      // Title from metadata or filename
      const meta = await pdf.getMetadata().catch(() => null);
      const infoTitle = (meta?.info as Record<string, string> | null)?.Title;
      setBookTitle(infoTitle || file.name.replace(/\.pdf$/i, ""));

      const pageTexts: string[] = [];
      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const content = await page.getTextContent();
        const text = content.items
          .map((item) => ("str" in item ? item.str : ""))
          .join("\n");
        pageTexts.push(text);
      }

      const detected = detectChapters(pageTexts);
      setChapters(detected);
    } catch (err) {
      console.error(err);
      setError("Couldn't parse this PDF. Try another file.");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setChapters([]);
    setBookTitle("");
    setError(null);
  }, []);

  return { chapters, bookTitle, loading, error, parsePDF, reset };
}
