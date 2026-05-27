const STORAGE_KEY = "rc-column-design-snapshots-v1";
const EPSILON_CU = 0.003;
const root = document.querySelector('.et-tool[data-tool-slug="rc-column-designer"]');
const GLOBAL_RULES = {
  fc: { label: "f'c", min: 15, max: 100 },
  fsy: { label: "fsy", min: 250, max: 800 },
  Es: { label: "Es", min: 100000, max: 250000 },
  phi: { label: "phi", min: 0.5, max: 0.9 },
  cover: { label: "cover", min: 10, max: 120 },
  Nstar: { label: "N*", min: 0, max: 30000, allowZero: true },
  Mstar: { label: "M*", min: 0, max: 10000, allowZero: true },
  NGstar: { label: "NG*", min: 0, max: 30000, allowZero: true },
  Lu: { label: "Lu", min: 500, max: 20000 },
  km: { label: "km", min: 0.5, max: 1.5 },
  maxSlenderness: { label: "general slenderness limit", min: 80, max: 200 },
  tieBarDia: { label: "tie / spiral diameter", min: 6, max: 40 },
};

const UNBRACED_RULES = {
  sumNstar: { label: "ΣN*", min: 0, max: 100000, allowZero: true },
  sumNc: { label: "ΣNc", min: 0.001, max: 200000 },
  lambdaUc: { label: "lambda_uc", min: 0.2, max: 50 },
};

const RESTRAINT_CASES = {
  braced: [
    { value: "braced_fixed_fixed", label: "Rotation fixed, translation fixed / fixed-fixed", k: 0.7 },
    { value: "braced_pinned_fixed", label: "Rotation free at one end, translation fixed / pinned-fixed", k: 0.85 },
    { value: "braced_pinned_pinned", label: "Rotation free, translation fixed at both ends / pinned-pinned", k: 1.0 },
    { value: "braced_elastomeric", label: "Elastomeric bearing case", k: 1.3 },
  ],
  unbraced: [
    { value: "unbraced_fixed_free", label: "Rotation fixed, translation free", k: 1.2 },
    { value: "unbraced_pinned_free", label: "Rotation free, translation free", k: 2.2 },
    { value: "unbraced_mixed_free", label: "Mixed end restraint with translation free", k: 2.2 },
  ],
};

const RECT_RULES = {
  rect_b: { label: "b", min: 150, max: 2500 },
  rect_D: { label: "D", min: 150, max: 2500 },
  rect_barDia: { label: "main bar diameter", min: 10, max: 50 },
  rect_topBars: { label: "top bars", min: 1, max: 20, integer: true },
  rect_bottomBars: { label: "bottom bars", min: 1, max: 20, integer: true },
  rect_sideBars: { label: "side bars", min: 0, max: 12, allowZero: true, integer: true },
};

const CIRCLE_RULES = {
  circle_D: { label: "D", min: 200, max: 2500 },
  circle_barDia: { label: "main bar diameter", min: 10, max: 50 },
  circle_barCount: { label: "number of bars", min: 4, max: 40, integer: true },
};

const elements = {
  form: root?.querySelector("#calculator-form"),
  saveButton: root?.querySelector("#save-result"),
  exportPdfButton: root?.querySelector("#export-pdf"),
  sectionType: root?.querySelector("#sectionType"),
  frameType: root?.querySelector("#frameType"),
  unbracedMethod: root?.querySelector("#unbracedMethod"),
  restraintCase: root?.querySelector("#restraintCase"),
  kFactorDisplay: root?.querySelector("#kFactorDisplay"),
  rectangularGroup: root?.querySelector("#rectangular-group"),
  circularGroup: root?.querySelector("#circular-group"),
  unbracedGroup: root?.querySelector("#unbraced-group"),
  storeySumField: root?.querySelector("#storey-nsum-field"),
  storeyNcField: root?.querySelector("#storey-nc-field"),
  lambdaUcField: root?.querySelector("#lambda-uc-field"),
  svg: root?.querySelector("#diagram-svg"),
  visualCaption: root?.querySelector("#visual-caption"),
  tableBody: root?.querySelector("#saved-results-body"),
  equations: {
    primary: root?.querySelector("#equation-primary"),
    secondary: root?.querySelector("#equation-secondary"),
    slenderness: root?.querySelector("#equation-slenderness"),
  },
  outputs: {
    utilisation: root?.querySelector("#utilisation-value"),
    resultStatus: root?.querySelector("#result-status"),
    status: root?.querySelector("#status-value"),
    sectionType: root?.querySelector("#section-type-value"),
    classification: root?.querySelector("#classification-value"),
    amplifiedMoment: root?.querySelector("#amplified-moment-value"),
    capacityMoment: root?.querySelector("#capacity-moment-value"),
    capacityAxial: root?.querySelector("#capacity-axial-value"),
    pureCompression: root?.querySelector("#pure-compression-value"),
    pureBending: root?.querySelector("#pure-bending-value"),
    balancedMoment: root?.querySelector("#balanced-moment-value"),
    balancedAxial: root?.querySelector("#balanced-axial-value"),
    delta: root?.querySelector("#delta-value"),
    tieSpacing: root?.querySelector("#tie-spacing-value"),
    alpha2: root?.querySelector("#alpha2-value"),
    gamma: root?.querySelector("#gamma-value"),
    area: root?.querySelector("#area-value"),
    steelArea: root?.querySelector("#steel-area-value"),
    le: root?.querySelector("#le-value"),
    rg: root?.querySelector("#rg-value"),
    lambda: root?.querySelector("#lambda-value"),
    frameType: root?.querySelector("#frame-type-value"),
    nc: root?.querySelector("#nc-value"),
    betaD: root?.querySelector("#beta-d-value"),
    deltaB: root?.querySelector("#delta-b-value"),
    deltaS: root?.querySelector("#delta-s-value"),
    eccentricity: root?.querySelector("#eccentricity-value"),
    dn: root?.querySelector("#dn-value"),
    aDepth: root?.querySelector("#a-depth-value"),
    curvePoints: root?.querySelector("#curve-points-value"),
  },
};

const state = {
  lastResult: null,
  savedResults: loadSavedResults(),
  animatedValues: new Map(),
  currentEquations: null,
};

let hasInitialised = false;

if (root) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialise);
  } else {
    initialise();
  }

  window.addEventListener("load", () => {
    if (hasInitialised) {
      syncSectionInputs();
      handleInputChange();
    }
  });

  window.addEventListener("pageshow", () => {
    if (hasInitialised) {
      syncSectionInputs();
      handleInputChange();
    }
  });
}

function initialise() {
  if (hasInitialised) {
    return;
  }
  hasInitialised = true;
  populateRestraintCases();
  bindEvents();
  syncSectionInputs();
  renderEquations("rectangular");
  renderSavedResults();
  requestAnimationFrame(() => {
    syncSectionInputs();
    handleInputChange();
  });
}

function bindEvents() {
  root.querySelectorAll("input, select").forEach((field) => {
    field.addEventListener("input", handleInputChange);
    field.addEventListener("change", handleInputChange);
  });

  elements.sectionType.addEventListener("change", () => {
    syncSectionInputs();
    renderEquations(elements.sectionType.value);
    handleInputChange();
  });
  elements.frameType.addEventListener("change", () => {
    populateRestraintCases();
    syncSectionInputs();
    handleInputChange();
  });
  elements.unbracedMethod.addEventListener("change", () => {
    syncSectionInputs();
    handleInputChange();
  });
  elements.restraintCase.addEventListener("change", () => {
    populateRestraintCases();
    handleInputChange();
  });

  elements.saveButton.addEventListener("click", saveCurrentResult);
  elements.exportPdfButton.addEventListener("click", exportWordReport);
}

function syncSectionInputs() {
  const sectionType = elements.sectionType.value;
  elements.rectangularGroup.classList.toggle("is-hidden", sectionType !== "rectangular");
  elements.circularGroup.classList.toggle("is-hidden", sectionType !== "circular");
  const isUnbraced = elements.frameType.value === "unbraced";
  const useElastic = elements.unbracedMethod.value === "elastic";
  elements.unbracedGroup.classList.toggle("is-hidden", !isUnbraced);
  elements.storeySumField.classList.toggle("is-hidden", !isUnbraced || useElastic);
  elements.storeyNcField.classList.toggle("is-hidden", !isUnbraced || useElastic);
  elements.lambdaUcField.classList.toggle("is-hidden", !isUnbraced || !useElastic);
}

function populateRestraintCases() {
  const frameType = elements.frameType.value;
  const options = RESTRAINT_CASES[frameType];
  const current = elements.restraintCase.value;
  elements.restraintCase.innerHTML = "";
  options.forEach((option) => {
    elements.restraintCase.add(new Option(option.label, option.value));
  });
  const fallback = options[0]?.value ?? "";
  elements.restraintCase.value = options.some((option) => option.value === current) ? current : fallback;
  const selected = options.find((option) => option.value === elements.restraintCase.value);
  elements.kFactorDisplay.value = selected ? selected.k.toFixed(2) : "--";
}

