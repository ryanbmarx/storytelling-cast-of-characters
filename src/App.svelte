<script>
	// COMPONENTS
	import CharacterCategory from "./components/CharacterCategory.svelte";
	import ButtonFilterToggle from "./components/ButtonFilterToggle.svelte";
	import Header from "./components/Header.svelte";
	import Controls from "./components/Controls.svelte";
	import Roadblock from "./components/Roadblock.svelte";
	import None from "./components/None.svelte";
	import ButtonReturn from "./components/ui/ButtonReturn.svelte";
	import CTA from "./components/CTA.svelte";

	// AD UNITS
	import {
		Paramount,
		BannerMobile,
		Leaderboard,
		CubeMobile,
	} from "@gannettdigital/storytelling-advertisements";

	// UTILS
	import { onMount, setContext, tick } from "svelte";
	import { contextKey } from "./stores.js";
	import { fireEvent, firePageView } from "./utils/analytics.js";
	import { inView } from "./utils/watch-for-element.js";

	// STORES
	import { derived, writable } from "svelte/store";
	import { createMediaStore } from "./utils/media-store.js";

	export let top = {};
	export let characters = [];
	export let categories = [];
	export let labels = {};

	// Boolean to manage next-up oddities
	let visible = false;

	// User stuff and premium
	export let meets_required_status = true;
	const isPremium = top.required_status === "subscriber";

	// Do we have a global setting for category-less character layouts?
	let character_layout = top.character_layout ? top.character_layout : "default";

	// Figure out what UI elements we need.
	const hasSearch = top.searchable.length > 0;
	const hasLabels = Object.keys(labels).length > 0;
	const hasCategories = categories.length > 0;
	const needsControls =
		(hasSearch || hasLabels || hasCategories) && meets_required_status;

	// Our search/filter stores
	const filterLabels = writable([]);
	const searchString = writable("");

	let theme = top.theme || "light";
	let cast;

	const labelsVisible = writable(false);
	const body = typeof document !== "undefined" ? document.body : null;

	const categoriesToShow = writable(new Set([]));

	// Derived stores, for reference: https://svelte.dev/docs#derived
	// A derived store that is a Set of the character IDs we want to show.
	// Use a set because Set.has() is faster than
	const charactersToShow = derived(
		[filterLabels, searchString],
		([$filterLabels, $searchString]) => {
			$categoriesToShow = new Set([]);
			let visibleCharacters = characters.reduce(
				(accumulator, currentCharacter, index) => {
					// Iterate through each character, stopping once we reach our roadblocked max
					// (or if the user is logged in).
					if (
						(meets_required_status || index < top.max_characters) &&
						checkFilters(currentCharacter, $filterLabels) &&
						(!hasSearch ||
							checkSearchText(currentCharacter, $searchString.toLowerCase()))
					) {
						// If the character meets  our  checkbox filter requirements AND
						// meets our text search requirements (or we have no search requirements)
						// then add the ID to our visible group and track its category so we show that, too.
						$categoriesToShow.add(currentCharacter.category);
						accumulator.push(currentCharacter.id);
					}
					return accumulator;
				},
				[]
			);

			visibleCharacters = new Set(visibleCharacters);
			return visibleCharacters;
		}
	);

	// Checks the searchable fields and returns true if our desired search string
	// is found in any of those fields.
	function checkSearchText(character, searchString) {
		// We want a string of at least 3 characters before we search.
		if (!searchString || searchString.length < 3) return true;

		// For each searchable column ...
		for (let column of top.searchable) {
			// Check if character has a value for that value and if that value contains our search term
			if (character[column] && character[column].toLowerCase().includes(searchString)) {
				return true;
			}
		}
		// Found nothing. Return false.
		return false;
	}
	// Checks each character for ALL the filters that have been checked.
	function checkFilters(character, filters) {
		// No checks means show everybody
		if (filters.length === 0) return true;

		// Since we have checks, make a set of the labels for this character.
		// Checking sets is quicker than checking arrays.
		const labels = new Set(character.labels);
		for (let filter of filters) {
			// For each filter checked, see if the character has it.
			// If the character does have it, check the next one.
			if (!labels.has(filter)) {
				// If the character doesn't have it, return false.
				// We only want characters that have ALL the checked labels
				return false;
			}
		}
		// We've been through all the labels, and the character has them all.
		return true;
	}

	// A custom store that lets us know if we are mobile
	const isMobile = createMediaStore("(max-width: 1024px)", true);

	// A derived store that is either the number of visible characters, or the total characters.
	const numberVisible = derived(
		charactersToShow,
		$charactersToShow => $charactersToShow.size
	);

	const {
		label_sign_in_button,
		label_sign_up_button,
		label_does_not_meet_requirements,
		bullets_header,
	} = top;

	setContext(contextKey, {
		toggleMenu,
		labelsVisible,
		hasImages: top.hasImages,
		filterLabels,
		filters_label: top.filters_label || "Filters",
		labelLookup: labels,
		charactersToShow,
		categoriesToShow,
		searchString,
		headline: top.headline || top.title || "",
		numberVisible,
		numberTotal: characters.length,
		share_label: top.share_label || "Find this useful? Share it with others",
		share: top.share === "yes" || true,
		none_message: top.none_message || "There are no matches. Try a different search.",
		reset_button_label: top.reset_button_label || "Reset",
		meets_required_status,
		isPremium,
		label_sign_in_button,
		label_sign_up_button,
		label_does_not_meet_requirements,
		cast_project: top.cast_project,
		isMobile,
		display_ads: top.display_ads,
		ssts: top.ssts,
		cst: top.cst,
		brandLock: top.brandlock,
		bullets_header,
		card_image_mask: top.card_image_mask,
		card_name_position: top.card_name_position,
		card_text_alignment: top.card_text_alignment,
	});

	onMount(() => {
		// CONFIRM NAV HEIGHT. Check for UW and Tangent
		const nav = document.querySelector("#navWrapContainer, header.gnt_n");
		if (nav) {
			cast.style.setProperty("--cast-nav-height", `${nav.offsetHeight}px`);
		}

		// Detect the parent article's theme and use it.
		// If no parent article is detected, then we are standalone.
		const parentArticle = cast.closest(".article-inner");
		if (parentArticle && parentArticle.dataset.theme) {
			theme = parentArticle.dataset.theme;
		}
		// REGISTER IN-VIEW EVENT FOR MANAGING NEXT-UP ODDITIES
		inView({
			element: cast,
			cb: entry => {
				visible = entry.isIntersecting;
			},
			once: false,
		});
		// REGISTER EVENT FOR LAST CHARACTER
		// This will select the last character in each section
		let last = document.querySelectorAll(".character:last-of-type");
		if (last[last.length - 1]) {
			// Set up an inview for the last element in our nodelist
			inView({
				element: last[last.length - 1],
				cb: () => {
					fireEvent({
						category: "scroll tracking",
						action: "end of page",
						label: `cast of characters ${top.cast_project}`,
					});
				},
			});
		}

		// LISTEN FOR WHEN IT IS TIME TO FIRE A PAGEVIEW
		if (window?.gciAnalytics?.isReady) {
			// Analytics are ready
			castPageview();
		} else {
			// Wait for analytics to load, then fire the pageview
			document.addEventListener("gciAnalyticsReady", () => {
				castPageview();
			});
		}
	});

	$: if (meets_required_status && top.next_story_id && typeof window === "object") {
		tick().then(() => window.document.dispatchEvent(new Event("DOMContentLoaded")));
	}

	function castPageview() {
		const { presto_id = "" } = top;
		// Fire the correct pageView
		switch (top.required_status) {
			case "subscriber":
				firePageView({ cps: "premium", contentId: presto_id });
				break;
			case "registered":
				firePageView({ cps: "registered", contentId: presto_id });
				break;
			default:
				firePageView({ cps: "free", contentId: presto_id });
		}
	}

	function toggleMenu(e) {
		fireEvent({
			category: "cast of characters",
			action: "mobile filters",
			label: "open",
		});
		$labelsVisible = !$labelsVisible;

		if (body.classList.contains("scroll-lock")) {
			body.classList.remove("scroll-lock");
		} else {
			body.classList.add("scroll-lock");
		}
	}

	let charactersByCategory = characters.reduce((result, current) => {
		// Category name for easy reference
		const { category } = current;

		// If our final object does not yet have a key for this character's category, then make one
		if (!(category in result)) result[category] = [];

		// Add the character to the final object
		result[category].push(current);

		// Move on.
		return result;
	}, {});
