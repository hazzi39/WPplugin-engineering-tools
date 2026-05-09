<?php
/**
 * Timber column calculator component.
 *
 * @var array<string, mixed> $context
 */

declare(strict_types=1);

if (! defined('ABSPATH')) {
    exit;
}

$instanceId = (string) $context['instance_id'];
?>
<section
  id="<?php echo esc_attr($instanceId); ?>"
  class="et-tool et-tool--timber-column"
  data-tool-slug="timber-column-calculator"
  data-instance-id="<?php echo esc_attr($instanceId); ?>"
>
  <div class="et-tool__shell">
    <article class="et-tool__card">
      <div class="et-tool__card-inner">
        <p class="et-tool__eyebrow">Timber Design</p>
        <h2 class="et-tool__title"><?php echo esc_html($context['tool']->title()); ?></h2>
        <p class="et-tool__lead">
          Native shortcode-rendered timber column geometry checks for WordPress. This module is intentionally simple, fast,
          and reusable so the same architecture can scale to steel, concrete, weld groups, footing checks, and utilities.
        </p>
      </div>
    </article>

    <div class="et-tool__grid et-tool__grid--two">
      <article class="et-tool__card">
        <div class="et-tool__card-inner">
          <?php
          echo \EngineeringTools\et_card_header(
              'Inputs',
              'Section Geometry',
              'Enter the timber member dimensions to calculate section area, gross volume, and slenderness indicator values.'
          );
          ?>

          <div class="et-tool__fields">
            <?php
            echo \EngineeringTools\et_number_field('Width', array('min' => '1', 'step' => '1', 'value' => '90', 'data-field' => 'width'), 'mm');
            echo \EngineeringTools\et_number_field('Depth', array('min' => '1', 'step' => '1', 'value' => '90', 'data-field' => 'depth'), 'mm');
            echo \EngineeringTools\et_number_field('Length', array('min' => '1', 'step' => '1', 'value' => '2400', 'data-field' => 'length'), 'mm');
            ?>
          </div>

          <div class="et-tool__actions">
            <button type="button" class="et-tool__button" data-action="save-result">Save Result</button>
            <button type="button" class="et-tool__button et-tool__button--secondary" data-action="clear-saved">Clear Saved</button>
          </div>
        </div>
      </article>

      <article class="et-tool__card">
        <div class="et-tool__card-inner">
          <?php echo \EngineeringTools\et_card_header('Outputs', 'Calculated Properties'); ?>
          <div class="et-tool__status" data-role="status" data-state="ok">
            <strong data-role="status-title">Ready to calculate</strong>
            <p class="et-tool__helper" data-role="status-text">Adjust the inputs to update the geometry results instantly.</p>
          </div>

          <div class="et-tool__metric-grid" style="margin-top: 14px;">
            <?php
            echo \EngineeringTools\et_metric_card('Section Area', '<span data-output="area">--</span>', 'mm&#178;');
            echo \EngineeringTools\et_metric_card('Gross Volume', '<span data-output="volume">--</span>', 'm&#179;');
            echo \EngineeringTools\et_metric_card('Aspect Ratio', '<span data-output="aspect-ratio">--</span>', 'depth / width');
            echo \EngineeringTools\et_metric_card('Slenderness Indicator', '<span data-output="slenderness">--</span>', 'length / min(b, d)');
            ?>
          </div>
        </div>
      </article>
    </div>

    <article class="et-tool__card">
      <div class="et-tool__card-inner">
        <?php echo \EngineeringTools\et_card_header('Saved Results', 'Session Snapshots'); ?>
        <?php echo \EngineeringTools\et_table_open(array('Saved', 'Width', 'Depth', 'Length', 'Area', 'Volume', 'Slenderness')); ?>
          <tbody data-role="saved-results">
            <tr>
              <td class="et-tool__empty" colspan="7">No results saved yet.</td>
            </tr>
          </tbody>
        <?php echo \EngineeringTools\et_table_close(); ?>
      </div>
    </article>
  </div>
</section>
