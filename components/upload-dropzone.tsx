"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { UploadCloud, X, FileWarning, ImageIcon, Video, AudioLines } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCEPTED_TYPES, formatBytes, isVideo, isAudio, validateMediaFile } from "@/lib/media";

export type SelectedMedia = {
  file: File;
  previewUrl: string;
};

export function UploadDropzone({
  selected,
  onSelect,
  onClear,
  disabled,
}: {
  selected: SelectedMedia | null;
  onSelect: (media: SelectedMedia) => void;
  onClear: () => void;
  disabled?: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const url = selected?.previewUrl;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [selected?.previewUrl]);

  const accept = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      const problem = validateMediaFile(file);
      if (problem) {
        setError(problem);
        return;
      }
      setError(null);
      onSelect({ file, previewUrl: URL.createObjectURL(file) });
    },
    [onSelect]
  );

  if (selected) {
    const video = isVideo(selected.file.type);
    const audio = isAudio(selected.file.type, selected.file.name);

    return (
      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
        <div className="relative overflow-hidden rounded border border-slate-200 bg-slate-900 dark:border-slate-800 p-2 min-h-[160px] flex items-center justify-center">
          {video ? (
            <video src={selected.previewUrl} controls className="aspect-square w-full object-contain max-h-[220px]" />
          ) : audio ? (
            <div className="w-full flex flex-col items-center justify-center p-4 space-y-3">
              <AudioLines className="h-10 w-10 text-blue-400 animate-pulse" />
              <audio src={selected.previewUrl} controls className="w-full max-w-xs" />
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={selected.previewUrl}
              alt="Selected media preview"
              className="aspect-square w-full object-contain max-h-[220px]"
            />
          )}
          <button
            type="button"
            onClick={onClear}
            disabled={disabled}
            aria-label="Remove selected file"
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-slate-900/80 text-slate-100 backdrop-blur transition-colors hover:bg-slate-900 disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-3 flex items-start gap-2">
          {video ? (
            <Video className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-600" />
          ) : audio ? (
            <AudioLines className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-600" />
          ) : (
            <ImageIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-600" />
          )}
          <div className="min-w-0">
            <p className="truncate font-mono text-xs text-slate-700 dark:text-slate-300">
              {selected.file.name}
            </p>
            <p className="mt-0.5 font-mono text-[10px] text-slate-400 dark:text-slate-600">
              {formatBytes(selected.file.size)} · {selected.file.type || "audio/media"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled) accept(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-md border border-dashed p-4 text-center transition-colors",
          dragging
            ? "border-indigo-600 bg-indigo-600/5 dark:border-indigo-400 dark:bg-indigo-400/5"
            : "border-slate-300 bg-slate-50 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-slate-600",
          disabled && "cursor-not-allowed opacity-60"
        )}
      >
        <UploadCloud className="h-8 w-8 text-slate-400 dark:text-slate-600" strokeWidth={1.5} />
        <div>
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Drop a file here
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-500">or click to browse</p>
        </div>
        <p className="font-mono text-[10px] text-slate-400 dark:text-slate-600">
          Photo · Video · Audio (MP3, WAV, M4A, OGG) — up to 15 MB
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="sr-only"
        onChange={(e) => {
          accept(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {error && (
        <p className="mt-2 flex items-start gap-1.5 text-[11px] text-rose-600 dark:text-rose-500">
          <FileWarning className="mt-0.5 h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

