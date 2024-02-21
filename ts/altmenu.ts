import { ContextMenuItem } from "$types/app";
import { FileMenu } from "./altmenu/file";
import { Runtime } from "./runtime";

export const MarkDownViewerAltMenu: (runtime: Runtime) => ContextMenuItem[] = (
  runtime: Runtime
) => [FileMenu(runtime)];
