"use client";
import { useRef, useState } from "react";

interface Props {
  onFile: (file: File) => void;
  loading: boolean;
}

export function DropZone({ onFile, loading }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = (file: File | undefined) => {
    if (file?.type === "application/pdf") onFile(file);
  };

  return (
    <div
      onClick={() => !loading && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        accept(e.dataTransfer.files[0]);
      }}
      className={`
        relative border-2 border-dashed rounded-3xl px-8 py-20 text-center cursor-pointer
        transition-all duration-200 select-none
        ${dragging
          ? "border-violet-400 bg-violet-500/10 scale-[1.01]"
          : "border-white/15 hover:border-violet-500/50 hover:bg-violet-500/5"
        }
        ${loading ? "pointer-events-none" : ""}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={(e) => accept(e.target.files?.[0])}
      />

      {loading ? (
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-2 border-violet-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-violet-400 animate-spin" />
          </div>
          <div>
            <p className="text-white font-medium">Parsing your book…</p>
            <p className="text-white/40 text-sm mt-1">Detecting chapters</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600/20 to-rose-600/20 border border-violet-500/20 flex items-center justify-center text-4xl">
            📚
          </div>
          <div>
            <p className="text-white text-lg font-semibold">Drop your PDF here</p>
            <p className="text-white/40 text-sm mt-1">or click to browse</p>
          </div>
          <div className="flex items-center gap-6 text-xs text-white/25 mt-2">
            <span>📖 Auto-detects chapters</span>
            <span>🎙 Per-chapter voices</span>
            <span>🔊 All content read</span>
          </div>
        </div>
      )}
    </div>
  );
}