function getEquationSet(sectionType) {
  const frameType = elements.frameType?.value || "braced";
  const unbracedMethod = elements.unbracedMethod?.value || "storey";
  return sectionType === "rectangular"
    ? {
      primary: String.raw`N_u=C_c+\sum F_{si},\quad M_u=\left|C_c\left(\frac{D}{2}-\frac{a}{2}\right)+\sum F_{si}\left(\frac{D}{2}-y_i\right)\right|`,
      secondary: String.raw`a=\gamma d_n,\quad C_c=\alpha_2 f'_cba,\quad \varepsilon_{si}=\varepsilon_{cu}\frac{d_n-y_i}{d_n},\quad f_{si}=\max\left(-f_{sy},\min(E_s\varepsilon_{si},f_{sy})\right)`,
      slenderness: frameType === "braced"
        ? String.raw`r=0.3D,\quad L_e=kL_u,\quad \delta_b=\max\left(1,\frac{k_m}{1-\frac{N^*}{N_c}}\right),\quad N_c=\left(\frac{\pi^2}{L_e^2}\right)\left[\frac{182d_0(\phi M_c)}{1+\beta_d}\right]`
        : unbracedMethod === "storey"
          ? String.raw`r=0.3D,\quad L_e=kL_u,\quad \delta=\max(\delta_b,\delta_s),\quad \delta_s=\frac{1}{1-\frac{\sum N^*}{\sum N_c}},\quad \delta_b=\max\left(1,\frac{k_m}{1-\frac{N^*}{N_c}}\right)`
          : String.raw`r=0.3D,\quad L_e=kL_u,\quad \delta=\max(\delta_b,\delta_s),\quad \delta_s=\frac{1}{1-\frac{1+\beta_d}{\alpha_s\lambda_{uc}}},\quad \alpha_s=0.6`,
    }
    : {
      primary: String.raw`N_u=C_c+\sum F_{si},\quad M_u=\left|C_c(r-d_c)+\sum F_{si}(r-d_{si})\right|`,
      secondary: String.raw`b_o=2\sqrt{2ar-a^2},\quad \alpha=4\tan^{-1}\left(\frac{2a}{b_o}\right),\quad A'_c=\frac{1}{2}r^2(\alpha-\sin\alpha),\quad C_c=0.85f'_cA'_c`,
      slenderness: frameType === "braced"
        ? String.raw`r=0.25D,\quad L_e=kL_u,\quad \delta_b=\max\left(1,\frac{k_m}{1-\frac{N^*}{N_c}}\right),\quad N_c=\left(\frac{\pi^2}{L_e^2}\right)\left[\frac{182d_0(\phi M_c)}{1+\beta_d}\right]`
        : unbracedMethod === "storey"
          ? String.raw`r=0.25D,\quad L_e=kL_u,\quad \delta=\max(\delta_b,\delta_s),\quad \delta_s=\frac{1}{1-\frac{\sum N^*}{\sum N_c}},\quad \delta_b=\max\left(1,\frac{k_m}{1-\frac{N^*}{N_c}}\right)`
          : String.raw`r=0.25D,\quad L_e=kL_u,\quad \delta=\max(\delta_b,\delta_s),\quad \delta_s=\frac{1}{1-\frac{1+\beta_d}{\alpha_s\lambda_{uc}}},\quad \alpha_s=0.6`,
    };
}

function renderEquations(sectionType) {
  const equations = getEquationSet(sectionType);
  state.currentEquations = equations;

  Object.entries(equations).forEach(([key, expression]) => {
    const target = elements.equations[key];
    if (window.katex) {
      window.katex.render(expression, target, { throwOnError: false, displayMode: true });
    } else {
      target.textContent = expression;
    }
  });
}

function handleInputChange() {
  const validation = validateInputs();
  updateValidationUI(validation.errors);

  if (!validation.isValid) {
    state.lastResult = null;
    elements.saveButton.disabled = true;
    elements.exportPdfButton.disabled = true;
    setInvalidOutputs();
    drawEmptyState("Resolve the highlighted inputs to generate the interaction check.");
    return;
  }

  const result = runCalculation(validation.values);
  state.lastResult = result;
  elements.saveButton.disabled = false;
  elements.exportPdfButton.disabled = false;
  renderEquations(validation.values.sectionType);
  updateOutputs(result);
  drawDiagram(result);
}

