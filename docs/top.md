# Configuring the page

The Cast of Characters framework is flexible, with lots of options to handle just about any project. Most — not all — of these choices are made in the `top` spreadsheet tab and can be used to customize the appearance, performance and functionality of your cast of characters.

## Page metadata

This stuff is mostly for Google and anyone who might also use Bing. 

Key | Purpose | Default | Required 
---|---|---|---
`title` | The page `<title>`. This is for Google and should be filled with keywords | - | Yes 
`description` | A short, concise page description. This will be used by Google and social media (i.e. Facebook). Keywords are important here. This is like Presto's promo brief. | - | Yes
`ssts` | The desired `ssts`, in a slash-seperated list. e.g. `sports/nfl/packers` | `news` | Yes 
`cst` | The desired `cst` | the `ssts` value | no 

## Header

The first item on the page is a headline and other top-of-article stuff such as introduction and a lede photo.

Key | Purpose | Default | Required 
---|---|---|---
`headline`  | The page headline, written for humans. | `title` | No
`subheadline` | A subheadline, underneath the main page headline. | - | No
`byline` | This text will be in bold, under the headline. If you want it to say "By ..." then write "By ..." in this spreadsheet cell. | - | No
`organiztion` | The second part of the byline. What's the property/newsroom to be credited. | `USA TODAY NETWORK` | No
`published` | The date and time of publish. | - | Yes 
`updated` | The date and time of the most recent update. **Google and readers both pay attention to this.** | The current time | No 
`intro` | The short introduction at the top of the page. This text should provide a _brief_ context of the broad story for the readers. Google also reads this closely, so keywords are highlight recommended. Formatting is possible with markdown. | - | No.

!!! caution
    The dates should be set using the Google Spreadsheet date picker. It's pretty good at recognizing dates and automatically formatting them. Still, if you click on the spreadsheet cell with a data and a little calendar doesn't popup, then it's not a _date_.


### Featured visual

A cast doesn't necessarily need a lead visual, but sometimes it can enhance the experience by setting the scene or tone of what's to come. Images and Presto videos are supported here.

Key | Purpose | Default | Required 
---|---|---|---
`intro_image`| The URL or Presto ID of a lead photo. Videos from Presto also are supported with Presto IDs | - | No. 
`intro_image_alt_text` | Good, descriptive alt text for the `image`.| - | Yes
`intro_image_caption` | An alternate caption, if the Presto one will not suffice| - | Yes, if using an image URL
`intro_image_hide_caption` | If `yes`, then caption will not display. This is good for art illustrations. | `no` | No
`intro_image_credit` | An alternate credit, if the Presto one will not suffice| - | Yes, if using an image URL
`intro_image_hide_credit` | If `yes`, the credit will not display. Perhaps for videos where the credit is contained therein. | `no` | No
`intro_image_position` | Moves the position of the featured visual. Can be `top`, `under_headline` or `bottom`. | `bottom` | No.

### Related links

A series of links back to key project installments can be included with the following values. More than one link can be included by incrementing the number: i.e. `related_link_2`, `related_link_3`, etc.

Key | Purpose | Default | Required 
---|---|---|---
`related_links_label` | The bold header label for the links | "More to this story" | No
`related_link_1` | The link to the story/interactive.content. Can be provided as a complete url, beginning with `https://` or as a Presto ID.  | - | Yes 
`related_link_1_text` | The link text for the story. This value can be used to write or rewrite any headline from Presto. | Presto headline | Yes, but not for Presto IDs


### Next Story

Key | Purpose | Default | Required
---|---|---|---
`next_story_id` | Optional Presto ID of an In-Depth story to load in after the story when user scrolls to the bottom of the page. | - | No


### Sharing

Key | Purpose | Default | Required 
---|---|---|---
`share_description` | An alternate page description for use with Twitter, Facebook and other share descriptions | `description` | No
`share_label` | The text label with the share buttons | "Share" | No
`share_image` | The main page image for social networks. Can be image URL or a Presto ID| - | Yes

## Advertisements

Advertisements are enabled by default. Sponsored pages are supported.

Key | Purpose | Default | Required 
---|---|---|---
`display_ads` | Enable (`yes`) or disable (`no`) the display of ads.  | `yes` | No.
`brandlock` | Enable (`yes`) or disable (`no`) the display of a sponsored logo in the header, above the headline.  | `no` | No.
`top_ad` | The first ad on the page is the largest, and has options, mostly to accomadate sponsorships. Can be set to `default`, for a leaderboard, or `paramount`. | `default` | No.
`ad_topic` | Sometimes, ads need to be targeted to pages. Setting this to the value given by ad ops helps with that. | None. | No.

