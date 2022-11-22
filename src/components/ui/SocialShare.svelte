<script>
	/**
	 * This component adds share buttons to your app, ideally in a drag-and-drop way. If the browser
	 * supports native WebSharing, then a webshare button will be displayed. If not, it will be replaced
	 * with an email share button using a mailto link. [Current compatibility data](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)
	 * says this will work in all Safari browsers, Chrome for Android and NOT in any Firefox.
	 *
	 * If the current site's twitter handle is available in the ga_data, then it will be appended to the tweet.
	 *
	 * The buttons are muted in style, and pick up --theme-color when hovered/focused.
	 *
	 * @prop alignment {string}: "left" (default), "center" or "right" will determine which way the buttons align
	 * @prop twitter {bool}: default true — false will disable the twitter button.
	 * @prop reddit {bool}: default true — false will disable the reddit button
	 * @prop facebook {bool}: default true — false will disable the FB button
	 * @prop shareHeadline {string}: required — the headline text for these buttons to serve up. The component will not display without it.
	 * @prop shareUrl {string}: defaults to current url — the specific url to be shared. It's best that you set this manually, probably.
	 * @prop shareEvent {string}: defaults to 'share-button-click' - the prefix of the event, so you can customize the event per project.
	 * @prop shareID {string}: defaults to '' - a unique ID for the share buttons. This is how you can differentiate between button sets on the same page.
	 * @prop useBrandColors {Boolean} defaults to false. When set to true, icons will use the official brand colors, instead of the gray background
	 * @prop circles {Boolean} defaults to false. When true, the buttons are circles
	 * @prop outlines {Boolean} defaults to false.
	 * @prop iconsOnly {Boolean} defaults to false.
	 */

	import Link from "./icons/Link.svelte";
	import Twitter from "./icons/Twitter.svelte";
	import Facebook from "./icons/Facebook.svelte";
	import TikTok from "./icons/TikTok.svelte";
	import Reddit from "./icons/Reddit.svelte";
	import LinkedIn from "./icons/LinkedIn.svelte";
	import Email from "./icons/Email.svelte";

	import Share from "./icons/Share.svelte";
	import { fireEvent } from "../../utils/analytics.js";

	export let label = "Share";
	export let alignment = "left";
	export let circles = false;
	export let outlines = false;
	export let iconsOnly = false;
	export let twitter = true;
	export let facebook = true;
	export let tiktok = false;
	export let reddit = true;
	export let linkedin = true;
	export let shareHeadline;
	export let shareUrl = typeof window !== "undefined" ? window.location.href : null;
	export let copiedLabelText = "Copied link";
	export let useBrandColors = false;

	// Analytics stuff
	const category = "outbound links";
	export let project = "";
	let action = `${project} share`;

	let copyButton;
	let webShare = testForWebShare();
	let facebookShareUrl = new URL(
		`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`
	).toString();
	let twitterShareUrl = getTwitterShareUrl();
	let redditShareUrl = new URL(
		`https://www.reddit.com/submit?&url=${shareUrl}&title=${shareHeadline}`
	).toString();
	let linkedinShareUrl = new URL(
		`https://www.linkedin.com/shareArticle?url=${shareUrl}"`
	).toString();
	export let tiktokShareUrl = "https://tiktok.com";
	let emailShareUrl = new URL(
		`mailto:?subject=${shareHeadline}&body=${shareHeadline + ": " + shareUrl}`
	).toString();

	function handleCopyClick(e) {
		copyTextToClipboard(shareUrl);

		const copiedLabel = document.createElement("span");
		copiedLabel.classList.add("share__copied-label");
		copiedLabel.innerText = copiedLabelText;
		copyButton.appendChild(copiedLabel);

		// Remove the label after ~1s
		setTimeout(() => {
			copyButton.removeChild(copiedLabel);
		}, 1100);
		fireEvent({ category, action: "Copy URL clicked copy", label: "URL copied" });
	}

	/**
	 * This uses the good ol' hidden text area to copy text. It is used as a fallback to the Clipboard API
	 *
	 * @param text String. The text to be copied
	 */
	function fallbackCopyTextToClipboard(text) {
		var textArea = document.createElement("textarea");
		textArea.value = text;
		textArea.classList.add("hidden-text-area");
		textArea.setAttribute(
			"style",
			"position:absolute; left: 1000vw; height: 1;width; 1;"
		);

		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();

		try {
			var successful = document.execCommand("copy");
			var msg = successful ? "successful" : "unsuccessful";
		} catch (err) {
			console.error("Fallback: Oops, unable to copy", err);
		}

		document.body.removeChild(textArea);
	}

	/**
	 * Copies the provided text to the clipboard. If the clipboard API is supported, it just uses that. If not, it fallsback to our good, ol' hidden text area trick.
	 * Cribbed from: https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
	 *
	 * @param text - string | The text to be copied to the clipboard
	 */

	function copyTextToClipboard(text) {
		if (!navigator.clipboard) {
			fallbackCopyTextToClipboard(text);
			return;
		}
		navigator.clipboard.writeText(text).then(
			function () {},
			function (err) {
				console.error("Async: Could not copy text: ", err);
			}
		);
	}

	function getTwitterShareUrl() {
		/**
		 * getTwitterShareUrl generates the sharing url for twitter. It adds the via @TwitterHandle
		 * for the current property, if that info is present in ga_data.
		 */

		let url = new URL("https://twitter.com/intent/tweet");

		url.searchParams.set("url", shareUrl);
		url.searchParams.set("text", shareHeadline);
		if (typeof window !== "undefined") {
			try {
				let via = window.ga_data.site.twitter.primary_account || "";
				if (via) url.searchParams.set("via", via);
			} catch (e) {
				// nothing
			}
		}

		return url.toString();
	}

	function handleWebShare(e) {
		/**
		 * handleWebShare will, if supported, trigger a device's native share functions
		 */
		if (webShare) {
			navigator
				.share({
					text: shareHeadline,
					url: shareUrl,
				})
				.catch(err => {
					console.error(`Couldn't share because of`, err);
				});
			fireEvent({ action, label: "Web share" });
		}
	}

	function testForWebShare() {
		/**
		 * testForWebShare returns true/false based on whether webshare is supported.
		 * You quickly can check this in Safari desktop, which supports WebShare
		 */
		if (typeof window !== "undefined") {
			return window.navigator && window.navigator.share;
		}
		return false;
	}

	function onShare(e, network) {
		fireEvent({ category, action, label: `${network} share` });
	}
