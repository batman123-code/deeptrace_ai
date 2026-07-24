"use client";

import { useState } from "react";
import { ImageIcon, AudioLines, Video, FileText } from "lucide-react";
import ImageTrail from "@/components/ui/ImageTrail";
import { ScrollReveal, StaggerReveal } from "@/components/ui/scroll-reveal";

const MEDIA = [
  {
    icon: ImageIcon,
    title: "Image",
    body: "Geolocation, EXIF timestamps, and generative-artifact fingerprinting on photos and screenshots.",
    variant: 1,
    images: [
      'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=300&h=300',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=300&h=300',
      'https://images.unsplash.com/photo-1622737133809-d95047b9e673?auto=format&fit=crop&q=80&w=300&h=300',
      'https://images.unsplash.com/photo-1581362036109-7757948f95c2?auto=format&fit=crop&q=80&w=300&h=300',
      'https://images.unsplash.com/photo-15312971216e2-5e60d0999587?auto=format&fit=crop&q=80&w=300&h=300'
    ]
  },
  {
    icon: AudioLines,
    title: "Audio",
    body: "Waveform splice detection and dialect-aware transcription for voice notes and broadcast clips.",
    variant: 2,
    images: [
      'https://images.unsplash.com/photo-1516280440502-0c9f132e4d9c?auto=format&fit=crop&q=80&w=300&h=300',
      'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=300&h=300',
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=300&h=300',
      'https://images.unsplash.com/photo-1580130544903-883a9d9e68b3?auto=format&fit=crop&q=80&w=300&h=300',
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=300&h=300'
    ]
  },
  {
    icon: Video,
    title: "Video",
    body: "Frame-level deepfake detection, lip-sync consistency, and scene-recycling checks.",
    variant: 1,
    images: [
      'https://images.unsplash.com/photo-1578022761797-b8636ac1773c?auto=format&fit=crop&q=80&w=300&h=300',
      'https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?auto=format&fit=crop&q=80&w=300&h=300',
      'https://images.unsplash.com/photo-1535016120720-40c746a65942?auto=format&fit=crop&q=80&w=300&h=300',
      'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=300&h=300',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=300&h=300'
    ]
  },
  {
    icon: FileText,
    title: "Text",
    body: "Claim extraction and source cross-referencing for articles, captions, and social posts.",
    variant: 2,
    images: [
      'https://images.unsplash.com/photo-1455390582262-044cdead27d8?auto=format&fit=crop&q=80&w=300&h=300',
      'https://images.unsplash.com/photo-1505664115174-8b6a382101e4?auto=format&fit=crop&q=80&w=300&h=300',
      'https://images.unsplash.com/photo-1472289065668-ce650ac443d2?auto=format&fit=crop&q=80&w=300&h=300',
      'https://images.unsplash.com/photo-1503694978374-8a2fa686963a?auto=format&fit=crop&q=80&w=300&h=300',
      'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=300&h=300'
    ]
  },
];

export function SupportedMedia() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeMedia = MEDIA[activeIndex];

  return (
    <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden relative">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20 relative z-10">
        <ScrollReveal variant="fade-up" className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-wide text-slate-500 dark:text-slate-500">
            Supported media
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            One engine, every format your team receives
          </h2>
        </ScrollReveal>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <StaggerReveal staggerDelay={0.15} className="grid grid-cols-2 gap-4 h-fit">
            {MEDIA.map((item, idx) => {
              const Icon = item.icon;
              const isActive = idx === activeIndex;
              return (
                <div
                  key={item.title}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`cursor-pointer transition-all duration-300 rounded-lg border p-5 ${
                    isActive 
                      ? "border-indigo-500 bg-indigo-50/50 dark:border-indigo-500/50 dark:bg-indigo-900/20 shadow-md transform scale-[1.02]" 
                      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
                    isActive ? "bg-indigo-600 dark:bg-indigo-500" : "bg-indigo-600/10 dark:bg-indigo-400/10"
                  }`}>
                    <Icon className={`h-4.5 w-4.5 transition-colors ${isActive ? "text-white" : "text-indigo-600 dark:text-indigo-400"}`} strokeWidth={1.75} />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {item.body}
                  </p>
                </div>
              );
            })}
          </StaggerReveal>

          <ScrollReveal variant="fade-left" delay={0.3} className="hidden lg:block relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 overflow-hidden shadow-inner h-[500px]">
            <div className="absolute top-4 left-4 z-[110]">
              <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-900/80 px-2 py-1 rounded backdrop-blur-sm shadow-sm transition-all hover:bg-white dark:hover:bg-slate-800">
                Interactive: Move your mouse
              </span>
            </div>
            {/* The ImageTrail updates when activeIndex changes because of key={activeIndex} */}
            <ImageTrail
              key={`trail-${activeIndex}`}
              items={activeMedia.images}
              variant={activeMedia.variant}
            />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
