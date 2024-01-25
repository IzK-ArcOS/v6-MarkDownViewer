import { getAppById, spawnApp, spawnOverlay } from "$ts/apps";
import { AppRuntime } from "$ts/apps/runtime";
import { MarkdownMimeIcon } from "$ts/images/mime";
import { Process } from "$ts/process";
import { readFile } from "$ts/server/fs/file";
import { Store } from "$ts/writable";
import type { App, AppMutator } from "$types/app";
import { ArcFile } from "$types/fs";
import { MarkDownViewerAccelerators } from "./accelerators";
import { MarkDownViewerAltMenu } from "./altmenu";

export class Runtime extends AppRuntime {
  public File = Store<ArcFile>();
  public buffer = Store<string>();
  public path = Store<string>();

  constructor(app: App, mutator: AppMutator, process: Process) {
    super(app, mutator, process);

    this.openedFile.subscribe(async (v) => {
      if (!v) return;

      this.path.set(v);

      const file = await readFile(v);

      if (!file) return;

      this.buffer.set(await file.data.text())

      this.File.set(file);

      this.setWindowTitle(file.name, true)
    })

    if (process.args.length && typeof process.args[0] === "string") {
      this.handleOpenFile(process.args[0])
    }

    this.loadAltMenu(...MarkDownViewerAltMenu(this));
    this.process.accelerator.store.push(...MarkDownViewerAccelerators(this))
  }

  public openFile() {
    spawnOverlay(getAppById("LoadSaveDialog"), this.pid, [
      {
        title: "Select Markdown file to open",
        icon: MarkdownMimeIcon,
      },
    ]);
  }

  public openFileLocation() {
    const path = this.path.get();

    if (!path) return

    const split = path.split("/");
    const filename = split[split.length - 1];

    spawnApp("FileManager", 0, [path.replace(`/${filename}`, ""), path])
  }
}