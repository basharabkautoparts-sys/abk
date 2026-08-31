# Vehicle-brand logos

The four manufacturer logos in this directory are used **nominatively** — to
name the brands A.B.K. Auto Parts supplies genuine parts for. They do not imply
endorsement by, or affiliation with, any of these companies.

Each file was taken from Wikimedia Commons, where all four are in the public
domain: they consist only of simple geometric shapes and text, which does not
meet the threshold of originality required for copyright protection. All four
remain **registered trademarks** of their respective owners.

| File | Source | Licence |
| --- | --- | --- |
| `toyota.svg` | [File:Toyota carlogo.svg](https://commons.wikimedia.org/wiki/File:Toyota_carlogo.svg) | Public domain (below threshold of originality); trademark of Toyota Motor Corporation |
| `isuzu.svg` | [File:Isuzu.svg](https://commons.wikimedia.org/wiki/File:Isuzu.svg) | Public domain (below threshold of originality); trademark of Isuzu Motors Ltd. |
| `nissan.svg` | [File:Nissan 2020 logo.svg](https://commons.wikimedia.org/wiki/File:Nissan_2020_logo.svg) | Public domain (below threshold of originality); trademark of Nissan Motor Co., Ltd. |
| `mitsubishi.svg` | [File:Mitsubishi logo.svg](https://commons.wikimedia.org/wiki/File:Mitsubishi_logo.svg) | Public domain (below threshold of originality); trademark of Mitsubishi |

Retrieved 1 September 2026.

## Adding a brand

`src/lib/components/BrandMark.svelte` maps a brand **slug** to a file here. A
brand added in `/admin/brands` with no entry in that map renders its name as a
wordmark instead — nothing breaks, and the row stays even. To give it real
artwork, drop the SVG in this directory, add a row to `LOGOS`, record its source
above, and set `hasWordmark` to whether the artwork already spells the name out
(if it does, the card will not print the name underneath).
