<?php
/**
 * RC column designer component.
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
    (string) ($context['tag'] ?? 'rc_column_designer')
);
?>
<section
  id="<?php echo esc_attr($instanceId); ?>"
  class="et-tool et-tool--rc-column"
  data-tool-slug="rc-column-designer"
  data-instance-id="<?php echo esc_attr($instanceId); ?>"
  data-report-company="<?php echo esc_attr((string) $reportSettings['company']); ?>"
  data-report-project="<?php echo esc_attr((string) $reportSettings['project']); ?>"
  data-report-prepared-by="<?php echo esc_attr((string) $reportSettings['prepared_by']); ?>"
  data-report-disclaimer="<?php echo esc_attr((string) $reportSettings['disclaimer']); ?>"
><div class="app-shell">
    <header class="app-header surface-card">
      <div>
        <p class="eyebrow">Unified RC Column Design</p>
        <h1>Interaction-Based Column Designer</h1>
      </div>
    </header>

    <main class="main-grid">
      <div class="left-column">
        <section class="surface-card visual-card">
          <div class="card-header">
            <div>
              <p class="eyebrow">Visualisation</p>
              <h2>Section + Interaction View</h2>
            </div>
            <span id="visual-caption" class="summary-pill">Awaiting inputs</span>
          </div>
          <div class="diagram-frame">
            <svg id="diagram-svg" viewBox="0 0 1120 640" role="img" aria-label="RC column section and interaction diagram"></svg>
          </div>
        </section>

        <section class="surface-card result-card">
          <div class="card-header">
            <div>
              <p class="eyebrow">Result</p>
              <h2>Design Capacity Check</h2>
            </div>
            <div class="result-actions">
              <button id="save-result" class="primary-button" type="button">Save Result</button>
              <button id="export-pdf" class="secondary-button" type="button">Export PDF</button>
            </div>
          </div>

          <div class="result-highlight" data-tooltip="Overall demand-to-capacity ratio based on the amplified design moment and the phi-reduced interaction curve.">
            <div class="result-main">
              <span class="result-label">Utilisation</span>
              <strong id="utilisation-value">--</strong>
              <span class="result-unit">η</span>
            </div>
            <div id="result-status" class="result-status">Complete the required inputs to evaluate the column.</div>
          </div>

          <div class="result-grid">
            <article class="metric-card emphasis" data-tooltip="Overall pass / review / fail state derived from utilisation."><span>Status</span><strong id="status-value">--</strong><small>design state</small></article>
            <article class="metric-card" data-tooltip="Currently active section geometry used by the interaction analysis."><span>Section Type</span><strong id="section-type-value">--</strong><small>active geometry</small></article>
            <article class="metric-card" data-tooltip="Code-style slenderness outcome based on the general limit for Le / r."><span>Slenderness Check</span><strong id="classification-value">--</strong><small>Le / r review</small></article>
            <article class="metric-card" data-tooltip="Design bending moment after second-order magnification has been applied."><span>Amplified Moment</span><strong id="amplified-moment-value">--</strong><small>kNm</small></article>
            <article class="metric-card" data-tooltip="Available phi-reduced moment capacity at the same eccentricity line as the design action."><span>Capacity on Demand Line</span><strong id="capacity-moment-value">--</strong><small>kNm</small></article>
            <article class="metric-card" data-tooltip="Available phi-reduced axial capacity at the interaction-point intersection with the demand line."><span>Capacity Axial Force</span><strong id="capacity-axial-value">--</strong><small>kN</small></article>
            <article class="metric-card" data-tooltip="Phi-reduced squash-load capacity of the section in near-uniform compression."><span>Pure Compression</span><strong id="pure-compression-value">--</strong><small>kN</small></article>
            <article class="metric-card" data-tooltip="Phi-reduced pure bending capacity where axial force is zero."><span>Pure Bending</span><strong id="pure-bending-value">--</strong><small>kNm</small></article>
            <article class="metric-card" data-tooltip="Phi-reduced balanced failure moment where concrete reaches ultimate strain and extreme tension steel yields."><span>Balanced Moment</span><strong id="balanced-moment-value">--</strong><small>kNm</small></article>
            <article class="metric-card" data-tooltip="Phi-reduced balanced failure axial force corresponding to the balanced moment point."><span>Balanced Axial</span><strong id="balanced-axial-value">--</strong><small>kN</small></article>
            <article class="metric-card" data-tooltip="Governing moment magnifier. For braced columns this is δb. For unbraced columns this is the larger of δb and δs."><span>Moment Magnifier</span><strong id="delta-value">--</strong><small>δ</small></article>
            <article class="metric-card" data-tooltip="Maximum allowable tie or helix pitch based on the lesser-dimension and 15db checks."><span>Tie / Helix Limit</span><strong id="tie-spacing-value">--</strong><small>mm</small></article>
          </div>
        </section>
      </div>

      <div class="right-column">
        <section class="surface-card inputs-card">
          <div class="card-header">
            <div>
              <p class="eyebrow">Inputs</p>
              <h2>Project + Design Actions</h2>
            </div>
          </div>

          <form id="calculator-form" novalidate>
            <div class="input-groups">
              <div class="input-group">
                <h3>Global Settings</h3>
                <div class="field-grid">
                  <label class="input-field" data-tooltip="Choose the cross-section type. The app switches to the corresponding interaction analysis and section visualisation."><span>Section Shape</span><div class="input-shell"><select id="sectionType"><option value="rectangular">Rectangular</option><option value="circular">Circular</option></select></div><em class="field-error" data-error-for="sectionType"></em></label>
                  <label class="input-field" data-tooltip="Specified concrete compressive strength used in the stress block and capacity calculations."><span>Concrete Strength, f&prime;<sub>c</sub></span><div class="input-shell"><input id="fc" type="number" step="1" value="40"><small>MPa</small></div><em class="field-error" data-error-for="fc"></em></label>
                  <label class="input-field" data-tooltip="Yield stress of the longitudinal reinforcement."><span>Steel Yield Strength, f<sub>sy</sub></span><div class="input-shell"><input id="fsy" type="number" step="1" value="500"><small>MPa</small></div><em class="field-error" data-error-for="fsy"></em></label>
                  <label class="input-field" data-tooltip="Elastic modulus used to convert bar strain to stress before capping at yield."><span>Steel Modulus, E<sub>s</sub></span><div class="input-shell"><input id="Es" type="number" step="1000" value="200000"><small>MPa</small></div><em class="field-error" data-error-for="Es"></em></label>
                  <label class="input-field" data-tooltip="Strength reduction factor applied to the nominal interaction curve."><span>Strength Factor, &phi;</span><div class="input-shell"><input id="phi" type="number" step="0.01" value="0.6"><small>factor</small></div><em class="field-error" data-error-for="phi"></em></label>
                  <label class="input-field" data-tooltip="Clear concrete cover to the outer face of the longitudinal reinforcement."><span>Clear Cover</span><div class="input-shell"><input id="cover" type="number" step="1" value="45"><small>mm</small></div><em class="field-error" data-error-for="cover"></em></label>
                  <label class="input-field" data-tooltip="Factored design axial compression on the column section."><span>Design Axial Force, N*</span><div class="input-shell"><input id="Nstar" type="number" step="1" value="1600"><small>kN</small></div><em class="field-error" data-error-for="Nstar"></em></label>
                  <label class="input-field" data-tooltip="Factored first-order design moment before magnification."><span>Design Moment, M*</span><div class="input-shell"><input id="Mstar" type="number" step="1" value="150"><small>kNm</small></div><em class="field-error" data-error-for="Mstar"></em></label>
                </div>
              </div>

              <div class="input-group">
                <h3>Slenderness + Stability</h3>
                <div class="field-grid">
                  <label class="input-field" data-tooltip="Select whether the column is part of a braced or unbraced frame. This changes the moment magnifier methodology."><span>Frame Type</span><div class="input-shell"><select id="frameType"><option value="braced">Braced</option><option value="unbraced">Unbraced</option></select></div><em class="field-error" data-error-for="frameType"></em></label>
                  <label class="input-field" data-tooltip="Unsupported clear height of the column between restraint points."><span>Clear Height, L<sub>u</sub></span><div class="input-shell"><input id="Lu" type="number" step="1" value="4500"><small>mm</small></div><em class="field-error" data-error-for="Lu"></em></label>
                  <label class="input-field" data-tooltip="Select the simple end-restraint condition from the attached figure. The app assigns the corresponding effective length factor k automatically."><span>Restraint Condition</span><div class="input-shell"><select id="restraintCase"></select></div><em class="field-error" data-error-for="restraintCase"></em></label>
                  <label class="input-field" data-tooltip="Effective length factor k automatically assigned from the selected restraint condition."><span>Effective Length Factor, k</span><div class="input-shell"><input id="kFactorDisplay" type="text" value="0.85" readonly><small>factor</small></div><em class="field-error" data-error-for="kFactorDisplay"></em></label>
                  <label class="input-field" data-tooltip="Moment distribution factor used in the magnifier expression."><span>Moment Factor, k<sub>m</sub></span><div class="input-shell"><input id="km" type="number" step="0.01" value="1.0"><small>factor</small></div><em class="field-error" data-error-for="km"></em></label>
                  <label class="input-field" data-tooltip="Factored axial force due to permanent effects at ULS. Used to determine beta_d per the attached methodology."><span>Permanent Axial Force, N<sub>G</sub>*</span><div class="input-shell"><input id="NGstar" type="number" step="1" value="800"><small>kN</small></div><em class="field-error" data-error-for="NGstar"></em></label>
                  <label class="input-field" data-tooltip="General code upper limit for Le/r unless a more rigorous analysis is carried out."><span>General Slenderness Limit</span><div class="input-shell"><input id="maxSlenderness" type="number" step="1" value="120"><small>ratio</small></div><em class="field-error" data-error-for="maxSlenderness"></em></label>
                  <label class="input-field" data-tooltip="Diameter of tie or helical reinforcement used for spacing / pitch checks."><span>Tie / Spiral Bar Diameter</span><div class="input-shell"><input id="tieBarDia" type="number" step="1" value="12"><small>mm</small></div><em class="field-error" data-error-for="tieBarDia"></em></label>
                </div>
              </div>

              <div id="unbraced-group" class="input-group section-geometry-group is-hidden">
                <h3>Unbraced Magnifier Parameters</h3>
                <div class="field-grid">
                  <label class="input-field" data-tooltip="Choose how delta_s is evaluated for an unbraced column."><span>δ<sub>s</sub> Method</span><div class="input-shell"><select id="unbracedMethod"><option value="storey">Storey Summation</option><option value="elastic">Elastic Buckling Alternative</option></select></div><em class="field-error" data-error-for="unbracedMethod"></em></label>
                  <label id="storey-nsum-field" class="input-field" data-tooltip="Sum of factored axial loads for all columns within the storey or bent used in the delta_s summation method."><span>Storey Sum, ΣN*</span><div class="input-shell"><input id="sumNstar" type="number" step="1" value="2400"><small>kN</small></div><em class="field-error" data-error-for="sumNstar"></em></label>
                  <label id="storey-nc-field" class="input-field" data-tooltip="Sum of buckling loads for the storey or bent used in the delta_s summation method."><span>Storey Sum, ΣN<sub>c</sub></span><div class="input-shell"><input id="sumNc" type="number" step="1" value="9000"><small>kN</small></div><em class="field-error" data-error-for="sumNc"></em></label>
                  <label id="lambda-uc-field" class="input-field is-hidden" data-tooltip="Ratio of the elastic critical buckling load of the entire frame to the design load for strength, used in the alternative unbraced method."><span>Frame Buckling Ratio, λ<sub>uc</sub></span><div class="input-shell"><input id="lambdaUc" type="number" step="0.01" value="4.0"><small>ratio</small></div><em class="field-error" data-error-for="lambdaUc"></em></label>
                </div>
              </div>

              <div id="rectangular-group" class="input-group section-geometry-group">
                <h3>Rectangular Section Geometry</h3>
                <div class="field-grid">
                  <label class="input-field" data-tooltip="Rectangular section width measured normal to the bending axis shown."><span>Width, b</span><div class="input-shell"><input id="rect_b" type="number" step="1" value="300"><small>mm</small></div><em class="field-error" data-error-for="rect_b"></em></label>
                  <label class="input-field" data-tooltip="Overall rectangular section depth in the compression-to-tension direction."><span>Depth, D</span><div class="input-shell"><input id="rect_D" type="number" step="1" value="400"><small>mm</small></div><em class="field-error" data-error-for="rect_D"></em></label>
                  <label class="input-field" data-tooltip="Diameter of the longitudinal reinforcement bars in the rectangular section."><span>Main Bar Diameter</span><div class="input-shell"><input id="rect_barDia" type="number" step="1" value="24"><small>mm</small></div><em class="field-error" data-error-for="rect_barDia"></em></label>
                  <label class="input-field" data-tooltip="Number of bars placed in the top compression face."><span>Top Bars</span><div class="input-shell"><input id="rect_topBars" type="number" step="1" value="4"><small>count</small></div><em class="field-error" data-error-for="rect_topBars"></em></label>
                  <label class="input-field" data-tooltip="Number of bars placed in the bottom face."><span>Bottom Bars</span><div class="input-shell"><input id="rect_bottomBars" type="number" step="1" value="4"><small>count</small></div><em class="field-error" data-error-for="rect_bottomBars"></em></label>
                  <label class="input-field" data-tooltip="Intermediate bars placed on each side face between the top and bottom layers."><span>Side Bars per Face</span><div class="input-shell"><input id="rect_sideBars" type="number" step="1" value="0"><small>count</small></div><em class="field-error" data-error-for="rect_sideBars"></em></label>
                </div>
              </div>

              <div id="circular-group" class="input-group section-geometry-group is-hidden">
                <h3>Circular Section Geometry</h3>
                <div class="field-grid">
                  <label class="input-field" data-tooltip="Overall diameter of the circular column section."><span>Diameter, D</span><div class="input-shell"><input id="circle_D" type="number" step="1" value="500"><small>mm</small></div><em class="field-error" data-error-for="circle_D"></em></label>
                  <label class="input-field" data-tooltip="Diameter of each longitudinal bar placed around the circular perimeter."><span>Main Bar Diameter</span><div class="input-shell"><input id="circle_barDia" type="number" step="1" value="24"><small>mm</small></div><em class="field-error" data-error-for="circle_barDia"></em></label>
                  <label class="input-field" data-tooltip="Number of equally spaced longitudinal bars around the circular section."><span>Number of Bars</span><div class="input-shell"><input id="circle_barCount" type="number" step="1" value="8"><small>count</small></div><em class="field-error" data-error-for="circle_barCount"></em></label>
                </div>
              </div>
            </div>
          </form>
        </section>

        <section class="surface-card properties-card">
          <div class="card-header">
            <div>
              <p class="eyebrow">Secondary Properties</p>
              <h2>Method + Intermediate Values</h2>
            </div>
          </div>

          <div class="secondary-grid">
            <article class="metric-card" data-tooltip="Equivalent rectangular stress-block factor alpha2 used in the compression block force."><span>&alpha;<sub>2</sub></span><strong id="alpha2-value">--</strong><small>stress block</small></article>
            <article class="metric-card" data-tooltip="Equivalent stress-block depth factor gamma used to convert neutral-axis depth to compression-block depth."><span>&gamma;</span><strong id="gamma-value">--</strong><small>stress block</small></article>
            <article class="metric-card" data-tooltip="Gross concrete section area before subtracting steel."><span>Gross Area</span><strong id="area-value">--</strong><small>mm²</small></article>
            <article class="metric-card" data-tooltip="Total area of longitudinal reinforcement used in the section model."><span>Steel Area</span><strong id="steel-area-value">--</strong><small>mm²</small></article>
            <article class="metric-card" data-tooltip="Effective column length used in the slenderness check."><span>Effective Length</span><strong id="le-value">--</strong><small>mm</small></article>
            <article class="metric-card" data-tooltip="Radius of gyration used to evaluate column slenderness."><span>Radius of Gyration</span><strong id="rg-value">--</strong><small>mm</small></article>
            <article class="metric-card" data-tooltip="Effective slenderness ratio Le / rg."><span>Slenderness Ratio</span><strong id="lambda-value">--</strong><small>L<sub>e</sub>/r</small></article>
            <article class="metric-card" data-tooltip="Frame-type assumption used for the magnifier calculation."><span>Frame Type</span><strong id="frame-type-value">--</strong><small>braced / unbraced</small></article>
            <article class="metric-card" data-tooltip="Critical buckling load used in the magnifier calculation."><span>Critical Buckling Load</span><strong id="nc-value">--</strong><small>kN</small></article>
            <article class="metric-card" data-tooltip="Permanent-load ratio beta_d used in the buckling-load expression, including the zero-beta_d condition from the attached methodology."><span>&beta;<sub>d</sub></span><strong id="beta-d-value">--</strong><small>buckling factor</small></article>
            <article class="metric-card" data-tooltip="Braced-column magnifier delta_b."><span>&delta;<sub>b</sub></span><strong id="delta-b-value">--</strong><small>braced magnifier</small></article>
            <article class="metric-card" data-tooltip="Unbraced-column magnifier delta_s. Not applicable for braced columns."><span>&delta;<sub>s</sub></span><strong id="delta-s-value">--</strong><small>unbraced magnifier</small></article>
            <article class="metric-card" data-tooltip="Demand eccentricity based on amplified moment divided by axial force."><span>Demand Eccentricity</span><strong id="eccentricity-value">--</strong><small>mm</small></article>
            <article class="metric-card" data-tooltip="Approximate neutral-axis depth at the demand-line capacity intersection."><span>Neutral Axis at Demand</span><strong id="dn-value">--</strong><small>mm</small></article>
            <article class="metric-card" data-tooltip="Compression-block depth a corresponding to the demand-line capacity intersection."><span>Compression Block Depth</span><strong id="a-depth-value">--</strong><small>mm</small></article>
            <article class="metric-card" data-tooltip="Number of interaction-curve sample points used to generate the live capacity envelope."><span>Curve Points</span><strong id="curve-points-value">--</strong><small>samples</small></article>
          </div>
        </section>
      </div>
    </main>

    <section class="surface-card table-card">
      <div class="card-header">
        <div>
          <p class="eyebrow">Saved Results</p>
          <h2>Design Snapshots</h2>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Shape</th>
              <th>f'c</th>
              <th>Bar Dia</th>
              <th>Total Bars</th>
              <th>N*</th>
              <th>M*</th>
              <th>M*a</th>
              <th>Utilisation</th>
              <th>Status</th>
              <th>Classification</th>
            </tr>
          </thead>
            <tbody id="saved-results-body">
              <tr class="empty-row">
                <td colspan="11">No saved results yet.</td>
              </tr>
            </tbody>
        </table>
      </div>
    </section>

    <section class="surface-card equations-card">
      <div class="card-header">
        <div>
          <p class="eyebrow">Equation Reference</p>
          <h2>Method Equations</h2>
        </div>
      </div>
      <div class="equation-stack">
        <details class="equation-toggle">
          <summary>Interaction Method</summary>
          <article class="equation-card">
            <div id="equation-primary" class="math-formula"></div>
          </article>
        </details>
        <details class="equation-toggle">
          <summary>Section Strength</summary>
          <article class="equation-card">
            <div id="equation-secondary" class="math-formula"></div>
          </article>
        </details>
        <details class="equation-toggle">
          <summary>Slenderness Check</summary>
          <article class="equation-card">
            <div id="equation-slenderness" class="math-formula"></div>
          </article>
        </details>
      </div>
    </section>
  </div>
  <div id="pdf-report" class="pdf-report" aria-hidden="true"></div>
</section>

