<?php
/**
 * Registers calculator shortcodes.
 */

declare(strict_types=1);

namespace EngineeringTools;

defined('ABSPATH') || exit;

final class Shortcodes
{
    private Tool_Registry $registry;
    private Renderer $renderer;

    public function __construct(Tool_Registry $registry, Renderer $renderer)
    {
        $this->registry = $registry;
        $this->renderer = $renderer;
    }

    public function register(): void
    {
        foreach ($this->registry->all() as $tool) {
            add_shortcode(
                $tool->shortcode(),
                function (array $atts = array(), ?string $content = null, string $tag = '') use ($tool): string {
                    return $this->renderer->renderTool($tool, $atts, $content, $tag);
                }
            );
        }
    }
}
