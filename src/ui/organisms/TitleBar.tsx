import IconButton from "../atoms/IconButton";
import { getCurrentWindow } from "@tauri-apps/api/window";

export default function TitleBar() {
  return (
    <div
      className="flex items-center justify-between px-6 py-4"
      data-tauri-drag-region
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ember-tide font-display font-bold text-white">
          M
        </div>
        <div>
          <p className="font-display text-base font-semibold text-slate-100">
            msemblyln
          </p>
          <p className="text-xs text-slate-500">audio + image to video</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <IconButton
          tone="slate"
          onClick={() => getCurrentWindow().minimize()}
          aria-label="Minimize"
        />
        <IconButton
          tone="tide"
          onClick={() => getCurrentWindow().toggleMaximize()}
          aria-label="Maximize"
        />
        <IconButton
          tone="ember"
          onClick={() => getCurrentWindow().close()}
          aria-label="Close"
        />
      </div>
    </div>
  );
}
