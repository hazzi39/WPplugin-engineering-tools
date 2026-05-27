<?php
/**
 * Shared UI template helpers.
 */

declare(strict_types=1);

namespace EngineeringTools;

defined('ABSPATH') || exit;

/**
 * @param array<string, mixed> $attrs
 */
function et_html_attrs(array $attrs): string
{
    $parts = array();

    foreach ($attrs as $name => $value) {
        if ($value === null || $value === false) {
            continue;
        }

        if ($value === true) {
            $parts[] = esc_attr((string) $name);
            continue;
        }

        $parts[] = sprintf('%s="%s"', esc_attr((string) $name), esc_attr((string) $value));
    }

    return implode(' ', $parts);
}

function et_card_header(string $eyebrow, string $title, string $helper = ''): string
{
    $html = '<p class="et-tool__eyebrow">' . esc_html($eyebrow) . '</p>';
    $html .= '<h3 class="et-tool__section-title">' . esc_html($title) . '</h3>';

    if ($helper !== '') {
        $html .= '<p class="et-tool__helper">' . esc_html($helper) . '</p>';
    }

    return $html;
}

/**
 * @param array<string, mixed> $inputAttrs
 */
function et_number_field(string $label, array $inputAttrs, string $unit = '', string $errorTarget = ''): string
{
    $attrs = array_merge(
        array(
            'class' => 'et-tool__input',
            'type' => 'number',
        ),
        $inputAttrs
    );

    $html = '<label class="et-tool__field">';
    $html .= '<span class="et-tool__label">' . wp_kses_post($label) . '</span>';
    $html .= '<span class="et-tool__input-wrap">';
    $html .= '<input ' . et_html_attrs($attrs) . ' />';

    if ($unit !== '') {
        $html .= '<span class="et-tool__unit">' . esc_html($unit) . '</span>';
    }

    $html .= '</span>';

    if ($errorTarget !== '') {
        $html .= '<em class="et-tool__error" data-error-for="' . esc_attr($errorTarget) . '"></em>';
    }

    $html .= '</label>';

    return $html;
}

/**
 * @param array<string, string> $options
 * @param array<string, mixed> $selectAttrs
 */
function et_select_field(string $label, array $options, $selected, array $selectAttrs, string $errorTarget = ''): string
{
    $attrs = array_merge(
        array(
            'class' => 'et-tool__input',
        ),
        $selectAttrs
    );

    $html = '<label class="et-tool__field">';
    $html .= '<span class="et-tool__label">' . wp_kses_post($label) . '</span>';
    $html .= '<span class="et-tool__input-wrap">';
    $html .= '<select ' . et_html_attrs($attrs) . '>';

    foreach ($options as $value => $optionLabel) {
        $html .= sprintf(
            '<option value="%s"%s>%s</option>',
            esc_attr((string) $value),
            selected((string) $selected, (string) $value, false),
            esc_html($optionLabel)
        );
    }

    $html .= '</select>';
    $html .= '</span>';

    if ($errorTarget !== '') {
        $html .= '<em class="et-tool__error" data-error-for="' . esc_attr($errorTarget) . '"></em>';
    }

    $html .= '</label>';

    return $html;
}

function et_metric_card(string $label, string $value = '--', string $note = '', array $attrs = array()): string
{
    $shellAttrs = array_merge(array('class' => 'et-tool__metric'), $attrs);
    $html = '<article ' . et_html_attrs($shellAttrs) . '>';
    $html .= '<span class="et-tool__metric-label">' . wp_kses_post($label) . '</span>';
    $html .= '<strong class="et-tool__metric-value">' . wp_kses_post($value) . '</strong>';

    if ($note !== '') {
        $html .= '<span class="et-tool__metric-note">' . wp_kses_post($note) . '</span>';
    }

    $html .= '</article>';
    return $html;
}

function et_status_box(string $title, string $text, string $state = 'ok', array $attrs = array()): string
{
    $shellAttrs = array_merge(
        array(
            'class' => 'et-tool__status',
            'data-state' => $state,
        ),
        $attrs
    );

    $html = '<div ' . et_html_attrs($shellAttrs) . '>';
    $html .= '<strong>' . esc_html($title) . '</strong>';
    $html .= '<p class="et-tool__helper">' . esc_html($text) . '</p>';
    $html .= '</div>';
    return $html;
}

/**
 * @param string[] $headers
 */
function et_table_open(array $headers, array $tableAttrs = array()): string
{
    $attrs = array_merge(array('class' => 'et-tool__table'), $tableAttrs);
    $html = '<div class="et-tool__table-wrap"><table ' . et_html_attrs($attrs) . '><thead><tr>';

    foreach ($headers as $header) {
        $html .= '<th>' . esc_html($header) . '</th>';
    }

    $html .= '</tr></thead>';
    return $html;
}

function et_table_close(): string
{
    return '</table></div>';
}
