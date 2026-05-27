<?php
/**
 * Sanitizes shortcode attributes and renders tool templates.
 */

declare(strict_types=1);

namespace EngineeringTools;

defined('ABSPATH') || exit;

final class Renderer
{
    private Assets $assets;

    public function __construct(Assets $assets)
    {
        $this->assets = $assets;
    }

    /**
     * @param array<string, mixed> $atts
     */
    public function renderTool(Tool $tool, array $atts, ?string $content, string $tag): string
    {
        $this->assets->enqueueToolAssets($tool);

        $component_path = $tool->componentPath();
        if (! file_exists($component_path)) {
            return '';
        }

        $context = array(
            'tool' => $tool,
            'instance_id' => sanitize_html_class(wp_unique_id('et-tool-')),
            'atts' => $this->sanitizeShortcodeAtts($atts),
            'content' => is_string($content) ? wp_kses_post($content) : null,
            'tag' => sanitize_key($tag),
        );

        ob_start();
        include $component_path;

        return (string) ob_get_clean();
    }

    /**
     * @param array<string, mixed> $atts
     * @return array<string, mixed>
     */
    private function sanitizeShortcodeAtts(array $atts): array
    {
        $sanitized = array();

        foreach ($atts as $key => $value) {
            $clean_key = sanitize_key((string) $key);

            if (is_array($value)) {
                $sanitized[$clean_key] = array_map(
                    static function ($item) {
                        return is_scalar($item) ? sanitize_text_field(wp_unslash((string) $item)) : '';
                    },
                    $value
                );
                continue;
            }

            if (is_scalar($value)) {
                $sanitized[$clean_key] = sanitize_text_field(wp_unslash((string) $value));
            }
        }

        return $sanitized;
    }
}
