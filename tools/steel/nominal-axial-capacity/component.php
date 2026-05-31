<?php
/**
 * Nominal axial capacity calculator component.
 *
 * @var array<string, mixed> $context
 */

declare(strict_types=1);

if (! defined('ABSPATH')) {
    exit;
}

$instance_id = (string) $context['instance_id'];
$atts = is_array($context['atts']) ? $context['atts'] : array();
$report_settings = shortcode_atts(
    array(
        'company' => '',
        'project' => '',
        'prepared_by' => '',
        'storage_scope' => '',
        'disclaimer' => 'This calculation sheet is software-generated and must be reviewed by a qualified engineer before issue, construction use, or reliance in design verification.',
    ),
    $atts,
    (string) ($context['tag'] ?? 'nominal_axial_capacity')
);

$storage_scope = sanitize_key((string) $report_settings['storage_scope']);

if ($storage_scope === '') {
    $storage_scope = sanitize_key($instance_id);
}

$root_attrs = array(
    'id' => $instance_id,
    'class' => 'et-tool et-tool--nominal-axial-capacity',
    'data-et-tool' => 'nominal-axial-capacity',
    'data-et-instance' => $instance_id,
    'data-tool-slug' => 'nominal-axial-capacity',
    'data-et-storage-scope' => $storage_scope,
    'data-report-company' => (string) $report_settings['company'],
    'data-report-project' => (string) $report_settings['project'],
    'data-report-prepared-by' => (string) $report_settings['prepared_by'],
    'data-report-disclaimer' => (string) $report_settings['disclaimer'],
);
?>
<section <?php echo \EngineeringTools\et_html_attrs($root_attrs); ?>>
    <div class="et-nac__shell">
        <header class="et-nac__card et-nac__header">
            <div>
                <p class="et-nac__eyebrow">AS 4100 Compression Check</p>
                <h2 class="et-nac__title"><?php echo esc_html($context['tool']->title()); ?></h2>
            </div>
            <div class="et-nac__header-badge">Native WordPress Tool</div>
        </header>

        <main class="et-nac__main-grid">
            <div class="et-nac__left-column">
                <article class="et-nac__card et-nac__visual-card">
                    <div class="et-nac__card-header">
                        <div>
                            <h3>Effective Length Diagram</h3>
                            <p>Live steel member visualisation with geometry-derived section properties and governing buckling axis.</p>
                        </div>
                        <span class="et-nac__status-pill" data-et-output="status-pill">Awaiting valid inputs</span>
                    </div>

                    <div
                        class="et-nac__visual-frame"
                        data-export-visualization="true"
                        data-report-visualization="Steel member effective length diagram"
                    >
                        <svg
                            class="et-nac__diagram"
                            data-et-role="diagram"
                            viewBox="0 0 580 360"
                            role="img"
                            aria-label="Nominal axial capacity member visualisation"
                        ></svg>
                    </div>

                    <div class="et-nac__visual-caption">
                        <div>
                            <strong data-et-output="visual-shape">Rectangular hollow section</strong>
                            <span data-et-output="visual-axis">Buckling about X axis</span>
                        </div>
                        <div>
                            <strong data-et-output="visual-length">L_e = --</strong>
                            <span data-et-output="visual-radius">r = --</span>
                        </div>
                    </div>
                </article>

                <article class="et-nac__card et-nac__result-card">
                    <div class="et-nac__card-header">
                        <div>
                            <p class="et-nac__card-kicker">Result</p>
                            <h3>Design Compression Capacity</h3>
                        </div>
                        <span class="et-nac__contact-pill" data-et-output="capacity-pill">No result</span>
                    </div>

                    <div class="et-nac__hero-metric" data-tone="idle">
                        <span class="et-nac__hero-label">ϕN<sub>c</sub></span>
                        <strong class="et-nac__hero-value" data-et-output="phi-nc">--</strong>
                        <p class="et-nac__hero-note" data-et-output="hero-note">Results stay disabled until all required values are valid.</p>
                    </div>

                    <div class="et-nac__metric-grid">
                        <article class="et-nac__metric-card">
                            <span>Net area</span>
                            <strong data-et-output="area-card">--</strong>
                        </article>
                        <article class="et-nac__metric-card">
                            <span>Governing radius</span>
                            <strong data-et-output="radius-card">--</strong>
                        </article>
                        <article class="et-nac__metric-card et-nac__metric-card--accent">
                            <span>Member capacity</span>
                            <strong data-et-output="nc-card">--</strong>
                        </article>
                    </div>

                    <div class="et-nac__result-actions">
                        <button type="button" class="et-nac__button et-nac__button--ghost" data-et-action="reset-form">Reset sample</button>
                        <button type="button" class="et-nac__button et-nac__button--primary" data-et-action="save-result">Save Result</button>
                        <button type="button" class="et-nac__button et-nac__button--secondary" data-et-action="export-word-report">Export Word Report</button>
                    </div>

                    <p class="et-nac__export-feedback" data-et-output="export-feedback"></p>
                </article>
            </div>

            <div class="et-nac__right-column">
                <article class="et-nac__card et-nac__input-card">
                    <div class="et-nac__card-header">
                        <div>
                            <p class="et-nac__card-kicker">Inputs</p>
                            <h3>Member Definition</h3>
                        </div>
                    </div>

                    <div class="et-nac__field-grid et-nac__field-grid--selects">
                        <label class="et-nac__field">
                            <span class="et-nac__label">Member Type</span>
                            <span class="et-nac__select-wrap">
                                <select class="et-nac__input" data-et-field="member-type"></select>
                            </span>
                        </label>
                        <label class="et-nac__field">
                            <span class="et-nac__label">End Restraint</span>
                            <span class="et-nac__select-wrap">
                                <select class="et-nac__input" data-et-field="end-restraint"></select>
                            </span>
                        </label>
                    </div>

                    <div class="et-nac__field-grid et-nac__field-grid--single">
                        <label class="et-nac__field">
                            <span class="et-nac__label">Section Description</span>
                            <span class="et-nac__select-wrap">
                                <select class="et-nac__input" data-et-field="section-description"></select>
                            </span>
                        </label>
                    </div>

                    <div class="et-nac__field-grid">
                        <label class="et-nac__field">
                            <span class="et-nac__label">Actual Length, L</span>
                            <span class="et-nac__helper">Unsupported member length used for effective length determination.</span>
                            <span class="et-nac__control">
                                <input class="et-nac__input" type="number" step="10" min="100" value="4000" data-et-field="L" />
                                <span class="et-nac__unit">mm</span>
                            </span>
                            <em class="et-nac__error" data-error-for="L"></em>
                        </label>
                        <label class="et-nac__field">
                            <span class="et-nac__label">Yield Strength, f<sub>y</sub></span>
                            <span class="et-nac__helper">Specified steel yield strength used in compression capacity calculations.</span>
                            <span class="et-nac__control">
                                <input class="et-nac__input" type="number" step="1" min="100" value="350" data-et-field="fy" />
                                <span class="et-nac__unit">MPa</span>
                            </span>
                            <em class="et-nac__error" data-error-for="fy"></em>
                        </label>
                    </div>
                </article>

                <article class="et-nac__card et-nac__geometry-card">
                    <div class="et-nac__card-header">
                        <div>
                            <p class="et-nac__card-kicker">Section Geometry</p>
                            <h3>Calculated Properties Source</h3>
                        </div>
                    </div>

                    <div class="et-nac__field-grid et-nac__field-grid--selects">
                        <label class="et-nac__field">
                            <span class="et-nac__label">Section Shape</span>
                            <span class="et-nac__select-wrap">
                                <select class="et-nac__input" data-et-field="section-shape"></select>
                            </span>
                        </label>
                        <label class="et-nac__field">
                            <span class="et-nac__label">Governing Buckling Axis</span>
                            <span class="et-nac__select-wrap">
                                <select class="et-nac__input" data-et-field="buckling-axis">
                                    <option value="x">x-axis</option>
                                    <option value="y">y-axis</option>
                                </select>
                            </span>
                        </label>
                    </div>

                    <div class="et-nac__field-grid" data-et-role="geometry-fields"></div>
                    <div class="et-nac__notice-stack" data-et-role="notice-stack"></div>
                </article>

                <article class="et-nac__card et-nac__collapsible-card">
                    <button type="button" class="et-nac__collapse-toggle" data-et-action="toggle-equations" aria-expanded="false">
                        <div>
                            <p class="et-nac__card-kicker">Equation Set</p>
                            <h3>Compression Member Model</h3>
                        </div>
                        <span data-et-role="equation-toggle-label">Show</span>
                    </button>
                    <div class="et-nac__collapse-panel is-collapsed" data-et-panel="equations">
                        <div class="et-nac__equation-block"><div class="et-nac__math" data-et-role="equation-primary"></div></div>
                        <div class="et-nac__equation-block"><div class="et-nac__math" data-et-role="equation-secondary"></div></div>
                        <div class="et-nac__equation-block"><div class="et-nac__math" data-et-role="equation-tertiary"></div></div>
                    </div>
                </article>

                <article class="et-nac__card et-nac__collapsible-card">
                    <button type="button" class="et-nac__collapse-toggle" data-et-action="toggle-secondary" aria-expanded="false">
                        <div>
                            <p class="et-nac__card-kicker">Secondary Properties</p>
                            <h3>Derived Engineering Context</h3>
                        </div>
                        <span data-et-role="secondary-toggle-label">Show</span>
                    </button>
                    <div class="et-nac__collapse-panel is-collapsed" data-et-panel="secondary">
                        <div class="et-nac__properties-grid">
                            <div class="et-nac__property-row"><span>Section family</span><strong data-et-output="section-family">--</strong></div>
                            <div class="et-nac__property-row"><span>k<sub>f</sub></span><strong data-et-output="kf">--</strong></div>
                            <div class="et-nac__property-row"><span>α<sub>b</sub></span><strong data-et-output="alpha-b">--</strong></div>
                            <div class="et-nac__property-row"><span>k<sub>e</sub></span><strong data-et-output="ke">--</strong></div>
                            <div class="et-nac__property-row"><span>r<sub>x</sub></span><strong data-et-output="rx">--</strong></div>
                            <div class="et-nac__property-row"><span>r<sub>y</sub></span><strong data-et-output="ry">--</strong></div>
                            <div class="et-nac__property-row"><span>η</span><strong data-et-output="eta">--</strong></div>
                            <div class="et-nac__property-row"><span>α<sub>a</sub></span><strong data-et-output="alpha-a">--</strong></div>
                            <div class="et-nac__property-row"><span>ζ</span><strong data-et-output="zeta">--</strong></div>
                            <div class="et-nac__property-row"><span>λ</span><strong data-et-output="lambda">--</strong></div>
                            <div class="et-nac__property-row"><span>α<sub>c</sub></span><strong data-et-output="alpha-c">--</strong></div>
                            <div class="et-nac__property-row"><span>L<sub>e</sub> / r</span><strong data-et-output="le-r">--</strong></div>
                        </div>
                        <div class="et-nac__formula-note">
                            <p>Net section resisting axial action is taken as the calculated geometric area of the selected section shape. Hole deductions and fabrication losses are not applied in this module.</p>
                        </div>
                    </div>
                </article>
            </div>
        </main>

        <section class="et-nac__card et-nac__saved-card">
            <div class="et-nac__card-header">
                <div>
                    <p class="et-nac__card-kicker">Saved Results</p>
                    <h3>Audit Trail</h3>
                </div>
                <span class="et-nac__table-count" data-et-output="saved-count">0 saved</span>
            </div>

            <div class="et-nac__table-wrap">
                <table class="et-nac__table">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Member</th>
                            <th>Section</th>
                            <th>Axis</th>
                            <th>L (mm)</th>
                            <th>f<sub>y</sub> (MPa)</th>
                            <th>A<sub>n</sub> (mm²)</th>
                            <th>r (mm)</th>
                            <th>ϕN<sub>c</sub> (kN)</th>
                        </tr>
                    </thead>
                    <tbody data-et-role="saved-results-body">
                        <tr>
                            <td colspan="9" class="et-nac__table-empty">Save design iterations to build a project-side audit trail.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    </div>
</section>
