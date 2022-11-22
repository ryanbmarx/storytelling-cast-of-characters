<script>
	// SVELTE & UTILS
	import { getContext } from "svelte";
	import { contextKey } from "../stores.js";

	// CHARACTER COMPONENTS
	// Add imports here as we add new layouts
	import Default from "./characters/Default.svelte";
	import Card from "./characters/Card.svelte";
	import Medium from "./characters/Medium.svelte";
	import Wide_NoImage from "./characters/Wide_NoImage.svelte";
	import Wide_WithImage from "./characters/Wide_WithImage.svelte";

	// ADVERT COMPONENTS
	import { Cube, CubeMobile } from "@gannettdigital/storytelling-advertisements";

	// OTHER COMPONENTS
	import ButtonsCardToggle from "./ButtonsCardToggle.svelte";

	const {
		charactersToShow,
		categoriesToShow,
		hasImages,
		cst,
		ssts,
		ad_topic,
		display_ads,
		card_image_mask,
	} = getContext(contextKey);

	export let labels = [];
	export let h;
	export let id = null;
	export let name = "";
	export let description = "";
	export let characters = [];
	export let hasCategories = false;
	export let index;
	export let ads_every_nth = 25;

	// We can dynamically switch layouts
	export let character_layout = "default";

	// The keys in this object can be passed in via the `section` tab
	// Use that to set new layouts per section.
	const characterLayouts = {
		default: Default,
		medium: Medium,
		card: Card,
		card_reverse: Card,
		card_side_by_side: Card,
		card_side_by_side_reverse: Card,
		wide: hasImages ? Wide_WithImage : Wide_NoImage,
	};

	// Destructure our desired character layout pieces, for greater template readability.
	// Default to the ... well ... default.
	const layout =
		characterLayouts[character_layout.toLowerCase()] || characterLayouts["default"];

	// SOME LAYOUT TRIGGERS
	const isCardLayout = character_layout.includes("card");
	const isCardLayoutSplit = character_layout.includes("card_side_by_side");

	// Use the medium layout when configured and for cards
	const medium = character_layout === "medium";

	// Use the wide layout when configured for the split-apart card layouts
	const wide = character_layout === "wide" || isCardLayoutSplit;
</script>

<style>
	.characters {
		--cast-grid-min: 200px;
		margin-top: 2em;
	}

	.characters--card {
		--cast-grid-min: 300px;
	}

	.characters__inner {
		margin: 2em 0 0 0;
		list-style: none;
		padding: 0;
		display: grid;
		grid-auto-flow: row dense;
		gap: var(--cast-grid-gap);
		grid-template: auto / repeat(auto-fill, minmax(var(--cast-grid-min), 1fr));
	}

	.characters--medium {
		--cast-grid-min: 325px;
	}

	.characters--wide .characters__inner {
		--cast-grid-gap: 45px;
		/* Freeze it at one-column */
		grid-template: auto / minmax(1px, 1fr);
	}

	.cast-section--no-label .characters,
	.cast-section--no-label .characters__inner {
		margin-top: 0;
	}

	.characters .ad,
	.characters :global(.ad-wrapper) {
		/* Make sure ads center in the full width */
		grid-column: 1 / -1;
	}

	.characters--medium .ad,
	.characters--wide .ad {
		/* Puts the ad inline (vertically top-aligned) when using large layouts */
		grid-column: unset;
		align-self: start;
	}

	.characters .ad:nth-last-child(1),
	.characters .ad:nth-last-child(2),
	.characters .ad:nth-last-child(3),
	.characters .ad:nth-last-child(4),
	.characters .ad:nth-last-child(5),
	.characters .ad:nth-last-child(6) {
		/* Hides an ad if it is one of the last 6 elements in the list so it doesn't visually collide with the ad at the end of a category */
		display: none;
	}

	.characters ~ :global(.ad-wrapper) {
		/* Ads at end of category need a little space above */
		margin: 2rem auto 0 auto;
	}

	@media all and (min-width: 768px) {
		.characters--medium {
			/* Kinda a 2-col layout */
			--cast-grid-min: 375px;
		}
		.characters--card {
			/* Kinda a different 2-col layout */
			--cast-grid-min: 355px;
		}

		.characters {
			--cast-grid-gap: 45px;
		}
	}
</style>

{#if isCardLayout && !isCardLayoutSplit && index === 0}
	<ButtonsCardToggle />
{/if}
{#if $categoriesToShow.has(id) || !hasCategories}
	<section {id} class="cast-section" class:cast-section--no-label={!name}>
		{#if name}
			<svelte:element this={`h${h}`} class="cast-label">
				<span class="cast-label__text">{name}</span>
				{#if description}<span class="cast-label__subtext">{description}</span>{/if}
			</svelte:element>
		{/if}
		<div
			class="characters"
			class:characters--card={isCardLayout && !isCardLayoutSplit}
			class:characters--medium={medium}
			class:characters--wide={wide}>
			<ul class="characters__inner">
				{#each characters as character, index}
					<svelte:component
						this={layout}
						h={name ? h + 1 : h}
						{...character}
						{index}
						{card_image_mask}
						visible={$charactersToShow.has(character.id)}
						labelLookup={labels}
						layout={character_layout} />
					{#if display_ads && !hasCategories && index > 0 && index % (ads_every_nth - 1) === 0}
						<!-- If we want ads, display a cube every 25 characters, starting with the 25th -->
						<li class="ad">
							<!-- Lists can only have list items as children -->
							<Cube {cst} {ssts} topic={ad_topic} />
							<CubeMobile {cst} {ssts} topic={ad_topic} />
						</li>
					{/if}
				{/each}
			</ul>
		</div>
		{#if display_ads}
			<Cube {cst} {ssts} topic={ad_topic} />
			<CubeMobile {cst} {ssts} topic={ad_topic} />
		{/if}
	</section>
{/if}
