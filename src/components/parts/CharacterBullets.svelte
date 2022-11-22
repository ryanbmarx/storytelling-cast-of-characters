<script>
	export let bullets = [];
	export let name;
	export let header = "";
	export let h = 5;

	let headerText = header.replace("{{NAME}}", name);
</script>

<style>
	.character__bullets {
		font: var(--font-size-base) / 1.3em var(--fonts-sans-serif);
		list-style: disc;
		padding: 0 0 0 1em;
	}
</style>

{#if bullets.length}
	<svelte:element this={`h${h}`} class="character__subheadline">
		{headerText}
	</svelte:element>
	<ul class="character__bullets">
		{#each bullets as { header, text }}
			<li>
				{#if header}<strong>{header}: </strong>{/if}
				{@html text}
			</li>
		{/each}
	</ul>
{/if}
