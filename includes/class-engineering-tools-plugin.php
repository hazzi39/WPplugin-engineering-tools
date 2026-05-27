<?php
/**
 * Main plugin coordinator.
 */

declare(strict_types=1);

namespace EngineeringTools;

defined('ABSPATH') || exit;

final class Plugin
{
    private static ?self $instance = null;

    private string $pluginFile;
    private Tool_Registry $registry;
    private Assets $assets;
    private Renderer $renderer;
    private Shortcodes $shortcodes;

    private function __construct(string $pluginFile)
    {
        $this->pluginFile = $pluginFile;
        $this->registry = new Tool_Registry($pluginFile);
        $this->assets = new Assets($pluginFile, $this->registry);
        $this->renderer = new Renderer($this->assets);
        $this->shortcodes = new Shortcodes($this->registry, $this->renderer);
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

        add_action('init', array($this, 'loadTextDomain'));
        add_action('init', array($this->shortcodes, 'register'));
        add_action('wp_enqueue_scripts', array($this->assets, 'register'), 5);
        add_action('wp_enqueue_scripts', array($this->assets, 'enqueueForCurrentRequest'), 20);
    }

    public function loadTextDomain(): void
    {
        load_plugin_textdomain(
            'engineering-tools',
            false,
            dirname(plugin_basename($this->pluginFile)) . '/languages'
        );
    }
}
