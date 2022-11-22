[![Test](https://github.com/GannettDigital/storytelling-cast-of-characters/actions/workflows/test.yml/badge.svg)](https://github.com/GannettDigital/storytelling-cast-of-characters/actions/workflows/test.yml)

[![Deploy the app's assets](https://github.com/GannettDigital/storytelling-cast-of-characters/actions/workflows/deploy.yml/badge.svg)](https://github.com/GannettDigital/storytelling-cast-of-characters/actions/workflows/deploy.yml)

[![Publish content for the app](https://github.com/GannettDigital/storytelling-cast-of-characters/actions/workflows/publish.yml/badge.svg)](https://github.com/GannettDigital/storytelling-cast-of-characters/actions/workflows/publish.yml)

[![Create new project](https://github.com/GannettDigital/storytelling-cast-of-characters/actions/workflows/new-project.yml/badge.svg)](https://github.com/GannettDigital/storytelling-cast-of-characters/actions/workflows/new-project.yml)

# Cast of Characters

Cast of Characters is a presentation framework designed to present a series of entities (people, organizations, events, etc.) in short, easily-referenced pieces. The entities, or characters, can be organized, labeled, filterd and searched. This tool is good for reference documents to accompany large projects (i.e. a "who's who?"), or a friendly way to present large groupings of information.

Examples include:

- [Day of Covid](https://www.tennessean.com/storytelling/grid/day-of-covid-pandemic-stories/)
- [Blue Wall of Silence](https://www.usatoday.com/storytelling/grid/blue-wall-silence-police-whistleblower-misconduct-database/)
- [Ohio Corruption](https://www.cincinnati.com/storytelling/news/ohio-corruption-project/)
- [Carlsbad 40 under 40](https://www.currentargus.com/storytelling/grid/carlsbad-40-under-40-2021-honors-community-leaders/)

## Creating a new project

Creating a new Cast of Characters project is, in essence, a two-step process. 

1. Make a copy of the [template spreadsheet](https://docs.google.com/spreadsheets/d/1_fP0XpZLVa8vcyMayrJyc9KHt1jWn3FAXFtuvZAuidM/edit#gid=967841973). Be sure to include the apps script and share it with all the same people who already have access.
2. Run the [Create New Project](https://github.com/GannettDigital/storytelling-cast-of-characters/actions/workflows/new-project.yml) github action. This will prompt you to supply a project slug, url ending/SEO slug, spreadsheet key (from step 1) and to pick a canonical domain. Within about 4 minutes of running the action, a PR adding your new project to the repo will appear. Approve and merge.
3. For ... _reasons_ ... Github Action won't trigger PR checks. The hacky workaround is to close the PR that was just generated then immediately reopen it. Once checks pass, you can merge the new project.


## Local development

### How projects are organized

The canonical list of all available Cast of Characters projects — at least the ones using _this_ codebase — can be found in [`./settings.json`](https://github.com/GannettDigital/storytelling-cast-of-characters/blob/main/settings.json). Each project is a keyed object in this file and contains the following information:

| Key                  | Value                                                                                                                                                                                                                                                                                             | Required |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `CAST_PROJECT_SLUG`  | This is the key value inside `settings.json` and is how spreadsheet publishing triggers the proper Cast of Characters project.                                                                                                                                                                    | Yes      |
| `slug`               | This is the url ending. Needs good keywords                                                                                                                                                                                                                                                       | Yes      |
| `spreadsheet key`    | The Google spreadsheet key                                                                                                                                                                                                                                                                        | Yes      |
| `domain`             | The domain, without the `.com`, of the **canonical** property.                                                                                                                                                                                                                                    | Yes      |
| `site_code`          | The four-letter, all-caps site code for the **canonical** property.                                                                                                                                                                                                                               | Yes      |
| `twitter`            | A nice-to-have piece, which lets us add the property's Twitter handle to various metadata. This could be handled by platform config, but it is not.                                                                                                                                               | -        |
| `canonical_override` | This was introduced to migrate existing proto-cast-of-character projects to this framework without losing SEO juice. It's value will be validated as URL and used instead of the usual canonical anytime you wish to define a custom canonical URL. _Doing this **REQUIRES** a custom UW config._ | -        |

_Example settings:_

```json
{
    "ohio-corruption": {
        "slug": "ohio-state-corruption-players",
		"spreadsheet_key": "1lg7oW4KsaFwmd4x7qLIydTVMgvqYkaaylwhbUYaa8Ic",
		"domain": "cincinnati",
		"site_code": "PCIN",
		"twitter": "enquirer"
	},
```

## Getting started with development

1. clone the repo and run `make install` from the root.
2. Next run `make build`. This not only compiles the javascript and stylesheets, but also moves static assets from `src/static` into the public folder. In this case, the `global.css` is what we care about.
3. `npm run dev` will start the dev server with hot reloading.

## Loading a project

As a development environment, this codebase is designed to handle only one project at a time. Specify the project you wish to load setting the `CAST_PROJECT` variable in your environment. Then, `make update` will pull fresh content from the associated spreadsheet, writing it to `./functions/data/content.json`.

```sh
CAST_PROJECT="ohio-corruption" make update
```

To generate an index file suitable for the local webserver, run `make preview` which will write `./public/index.html`. To create a UW response, run `make uw`. Both of these functions will use the aforementioned `content.json` as input.

Because we use make, we can run them all in sequence pretty easily. Feel free to create a handy utility command to do all this stuff in one swoop.

```sh
CAST_PROJECT="ohio-corruption" make update preview uw
```

### Documentation

The s2-docs/producer doc markdown files and assets are in this repo, too, in `/docs/`. These should be updated as new features are developed and periodically migrated to the s2-docs for publishing.

**The producer documentation for managing a cast is in the [s2 docs](https://storytelling.gannettdigital.com/cast/).**

## Publishing & Deploying

This codebase distibuishes between deploying and publishing in the following way:

- **Publishing** is for content. When an editorial partner fills in or changes a spreadsheet, that content is _published_.
- **Deploying** is for assets. If a feature is added or some styles tweaked in the codebase, then those changes are built and the resulting bundles are _deployed_.

There are two different bash scripts used to put stuff on the CDN (with related Make commands):

- `./functions/deploy.sh` will upload all assets directly in `./public/` to the CDN (`/usat-storytelling/grid/{BUCKET}`)
- `./functions/publish.sh` will upload the contents of `./public/uw/` to (`/usat-storytelling/grid/{BUCKET}/uw/`). This should only ever include one (and only one) UW response.

!!!caution

    If you are going to deploy or publish from your local machine, be sure to set the TARGET to `dev`, `preprod` or `production` in your environment. This ensures you get the proper build and that linked assets have the correct URLs. For example: `CAST_PROJECT="ohio-corruption" TARGET="production" make update preview uw publish`

### Github Actions

There are two Github Action workflows:

- `deploy` is run after any merge to branch `main` and builds and deploys all assets.
- `publish` is run on a dispatch and is the root of spreadsheet publishing.

## URLS

All Cast of Characters projects are configured in Universal Web to use the following route patterns:

- DEV: dev-uw.{domain}.com/storytelling/qa/grid/{slug}/
- PREPROD: preprod-uw.{domain}.com/storytelling/qa/grid/{slug}/
- PUBLISHED: www.{domain}.com/storytelling/grid/{slug}/

_Preprod is a production build using "unpublished" versions of the content. It is for editorial partners to see their content changes. Changes to framework itself should be deployed to dev, first._

## Running from the command line

Our Github Actions use Make, so we will, too, here. A summary of the commands available:

| Command                  | Purpose                                                                                                                                                                   | `CAST_PROJECT` |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `make update`            | Pulls down the latest from the spreadsheet and processes it into the data source the app wants for the `CAST_PROJECT`.                                                    | Yes            |
| `make uw`                | Outputs a universal web response for the `CAST_PROJECT`                                                                                                                   | Yes            |
| `make build`             | Moves assets in `src/static` to public, runs all necessary build steps and generates a universal response                                                                 | -              |
| `make install`           | Runs all necessary install commands                                                                                                                                       | -              |
| `make preview`           | Generates a server-side-rendered `index.html` (with all the data from `update` in a script tag, as required by the app) suitable for local preview of the `CAST_PROJECT`. | -              |
| `make deploy-dev`        | Builds assets and sends them to `dev`                                                                                                                                     | -              |
| `make deploy-preprod`    | Builds assets and sends them to `production`                                                                                                                              | -              |
| `make deploy-production` | Same as `make deploy-preprod`                                                                                                                                             | -              |
| `make dev`               | Moves the UW response from `public/uw` to `dev-uw`                                                                                                                        | -              |
| `make preprod`           | Moves the UW response from `public/uw` to `preprod-uw`                                                                                                                    | -              |
| `make publish`           | Moves the UW response from `public/uw` to production                                                                                                                      | -              |

## Starting a new Cast of Characters project

Begin with the [starter spreadsheet](https://docs.google.com/spreadsheets/d/1_fP0XpZLVa8vcyMayrJyc9KHt1jWn3FAXFtuvZAuidM/edit#gid=967841973).

1. Duplicate it (FILE > MAKE A COPY). Make sure to "share it with the same people so that everyone in the Storytelling Studio _and_ the Google service account (`s2-apps@usat-interactive.iam.gserviceaccount.com`) have access.
2. Rename the new spreadsheet for the project.
3. Open up the App script editor (EXTENSIONS > APPS SCRIPT) and rename the title of `code.gs`. This is the text that will appear in the extensions menu for spreadsheet publishing.
4. In the apps script, there are three configuration variables near the top. Change their values to what is needed for this project: `SLUG`, `DOMAIN` and `CAST_PROJECT`.
5. Do a little pre-work on the characters tab. If the project is going to use images, maybe add a column for preview of presto images using `=PREVIEW()`.
6. This spreadsheet also previews presto articles. If there will be a recirculation link with each character, you can preview the headline and/or URL using `=ARTICLE_PREVIEW()`
7. If the project might use labels, set up a `labels` column and a validation column with the formula `=VALIDATE_LABELS(<cell>)` in it. This will trigger a message if unknown label values are used.

The final and **MOST IMPORTANT** step is adding the config values from step 4 to `settings.json` and merge into the codebase. It's not a "real" project until this happens.

## Analytics

The cast of characters framework fires its own pageviews (as opposed to deferring to UW). Based on the content protection state, CD27 is set to either `premium` or `free` (Registered-only is considered free). 

### Custom events

| Event                                        | Category                    | Action                        | Label                                    |
| -------------------------------------------- | --------------------------- | ----------------------------- | ---------------------------------------- |
| Recirc link                                  | `{internal/outbound} links` | `cast of characters recirc`   | `to: {url}`                              |
| Text search (throttled to every 1s)          | `content`                   | `filter panel`                | `Filtered by text`                       |
| Text search cleared via (X) button           | `content`                   | `filter panel`                | `Text input cleared`                     |
| Filter checked, from Filters category        | `content`                   | `filter panel`                | `Filtered by label`                      |
| Character label clicked, triggering a filter | `content`                   | `character label`             | `Filtered by label`                      |
| Section link navigation, at the top          | `navigation`                | `Cast of Characters category` | `Jump to category`                       |
| Mobile filters toggled                       | `cast of characters`        | `mobile filters`              | `open`                                   |
| Social share                                 | `Outbound links`            | `Cast of Characters share`    | `{network} share`                        |
| Social button: page URL is copied            | `content`                   | `Copy URL clicked copy`       | `{URL copied}`                           |
| End of page reached                          | `scroll tracking`           | `end of page`                 | `cast of characters ${top.cast_project}` |
| Back to top button                           | `nav`                       | `back to top`                 | `cast of characters`                     |

### Card layout events

| Event                | Category                            | Action                        | Label          |
| -------------------- | ----------------------------------- | ----------------------------- | -------------- |
A card is clicked/tapped and flipped over. | `cast of characters` | `Character card flip` | `Card back side {revealed|hidden}`
The "flip all" button is used | `cast of characters`|`flip cards global` | `all cards flipped {back|front}`
The card flip "hint" animation fires, when in view. | `scroll tracking`|`hint card seen`|`cast of characters { cast_project }, category: { cast category }`

### Roadblock events

| Event                | Category                            | Action                        | Label          |
| -------------------- | ----------------------------------- | ----------------------------- | -------------- |
| Sign in link clicked | `Cast of characters_{project slug}` | `sign in`                     | `inbound link` |
| Sign up link clicked | `Cast of characters_{project slug}` | `subscription`/`registration` | `inbound link` |

_Both the register and subscribe URLs are loaded with query params. The **sign-up** link has a `reg_source` (registration) or `gps-source` (subscriptions) param of `cast-of-characters_{project-slug}_{header|roadblock}`._
