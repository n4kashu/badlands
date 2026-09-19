import { useEffect } from "react";
import { useGame } from "@/game/store";
import { TitleScreen } from "./TitleScreen";
import { FieldCanvas } from "./FieldCanvas";
import { Hud } from "./Hud";
import { CombatOverlay } from "./CombatOverlay";
import { ForgePanel } from "./ForgePanel";
import { Codex } from "./Codex";
import { saveGame, serializeWorld } from "@/game/save";
import { unlockAudio } from "@/game/audio";

export function BadlandsApp() {
  const screen = useGame((s) => s.screen);
  const tickPool = useGame((s) => s.tickPool);

  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    const onVis = () => {
      if (!document.hidden) unlockAudio();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  useEffect(() => {
    if (screen === "title") return;
    const id = window.setInterval(() => tickPool(), 2000);
    return () => window.clearInterval(id);
  }, [screen, tickPool]);

  useEffect(() => {
    const persistNow = () => {
      const { hero, world, screen: sc, combat } = useGame.getState();
      if (!hero || !world) return;
      saveGame({
        version: 2,
        hero,
        world: serializeWorld(world),
        screen: sc === "title" ? "field" : sc,
        combat,
        lastPoolTs: Date.now(),
      });
    };
    const onHide = () => {
      if (document.hidden) persistNow();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", persistNow);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", persistNow);
    };
  }, []);

  if (screen === "title") return <TitleScreen />;

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-bg">
      <FieldCanvas />
      <Hud />
      {screen === "combat" ? <CombatOverlay /> : null}
      {screen === "forge" ? <ForgePanel /> : null}
      {screen === "codex" ? <Codex /> : null}
    </div>
  );
}
