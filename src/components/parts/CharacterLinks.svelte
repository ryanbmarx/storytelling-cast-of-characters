<script>
	import { fireEvent } from "../../utils/analytics.js";
	import { isInternal } from "../../utils/is-internal.js";
	import LinkNewWindow from "../ui/icons/LinkNewWindow.svelte";

	export let links = [];
	function clicked() {
		const { href } = this;

		const category = isInternal(href) ? "Internal links" : "Outbound links";
		const action = "Cast of Characters character recirc";
		const label = `to: ${href}`;

		fireEvent({ category, action, label });
	}
</script>

<style>
	.links {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.link {
		display: inline-block;
		margin-right: 0.25em;
	}

	.link::after {
		content: ", ";
	}
	.link:last-child::after {
		content: none;
	}
	.link a {
		font: bold var(--font-size-small) / 1.3em var(--fonts-sans-serif);
		color: var(--color-font);
		text-decoration: none;
		border-bottom: 1px solid var(--color-accent);
	}

	.link :global(svg) {
		display: inline-block;
		height: 0.5em;
		transform: translate(0.15em, -0.25em);
	}
</style>

{#if links.length > 0}
	<ul class="links">
		{#each links as { link, text }}
			<li class="link">
				<a on:click={clicked} href={link} target="_blank" rel="noopener nofollow">
					{text}
					<LinkNewWindow />
				</a>
			</li>
		{/each}
	</ul>
{/if}
