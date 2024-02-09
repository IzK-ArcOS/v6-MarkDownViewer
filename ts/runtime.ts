import { getAppById, spawnApp, spawnOverlay } from "$ts/apps";
import { AppRuntime } from "$ts/apps/runtime";
import { getAllImages } from "$ts/images";
import { MarkdownMimeIcon } from "$ts/images/mime";
import { Process } from "$ts/process";
import { getParentDirectory } from "$ts/server/fs/dir";
import { readFile } from "$ts/server/fs/file";
import { getMimeIcon } from "$ts/server/fs/mime";
import { FileProgress } from "$ts/server/fs/progress";
import { pathToFriendlyPath } from "$ts/server/fs/util";
import { sleep } from "$ts/util";
import { Store } from "$ts/writable";
import type { App, AppMutator } from "$types/app";
import { ArcFile } from "$types/fs";
import { MarkDownViewerAccelerators } from "./accelerators";
import { MarkDownViewerAltMenu } from "./altmenu";

export class Runtime extends AppRuntime {
  public File = Store<ArcFile>();
  public buffer = Store<string>();
  public path = Store<string>();
  public wrapper = Store<HTMLDivElement>();
  public isClient = Store<boolean>(false);

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
    this.buffer.set("");
    this.isClient.set(false);

    if (v.startsWith("@client/")) return await this.readFileQuiet(v);

    const { setDone, setErrors } = await this.LoadProgress(v);
    const file = await readFile(v);

    if (!file) {
      setErrors(1);
      setDone(1);
      return
    }

    const content = await file.data.text();

    this.buffer.set("");
    await sleep(10);
    this.buffer.set(content);

    this.File.set(file);

    this.setWindowTitle(file.name)
    this.setWindowTitle(`Viewing ${file.name}`);
    setTimeout(() => {
      this.setAnchorRedirects();
      this.replaceIconSources();
    }, 10);

    setDone(1);
  }

  async readFileQuiet(v: string) {
    this.isClient.set(true);

    const file = await readFile(v);

    if (!file) return

    this.buffer.set(await file.data.text())
    this.File.set(file);
    this.setWindowTitle(`Viewing ${file.name}` + (this.isClient.get() ? " (Client file)" : ""));
    this.setWindowIcon(getMimeIcon(file.name));
    setTimeout(() => {
      this.setAnchorRedirects();
      this.replaceIconSources();
    }, 100);
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

    if (!path || this.isClient.get()) return

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
    }, this.pid, false)
  }

  public setAnchorRedirects() {
    const path = this.path.get();
    const wrapper = this.wrapper.get();

    if (!path || !wrapper) {
      return false;
    }

    const anchors = wrapper.querySelectorAll("a");

    for (const anchor of anchors) {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();

        const href = anchor.getAttribute("href");

        if (!href.startsWith("@client")) return;

        this.handleOpenFile(href);
      });
    }
  }

  public replaceIconSources() {
    const path = this.path.get();
    const wrapper = this.wrapper.get();

    if (!path || !wrapper) {
      return false;
    }

    const images = wrapper.querySelectorAll("img");
    const icons = getAllImages();

    for (const image of images) {
      for (const id in icons) {
        const src = image.getAttribute("src");

        if (src == `#${id}`) image.setAttribute("src", icons[id]);
      }
    }
  }
}