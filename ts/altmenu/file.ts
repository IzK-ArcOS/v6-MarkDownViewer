import { SEP_ITEM } from "$state/Desktop/ts/store";
import { TextEditorIcon } from "$ts/images/apps";
import { AppsIcon } from "$ts/images/general";
import { ShutdownIcon } from "$ts/images/power";
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
        icon: "file_open",
        action: () => runtime.openFile(),
      },
      SEP_ITEM,
      {
        caption: "Open with...",
        image: AppsIcon,
        async action() {
          const path = runtime.path.get();

          if (!path) return;

          const partial = await getPartialFile(path);

          OpenWith(partial, runtime.pid, true);
        },
        disabled: () => runtime.isClient.get()
      },
      {
        caption: "Edit File",
        image: TextEditorIcon,
        async action() {
          const path = runtime.path.get();

          if (!path) return;

          const partial = await getPartialFile(path);

          await openFileWithApp("TextEditor", partial);

          runtime.closeApp();
        },
        disabled: () => runtime.isClient.get()
      },
      SEP_ITEM,
      {
        caption: "Open file location",
        icon: "folder_open",
        action: () => {
          runtime.openFileLocation();
        },
        disabled: () => !runtime.path.get() || runtime.isClient.get()
      },
      SEP_ITEM,
      {
        caption: "Exit",
        action: () => { runtime.process.handler.kill(runtime.pid, true) },
        image: ShutdownIcon
      }
    ]
  }
}