!!! Caution

    For sponsored Casts of Characters, be sure both the ad folks and the Storytelling Studio have enough time to confirm ads are functioning as expected. There's money at stake. Let's be sure it all works at least a week ahead of time.

## Other bits of text

It's possible to customize various labels and other bits of text throughout the page, to make the reader experience more relevant and helpful.

Key | Purpose | Supports formatting | Default | Required 
---|---|---|---|---
`category_nav_label` | The text label above the category outline/navigation | No | "Sections" | No
`labels_label` | The text label above the labels outline/filters | No | "Filters" | No
`labels_instructions` | The secondary text with the `labels_labels`. | No | "Show only these entities" | No
`contributing` | A line of text underneath the page's content. This is a good place to put secondary contributors.| Yes | - | No 
`default_category_name`  | When not using categories, this can be used to put a subheadline label above the cast. This helps with screen-reader readability | No | - | No
`default_category_description` | A related description for the `default_category_name` | No | - | No
`label_text_search` | Set the label instructions for the text search box | `Start typing to search` | No
`none_message` | If a user has searched in a way that yields no results, this message appears. | `There are no matches. Try a different search.` | No

## Visual settings

Some basic visual choices to create a unified look and feel with related articles. All colors should be provided as valid CSS colors, such as hex values. To enable a dark-themed display, set the `background_color` to a darker color. The various text colors throughout the page will be set accordingly.

Key | Purpose | Default | Required 
---|---|---|---
`theme_color` | An accent color, used sparingly, to splash color throughout. Is analgous to `themeColor` in In-Depth. At present, the `theme_color` is not used for text anywhere, so it doesn't need to be "fully accessible." | `#009bff` | No
`theme_color_text` | The appropriate, readable color for text using the `theme_color` as a background. It is best to leave this out of your configuration and let the Cast of Characters automatically select the better color of black or white. | `white` | No
`background_color` | The page background color | `white` | No
`serif` | If `yes`, then the display type will be in the usual serif font. Currently, this only includes the headline | `no` | No
`image_ratio` | If using images, they can be uniformly cropped for a clean, orderly appearance. It's `WIDTHxHEIGHT`. Examples: `16x9` or `4x3`  | `bestCrop`/no cropping | No
`thumbnail_image_ratio` | If using thumbnails, they can be uniformly cropped for a clean, orderly appearance. It's `WIDTHxHEIGHT`. Examples: `16x9` or `4x3`  | `4x3` | No
`character_layout` | Currently, only three layouts are supported: `default`, `medium` and `wide`. Setting the layout here will affect all characters. This also can be set per category in the categories tab. |`default`| No

!!! caution
    Photos should be cropped to properly reflect the story's subjects before being added to the project. Cropping with `image_ratio` alone will result in strange, if not unusable, image crops. 

## Paywall/Premium content

Each cast of characters page can be set to premium (subscriber-only) and registered (registered users only). Metered usage is not supported. Readers who are not logged in and/or do not meet the page requirements, will be shown a roadblock and subscription CTA.

Key | Purpose | Default | Required
--- | --- | --- | ---
`required_status` | Can be `subscriber`, `registered` or `any` to set the premium status/content protection state | `any` | No
`max_characters` | The number of characters/entities does a nonsubscriber/nonregistered reader see without logging in. | 12 | No
`label_does_not_meet_requirements` | The main label of the login component | See below. | No
`label_sign_up_button` | The label for the main button on the roadblock. Will beging the registration/subscription process | `Create account`/`Subscribe now` | TK
`label_sign_in_button` | The label of the secondary link to let subscribers sign in to their account | `Sign in` | No
`see_the_rest` | A secondary label for the bottom-of-page subscription/registration CTA | Value of `label_does_not_meet_requirements` | No


The default login labels are:
- Subscriber-only: "This is for subscribers only. Join now for great journalism like this.";
- Registration-only: "This is for registered readers only. Create your free account now."

Premium casts of characters will get a kicker label above the main headline. 

Key | Purpose | Default | Required
--- | --- | --- | ---
`headline_label_premium` | A small label reinforcing to subscribers that this is what they pay for. | `Subscriber exclusive` | No.
`headline_label_preview` | We offer a preview of premium  content to nonsubscribers. This kicker label variation points that fact out. |`A preview of a subscriber exclusive` | No.

### Examples of premium casts

- [Most influential Black people in sports](https://www.usatoday.com/storytelling/grid/black-history-month-50-most-influential-black-people-in-sports/)
- [Blue Wall of Silence](https://www.usatoday.com/storytelling/grid/blue-wall-silence-police-whistleblower-misconduct-database/)
