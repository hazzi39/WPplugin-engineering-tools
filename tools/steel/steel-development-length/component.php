<?php
/**
 * Premium steel development length calculator component.
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
        'disclaimer' => 'This calculation sheet is generated from the current tool state and should be reviewed by a qualified engineer before issue.',
    ),
    is_array($context['atts']) ? $context['atts'] : array(),
    (string) ($context['tag'] ?? 'steel_development_length')
);
?>
<section
  id="<?php echo esc_attr($instanceId); ?>"
  class="et-tool et-tool--steel-development-length-premium"
  data-tool-slug="steel-development-length"
  data-instance-id="<?php echo esc_attr($instanceId); ?>"
  data-report-company="<?php echo esc_attr((string) $reportSettings['company']); ?>"
  data-report-project="<?php echo esc_attr((string) $reportSettings['project']); ?>"
  data-report-prepared-by="<?php echo esc_attr((string) $reportSettings['prepared_by']); ?>"
  data-report-disclaimer="<?php echo esc_attr((string) $reportSettings['disclaimer']); ?>"
>
  <div class="sdl-app-shell">
    <header class="sdl-surface-card sdl-page-header">
      <div>
        <p class="sdl-eyebrow">Steel Detailing</p>
        <h2 class="sdl-page-title"><?php echo esc_html($context['tool']->title()); ?></h2>
      </div>
      <p class="sdl-page-subtitle">
        Premium development and lap splice checks with live detailing geometry, engineering notation, saved snapshots, and native Word export.
      </p>
    </header>

    <main class="sdl-main-grid">
      <div class="sdl-left-column">
        <section
          class="sdl-surface-card sdl-visual-card"
          data-export-visualization="true"
          data-export-caption="Development length detailing visualisation"
        >
          <div class="sdl-card-header">
            <div>
              <h3>Live Visualisation</h3>
              <p>Development zone, cover, bar geometry, and hook or cog detailing update instantly.</p>
            </div>
            <span class="sdl-status-pill">Live</span>
          </div>

          <div class="sdl-visual-frame">
            <svg
              class="sdl-visual-svg"
              data-role="diagram"
              viewBox="0 0 640 360"
              role="img"
              aria-label="Steel development length detailing diagram"
              data-export-caption="Development length detailing visualisation"
            ></svg>
          </div>

          <div class="sdl-visual-caption-row">
            <div>
              <span>Bundle condition</span>
              <strong data-output="bundle-label">Single bar</strong>
            </div>
            <div>
              <span>Development mode</span>
              <strong data-output="development-mode">Straight bar development</strong>
            </div>
          </div>
        </section>

        <section class="sdl-surface-card sdl-result-card">
          <div class="sdl-card-header">
            <div>
              <h3>Result</h3>
              <p>Primary design length with key intermediate factors and compliance notes.</p>
            </div>
            <div class="sdl-result-actions">
              <button type="button" class="sdl-button sdl-button--ghost" data-action="export-word-report">Export Word Report</button>
              <button type="button" class="sdl-button sdl-button--primary" data-action="save-result">Save Result</button>
            </div>
          </div>

          <div class="sdl-metric-grid sdl-metric-grid--primary">
            <article class="sdl-metric-card">
              <span>Basic Development Length</span>
              <strong data-output="development-length">--</strong>
              <small>Lsy.tb (mm)</small>
            </article>
            <article class="sdl-metric-card">
              <span>Lap Splice Length</span>
              <strong data-output="lap-length">--</strong>
              <small>Lsy.t.lap (mm)</small>
            </article>
            <article class="sdl-metric-card sdl-metric-card--highlight">
              <span>Final Required Length</span>
              <strong data-output="final-length">--</strong>
              <small>Lreq (mm)</small>
            </article>
          </div>

          <div class="sdl-panel">
            <div class="sdl-panel-header">
              <h4>Key Intermediate Values</h4>
            </div>
            <div class="sdl-detail-grid">
              <div class="sdl-detail-row"><span>k1 bar position factor</span><strong data-output="k1">--</strong></div>
              <div class="sdl-detail-row"><span>k2 bar size factor</span><strong data-output="k2">--</strong></div>
              <div class="sdl-detail-row"><span>k3 cover factor</span><strong data-output="k3">--</strong></div>
              <div class="sdl-detail-row"><span>k7 lap factor</span><strong data-output="k7">--</strong></div>
              <div class="sdl-detail-row"><span>Effective concrete strength</span><strong data-output="effective-concrete">--</strong></div>
              <div class="sdl-detail-row"><span>Minimum code length</span><strong data-output="minimum-length">--</strong></div>
              <div class="sdl-detail-row"><span>Spacing term</span><strong data-output="spacing-term">--</strong></div>
              <div class="sdl-detail-row"><span>Bundle factor</span><strong data-output="bundle-factor">--</strong></div>
              <div class="sdl-detail-row"><span>As,prov / As,req</span><strong data-output="reinforcement-ratio">--</strong></div>
            </div>
          </div>

          <div class="sdl-panel">
            <div class="sdl-panel-header">
              <h4>Hook or Cog Detailing</h4>
            </div>
            <div class="sdl-detail-grid">
              <div class="sdl-detail-row"><span>Hook type</span><strong data-output="hook-type-display">Not active</strong></div>
              <div class="sdl-detail-row"><span>Horizontal development segment</span><strong data-output="hook-horizontal">--</strong></div>
              <div class="sdl-detail-row"><span>Minimum extension</span><strong data-output="hook-extension">--</strong></div>
              <div class="sdl-detail-row"><span>Total hook length</span><strong data-output="hook-total">--</strong></div>
            </div>
            <p class="sdl-supporting-note" data-output="hook-note">Hook information appears when a hook or cog type is selected.</p>
          </div>

          <div class="sdl-compliance-list" data-role="compliance-list">
            <div class="sdl-compliance-item">
              <strong data-output="status-title">Ready to calculate</strong>
              <p data-output="status-text">Adjust the reinforcement inputs to update development and lap splice lengths instantly.</p>
            </div>
          </div>
        </section>
      </div>

      <div class="sdl-right-column">
        <section class="sdl-surface-card">
          <div class="sdl-card-header">
            <div>
              <h3>Design Inputs</h3>
              <p>Primary bar, material, and geometry inputs used by the development length equation.</p>
            </div>
          </div>

          <div class="sdl-input-grid">
            <label class="sdl-field">
              <span class="sdl-field-label">Bar Diameter, db</span>
              <span class="sdl-field-control"><input class="sdl-field-input" type="number" value="16" step="1" min="1" data-field="bar-diameter" /><span class="sdl-field-unit">mm</span></span>
              <em class="sdl-field-message" data-error-for="bar-diameter"></em>
            </label>
            <label class="sdl-field">
              <span class="sdl-field-label">Yield Strength, fsy</span>
              <span class="sdl-field-control"><input class="sdl-field-input" type="number" value="500" step="1" min="1" data-field="yield-strength" /><span class="sdl-field-unit">MPa</span></span>
              <em class="sdl-field-message" data-error-for="yield-strength"></em>
            </label>
            <label class="sdl-field">
              <span class="sdl-field-label">Concrete Strength, f'c</span>
              <span class="sdl-field-control"><input class="sdl-field-input" type="number" value="32" step="1" min="1" data-field="concrete-strength" /><span class="sdl-field-unit">MPa</span></span>
              <em class="sdl-field-message" data-error-for="concrete-strength"></em>
            </label>
            <label class="sdl-field">
              <span class="sdl-field-label">Cover to Bar, cd</span>
              <span class="sdl-field-control"><input class="sdl-field-input" type="number" value="40" step="1" min="1" data-field="cover" /><span class="sdl-field-unit">mm</span></span>
              <em class="sdl-field-message" data-error-for="cover"></em>
            </label>
            <label class="sdl-field">
              <span class="sdl-field-label">Element Type</span>
              <span class="sdl-select-control">
                <select class="sdl-field-input" data-field="element-type">
                  <option value="wide">Wide Element</option>
                  <option value="narrow">Narrow Element</option>
                </select>
              </span>
            </label>
            <label class="sdl-field">
              <span class="sdl-field-label">Splice Type</span>
              <span class="sdl-select-control">
                <select class="sdl-field-input" data-field="splice-type">
                  <option value="single">Single Bar</option>
                  <option value="bundle3">3-Bar Bundle</option>
                  <option value="bundle4">4-Bar Bundle</option>
                </select>
              </span>
            </label>
          </div>
        </section>

        <section class="sdl-surface-card">
          <button type="button" class="sdl-card-header sdl-collapsible-header" data-action="toggle-secondary-properties" aria-expanded="true">
            <div>
              <h3>Secondary Properties</h3>
              <p>Detailing conditions that influence lap length, hooks, and code modifiers.</p>
            </div>
            <span class="sdl-collapse-indicator" data-role="secondary-indicator">Hide</span>
          </button>

          <div class="sdl-collapsible-body" data-panel="secondary-properties">
            <div class="sdl-input-grid">
              <label class="sdl-field">
                <span class="sdl-field-label">Bar Spacing, sb</span>
                <span class="sdl-field-control"><input class="sdl-field-input" type="number" value="0" step="1" min="0" data-field="spacing" /><span class="sdl-field-unit">mm</span></span>
                <em class="sdl-field-message" data-error-for="spacing"></em>
              </label>
              <label class="sdl-field">
                <span class="sdl-field-label">Provided Steel Area, As,prov</span>
                <span class="sdl-field-control"><input class="sdl-field-input" type="number" value="0" step="1" min="0" data-field="area-provided" /><span class="sdl-field-unit">mm²</span></span>
                <em class="sdl-field-message" data-error-for="area-provided"></em>
              </label>
              <label class="sdl-field">
                <span class="sdl-field-label">Required Steel Area, As,req</span>
                <span class="sdl-field-control"><input class="sdl-field-input" type="number" value="0" step="1" min="0" data-field="area-required" /><span class="sdl-field-unit">mm²</span></span>
                <em class="sdl-field-message" data-error-for="area-required"></em>
              </label>
              <label class="sdl-field">
                <span class="sdl-field-label">Hook Type</span>
                <span class="sdl-select-control">
                  <select class="sdl-field-input" data-field="hook-type">
                    <option value="none">No hook or cog</option>
                    <option value="180">180 deg standard hook</option>
                    <option value="135">135 deg standard hook</option>
                    <option value="90cog">90 deg standard cog</option>
                  </select>
                </span>
              </label>
            </div>

            <div class="sdl-toggle-list">
              <label class="sdl-toggle-row">
                <span><strong>Horizontal reinforcement</strong><small>Activates the position factor when concrete below also applies.</small></span>
                <span class="sdl-toggle-switch"><input type="checkbox" checked data-field="is-horizontal" /></span>
              </label>
              <label class="sdl-toggle-row">
                <span><strong>More than 300 mm concrete below</strong><small>Used with horizontal reinforcement to apply k1 = 1.3.</small></span>
                <span class="sdl-toggle-switch"><input type="checkbox" checked data-field="has-concrete-below" /></span>
              </label>
              <label class="sdl-toggle-row">
                <span><strong>Slip-formed construction</strong><small>Applies the 30 percent development length increase.</small></span>
                <span class="sdl-toggle-switch"><input type="checkbox" data-field="is-slip-formed" /></span>
              </label>
            </div>
          </div>
        </section>

        <section class="sdl-surface-card">
          <button type="button" class="sdl-card-header sdl-collapsible-header" data-action="toggle-equations-panel" aria-expanded="false">
            <div>
              <h3>Equations and Parameters</h3>
              <p>Equation, symbols, and governing modifiers used in the live calculation.</p>
            </div>
            <span class="sdl-collapse-indicator" data-role="equation-indicator">Show</span>
          </button>

          <div class="sdl-collapsible-body is-collapsed" data-panel="equations-panel">
            <div class="sdl-equation-block">
              <p class="sdl-equation-title">Development Length Equation</p>
              <div class="sdl-math-formula" data-role="equation-primary"></div>
            </div>
            <div class="sdl-equation-block">
              <p class="sdl-equation-title">Lap Length Rules</p>
              <div class="sdl-math-formula" data-role="equation-secondary"></div>
            </div>

            <div class="sdl-symbol-grid">
              <div class="sdl-symbol-row"><span>k1</span><p>Bar position factor. Equals 1.3 only for horizontal bars with more than 300 mm of concrete below.</p></div>
              <div class="sdl-symbol-row"><span>k2</span><p>Bar size factor, calculated as (132 - db) / 100.</p></div>
              <div class="sdl-symbol-row"><span>k3</span><p>Cover factor, limited between 0.7 and 1.0.</p></div>
              <div class="sdl-symbol-row"><span>k7</span><p>Lap factor. Reduced from 1.25 to 1.0 only when As,prov is at least twice As,req.</p></div>
            </div>

            <div class="sdl-summary-chip-grid">
              <div class="sdl-summary-chip"><span>Active cover</span><strong data-output="summary-cover">--</strong></div>
              <div class="sdl-summary-chip"><span>Concrete cap</span><strong data-output="summary-concrete-cap">--</strong></div>
              <div class="sdl-summary-chip"><span>Lap mode</span><strong data-output="summary-lap-mode">--</strong></div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <section class="sdl-surface-card">
      <div class="sdl-card-header">
        <div>
          <h3>Saved Results</h3>
          <p>Store snapshots of scenarios with timestamped inputs and outputs.</p>
        </div>
        <button type="button" class="sdl-button sdl-button--ghost" data-action="clear-saved">Clear</button>
      </div>

      <div class="sdl-table-wrap">
        <table class="sdl-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>db</th>
              <th>fsy</th>
              <th>f'c</th>
              <th>cd</th>
              <th>Element</th>
              <th>Splice</th>
              <th>Lsy.tb</th>
              <th>Lsy.t.lap</th>
              <th>Lreq</th>
            </tr>
          </thead>
          <tbody data-role="saved-results">
            <tr><td class="sdl-empty-row" colspan="10">No saved scenarios yet.</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</section>