function validateInputs() {
  const errors = {};
  const values = {
    sectionType: elements.sectionType.value,
    frameType: elements.frameType.value,
    unbracedMethod: elements.unbracedMethod.value,
    restraintCase: elements.restraintCase.value,
  };

  Object.entries(GLOBAL_RULES).forEach(([id, rules]) => {
    const parsed = parseNumericField(id, rules, errors);
    if (parsed !== null) {
      values[id] = parsed;
    }
  });

  if (values.sectionType === "rectangular") {
    Object.entries(RECT_RULES).forEach(([id, rules]) => {
      const parsed = parseNumericField(id, rules, errors);
      if (parsed !== null) {
        values[id] = parsed;
      }
    });

    const clearDepth = values.rect_D - 2 * (values.cover + values.rect_barDia / 2);
    if (Number.isFinite(clearDepth) && clearDepth <= 0) {
      errors.rect_D = "Depth must exceed twice the cover plus one bar diameter.";
    }
    if (Number.isFinite(values.rect_b) && values.rect_b <= 2 * (values.cover + values.rect_barDia / 2)) {
      errors.rect_b = "Width must exceed twice the cover plus one bar diameter.";
    }
  } else {
    Object.entries(CIRCLE_RULES).forEach(([id, rules]) => {
      const parsed = parseNumericField(id, rules, errors);
      if (parsed !== null) {
        values[id] = parsed;
      }
    });

    const coreRadius = values.circle_D / 2 - (values.cover + values.circle_barDia / 2);
    if (Number.isFinite(coreRadius) && coreRadius <= 0) {
      errors.circle_D = "Diameter must exceed twice the cover plus one bar diameter.";
    }
  }

  if (Number.isFinite(values.Mstar) && Number.isFinite(values.Nstar) && values.Mstar === 0 && values.Nstar === 0) {
    errors.Mstar = "At least one design action must be greater than zero.";
  }

  const restraint = getSelectedRestraintCase(values.frameType, values.restraintCase);
  if (!restraint) {
    errors.restraintCase = "Select a valid restraint condition.";
  } else {
    values.kFactor = restraint.k;
    values.restraintLabel = restraint.label;
    elements.kFactorDisplay.value = restraint.k.toFixed(2);
  }

  if (values.frameType === "unbraced") {
    if (values.unbracedMethod === "storey") {
      ["sumNstar", "sumNc"].forEach((id) => {
        const parsed = parseNumericField(id, UNBRACED_RULES[id], errors);
        if (parsed !== null) {
          values[id] = parsed;
        }
      });
      if (values.sumNc <= values.sumNstar) {
        errors.sumNc = "ΣNc must exceed ΣN* for the unbraced storey summation method.";
      }
    } else {
      const parsed = parseNumericField("lambdaUc", UNBRACED_RULES.lambdaUc, errors);
      if (parsed !== null) {
        values.lambdaUc = parsed;
      }
      if (values.lambdaUc <= 0) {
        errors.lambdaUc = "lambda_uc must be greater than zero.";
      }
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors, values };
}

function getSelectedRestraintCase(frameType, value) {
  return (RESTRAINT_CASES[frameType] || []).find((option) => option.value === value) || null;
}

function parseNumericField(id, rules, errors) {
  const raw = root.querySelector(`#${id}`)?.value?.trim() ?? "";
  if (raw === "") {
    errors[id] = `${rules.label} is required.`;
    return null;
  }

  const value = Number(raw);
  if (!Number.isFinite(value)) {
    errors[id] = `${rules.label} must be numeric.`;
    return null;
  }
  if (!rules.allowZero && value === 0) {
    errors[id] = `${rules.label} cannot be zero.`;
    return null;
  }
  if (value < 0) {
    errors[id] = `${rules.label} cannot be negative.`;
    return null;
  }
  if (rules.min !== undefined && value < rules.min && !(rules.allowZero && value === 0)) {
    errors[id] = `${rules.label} must be at least ${rules.min}.`;
    return null;
  }
  if (rules.max !== undefined && value > rules.max) {
    errors[id] = `${rules.label} must not exceed ${rules.max}.`;
    return null;
  }
  if (rules.integer && !Number.isInteger(value)) {
    errors[id] = `${rules.label} must be a whole number.`;
    return null;
  }
  return value;
}

function updateValidationUI(errors) {
  root.querySelectorAll(".field-error").forEach((node) => {
    node.textContent = errors[node.dataset.errorFor] || "";
  });

  root.querySelectorAll(".input-shell").forEach((node) => {
    node.classList.remove("has-error");
  });

  Object.keys(errors).forEach((fieldId) => {
    root.querySelector(`#${fieldId}`)?.closest(".input-shell")?.classList.add("has-error");
  });
}

function runCalculation(values) {
  const section = buildSectionModel(values);
  const curve = generateInteractionCurve(section, values);
  const pureCompression = calculatePureCompression(section, values);
  const pureBending = findPureBending(curve) || curve[curve.length - 1];
  const balanced = calculateBalancedPoint(section, values);
  const bucklingMomentPoint = calculateBucklingMomentPoint(section, values);
  const alpha2 = calcAlpha2(values.fc);
  const gamma = calcGamma(values.fc);
  const Le = values.kFactor * values.Lu;
  const rg = section.shape === "rectangular" ? 0.3 * section.depth : 0.25 * section.depth;
  const slendernessRatio = Le / rg;
  const exceedsGeneralLimit = slendernessRatio > values.maxSlenderness;
  const classification = exceedsGeneralLimit ? "Exceeds Limit" : "Within Limit";
  const betaD = calculateBetaD(values, slendernessRatio, section.depth);
  const Nc = calculateCriticalBucklingLoad({
    Le,
    d0: section.d0,
    betaD,
    phiMcBuckling: 0.6 * bucklingMomentPoint.MuNmm,
  });
  const deltaB = Math.max(1, calculateBracedMagnifier(values.km, values.Nstar, Nc));
  const deltaS = values.frameType === "unbraced"
    ? calculateUnbracedMagnifier(values, betaD)
    : NaN;
  const delta = values.frameType === "braced" ? deltaB : Math.max(deltaB, deltaS);
  const amplifiedMoment = values.Mstar * delta;
  const demandOnPhiCurve = resolveDemandCapacity(curve, values.phi, values.Nstar, amplifiedMoment);
  const utilisation = demandOnPhiCurve ? clampPositive(amplifiedMoment / Math.max(demandOnPhiCurve.MuPhi, 1e-6)) : Number.POSITIVE_INFINITY;
  let status = utilisation <= 1 ? "Safe" : (utilisation <= 1.1 ? "Review" : "Unsafe");
  if (exceedsGeneralLimit || (values.frameType === "unbraced" && Number.isFinite(deltaS) && deltaS > 1.5)) {
    status = "Unsafe";
  }
  const demandEccentricity = values.Nstar > 0 ? (amplifiedMoment * 1e6) / (values.Nstar * 1e3) : Infinity;
  const tieSpacingLimit = Math.min(section.leastDimension, 15 * section.barDia);

  return {
    input: values,
    section,
    alpha2,
    gamma,
    curve,
    pureCompression,
    pureBending,
    balanced,
    bucklingMomentPoint,
    Le,
    rg,
    slendernessRatio,
    classification,
    exceedsGeneralLimit,
    betaD,
    Nc,
    deltaB,
    deltaS,
    delta,
    amplifiedMoment,
    demandOnPhiCurve,
    utilisation,
    status,
    demandEccentricity,
    tieSpacingLimit,
  };
}

function buildSectionModel(values) {
  if (values.sectionType === "rectangular") {
    const bars = buildRectangularBars(values);
    return {
      shape: "rectangular",
      width: values.rect_b,
      depth: values.rect_D,
      area: values.rect_b * values.rect_D,
      bars,
      totalSteelArea: bars.reduce((sum, bar) => sum + bar.area, 0),
      barDia: values.rect_barDia,
      centroidY: values.rect_D / 2,
      leastDimension: Math.min(values.rect_b, values.rect_D),
      d0: Math.max(...bars.map((bar) => bar.y)),
    };
  }

  const bars = buildCircularBars(values);
  return {
    shape: "circular",
    width: values.circle_D,
    depth: values.circle_D,
    radius: values.circle_D / 2,
    area: Math.PI * values.circle_D ** 2 / 4,
    bars,
    totalSteelArea: bars.reduce((sum, bar) => sum + bar.area, 0),
    barDia: values.circle_barDia,
    centroidY: values.circle_D / 2,
    leastDimension: values.circle_D,
    d0: Math.max(...bars.map((bar) => bar.y)),
  };
}

function buildRectangularBars(values) {
  const radius = values.rect_barDia / 2;
  const yTop = values.cover + radius;
  const yBottom = values.rect_D - values.cover - radius;
  const area = Math.PI * values.rect_barDia ** 2 / 4;
  const bars = [];
  distributeLine(values.rect_topBars, values.rect_b, values.cover + radius).forEach((x) => bars.push({ x, y: yTop, area }));
  distributeLine(values.rect_bottomBars, values.rect_b, values.cover + radius).forEach((x) => bars.push({ x, y: yBottom, area }));

  if (values.rect_sideBars > 0 && yBottom - yTop > values.rect_barDia) {
    distributeVertical(values.rect_sideBars, yTop, yBottom).forEach((y) => {
      bars.push({ x: values.cover + radius, y, area });
      bars.push({ x: values.rect_b - values.cover - radius, y, area });
    });
  }
  return bars;
}

function buildCircularBars(values) {
  const radius = values.circle_D / 2;
  const barRadius = radius - values.cover - values.circle_barDia / 2;
  const area = Math.PI * values.circle_barDia ** 2 / 4;
  return Array.from({ length: values.circle_barCount }, (_, index) => {
    const theta = -Math.PI / 2 + (index * 2 * Math.PI) / values.circle_barCount;
    return {
      x: radius + barRadius * Math.cos(theta),
      y: radius + barRadius * Math.sin(theta),
      angle: theta,
      area,
    };
  });
}

function distributeLine(count, width, edge) {
  if (count === 1) {
    return [width / 2];
  }
  const span = width - 2 * edge;
  return Array.from({ length: count }, (_, index) => edge + (span * index) / (count - 1));
}

function distributeVertical(count, start, end) {
  if (count === 1) {
    return [(start + end) / 2];
  }
  return Array.from({ length: count }, (_, index) => start + ((end - start) * (index + 1)) / (count + 1));
}

function generateInteractionCurve(section, values) {
  const count = 88;
  const minDn = 0.03 * section.depth;
  const maxDn = 3.2 * section.depth;
  const curve = [];

  for (let i = 0; i < count; i += 1) {
    const ratio = i / (count - 1);
    const dn = minDn * Math.pow(maxDn / minDn, ratio);
    const point = evaluateCapacityAtDn(section, values, dn);
    if (point.Nu >= -50) {
      curve.push(point);
    }
  }

  curve.push(calculateBalancedPoint(section, values));
  curve.push(calculatePureCompression(section, values));

  return curve
    .filter((point) => Number.isFinite(point.Nu) && Number.isFinite(point.Mu))
    .sort((a, b) => b.Nu - a.Nu);
}

function evaluateCapacityAtDn(section, values, dn) {
  const alpha2 = calcAlpha2(values.fc);
  const gamma = calcGamma(values.fc);
  const a = gamma * dn;
  const steelForces = section.bars.map((bar) => {
    const strain = EPSILON_CU * (dn - bar.y) / dn;
    const stress = clamp(strain * values.Es, -values.fsy, values.fsy);
    return {
      ...bar,
      strain,
      stress,
      force: stress * bar.area,
    };
  });

  let concreteForce = 0;
  let concreteY = 0;
  let compressionShape = null;

  if (section.shape === "rectangular") {
    const aEff = clamp(a, 0, section.depth);
    concreteForce = alpha2 * values.fc * section.width * aEff;
    concreteY = aEff > 0 ? aEff / 2 : 0;
    compressionShape = { type: "rect", depth: aEff };
  } else {
    const segment = circularCompressionSegment(section.radius, a);
    concreteForce = 0.85 * values.fc * segment.area;
    concreteY = segment.centroidDepth;
    compressionShape = { type: "circle", ...segment };
  }

  const totalForce = concreteForce + steelForces.reduce((sum, bar) => sum + bar.force, 0);
  const totalMomentNmm =
    concreteForce * (section.centroidY - concreteY) +
    steelForces.reduce((sum, bar) => sum + bar.force * (section.centroidY - bar.y), 0);

  return {
    dn,
    aDepth: Math.max(0, Math.min(a, section.depth)),
    Nu: totalForce / 1000,
    Mu: Math.abs(totalMomentNmm) / 1e6,
    MuNmm: Math.abs(totalMomentNmm),
    concreteForce: concreteForce / 1000,
    steelForces,
    compressionShape,
  };
}

function circularCompressionSegment(radius, depth) {
  if (depth <= 0) {
    return { depth: 0, bo: 0, alpha: 0, area: 0, centroidDepth: 0 };
  }

  if (depth >= 2 * radius) {
    return {
      depth: 2 * radius,
      bo: 2 * radius,
      alpha: 2 * Math.PI,
      area: Math.PI * radius ** 2,
      centroidDepth: radius,
    };
  }

  const bo = 2 * Math.sqrt(Math.max(0, 2 * depth * radius - depth ** 2));
  const alpha = 4 * Math.atan((2 * depth) / Math.max(bo, 1e-9));
  const area = 0.5 * radius ** 2 * (alpha - Math.sin(alpha));
  const centroidDepth = radius * (1 - (4 / 3) * (Math.sin(alpha / 2) ** 3) / Math.max(alpha - Math.sin(alpha), 1e-9));

  return { depth, bo, alpha, area, centroidDepth };
}

function calculateBalancedPoint(section, values) {
  const epsilonSy = values.fsy / values.Es;
  const dt = Math.max(...section.bars.map((bar) => bar.y));
  const dn = (EPSILON_CU * dt) / (EPSILON_CU + epsilonSy);
  return evaluateCapacityAtDn(section, values, dn);
}

function calculateBucklingMomentPoint(section, values) {
  const dn = 0.545 * section.d0;
  return evaluateCapacityAtDn(section, values, dn);
}

function calculatePureCompression(section, values) {
  const alpha2 = calcAlpha2(values.fc);
  const totalForce = alpha2 * values.fc * section.area + values.fsy * section.totalSteelArea;
  return {
    dn: Infinity,
    aDepth: section.depth,
    Nu: totalForce / 1000,
    Mu: 0,
    MuNmm: 0,
    concreteForce: (alpha2 * values.fc * section.area) / 1000,
    steelForces: [],
    compressionShape: section.shape === "rectangular"
      ? { type: "rect", depth: section.depth }
      : circularCompressionSegment(section.radius, 2 * section.radius),
  };
}

function findPureBending(curve) {
  const ascending = [...curve].sort((a, b) => a.Nu - b.Nu);
  for (let i = 0; i < ascending.length - 1; i += 1) {
    const p1 = ascending[i];
    const p2 = ascending[i + 1];
    if ((p1.Nu <= 0 && p2.Nu >= 0) || (p1.Nu >= 0 && p2.Nu <= 0)) {
      return interpolateAtTarget(p1, p2, "Nu", 0);
    }
  }
  return ascending.reduce((best, point) => (Math.abs(point.Nu) < Math.abs(best?.Nu ?? Infinity) ? point : best), null);
}

function resolveDemandCapacity(curve, phi, Nstar, amplifiedMoment) {
  const phiCurve = curve.map((point) => ({
    ...point,
    NuPhi: point.Nu * phi,
    MuPhi: point.Mu * phi,
  })).sort((a, b) => b.NuPhi - a.NuPhi);

  if (Nstar === 0) {
    return phiCurve.reduce((best, point) => (point.MuPhi > (best?.MuPhi ?? -Infinity) ? point : best), null);
  }

  const targetSlope = amplifiedMoment / Nstar;
  let intersection = null;

  for (let i = 0; i < phiCurve.length - 1; i += 1) {
    const p1 = phiCurve[i];
    const p2 = phiCurve[i + 1];
    const f1 = p1.MuPhi - targetSlope * p1.NuPhi;
    const f2 = p2.MuPhi - targetSlope * p2.NuPhi;
    if (f1 === 0) {
      intersection = p1;
      break;
    }
    if (f1 * f2 <= 0) {
      const t = f1 / (f1 - f2);
      intersection = interpolatePoint(p1, p2, t);
      break;
    }
  }

  if (!intersection) {
    intersection = phiCurve.reduce((best, point) => {
      const diff = Math.abs(point.MuPhi - targetSlope * point.NuPhi);
      return diff < (best?.diff ?? Infinity) ? { ...point, diff } : best;
    }, null);
  }

  return intersection;
}

function interpolateAtTarget(p1, p2, key, target) {
  const denominator = p2[key] - p1[key];
  if (Math.abs(denominator) < 1e-9) {
    return p1;
  }
  return interpolatePoint(p1, p2, (target - p1[key]) / denominator);
}

function interpolatePoint(p1, p2, t) {
  const keys = ["dn", "aDepth", "Nu", "Mu", "MuNmm", "NuPhi", "MuPhi"];
  const point = {};
  keys.forEach((key) => {
    if (Number.isFinite(p1[key]) && Number.isFinite(p2[key])) {
      point[key] = p1[key] + (p2[key] - p1[key]) * t;
    }
  });
  point.compressionShape = t < 0.5 ? p1.compressionShape : p2.compressionShape;
  return point;
}

function calculateCriticalBucklingLoad({ Le, d0, betaD, phiMcBuckling }) {
  if (!Number.isFinite(Le) || Le <= 0 || !Number.isFinite(phiMcBuckling) || phiMcBuckling <= 0) {
    return 0;
  }
  const numerator = Math.PI ** 2 * 182 * d0 * phiMcBuckling / (1 + betaD);
  return numerator / (Le ** 2) / 1000;
}

function calculateBracedMagnifier(km, Nstar, Nc) {
  if (!Number.isFinite(Nc) || Nc <= 0 || Nstar >= Nc) {
    return 9.99;
  }
  return km / (1 - Nstar / Nc);
}

function calculateBetaD(values, slendernessRatio, overallDepthMm) {
  if (!Number.isFinite(values.Nstar) || values.Nstar <= 0) {
    return 0;
  }
  const threshold = overallDepthMm > 0 ? values.Mstar / (2 * (overallDepthMm / 1000)) : Infinity;
  if (slendernessRatio < 40 && values.Nstar <= threshold) {
    return 0;
  }
  return values.NGstar / values.Nstar;
}

function calculateUnbracedMagnifier(values, betaD) {
  if (values.unbracedMethod === "storey") {
    if (!Number.isFinite(values.sumNc) || values.sumNc <= values.sumNstar) {
      return 9.99;
    }
    return 1 / (1 - values.sumNstar / values.sumNc);
  }

  const alphaS = 0.6;
  const denominator = 1 - (1 + betaD) / (alphaS * values.lambdaUc);
  if (denominator <= 0) {
    return 9.99;
  }
  return 1 / denominator;
}

function calcAlpha2(fc) {
  return clamp(0.85 - Math.max(0, fc - 50) * 0.0015, 0.67, 0.85);
}

function calcGamma(fc) {
  return clamp(1.05 - 0.007 * fc, 0.67, 0.85);
}

function updateOutputs(result) {
  const utilClass = result.status === "Safe" ? "status-safe" : result.status === "Review" ? "status-warning" : "status-unsafe";
  let note = `Demand point checked using ${result.input.sectionType} section interaction analysis with ${result.input.frameType} slenderness magnification.`;
  if (result.exceedsGeneralLimit) {
    note += " Le/r exceeds the general code limit of 120.";
  } else if (result.input.frameType === "unbraced" && Number.isFinite(result.deltaS) && result.deltaS > 1.5) {
    note += " delta_s exceeds the 1.5 frame proportioning limit.";
  }
  elements.outputs.resultStatus.innerHTML = note;
  elements.visualCaption.textContent = `${formatTitle(result.input.sectionType)} section · ${result.input.frameType} · ${result.classification}`;

  updateAnimatedText(elements.outputs.utilisation, result.utilisation, { decimals: 2 });
  setText(elements.outputs.status, result.status, utilClass);
  setText(elements.outputs.sectionType, formatTitle(result.input.sectionType));
  setText(elements.outputs.classification, result.classification, utilClass);
  updateAnimatedText(elements.outputs.amplifiedMoment, result.amplifiedMoment, { decimals: 1 });
  updateAnimatedText(elements.outputs.capacityMoment, result.demandOnPhiCurve?.MuPhi ?? 0, { decimals: 1 });
  updateAnimatedText(elements.outputs.capacityAxial, result.demandOnPhiCurve?.NuPhi ?? 0, { decimals: 0 });
  updateAnimatedText(elements.outputs.pureCompression, result.pureCompression.Nu * result.input.phi, { decimals: 0 });
  updateAnimatedText(elements.outputs.pureBending, result.pureBending.Mu * result.input.phi, { decimals: 1 });
  updateAnimatedText(elements.outputs.balancedMoment, result.balanced.Mu * result.input.phi, { decimals: 1 });
  updateAnimatedText(elements.outputs.balancedAxial, result.balanced.Nu * result.input.phi, { decimals: 0 });
  updateAnimatedText(elements.outputs.delta, result.delta, { decimals: 2 });
  updateAnimatedText(elements.outputs.tieSpacing, result.tieSpacingLimit, { decimals: 0 });
  updateAnimatedText(elements.outputs.alpha2, result.alpha2, { decimals: 3 });
  updateAnimatedText(elements.outputs.gamma, result.gamma, { decimals: 3 });
  updateAnimatedText(elements.outputs.area, result.section.area, { decimals: 0 });
  updateAnimatedText(elements.outputs.steelArea, result.section.totalSteelArea, { decimals: 0 });
  updateAnimatedText(elements.outputs.le, result.Le, { decimals: 0 });
  updateAnimatedText(elements.outputs.rg, result.rg, { decimals: 1 });
  updateAnimatedText(elements.outputs.lambda, result.slendernessRatio, { decimals: 1 });
  setText(elements.outputs.frameType, formatTitle(result.input.frameType));
  updateAnimatedText(elements.outputs.nc, result.Nc, { decimals: 0 });
  updateAnimatedText(elements.outputs.betaD, result.betaD, { decimals: 2 });
  updateAnimatedText(elements.outputs.deltaB, result.deltaB, { decimals: 2 });
  updateAnimatedText(elements.outputs.deltaS, result.deltaS, { decimals: 2, fallback: "n/a" });
  updateAnimatedText(elements.outputs.eccentricity, result.demandEccentricity, { decimals: 0, fallback: "∞" });
  updateAnimatedText(elements.outputs.dn, result.demandOnPhiCurve?.dn ?? 0, { decimals: 0 });
  updateAnimatedText(elements.outputs.aDepth, result.demandOnPhiCurve?.aDepth ?? 0, { decimals: 0 });
  updateAnimatedText(elements.outputs.curvePoints, result.curve.length, { decimals: 0 });
}

function setText(node, value, className = "") {
  node.textContent = value;
  node.className = node.className.split(" ").filter((name) => !name.startsWith("status-")).join(" ").trim();
  if (className) {
    node.classList.add(className);
  }
}

function setInvalidOutputs() {
  elements.visualCaption.textContent = "Awaiting valid inputs";
  elements.outputs.resultStatus.textContent = "Complete the required inputs to evaluate the column.";
  [
    "utilisation", "status", "sectionType", "classification", "amplifiedMoment", "capacityMoment",
    "capacityAxial", "pureCompression", "pureBending", "balancedMoment", "balancedAxial", "delta",
    "tieSpacing", "alpha2", "gamma", "area", "steelArea", "le", "rg", "lambda", "frameType", "nc",
    "betaD", "deltaB", "deltaS", "eccentricity", "dn", "aDepth", "curvePoints",
  ].forEach((key) => {
    elements.outputs[key].textContent = "--";
  });
}

function updateAnimatedText(node, value, { decimals = 2, fallback = "--" } = {}) {
  if (!Number.isFinite(value)) {
    node.textContent = fallback;
    return;
  }

  const start = state.animatedValues.get(node) ?? value;
  const end = value;
  const duration = 220;
  const startTime = performance.now();

  function frame(now) {
    const progress = Math.min(1, (now - startTime) / duration);
    const eased = 1 - (1 - progress) ** 3;
    const current = start + (end - start) * eased;
    node.textContent = current.toFixed(decimals);
    if (progress < 1) {
      requestAnimationFrame(frame);
    } else {
      state.animatedValues.set(node, end);
      node.textContent = end.toFixed(decimals);
    }
  }

  requestAnimationFrame(frame);
}

function drawEmptyState(message) {
  elements.svg.innerHTML = `
    <rect x="24" y="24" width="1072" height="592" rx="28" fill="rgba(255,255,255,0.65)" stroke="rgba(17,33,29,0.08)"></rect>
    <text x="560" y="300" text-anchor="middle" fill="#667a74" font-size="24" font-weight="600">${escapeXml(message)}</text>
    <text x="560" y="336" text-anchor="middle" fill="#8da39b" font-size="16">Section visualisation, compression block, and interaction curve appear here.</text>
  `;
}

function drawDiagram(result) {
  const sectionMarkup = result.section.shape === "rectangular" ? drawRectSection(result) : drawCircleSection(result);
  const interactionMarkup = drawInteractionDiagram(result);

  elements.svg.innerHTML = `
    <defs>
      <marker id="arrow-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#275ea8"></path>
      </marker>
      <marker id="arrow-muted" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#7b8f88"></path>
      </marker>
    </defs>
    ${sectionMarkup}
    ${interactionMarkup}
  `;
}

function drawRectSection(result) {
  const { section, demandOnPhiCurve, input } = result;
  const x = 108;
  const y = 98;
  const boxWidth = 280;
  const boxHeight = 360;
  const scaleX = boxWidth / section.width;
  const scaleY = boxHeight / section.depth;
  const demandDepth = demandOnPhiCurve?.compressionShape?.type === "rect" ? demandOnPhiCurve.compressionShape.depth * scaleY : 0;
  const bars = section.bars.map((bar) => `
    <circle cx="${x + bar.x * scaleX}" cy="${y + bar.y * scaleY}" r="${Math.max(5, section.barDia * scaleX * 0.36)}" fill="#ffffff" stroke="#183f73" stroke-width="2.2"></circle>
  `).join("");

  return `
    <g>
      <text x="${x}" y="58" fill="#11211d" font-size="20" font-weight="700">Section Visual</text>
      <text x="${x}" y="82" fill="#667a74" font-size="14">Compression at top face, bending about the horizontal axis</text>
      <rect x="${x}" y="${y}" width="${boxWidth}" height="${boxHeight}" rx="22" fill="#ffffff" stroke="#14312b" stroke-width="2.4"></rect>
      <rect x="${x}" y="${y}" width="${boxWidth}" height="${Math.max(0, demandDepth)}" rx="22" fill="rgba(39,94,168,0.18)" stroke="rgba(39,94,168,0.28)" stroke-width="1.4"></rect>
      <line x1="${x}" y1="${y + boxHeight / 2}" x2="${x + boxWidth}" y2="${y + boxHeight / 2}" stroke="#7b8f88" stroke-width="1.5" stroke-dasharray="8 8"></line>
      <line x1="${x + boxWidth / 2}" y1="${y - 28}" x2="${x + boxWidth / 2}" y2="${y + boxHeight + 28}" stroke="#7b8f88" stroke-width="1.5" stroke-dasharray="8 8"></line>
      <text x="${x + boxWidth / 2 + 10}" y="${y + boxHeight / 2 - 10}" fill="#7b8f88" font-size="13">centroid</text>
      ${bars}
      <line x1="${x - 44}" y1="${y}" x2="${x - 44}" y2="${y + boxHeight}" stroke="#7b8f88" stroke-width="1.2" marker-start="url(#arrow-muted)" marker-end="url(#arrow-muted)"></line>
      <text x="${x - 70}" y="${y + boxHeight / 2}" fill="#667a74" font-size="14" transform="rotate(-90 ${x - 70} ${y + boxHeight / 2})">${input.rect_D.toFixed(0)} mm</text>
      <line x1="${x}" y1="${y + boxHeight + 42}" x2="${x + boxWidth}" y2="${y + boxHeight + 42}" stroke="#7b8f88" stroke-width="1.2" marker-start="url(#arrow-muted)" marker-end="url(#arrow-muted)"></line>
      <text x="${x + boxWidth / 2}" y="${y + boxHeight + 66}" text-anchor="middle" fill="#667a74" font-size="14">${input.rect_b.toFixed(0)} mm</text>
      <line x1="${x + boxWidth + 34}" y1="${y}" x2="${x + boxWidth + 34}" y2="${y + Math.max(0, demandDepth)}" stroke="#275ea8" stroke-width="2" marker-start="url(#arrow-head)" marker-end="url(#arrow-head)"></line>
      <text x="${x + boxWidth + 54}" y="${y + Math.max(18, demandDepth / 2)}" fill="#275ea8" font-size="14">a = ${(demandOnPhiCurve?.aDepth ?? 0).toFixed(0)} mm</text>
      <line x1="${x + boxWidth / 2}" y1="${y - 56}" x2="${x + boxWidth / 2}" y2="${y - 6}" stroke="#275ea8" stroke-width="2.2" marker-end="url(#arrow-head)"></line>
      <text x="${x + boxWidth / 2 + 12}" y="${y - 34}" fill="#275ea8" font-size="15" font-weight="700">N* = ${result.input.Nstar.toFixed(0)} kN</text>
      <path d="M ${x + boxWidth + 84} ${y + boxHeight - 10} A 74 74 0 0 1 ${x + boxWidth + 10} ${y + boxHeight - 84}" fill="none" stroke="#275ea8" stroke-width="2.2" marker-end="url(#arrow-head)"></path>
      <text x="${x + boxWidth + 96}" y="${y + boxHeight - 22}" fill="#275ea8" font-size="15" font-weight="700">M*a = ${result.amplifiedMoment.toFixed(1)} kNm</text>
    </g>
  `;
}

function drawCircleSection(result) {
  const { section, demandOnPhiCurve, input } = result;
  const radiusPx = 172;
  const cx = 250;
  const cy = 280;
  const scale = radiusPx / section.radius;
  const compression = demandOnPhiCurve?.compressionShape;
  const bars = section.bars.map((bar) => `
    <circle cx="${cx + (bar.x - section.radius) * scale}" cy="${cy + (bar.y - section.radius) * scale}" r="${Math.max(5, section.barDia * scale * 0.36)}" fill="#ffffff" stroke="#183f73" stroke-width="2.2"></circle>
  `).join("");
  const segmentPath = compression?.type === "circle" ? buildCircleSegmentPath(cx, cy, radiusPx, compression.depth * scale) : "";

  return `
    <g>
      <text x="84" y="58" fill="#11211d" font-size="20" font-weight="700">Section Visual</text>
      <text x="84" y="82" fill="#667a74" font-size="14">Circular compression segment based on the trial neutral axis depth</text>
      <circle cx="${cx}" cy="${cy}" r="${radiusPx}" fill="#ffffff" stroke="#14312b" stroke-width="2.4"></circle>
      ${segmentPath ? `<path d="${segmentPath}" fill="rgba(39,94,168,0.18)" stroke="rgba(39,94,168,0.3)" stroke-width="1.4"></path>` : ""}
      <line x1="${cx - radiusPx}" y1="${cy}" x2="${cx + radiusPx}" y2="${cy}" stroke="#7b8f88" stroke-width="1.5" stroke-dasharray="8 8"></line>
      <line x1="${cx}" y1="${cy - radiusPx - 26}" x2="${cx}" y2="${cy + radiusPx + 26}" stroke="#7b8f88" stroke-width="1.5" stroke-dasharray="8 8"></line>
      <text x="${cx + 10}" y="${cy - 12}" fill="#7b8f88" font-size="13">centroid</text>
      ${bars}
      <line x1="${cx - radiusPx - 52}" y1="${cy - radiusPx}" x2="${cx - radiusPx - 52}" y2="${cy + radiusPx}" stroke="#7b8f88" stroke-width="1.2" marker-start="url(#arrow-muted)" marker-end="url(#arrow-muted)"></line>
      <text x="${cx - radiusPx - 76}" y="${cy}" fill="#667a74" font-size="14" transform="rotate(-90 ${cx - radiusPx - 76} ${cy})">${input.circle_D.toFixed(0)} mm</text>
      <line x1="${cx}" y1="${cy - radiusPx - 60}" x2="${cx}" y2="${cy - radiusPx - 8}" stroke="#275ea8" stroke-width="2.2" marker-end="url(#arrow-head)"></line>
      <text x="${cx + 12}" y="${cy - radiusPx - 34}" fill="#275ea8" font-size="15" font-weight="700">N* = ${result.input.Nstar.toFixed(0)} kN</text>
      <path d="M ${cx + radiusPx + 78} ${cy + radiusPx - 8} A 74 74 0 0 1 ${cx + radiusPx + 8} ${cy + radiusPx - 82}" fill="none" stroke="#275ea8" stroke-width="2.2" marker-end="url(#arrow-head)"></path>
      <text x="${cx + radiusPx + 88}" y="${cy + radiusPx - 20}" fill="#275ea8" font-size="15" font-weight="700">M*a = ${result.amplifiedMoment.toFixed(1)} kNm</text>
      <text x="${cx + radiusPx + 36}" y="${cy - radiusPx + 6}" fill="#275ea8" font-size="14">a = ${(demandOnPhiCurve?.aDepth ?? 0).toFixed(0)} mm</text>
    </g>
  `;
}

function buildCircleSegmentPath(cx, cy, radius, depth) {
  if (depth <= 0) {
    return "";
  }
  if (depth >= 2 * radius) {
    return `M ${cx - radius} ${cy} A ${radius} ${radius} 0 1 0 ${cx + radius} ${cy} A ${radius} ${radius} 0 1 0 ${cx - radius} ${cy}`;
  }
  const yChord = cy - radius + depth;
  const dx = Math.sqrt(Math.max(0, radius ** 2 - (yChord - cy) ** 2));
  const x1 = cx - dx;
  const x2 = cx + dx;
  return `M ${x1} ${yChord} A ${radius} ${radius} 0 0 1 ${x2} ${yChord} L ${x1} ${yChord} Z`;
}

function drawInteractionDiagram(result) {
  const x = 540;
  const y = 96;
  const width = 500;
  const height = 420;
  const padding = 56;
  const phiCurve = result.curve.map((point) => ({
    M: point.Mu * result.input.phi,
    N: point.Nu * result.input.phi,
  })).filter((point) => point.N >= -10);
  const maxM = Math.max(result.amplifiedMoment, ...phiCurve.map((point) => point.M), 1);
  const maxN = Math.max(result.input.Nstar, ...phiCurve.map((point) => point.N), 1);
  const sx = (value) => x + padding + (value / maxM) * (width - 2 * padding);
  const sy = (value) => y + height - padding - (Math.max(value, 0) / maxN) * (height - 2 * padding);
  const curvePath = phiCurve.map((point, index) => `${index === 0 ? "M" : "L"} ${sx(point.M)} ${sy(point.N)}`).join(" ");
  const demand = { M: result.amplifiedMoment, N: result.input.Nstar };
  const capacity = result.demandOnPhiCurve ? { M: result.demandOnPhiCurve.MuPhi, N: result.demandOnPhiCurve.NuPhi } : null;

  const gridLines = Array.from({ length: 5 }, (_, index) => {
    const factor = index / 4;
    const gy = y + padding + factor * (height - 2 * padding);
    const gx = x + padding + factor * (width - 2 * padding);
    return `
      <line x1="${x + padding}" y1="${gy}" x2="${x + width - padding}" y2="${gy}" stroke="rgba(39,94,168,0.08)" stroke-width="1"></line>
      <line x1="${gx}" y1="${y + padding}" x2="${gx}" y2="${y + height - padding}" stroke="rgba(39,94,168,0.08)" stroke-width="1"></line>
    `;
  }).join("");

  const demandLine = result.input.Nstar > 0
    ? `<line x1="${sx(0)}" y1="${sy(0)}" x2="${sx(capacity?.M ?? demand.M)}" y2="${sy(capacity?.N ?? demand.N)}" stroke="#7b8f88" stroke-width="1.6" stroke-dasharray="7 7"></line>`
    : "";

  return `
    <g>
      <text x="${x}" y="58" fill="#11211d" font-size="20" font-weight="700">Interaction Diagram</text>
      <text x="${x}" y="82" fill="#667a74" font-size="14">&phi;-reduced curve with demand line and capacity intersection</text>
      <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="28" fill="rgba(255,255,255,0.78)" stroke="rgba(17,33,29,0.08)"></rect>
      ${gridLines}
      <line x1="${x + padding}" y1="${y + height - padding}" x2="${x + width - padding}" y2="${y + height - padding}" stroke="#14312b" stroke-width="1.8" marker-end="url(#arrow-muted)"></line>
      <line x1="${x + padding}" y1="${y + height - padding}" x2="${x + padding}" y2="${y + padding}" stroke="#14312b" stroke-width="1.8" marker-end="url(#arrow-muted)"></line>
      <text x="${x + width - padding}" y="${y + height - padding + 26}" text-anchor="end" fill="#667a74" font-size="14">Moment, M</text>
      <text x="${x + padding - 26}" y="${y + padding}" transform="rotate(-90 ${x + padding - 26} ${y + padding})" fill="#667a74" font-size="14">Axial load, N</text>
      <path d="${curvePath}" fill="none" stroke="#275ea8" stroke-width="3"></path>
      ${demandLine}
      <circle cx="${sx(demand.M)}" cy="${sy(demand.N)}" r="8" fill="#ca4f4f"></circle>
      <text x="${sx(demand.M) + 12}" y="${sy(demand.N) - 12}" fill="#ca4f4f" font-size="14" font-weight="700">Demand</text>
      ${capacity ? `
        <circle cx="${sx(capacity.M)}" cy="${sy(capacity.N)}" r="8" fill="#275ea8"></circle>
        <text x="${sx(capacity.M) + 12}" y="${sy(capacity.N) - 12}" fill="#275ea8" font-size="14" font-weight="700">Capacity</text>
      ` : ""}
      <text x="${x + width - 28}" y="${y + 34}" text-anchor="end" fill="#11211d" font-size="16" font-weight="700">η = ${result.utilisation.toFixed(2)}</text>
    </g>
  `;
}

async function exportWordReport() {
  const button = elements.exportPdfButton;
  const originalLabel = button.textContent;

  button.disabled = true;
  button.textContent = "Generating Word Report...";

  try {
    if (!window.docx) {
      throw new Error("The Word export library is not available on this page.");
    }

    const data = state.lastResult
      ? buildCalculationReportData(state.lastResult)
      : buildFallbackCalculationReportData();

    if (!data || !data.metadata) {
      throw new Error("Could not build report data.");
    }

    console.log("Word report data:", data);

    const reportDocument = await buildWordReportDocument(data);
    const blob = await window.docx.Packer.toBlob(reportDocument);
    const filename = `${data.metadata.toolSlug || "engineering-report"}_${formatFileTimestamp(new Date())}.docx`;

    downloadBlob(filename, blob);

    if (elements.resultStatus) {
      elements.resultStatus.textContent = "Word report downloaded successfully.";
    }
  } catch (error) {
    console.error("RC Column Word report export failed:", error);
    if (elements.resultStatus) {
      elements.resultStatus.textContent = "Word report could not be generated. Please review the inputs and try again.";
    }
    if (typeof window.alert === "function") {
      window.alert("Word report could not be generated. Please try again.");
    }
  } finally {
    button.disabled = false;
    button.textContent = originalLabel;
  }
}

function buildCalculationReportData(result) {
  const generatedAt = new Date();
  const equations = getWordEquationSet(result.input);

  return {
    metadata: {
      title: "Interaction-Based Column Designer",
      subtitle: "Reinforced concrete column capacity verification and slenderness magnification report",
      toolSlug: "rc-column-designer",
      company: root.dataset.reportCompany || "Not specified",
      project: root.dataset.reportProject || "Not specified",
      preparedBy: root.dataset.reportPreparedBy || "Not specified",
      generatedAt: formatReportDate(generatedAt),
      disclaimer: root.dataset.reportDisclaimer || "",
    },
    summaryItems: [
      { label: "Status", value: result.status, className: getStatusClass(result.status) },
      { label: "Utilisation", value: `${formatPdfValue(result.utilisation, 2)} \u03B7` },
      { label: "Amplified Moment", value: `${formatPdfValue(result.amplifiedMoment, 1)} kNm` },
      { label: "Capacity", value: `${formatPdfValue(result.demandOnPhiCurve?.MuPhi, 1)} kNm` },
    ],
    inputRows: filterReportRows(getInputParameterRows(result.input), "Input Parameters"),
    finalRows: filterReportRows(getFinalResultRows(result), "Final Results"),
    intermediateRows: filterReportRows(getIntermediateRows(result), "Intermediate Calculations"),
    methodologyItems: getMethodologyItems(result),
    equationRows: getEquationRows(equations),
    equations,
    diagramSvgMarkup: serializeDiagramMarkup(),
    visualCaption: elements.visualCaption?.textContent?.trim() || "Current section visualisation and interaction diagram.",
    assumptions: [
      "Results reflect the current tool inputs and section assumptions at the time of export.",
      "Printed output should be reviewed by a qualified engineer before issue or construction use.",
    ],
  };
}

function buildFallbackCalculationReportData() {
  return {
    metadata: {
      title: "Engineering Calculation Report",
      subtitle: "Fallback engineering calculation report",
      toolSlug: "rc-column-designer",
      company: "Not specified",
      project: "Not specified",
      preparedBy: "Not specified",
      generatedAt: new Date().toLocaleString(),
      disclaimer: "",
    },
    summaryItems: [
      { label: "Status", value: "WORD TEST", className: "pass" },
      { label: "Utilisation", value: "N/A" },
      { label: "Amplified Moment", value: "N/A" },
      { label: "Capacity", value: "N/A" },
    ],
    inputRows: [["Test Input, x", "100", "mm"]],
    finalRows: [["Test Result", "PASS", ""]],
    intermediateRows: [["Report Generation Check", "Structured report data generated", ""]],
    methodologyItems: ["Fallback report confirms the Word export pipeline is producing a structured document."],
    equationRows: [
      ["Interaction Method", "Nu = Cc + ΣFsi; Mu = |Cc zc + Σ(Fsi zi)|", "Primary section equilibrium relation"],
      ["Section Strength", "a = γ dn; Cc = α2 f'c b a", "Compression-block force model"],
      ["Slenderness Check", "δ = max(δb, δs)", "Moment magnification relationship"],
    ],
    equations: {
      primary: "Nu = Cc + ΣFsi; Mu = |Cc zc + Σ(Fsi zi)|",
      secondary: "a = γ dn; Cc = α2 f'c b a",
      slenderness: "δ = max(δb, δs)",
    },
    diagramSvgMarkup: "",
    visualCaption: "Fallback report with no live visualisation available.",
    assumptions: ["Fallback content is shown because no live calculation result was available."],
  };
}

function validateCalculationReportData(reportData) {
  ["inputRows", "finalRows", "intermediateRows"].forEach((key) => {
    if (!reportData[key].length) {
      console.warn(`RC Column Word report: ${key} is empty.`);
    }
  });
}

function filterReportRows(rows, sectionName) {
  return rows.filter((row) => {
    const hasValue = row.some((cell) => cell !== undefined && cell !== null && String(cell).trim() !== "");
    if (!hasValue) {
      console.warn(`RC Column Word report: skipped empty row in ${sectionName}.`, row);
      return false;
    }

    const hasMeaningfulValue = row.slice(1).some((cell) => {
      const value = String(cell ?? "").trim();
      return value && value !== "N/A";
    });

    if (!hasMeaningfulValue) {
      console.warn(`RC Column Word report: skipped unavailable row in ${sectionName}.`, row);
      return false;
    }

    return true;
  });
}

function getInputParameterRows(input) {
  const rows = [
    ["Section Shape", formatTitle(input.sectionType), ""],
    ["Concrete Strength, f'c", formatPdfValue(input.fc, 0), "MPa"],
    ["Steel Yield Strength, fsy", formatPdfValue(input.fsy, 0), "MPa"],
    ["Steel Modulus, Es", formatPdfValue(input.Es, 0), "MPa"],
    ["Strength Factor, φ", formatPdfValue(input.phi, 2), "factor"],
    ["Clear Cover", formatPdfValue(input.cover, 0), "mm"],
    ["Design Axial Force, N*", formatPdfValue(input.Nstar, 0), "kN"],
    ["Design Moment, M*", formatPdfValue(input.Mstar, 1), "kNm"],
    ["Frame Type", formatTitle(input.frameType), ""],
    ["Clear Height, Lu", formatPdfValue(input.Lu, 0), "mm"],
    ["Effective Length Factor, k", formatPdfValue(input.kFactor, 2), "factor"],
    ["Moment Factor, km", formatPdfValue(input.km, 2), "factor"],
    ["Permanent Axial Force, NG*", formatPdfValue(input.NGstar, 0), "kN"],
    ["General Slenderness Limit", formatPdfValue(input.maxSlenderness, 0), "ratio"],
    ["Tie / Spiral Bar Diameter", formatPdfValue(input.tieBarDia, 0), "mm"],
  ];

  if (input.frameType === "unbraced") {
    rows.push(["δs Method", input.unbracedMethod === "elastic" ? "Elastic Buckling Alternative" : "Storey Summation", ""]);
    if (input.unbracedMethod === "elastic") {
      rows.push(["Frame Buckling Ratio, λuc", formatPdfValue(input.lambdaUc, 2), "ratio"]);
    } else {
      rows.push(["Storey Sum, ΣN*", formatPdfValue(input.sumNstar, 0), "kN"]);
      rows.push(["Storey Sum, ΣNc", formatPdfValue(input.sumNc, 0), "kN"]);
    }
  }

  if (input.sectionType === "rectangular") {
    rows.push(
      ["Width, b", formatPdfValue(input.rect_b, 0), "mm"],
      ["Depth, D", formatPdfValue(input.rect_D, 0), "mm"],
      ["Main Bar Diameter", formatPdfValue(input.rect_barDia, 0), "mm"],
      ["Top Bars", formatPdfValue(input.rect_topBars, 0), "count"],
      ["Bottom Bars", formatPdfValue(input.rect_bottomBars, 0), "count"],
      ["Side Bars per Face", formatPdfValue(input.rect_sideBars, 0), "count"]
    );
  } else {
    rows.push(
      ["Diameter, D", formatPdfValue(input.circle_D, 0), "mm"],
      ["Main Bar Diameter", formatPdfValue(input.circle_barDia, 0), "mm"],
      ["Number of Bars", formatPdfValue(input.circle_barCount, 0), "count"]
    );
  }

  return rows;
}

function getIntermediateRows(result) {
  return [
    ["α2", formatPdfValue(result.alpha2, 3), "factor"],
    ["γ", formatPdfValue(result.gamma, 3), "factor"],
    ["Gross Area", formatPdfValue(result.section.area, 0), "mm²"],
    ["Steel Area", formatPdfValue(result.section.totalSteelArea, 0), "mm²"],
    ["Effective Length, Le", formatPdfValue(result.Le, 0), "mm"],
    ["Radius of Gyration, r", formatPdfValue(result.rg, 1), "mm"],
    ["Slenderness Ratio, Le/r", formatPdfValue(result.slendernessRatio, 2), "ratio"],
    ["Critical Buckling Load, Nc", formatPdfValue(result.Nc, 1), "kN"],
    ["βd", formatPdfValue(result.betaD, 3), "factor"],
    ["δb", formatPdfValue(result.deltaB, 3), "factor"],
    ["δs", formatPdfValue(result.deltaS, 3), "factor"],
    ["Governing Magnifier, δ", formatPdfValue(result.delta, 3), "factor"],
    ["Demand Eccentricity", formatPdfValue(result.demandEccentricity, 1), "mm"],
    ["Neutral Axis at Demand", formatPdfValue(result.demandOnPhiCurve?.dn, 1), "mm"],
    ["Compression Block Depth, a", formatPdfValue(result.demandOnPhiCurve?.aDepth, 1), "mm"],
    ["Interaction Curve Samples", formatPdfValue(result.curve.length, 0), "count"],
  ];
}

function getFinalResultRows(result) {
  return [
    ["Status", result.status, result.status === "Safe" ? "PASS" : "FAIL"],
    ["Utilisation, η", formatPdfValue(result.utilisation, 2), "ratio"],
    ["Amplified Moment, M*a", formatPdfValue(result.amplifiedMoment, 1), "kNm"],
    ["Capacity on Demand Line", formatPdfValue(result.demandOnPhiCurve?.MuPhi, 1), "kNm"],
    ["Capacity Axial Force", formatPdfValue(result.demandOnPhiCurve?.NuPhi, 1), "kN"],
    ["Pure Compression", formatPdfValue(result.pureCompression?.NuPhi, 1), "kN"],
    ["Pure Bending", formatPdfValue(result.pureBending?.MuPhi, 1), "kNm"],
    ["Balanced Moment", formatPdfValue(result.balanced?.MuPhi, 1), "kNm"],
    ["Balanced Axial", formatPdfValue(result.balanced?.NuPhi, 1), "kN"],
    ["Tie / Helix Limit", formatPdfValue(result.tieSpacingLimit, 1), "mm"],
    ["General Slenderness Check", result.classification, result.exceedsGeneralLimit ? "FAIL" : "PASS"],
  ];
}

function getMethodologyItems(result) {
  const shapeText = result.section.shape === "rectangular"
    ? "Rectangular section analysis uses a rectangular stress block and discrete longitudinal bar forces."
    : "Circular section analysis uses a compression segment derived from the circular stress-block geometry.";

  const frameText = result.input.frameType === "braced"
    ? "Braced-column magnification follows the governing δb expression using the critical buckling load."
    : "Unbraced-column magnification checks both δb and δs, then applies the larger value to the design moment.";

  return [
    shapeText,
    frameText,
    "Interaction capacities are generated across multiple neutral-axis positions and reduced by the selected strength factor.",
    "Demand capacity is resolved by intersecting the amplified action line with the phi-reduced interaction curve.",
    "PASS / FAIL outcomes combine utilisation checks with slenderness and stability review conditions.",
  ];
}

function getEquationRows(equations) {
  return [
    ["Interaction Method", equations.primary || "Not available", "Primary section equilibrium and moment capacity relationship"],
    ["Section Strength", equations.secondary || "Not available", "Stress-block, strain, and section-force formulation"],
    ["Slenderness Check", equations.slenderness || "Not available", "Moment magnification and stability check relationship"],
  ];
}

function serializeDiagramMarkup() {
  return elements.svg ? elements.svg.outerHTML : "";
}

function downloadBlob(filename, blob) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 1000);
}

