<?php
/**
 * Pad footing bearing pressure calculator component.
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
        'disclaimer' => 'This exported calculation sheet is software-generated and must be reviewed by a qualified engineer before issue, construction use, or reliance in design verification.',
    ),
    $atts,
    (string) ($context['tag'] ?? 'pad_footing_bearing')
);

$storage_scope = sanitize_key((string) $report_settings['storage_scope']);

if ($storage_scope === '') {
    $storage_scope = sanitize_key($instance_id);
}
?>
<section
    id="<?php echo esc_attr($instance_id); ?>"
    class="et-tool et-tool--pad-footing-bearing"
    data-et-tool="pad-footing-bearing"
    data-et-instance="<?php echo esc_attr($instance_id); ?>"
    data-tool-slug="pad-footing-bearing"
    data-et-storage-scope="<?php echo esc_attr($storage_scope); ?>"
    data-report-company="<?php echo esc_attr((string) $report_settings['company']); ?>"
    data-report-project="<?php echo esc_attr((string) $report_settings['project']); ?>"
    data-report-prepared-by="<?php echo esc_attr((string) $report_settings['prepared_by']); ?>"
    data-report-disclaimer="<?php echo esc_attr((string) $report_settings['disclaimer']); ?>"
>
    <div class="et-pfb__shell">
        <header class="et-pfb__card et-pfb__header">
            <div>
                <p class="et-pfb__eyebrow">Structural Bearing Check</p>
                <h2 class="et-pfb__title"><?php echo esc_html($context['tool']->title()); ?></h2>
            </div>
        </header>

        <main class="et-pfb__main-grid">
            <div class="et-pfb__left-column">
                <article class="et-pfb__card et-pfb__visual-card">
                    <div class="et-pfb__card-header">
                        <div>
                            <p class="et-pfb__card-kicker">Live Visualisation</p>
                            <h3>Footing Response Diagram</h3>
                        </div>
                        <span class="et-pfb__status-pill" data-et-output="status-pill">Awaiting valid inputs</span>
                    </div>

                    <div
                        class="et-pfb__visual-frame"
                        data-export-visualization="true"
                        data-report-visualization="Footing response diagram and pressure distribution"
                    >
                        <svg
                            class="et-pfb__diagram"
                            data-et-role="diagram"
                            viewBox="0 0 580 360"
                            role="img"
                            aria-label="Pad footing pressure distribution diagram"
                        ></svg>
                    </div>

                    <div class="et-pfb__visual-caption">
                        <div>
                            <strong data-et-output="case-caption">Pressure diagram will render here</strong>
                            <span data-et-output="contact-caption">Enter valid footing dimensions and loading to display the centroid, eccentricity, contact length, and pressure block.</span>
                        </div>
                        <div>
                            <strong data-et-role="visual-equation">e = M / P</strong>
                            <span data-et-output="visual-eccentricity">--</span>
                        </div>
                    </div>
                </article>

                <article class="et-pfb__card et-pfb__result-card">
                    <div class="et-pfb__card-header">
                        <div>
                            <p class="et-pfb__card-kicker">Result</p>
                            <h3>Maximum Bearing Pressure</h3>
                        </div>
                        <span class="et-pfb__contact-pill" data-et-output="contact-pill">No result</span>
                    </div>

                    <div class="et-pfb__hero-metric" data-et-role="hero-metric" data-tone="idle">
                        <span class="et-pfb__hero-label">q<sub>max</sub></span>
                        <strong class="et-pfb__hero-value" data-et-output="qmax-hero">--</strong>
                        <p class="et-pfb__hero-note" data-et-output="hero-note">
                            Results stay disabled until all required values are valid.
                        </p>
                    </div>

                    <div class="et-pfb__metric-grid">
                        <article class="et-pfb__metric-card">
                            <span>Case</span>
                            <strong data-et-output="case-card">--</strong>
                        </article>
                        <article class="et-pfb__metric-card">
                            <span>Contact length</span>
                            <strong data-et-output="contact-length-card">--</strong>
                        </article>
                        <article class="et-pfb__metric-card et-pfb__metric-card--accent">
                            <span>Pressure range</span>
                            <strong data-et-output="range-card">--</strong>
                        </article>
                    </div>
                </article>
            </div>

            <div class="et-pfb__right-column">
                <article class="et-pfb__card et-pfb__input-card">
                    <div class="et-pfb__card-header">
                        <div>
                            <p class="et-pfb__card-kicker">Inputs</p>
                            <h3>Input Actions</h3>
                        </div>
                        <button type="button" class="et-pfb__button et-pfb__button--ghost" data-et-action="reset-form">Reset sample</button>
                    </div>

                    <div class="et-pfb__collapse-group">
                        <button type="button" class="et-pfb__collapse-toggle" data-et-action="toggle-equations" aria-expanded="false">
                            <span>Equations</span>
                            <span data-et-role="equation-toggle-label">Show</span>
                        </button>
                        <div class="et-pfb__equation-panel is-collapsed" data-et-panel="equations">
                            <div class="et-pfb__equation-block">
                                <div class="et-pfb__math" data-et-role="equation-full"></div>
                            </div>
                            <div class="et-pfb__equation-block">
                                <div class="et-pfb__math" data-et-role="equation-limit"></div>
                            </div>
                            <div class="et-pfb__equation-block">
                                <div class="et-pfb__math" data-et-role="equation-partial"></div>
                            </div>
                        </div>
                    </div>

                    <div class="et-pfb__field-grid">
                        <label class="et-pfb__field">
                            <span class="et-pfb__label">
                                <span>Axial load</span>
                                <span class="et-pfb__label-math" data-et-role="label-p"></span>
                            </span>
                            <span class="et-pfb__helper">Service or factored vertical load delivered to the footing.</span>
                            <span class="et-pfb__control">
                                <input class="et-pfb__input" type="number" step="0.1" min="0.1" value="1200" data-et-field="P" />
                                <span class="et-pfb__unit">kN</span>
                            </span>
                            <em class="et-pfb__error" data-error-for="P"></em>
                        </label>

                        <label class="et-pfb__field">
                            <span class="et-pfb__label">
                                <span>Moment about major axis</span>
                                <span class="et-pfb__label-math" data-et-role="label-m"></span>
                            </span>
                            <span class="et-pfb__helper">Applied overturning moment used to compare against M/P eccentricity.</span>
                            <span class="et-pfb__control">
                                <input class="et-pfb__input" type="number" step="0.1" min="0" value="150" data-et-field="M" />
                                <span class="et-pfb__unit">kN·m</span>
                            </span>
                            <em class="et-pfb__error" data-error-for="M"></em>
                        </label>

                        <label class="et-pfb__field">
                            <span class="et-pfb__label">
                                <span>Footing width</span>
                                <span class="et-pfb__label-math" data-et-role="label-b"></span>
                            </span>
                            <span class="et-pfb__helper">Transverse footing dimension that stays constant in the pressure check.</span>
                            <span class="et-pfb__control">
                                <input class="et-pfb__input" type="number" step="0.01" min="0.1" value="2.4" data-et-field="B" />
                                <span class="et-pfb__unit">m</span>
                            </span>
                            <em class="et-pfb__error" data-error-for="B"></em>
                        </label>

                        <label class="et-pfb__field">
                            <span class="et-pfb__label">
                                <span>Footing length in bending direction</span>
                                <span class="et-pfb__label-math" data-et-role="label-d"></span>
                            </span>
                            <span class="et-pfb__helper">Dimension parallel to bending and eccentricity.</span>
                            <span class="et-pfb__control">
                                <input class="et-pfb__input" type="number" step="0.01" min="0.1" value="2.8" data-et-field="D" />
                                <span class="et-pfb__unit">m</span>
                            </span>
                            <em class="et-pfb__error" data-error-for="D"></em>
                        </label>
                    </div>

                    <div class="et-pfb__notice-stack" data-et-role="notice-stack"></div>
                </article>

                <article class="et-pfb__card et-pfb__secondary-card">
                    <div class="et-pfb__card-header">
                        <div>
                            <p class="et-pfb__card-kicker">Secondary Properties</p>
                            <h3>Derived Check Values</h3>
                        </div>
                        <button type="button" class="et-pfb__icon-toggle" data-et-action="toggle-secondary" aria-expanded="false">
                            <span>Σ</span>
                            <span data-et-role="secondary-toggle-label">Show</span>
                        </button>
                    </div>

                    <div class="et-pfb__secondary-panel is-collapsed" data-et-panel="secondary">
                        <div class="et-pfb__collapsed-placeholder" data-et-role="secondary-placeholder">
                            <span>Expand to review derived values and case checks.</span>
                        </div>

                        <div class="et-pfb__secondary-content" data-et-role="secondary-content">
                            <div class="et-pfb__properties-grid">
                                <div class="et-pfb__property-row"><span>Derived eccentricity, e = M/P</span><strong data-et-output="eccentricity">--</strong></div>
                                <div class="et-pfb__property-row"><span>q<sub>avg</sub></span><strong data-et-output="qavg">--</strong></div>
                                <div class="et-pfb__property-row"><span>q<sub>min</sub></span><strong data-et-output="qmin">--</strong></div>
                                <div class="et-pfb__property-row"><span>Limiting eccentricity, e<sub>k</sub> = D/6</span><strong data-et-output="kernel-limit">--</strong></div>
                                <div class="et-pfb__property-row"><span>Moment ratio check, M/P</span><strong data-et-output="moment-eccentricity">--</strong></div>
                                <div class="et-pfb__property-row"><span>3(D/2 − e)</span><strong data-et-output="contact-length">--</strong></div>
                                <div class="et-pfb__property-row"><span>Pressure zone</span><strong data-et-output="pressure-zone">--</strong></div>
                            </div>

                            <div class="et-pfb__formula-note">
                                <p>This follows the textbook sequence in the reference figures: first derive e = M/P, compare it with e<sub>k</sub> = D/6, then switch from a full-contact trapezoid to a triangular pressure block when e &gt; e<sub>k</sub>.</p>
                            </div>
                        </div>
                    </div>

                    <div class="et-pfb__result-actions">
                        <button type="button" class="et-pfb__button et-pfb__button--primary" data-et-action="save-result">Save Result</button>
                        <button type="button" class="et-pfb__button et-pfb__button--secondary" data-et-action="export-word-report">Export Word Report</button>
                    </div>

                    <p class="et-pfb__export-feedback" data-et-output="export-feedback"></p>
                </article>
            </div>
        </main>

        <section class="et-pfb__card et-pfb__saved-card">
            <div class="et-pfb__card-header">
                <div>
                    <p class="et-pfb__card-kicker">Saved Results</p>
                    <h3>Comparison Register</h3>
                </div>
                <span class="et-pfb__table-count" data-et-output="saved-count">0 saved</span>
            </div>

            <div class="et-pfb__table-wrap">
                <table class="et-pfb__table">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>P (kN)</th>
                            <th>M (kN·m)</th>
                            <th>B (m)</th>
                            <th>D (m)</th>
                            <th>e (m)</th>
                            <th>q<sub>max</sub> (kPa)</th>
                            <th>Case</th>
                        </tr>
                    </thead>
                    <tbody data-et-role="saved-results-body">
                        <tr>
                            <td colspan="8" class="et-pfb__table-empty">Save design iterations to build a project-side comparison history.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    </div>
</section>
