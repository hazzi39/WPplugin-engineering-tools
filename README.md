# Engineering Tools Plugin

This plugin scaffold is designed for a structural engineering tools website that needs:

- native WordPress shortcodes
- PMPro-friendly protected pages
- modular calculators
- conditional asset loading
- reusable UI building blocks
- low-dependency front-end code

## Current structure

```text
engineering-tools/
|-- engineering-tools.php
|-- assets/
|   |-- css/
|   |   `-- engineering-tools.css
|   `-- js/
|       `-- engineering-tools.js
|-- includes/
|   |-- class-engineering-tools-plugin.php
|   |-- class-engineering-tools-tool-registry.php
|   |-- class-engineering-tools-tool.php
|   `-- template-functions.php
`-- tools/
    |-- concrete/
    |   `-- rc-column-designer/
    |       |-- app.js
    |       |-- component.php
    |       |-- metadata.json
    |       `-- style.css
    |-- steel/
    |   `-- steel-development-length/
    |       |-- app.js
    |       |-- component.php
    |       |-- metadata.json
    |       `-- style.css
    `-- timber/
        `-- timber-column-calculator/
            |-- app.js
            |-- component.php
            |-- metadata.json
            `-- style.css
```

## How it works

1. The plugin scans `tools/*/*/metadata.json`.
2. Each discovered tool is registered as a shortcode automatically.
3. Shared assets are registered once.
4. Tool-specific assets are only enqueued when the shortcode exists on the current singular page or when the shortcode renders.
5. Tools that declare `equation-rendering` automatically load KaTeX only when required.
6. Calculators render natively inside WordPress content, so PMPro restrictions flow through the protected page automatically.

## Current shortcodes

```text
[f14_timber_column_calculator]
[rc_column_designer]
[rc_moment_capacity]
[steel_development_length]
```

## Shared helper layer

`includes/template-functions.php` now provides reusable rendering helpers for:

- number input fields
- select fields
- metric cards
- status boxes
- result tables

This reduces repeated calculator markup and gives future tools a more consistent implementation path.

## Adding a new calculator

Create a new folder like:

```text
tools/
`-- steel/
    `-- weld-group/
        |-- component.php
        |-- style.css
        |-- app.js
        `-- metadata.json
```

Example `metadata.json`:

```json
{
  "slug": "weld-group",
  "shortcode": "weld_group_calculator",
  "title": "Weld Group Calculator",
  "category": "steel",
  "description": "Weld group capacity and eccentric load checks.",
  "version": "1.0.0",
  "assets": {
    "style": "style.css",
    "script": "app.js"
  },
  "supports": ["saved-results", "equation-rendering", "audit-trail"]
}
```

## Integration notes

- Keep calculator-specific CSS inside each tool folder.
- Use shared UI helpers wherever possible instead of duplicating field and table markup.
- Keep tool JavaScript vanilla and scoped to the calculator root element.
- Escape output in `component.php` and sanitize any future server-side settings before storage.
- Prefer data attributes and root-scoped selectors for multi-tool compatibility on larger WordPress pages.

## Current status

1. The timber column calculator is fully modular and uses the shared helper layer.
2. The RC column designer is now migrated into `tools/concrete/rc-column-designer/` as a native shortcode tool.
3. Shared PHP helper functions now cover reusable field, metric, status, and table rendering.
4. A steel development length calculator is now available under `tools/steel/steel-development-length/` with development, lap splice, bundle, and hook checks.
5. A premium RC moment capacity calculator is now available under `tools/concrete/rc-moment-capacity/` with live section visualisation, saved snapshots, and KaTeX equation rendering.

## Recommended next steps

1. Refactor the RC column component further so more of its repeated field groups are generated from helper-driven arrays.
2. Add optional PMPro-aware teaser messaging for locked tool landing pages if you want preview content outside protected posts.
3. Add export modules under `includes/` for PDF, print, audit trail, and saved sessions.