async function buildWordReportDocument(reportData) {
  const docx = window.docx;
  const {
    AlignmentType,
    BorderStyle,
    Document,
    Footer,
    ImageRun,
    Packer,
    PageNumber,
    Paragraph,
    ShadingType,
    Table,
    TableCell,
    TableRow,
    TextRun,
    WidthType,
  } = docx;

  void Packer;

  validateCalculationReportData(reportData);

  const diagramSection = await createDiagramSection(ImageRun, Paragraph, reportData.diagramSvgMarkup, reportData.visualCaption);
  const footer = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({
            children: ["Page ", PageNumber.CURRENT, " of ", PageNumber.TOTAL_PAGES],
            size: 16,
            color: "6B7280",
          }),
        ],
      }),
    ],
  });

  const children = [
    createReportTitleParagraph(Paragraph, TextRun, reportData.metadata),
    createReportSubtitleParagraph(Paragraph, TextRun, reportData.metadata),
    ...createMetadataSection(Table, TableRow, TableCell, Paragraph, TextRun, BorderStyle, ShadingType, WidthType, reportData.metadata),
    ...createSummarySection(Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, ShadingType, WidthType, reportData.summaryItems),
    ...createInputsTable(Table, TableRow, TableCell, Paragraph, TextRun, BorderStyle, ShadingType, WidthType, reportData.inputRows),
    ...createResultsTable(Table, TableRow, TableCell, Paragraph, TextRun, BorderStyle, ShadingType, WidthType, reportData.finalRows),
    ...diagramSection,
    ...createCalculationSection(Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, ShadingType, WidthType, reportData),
    ...createAssumptionsSection(Paragraph, TextRun, reportData.assumptions, reportData.metadata.disclaimer),
  ];

  return new Document({
    creator: "Engineering Tools Plugin",
    title: reportData.metadata.title || "Engineering Calculation Report",
    description: reportData.metadata.subtitle || "Engineering calculation sheet",
    styles: {
      paragraphStyles: [
        {
          id: "ReportTitle",
          name: "Report Title",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { bold: true, size: 36, color: "1F2937" },
          paragraph: { spacing: { after: 120 } },
        },
        {
          id: "ReportHeading",
          name: "Report Heading",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { bold: true, size: 24, color: "1F2937" },
          paragraph: { spacing: { before: 180, after: 80 }, keepNext: true },
        },
        {
          id: "BodyCompact",
          name: "Body Compact",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 18, color: "222222" },
          paragraph: { spacing: { after: 60 } },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        footers: {
          default: footer,
        },
        children,
      },
    ],
  });
}

