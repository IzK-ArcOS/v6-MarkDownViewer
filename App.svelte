<script lang="ts">
  import MarkdownRenderer from "$lib/Components/MarkdownRenderer.svelte";
  import "./css/main.css";
  import { Runtime } from "./ts/runtime";

  export let runtime: Runtime;

  const { buffer } = runtime;
</script>

<MarkdownRenderer content={$buffer} />
