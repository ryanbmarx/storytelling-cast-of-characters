# Organizing characters: Bringing clarity to the complex

## Sorting

The first option to organize characters on the page is through sorting. Characters can be sorted alphabetically based on the value of any column, even columns that will not display. If the sorting column is determined to be a number, such as a ranking or a number grade, then sorting will be done numerically. Sorting on a column that contains a mixx of numbers and letters (such as a serial number) might not yield the results you want since numbers are sorted "wierdly" when treated as letters.

A common pattern to follow is to have a seperate column in the `characters` tab, perhaps named `sort_name` which includes the characters `name` but in **{lastname}, {firstname}** format. Readers will see the characters' names **{firstname}, {lastname}**, but will be ordered by last name.

Sorting is configured in the `top` spreadsheet tab. Left unconfigured, the order they appear in the `characters` spreadsheet tab will be the order they appear on the page. This is your best bet if you require any sort of manual/custom ordering.

Key | Purpose | Default | Required 
---|---|---|---
`character_sort_by` | Set the column by which all characters will be sorted. | None. Default sort will be spreadsheet row order | No
`character_sort_direction` | Can be `ascending` (A to Z, 0 to 10) or `descending` (Z to A, 10 to 0) | `ascending` | No


## Categories are exclusive

Characters on the page can be divided into groups, called categories. Each category is displayed one after another. If you have a cast of politicians, you might want categories for senators, members of congress, and White House operatives. A character can only be in one category. A politician can be a senator _or_ a member of Congress, but not both.

**Categories are not required.** If you don't need to present the characters in discreet groups, then don't use categories.

Define categories in the `categories` tab of the spreadsheet. The `id` is used in `characters` tab to assign a character to a category. Optionally, a layout for each category can be selected.

Column | Purpose | Required
---|---|---
`id` | A unique name for the category, with only lowercase letters and no punctuation other than hyphens | Yes
`name` | How the category name will display on the page | Yes
`description` | A brief description of the category. A short sentence is best. | No
`character_layout` | Currently, only three layouts are supported: `default`, `medium` and `wide`. | No

### Adding characters to categories

In the characters' `category`, select or type the category's `id` value. One category per character.

## Labels are not exclusive

![An example character with three labels](img/labels-example.png#25#float-right)

Sometimes other, less concrete, connections or groupings exists in a cast. These can be highlighted with labels.

In the previous example, the political characters might be Democrats, Republicans or belong to another party. They might be new to federal politics or veterans. They might have ties to Lobbyist A or Lobbyist B. 

These distinctions are _not_ exclusive. A character could be a Democrat _and_ have ties to Lobbyist A. Or just be a Democrat. 

Labels appear as boxed text underneath a character and do not affect placement on the page. 

**Labels also are optional.** When using them, a series of checkboxes — one for each label — will appear on the page. These allow readers to toggle the visibility of characters, to only show the labels they wish to see. The labels themselves also are actionable. Tapping one will trigger a filter as if the checkbox were checked.

Column | Purpose | Required
---|---|---
`id` | The unique identifier for this label. Must be all lowercase and use no punctuation but hyphens. | Yes.
`name` | The human-readable label name. Should only be a couple words at most. | Yes
`description` | A secondary text to further explain the label's meaning. Should be no more a sentence. | No.

### Assigning labels to characters

Every label needs to be defined in the `labels` spreadsheet tab with at least an `id` and a `name`, otherwise they will be omitted. In the `labels` column in the `characters` spreadsheet tab, add all the labels you need in a list, separated by commas. Continuing with our political example, if a character is a veteran Democrat with ties to lobbyist B, then you would put the label IDs into the `labels` column of that spreadsheet row: `democrat, lobbyist-b, veteran`. 

The order of the labels in the list does not matter, but they must match the IDs exactly. Spaces between the labels/list items is optional.

## Full-text searching

A free-text search bar can be added to look for individual names or other key words. This is configured in the `columns` spreadsheet tab. Check that documentation for more information.