</script>

<!-- 

	MARGIN FOR OVERALL CONTAINER
	--share-margin => 2em 0

	PRIMARY TEXT SIZE
	--share-font-size => 14px

	FONTS
	--share-font-family => --fonts-sans-serif => sans-serif

	HOW BIG THE OUTER BUTTON IS
	--share-touch-target => --touch-target => 44px
	
	BASIC TEXT COLOR
	--share-color-font => --color-font => #222

	THE ACCENT TEXT
	--share-color-accent => --color-accent => #009bff
	--share-color-accent-text => --color-accent-text => white

	THE COLOR FILL OF THE BUTTON WHEN NOT USING BRAND COLORS
	--share-color-default => #aaa

	BRAND COLORS
	--share-color-email
	--share-color-copy-url
	--share-color-tiktok
	--share-color-twitter
	--share-color-facebook
	--share-color-reddit
	--share-color-linkedin

 -->
<style>
	.share {
		padding: 0;
		position: relative;

		display: flex;
		align-items: center;
		flex-flow: row wrap;

		text-align: left;
	}

	.share.share--brand-colors {
		--share-color-email: #626262;
		--share-color-copy-url: #303030;
		--share-color-tiktok: black;
		--share-color-twitter: #1da1f2;
		--share-color-facebook: #3b5998;
		--share-color-reddit: #ff4500;
		--share-color-linkedin: #0073b1;
	}

	.share--center {
		text-align: center;
		justify-content: center;
	}

	.share--right {
		text-align: right;
		justify-content: flex-end;
	}

	.share__label {
		margin: 0 1em 0 0;
		font: bold var(--share-font-size, 14px) / 1.3em
			var(--share-font-family, var(--fonts-sans-serif, sans-serif));
		color: var(--share-color-font, var(--color-font, black));
		text-transform: uppercase;
		max-width: 22ch;
		flex: 1 1 22ch;
		text-align: inherit;
	}

	.share__btns {
		flex: 0 0 270px;
		list-style: none;
		display: flex;
		justify-content: flex-start;

		margin: 0;
		padding: 0;
	}

	.share--center .share__btns {
		justify-content: center;
	}

	.share--right .share__btns {
		justify-content: flex-end;
	}

	.share-btn {
		width: var(--share-touch-target, var(--touch-target, 44px));
		height: var(--share-touch-target, var(--touch-target, 44px));

		display: flex;
		align-items: center;
		justify-content: center;

		border: none;
		padding: 0;
		position: relative;
		cursor: pointer;

		background: transparent;
	}

	.share--icons-only .share-btn__inner,
	.share--icons-only.share--outlines .share-btn__inner {
		border: none;
	}

	.share-btn__inner {
		width: 75%;
		height: 75%;
		background: var(--share-color-default, #aaa);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 150ms ease, opacity 150ms ease;
	}

	.share-btn--tiktok .share-btn__inner {
		background: var(--share-color-tiktok, var(--share-color-default, #aaa));
	}

	.share-btn--twitter .share-btn__inner {
		background: var(--share-color-twitter, var(--share-color-default, #aaa));
	}

	.share-btn--facebook .share-btn__inner {
		background: var(--share-color-facebook, var(--share-color-default, #aaa));
	}

	.share-btn--reddit .share-btn__inner {
		background: var(--share-color-reddit, var(--share-color-default, #aaa));
	}

	.share-btn--linkedin .share-btn__inner {
		background: var(--share-color-linkedin, var(--share-color-default, #aaa));
	}

	.share-btn--copy .share-btn__inner {
		background: var(--share-color-copy-url, var(--share-color-default, #aaa));
	}

	.share-btn--email .share-btn__inner {
		background: var(--share-color-email, var(--share-color-default, #aaa));
	}

	.share:not(.share--brand-colors) .share-btn:hover .share-btn__inner,
	.share:not(.share--brand-colors) .share-btn:focus .share-btn__inner {
		background: var(--share-color-accent, var(--color-accent, #009bff));
	}

	.share.share--brand-colors .share-btn:hover .share-btn__inner,
	.share.share--brand-colors .share-btn:focus .share-btn__inner {
		opacity: 0.85;
	}

	.share-btn :global(svg) {
		fill: var(--share-color-icon, white);
		width: 60%;
		height: 60%;
		transition: fill 150ms ease;
	}

	.share--circles .share-btn__inner {
		overflow: hidden;
		border-radius: 50%;
	}

	.share-btn:hover :global(svg),
	.share-btn:focus :global(svg) {
		fill: var(--share-color-accent-text, var(--color-accent-text, white));
		transition: fill 150ms ease;
	}

	.share :global(.hidden-input) {
		position: fixed;
		top: 100vh;
		left: 100vw;
		height: 0;
		width: 0;
		border: none;
		padding: 0;
		margin: 0;
	}

	/* BUTTON OUTLINES -------------- */
	/* ------------------------------ */

	.share--outlines .share-btn__inner {
		background: transparent;
		border: 1px solid var(--share-color-font, var(--color-font, black));
	}

	.share--outlines .share-btn__inner :global(svg) {
		fill: var(--share-color-font, var(--color-font, black));
	}

	.share--outlines .share-btn:hover :global(svg),
	.share--outlines .share-btn:focus :global(svg) {
		fill: var(--share-color-accent-text, var(--color-accent-text, white));
	}

	@keyframes copiedLabel {
		0% {
			opacity: 0;
			transform: translate(0, 50%);
		}
		70% {
			opacity: 1;
			transform: translate(0, -50%);
		}
		100% {
			opacity: 1;
			transform: translate(0, -50%);
		}
	}

	.share :global(.share__copied-label) {
		font: bold var(--share-font-size, 14px) / 1em var(--fonts-sans-serif);
		position: absolute;
		top: 50%;
		right: 100%;
		white-space: nowrap;
		margin: 0 5px 0 0;
		padding: 5px;
		background: var(--share-color-accent, var(--color-accent, #009bff));
		color: var(--share-color-accent-text, var(--color-accent-text, white));
		animation-name: copiedLabel;
		animation-duration: 500ms;
		animation-iteration-count: 2;
		animation-direction: alternate;
		animation-fill-mode: both;
	}

	.share :global(.share__copied-label::after) {
		content: "";
		background: var(--share-color-accent, var(--color-accent, #009bff));
		display: block;
		height: 15px;
		width: 10px;

		position: absolute;
		left: 100%;
		top: 50%;
		transform: translate(0, -50%) rotate(180deg);

		-webkit-clip-path: polygon(0 50%, 100% 0, 100% 100%, 0 50%);
		clip-path: polygon(0 50%, 100% 0, 100% 100%, 0 50%);
	}
</style>

{#if shareHeadline}
	<aside
		class="share"
		class:share--circles={circles}
		class:share--icons-only={iconsOnly}
		class:share--outlines={outlines}
		class:share--brand-colors={useBrandColors}
		class:share--center={alignment.toLowerCase() === "center"}
		class:share--right={alignment.toLowerCase() === "right"}>
		{#if label}
			<h1 class="share__label">{label}</h1>
		{/if}
		<ul class="share__btns">
			{#if tiktok}
				<li>
					<a
						on:click={e => {
							onShare(e, "tiktok");
						}}
						target="_blank"
						rel="noreferrer noopener"
						class="share-btn share-btn--tiktok"
						aria-label="Visit TikTok"
						href={tiktokShareUrl}>
						<span class="share-btn__inner">
							<TikTok title="Visit TikTok" />
						</span>
					</a>
				</li>
			{/if}
			{#if twitter}
				<li>
					<a
						on:click={e => {
							onShare(e, "twitter");
						}}
						target="_blank"
						rel="noreferrer noopener"
						class="share-btn share-btn--twitter"
						aria-label="Share this on Twitter"
						href={twitterShareUrl}>
						<span class="share-btn__inner">
							<Twitter />
						</span>
					</a>
				</li>
			{/if}
			{#if facebook}
				<li>
					<a
						on:click={e => {
							onShare(e, "facebook");
						}}
						target="_blank"
						rel="noreferrer noopener"
						class="share-btn share-btn--facebook"
						aria-label="Share this on Facebook"
						href={facebookShareUrl}>
						<span class="share-btn__inner">
							<Facebook />
						</span>
					</a>
				</li>
			{/if}
			{#if reddit}
				<li>
					<a
						on:click={e => {
							onShare(e, "reddit");
						}}
						target="_blank"
						rel="noreferrer noopener"
						class="share-btn share-btn--reddit"
						aria-label="Share this on Reddit"
						href={redditShareUrl}>
						<span class="share-btn__inner">
							<Reddit />
						</span>
					</a>
				</li>
			{/if}
			{#if linkedin}
				<li>
					<a
						on:click={e => {
							onShare(e, "linkedin");
						}}
						target="_blank"
						rel="noreferrer noopener"
						class="share-btn share-btn--linkedin"
						aria-label="Share this on LinkedIn"
						href={linkedinShareUrl}>
						<span class="share-btn__inner">
							<LinkedIn />
						</span>
					</a>
				</li>
			{/if}
			{#if webShare}
				<li>
					<button
						class="share-btn share-btn--web"
						aria-label="Share this"
						on:click|preventDefault={handleWebShare}>
						<span class="share-btn__inner">
							<Share />
						</span>
					</button>
				</li>
			{:else}
				<li>
					<a
						on:click={e => {
							onShare(e, "email/mailto");
						}}
						target="_blank"
						rel="noreferrer noopener"
						class="share-btn share-btn--email"
						aria-label="Share this by email"
						href={emailShareUrl}>
						<span class="share-btn__inner">
							<Email />
						</span>
					</a>
				</li>
			{/if}
			<li>
				<button
					class="share-btn share-btn--copy "
					bind:this={copyButton}
					on:click={handleCopyClick}
					aria-label="Copy this url to your clipboard">
					<span class="share-btn__inner">
						<Link title="Copy this url to your clipboard" />
					</span>
					<!-- <span class="share__copied-label">Copied link</span> -->
				</button>
			</li>
		</ul>
	</aside>
{/if}
