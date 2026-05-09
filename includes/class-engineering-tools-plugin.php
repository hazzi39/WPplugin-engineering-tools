<?php
/**
 * Main plugin coordinator.
 */

declare(strict_types=1);

namespace EngineeringTools;

if (! defined('ABSPATH')) {
    exit;
}

final class Plugin
{
    private static ?self $instance = null;

    private string $pluginFile;
    private Tool_Registry $registry;
    /** @var array<string, Tool> */
    private array $queuedTools = array();

    private function __construct(string $pluginFile)
    {
        $this->pluginFile = $pluginFile;
        $this->registry = new Tool_Registry($pluginFile);
    }

    public static function instance(string $pluginFile): self
    {
        if (! self::$instance instanceof self) {
            self::$instance = new self($pluginFile);
        }

        return self::$instance;
    }

    public function boot(): void
    {
        $this->registry->discover();

        add_action('init', array($this, 'registerShortcodes'));
        add_action('wp_enqueue_scripts', array($this, 'registerAssets'), 5);
        add_action('wp_enqueue_scripts', array($this, 'enqueueAssetsForCurrentRequest'), 20);
    }

    public function registerShortcodes(): void
    {
        foreach ($this->registry->all() as $tool) {
            add_shortcode($tool->shortcode(), function (array $atts = array(), ?string $content = null, string $tag = '') use ($tool): string {
                return $this->renderTool($tool, $atts, $content, $tag);
            });
        }
    }

    public function registerAssets(): void
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

        foreach ($this->registry->all() as $tool) {
            $styleUrl = $tool->styleUrl();
            if ($styleUrl) {
                wp_register_style(
                    $this->toolStyleHandle($tool),
                    $styleUrl,
                    array('engineering-tools-shared'),
                    $this->assetVersion((string) $tool->stylePath())
                );
            }

            $scriptUrl = $tool->scriptUrl();
            if ($scriptUrl) {
                wp_register_script(
                    $this->toolScriptHandle($tool),
                    $scriptUrl,
                    array('engineering-tools-shared'),
                    $this->assetVersion((string) $tool->scriptPath()),
                    true
                );
            }
        }
    }

    public function enqueueAssetsForCurrentRequest(): void
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

    /**
     * @param array<string, mixed> $atts
     */
    private function renderTool(Tool $tool, array $atts, ?string $content, string $tag): string
    {
        $this->enqueueToolAssets($tool);

        $instanceId = wp_unique_id('et-tool-');
        $componentPath = $tool->componentPath();
        if (! file_exists($componentPath)) {
            return '';
        }

        $context = array(
            'tool' => $tool,
            'instance_id' => $instanceId,
            'atts' => $atts,
            'content' => $content,
            'tag' => $tag,
        );

        ob_start();
        include $componentPath;
        return (string) ob_get_clean();
    }

    private function enqueueToolAssets(Tool $tool): void
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

    private function assetVersion(string $path): string
    {
        if (! file_exists($path)) {
            return '1.0.0';
        }

        $modified = filemtime($path);
        return $modified ? (string) $modified : '1.0.0';
    }
}
