<script>
	import {
		loadTealPlayer,
		tealPlayerSettings,
		tealPlayerPageData,
	} from "../../utils/teal-player.js";

	export let textAlign = "left";
	export let title = "XXX";
	export let caption = "";
	export let credit = "";

	export let poster = "";
	export let json = "";

	// Let's us use "class" as a prop
	// https://svelte.dev/repl/1d0b80898137445da24cf565830ce3f7?version=3.4.2
	let clazz = "";
	export { clazz as class };

	// Elements for working the player
	let container; // The overall wrapper
	let video; // The main <video>
	let adContainer;

	/* Instantiate TealVideoWrapper for all video elements on the page
	 *
	 * @param {HTML Element} articleElement
	 */
	function init() {
		loadTealPlayer(onLoad);
	}

	function onLoad() {
		// Parse our JSON
		const videoData = JSON.parse(json);

		// remove nulls from parsed JSON
		for (const [key, value] of Object.entries(videoData)) {
			if (value === null || value == undefined) {
				delete videoData[key];
			}
		}

		const playerSettings = tealPlayerSettings();
		const pageData = tealPlayerPageData();

		// Add the length to the caption
		const { length = 0 } = videoData;
		if (length) {
			caption = `(${formatVideoLength(length)}) ${caption}`;
		}

		// Instantiate the teal player
		newTealPlayer(
			{
				video,
				container,
				adContainer,
			},
			playerSettings,
			pageData,
			videoData
		);
	}

	function newTealPlayer(htmlElements, playerSettings, pageData, videoData) {
		const tealPlayer = new window.Teal.Player(
			htmlElements,
			playerSettings,
			pageData,
			videoData
		);

		return tealPlayer;
	}

	/**
	 * formatVideoLength
	 * Convert seconds to hh:mm:ss format with no empty values or leading zeroes
	 * e.g. 59 -> "0:59", 221 -> "3:41"
	 * @param {number} length of video in seconds
	 * @return {string} formatted length
	 */
	function formatVideoLength(length) {
		const pad = i => (i < 10 ? `0${i}` : `${i}`);
		let hh = Math.floor(length / 3600);
		let mm = Math.floor((length % 3600) / 60);
		let ss = Math.floor((length % 3600) % 60);
		// prettier-ignore
		return ((hh ? `${hh}:` : "") + (mm ? (hh ? `${pad(mm)}:` : `${mm}:`) : "0:") + pad(ss));
	}
</script>

<style>
	.video {
		margin: 0;
		padding: 0;
	}

	.teal-player-container {
		aspect-ratio: 16 / 9;
	}

	.video__video {
		width: 100%;
	}

	.video__caption {
		color: var(--color-font, #222);
		font: var(--font-size-video-caption, var(--font-size-image-caption, 14px)) / 1.3em
			var(--fonts-sans-serif, sans-serif);
		margin-top: 8px;
	}

	.video__credit {
		display: inline-block;
		text-transform: uppercase;
		font-style: italic;
		margin: 0 0 0.5em;
	}
</style>

{#if json}
	<figure class="video" use:init>
		<div bind:this={container} class="teal-player-container teal-video-wrap">
			<video bind:this={video} playsinline {poster} class="video__video" />
			<div bind:this={adContainer} class="ad-container tealplayer-ad-container" />
		</div>
		{#if caption || credit}
			<figcaption class="video__caption">
				{#if caption}{caption}{/if}
				{#if credit}<span class="video__credit">{credit}</span>{/if}
			</figcaption>
		{/if}
	</figure>
{/if}
