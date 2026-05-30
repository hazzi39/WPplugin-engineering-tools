<?php
/**
 * Open section capacity premium calculator component.
 *
 * @var array<string, mixed> $context
 */

declare(strict_types=1);

if (! defined('ABSPATH')) {
    exit;
}

$instance_id = (string) $context['instance_id'];
?>
<section
  id="<?php echo esc_attr($instance_id); ?>"
  class="et-tool et-tool--oscp"
  data-et-tool="open-section-capacity-premium"
  data-et-instance="<?php echo esc_attr($instance_id); ?>"
  data-tool-slug="open-section-capacity-premium"
>
  <div class="et-oscp__shell">
    <header class="et-oscp__card et-oscp__header">
      <div>
        <p class="et-oscp__eyebrow"><?php echo esc_html($context['tool']->title()); ?></p>
        <h2 class="et-oscp__title">Steel open-section capacity workspace</h2>
        <p class="et-oscp__lead">Premium capacity checking for beams, columns, tees, and channels with live engineering visualisation.</p>
      </div>
      <div class="et-oscp__header-markers">
        <span class="et-oscp__status-chip">Real-time demand check</span>
      </div>
    </header>

    <main class="et-oscp__main-grid">
      <div class="et-oscp__left-column">
        <section class="et-oscp__card et-oscp__visual-card" data-export-visualization="true" data-export-caption="Section visualisation">
          <div class="et-oscp__card-header">
            <div>
              <h3>Live Section Visualisation</h3>
            </div>
          </div>
          <span class="et-oscp__sr-only" data-output="visual-status">Awaiting valid inputs</span>

          <div class="et-oscp__diagram-frame">
            <svg
              class="et-oscp__diagram"
              data-role="diagram"
              viewBox="0 0 420 280"
              role="img"
              aria-label="Steel section visualisation"
            ></svg>
          </div>

          <div class="et-oscp__visualization-caption" data-output="governing-note"></div>
        </section>

        <section class="et-oscp__card et-oscp__result-card">
          <div class="et-oscp__card-heading">
            <div>
              <h3>Result Summary</h3>
            </div>
            <span class="et-oscp__status-pill" data-output="status-pill">PENDING</span>
          </div>

          <div class="et-oscp__hero" data-role="hero-card" data-tone="idle">
            <span class="et-oscp__hero-label">GOVERNING UTILISATION</span>
            <strong class="et-oscp__hero-value" data-output="governing-utilisation">--</strong>
            <span class="et-oscp__hero-note" data-output="hero-note">Complete the section and load inputs to unlock the live result summary.</span>
          </div>

          <div class="et-oscp__metric-grid et-oscp__metric-grid--primary">
            <article class="et-oscp__metric et-oscp__metric--accent">
              <span>Reserve factor</span>
              <strong data-output="reserve-factor">--</strong>
            </article>
            <article class="et-oscp__metric">
              <span>Selected designation</span>
              <strong data-output="designation">--</strong>
            </article>
          </div>
          <div class="et-oscp__sr-only">
            <span data-output="status-text">--</span>
            <span data-output="major-utilisation">--</span>
            <span data-output="minor-utilisation">--</span>
            <span data-output="shear-utilisation">--</span>
            <span data-output="major-summary">--</span>
            <span data-output="minor-summary">--</span>
            <span data-output="shear-summary">--</span>
            <span data-output="governing-case">--</span>
            <span data-output="governing-capacity">--</span>
          </div>

          <div class="et-oscp__check-list" data-role="checks-list">
            <div class="et-oscp__check-row">
              <div>
                <strong>Awaiting valid inputs</strong>
                <span>Complete the section and load inputs to unlock the live result summary.</span>
              </div>
              <span class="et-oscp__check-ratio">--</span>
            </div>
          </div>

          <div class="et-oscp__actions">
            <button type="button" class="et-oscp__button et-oscp__button--primary" data-action="save-result">Save Result</button>
            <button type="button" class="et-oscp__button et-oscp__button--ghost" data-action="export-word-report">Export Word Report</button>
          </div>
          <p class="et-oscp__export-feedback" data-output="export-feedback"></p>
        </section>
      </div>

      <div class="et-oscp__right-column">
        <section class="et-oscp__card">
          <div class="et-oscp__card-heading">
            <div>
              <h3>Section Inputs</h3>
              <p>Choose the open section family and designation from the source table.</p>
            </div>
          </div>

          <div class="et-oscp__field-grid">
            <label class="et-oscp__field">
              <span class="et-oscp__label">Section family</span>
              <span class="et-oscp__control">
                <select class="et-oscp__input et-oscp__select" data-field="section-family"></select>
              </span>
              <em class="et-oscp__error" data-error-for="section-family"></em>
            </label>

            <label class="et-oscp__field">
              <span class="et-oscp__label">Designation</span>
              <span class="et-oscp__control">
                <select class="et-oscp__input et-oscp__select" data-field="designation"></select>
              </span>
              <em class="et-oscp__error" data-error-for="designation"></em>
            </label>
          </div>
        </section>

        <section class="et-oscp__card">
          <div class="et-oscp__card-heading">
            <div>
              <h3>Load Case</h3>
              <p>Demand values are evaluated in real time against the tabulated design capacities.</p>
            </div>
          </div>

          <div class="et-oscp__field-grid">
            <label class="et-oscp__field">
              <span class="et-oscp__label">Applied major-axis moment</span>
              <span class="et-oscp__control">
                <input class="et-oscp__input" type="number" inputmode="decimal" step="0.1" min="0" value="10" data-field="major" />
                <span class="et-oscp__unit">kN.m</span>
              </span>
              <em class="et-oscp__error" data-error-for="major"></em>
            </label>

            <label class="et-oscp__field">
              <span class="et-oscp__label">Applied minor-axis moment</span>
              <span class="et-oscp__control">
                <input class="et-oscp__input" type="number" inputmode="decimal" step="0.1" min="0" value="0" data-field="minor" />
                <span class="et-oscp__unit">kN.m</span>
              </span>
              <em class="et-oscp__error" data-error-for="minor"></em>
            </label>

            <label class="et-oscp__field">
              <span class="et-oscp__label">Applied design shear</span>
              <span class="et-oscp__control">
                <input class="et-oscp__input" type="number" inputmode="decimal" step="0.1" min="0" value="8" data-field="shear" />
                <span class="et-oscp__unit">kN</span>
              </span>
              <em class="et-oscp__error" data-error-for="shear"></em>
            </label>
          </div>

          <label class="et-oscp__field">
            <span class="et-oscp__label">Major-axis bending case</span>
            <span class="et-oscp__control">
              <select class="et-oscp__input et-oscp__select" data-field="major-case"></select>
            </span>
            <em class="et-oscp__error" data-error-for="major-case"></em>
          </label>

          <label class="et-oscp__field">
            <span class="et-oscp__label">Minor-axis bending case</span>
            <span class="et-oscp__control">
              <select class="et-oscp__input et-oscp__select" data-field="minor-case"></select>
            </span>
            <em class="et-oscp__error" data-error-for="minor-case"></em>
          </label>
        </section>

        <section class="et-oscp__card">
          <div class="et-oscp__card-heading">
            <div>
              <h3>Secondary Properties</h3>
              <p>Quick reference values to support engineering review and reporting.</p>
            </div>
          </div>

          <div class="et-oscp__metric-grid et-oscp__metric-grid--secondary">
            <article class="et-oscp__metric">
              <span>Section family</span>
              <strong data-output="section-type">--</strong>
            </article>
            <article class="et-oscp__metric">
              <span>Material grade</span>
              <strong data-output="grade">--</strong>
            </article>
            <article class="et-oscp__metric">
              <span>Nominal depth</span>
              <strong data-output="nominal-depth">--</strong>
            </article>
            <article class="et-oscp__metric">
              <span>Estimated flange width</span>
              <strong data-output="flange-width">--</strong>
            </article>
            <article class="et-oscp__metric">
              <span>Major Capacity</span>
              <strong data-output="major-capacity">--</strong>
              <small data-output="major-capacity-label">Selected case</small>
            </article>
            <article class="et-oscp__metric">
              <span>Minor Capacity</span>
              <strong data-output="minor-capacity">--</strong>
              <small data-output="minor-capacity-label">Selected case</small>
            </article>
            <article class="et-oscp__metric">
              <span>Shear Capacity</span>
              <strong data-output="shear-capacity">--</strong>
              <small data-output="shear-capacity-label">Shear resistance</small>
            </article>
          </div>
        </section>

        <section class="et-oscp__card">
          <details class="et-oscp__equation-panel">
            <summary class="et-oscp__card-heading et-oscp__disclosure-summary">
              <div>
                <h3>Equation Set</h3>
              </div>
            </summary>
            <div class="et-oscp__equation-stack">
              <article class="et-oscp__equation-card">
                <div class="et-oscp__math" data-role="equation-primary"></div>
              </article>
              <article class="et-oscp__equation-card et-oscp__equation-card--highlight">
                <div class="et-oscp__math" data-role="equation-secondary"></div>
              </article>
            </div>
          </details>
        </section>
      </div>
    </main>

    <section class="et-oscp__card">
      <div class="et-oscp__card-heading">
        <div>
          <h3>Saved Results</h3>
          <p>Saved demand checks are retained in the browser for quick comparison.</p>
        </div>
        <button type="button" class="et-oscp__button et-oscp__button--ghost" data-action="clear-results">Clear</button>
      </div>

      <div class="et-oscp__table-wrap">
        <table class="et-oscp__table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Section</th>
              <th>Designation</th>
              <th>Mx*</th>
              <th>My*</th>
              <th>V*</th>
              <th>UTILISATION</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody data-role="saved-results">
            <tr>
              <td class="et-oscp__empty-row" colspan="8">No results saved yet. Run a valid check, then save it to build a comparison table.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</section>
