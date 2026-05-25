import { useRef, useState } from "react";
import TitleBar from "./TitleBar";
import Hero from "./Hero";
import ConverterPanel from "./ConverterPanel";
import OutputPanel from "./OutputPanel";

export default function AppShell() {
  const [outputPath, setOutputPath] = useState<string | null>(null);
  const [command, setCommand] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative min-h-screen bg-[#0b0f1a] overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 animate-mesh-shift"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(14,116,144,0.2), transparent 50%), radial-gradient(circle at 80% 10%, rgba(225,29,72,0.18), transparent 50%), radial-gradient(circle at 50% 80%, rgba(34,211,238,0.15), transparent 45%), radial-gradient(circle at 10% 70%, rgba(244,63,94,0.12), transparent 40%)",
          backgroundSize: "200% 200%",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-6 pb-16">
        <div className="mt-4 rounded-3xl glass-strong shadow-card">
          <TitleBar />
        </div>
        <div className="mt-10 grid gap-10">
          <Hero
            onPrimary={() =>
              formRef.current?.scrollIntoView({ behavior: "smooth" })
            }
          />
          <div ref={formRef} className="grid gap-8">
            <ConverterPanel
              onRendered={(path, cmd) => {
                setOutputPath(path);
                setCommand(cmd);
              }}
            />
            <OutputPanel outputPath={outputPath} command={command} />
          </div>
        </div>
      </div>
    </div>
  );
}
