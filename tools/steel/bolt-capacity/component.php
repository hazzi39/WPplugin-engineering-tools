<?php
/**
 * Bolt capacity calculator component.
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
        'disclaimer' => 'This exported calculation sheet is a software-generated engineering summary and must be reviewed by a qualified engineer before issue.',
    ),
    $atts,
    (string) ($context['tag'] ?? 'bolt_capacity_calculator')
);
$storage_scope = sanitize_key((string) $report_settings['storage_scope']);

if ($storage_scope === '') {
    $storage_scope = sanitize_key($instance_id);
}

$bolt_catalogue = array(
    array('boltGrade' => 'Grade 4.6', 'boltSize' => 'M12', 'phiVf' => 16.7, 'phiNtf' => 27.0, 'tensileArea' => 84.3, 'fuf' => 400, 'minimumPitch' => 30.0, 'minEdgeDistanceShear' => 21.0, 'minEdgeDistanceRolledPlate' => 18.0, 'minEdgeDistanceRolledSection' => 15.0, 'maxNutHeight' => 13.1, 'nutWidthAcrossFlats' => 21.0, 'nutWidthAcrossCorners' => 24.25, 'washerMaxInsideDiameter' => 14.43, 'washerMaxOutsideDiameter' => 27.0, 'washerMaxThickness' => 4.6, 'washerMinThickness' => 3.1),
    array('boltGrade' => 'Grade 4.6', 'boltSize' => 'M16', 'phiVf' => 31.1, 'phiNtf' => 50.1, 'tensileArea' => 156.7, 'fuf' => 400, 'minimumPitch' => 40.0, 'minEdgeDistanceShear' => 28.0, 'minEdgeDistanceRolledPlate' => 24.0, 'minEdgeDistanceRolledSection' => 20.0, 'maxNutHeight' => 17.1, 'nutWidthAcrossFlats' => 27.0, 'nutWidthAcrossCorners' => 31.2, 'washerMaxInsideDiameter' => 18.43, 'washerMaxOutsideDiameter' => 34.0, 'washerMaxThickness' => 4.6, 'washerMinThickness' => 3.1),
    array('boltGrade' => 'Grade 4.6', 'boltSize' => 'M20', 'phiVf' => 48.6, 'phiNtf' => 78.3, 'tensileArea' => 244.8, 'fuf' => 400, 'minimumPitch' => 50.0, 'minEdgeDistanceShear' => 35.0, 'minEdgeDistanceRolledPlate' => 30.0, 'minEdgeDistanceRolledSection' => 25.0, 'maxNutHeight' => 21.3, 'nutWidthAcrossFlats' => 32.0, 'nutWidthAcrossCorners' => 36.9, 'washerMaxInsideDiameter' => 21.33, 'washerMaxOutsideDiameter' => 39.0, 'washerMaxThickness' => 4.6, 'washerMinThickness' => 3.1),
    array('boltGrade' => 'Grade 4.6', 'boltSize' => 'M22', 'phiVf' => 60.2, 'phiNtf' => 97.1, 'tensileArea' => 303.4, 'fuf' => 400, 'minimumPitch' => 55.0, 'minEdgeDistanceShear' => 38.5, 'minEdgeDistanceRolledPlate' => 33.0, 'minEdgeDistanceRolledSection' => 27.5, 'maxNutHeight' => 23.6, 'nutWidthAcrossFlats' => 36.0, 'nutWidthAcrossCorners' => 41.6, 'washerMaxInsideDiameter' => 24.52, 'washerMaxOutsideDiameter' => 44.0, 'washerMaxThickness' => 4.6, 'washerMinThickness' => 3.4),
    array('boltGrade' => 'Grade 4.6', 'boltSize' => 'M24', 'phiVf' => 69.9, 'phiNtf' => 112.8, 'tensileArea' => 352.5, 'fuf' => 400, 'minimumPitch' => 60.0, 'minEdgeDistanceShear' => 42.0, 'minEdgeDistanceRolledPlate' => 36.0, 'minEdgeDistanceRolledSection' => 30.0, 'maxNutHeight' => 24.2, 'nutWidthAcrossFlats' => 41.0, 'nutWidthAcrossCorners' => 47.3, 'washerMaxInsideDiameter' => 26.52, 'washerMaxOutsideDiameter' => 50.0, 'washerMaxThickness' => 4.6, 'washerMinThickness' => 3.4),
    array('boltGrade' => 'Grade 4.6', 'boltSize' => 'M27', 'phiVf' => 91.1, 'phiNtf' => 147.0, 'tensileArea' => 459.4, 'fuf' => 400, 'minimumPitch' => 67.5, 'minEdgeDistanceShear' => 47.25, 'minEdgeDistanceRolledPlate' => 40.5, 'minEdgeDistanceRolledSection' => 33.75, 'maxNutHeight' => 27.6, 'nutWidthAcrossFlats' => 46.0, 'nutWidthAcrossCorners' => 53.1, 'washerMaxInsideDiameter' => 30.52, 'washerMaxOutsideDiameter' => 56.0, 'washerMaxThickness' => 4.6, 'washerMinThickness' => 3.4),
    array('boltGrade' => 'Grade 4.6', 'boltSize' => 'M30', 'phiVf' => 111.2, 'phiNtf' => 179.4, 'tensileArea' => 560.6, 'fuf' => 400, 'minimumPitch' => 75.0, 'minEdgeDistanceShear' => 52.5, 'minEdgeDistanceRolledPlate' => 45.0, 'minEdgeDistanceRolledSection' => 37.5, 'maxNutHeight' => 30.7, 'nutWidthAcrossFlats' => 50.0, 'nutWidthAcrossCorners' => 57.7, 'washerMaxInsideDiameter' => 33.62, 'washerMaxOutsideDiameter' => 60.0, 'washerMaxThickness' => 4.6, 'washerMinThickness' => 3.4),
    array('boltGrade' => 'Grade 4.6', 'boltSize' => 'M36', 'phiVf' => 162.0, 'phiNtf' => 261.4, 'tensileArea' => 816.7, 'fuf' => 400, 'minimumPitch' => 90.0, 'minEdgeDistanceShear' => 63.0, 'minEdgeDistanceRolledPlate' => 54.0, 'minEdgeDistanceRolledSection' => 45.0, 'maxNutHeight' => 36.6, 'nutWidthAcrossFlats' => 60.0, 'nutWidthAcrossCorners' => 59.3, 'washerMaxInsideDiameter' => 39.62, 'washerMaxOutsideDiameter' => 72.0, 'washerMaxThickness' => 4.6, 'washerMinThickness' => 3.4),
    array('boltGrade' => 'Grade 8.8', 'boltSize' => 'M12', 'phiVf' => 34.7, 'phiNtf' => 56.0, 'tensileArea' => 84.3, 'fuf' => 830, 'minimumPitch' => 30.0, 'minEdgeDistanceShear' => 21.0, 'minEdgeDistanceRolledPlate' => 18.0, 'minEdgeDistanceRolledSection' => 15.0, 'maxNutHeight' => 13.1, 'nutWidthAcrossFlats' => 21.0, 'nutWidthAcrossCorners' => 24.25, 'washerMaxInsideDiameter' => 14.43, 'washerMaxOutsideDiameter' => 27.0, 'washerMaxThickness' => 4.6, 'washerMinThickness' => 3.1),
    array('boltGrade' => 'Grade 8.8', 'boltSize' => 'M16', 'phiVf' => 64.5, 'phiNtf' => 104.0, 'tensileArea' => 156.7, 'fuf' => 830, 'minimumPitch' => 40.0, 'minEdgeDistanceShear' => 28.0, 'minEdgeDistanceRolledPlate' => 24.0, 'minEdgeDistanceRolledSection' => 20.0, 'maxNutHeight' => 17.1, 'nutWidthAcrossFlats' => 27.0, 'nutWidthAcrossCorners' => 31.2, 'washerMaxInsideDiameter' => 18.43, 'washerMaxOutsideDiameter' => 34.0, 'washerMaxThickness' => 4.6, 'washerMinThickness' => 3.1),
    array('boltGrade' => 'Grade 8.8', 'boltSize' => 'M20', 'phiVf' => 100.8, 'phiNtf' => 162.5, 'tensileArea' => 244.8, 'fuf' => 830, 'minimumPitch' => 50.0, 'minEdgeDistanceShear' => 35.0, 'minEdgeDistanceRolledPlate' => 30.0, 'minEdgeDistanceRolledSection' => 25.0, 'maxNutHeight' => 21.3, 'nutWidthAcrossFlats' => 32.0, 'nutWidthAcrossCorners' => 36.9, 'washerMaxInsideDiameter' => 21.33, 'washerMaxOutsideDiameter' => 39.0, 'washerMaxThickness' => 4.6, 'washerMinThickness' => 3.1),
    array('boltGrade' => 'Grade 8.8', 'boltSize' => 'M22', 'phiVf' => 124.9, 'phiNtf' => 201.5, 'tensileArea' => 303.4, 'fuf' => 830, 'minimumPitch' => 55.0, 'minEdgeDistanceShear' => 38.5, 'minEdgeDistanceRolledPlate' => 33.0, 'minEdgeDistanceRolledSection' => 27.5, 'maxNutHeight' => 23.6, 'nutWidthAcrossFlats' => 36.0, 'nutWidthAcrossCorners' => 41.6, 'washerMaxInsideDiameter' => 24.52, 'washerMaxOutsideDiameter' => 44.0, 'washerMaxThickness' => 4.6, 'washerMinThickness' => 3.4),
    array('boltGrade' => 'Grade 8.8', 'boltSize' => 'M24', 'phiVf' => 145.1, 'phiNtf' => 234.1, 'tensileArea' => 352.5, 'fuf' => 830, 'minimumPitch' => 60.0, 'minEdgeDistanceShear' => 42.0, 'minEdgeDistanceRolledPlate' => 36.0, 'minEdgeDistanceRolledSection' => 30.0, 'maxNutHeight' => 24.2, 'nutWidthAcrossFlats' => 41.0, 'nutWidthAcrossCorners' => 47.3, 'washerMaxInsideDiameter' => 26.52, 'washerMaxOutsideDiameter' => 50.0, 'washerMaxThickness' => 4.6, 'washerMinThickness' => 3.4),
    array('boltGrade' => 'Grade 8.8', 'boltSize' => 'M27', 'phiVf' => 189.1, 'phiNtf' => 305.0, 'tensileArea' => 459.4, 'fuf' => 830, 'minimumPitch' => 67.5, 'minEdgeDistanceShear' => 47.25, 'minEdgeDistanceRolledPlate' => 40.5, 'minEdgeDistanceRolledSection' => 33.75, 'maxNutHeight' => 27.6, 'nutWidthAcrossFlats' => 46.0, 'nutWidthAcrossCorners' => 53.1, 'washerMaxInsideDiameter' => 30.52, 'washerMaxOutsideDiameter' => 56.0, 'washerMaxThickness' => 4.6, 'washerMinThickness' => 3.4),
    array('boltGrade' => 'Grade 8.8', 'boltSize' => 'M30', 'phiVf' => 230.8, 'phiNtf' => 372.2, 'tensileArea' => 560.6, 'fuf' => 830, 'minimumPitch' => 75.0, 'minEdgeDistanceShear' => 52.5, 'minEdgeDistanceRolledPlate' => 45.0, 'minEdgeDistanceRolledSection' => 37.5, 'maxNutHeight' => 30.7, 'nutWidthAcrossFlats' => 50.0, 'nutWidthAcrossCorners' => 57.7, 'washerMaxInsideDiameter' => 33.62, 'washerMaxOutsideDiameter' => 60.0, 'washerMaxThickness' => 4.6, 'washerMinThickness' => 3.4),
    array('boltGrade' => 'Grade 8.8', 'boltSize' => 'M36', 'phiVf' => 336.2, 'phiNtf' => 542.3, 'tensileArea' => 816.7, 'fuf' => 830, 'minimumPitch' => 90.0, 'minEdgeDistanceShear' => 63.0, 'minEdgeDistanceRolledPlate' => 54.0, 'minEdgeDistanceRolledSection' => 45.0, 'maxNutHeight' => 36.6, 'nutWidthAcrossFlats' => 60.0, 'nutWidthAcrossCorners' => 59.3, 'washerMaxInsideDiameter' => 39.62, 'washerMaxOutsideDiameter' => 72.0, 'washerMaxThickness' => 4.6, 'washerMinThickness' => 3.4),
    array('boltGrade' => 'Grade 10.9', 'boltSize' => 'M12', 'phiVf' => 43.1, 'phiNtf' => 69.4, 'tensileArea' => 84.3, 'fuf' => 1030, 'minimumPitch' => 30.0, 'minEdgeDistanceShear' => 21.0, 'minEdgeDistanceRolledPlate' => 18.0, 'minEdgeDistanceRolledSection' => 15.0, 'maxNutHeight' => 13.1, 'nutWidthAcrossFlats' => 21.0, 'nutWidthAcrossCorners' => 24.25, 'washerMaxInsideDiameter' => 14.43, 'washerMaxOutsideDiameter' => 27.0, 'washerMaxThickness' => 4.6, 'washerMinThickness' => 3.1),
    array('boltGrade' => 'Grade 10.9', 'boltSize' => 'M16', 'phiVf' => 80.0, 'phiNtf' => 129.1, 'tensileArea' => 156.7, 'fuf' => 1030, 'minimumPitch' => 40.0, 'minEdgeDistanceShear' => 28.0, 'minEdgeDistanceRolledPlate' => 24.0, 'minEdgeDistanceRolledSection' => 20.0, 'maxNutHeight' => 17.1, 'nutWidthAcrossFlats' => 27.0, 'nutWidthAcrossCorners' => 31.2, 'washerMaxInsideDiameter' => 18.43, 'washerMaxOutsideDiameter' => 34.0, 'washerMaxThickness' => 4.6, 'washerMinThickness' => 3.1),
    array('boltGrade' => 'Grade 10.9', 'boltSize' => 'M20', 'phiVf' => 125.1, 'phiNtf' => 201.7, 'tensileArea' => 244.8, 'fuf' => 1030, 'minimumPitch' => 50.0, 'minEdgeDistanceShear' => 35.0, 'minEdgeDistanceRolledPlate' => 30.0, 'minEdgeDistanceRolledSection' => 25.0, 'maxNutHeight' => 21.3, 'nutWidthAcrossFlats' => 32.0, 'nutWidthAcrossCorners' => 36.9, 'washerMaxInsideDiameter' => 21.33, 'washerMaxOutsideDiameter' => 39.0, 'washerMaxThickness' => 4.6, 'washerMinThickness' => 3.1),
    array('boltGrade' => 'Grade 10.9', 'boltSize' => 'M22', 'phiVf' => 155.0, 'phiNtf' => 250.0, 'tensileArea' => 303.4, 'fuf' => 1030, 'minimumPitch' => 55.0, 'minEdgeDistanceShear' => 38.5, 'minEdgeDistanceRolledPlate' => 33.0, 'minEdgeDistanceRolledSection' => 27.5, 'maxNutHeight' => 23.6, 'nutWidthAcrossFlats' => 36.0, 'nutWidthAcrossCorners' => 41.6, 'washerMaxInsideDiameter' => 24.52, 'washerMaxOutsideDiameter' => 44.0, 'washerMaxThickness' => 4.6, 'washerMinThickness' => 3.4),
    array('boltGrade' => 'Grade 10.9', 'boltSize' => 'M24', 'phiVf' => 180.1, 'phiNtf' => 290.5, 'tensileArea' => 352.5, 'fuf' => 1030, 'minimumPitch' => 60.0, 'minEdgeDistanceShear' => 42.0, 'minEdgeDistanceRolledPlate' => 36.0, 'minEdgeDistanceRolledSection' => 30.0, 'maxNutHeight' => 24.2, 'nutWidthAcrossFlats' => 41.0, 'nutWidthAcrossCorners' => 47.3, 'washerMaxInsideDiameter' => 26.52, 'washerMaxOutsideDiameter' => 50.0, 'washerMaxThickness' => 4.6, 'washerMinThickness' => 3.4),
    array('boltGrade' => 'Grade 10.9', 'boltSize' => 'M27', 'phiVf' => 234.7, 'phiNtf' => 378.6, 'tensileArea' => 459.4, 'fuf' => 1030, 'minimumPitch' => 67.5, 'minEdgeDistanceShear' => 47.25, 'minEdgeDistanceRolledPlate' => 40.5, 'minEdgeDistanceRolledSection' => 33.75, 'maxNutHeight' => 27.6, 'nutWidthAcrossFlats' => 46.0, 'nutWidthAcrossCorners' => 53.1, 'washerMaxInsideDiameter' => 30.52, 'washerMaxOutsideDiameter' => 56.0, 'washerMaxThickness' => 4.6, 'washerMinThickness' => 3.4),
    array('boltGrade' => 'Grade 10.9', 'boltSize' => 'M30', 'phiVf' => 286.4, 'phiNtf' => 461.9, 'tensileArea' => 560.6, 'fuf' => 1030, 'minimumPitch' => 75.0, 'minEdgeDistanceShear' => 52.5, 'minEdgeDistanceRolledPlate' => 45.0, 'minEdgeDistanceRolledSection' => 37.5, 'maxNutHeight' => 30.7, 'nutWidthAcrossFlats' => 50.0, 'nutWidthAcrossCorners' => 57.7, 'washerMaxInsideDiameter' => 33.62, 'washerMaxOutsideDiameter' => 60.0, 'washerMaxThickness' => 4.6, 'washerMinThickness' => 3.4),
    array('boltGrade' => 'Grade 10.9', 'boltSize' => 'M36', 'phiVf' => 417.2, 'phiNtf' => 673.0, 'tensileArea' => 816.7, 'fuf' => 1030, 'minimumPitch' => 90.0, 'minEdgeDistanceShear' => 63.0, 'minEdgeDistanceRolledPlate' => 54.0, 'minEdgeDistanceRolledSection' => 45.0, 'maxNutHeight' => 36.6, 'nutWidthAcrossFlats' => 60.0, 'nutWidthAcrossCorners' => 59.3, 'washerMaxInsideDiameter' => 39.62, 'washerMaxOutsideDiameter' => 72.0, 'washerMaxThickness' => 4.6, 'washerMinThickness' => 3.4),
);
?>
<section
    id="<?php echo esc_attr($instance_id); ?>"
    class="et-tool et-tool--bolt-capacity"
    data-et-tool="bolt-capacity"
    data-et-instance="<?php echo esc_attr($instance_id); ?>"
    data-tool-slug="bolt-capacity"
    data-instance-id="<?php echo esc_attr($instance_id); ?>"
    data-et-storage-scope="<?php echo esc_attr($storage_scope); ?>"
    data-report-company="<?php echo esc_attr((string) $report_settings['company']); ?>"
    data-report-project="<?php echo esc_attr((string) $report_settings['project']); ?>"
    data-report-prepared-by="<?php echo esc_attr((string) $report_settings['prepared_by']); ?>"
    data-report-disclaimer="<?php echo esc_attr((string) $report_settings['disclaimer']); ?>"
>
    <script type="application/json" data-et-role="catalogue-json"><?php echo wp_json_encode($bolt_catalogue, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT); ?></script>

    <main class="et-bc-page">
        <header class="et-bc-page-header">
            <div>
                <p class="et-bc-page-kicker">Bolt Capacity Suite</p>
                <h2 class="et-bc-page-title">Structural bolt capacities and detailing</h2>
            </div>
        </header>

        <section class="et-bc-main-grid">
            <div class="et-bc-left-column">
                <article class="et-bc-card et-bc-visual-card">
                    <div class="et-bc-card-heading">
                        <div>
                            <span class="et-bc-section-tag">Live visualisation</span>
                            <h3>Detailing diagram</h3>
                        </div>
                        <div class="et-bc-status-chip">
                            <span data-et-output="visual-status">Awaiting selection</span>
                        </div>
                    </div>
                    <p class="et-bc-card-intro">
                        The diagram maps the selected bolt's washer envelope, hole size reference, minimum pitch, and minimum edge distance for quick detailing checks.
                    </p>
                    <div class="et-bc-visual-frame" data-export-visualization="true" data-report-caption="Bolt detailing visualisation">
                        <svg
                            class="et-bc-visual-svg"
                            data-et-role="diagram"
                            viewBox="0 0 520 360"
                            role="img"
                            aria-label="Bolt detailing diagram with edge distance, pitch, washer diameter, and capacity directions"
                        ></svg>
                    </div>
                </article>

                <article class="et-bc-card et-bc-result-card">
                    <div class="et-bc-card-heading">
                        <div>
                            <span class="et-bc-section-tag">Result</span>
                            <h3>Reduced design capacities</h3>
                        </div>
                        <div class="et-bc-status-chip et-bc-status-chip--blue">
                            <span>&phi; = 0.80</span>
                        </div>
                    </div>

                    <div class="et-bc-metrics-grid">
                        <article class="et-bc-metric-card et-bc-metric-card--primary">
                            <span class="et-bc-metric-eyebrow">Shear capacity</span>
                            <div class="et-bc-metric-value-row">
                                <strong class="et-bc-metric-value" data-et-output="phi-vf">--</strong>
                                <span class="et-bc-metric-unit">kN</span>
                            </div>
                        </article>
                        <article class="et-bc-metric-card et-bc-metric-card--secondary">
                            <span class="et-bc-metric-eyebrow">Tension capacity</span>
                            <div class="et-bc-metric-value-row">
                                <strong class="et-bc-metric-value" data-et-output="phi-ntf">--</strong>
                                <span class="et-bc-metric-unit">kN</span>
                            </div>
                        </article>
                    </div>

                    <div class="et-bc-support-grid">
                        <div class="et-bc-support-block">
                            <span class="et-bc-support-label">Nominal shear</span>
                            <strong data-et-output="nominal-shear">--</strong>
                        </div>
                        <div class="et-bc-support-block">
                            <span class="et-bc-support-label">Nominal tension</span>
                            <strong data-et-output="nominal-tension">--</strong>
                        </div>
                        <div class="et-bc-support-block">
                            <span class="et-bc-support-label">f<sub>uf</sub></span>
                            <strong data-et-output="fuf">--</strong>
                        </div>
                        <div class="et-bc-support-block">
                            <span class="et-bc-support-label">A<sub>t</sub></span>
                            <strong data-et-output="tensile-area">--</strong>
                        </div>
                    </div>

                    <div class="et-bc-empty-result" data-et-role="empty-result" hidden>
                        <p>Select a bolt grade and size from the project dataset to inspect capacities and detailing guidance.</p>
                    </div>
                </article>
            </div>

            <div class="et-bc-right-column">
                <article class="et-bc-card et-bc-input-card">
                    <div class="et-bc-card-heading">
                        <div>
                            <span class="et-bc-section-tag">Inputs</span>
                            <h3>Catalogue selection</h3>
                        </div>
                    </div>

                    <div class="et-bc-field-grid">
                        <label class="et-tool__field">
                            <span class="et-tool__label">Bolt grade</span>
                            <span class="et-tool__input-wrap">
                                <select class="et-tool__input" data-et-field="bolt-grade">
                                    <option value="Grade 4.6">Grade 4.6</option>
                                    <option value="Grade 8.8" selected>Grade 8.8</option>
                                    <option value="Grade 10.9">Grade 10.9</option>
                                </select>
                                <span class="et-tool__unit">Class</span>
                            </span>
                            <em class="et-tool__error" data-error-for="bolt-grade"></em>
                        </label>

                        <label class="et-tool__field">
                            <span class="et-tool__label">Bolt size</span>
                            <span class="et-tool__input-wrap">
                                <select class="et-tool__input" data-et-field="bolt-size">
                                    <option value="M20" selected>M20</option>
                                </select>
                                <span class="et-tool__unit">mm</span>
                            </span>
                            <em class="et-tool__error" data-error-for="bolt-size"></em>
                        </label>
                    </div>

                    <div class="et-bc-equation-panel">
                        <div class="et-bc-equation-block">
                            <button type="button" class="et-bc-equation-toggle" data-et-action="toggle-shear-equation" aria-expanded="false">
                                <span class="et-bc-equation-label">Shear equation</span>
                                <span class="et-bc-equation-toggle-icon" data-et-role="shear-indicator">+</span>
                            </button>
                            <div class="et-bc-equation-body is-collapsed" data-et-panel="shear-equation">
                                <div class="et-bc-equation-formula" data-et-role="equation-shear"></div>
                                <p class="et-bc-equation-caption">Reduced shear capacity implied by the catalogue values.</p>
                            </div>
                            <p class="et-bc-equation-collapsed-note" data-et-role="shear-note">Expand to view the full engineering equation.</p>
                        </div>

                        <div class="et-bc-equation-block">
                            <button type="button" class="et-bc-equation-toggle" data-et-action="toggle-tension-equation" aria-expanded="false">
                                <span class="et-bc-equation-label">Tension equation</span>
                                <span class="et-bc-equation-toggle-icon" data-et-role="tension-indicator">+</span>
                            </button>
                            <div class="et-bc-equation-body is-collapsed" data-et-panel="tension-equation">
                                <div class="et-bc-equation-formula" data-et-role="equation-tension"></div>
                                <p class="et-bc-equation-caption">Reduced tension capacity implied by the catalogue values.</p>
                            </div>
                            <p class="et-bc-equation-collapsed-note" data-et-role="tension-note">Expand to view the full engineering equation.</p>
                        </div>
                    </div>

                    <div class="et-bc-action-button-group">
                        <button type="button" class="et-bc-save-button" data-et-action="save-result">Save Result</button>
                        <button type="button" class="et-bc-export-button" data-et-action="export-word-report">Export Word Report</button>
                    </div>
                </article>

                <article class="et-bc-card et-bc-properties-card">
                    <div class="et-bc-card-heading">
                        <div>
                            <span class="et-bc-section-tag">Secondary properties</span>
                            <h3>Detailing and hardware data</h3>
                        </div>
                    </div>

                    <div class="et-bc-properties-grid">
                        <section class="et-bc-property-panel">
                            <h4>Bolt geometry</h4>
                            <div class="et-bc-detail-row"><span>Nominal diameter</span><strong data-et-output="diameter">--</strong></div>
                            <div class="et-bc-detail-row"><span>Tensile area</span><strong data-et-output="tensile-area-property">--</strong></div>
                            <div class="et-bc-detail-row"><span>Minimum pitch</span><strong data-et-output="minimum-pitch">--</strong></div>
                            <div class="et-bc-detail-row"><span>Min edge distance</span><strong data-et-output="minimum-edge-distance">--</strong></div>
                        </section>

                        <section class="et-bc-property-panel">
                            <h4>Nut dimensions</h4>
                            <div class="et-bc-detail-row"><span>Max nut height</span><strong data-et-output="nut-height">--</strong></div>
                            <div class="et-bc-detail-row"><span>Across flats</span><strong data-et-output="nut-flats">--</strong></div>
                            <div class="et-bc-detail-row"><span>Across corners</span><strong data-et-output="nut-corners">--</strong></div>
                            <div class="et-bc-detail-row"><span>Rolled plate edge</span><strong data-et-output="rolled-plate-edge">--</strong></div>
                        </section>

                        <section class="et-bc-property-panel">
                            <h4>Washer envelope</h4>
                            <div class="et-bc-detail-row"><span>Max inside diameter</span><strong data-et-output="washer-id">--</strong></div>
                            <div class="et-bc-detail-row"><span>Max outside diameter</span><strong data-et-output="washer-od">--</strong></div>
                            <div class="et-bc-detail-row"><span>Min thickness</span><strong data-et-output="washer-min-thickness">--</strong></div>
                            <div class="et-bc-detail-row"><span>Max thickness</span><strong data-et-output="washer-max-thickness">--</strong></div>
                        </section>

                        <section class="et-bc-property-panel">
                            <h4>Derived checks</h4>
                            <div class="et-bc-detail-row"><span>Shear factor</span><strong data-et-output="shear-factor">--</strong></div>
                            <div class="et-bc-detail-row"><span>Reduction factor</span><strong data-et-output="phi-factor">--</strong></div>
                            <div class="et-bc-detail-row"><span>Vf / Ntf ratio</span><strong data-et-output="ratio">--</strong></div>
                            <div class="et-bc-detail-row"><span>Rolled section edge</span><strong data-et-output="rolled-section-edge">--</strong></div>
                        </section>
                    </div>
                </article>
            </div>
        </section>

        <section class="et-bc-card et-bc-saved-results-card">
            <div class="et-bc-card-heading">
                <div>
                    <span class="et-bc-section-tag">Saved results</span>
                    <h3>Selection history</h3>
                </div>
                <button type="button" class="et-bc-export-button et-bc-export-button--quiet" data-et-action="clear-results">Clear</button>
            </div>
            <p class="et-bc-card-intro">
                Save capacity checks to build a quick comparison log of the catalogue entries you have reviewed.
            </p>
            <div class="et-bc-table-shell">
                <table class="et-bc-table">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Grade</th>
                            <th>Size</th>
                            <th>&phi;Vf</th>
                            <th>&phi;Ntf</th>
                            <th>Pitch</th>
                            <th>Edge distance</th>
                        </tr>
                    </thead>
                    <tbody data-et-role="saved-results-body">
                        <tr>
                            <td colspan="7" class="et-bc-table-empty">No saved results yet. Choose a bolt and save it to build your comparison table.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    </main>
</section>