function createReportTitleParagraph(Paragraph, TextRun, metadata) {
  return new Paragraph({
    style: "ReportTitle",
    children: [
      new TextRun({
        text: metadata.title || "Engineering Calculation Report",
        bold: true,
      }),
    ],
  });
}

function createReportSubtitleParagraph(Paragraph, TextRun, metadata) {
  return new Paragraph({
    style: "BodyCompact",
    children: [
      new TextRun({
        text: metadata.subtitle || "",
        italics: true,
        color: "4B5563",
      }),
    ],
  });
}

function createMetadataSection(Table, TableRow, TableCell, Paragraph, TextRun, BorderStyle, ShadingType, WidthType, metadata) {
  return [
    createSectionHeading(Paragraph, TextRun, "Project Metadata"),
    createWordTable(
      Table,
      TableRow,
      TableCell,
      Paragraph,
      TextRun,
      BorderStyle,
      ShadingType,
      WidthType,
      ["Field", "Value"],
      [
        ["Company", metadata.company || "Not specified"],
        ["Project", metadata.project || "Not specified"],
        ["Prepared By", metadata.preparedBy || "Not specified"],
        ["Generated", metadata.generatedAt || formatReportDate(new Date())],
      ]
    ),
  ];
}

function createSummarySection(Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, ShadingType, WidthType, summaryItems) {
  const rows = (summaryItems || []).map((item) => [
    item.label,
    item.value,
  ]);

  return [
    createSectionHeading(Paragraph, TextRun, "Design Summary"),
    createWordTable(
      Table,
      TableRow,
      TableCell,
      Paragraph,
      TextRun,
      BorderStyle,
      ShadingType,
      WidthType,
      ["Metric", "Value"],
      rows,
      { valueStyles: summaryItems }
    ),
  ];
}