</script>

<style>
	.cast {
		display: grid;
		gap: var(--cast-grid-gap) calc(3 * var(--cast-grid-gap));
		grid-template: auto / minmax(1px, 1fr);

		width: 100%;
		box-sizing: border-box;
	}

	@media all and (min-width: 1024px) {
		.cast.cast--controls {
			/* Put the controls to the right side */
			display: flex;
			gap: var(--cast-grid-gap) calc(3 * var(--cast-grid-gap));
		}

		.cast.cast--controls .content {
			flex: 1 1;
			/* Put a nice gap between every item */
			display: flex;
			flex-flow: column nowrap;
			gap: var(--cast-grid-gap);
		}
	}

	:global(#gannettAtomsComponentBar) {
		display: none !important;
	}
</style>

<svelte:options accessors />

{#if top.display_ads}
	{#if top.top_ad === "paramount" || top.brandlock}
		<!-- Make sure we have the larger ad when we are sponsored -->
		<Paramount cst={top.cst} ssts={top.ssts} topic={top.ad_topic} />
	{:else}
		<!-- Default -->
		<Leaderboard cst={top.cst} ssts={top.ssts} topic={top.ad_topic} />
	{/if}
{/if}
<div
	class="cast"
	data-meets-required-status={meets_required_status}
	data-theme={theme}
	bind:this={cast}
	class:visible
	class:cast--controls={needsControls}
	class:cast--serif={top.serif}>
	<div class="content">
		<Header {...top} media={top.intro_image} {needsControls} />
		{#if needsControls && (hasSearch || hasLabels)}
			<!-- Categories are placed elsewhere, so we only need _this_ if we have search or labels. 
				`needsControls` also checks for required status. -->
			<ButtonFilterToggle label={top.labels_label} />
		{/if}

		{#if hasCategories && $numberVisible > 0}
			<!-- Organize into categories -->
			{#each categories as category, index}
				<CharacterCategory
					h={top.subheadline ? 3 : 2}
					{...category}
					{hasCategories}
					{labels}
					{index}
					characters={charactersByCategory[category.id]}
					hasImages={top.hasImages} />
			{/each}
		{:else if !hasCategories && $numberVisible > 0}
			<!-- Just one block of characters -->
			<CharacterCategory
				h={top.subheadline ? 3 : 2}
				{hasCategories}
				{character_layout}
				hasImages={top.hasImages}
				{labels}
				index={0}
				{characters}
				name={top.default_category_name || ""}
				description={top.default_category_description || ""} />
		{:else if meets_required_status}
			<!-- There are no chars to show, but we only show the "none" component if we are not roadblocked. -->
			<None />
		{/if}
		{#if !meets_required_status}
			<Roadblock
				{hasCategories}
				{character_layout}
				hasImages={top.hasImages}
				{labels}
				{characters}
				see_the_rest={top.see_the_rest} />
		{/if}

		<CTA
			position="bottom"
			cta_headline={top.cta_headline}
			cta_match_premium_state={top.cta_match_premium_state}
			cta_button_text={top.cta_button_text}
			cta_link={top.cta_link}
			cta_helper_text={top.cta_helper_text} />

		{#if top.contributing}
			<section
				class="cast-section contributing"
				class:cast-section--skinny={!needsControls}>
				{@html top.contributing}
			</section>
		{/if}
	</div>

	{#if meets_required_status && top.next_story_id}
		<div
			data-storytelling-component="next-in-depth-story"
			data-next-asset-id={top.next_story_id}
			data-next-story-site-code={top.site_code} />
	{/if}

	{#if needsControls}
		<Controls
			h={top.subheadline ? 3 : 2}
			{...top}
			{categories}
			{labels}
			{hasSearch}
			{hasLabels}
			{hasCategories} />
	{/if}
	{#if visible}
		<ButtonReturn href="#cast-header" />
	{/if}
</div>
