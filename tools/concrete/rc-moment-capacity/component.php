<?php
/**
 * RC moment capacity calculator component.
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
        'company' => '',
        'project' => '',
        'prepared_by' => '',
        'checked_by' => '',
        'disclaimer' => 'This calculation sheet is software-generated and must be reviewed by a qualified structural engineer before issue.',
    ),
    is_array($context['atts']) ? $context['atts'] : array(),
    (string) ($context['tag'] ?? 'rc_moment_capacity')
);
?>
<section
  id="<?php echo esc_attr($instance_id); ?>"
  class="et-tool et-tool--rc-moment-capacity"
  data-et-tool="rc-moment-capacity"
  data-et-instance="<?php echo esc_attr($instance_id); ?>"
  data-tool-slug="rc-moment-capacity"
  data-report-company="<?php echo esc_attr((string) $report_settings['company']); ?>"
  data-report-project="<?php echo esc_attr((string) $report_settings['project']); ?>"
  data-report-prepared-by="<?php echo esc_attr((string) $report_settings['prepared_by']); ?>"
  data-report-checked-by="<?php echo esc_attr((string) $report_settings['checked_by']); ?>"
  data-report-disclaimer="<?php echo esc_attr((string) $report_settings['disclaimer']); ?>"
>
  <div class="et-rmc__shell">
    <header class="et-rmc__header et-rmc__card">
      <div>
        <p class="et-rmc__eyebrow">Concrete Flexure</p>
        <h2 class="et-rmc__title"><?php echo esc_html($context['tool']->title()); ?></h2>
      </div>
      <p class="et-rmc__lead">
        Ultimate moment capacity for a singly reinforced rectangular concrete section.
      </p>
    </header>

    <main class="et-rmc__main-grid">
      <div class="et-rmc__left-column">
        <section class="et-rmc__card et-rmc__visual-card" data-export-visualization="true" data-export-caption="RC rectangular section flexural visualisation">
          <div class="et-rmc__card-header">
            <div>
              <p class="et-rmc__card-kicker">Visualisation</p>
              <h3>Live Section Diagram</h3>
            </div>
            <span class="et-rmc__status-chip" data-output="visual-status">Awaiting valid inputs</span>
          </div>

          <div class="et-rmc__diagram-frame">
            <svg
              class="et-rmc__diagram"
              data-role="diagram"
              viewBox="0 0 720 440"
              role="img"
              aria-label="Reinforced concrete section visualisation"
            ></svg>
          </div>
        </section>

        <section class="et-rmc__card et-rmc__result-card">
          <div class="et-rmc__card-header">
            <div>
              <p class="et-rmc__card-kicker">Result</p>
              <h3>Design Check</h3>
            </div>
            <span class="et-rmc__status-pill" data-output="status-pill">No result</span>
          </div>

          <div class="et-rmc__hero" data-role="hero-card" data-tone="idle">
            <span class="et-rmc__hero-label">&phi;M<sub>u</sub></span>
            <strong class="et-rmc__hero-value" data-output="phiMu">--</strong>
            <p class="et-rmc__hero-note" data-output="hero-note">
              Enter valid section, material, reinforcement, and action values to evaluate utilisation.
            </p>
          </div>

          <div class="et-rmc__metric-grid et-rmc__metric-grid--primary">
            <article class="et-rmc__metric et-rmc__metric--accent">
              <span>Utilisation</span>
              <strong data-output="utilisation">--</strong>
              <small>M* / &phi;M<sub>u</sub></small>
            </article>
            <article class="et-rmc__metric">
              <span>M<sub>u</sub></span>
              <strong data-output="mu">--</strong>
              <small>Nominal capacity</small>
            </article>
            <article class="et-rmc__metric">
              <span>M*</span>
              <strong data-output="mstar">--</strong>
              <small>Design action</small>
            </article>
            <article class="et-rmc__metric">
              <span>k<sub>u</sub></span>
              <strong data-output="ku">--</strong>
              <small>Ductility ratio</small>
            </article>
          </div>

          <div class="et-rmc__notice">
            <h4>Design Checks</h4>
            <ul class="et-rmc__checks" data-role="checks-list">
              <li class="et-rmc__check et-rmc__check--warn">
                <strong>Input validation</strong>
                <p>Results are only shown when all required fields are within the configured engineering limits.</p>
              </li>
            </ul>
          </div>

          <div class="et-rmc__actions">
            <button type="button" class="et-rmc__button et-rmc__button--ghost" data-action="export-word-report">Export Word Report</button>
            <button type="button" class="et-rmc__button et-rmc__button--primary" data-action="save-result">Save Result</button>
          </div>
          <p class="et-rmc__export-feedback" data-output="export-feedback"></p>
        </section>
      </div>

      <div class="et-rmc__right-column">
        <section class="et-rmc__card">
          <div class="et-rmc__card-header">
            <div>
              <p class="et-rmc__card-kicker">Inputs</p>
              <h3>Material, Geometry, and Reinforcement</h3>
            </div>
            <button type="button" class="et-rmc__button et-rmc__button--ghost" data-action="reset-form">Reset</button>
          </div>

          <div class="et-rmc__group-stack">
            <section class="et-rmc__input-group">
              <div class="et-rmc__mini-header">
                <h4>Material Properties</h4>
                <span>Ultimate strength, reduction, and action inputs</span>
              </div>
              <div class="et-rmc__field-grid">
                <label class="et-rmc__field" title="Specified compressive strength of concrete used in the rectangular stress-block model.">
                  <span class="et-rmc__label">f&prime;<sub>c</sub></span>
                  <span class="et-rmc__control"><input class="et-rmc__input" type="number" step="1" min="20" value="40" data-field="fc" /><span class="et-rmc__unit">MPa</span></span>
                  <em class="et-rmc__error" data-error-for="fc"></em>
                </label>
                <label class="et-rmc__field" title="Yield strength of the tension reinforcement.">
                  <span class="et-rmc__label">f<sub>sy</sub></span>
                  <span class="et-rmc__control"><input class="et-rmc__input" type="number" step="1" min="250" value="500" data-field="fsy" /><span class="et-rmc__unit">MPa</span></span>
                  <em class="et-rmc__error" data-error-for="fsy"></em>
                </label>
                <label class="et-rmc__field" title="Capacity reduction factor applied to the nominal moment capacity to obtain design capacity.">
                  <span class="et-rmc__label">&phi;</span>
                  <span class="et-rmc__control"><input class="et-rmc__input" type="number" step="0.01" min="0.1" max="1.0" value="0.80" data-field="phi" /><span class="et-rmc__unit">factor</span></span>
                  <em class="et-rmc__error" data-error-for="phi"></em>
                </label>
                <label class="et-rmc__field" title="Factored design bending moment to be checked against the reduced flexural capacity.">
                  <span class="et-rmc__label">M*</span>
                  <span class="et-rmc__control"><input class="et-rmc__input" type="number" step="1" min="0" value="120" data-field="mstar" /><span class="et-rmc__unit">kN&middot;m</span></span>
                  <em class="et-rmc__error" data-error-for="mstar"></em>
                </label>
              </div>
            </section>

            <section class="et-rmc__input-group">
              <div class="et-rmc__mini-header">
                <h4>Section Geometry</h4>
                <span>Rectangular section dimensions and steel centroid cover</span>
              </div>
              <div class="et-rmc__field-grid">
                <label class="et-rmc__field" title="Section width measured perpendicular to the bending axis.">
                  <span class="et-rmc__label">b</span>
                  <span class="et-rmc__control"><input class="et-rmc__input" type="number" step="1" min="150" value="300" data-field="b" /><span class="et-rmc__unit">mm</span></span>
                  <em class="et-rmc__error" data-error-for="b"></em>
                </label>
                <label class="et-rmc__field" title="Overall section depth in the flexural direction.">
                  <span class="et-rmc__label">D</span>
                  <span class="et-rmc__control"><input class="et-rmc__input" type="number" step="1" min="250" value="600" data-field="D" /><span class="et-rmc__unit">mm</span></span>
                  <em class="et-rmc__error" data-error-for="D"></em>
                </label>
                <label class="et-rmc__field" title="Distance from the compression face to the centroid of the tension steel layer for this simplified model.">
                  <span class="et-rmc__label">Effective Cover</span>
                  <span class="et-rmc__control"><input class="et-rmc__input" type="number" step="1" min="20" value="45" data-field="cover" /><span class="et-rmc__unit">mm</span></span>
                  <em class="et-rmc__error" data-error-for="cover"></em>
                </label>
              </div>
            </section>

            <section class="et-rmc__input-group">
              <div class="et-rmc__mini-header">
                <h4>Tension Reinforcement</h4>
                <span>Single tension layer</span>
              </div>
              <div class="et-rmc__field-grid">
                <label class="et-rmc__field" title="Nominal diameter of each tension reinforcing bar.">
                  <span class="et-rmc__label">&phi;<sub>s</sub></span>
                  <span class="et-rmc__control"><input class="et-rmc__input" type="number" step="1" min="12" value="20" data-field="rebarDiameter" /><span class="et-rmc__unit">mm</span></span>
                  <em class="et-rmc__error" data-error-for="rebarDiameter"></em>
                </label>
                <label class="et-rmc__field" title="Number of bars in the single tension layer used to form A_s.">
                  <span class="et-rmc__label">n</span>
                  <span class="et-rmc__control"><input class="et-rmc__input" type="number" step="1" min="1" value="2" data-field="rebarCount" /><span class="et-rmc__unit">bars</span></span>
                  <em class="et-rmc__error" data-error-for="rebarCount"></em>
                </label>
              </div>
            </section>
          </div>
        </section>

        <section class="et-rmc__card">
          <div class="et-rmc__card-header">
            <div>
              <p class="et-rmc__card-kicker">Secondary Properties</p>
              <h3>Derived Values and Equations</h3>
            </div>
          </div>

          <div class="et-rmc__metric-grid et-rmc__metric-grid--secondary">
            <article class="et-rmc__metric"><span>&gamma;</span><strong data-output="gamma">--</strong><small>Stress block factor</small></article>
            <article class="et-rmc__metric"><span>&rho;</span><strong data-output="rho">--</strong><small>A<sub>s</sub> / bd</small></article>
            <article class="et-rmc__metric"><span>A<sub>bar</sub></span><strong data-output="abar">--</strong><small>&pi;&phi;<sub>s</sub><sup>2</sup> / 4</small></article>
            <article class="et-rmc__metric"><span>a</span><strong data-output="aDepth">--</strong><small>&gamma;d<sub>n</sub></small></article>
            <article class="et-rmc__metric"><span>d</span><strong data-output="d">--</strong><small>D - cover</small></article>
            <article class="et-rmc__metric"><span>A<sub>s</sub></span><strong data-output="as">--</strong><small>Total tension steel</small></article>
            <article class="et-rmc__metric"><span>d<sub>n</sub></span><strong data-output="dn">--</strong><small>Neutral axis depth</small></article>
          </div>

          <div class="et-rmc__equation-stack">
            <article class="et-rmc__equation-card">
              <p class="et-rmc__equation-title">Moment capacity</p>
              <div class="et-rmc__math" data-role="equation-primary"></div>
            </article>
            <article class="et-rmc__equation-card">
              <p class="et-rmc__equation-title">Neutral axis and ductility</p>
              <div class="et-rmc__math" data-role="equation-secondary"></div>
            </article>
          </div>
        </section>
      </div>
    </main>

    <section class="et-rmc__card">
      <div class="et-rmc__card-header">
        <div>
          <p class="et-rmc__card-kicker">Saved Results</p>
          <h3>Capacity Snapshots</h3>
        </div>
        <button type="button" class="et-rmc__button et-rmc__button--ghost" data-action="clear-results">Clear</button>
      </div>

      <div class="et-rmc__table-wrap">
        <table class="et-rmc__table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Section</th>
              <th>Material</th>
              <th>Reinforcement</th>
              <th>&phi;M<sub>u</sub></th>
              <th>M*</th>
              <th>d<sub>n</sub></th>
              <th>k<sub>u</sub></th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody data-role="saved-results">
            <tr>
              <td class="et-rmc__empty-row" colspan="9">No saved results yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</section>