function createInputsTable(Table, TableRow, TableCell, Paragraph, TextRun, BorderStyle, ShadingType, WidthType, rows) {
  return [
    createSectionHeading(Paragraph, TextRun, "Input Parameters"),
    createWordTable(
      Table,
      TableRow,
      TableCell,
      Paragraph,
      TextRun,
      BorderStyle,
      ShadingType,
      WidthType,
      ["Parameter", "Value", "Units"],
      rows
    ),
  ];
}

function createResultsTable(Table, TableRow, TableCell, Paragraph, TextRun, BorderStyle, ShadingType, WidthType, rows) {
  return [
    createSectionHeading(Paragraph, TextRun, "Results and Checks"),
    createWordTable(
      Table,
      TableRow,
      TableCell,
      Paragraph,
      TextRun,
      BorderStyle,
      ShadingType,
      WidthType,
      ["Result", "Value", "Units"],
      rows
    ),
  ];
}

function createCalculationSection(Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, ShadingType, WidthType, reportData) {
  const children = [
    createSectionHeading(Paragraph, TextRun, "Calculation Methodology"),
    ...createBulletParagraphs(Paragraph, TextRun, reportData.methodologyItems),
    createSectionHeading(Paragraph, TextRun, "Governing Equations"),
    ...((reportData.equationRows || []).map((row) => createEquationParagraph(Paragraph, TextRun, row[0], row[1], row[2]))),
    createSectionHeading(Paragraph, TextRun, "Intermediate Calculations"),
    createWordTable(
      Table,
      TableRow,
      TableCell,
      Paragraph,
      TextRun,
      BorderStyle,
      ShadingType,
      WidthType,
      ["Calculation", "Value", "Units"],
      reportData.intermediateRows
    ),
  ];

  return children;
}

