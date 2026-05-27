<?php
/**
 * Registers and enqueues shared and tool-specific front-end assets.
 */

declare(strict_types=1);

namespace EngineeringTools;

defined('ABSPATH') || exit;

final class Assets
{
    private string $pluginFile;
    private Tool_Registry $registry;

    /** @var array<string, Tool> */
    private array $queuedTools = array();

    public function __construct(string $pluginFile, Tool_Registry $registry)
    {
        $this->pluginFile = $pluginFile;
        $this->registry = $registry;
    }

    public function register(): void
    {
        wp_register_style(
            'engineering-tools-katex',
            'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css',
            array(),
            '0.16.11'
        );

        wp_register_style(
            'engineering-tools-shared',
            plugin_dir_url($this->pluginFile) . 'assets/css/engineering-tools.css',
            array(),
            $this->assetVersion(plugin_dir_path($this->pluginFile) . 'assets/css/engineering-tools.css')
        );

        wp_register_script(
            'engineering-tools-shared',
            plugin_dir_url($this->pluginFile) . 'assets/js/engineering-tools.js',
            array(),
            $this->assetVersion(plugin_dir_path($this->pluginFile) . 'assets/js/engineering-tools.js'),
            true
        );

        wp_register_script(
            'engineering-tools-katex',
            'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js',
            array(),
            '0.16.11',
            true
        );

        wp_register_script(
            'engineering-tools-docx',
            'https://cdn.jsdelivr.net/npm/docx@9.6.1/dist/index.iife.js',
            array(),
            '9.6.1',
            true
        );

        foreach ($this->registry->all() as $tool) {
            if ($tool->styleUrl()) {
                wp_register_style(
                    $this->toolStyleHandle($tool),
                    $tool->styleUrl(),
                    array('engineering-tools-shared'),
                    $this->assetVersion((string) $tool->stylePath(), $tool->version())
                );
            }

            if ($tool->scriptUrl()) {
                wp_register_script(
                    $this->toolScriptHandle($tool),
                    $tool->scriptUrl(),
                    $this->toolScriptDependencies($tool),
                    $this->assetVersion((string) $tool->scriptPath(), $tool->version()),
                    true
                );
            }
        }
    }

    public function enqueueForCurrentRequest(): void
    {
        if (! is_singular()) {
            return;
        }

        $post = get_queried_object();
        if (! $post || empty($post->post_content) || ! is_string($post->post_content)) {
            return;
        }

        foreach ($this->registry->all() as $tool) {
            if (has_shortcode($post->post_content, $tool->shortcode())) {
                $this->enqueueToolAssets($tool);
            }
        }
    }

    public function enqueueToolAssets(Tool $tool): void
    {
        $this->queuedTools[$tool->slug()] = $tool;

        wp_enqueue_style('engineering-tools-shared');

        if ($tool->hasSupport('equation-rendering')) {
            wp_enqueue_style('engineering-tools-katex');
        }

        if ($tool->styleUrl()) {
            wp_enqueue_style($this->toolStyleHandle($tool));
        }

        if ($tool->hasSupport('equation-rendering')) {
            wp_enqueue_script('engineering-tools-katex');
        }

        if ($tool->hasSupport('word-export')) {
            wp_enqueue_script('engineering-tools-docx');
        }

        wp_enqueue_script('engineering-tools-shared');

        if ($tool->scriptUrl()) {
            wp_enqueue_script($this->toolScriptHandle($tool));
        }
    }

    private function toolStyleHandle(Tool $tool): string
    {
        return 'engineering-tools-style-' . $tool->slug();
    }

    private function toolScriptHandle(Tool $tool): string
    {
        return 'engineering-tools-script-' . $tool->slug();
    }

    /**
     * @return string[]
     */
    private function toolScriptDependencies(Tool $tool): array
    {
        $dependencies = array('engineering-tools-shared');

        if ($tool->hasSupport('equation-rendering')) {
            $dependencies[] = 'engineering-tools-katex';
        }

        if ($tool->hasSupport('word-export')) {
            $dependencies[] = 'engineering-tools-docx';
        }

        return $dependencies;
    }

    private function assetVersion(string $path, string $fallback = '0.2.0'): string
    {
        if (! file_exists($path)) {
            return $fallback;
        }

        $modified = filemtime($path);

        return $modified ? (string) $modified : $fallback;
    }
}
