<?php
/**
 * Punching shear design calculator component.
 *
 * @var array<string, mixed> $context
 */

declare(strict_types=1);

if (! defined('ABSPATH')) {
    exit;
}

$instanceId = (string) $context['instance_id'];
$reportSettings = shortcode_atts(
    array(
        'company' => '',
        'project' => '',
        'prepared_by' => '',
        'disclaimer' => 'This automated calculation sheet should be checked by a qualified engineer before issue or construction use.',
    ),
    is_array($context['atts']) ? $context['atts'] : array(),
    (string) ($context['tag'] ?? 'punching_shear_design')
);
?>
<section
  id="<?php echo esc_attr($instanceId); ?>"
  class="et-tool et-tool--punching-shear-design"
  data-et-tool="punching-shear-design"
  data-et-instance="<?php echo esc_attr($instanceId); ?>"
  data-tool-slug="punching-shear-design"
  data-report-company="<?php echo esc_attr((string) $reportSettings['company']); ?>"
  data-report-project="<?php echo esc_attr((string) $reportSettings['project']); ?>"
  data-report-prepared-by="<?php echo esc_attr((string) $reportSettings['prepared_by']); ?>"
  data-report-disclaimer="<?php echo esc_attr((string) $reportSettings['disclaimer']); ?>"
