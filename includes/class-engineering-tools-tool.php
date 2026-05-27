<?php
/**
 * Tool definition value object.
 */

declare(strict_types=1);

namespace EngineeringTools;

defined('ABSPATH') || exit;

final class Tool
{
    private string $slug;
    private string $shortcode;
    private string $title;
    private string $category;
    private string $description;
    private string $version;
    private string $basePath;
    private string $baseUrl;
    private string $componentPath;
    private ?string $stylePath;
    private ?string $styleRelativePath;
    private ?string $scriptPath;
    private ?string $scriptRelativePath;
    private array $supports;

    public function __construct(array $metadata, string $basePath, string $baseUrl)
    {
        $this->slug = (string) $metadata['slug'];
        $this->shortcode = (string) $metadata['shortcode'];
        $this->title = (string) $metadata['title'];
        $this->category = (string) ($metadata['category'] ?? 'general');
        $this->description = (string) ($metadata['description'] ?? '');
        $this->version = (string) ($metadata['version'] ?? '1.0.0');
        $this->basePath = $basePath;
        $this->baseUrl = $baseUrl;
        $this->componentPath = $basePath . '/component.php';
        $this->styleRelativePath = ! empty($metadata['assets']['style']) ? ltrim((string) $metadata['assets']['style'], '/') : null;
        $this->scriptRelativePath = ! empty($metadata['assets']['script']) ? ltrim((string) $metadata['assets']['script'], '/') : null;
        $this->stylePath = $this->styleRelativePath ? $basePath . '/' . $this->styleRelativePath : null;
        $this->scriptPath = $this->scriptRelativePath ? $basePath . '/' . $this->scriptRelativePath : null;
        $this->supports = is_array($metadata['supports'] ?? null) ? $metadata['supports'] : array();
    }

    public function slug(): string
    {
        return $this->slug;
    }

    public function shortcode(): string
    {
        return $this->shortcode;
    }

    public function title(): string
    {
        return $this->title;
    }

    public function category(): string
    {
        return $this->category;
    }

    public function description(): string
    {
        return $this->description;
    }

    public function version(): string
    {
        return $this->version;
    }

    public function basePath(): string
    {
        return $this->basePath;
    }

    public function baseUrl(): string
    {
        return $this->baseUrl;
    }

    public function componentPath(): string
    {
        return $this->componentPath;
    }

    public function stylePath(): ?string
    {
        return $this->stylePath;
    }

    public function scriptPath(): ?string
    {
        return $this->scriptPath;
    }

    public function supports(): array
    {
        return $this->supports;
    }

    public function hasSupport(string $feature): bool
    {
        return in_array($feature, $this->supports, true);
    }

    public function styleUrl(): ?string
    {
        if (! $this->stylePath || ! file_exists($this->stylePath)) {
            return null;
        }

        return $this->baseUrl . '/' . str_replace(DIRECTORY_SEPARATOR, '/', $this->styleRelativePath ?? '');
    }

    public function scriptUrl(): ?string
    {
        if (! $this->scriptPath || ! file_exists($this->scriptPath)) {
            return null;
        }

        return $this->baseUrl . '/' . str_replace(DIRECTORY_SEPARATOR, '/', $this->scriptRelativePath ?? '');
    }
}