function createEquationParagraph(Paragraph, TextRun, title, expression, purpose) {
  return new Paragraph({
    style: "BodyCompact",
    spacing: { after: 100 },
    children: [
      new TextRun({ text: `${title}: `, bold: true }),
      new TextRun({ text: expression || "Not available" }),
      new TextRun({ text: purpose ? `  (${purpose})` : "", italics: true, color: "4B5563" }),
    ],
  });
}

function createAssumptionsSection(Paragraph, TextRun, assumptions, disclaimer) {
  const children = [
    createSectionHeading(Paragraph, TextRun, "Assumptions and Notes"),
    ...createBulletParagraphs(Paragraph, TextRun, assumptions),
  ];

  if (disclaimer) {
    children.push(createSectionHeading(Paragraph, TextRun, "Disclaimer"));
    children.push(new Paragraph({
      style: "BodyCompact",
      children: [new TextRun({ text: disclaimer, color: "6B7280" })],
    }));
  }

  return children;
}

function createSectionHeading(Paragraph, TextRun, text) {
  return new Paragraph({
    style: "ReportHeading",
    heading: window.docx.HeadingLevel.HEADING_2,
    children: [new TextRun({ text, bold: true })],
  });
}

function createBulletParagraphs(Paragraph, TextRun, items) {
  if (!items?.length) {
    return [
      new Paragraph({
        style: "BodyCompact",
        children: [new TextRun({ text: "No additional notes were available for this section.", color: "6B7280" })],
      }),
    ];
  }

  return items.map((item) => new Paragraph({
    style: "BodyCompact",
    children: [
      new TextRun({ text: "• ", bold: true }),
      new TextRun({ text: item }),
    ],
  }));
}

