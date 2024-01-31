import { SEP_ITEM } from "$state/Desktop/ts/store";
import { AppsIcon } from "$ts/images/general";
import { getPartialFile } from "$ts/server/fs/file";
import { OpenWith } from "$ts/server/fs/file/handler";
import { openFileWithApp } from "$ts/server/fs/open";
import { ContextMenuItem } from "$types/app";
import { Runtime } from "../runtime";

export function FileMenu(runtime: Runtime): ContextMenuItem {
  return {
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
        caption: "Open with...",
        image: AppsIcon,
        async action() {
          const path = runtime.path.get();

          if (!path) return;

          const partial = await getPartialFile(path);

          OpenWith(partial, runtime.pid, true)
        }
      },
      {
        caption: "Edit File",
        async action() {
          const path = runtime.path.get();

          if (!path) return;

          const partial = await getPartialFile(path);

          openFileWithApp("TextEditor", partial);
        }
      },
      SEP_ITEM,
      {
        caption: "Exit",
        action: () => runtime.process.handler.kill(runtime.pid, true)
      }
    ]
  }
}