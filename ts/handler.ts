import { MarkdownMimeIcon } from "$ts/images/mime";
import { openFileWithApp } from "$ts/server/fs/open";
import { FileHandler } from "$types/fs";

export const MarkDownViewerHandler: FileHandler = {
  extensions: [".md"],
  name: "View Markdown",
  image: MarkdownMimeIcon,
  description: "Open this file in Markdown Viewer",
  handler(file) {
    openFileWithApp("MarkDownViewer", file);
  }
};