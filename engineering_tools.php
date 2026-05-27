<?php
/**
 * Plugin Name: Engineering Tools
 * Description: Private structural engineering calculators for WordPress with shortcode-based native rendering.
 * Version: 0.2.0
 * Author: hazzi39
 * Text Domain: engineering-tools
 * Domain Path: /languages
 * Requires at least: 6.2
 * Requires PHP: 8.1
 */

declare(strict_types=1);

namespace EngineeringTools;

defined('ABSPATH') || exit;

define(__NAMESPACE__ . '\ENGINEERING_TOOLS_VERSION', '0.2.0');
define(__NAMESPACE__ . '\ENGINEERING_TOOLS_FILE', __FILE__);
define(__NAMESPACE__ . '\ENGINEERING_TOOLS_PATH', __DIR__ . '/');
define(__NAMESPACE__ . '\ENGINEERING_TOOLS_URL', plugin_dir_url(__FILE__));

require_once ENGINEERING_TOOLS_PATH . 'includes/class-engineering-tools-tool.php';
require_once ENGINEERING_TOOLS_PATH . 'includes/class-engineering-tools-tool-registry.php';
require_once ENGINEERING_TOOLS_PATH . 'includes/class-engineering-tools-assets.php';
require_once ENGINEERING_TOOLS_PATH . 'includes/class-engineering-tools-renderer.php';
require_once ENGINEERING_TOOLS_PATH . 'includes/class-engineering-tools-shortcodes.php';
require_once ENGINEERING_TOOLS_PATH . 'includes/class-engineering-tools-plugin.php';
require_once ENGINEERING_TOOLS_PATH . 'includes/template-functions.php';

Plugin::instance()->boot();