>
  <div class="et-psd__shell">
    <header class="et-psd__card et-psd__header">
      <div>
        <p class="et-psd__eyebrow">Concrete Punching Shear</p>
        <h2 class="et-psd__title"><?php echo esc_html($context['tool']->title()); ?></h2>
      </div>
      <p class="et-psd__lead">
        Internal support punching shear design to AS 5100.5 Clause 9.2 with live perimeter geometry,
        moment-transfer effects, detailing checks, saved scenarios, and a print-ready calculation sheet.
      </p>
    </header>

    <main class="et-psd__main-grid">
      <div class="et-psd__left-column">
        <section class="et-psd__card et-psd__visual-card">
          <div class="et-psd__card-header">
            <div>
              <p class="et-psd__card-kicker">Live Visualisation</p>
              <h3>Critical perimeter and support geometry</h3>
            </div>
            <span class="et-psd__pill" data-output="support-type-pill">Rectangular</span>
          </div>

          <div class="et-psd__visual-frame">
            <svg
              class="et-psd__diagram"
              data-role="diagram"
              viewBox="0 0 540 420"
              role="img"
              aria-label="Punching shear critical perimeter diagram"
            ></svg>
          </div>

          <div class="et-psd__visual-caption">
            <div>
              <span>Critical perimeter</span>
              <strong data-output="critical-perimeter-caption">Awaiting valid inputs</strong>
            </div>
            <div>
              <span>Moment transfer</span>
              <strong data-output="moment-transfer-caption">Clause 9.2 active</strong>
            </div>
          </div>
        </section>

        <section class="et-psd__card et-psd__result-card">
          <div class="et-psd__card-header">
            <div>
              <p class="et-psd__card-kicker">Highlighted Result</p>
              <h3>Design punching shear strength</h3>
            </div>
            <span class="et-psd__status-pill" data-output="status-pill">Ready</span>
          </div>

          <div class="et-psd__hero-metric" data-tone="idle" data-role="hero-metric">
            <span class="et-psd__hero-label">&phi;V<sub>u</sub></span>
            <strong class="et-psd__hero-value" data-output="phi-vu">--</strong>
            <p class="et-psd__hero-note" data-output="hero-note">
              Complete the required design inputs to evaluate the slab-support connection.
            </p>
          </div>

          <div class="et-psd__metric-grid et-psd__metric-grid--primary">
            <article class="et-psd__metric-card">
              <span>V*</span>
              <strong data-output="demand-total">--</strong>
              <small>Total design shear demand</small>
            </article>
            <article class="et-psd__metric-card">
              <span>Utilisation</span>
              <strong data-output="utilisation">--</strong>
              <small>V* / &phi;V<sub>u</sub></small>
            </article>
            <article class="et-psd__metric-card et-psd__metric-card--accent">
              <span>Status</span>
              <strong data-output="status-text">--</strong>
              <small>Strength compliance</small>
            </article>
          </div>

          <div class="et-psd__result-actions">
            <button type="button" class="et-psd__button et-psd__button--primary" data-action="save-result">Save Result</button>
            <button type="button" class="et-psd__button et-psd__button--secondary" data-action="export-word-report">Export Word Report</button>
          </div>

          <p class="et-psd__export-feedback" data-output="export-feedback"></p>

          <div class="et-psd__notice-stack" data-role="notice-stack">
            <div class="et-psd__notice" data-tone="info">
              <strong>Scope note</strong>
              <p>Internal supports only. Edge supports, corners, and openings remain outside this tool version.</p>
            </div>
          </div>
        </section>
      </div>

      <div class="et-psd__right-column">
        <section class="et-psd__card">
          <div class="et-psd__card-header">
            <div>
              <p class="et-psd__card-kicker">Inputs</p>
              <h3>Design inputs and actions</h3>
            </div>
            <button type="button" class="et-psd__button et-psd__button--ghost" data-action="reset-form">Reset</button>
          </div>

          <div class="et-psd__equation-toggle">
            <button type="button" class="et-psd__collapse" data-action="toggle-equations" aria-expanded="false">
              <span>Core design expressions</span>
              <span data-role="equation-toggle-label">Show</span>
            </button>
            <div class="et-psd__equation-panel is-collapsed" data-panel="equations">
              <div class="et-psd__equation-block">
                <p class="et-psd__equation-title">Strength model</p>
                <div class="et-psd__math" data-role="equation-strength"></div>
              </div>
              <div class="et-psd__equation-block">
                <p class="et-psd__equation-title">Critical perimeter and demand</p>
                <div class="et-psd__math" data-role="equation-demand"></div>
              </div>
              <div class="et-psd__equation-block">
                <p class="et-psd__equation-title">Detailing trigger</p>
                <div class="et-psd__math" data-role="equation-detailing"></div>
              </div>
            </div>
          </div>

          <div class="et-psd__group-stack">
            <section class="et-psd__input-group">
              <div class="et-psd__mini-header">
                <h4>Design standard settings</h4>
                <span>AS 5100.5 defaults</span>
              </div>
              <div class="et-psd__field-grid">
                <label class="et-psd__field">
                  <span class="et-psd__label">&phi;</span>
                  <span class="et-psd__control"><input class="et-psd__input" type="number" step="0.01" min="0.4" max="1" value="0.70" data-field="phi" /><span class="et-psd__unit">factor</span></span>
                  <em class="et-psd__error" data-error-for="phi"></em>
                </label>
                <label class="et-psd__field">
                  <span class="et-psd__label">k<sub>dg</sub></span>
                  <span class="et-psd__control"><input class="et-psd__input" type="number" step="1" min="0" max="40" value="20" data-field="kdg" /><span class="et-psd__unit">default</span></span>
                  <em class="et-psd__error" data-error-for="kdg"></em>
                </label>
              </div>
            </section>

            <section class="et-psd__input-group">
              <div class="et-psd__mini-header">
                <h4>Slab geometry</h4>
                <span>Internal support zone</span>
              </div>
              <div class="et-psd__field-grid">
                <label class="et-psd__field">
                  <span class="et-psd__label">D<sub>s</sub></span>
                  <span class="et-psd__control"><input class="et-psd__input" type="number" step="1" min="100" value="260" data-field="slab-thickness" /><span class="et-psd__unit">mm</span></span>
                  <em class="et-psd__error" data-error-for="slab-thickness"></em>
                </label>
                <label class="et-psd__field">
                  <span class="et-psd__label">d<sub>o</sub></span>
                  <span class="et-psd__control"><input class="et-psd__input" type="number" step="1" min="60" value="210" data-field="effective-depth" /><span class="et-psd__unit">mm</span></span>
                  <em class="et-psd__error" data-error-for="effective-depth"></em>
                </label>
                <label class="et-psd__field">
                  <span class="et-psd__label">d<sub>om</sub></span>
                  <span class="et-psd__control"><input class="et-psd__input" type="number" step="1" min="60" value="" data-field="mean-effective-depth" /><span class="et-psd__unit">mm</span></span>
                  <em class="et-psd__error" data-error-for="mean-effective-depth"></em>
                </label>
                <label class="et-psd__field">
                  <span class="et-psd__label">d<sub>v</sub></span>
                  <span class="et-psd__control"><input class="et-psd__input" type="number" step="1" min="60" value="" data-field="shear-depth" /><span class="et-psd__unit">mm</span></span>
                  <em class="et-psd__error" data-error-for="shear-depth"></em>
                </label>
              </div>
            </section>

            <section class="et-psd__input-group">
              <div class="et-psd__mini-header">
                <h4>Support geometry</h4>
                <span>Rectangular or circular</span>
              </div>

              <div class="et-psd__choice-row">
                <button type="button" class="et-psd__choice is-active" data-action="set-support-type" data-value="rectangular">Rectangular</button>
                <button type="button" class="et-psd__choice" data-action="set-support-type" data-value="circular">Circular</button>
              </div>

              <input type="hidden" value="rectangular" data-field="support-type" />

              <div class="et-psd__field-grid" data-section="support-rectangular">
                <label class="et-psd__field">
                  <span class="et-psd__label">X</span>
                  <span class="et-psd__control"><input class="et-psd__input" type="number" step="1" min="50" value="400" data-field="support-x" /><span class="et-psd__unit">mm</span></span>
                  <em class="et-psd__error" data-error-for="support-x"></em>
                </label>
                <label class="et-psd__field">
                  <span class="et-psd__label">Y</span>
                  <span class="et-psd__control"><input class="et-psd__input" type="number" step="1" min="50" value="650" data-field="support-y" /><span class="et-psd__unit">mm</span></span>
                  <em class="et-psd__error" data-error-for="support-y"></em>
                </label>
              </div>

              <div class="et-psd__field-grid is-hidden" data-section="support-circular">
                <label class="et-psd__field">
                  <span class="et-psd__label">D<sub>col</sub></span>
                  <span class="et-psd__control"><input class="et-psd__input" type="number" step="1" min="50" value="550" data-field="support-diameter" /><span class="et-psd__unit">mm</span></span>
                  <em class="et-psd__error" data-error-for="support-diameter"></em>
                </label>
              </div>
            </section>

            <section class="et-psd__input-group">
              <div class="et-psd__mini-header">
                <h4>Design actions and materials</h4>
                <span>Applied demand</span>
              </div>
              <div class="et-psd__field-grid">
                <label class="et-psd__field">
                  <span class="et-psd__label">V<sub>v</sub>*</span>
                  <span class="et-psd__control"><input class="et-psd__input" type="number" step="0.1" min="1" value="50" data-field="design-shear" /><span class="et-psd__unit">kN</span></span>
                  <em class="et-psd__error" data-error-for="design-shear"></em>
                </label>
                <label class="et-psd__field">
                  <span class="et-psd__label">M<sub>vx</sub>*</span>
                  <span class="et-psd__control"><input class="et-psd__input" type="number" step="0.1" value="25" data-field="moment-x" /><span class="et-psd__unit">kNm</span></span>
                  <em class="et-psd__error" data-error-for="moment-x"></em>
                </label>
                <label class="et-psd__field">
                  <span class="et-psd__label">M<sub>vy</sub>*</span>
                  <span class="et-psd__control"><input class="et-psd__input" type="number" step="0.1" value="25" data-field="moment-y" /><span class="et-psd__unit">kNm</span></span>
                  <em class="et-psd__error" data-error-for="moment-y"></em>
                </label>
                <label class="et-psd__field">
                  <span class="et-psd__label">f&prime;<sub>c</sub></span>
                  <span class="et-psd__control"><input class="et-psd__input" type="number" step="1" min="15" value="40" data-field="concrete-strength" /><span class="et-psd__unit">MPa</span></span>
                  <em class="et-psd__error" data-error-for="concrete-strength"></em>
                </label>
                <label class="et-psd__field">
                  <span class="et-psd__label">&sigma;<sub>cp</sub></span>
                  <span class="et-psd__control"><input class="et-psd__input" type="number" step="0.1" min="0" value="0" data-field="prestress" /><span class="et-psd__unit">MPa</span></span>
                  <em class="et-psd__error" data-error-for="prestress"></em>
                </label>
                <label class="et-psd__field">
                  <span class="et-psd__label">f<sub>sy,f</sub></span>
                  <span class="et-psd__control"><input class="et-psd__input" type="number" step="1" min="200" value="500" data-field="shear-reinforcement-yield" /><span class="et-psd__unit">MPa</span></span>
                  <em class="et-psd__error" data-error-for="shear-reinforcement-yield"></em>
                </label>
              </div>
            </section>
          </div>
        </section>

        <section class="et-psd__card">
          <div class="et-psd__card-header">
            <div>
              <p class="et-psd__card-kicker">Secondary Properties</p>
              <h3>Moment transfer, reinforcement, and checks</h3>
            </div>
          </div>

          <div class="et-psd__toggle-list">
            <label class="et-psd__toggle">
              <span>
                <strong>Ignore moment transfer</strong>
                <small>Sets eccentric shear from transferred moment to zero.</small>
              </span>
              <input type="checkbox" data-field="ignore-moment-transfer" />
            </label>
            <label class="et-psd__toggle">
              <span>
                <strong>Provide shear reinforcement</strong>
                <small>Enables V<sub>us</sub>, minimum reinforcement, and detailing checks.</small>
              </span>
              <input type="checkbox" data-field="has-shear-reinforcement" />
            </label>
            <label class="et-psd__toggle">
              <span>
                <strong>Failure will not cause collapse</strong>
                <small>If selected, k<sub>vs</sub> is taken as 1.0.</small>
              </span>
              <input type="checkbox" data-field="no-collapse-consequence" />
            </label>
          </div>

          <div class="et-psd__field-grid et-psd__reinforcement-grid is-hidden" data-section="reinforcement-fields">
            <label class="et-psd__field">
              <span class="et-psd__label">A<sub>sv</sub></span>
              <span class="et-psd__control"><input class="et-psd__input" type="number" step="1" min="1" value="1256" data-field="asv" /><span class="et-psd__unit">mm&sup2;</span></span>
              <em class="et-psd__error" data-error-for="asv"></em>
            </label>
            <label class="et-psd__field">
              <span class="et-psd__label">s</span>
              <span class="et-psd__control"><input class="et-psd__input" type="number" step="1" min="20" value="120" data-field="spacing-radial" /><span class="et-psd__unit">mm</span></span>
              <em class="et-psd__error" data-error-for="spacing-radial"></em>
            </label>
            <label class="et-psd__field">
              <span class="et-psd__label">s<sub>t</sub></span>
              <span class="et-psd__control"><input class="et-psd__input" type="number" step="1" min="20" value="220" data-field="spacing-transverse" /><span class="et-psd__unit">mm</span></span>
              <em class="et-psd__error" data-error-for="spacing-transverse"></em>
            </label>
            <label class="et-psd__field">
              <span class="et-psd__label">First fitment</span>
              <span class="et-psd__control"><input class="et-psd__input" type="number" step="1" min="10" value="160" data-field="first-fitment-distance" /><span class="et-psd__unit">mm</span></span>
              <em class="et-psd__error" data-error-for="first-fitment-distance"></em>
            </label>
            <label class="et-psd__field">
              <span class="et-psd__label">Reinforcement extent</span>
              <span class="et-psd__control"><input class="et-psd__input" type="number" step="1" min="0" value="320" data-field="reinforcement-extent" /><span class="et-psd__unit">mm</span></span>
              <em class="et-psd__error" data-error-for="reinforcement-extent"></em>
            </label>
          </div>

          <div class="et-psd__field-grid">
            <label class="et-psd__field">
              <span class="et-psd__label">M<sub>fx</sub>*</span>
              <span class="et-psd__control"><input class="et-psd__input" type="number" step="0.1" value="" data-field="flexure-moment-x" /><span class="et-psd__unit">kNm</span></span>
              <em class="et-psd__error" data-error-for="flexure-moment-x"></em>
            </label>
            <label class="et-psd__field">
              <span class="et-psd__label">M<sub>fy</sub>*</span>
              <span class="et-psd__control"><input class="et-psd__input" type="number" step="0.1" value="" data-field="flexure-moment-y" /><span class="et-psd__unit">kNm</span></span>
              <em class="et-psd__error" data-error-for="flexure-moment-y"></em>
            </label>
          </div>

          <div class="et-psd__metric-grid et-psd__metric-grid--secondary">
            <article class="et-psd__metric-card"><span>u</span><strong data-output="perimeter-u">--</strong><small>Critical perimeter</small></article>
            <article class="et-psd__metric-card"><span>&beta;<sub>h</sub></span><strong data-output="beta-h">--</strong><small>Aspect ratio term</small></article>
            <article class="et-psd__metric-card"><span>k<sub>vucs</sub></span><strong data-output="kvucs">--</strong><small>Concrete modifier</small></article>
            <article class="et-psd__metric-card"><span>f<sub>cv</sub></span><strong data-output="fcv">--</strong><small>MPa</small></article>
            <article class="et-psd__metric-card"><span>&phi;V<sub>uc</sub></span><strong data-output="phi-vuc">--</strong><small>Concrete-only capacity</small></article>
            <article class="et-psd__metric-card"><span>V<sub>us</sub></span><strong data-output="vus">--</strong><small>Reinforcement contribution</small></article>
            <article class="et-psd__metric-card"><span>Face shear</span><strong data-output="face-check">--</strong><small>u<sub>face</sub> check</small></article>
            <article class="et-psd__metric-card"><span>Min reinforcement</span><strong data-output="min-reinforcement-trigger">--</strong><small>Trigger state</small></article>
            <article class="et-psd__metric-card"><span>Detailing</span><strong data-output="detailing-check">--</strong><small>Spacing and extent</small></article>
          </div>
        </section>
      </div>
    </main>

    <section class="et-psd__card">
      <div class="et-psd__card-header">
        <div>
          <p class="et-psd__card-kicker">Saved Results</p>
          <h3>Scenario history</h3>
        </div>
        <button type="button" class="et-psd__button et-psd__button--ghost" data-action="clear-results">Clear</button>
      </div>

      <div class="et-psd__table-wrap">
        <table class="et-psd__table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Support</th>
              <th>Geometry</th>
              <th>V*</th>
              <th>&phi;V<sub>u</sub></th>
              <th>Utilisation</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody data-role="saved-results">
            <tr>
              <td class="et-psd__empty-row" colspan="7">No saved scenarios yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

  </div>
</section>
