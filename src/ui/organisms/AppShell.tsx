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
    <div className="min-h-screen bg-mesh-soft">
      <div className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-b-[32px] bg-white/70 shadow-ember">
          <TitleBar />
        </div>
        <div className="mt-10 grid gap-10">
          <Hero onPrimary={() => formRef.current?.scrollIntoView({ behavior: "smooth" })} />
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
