import { SEP_ITEM } from "$state/Desktop/ts/store";
import { spawnApp } from "$ts/apps";
import { ContextMenuItem } from "$types/app";
import { Runtime } from "./runtime";

export const MarkDownViewerAltMenu: (runtime: Runtime) => ContextMenuItem[] = (runtime: Runtime) => [
  {
    caption: "File",
    subItems: [
      {
        caption: "Open...",
        action: () => runtime.openFile(),
      },
      {
        caption: "Open file location",
        action: () => {
          runtime.openFileLocation();
        },
        disabled: () => !runtime.path.get()
      },
      SEP_ITEM,
      {
        caption: "Exit",
        action: () => runtime.process.handler.kill(runtime.pid, true)
      }
    ]
  },
]