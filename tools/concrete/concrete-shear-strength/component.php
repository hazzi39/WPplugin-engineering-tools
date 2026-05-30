<?php
/**
 * RC shear strength calculator component.
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
  class="et-tool et-tool--concrete-shear-strength"
  data-et-tool="concrete-shear-strength"
  data-et-instance="<?php echo esc_attr($instance_id); ?>"
  data-tool-slug="concrete-shear-strength"
>
  <div class="et-css__shell">
    <header class="et-css__card et-css__header">
      <div>
        <p class="et-css__eyebrow">Concrete Shear Strength</p>
        <h2 class="et-css__title"><?php echo esc_html($context['tool']->title()); ?></h2>
      </div>
      <p class="et-css__lead">
        Reinforced concrete web shear verification with live section detailing, exact engineering notation, and instant design checks.
      </p>
    </header>

    <main class="et-css__main-grid">
      <div class="et-css__left-column">
        <section class="et-css__card et-css__visual-card">
          <div class="et-css__card-header">
            <div>
              <p class="et-css__card-kicker">Visualisation</p>
              <h3>Live Shear Mechanism</h3>
            </div>
            <span class="et-css__status-chip" data-output="visual-status">Awaiting valid inputs</span>
          </div>

          <div class="et-css__visual-frame">
            <svg
              class="et-css__diagram"
              data-role="diagram"
              viewBox="0 0 640 420"
              role="img"
              aria-label="RC shear strength section visualisation"
            ></svg>
          </div>
        </section>

        <section class="et-css__card et-css__result-card">
          <div class="et-css__card-header">
            <div>
              <p class="et-css__card-kicker">Result</p>
              <h3>Design Capacity</h3>
            </div>
            <span class="et-css__status-pill" data-output="status-pill">No result</span>
          </div>

          <div class="et-css__hero-card" data-role="hero-card" data-tone="idle">
            <span class="et-css__hero-label">&phi;V<sub>u</sub></span>
            <strong class="et-css__hero-value" data-output="phi-vu">--</strong>
            <p class="et-css__hero-note" data-output="hero-note">
              Complete the required inputs to evaluate design shear strength.
            </p>
          </div>

          <div class="et-css__metric-grid et-css__metric-grid--primary">
            <article class="et-css__metric-card et-css__metric-card--accent">
              <span>Net Demand</span>
              <strong data-output="net-demand">--</strong>
              <small>V* - &gamma;<sub>p</sub>P<sub>v</sub></small>
            </article>
            <article class="et-css__metric-card">
              <span>Concrete Contribution</span>
              <strong data-output="vuc">--</strong>
              <small>V<sub>uc</sub></small>
            </article>
            <article class="et-css__metric-card">
              <span>Shear Steel Contribution</span>
              <strong data-output="vus">--</strong>
              <small>V<sub>us</sub></small>
            </article>
            <article class="et-css__metric-card">
              <span>Minimum A<sub>sv</sub></span>
              <strong data-output="asv-min">--</strong>
              <small>mm&sup2;</small>
            </article>
          </div>

          <div class="et-css__notice-panel">
            <h4>Validation and Checks</h4>
            <ul class="et-css__check-list" data-role="checks-list">
              <li class="et-css__check-item et-css__check-item--warn">
                <strong>Input validation</strong>
                <p>Each field must be numeric and within the engineering limits before results are shown.</p>
              </li>
            </ul>
          </div>

          <div class="et-css__result-actions">
            <button type="button" class="et-css__button et-css__button--primary" data-action="save-result">Save Result</button>
          </div>
        </section>
      </div>

      <div class="et-css__right-column">
        <section class="et-css__card">
          <div class="et-css__card-header">
            <div>
              <p class="et-css__card-kicker">Inputs</p>
              <h3>Load, Section, and Reinforcement</h3>
            </div>
            <button type="button" class="et-css__button et-css__button--ghost" data-action="reset-form">Reset</button>
          </div>

          <div class="et-css__group-stack">
            <section class="et-css__input-group">
              <div class="et-css__mini-header">
                <h4>Applied Actions</h4>
                <span>Factored design actions</span>
              </div>
              <div class="et-css__field-grid">
                <label class="et-css__field">
                  <span class="et-css__label">V*</span>
                  <span class="et-css__control"><input class="et-css__input" type="number" step="0.1" min="0" value="400" data-field="v-star" /><span class="et-css__unit">kN</span></span>
                  <em class="et-css__error" data-error-for="v-star"></em>
                </label>
                <label class="et-css__field">
                  <span class="et-css__label">M*</span>
                  <span class="et-css__control"><input class="et-css__input" type="number" step="0.1" min="0" value="25" data-field="m-star" /><span class="et-css__unit">kN&middot;m</span></span>
                  <em class="et-css__error" data-error-for="m-star"></em>
                </label>
                <label class="et-css__field">
                  <span class="et-css__label">N*</span>
                  <span class="et-css__control"><input class="et-css__input" type="number" step="0.1" value="50" data-field="n-star" /><span class="et-css__unit">kN</span></span>
                  <em class="et-css__error" data-error-for="n-star"></em>
                </label>
                <label class="et-css__field">
                  <span class="et-css__label">P<sub>v</sub></span>
                  <span class="et-css__control"><input class="et-css__input" type="number" step="0.1" min="0" value="0" data-field="p-v" /><span class="et-css__unit">kN</span></span>
                  <em class="et-css__error" data-error-for="p-v"></em>
                </label>
                <label class="et-css__field">
                  <span class="et-css__label">&gamma;<sub>p</sub></span>
                  <span class="et-css__control"><input class="et-css__input" type="number" step="0.01" min="0" max="1.2" value="1.00" data-field="gamma-p" /><span class="et-css__unit">factor</span></span>
                  <em class="et-css__error" data-error-for="gamma-p"></em>
                </label>
              </div>
            </section>

            <section class="et-css__input-group">
              <div class="et-css__mini-header">
                <h4>Section Geometry</h4>
                <span>Concrete web dimensions</span>
              </div>
              <div class="et-css__field-grid">
                <label class="et-css__field">
                  <span class="et-css__label">b<sub>v</sub></span>
                  <span class="et-css__control"><input class="et-css__input" type="number" step="1" min="100" value="600" data-field="b-v" /><span class="et-css__unit">mm</span></span>
                  <em class="et-css__error" data-error-for="b-v"></em>
                </label>
                <label class="et-css__field">
                  <span class="et-css__label">d<sub>v</sub></span>
                  <span class="et-css__control"><input class="et-css__input" type="number" step="1" min="100" value="800" data-field="d-v" /><span class="et-css__unit">mm</span></span>
                  <em class="et-css__error" data-error-for="d-v"></em>
                </label>
                <label class="et-css__field">
                  <span class="et-css__label">d<sub>g</sub></span>
                  <span class="et-css__control"><input class="et-css__input" type="number" step="1" min="0" value="20" data-field="d-g" /><span class="et-css__unit">mm</span></span>
                  <em class="et-css__error" data-error-for="d-g"></em>
                </label>
                <label class="et-css__field">
                  <span class="et-css__label">f&prime;<sub>c</sub></span>
                  <span class="et-css__control"><input class="et-css__input" type="number" step="1" min="20" value="40" data-field="f-c" /><span class="et-css__unit">MPa</span></span>
                  <em class="et-css__error" data-error-for="f-c"></em>
                </label>
              </div>
            </section>

            <section class="et-css__input-group">
              <div class="et-css__mini-header">
                <h4>Longitudinal Reinforcement</h4>
                <span>Derived A<sub>st</sub> from bar detailing</span>
              </div>
              <div class="et-css__field-grid">
                <label class="et-css__field">
                  <span class="et-css__label">n<sub>b</sub></span>
                  <span class="et-css__control"><input class="et-css__input" type="number" step="1" min="2" value="4" data-field="longitudinal-bar-count" /><span class="et-css__unit">bars</span></span>
                  <em class="et-css__error" data-error-for="longitudinal-bar-count"></em>
                </label>
                <label class="et-css__field">
                  <span class="et-css__label">&phi;<sub>s</sub></span>
                  <span class="et-css__control"><input class="et-css__input" type="number" step="1" min="10" value="32" data-field="longitudinal-bar-diameter" /><span class="et-css__unit">mm</span></span>
                  <em class="et-css__error" data-error-for="longitudinal-bar-diameter"></em>
                </label>
                <label class="et-css__field">
                  <span class="et-css__label">A<sub>pt</sub></span>
                  <span class="et-css__control"><input class="et-css__input" type="number" step="1" min="0" value="0" data-field="a-pt" /><span class="et-css__unit">mm&sup2;</span></span>
                  <em class="et-css__error" data-error-for="a-pt"></em>
                </label>
                <label class="et-css__field">
                  <span class="et-css__label">f<sub>po</sub></span>
                  <span class="et-css__control"><input class="et-css__input" type="number" step="1" min="0" value="0" data-field="f-po" /><span class="et-css__unit">MPa</span></span>
                  <em class="et-css__error" data-error-for="f-po"></em>
                </label>
                <label class="et-css__field">
                  <span class="et-css__label">E<sub>s</sub></span>
                  <span class="et-css__control"><input class="et-css__input" type="number" step="1" min="100000" value="200000" data-field="e-s" /><span class="et-css__unit">MPa</span></span>
                  <em class="et-css__error" data-error-for="e-s"></em>
                </label>
                <label class="et-css__field">
                  <span class="et-css__label">E<sub>p</sub></span>
                  <span class="et-css__control"><input class="et-css__input" type="number" step="1" min="100000" value="195000" data-field="e-p" /><span class="et-css__unit">MPa</span></span>
                  <em class="et-css__error" data-error-for="e-p"></em>
                </label>
              </div>
            </section>

            <section class="et-css__input-group">
              <div class="et-css__mini-header">
                <h4>Shear Reinforcement</h4>
                <span>Derived A<sub>sv</sub> from arrangement</span>
              </div>
              <div class="et-css__field-grid">
                <label class="et-css__field">
                  <span class="et-css__label">n<sub>s</sub></span>
                  <span class="et-css__control"><input class="et-css__input" type="number" step="1" min="1" value="1" data-field="stirrup-sets" /><span class="et-css__unit">sets</span></span>
                  <em class="et-css__error" data-error-for="stirrup-sets"></em>
                </label>
                <label class="et-css__field">
                  <span class="et-css__label">n<sub>l</sub></span>
                  <span class="et-css__control"><input class="et-css__input" type="number" step="1" min="1" value="2" data-field="leg-count" /><span class="et-css__unit">legs</span></span>
                  <em class="et-css__error" data-error-for="leg-count"></em>
                </label>
                <label class="et-css__field">
                  <span class="et-css__label">&phi;<sub>v</sub></span>
                  <span class="et-css__control"><input class="et-css__input" type="number" step="1" min="6" value="12" data-field="bar-diameter" /><span class="et-css__unit">mm</span></span>
                  <em class="et-css__error" data-error-for="bar-diameter"></em>
                </label>
                <label class="et-css__field">
                  <span class="et-css__label">s</span>
                  <span class="et-css__control"><input class="et-css__input" type="number" step="1" min="50" value="300" data-field="s" /><span class="et-css__unit">mm</span></span>
                  <em class="et-css__error" data-error-for="s"></em>
                </label>
                <label class="et-css__field">
                  <span class="et-css__label">f<sub>sy,f</sub></span>
                  <span class="et-css__control"><input class="et-css__input" type="number" step="1" min="200" max="750" value="500" data-field="f-syf" /><span class="et-css__unit">MPa</span></span>
                  <em class="et-css__error" data-error-for="f-syf"></em>
                </label>
                <label class="et-css__field">
                  <span class="et-css__label">&alpha;<sub>v</sub></span>
                  <span class="et-css__control"><input class="et-css__input" type="number" step="1" min="1" max="90" value="90" data-field="alpha-v" /><span class="et-css__unit">deg</span></span>
                  <em class="et-css__error" data-error-for="alpha-v"></em>
                </label>
              </div>
            </section>
          </div>
        </section>

        <section class="et-css__card">
          <button type="button" class="et-css__collapse" data-action="toggle-secondary" aria-expanded="false">
            <span>
              <span class="et-css__card-kicker">Secondary Properties</span>
              <strong>Derived Engineering Values</strong>
            </span>
            <span data-role="secondary-toggle-label">Show</span>
          </button>
          <div class="et-css__collapse-panel is-collapsed" data-panel="secondary">
            <div class="et-css__metric-grid et-css__metric-grid--secondary">
              <article class="et-css__metric-card"><span>A<sub>st</sub></span><strong data-output="a-st">--</strong><small>Longitudinal steel area</small></article>
              <article class="et-css__metric-card"><span>A<sub>sv</sub></span><strong data-output="a-sv">--</strong><small>Shear steel area</small></article>
              <article class="et-css__metric-card"><span>A&#772;<sub>s</sub></span><strong data-output="single-longitudinal-area">--</strong><small>One longitudinal bar</small></article>
              <article class="et-css__metric-card"><span>A&#772;<sub>v</sub></span><strong data-output="single-shear-area">--</strong><small>One shear bar</small></article>
              <article class="et-css__metric-card"><span>k<sub>v</sub></span><strong data-output="k-v">--</strong><small>Shear coefficient</small></article>
              <article class="et-css__metric-card"><span>&epsilon;<sub>x</sub></span><strong data-output="epsilon-x">--</strong><small>Longitudinal strain</small></article>
              <article class="et-css__metric-card"><span>k<sub>dg</sub></span><strong data-output="k-dg">--</strong><small>Aggregate factor</small></article>
              <article class="et-css__metric-card"><span>&theta;<sub>v</sub></span><strong data-output="theta-v">--</strong><small>Compression field angle</small></article>
              <article class="et-css__metric-card"><span>&radic;f&prime;<sub>c</sub></span><strong data-output="sqrt-fc">--</strong><small>Concrete term</small></article>
              <article class="et-css__metric-card"><span>&Sigma;EA</span><strong data-output="longitudinal-stiffness">--</strong><small>Longitudinal stiffness term</small></article>
            </div>
          </div>
        </section>

        <section class="et-css__card">
          <button type="button" class="et-css__collapse" data-action="toggle-equations" aria-expanded="false">
            <span>
              <span class="et-css__card-kicker">Equations</span>
              <strong>Governing Expressions</strong>
            </span>
            <span data-role="equation-toggle-label">Show</span>
          </button>
          <div class="et-css__collapse-panel is-collapsed" data-panel="equations">
            <div class="et-css__equation-block">
              <p class="et-css__equation-title">Strength check</p>
              <div class="et-css__math" data-role="equation-primary"></div>
            </div>
            <div class="et-css__equation-block">
              <p class="et-css__equation-title">Derived steel areas and resistance</p>
              <div class="et-css__math" data-role="equation-secondary"></div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <section class="et-css__card">
      <div class="et-css__card-header">
        <div>
          <p class="et-css__card-kicker">Saved Results</p>
          <h3>Design Snapshots</h3>
        </div>
        <button type="button" class="et-css__button et-css__button--ghost" data-action="clear-results">Clear</button>
      </div>

      <div class="et-css__table-wrap">
        <table class="et-css__table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Section</th>
              <th>Longitudinal Steel</th>
              <th>Shear Steel</th>
              <th>&phi;V<sub>u</sub></th>
              <th>Demand</th>
              <th>Utilisation</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody data-role="saved-results">
            <tr>
              <td class="et-css__empty-row" colspan="8">No saved scenarios yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</section>
