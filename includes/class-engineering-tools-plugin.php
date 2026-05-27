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

    private Tool_Registry $registry;
    private Assets $assets;
    private Renderer $renderer;
    private Shortcodes $shortcodes;

    private function __construct()
    {
        $this->registry = new Tool_Registry(ENGINEERING_TOOLS_FILE);
        $this->assets = new Assets($this->registry);
        $this->renderer = new Renderer($this->assets);
        $this->shortcodes = new Shortcodes($this->registry, $this->renderer);
    }

    public static function instance(): self
    {
        if (! self::$instance instanceof self) {
            self::$instance = new self();
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
            dirname(plugin_basename(ENGINEERING_TOOLS_FILE)) . '/languages'
        );
    }
}
