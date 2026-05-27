<?php
/**
 * Steel closed section capacities lite calculator component.
 *
 * @var array<string, mixed> $context
 */

declare(strict_types=1);

if (! defined('ABSPATH')) {
    exit;
}

$instance_id = (string) $context['instance_id'];
$report_settings = shortcode_atts(
    array(
        'company'        => 'Consulting Engineer',
        'project'        => 'Steel Closed Section Capacity Verification',
        'project_number' => 'SCS-001',
        'client'         => 'Client',
        'prepared_by'    => 'Structural Engineer',
        'checked_by'     => 'Design Reviewer',
        'issue_purpose'  => 'Design verification',
        'disclaimer'     => 'This calculation sheet is generated from the current tool state and should be reviewed by a qualified engineer before issue.',
    ),
    is_array($context['atts']) ? $context['atts'] : array(),
    (string) ($context['tag'] ?? 'steel_closed_section_capacities_lite')
);

$family_options = array(
    'CHS' => 'CHS',
    'SHS' => 'SHS',
    'RHS' => 'RHS',
);

$grade_options = array(
    'C250' => 'C250',
    'C350' => 'C350',
    'C450' => 'C450',
);
?>
<section
  id="<?php echo esc_attr($instance_id); ?>"
  class="et-tool et-tool--steel-closed-section-capacities-lite"
  data-et-tool="steel-closed-section-capacities-lite"
  data-et-instance="<?php echo esc_attr($instance_id); ?>"
  data-tool-slug="steel-closed-section-capacities-lite"
  data-report-company="<?php echo esc_attr((string) $report_settings['company']); ?>"
  data-report-project="<?php echo esc_attr((string) $report_settings['project']); ?>"
  data-report-project-number="<?php echo esc_attr((string) $report_settings['project_number']); ?>"
  data-report-client="<?php echo esc_attr((string) $report_settings['client']); ?>"
  data-report-prepared-by="<?php echo esc_attr((string) $report_settings['prepared_by']); ?>"
  data-report-checked-by="<?php echo esc_attr((string) $report_settings['checked_by']); ?>"
  data-report-issue-purpose="<?php echo esc_attr((string) $report_settings['issue_purpose']); ?>"
  data-report-disclaimer="<?php echo esc_attr((string) $report_settings['disclaimer']); ?>"
