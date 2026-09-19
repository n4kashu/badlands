import { useEffect, useState } from "react";
import { useGame } from "@/game/store";
import { hasSave } from "@/game/save";
import { unlockAudio } from "@/game/audio";

export function TitleScreen() {
  const enter = useGame((s) => s.enterField);
  const resume = useGame((s) => s.resume);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    setSaved(hasSave());
  }, []);

  const start = () => {
    unlockAudio();
    enter();
  };
  const load = () => {
    unlockAudio();
    resume();
  };

  return (
    <div className="relative flex min-h-dvh flex-col justify-end overflow-hidden bg-bg px-6 py-10 sm:px-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 20% 80%, color-mix(in oklab, var(--color-primary) 18%, transparent), transparent 50%), radial-gradient(ellipse at 80% 20%, color-mix(in oklab, var(--color-accent) 10%, transparent), transparent 42%)",
        }}
      />
      <p className="relative font-mono text-xs tracking-[0.28em] text-primary">ODDLOT LAB · FIELD LICENSE</p>
      <h1 className="relative mt-3 max-w-xl font-sans text-5xl font-semibold tracking-tight text-fg sm:text-7xl">
        BADLANDS
      </h1>
      <p className="relative mt-4 max-w-lg text-base leading-relaxed text-muted">
        One Wake. A map of crates, mines and camps. Heroes III math against the troops that stand on them. Every fee
        hits a live pool — whoever is still walking gets paid.
      </p>

      <dl className="relative mt-8 grid max-w-3xl gap-4 sm:grid-cols-3">
        <Beat n="01" t="Walk" d="Leave the Hold. Amber crates, green veins, red camps. Ghost frames share the drip." />
        <Beat n="02" t="Fight" d="Speed order. One Wake stack. Attack, defend, wait, flee. Retaliation once per round." />
        <Beat n="03" t="Pay the Field" d="Burn a +1 token and 10,000 $BOUND into the pool. Weight decides your share." />
      </dl>

      <div className="relative mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={start} className="min-h-12 bg-primary px-6 font-mono text-sm text-primary-ink">
          Print a Wake
        </button>
        {saved ? (
          <button type="button" onClick={load} className="min-h-12 border border-line px-6 font-mono text-sm text-fg">
            Resume
          </button>
        ) : null}
      </div>
      <p className="relative mt-8 font-mono text-[11px] text-faint">WASD walk · E work a node · F forge · V2 is castles</p>
    </div>
  );
}

function Beat({ n, t, d }: { n: string; t: string; d: string }) {
  return (
    <div className="border border-line bg-surface/80 p-4">
      <p className="font-mono text-[10px] tracking-[0.2em] text-faint">{n}</p>
      <p className="mt-1 text-sm font-semibold text-fg">{t}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted">{d}</p>
    </div>
  );
}