function createWordTable(Table, TableRow, TableCell, Paragraph, TextRun, BorderStyle, ShadingType, WidthType, headers, rows, options = {}) {
  const border = { style: BorderStyle.SINGLE, size: 1, color: "D9DEE3" };
  const tableRows = [
    new TableRow({
      tableHeader: true,
      children: headers.map((header) => new TableCell({
        shading: { fill: "F3F5F7", type: ShadingType.CLEAR, color: "auto" },
        borders: { top: border, right: border, bottom: border, left: border },
        margins: { top: 90, bottom: 90, left: 120, right: 120 },
        children: [
          new Paragraph({
            children: [new TextRun({ text: header, bold: true, size: 18 })],
          }),
        ],
      })),
    }),
  ];

  (rows || []).forEach((row) => {
    tableRows.push(new TableRow({
      children: row.map((cell, index) => new TableCell({
        borders: { top: border, right: border, bottom: border, left: border },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [
          new Paragraph({
            children: [createTableCellRun(TextRun, String(cell ?? ""), index === 0, row, options)],
          }),
        ],
      })),
    }));
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: tableRows,
  });
}

function createTableCellRun(TextRun, value, isLabelCell, row, options) {
  const unitsText = String(row?.[2] ?? "");
  const valueStyle = options.valueStyles?.find((item) => item.value === row?.[1]);
  const color = isLabelCell
    ? "1F2937"
    : valueStyle?.className === "pass" || unitsText === "PASS"
      ? "157347"
      : valueStyle?.className === "fail" || unitsText === "FAIL"
        ? "B02A37"
        : valueStyle?.className === "review"
          ? "9A6700"
          : "222222";

  return new TextRun({
    text: value,
    bold: isLabelCell || unitsText === "PASS" || unitsText === "FAIL",
    color,
    size: 18,
  });
}

async function createDiagramSection(ImageRun, Paragraph, diagramSvgMarkup, visualCaption) {
  const children = [createSectionHeading(Paragraph, window.docx.TextRun, "Section Visualisation and Interaction Diagram")];
  children.push(new Paragraph({
    style: "BodyCompact",
    children: [new window.docx.TextRun({ text: visualCaption || "Current section visualisation and interaction diagram.", color: "4B5563" })],
  }));

  const diagramImage = await createDiagramImage(diagramSvgMarkup);

  if (!diagramImage) {
    children.push(new Paragraph({
      style: "BodyCompact",
      children: [new window.docx.TextRun({ text: "The live visualisation could not be embedded in this report.", color: "B02A37" })],
    }));
    return children;
  }

  children.push(new Paragraph({
    alignment: window.docx.AlignmentType.CENTER,
    spacing: { after: 140 },
    children: [
      new ImageRun({
        data: diagramImage.data,
        transformation: diagramImage.transformation,
        type: diagramImage.type,
      }),
    ],
  }));

  return children;
}

async function createDiagramImage(diagramSvgMarkup) {
  if (!diagramSvgMarkup) {
    return null;
  }

  try {
    const { blob, width, height } = createSvgBlob(diagramSvgMarkup);
    const image = await loadBlobImage(blob);
    const canvas = document.createElement("canvas");
    const maxWidth = 620;
    const scale = Math.min(1, maxWidth / width);
    const targetWidth = Math.max(320, Math.round(width * scale));
    const targetHeight = Math.max(180, Math.round(height * scale));

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      return null;
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const pngBlob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png", 1));
    if (!pngBlob) {
      return null;
    }

    return {
      data: new Uint8Array(await pngBlob.arrayBuffer()),
      transformation: {
        width: targetWidth,
        height: targetHeight,
      },
      type: "png",
    };
  } catch (error) {
    console.warn("RC Column Word report: diagram conversion failed.", error);
    return null;
  }
}

function createSvgBlob(svgMarkup) {
  const parser = new DOMParser();
  const svgDocument = parser.parseFromString(svgMarkup, "image/svg+xml");
  const svgElement = svgDocument.documentElement;
  const viewBox = (svgElement.getAttribute("viewBox") || "0 0 1120 640").split(/\s+/).map(Number);
  const width = Number(svgElement.getAttribute("width")) || viewBox[2] || 1120;
  const height = Number(svgElement.getAttribute("height")) || viewBox[3] || 640;

  svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svgElement.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  svgElement.setAttribute("width", String(width));
  svgElement.setAttribute("height", String(height));
  svgElement.setAttribute("viewBox", viewBox.join(" "));

  if (!svgElement.querySelector("rect[data-export-background='true']")) {
    const background = svgDocument.createElementNS("http://www.w3.org/2000/svg", "rect");
    background.setAttribute("data-export-background", "true");
    background.setAttribute("x", "0");
    background.setAttribute("y", "0");
    background.setAttribute("width", String(width));
    background.setAttribute("height", String(height));
    background.setAttribute("fill", "#ffffff");
    svgElement.insertBefore(background, svgElement.firstChild);
  }

  const serializedSvg = new XMLSerializer().serializeToString(svgElement);
  const blob = new Blob([serializedSvg], { type: "image/svg+xml;charset=utf-8" });
  return { blob, width, height };
}

function loadBlobImage(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = (error) => {
      URL.revokeObjectURL(url);
      reject(error);
    };

    image.src = url;
  });
}

function getWordEquationSet(input) {
  const frameType = input.frameType || "braced";
  const unbracedMethod = input.unbracedMethod || "storey";

  if (input.sectionType === "rectangular") {
    return {
      primary: "Nu = Cc + ΣFsi; Mu = |Cc (D/2 - a/2) + Σ[Fsi (D/2 - yi)]|",
      secondary: "a = γ dn; Cc = α2 f'c b a; εsi = εcu (dn - yi) / dn; fsi = clamp(Es εsi, ±fsy)",
      slenderness: frameType === "braced"
        ? "r = 0.3D; Le = k Lu; δb = max[1, km / (1 - N* / Nc)]; Nc = (π² / Le²) [182 d0 (ϕMc) / (1 + βd)]"
        : unbracedMethod === "storey"
          ? "r = 0.3D; Le = k Lu; δ = max(δb, δs); δs = 1 / [1 - (ΣN* / ΣNc)]"
          : "r = 0.3D; Le = k Lu; δ = max(δb, δs); δs = 1 / [1 - (1 + βd) / (αs λuc)], αs = 0.6",
    };
  }

  return {
    primary: "Nu = Cc + ΣFsi; Mu = |Cc (r - dc) + Σ[Fsi (r - dsi)]|",
    secondary: "bo = 2√(2ar - a²); α = 4 tan⁻¹(2a / bo); A'c = 0.5 r² (α - sin α); Cc = 0.85 f'c A'c",
    slenderness: frameType === "braced"
      ? "r = 0.25D; Le = k Lu; δb = max[1, km / (1 - N* / Nc)]; Nc = (π² / Le²) [182 d0 (ϕMc) / (1 + βd)]"
      : unbracedMethod === "storey"
        ? "r = 0.25D; Le = k Lu; δ = max(δb, δs); δs = 1 / [1 - (ΣN* / ΣNc)]"
        : "r = 0.25D; Le = k Lu; δ = max(δb, δs); δs = 1 / [1 - (1 + βd) / (αs λuc)], αs = 0.6",
  };
}

function formatReportDate(date) {
  return date.toLocaleString("en-AU", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFileTimestamp(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}_${hours}${minutes}`;
}

function formatPdfValue(value, decimals) {
  return Number.isFinite(value) ? value.toFixed(decimals) : "N/A";
}

function getStatusClass(status) {
  if (status === "Safe") {
    return "pass";
  }
  if (status === "Review") {
    return "review";
  }
  return "fail";
}

function saveCurrentResult() {
  if (!state.lastResult) {
    return;
  }

  const input = state.lastResult.input;
  const totalBars = input.sectionType === "rectangular"
    ? input.rect_topBars + input.rect_bottomBars + 2 * input.rect_sideBars
    : input.circle_barCount;
  const barDia = input.sectionType === "rectangular" ? input.rect_barDia : input.circle_barDia;

  const snapshot = {
    timestamp: new Date().toLocaleString(),
    shape: formatTitle(input.sectionType),
    fc: input.fc,
    barDia,
    totalBars,
    Nstar: input.Nstar,
    Mstar: input.Mstar,
    amplifiedMoment: state.lastResult.amplifiedMoment,
    utilisation: state.lastResult.utilisation,
    status: state.lastResult.status,
    classification: state.lastResult.classification,
  };

  state.savedResults.unshift(snapshot);
  state.savedResults = state.savedResults.slice(0, 18);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.savedResults));
  renderSavedResults();
}

function renderSavedResults() {
  if (!state.savedResults.length) {
    elements.tableBody.innerHTML = `<tr class="empty-row"><td colspan="11">No saved results yet.</td></tr>`;
    return;
  }

  elements.tableBody.innerHTML = state.savedResults.map((row) => `
    <tr>
      <td>${escapeXml(row.timestamp)}</td>
      <td>${escapeXml(row.shape)}</td>
      <td>${row.fc.toFixed(0)} MPa</td>
      <td>${row.barDia.toFixed(0)} mm</td>
      <td>${row.totalBars.toFixed(0)}</td>
      <td>${row.Nstar.toFixed(0)} kN</td>
      <td>${row.Mstar.toFixed(1)} kNm</td>
      <td>${row.amplifiedMoment.toFixed(1)} kNm</td>
      <td>${row.utilisation.toFixed(2)}</td>
      <td class="${row.status === "Safe" ? "status-safe" : row.status === "Review" ? "status-warning" : "status-unsafe"}">${escapeXml(row.status)}</td>
      <td>${escapeXml(row.classification)}</td>
    </tr>
  `).join("");
}

function loadSavedResults() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch (error) {
    return [];
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function clampPositive(value) {
  return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
}

function formatTitle(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
