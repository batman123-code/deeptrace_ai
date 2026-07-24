import { ArrowRight, PlayCircle } from "lucide-react";
import { VerificationSandbox } from "@/components/verification-sandbox";
import { FloatingPathsBackground } from "@/components/ui/floating-paths";
import { StaggerReveal, ScrollReveal } from "@/components/ui/scroll-reveal";

export function Hero() {
  return (
    <section id="top" className="relative border-b border-slate-200 bg-grid dark:border-slate-800">
      <FloatingPathsBackground position={1}>
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20 relative z-10">
          <StaggerReveal className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 font-mono text-[11px] text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              Multimodal Trust Infrastructure // Built on Gemma 4
            </span>

            <h1 className="mt-6 text-balance font-display text-4xl font-semibold leading-[1.1] tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl lg:text-6xl">
              Verify what&apos;s real, before it spreads.
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-balance text-base leading-relaxed text-slate-600 dark:text-slate-400 sm:text-lg">
              DeepTrace AI reads images, audio, video, and text the way a forensic analyst would —
              extracting claims, matching them against trusted sources, and flagging deepfakes and
              out-of-context media in seconds. Built for newsrooms, platforms, and governments who
              can&apos;t afford to be wrong.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-slate-50 transition-colors hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white hover:-translate-y-0.5 active:translate-y-0"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#sandbox"
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-slate-100 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm hover:-translate-y-0.5 active:translate-y-0"
              >
                <PlayCircle className="h-4 w-4" />
                See It Verify a Claim
              </a>
            </div>

            <p className="mt-4 font-mono text-[11px] text-slate-400 dark:text-slate-600">
              No credit card required · SOC 2 in progress · 99.95% API uptime
            </p>
          </StaggerReveal>

          <ScrollReveal delay={0.4} className="mx-auto mt-12 max-w-5xl">
            <VerificationSandbox />
          </ScrollReveal>
        </div>
      </FloatingPathsBackground>
    </section>
  );
}
