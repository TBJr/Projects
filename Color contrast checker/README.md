# Color Contrast Checker

Compare a foreground and background color, review their contrast ratio, and preview the pair on text and button samples. Open `index.html` directly in a browser. The project has no build step, server, or external dependency.

Use the color pickers or enter `#RGB` or `#RRGGBB` values. Swap the colors or try a preset pair. The checker shows WCAG 2.2 results for normal text, large text, and essential interface details. A ratio is compared at full precision; the displayed number is rounded down to two decimal places so a failing pair never appears to reach a threshold.

The checks use these minimum ratios:

| Use | AA | AAA |
| --- | ---: | ---: |
| Normal text | 4.5:1 | 7:1 |
| Large text | 3:1 | 4.5:1 |
| Essential non-text interface details | 3:1 | — |

Large text means at least 24 CSS pixels at regular weight or about 18.7 CSS pixels at bold weight. A result applies to the two selected colors, not an entire page or every state of an interface. Check each meaningful color pair separately.

The formula and thresholds follow [WCAG 2.2](https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio), [Contrast (Minimum)](https://www.w3.org/TR/WCAG22/#contrast-minimum), [Contrast (Enhanced)](https://www.w3.org/TR/WCAG22/#contrast-enhanced), and [Non-text Contrast](https://www.w3.org/TR/WCAG22/#non-text-contrast).
