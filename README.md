# Engineering Tools

Private WordPress plugin for structural engineering calculators and utility tools.

## Plugin Location

Deploy this folder to:

```text
wp-content/plugins/engineering_tools/
```

Main plugin bootstrap:

```text
engineering_tools.php
```

## Structure

```text
engineering_tools/
|-- engineering_tools.php
|-- admin/
|-- public/
|-- includes/
|-- assets/
|   |-- css/
|   |-- js/
|-- tools/
|   |-- concrete/
|   |-- steel/
|   `-- timber/
|-- templates/
|-- languages/
|-- README.md
|-- CHANGELOG.md
`-- .gitignore
```

## How It Works

1. The plugin scans `tools/*/*/metadata.json`.
2. Each discovered tool is registered as a shortcode automatically.
3. Shared assets are registered once and tool assets are enqueued only when needed.
4. Tool templates render through PHP components with a sanitized context array.
5. Optional KaTeX and Word export libraries are only loaded for tools that declare those supports.

## Development Workflow

1. Make changes locally inside the `engineering_tools/` folder.
2. Commit the plugin folder to a private GitHub repository.
3. Deploy the folder contents to `wp-content/plugins/engineering_tools/`.
4. Activate or update the plugin in WordPress Admin.

## Installation

1. Copy the `engineering_tools/` folder into `wp-content/plugins/`.
2. In WordPress Admin, go to `Plugins`.
3. Activate `Engineering Tools`.

## Deployment To Hostinger

1. In your private repo, keep the plugin root as `engineering_tools/`.
2. Upload the folder to `public_html/wp-content/plugins/engineering_tools/`.
3. Replace the existing plugin files carefully, or remove the old hyphenated plugin folder after confirming the new plugin is active.
4. Clear any caching and re-test the tool pages.

## Notes

- Keep shortcode names stable to avoid breaking existing WordPress pages.
- Keep tool-specific CSS and JS inside each tool folder unless there is a clear reason to extract shared logic.
- Sanitize shortcode attributes and escape all rendered output.
- Review generated engineering reports before issue to clients or construction.
