<script>
	export let blurbs = [];
	export let h = 5;
</script>

{#each blurbs as { header, text }}
	{#if header}
		<svelte:element this={`h${h}`} class="character__subheadline">
			{header}
		</svelte:element>
	{/if}
	{@html text}
{/each}
