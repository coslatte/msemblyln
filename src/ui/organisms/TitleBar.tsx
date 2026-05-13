import IconButton from "../atoms/IconButton";
import { appWindow } from "@tauri-apps/api/window";

export default function TitleBar() {
  return (
    <div className="flex items-center justify-between px-6 py-4" data-tauri-drag-region>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-ember-500/10 text-ember-600 flex items-center justify-center font-display font-bold">
          M
        </div>
        <div>
          <p className="font-display text-base font-semibold text-slate-800">msemblyln</p>
          <p className="text-xs text-slate-500">audio + image to video</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <IconButton tone="slate" onClick={() => appWindow.minimize()} aria-label="Minimize" />
        <IconButton tone="tide" onClick={() => appWindow.toggleMaximize()} aria-label="Maximize" />
        <IconButton tone="ember" onClick={() => appWindow.close()} aria-label="Close" />
      </div>
    </div>
  );
}