>
  <div class="et-tool__shell et-scsl__shell">
    <header class="et-tool__card et-scsl__header-card">
      <div class="et-tool__card-inner et-scsl__header-inner">
        <p class="et-tool__eyebrow">Steel Closed Sections</p>
        <h2 class="et-tool__title"><?php echo esc_html($context['tool']->title()); ?></h2>
      </div>
    </header>

    <div class="et-scsl__layout">
      <div class="et-scsl__left-column">
        <article class="et-tool__card">
          <div class="et-tool__card-inner">
            <div class="et-scsl__heading-row">
              <?php
              echo \EngineeringTools\et_card_header(
                  'Visualisation',
                  'Live section geometry'
              );
              ?>
              <span class="et-scsl__diagram-tag" data-output="diagram-tag">--</span>
            </div>

            <div
              class="et-scsl__visual-frame"
              data-export-visualization="true"
              data-export-caption="Closed section geometry and principal axes"
            >
              <svg
                class="et-scsl__diagram"
                data-role="diagram"
                viewBox="0 0 360 280"
                role="img"
                aria-label="Closed section diagram"
              ></svg>
            </div>

            <p class="et-scsl__visual-note" data-output="diagram-note">The section geometry, dimensions, centroid, and governing mode update instantly.</p>
          </div>
        </article>

        <article class="et-tool__card et-scsl__result-card">
          <div class="et-tool__card-inner">
            <div class="et-scsl__heading-row">
              <?php
              echo \EngineeringTools\et_card_header(
                  'Result',
                  'Governing utilisation'
              );
              ?>
              <span class="et-scsl__status-pill" data-output="status-pill">PENDING</span>
            </div>

            <div class="et-scsl__hero" data-role="hero-panel" data-tone="idle">
              <span class="et-scsl__hero-label">Utilisation ratio &eta;</span>
              <strong class="et-scsl__hero-value" data-output="governing-utilisation">--</strong>
              <p class="et-scsl__hero-note" data-output="hero-note">Results will appear when the selected section and applied actions are valid.</p>
            </div>

            <div class="et-scsl__meter-shell" aria-hidden="true">
              <div class="et-scsl__meter-fill" data-role="meter-fill"></div>
            </div>

            <div class="et-tool__metric-grid et-scsl__metric-grid">
              <?php
              echo \EngineeringTools\et_metric_card('Status', '<span data-output="status-text">--</span>', 'PASS when &eta; &le; 1.0');
              echo \EngineeringTools\et_metric_card('Governing mode', '<span data-output="governing-mode">--</span>', 'Controlling utilisation ratio');
              echo \EngineeringTools\et_metric_card('Reserve factor', '<span data-output="reserve-factor">--</span>', '1 / &eta;');
              echo \EngineeringTools\et_metric_card('Section label', '<span data-output="selection-note">--</span>', 'Active family, grade, and designation');
              ?>
            </div>

            <div class="et-scsl__ratio-list" data-role="ratio-list">
              <div class="et-scsl__ratio-row">
                <div>
                  <strong>Awaiting valid inputs</strong>
                  <span>Input validation must pass before demand-to-capacity ratios can be shown.</span>
                </div>
                <em>--</em>
              </div>
            </div>

            <div class="et-tool__actions et-scsl__actions">
              <button type="button" class="et-tool__button et-tool__button--primary" data-action="save-result">Save Result</button>
              <button type="button" class="et-tool__button et-tool__button--secondary" data-action="export-word-report">Export Word Report</button>
            </div>

            <p class="et-scsl__export-feedback" data-output="export-feedback"></p>
          </div>
        </article>
      </div>

      <div class="et-scsl__right-column">
        <article class="et-tool__card">
          <div class="et-tool__card-inner">
            <details class="et-scsl__metadata-panel">
              <summary class="et-scsl__equation-summary">
                <span>Issue metadata</span>
              </summary>

              <div class="et-scsl__field-grid et-scsl__field-grid--top">
                <label class="et-tool__field">
                  <span class="et-tool__label">Company</span>
                  <span class="et-tool__input-wrap">
                    <input class="et-tool__input" type="text" value="<?php echo esc_attr((string) $report_settings['company']); ?>" data-field="report-company" />
                  </span>
                </label>

                <label class="et-tool__field">
                  <span class="et-tool__label">Project</span>
                  <span class="et-tool__input-wrap">
                    <input class="et-tool__input" type="text" value="<?php echo esc_attr((string) $report_settings['project']); ?>" data-field="report-project" />
                  </span>
                </label>

                <label class="et-tool__field">
                  <span class="et-tool__label">Project no.</span>
                  <span class="et-tool__input-wrap">
                    <input class="et-tool__input" type="text" value="<?php echo esc_attr((string) $report_settings['project_number']); ?>" data-field="report-project-number" />
                  </span>
                </label>

                <label class="et-tool__field">
                  <span class="et-tool__label">Client</span>
                  <span class="et-tool__input-wrap">
                    <input class="et-tool__input" type="text" value="<?php echo esc_attr((string) $report_settings['client']); ?>" data-field="report-client" />
                  </span>
                </label>

                <label class="et-tool__field">
                  <span class="et-tool__label">Prepared by</span>
                  <span class="et-tool__input-wrap">
                    <input class="et-tool__input" type="text" value="<?php echo esc_attr((string) $report_settings['prepared_by']); ?>" data-field="report-prepared-by" />
                  </span>
                </label>

                <label class="et-tool__field">
                  <span class="et-tool__label">Checked by</span>
                  <span class="et-tool__input-wrap">
                    <input class="et-tool__input" type="text" value="<?php echo esc_attr((string) $report_settings['checked_by']); ?>" data-field="report-checked-by" />
                  </span>
                </label>

                <label class="et-tool__field et-scsl__metadata-span-full">
                  <span class="et-tool__label">Issue purpose</span>
                  <span class="et-tool__input-wrap">
                    <input class="et-tool__input" type="text" value="<?php echo esc_attr((string) $report_settings['issue_purpose']); ?>" data-field="report-issue-purpose" />
                  </span>
                </label>
              </div>
            </details>
          </div>
        </article>

        <article class="et-tool__card">
          <div class="et-tool__card-inner">
            <?php
            echo \EngineeringTools\et_card_header(
                'Input Workspace',
                'Section and applied actions'
            );
            ?>

            <div class="et-scsl__field-grid et-scsl__field-grid--top">
              <?php
              echo \EngineeringTools\et_select_field(
                  'Section family',
                  $family_options,
                  'CHS',
                  array(
                      'data-field' => 'family',
                  ),
                  'family'
              );

              echo \EngineeringTools\et_select_field(
                  'Steel grade',
                  $grade_options,
                  'C350',
                  array(
                      'data-field' => 'grade',
                  ),
                  'grade'
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

            <div class="et-tool__fields et-scsl__field-stack">
              <?php
              echo \EngineeringTools\et_number_field(
                  'Compression demand N*c',
                  array(
                      'min'        => '0',
                      'max'        => '1000000',
                      'step'       => '0.1',
                      'value'      => '50',
                      'data-field' => 'compression',
                      'inputmode'  => 'decimal',
                  ),
                  'kN',
                  'compression'
              );
              echo \EngineeringTools\et_number_field(
                  'Tension demand N*t',
                  array(
                      'min'        => '0',
                      'max'        => '1000000',
                      'step'       => '0.1',
                      'value'      => '0',
                      'data-field' => 'tension',
                      'inputmode'  => 'decimal',
                  ),
                  'kN',
                  'tension'
              );
              echo \EngineeringTools\et_number_field(
                  'Moment M*',
                  array(
                      'min'        => '0',
                      'max'        => '1000000',
                      'step'       => '0.1',
                      'value'      => '50',
                      'data-field' => 'moment-major',
                      'inputmode'  => 'decimal',
                  ),
                  'kNm',
                  'moment-major'
              );
              ?>

              <div class="et-scsl__rhs-only" data-rhs-only="moment-minor" hidden>
                <?php
                echo \EngineeringTools\et_number_field(
                    'Minor-axis moment M*y',
                    array(
                        'min'        => '0',
                        'max'        => '1000000',
                        'step'       => '0.1',
                        'value'      => '0',
                        'data-field' => 'moment-minor',
                        'inputmode'  => 'decimal',
                    ),
                    'kNm',
                    'moment-minor'
                );
                ?>
              </div>

              <?php
              echo \EngineeringTools\et_number_field(
                  'Shear V*',
                  array(
                      'min'        => '0',
                      'max'        => '1000000',
                      'step'       => '0.1',
                      'value'      => '20',
                      'data-field' => 'shear-major',
                      'inputmode'  => 'decimal',
                  ),
                  'kN',
                  'shear-major'
              );
              ?>

              <div class="et-scsl__rhs-only" data-rhs-only="shear-minor" hidden>
                <?php
                echo \EngineeringTools\et_number_field(
                    'Minor-axis shear V*y',
                    array(
                        'min'        => '0',
                        'max'        => '1000000',
                        'step'       => '0.1',
                        'value'      => '0',
                        'data-field' => 'shear-minor',
                        'inputmode'  => 'decimal',
                    ),
                    'kN',
                    'shear-minor'
                );
                ?>
              </div>

              <?php
              echo \EngineeringTools\et_number_field(
                  'Torsion T*',
                  array(
                      'min'        => '0',
                      'max'        => '1000000',
                      'step'       => '0.1',
                      'value'      => '0',
                      'data-field' => 'torsion',
                      'inputmode'  => 'decimal',
                  ),
                  'kNm',
                  'torsion'
              );
              ?>
            </div>
          </div>
        </article>

        <article class="et-tool__card">
          <div class="et-tool__card-inner">
            <details class="et-scsl__equation-panel">
              <summary class="et-scsl__equation-summary">
                <span>Equation Set</span>
              </summary>
              <div class="et-scsl__equation-stack">
                <div class="et-scsl__equation-card">
                  <div class="et-scsl__math" data-role="equation-primary"></div>
                </div>
                <div class="et-scsl__equation-card">
                  <div class="et-scsl__math" data-role="equation-secondary"></div>
                </div>
              </div>
            </details>
          </div>
        </article>

        <article class="et-tool__card">
          <div class="et-tool__card-inner">
            <?php
            echo \EngineeringTools\et_card_header(
                'Properties',
                'Secondary properties'
            );
            ?>

            <div class="et-tool__metric-grid et-scsl__metric-grid">
              <?php
              echo \EngineeringTools\et_metric_card('Mass', '<span data-output="mass">--</span>', 'kg/m');
              echo \EngineeringTools\et_metric_card('Compression &phi;Ns', '<span data-output="phi-ns">--</span>', 'kN');
              echo \EngineeringTools\et_metric_card('Tension &phi;Nt', '<span data-output="phi-nt">--</span>', 'kN');
              echo \EngineeringTools\et_metric_card('Moment &phi;M', '<span data-output="phi-m">--</span>', 'kNm');
              echo \EngineeringTools\et_metric_card('Shear &phi;V', '<span data-output="phi-v">--</span>', 'kN');
              echo \EngineeringTools\et_metric_card('Torsion &phi;T', '<span data-output="phi-t">--</span>', 'kNm');
              echo \EngineeringTools\et_metric_card('Thickness t', '<span data-output="thickness">--</span>', 'mm');
              echo \EngineeringTools\et_metric_card('Width B', '<span data-output="width">--</span>', 'mm');
              echo \EngineeringTools\et_metric_card('Depth D', '<span data-output="depth">--</span>', 'mm');
              echo \EngineeringTools\et_metric_card('Area estimate A', '<span data-output="area">--</span>', 'mm&#178;');
              ?>
            </div>
          </div>
        </article>
      </div>
    </div>

    <article class="et-tool__card">
      <div class="et-tool__card-inner">
        <div class="et-scsl__saved-header">
          <?php
          echo \EngineeringTools\et_card_header(
              'History',
              'Saved results'
          );
          ?>
          <button type="button" class="et-tool__button et-tool__button--secondary" data-action="clear-results">Clear</button>
        </div>

        <?php echo \EngineeringTools\et_table_open(array('Timestamp', 'Section', 'Demand summary', 'Mode', 'φ', 'Status')); ?>
        <tbody data-role="saved-results">
          <tr>
            <td class="et-scsl__empty-row" colspan="6">No saved results yet.</td>
          </tr>
        </tbody>
        <?php echo \EngineeringTools\et_table_close(); ?>
      </div>
    </article>
  </div>
</section>
