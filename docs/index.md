# Cast of Characters

Cast of Characters is a presentation framework designed to present a series of entities (people, organizations, events, etc.) in short, easily-referenced pieces. The entities, or characters, can be organized, labeled, filterd and searched. This tool is good for reference documents to accompany large projects (i.e. a "who's who?"), or a friendly way to present large groupings of information.

Examples include:

- [Day of Covid](https://www.tennessean.com/storytelling/grid/day-of-covid-pandemic-stories/)
- [Ohio Corruption](https://www.cincinnati.com/storytelling/news/ohio-corruption-project/)
- [Carlsbad 40 under 40](https://www.currentargus.com/storytelling/grid/carlsbad-40-under-40-2021-honors-community-leaders/)
- A ranked list: [Most influential Black people in sports](https://www.usatoday.com/storytelling/grid/black-history-month-50-most-influential-black-people-in-sports/)
- Large quantity of characters: [Blue Wall of Silence](https://www.usatoday.com/storytelling/grid/blue-wall-silence-police-whistleblower-misconduct-database/)
- Large quantity of characters: [Jan. 6 rioters](https://www.usatoday.com/storytelling/capitol-riot-mob-arrests/)

## Starting a new Cast of Characters project

Start by contacting the Storytelling Studio via the [pitch form](https://forms.office.com/pages/responsepage.aspx?id=jUySvBY-iE6_Jtf8-xTy1d9IGhwIPZRFnpup0Hm8VKVUN040WkFOWEtYNU5aM1U3NTM3UlZBVDVWVS4u). For now, there is no self-service option. 

You will get a Google spreadsheet. This is the core of your project. All the information and configuration will live here. You will be able to preview and publish your page using this spreadsheet. It contains several key sections/tabs (each discussed in more detail through this documentation):

- **_README:** A helpful repository of information. Find tips and reminders here as well as the URLs to the preview and published versions.
- **characters:** This is the main page. All character information goes here.
- **top:** Where the main configuration is done. Set your headline, introduction, promo brief and most everything else in this tab
- **columns:** The Cast of Characters framework is built to be very flexible. Each cast is a little different, so the content and data will be a little different. This tab handles much of that configuration.
- **categories:** Characters can be combined into smaller groups on the page. That starts here.
- **labels:** Characters can be linked using filters. These start here.

## Formatting text

To format text (bold, italic, links, multiple paragraphs, etc.) where it is supported, use [markdown](), a dead-simple syntax for adding basic formatting:

Format | Type this |  Get this
---|---|---
Italic | `*This is italicized*` | *This is italicized*
Bold | `**This is bold**` | **This is bold**
Paragraphs | Use two returns/line breaks between grafs. In Google Sheets, `shift + return` adds line breaks to text (instead of leaving the spreadsheet cell).  | *Example can't be rendered here*
Links | `This is a link to [USATODAY.com](https://www.usatoday.com)` | This is a link to [USATODAY.com](https://www.usatoday.com)


## Publishing

Publishing both to the public page as well as a VPN-only preview page can be trigggered through a spreadsheet plug-in. Use the Publish or Preview link in the Extensions drop-down menu. Publishing should take a minimum of 3 minutes before changes are relfected on the pages, but not more than 5 or 6. If things seem amiss, try publishing again then reaching out to the Storytelling Studio.

![A screenshot of a Google Spreadsheet, with the custom Publish link selected](img/publishing-link.png#no-border)

!!! warning

    The first time you publish, you will need to approve the custom publishing script we've written. You'll get some very ominous warnings from Google about unsafe scripts and the like. These can safely be ignored. The Storytelling Studio has written this script and it is safe. More details and a step-by-step are available [here](/projects/).

### Page URLs

This information also is available in the `_README` spreadsheet tab. The eventual URLs will be:

- PREVIEW (VPN): https://preprod-uw.`{DOMAIN}`.com/storytelling/qa/grid/`{SLUG}`/
- PUBLISHED (PUBLIC): https://www.`{DOMAIN}`.com/storytelling/grid/`{SLUG}`/
- `nextStorySource` (good for In-Depth Next Up): https://www.gannett-cdn.com/usat-storytelling/grid/production/uw/`{SLUG}`.json																					
## In-Depth compatibility

This app is optimized for two uses:

1. As a standalone page
2. As a "next up" story in In-Depth

For the most part, the page is rendered the same in either case with a few small changes. The theming colors configured in the In-Depth story are "connected" to the Cast of Characters, overriding anything set in the Cast spreadsheet. This includes `themeColor`, `backgroundColor` and `theme`.

To use a Cast of Characters as a next-up story, in the in-depth configuration, don't use `nextStoryAssetID` but instead `nextStorySource`. 

The `nextStorySource` takes not an ID, but a URL. The link helper from the Extensions menu will tell you the url, as will the _README tab in the spreadsheet.

Talk to the Storytelling Studio if you have any questions.