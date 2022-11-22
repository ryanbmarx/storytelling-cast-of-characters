<script>
	// For the context
	import { contextKey } from "../stores.js";
	import { getContext, onMount } from "svelte";

	import { trackInlineLinks, fireEvent } from "../utils/analytics.js";

	import LoginCast from "./LoginCast.svelte";
	import Timestamp from "./ui/Timestamp.svelte";
	import Byline from "./ui/Byline.svelte";
	import Image from "./ui/Image.svelte";
	import Video from "./ui/Video.svelte";
	import SocialShareCast from "./SocialShareCast.svelte";
	import CTA from "./CTA.svelte";

	// ADVERTS
	import {
		SponsorLogo,
		CubeMobile,
		Cube,
	} from "@gannettdigital/storytelling-advertisements";

	export let headline_label_premium = "";
	export let headline_label_preview = "";

	export let headline = "";
	export let title = "";
	export let subheadline = "";
	export let published = "";
	export let intro = "";
	export let byline = "";
	export let organization = "";
	export let updated = "";
	export let media = {};
	export let share = true;
	export let related_links = [];
	export let related_links_label = "More to this story";
	export let needsControls;
	export let intro_image_position = "bottom";
	export let display_ads;

	export let cta_headline;
	export let cta_button_text;
	export let cta_link;
	export let cta_helper_text;
	export let cta_match_premium_state;

	let hede = headline || title;
	const mediaComponents = {
		image: Image,
		video: Video,
	};

	const { meets_required_status, isPremium, ad_topic, ssts, cst, brandLock } =
		getContext(contextKey);

	function click(e) {
		fireEvent({
			action: "navigation|Cast of Characters recirc",
			label: `to: ${e.target.href}`,
		});
	}
</script>

<style>
	/* Establish a system for adding margin */
	.cast-header {
		--cast-header-margin: 1rem;
		margin-bottom: var(--cast-grid-gap);
	}

	/* Keep things at a readable width */
	.cast-header :is(.intro, h1, h2),
	.cast-header :global(.byline) {
		max-width: var(--max-width-content);
		margin-left: 0;
	}

	.cast-header > :global(*),
	.cast-header > :global(.image) {
		margin-top: var(--cast-header-margin);
	}

	.cast-header > :global(*:first-child) {
		margin-top: 0;
	}

	.cast-header :global(.ad-wrapper--brandlock) {
		margin: 0;
	}

	.label {
		display: block;
		color: var(--color-accent);
		font: bold var(--font-size-small) / 1.3em var(--fonts-sans-serif);
		text-transform: uppercase;
	}

	.cast-header .headline {
		font: bold 30px/1.3em var(--fonts-sans-serif);
		color: var(--color-font);
		margin-bottom: 0;
		margin-inline: 0;
	}

	.cast-header :global(.cta--header) {
		margin-inline: 0;
	}

	:global(.cast--serif) .cast-header .headline {
		font-family: var(--fonts-serif);
	}

	.cast-header .subheadline {
		font: italic 16px/1.5em var(--fonts-serif);
		color: var(--color-font);
		font-weight: normal;
		margin: 0.5em 0 0 0; /* slight deviation from "margin system"*/
	}

	.related {
		font: var(--font-size-base) / 1.3em var(--fonts-sans-serif);
		margin-bottom: var(--cast-header-margin, 1em);
	}

	.related__label {
		font: bold calc(1.1 * var(--font-size-base)) / 1.3em var(--fonts-sans-serif);
		margin: 0 0 0.25em;
		color: var(--color-font);
	}

	.related__links {
		color: var(--color-font);
		margin: 0;
		padding: 0 0 0 1em;
	}
	.related__link {
		margin-bottom: 0.25em;
	}
	.related__link a {
		font-weight: normal;
	}

	.cast-header :global(.share) {
		margin-bottom: 0;
	}

	.cast-header :global(.login-wrapper) {
		max-width: none;
	}

	/* Some intro hierarchy */

	.intro :global(:is(h3, h4, h5)) {
		font-family: var(--fonts-sans-serif);
		line-height: 1.3em;
		font-weight: bold;
		color: var(--color-font);
	}

	.intro :global(h3) {
		font-size: 1.2rem;
	}
	.intro :global(h4) {
		font-size: 1rem;
	}
	.intro :global(h5) {
		font-size: 1rem;
	}
</style>

<header
	id="cast-header"
	class="cast-header"
	class:cast-section--skinny={!needsControls}>
	{#if media && intro_image_position === "top"}
		<svelte:component this={mediaComponents[media.type]} {...media} />
	{/if}
	{#if brandLock}
		<SponsorLogo {cst} {ssts} topic={ad_topic} />
	{:else if isPremium}
		{#if meets_required_status}
			<span class="label">{headline_label_premium}</span>
		{:else}
			<span class="label">{headline_label_preview}</span>
		{/if}
	{/if}
	{#if hede}<h1 class="headline">{hede}</h1>{/if}
	{#if subheadline}<h2 class="subheadline">{subheadline}</h2>{/if}
	{#if media && intro_image_position === "under_headline"}
		<svelte:component this={mediaComponents[media.type]} {...media} />
	{/if}
	<Byline {byline} {organization} />
	<Timestamp {published} {updated} />

	{#if intro}
		<div class="intro" use:trackInlineLinks>
			{@html intro}
		</div>
	{/if}
	<CTA
		position="header"
		{cta_headline}
		{cta_match_premium_state}
		{cta_button_text}
		{cta_link}
		{cta_helper_text}
		class="cta--header" />

	{#if related_links.length}
		<aside class="related">
			<h1 class="related__label">{related_links_label}</h1>
			<ul class="related__links">
				{#each related_links as { link, label }}
					<li class="related__link">
						<a on:click={click} href={link} target="_blank" rel="noopener noreferrer">
							{label}
						</a>
					</li>
				{/each}
			</ul>
		</aside>
	{/if}
	{#if media && intro_image_position === "bottom"}
		<svelte:component this={mediaComponents[media.type]} {...media} />
	{/if}
	{#if !meets_required_status}
		<LoginCast component="header" />
	{/if}
	{#if share}
		<SocialShareCast />
	{/if}
	{#if display_ads}
		<Cube {cst} {ssts} topic={ad_topic} />
		<CubeMobile {cst} {ssts} topic={ad_topic} />
	{/if}
</header>
