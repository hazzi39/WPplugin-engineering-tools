<?php
/**
 * Discovers and stores engineering tools.
 */

declare(strict_types=1);

namespace EngineeringTools;

if (! defined('ABSPATH')) {
    exit;
}

final class Tool_Registry
{
    private string $pluginFile;
    /** @var array<string, Tool> */
    private array $toolsBySlug = array();
    /** @var array<string, Tool> */
    private array $toolsByShortcode = array();

    public function __construct(string $pluginFile)
    {
        $this->pluginFile = $pluginFile;
    }

    public function discover(): void
    {
        $root = plugin_dir_path($this->pluginFile) . 'tools';
        $metadataFiles = glob($root . '/*/*/metadata.json');

        if (! is_array($metadataFiles)) {
            return;
        }

        foreach ($metadataFiles as $metadataPath) {
            $metadata = $this->loadMetadata($metadataPath);
            if (! $metadata) {
                continue;
            }

            $toolPath = dirname($metadataPath);
            $relativePath = ltrim(str_replace(plugin_dir_path($this->pluginFile), '', $toolPath), '/\\');
            $toolUrl = plugin_dir_url($this->pluginFile) . str_replace(DIRECTORY_SEPARATOR, '/', $relativePath);
            $tool = new Tool($metadata, $toolPath, untrailingslashit($toolUrl));

            $this->toolsBySlug[$tool->slug()] = $tool;
            $this->toolsByShortcode[$tool->shortcode()] = $tool;
        }
    }

    /**
     * @return array<string, mixed>|null
     */
    private function loadMetadata(string $metadataPath): ?array
    {
        if (! file_exists($metadataPath)) {
            return null;
        }

        $raw = file_get_contents($metadataPath);
        if ($raw === false) {
            return null;
        }

        $decoded = json_decode($raw, true);
        if (! is_array($decoded)) {
            return null;
        }

        $required = array('slug', 'shortcode', 'title');
        foreach ($required as $key) {
            if (empty($decoded[$key]) || ! is_string($decoded[$key])) {
                return null;
            }
        }

        return $decoded;
    }

    /**
     * @return array<string, Tool>
     */
    public function all(): array
    {
        return $this->toolsBySlug;
    }

    public function getBySlug(string $slug): ?Tool
    {
        return $this->toolsBySlug[$slug] ?? null;
    }

    public function getByShortcode(string $shortcode): ?Tool
    {
        return $this->toolsByShortcode[$shortcode] ?? null;
    }
}
