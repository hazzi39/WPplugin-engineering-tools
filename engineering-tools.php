<?php
/**
 * Plugin Name: Engineering Tools
 * Description: Modular structural engineering calculators for WordPress with shortcode-based native rendering.
 * Version: 0.1.0
 * Author: hazzi39
 * Text Domain: engineering-tools
 */

declare(strict_types=1);

namespace EngineeringTools;

if (! defined('ABSPATH')) {
    exit;
}

require_once __DIR__ . '/includes/class-engineering-tools-tool.php';
require_once __DIR__ . '/includes/class-engineering-tools-tool-registry.php';
require_once __DIR__ . '/includes/class-engineering-tools-plugin.php';
require_once __DIR__ . '/includes/template-functions.php';

Plugin::instance(__FILE__)->boot();
