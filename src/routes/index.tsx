import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BadlandsApp } from "@/components/game/BadlandsApp";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) {
    return <div className="min-h-dvh bg-bg" aria-hidden="true" />;
  }
  return <BadlandsApp />;
}
