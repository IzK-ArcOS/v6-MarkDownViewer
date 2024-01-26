import { getAppById, spawnApp, spawnOverlay } from "$ts/apps";
import { AppRuntime } from "$ts/apps/runtime";
import { MarkdownMimeIcon } from "$ts/images/mime";
import { Process } from "$ts/process";
import { getParentDirectory } from "$ts/server/fs/dir";
import { readFile } from "$ts/server/fs/file";
import { FileProgress } from "$ts/server/fs/progress";
import { pathToFriendlyPath } from "$ts/server/fs/util";
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

      await this.readFile(v);
    })

    if (process.args.length && typeof process.args[0] === "string") {
      this.handleOpenFile(process.args[0])
    } else {
      this.openFile();
    }

    this.loadAltMenu(...MarkDownViewerAltMenu(this));
    this.process.accelerator.store.push(...MarkDownViewerAccelerators(this))
  }

  async readFile(v: string) {
    this.path.set(v);

    const { setDone, setErrors } = await this.LoadProgress(v);

    const file = await readFile(v);

    if (!file) {
      setErrors(1);
      setDone(1);
      return
    }

    this.buffer.set(await file.data.text())
    this.File.set(file);
    this.setWindowTitle(file.name, true)

    setDone(1);
  }

  public openFile() {
    spawnOverlay(getAppById("LoadSaveDialog"), this.pid, [
      {
        title: "Select Markdown file to open",
        icon: MarkdownMimeIcon,
        extensions: [".md"],
        startDir: getParentDirectory(this.path.get() || "./")
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

  public async LoadProgress(v: string = this.path.get()) {
    return await FileProgress({
      caption: "Reading Document",
      subtitle: pathToFriendlyPath(v),
      icon: MarkdownMimeIcon,
      max: 1,
      done: 0,
      type: "quantity",
      waiting: false,
      working: true,
      errors: 0
    }, this.pid)
  }
}