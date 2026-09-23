import type { ReactNode } from "react";

/**
 * Ambient colour blobs sit behind the content and inside the frame, so the
 * glass bars and cards have something to refract instead of flat black.
 */
function AmbientGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="animate-glow-drift absolute -top-32 -right-24 size-[380px] rounded-full lg:size-[560px]"
        style={{ background: "radial-gradient(circle, #ff2d3c 0%, transparent 68%)", filter: "blur(70px)" }}
      />
      <div
        className="animate-glow-drift absolute top-[38%] -left-32 size-[340px] rounded-full lg:size-[520px]"
        style={{
          background: "radial-gradient(circle, #7b1fd4 0%, transparent 70%)",
          filter: "blur(80px)",
          animationDelay: "-5s",
        }}
      />
      <div
        className="animate-glow-drift absolute bottom-[6%] -right-20 size-[300px] rounded-full lg:size-[460px]"
        style={{
          background: "radial-gradient(circle, #c4121e 0%, transparent 70%)",
          filter: "blur(75px)",
          animationDelay: "-9s",
        }}
      />
    </div>
  );
}

export function SiteFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh justify-center bg-[#050506]">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(90% 50% at 50% 0%, #1c0409 0%, #050506 60%), radial-gradient(70% 40% at 50% 100%, #12061c 0%, transparent 70%)",
        }}
        aria-hidden
      />
      <div className="relative w-full max-w-[468px] bg-[#08080a] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_40px_120px_rgba(196,18,30,0.16)] lg:max-w-none lg:shadow-none">
        <AmbientGlow />
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}
