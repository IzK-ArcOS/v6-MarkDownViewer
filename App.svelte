<script lang="ts">
  import MarkdownRenderer from "$lib/Components/MarkdownRenderer.svelte";
  import { onMount } from "svelte";
  import "./css/main.css";
  import { Runtime } from "./ts/runtime";

  export let runtime: Runtime;

  const { buffer } = runtime;

  let wrapper: HTMLDivElement;

  onMount(() => {
    runtime.wrapper.set(wrapper);
  });
</script>

<div class="wrapper" bind:this={wrapper}>
  <MarkdownRenderer content={$buffer} />
</div>
