<?php
/**
 * Open section capacity lite calculator component.
 *
 * @var array<string, mixed> $context
 */

declare(strict_types=1);

if (! defined('ABSPATH')) {
    exit;
}

$instance_id = (string) $context['instance_id'];
$section_families = array(
    'UB'  => 'Universal Beams',
    'UC'  => 'Universal Columns',
    'PFC' => 'Parallel Flange Channels',
    'WB'  => 'Welded Beams',
    'WC'  => 'Welded Columns',
    'EA'  => 'Equal Angles',
    'UA'  => 'Unequal Angles',
);
?>
<section
  id="<?php echo esc_attr($instance_id); ?>"
  class="et-tool et-tool--open-section-capacity-lite"
  data-et-tool="open-section-capacity-lite"
  data-et-instance="<?php echo esc_attr($instance_id); ?>"
  data-tool-slug="open-section-capacity-lite"
>
  <div class="et-tool__shell et-oscl__shell">
    <article class="et-tool__card et-oscl__hero-card">
      <div class="et-tool__card-inner">
        <p class="et-tool__eyebrow">Steel Design</p>
        <h2 class="et-tool__title"><?php echo esc_html($context['tool']->title()); ?></h2>
        <p class="et-tool__lead">
          Lightweight open-section capacity checking for major-axis bending, minor-axis bending, and web shear using tabulated steel section capacities.
        </p>
      </div>
    </article>

    <div class="et-oscl__layout">
      <div class="et-oscl__left-column">
        <article class="et-tool__card">
          <div class="et-tool__card-inner">
            <?php
            echo \EngineeringTools\et_card_header(
                'Visualisation',
                'Live Section Diagram',
                'The section view, axes, dimensions, and governing action note update instantly with the selected family, designation, and applied actions.'
            );
            ?>

            <div class="et-oscl__visual-frame">
              <svg
                class="et-oscl__diagram"
                data-role="diagram"
                viewBox="0 0 420 280"
                role="img"
                aria-label="Steel section visualisation"
              ></svg>
            </div>

            <p class="et-oscl__visual-note" data-output="diagram-note">Select a section and enter valid actions to generate the live engineering visualisation.</p>
          </div>
        </article>

        <article class="et-tool__card et-oscl__result-surface">
          <div class="et-tool__card-inner">
            <?php
            echo \EngineeringTools\et_card_header(
                'Results',
                'Governing Utilisation',
                'The governing ratio is taken as the maximum of the active major-axis, minor-axis, and shear demand checks.'
            );
            ?>

            <div class="et-oscl__status-pill" data-output="status-pill">PENDING</div>

            <div class="et-oscl__hero-metric" data-tone="idle" data-role="hero-panel">
              <span class="et-oscl__hero-label">ηgov</span>
              <strong class="et-oscl__hero-value" data-output="governing-utilisation">--</strong>
              <p class="et-oscl__hero-note" data-output="hero-note">Results will appear when all required inputs are valid.</p>
            </div>

            <div class="et-tool__metric-grid et-oscl__metric-grid">
              <?php
              echo \EngineeringTools\et_metric_card('Status', '<span data-output="status-text">--</span>', 'PASS when ηgov ≤ 1.0');
              echo \EngineeringTools\et_metric_card('Governing Check', '<span data-output="governing-case">--</span>', 'Critical utilisation mode');
              echo \EngineeringTools\et_metric_card('Reserve Index', '<span data-output="reserve-index">--</span>', '1.0 - ηgov');
              echo \EngineeringTools\et_metric_card('Selected Section', '<span data-output="designation">--</span>', 'Current designation');
              ?>
            </div>

            <div class="et-oscl__check-grid" data-role="check-grid">
              <div class="et-oscl__check-row">
                <div>
                  <strong>Awaiting validation</strong>
                  <span>Input a valid section and action set to evaluate utilisation.</span>
                </div>
                <em>--</em>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div class="et-oscl__right-column">
        <article class="et-tool__card">
          <div class="et-tool__card-inner">
            <?php
            echo \EngineeringTools\et_card_header(
                'Inputs',
                'Section Selection',
                'Choose the steel section family and designation from the lite table derived from the current repository version.'
            );
            ?>

            <div class="et-tool__fields">
              <?php
              echo \EngineeringTools\et_select_field(
                  'Section family',
                  $section_families,
                  'UB',
                  array(
                      'data-field' => 'family',
                  ),
                  'family'
              );
              ?>

              <label class="et-tool__field">
                <span class="et-tool__label">Designation</span>
                <span class="et-tool__input-wrap">
                  <select class="et-tool__input" data-field="designation"></select>
                </span>
                <em class="et-tool__error" data-error-for="designation"></em>
              </label>
            </div>
          </div>
        </article>

        <article class="et-tool__card">
          <div class="et-tool__card-inner">
            <?php
            echo \EngineeringTools\et_card_header(
                'Actions',
                'Applied Design Loads',
                'Demand inputs are checked directly against the selected section capacities for major-axis bending, minor-axis bending, and web shear.'
            );
            ?>

            <div class="et-tool__fields">
              <?php
              echo \EngineeringTools\et_number_field(
                  'Major-axis moment, M*x',
                  array(
                      'min'        => '0',
                      'max'        => '20000',
                      'step'       => '0.1',
                      'value'      => '10',
                      'data-field' => 'moment-x',
                      'inputmode'  => 'decimal',
                  ),
                  'kN.m',
                  'moment-x'
              );
              echo \EngineeringTools\et_number_field(
                  'Minor-axis moment, M*y',
                  array(
                      'min'        => '0',
                      'max'        => '20000',
                      'step'       => '0.1',
                      'value'      => '0',
                      'data-field' => 'moment-y',
                      'inputmode'  => 'decimal',
                  ),
                  'kN.m',
                  'moment-y'
              );
              echo \EngineeringTools\et_number_field(
                  'Design shear, V*',
                  array(
                      'min'        => '0',
                      'max'        => '30000',
                      'step'       => '0.1',
                      'value'      => '8',
                      'data-field' => 'shear',
                      'inputmode'  => 'decimal',
                  ),
                  'kN',
                  'shear'
              );
              ?>
            </div>

            <div class="et-tool__actions">
              <button type="button" class="et-tool__button et-tool__button--secondary" data-action="reset-inputs">Reset Inputs</button>
            </div>
          </div>
        </article>

        <article class="et-tool__card">
          <div class="et-tool__card-inner">
            <?php
            echo \EngineeringTools\et_card_header(
                'Properties',
                'Section Reference Values',
                'The lite tool exposes the core descriptor values and capacities needed to review the current open-section check.'
            );
            ?>

            <div class="et-tool__metric-grid et-oscl__metric-grid">
              <?php
              echo \EngineeringTools\et_metric_card('Family', '<span data-output="section-family">--</span>', 'Section group');
              echo \EngineeringTools\et_metric_card('Nominal depth', '<span data-output="depth">--</span>', 'mm');
              echo \EngineeringTools\et_metric_card('Estimated width', '<span data-output="width">--</span>', 'mm');
              echo \EngineeringTools\et_metric_card('Section mass', '<span data-output="mass">--</span>', 'kg/m when available');
              echo \EngineeringTools\et_metric_card('ϕMsx', '<span data-output="msx">--</span>', 'Major-axis capacity');
              echo \EngineeringTools\et_metric_card('ϕMsy', '<span data-output="msy">--</span>', 'Minor-axis capacity');
              echo \EngineeringTools\et_metric_card('ϕVv', '<span data-output="vv">--</span>', 'Web shear capacity');
              echo \EngineeringTools\et_metric_card('Section note', '<span data-output="descriptor-note">--</span>', 'Descriptor interpretation');
              ?>
            </div>
          </div>
        </article>

        <article class="et-tool__card">
          <div class="et-tool__card-inner">
            <details class="et-oscl__equations">
              <summary class="et-oscl__equation-summary">
                <span>Implemented Check Equations</span>
              </summary>
              <div class="et-oscl__equation-stack">
                <div class="et-oscl__equation-card">
                  <div class="et-oscl__math" data-role="equation-primary"></div>
                </div>
                <div class="et-oscl__equation-card">
                  <div class="et-oscl__math" data-role="equation-secondary"></div>
                </div>
              </div>
            </details>
          </div>
        </article>
      </div>
    </div>
  </div>
</section>
