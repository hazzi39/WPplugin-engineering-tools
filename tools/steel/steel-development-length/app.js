(function () {
  "use strict";

  var STORAGE_KEY = "engineering-tools-steel-development-length-premium-results-v1";
  var MIN_DEVELOPMENT_LENGTH_FACTOR = 29;
  var CONCRETE_STRENGTH_CAP = 65;
  var SLIP_FORM_FACTOR = 1.3;
  var K7_DEFAULT = 1.25;
  var K7_REDUCED = 1.0;
  var HOOK_FACTOR = 0.5;
  var MIN_HOOK_EXTENSION = 70;
  var BUNDLE_FACTORS = {
    single: 1,
    bundle3: 1.2,
    bundle4: 1.33
  };
  var FIELD_RULES = {
    "bar-diameter": { label: "Bar diameter", min: 6, max: 80, allowZero: false },
    "yield-strength": { label: "Yield strength", min: 200, max: 1000, allowZero: false },
    "concrete-strength": { label: "Concrete strength", min: 20, max: 100, allowZero: false },
    "cover": { label: "Cover to bar", min: 10, max: 300, allowZero: false },
    "spacing": { label: "Bar spacing", min: 0, max: 500, allowZero: true },
    "area-provided": { label: "Provided steel area", min: 0, max: 100000, allowZero: true },
    "area-required": { label: "Required steel area", min: 0, max: 100000, allowZero: true }
  };

  function getUtils() {
    return window.EngineeringTools && window.EngineeringTools.utils;
  }

  function readStorage() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function writeStorage(results) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(results.slice(0, 15)));
    } catch (error) {
      // Ignore localStorage failures inside embedded calculators.
    }
  }

  function formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function formatDateTime(date) {
    return new Intl.DateTimeFormat("en-AU", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(date);
  }

  function formatFileTimestamp(date) {
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, "0");
    var day = String(date.getDate()).padStart(2, "0");
    var hours = String(date.getHours()).padStart(2, "0");
    var minutes = String(date.getMinutes()).padStart(2, "0");
    return year + "-" + month + "-" + day + "_" + hours + minutes;
  }

  function parseNumber(value) {
    var parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function createEmptyState(diagram) {
    diagram.innerHTML = [
      '<foreignObject x="0" y="0" width="640" height="360">',
      '<div xmlns="http://www.w3.org/1999/xhtml" class="sdl-empty-state">Enter valid inputs to generate the live detailing visualisation.</div>',
      '</foreignObject>'
    ].join("");
  }

  function calculateFactors(inputs) {
    var k1 = inputs.isHorizontal && inputs.hasConcreteBelow ? 1.3 : 1.0;
    var k2 = (132 - inputs.barDiameter) / 100;
    var k3Raw = 1 - (0.15 * (inputs.cover - inputs.barDiameter)) / inputs.barDiameter;
    var k3 = Math.max(0.7, Math.min(1.0, k3Raw));
    var k7 = inputs.areaRequired > 0 && inputs.areaProvided >= 2 * inputs.areaRequired ? K7_REDUCED : K7_DEFAULT;
    return { k1: k1, k2: k2, k3: k3, k7: k7 };
  }

  function calculateHookDetails(inputs, developmentLength) {
    if (inputs.hookType === "none") {
      return null;
    }

    var horizontalLength = HOOK_FACTOR * developmentLength;
    var minExtension = Math.max(4 * inputs.barDiameter, MIN_HOOK_EXTENSION);

    if (inputs.hookType === "90cog") {
      return {
        horizontalLength: horizontalLength,
        minExtension: minExtension,
        totalLength: horizontalLength + minExtension,
        description: "90 deg standard cog",
        note: "Maximum bend diameter = " + (8 * inputs.barDiameter) + " mm."
      };
    }

    return {
      horizontalLength: horizontalLength,
      minExtension: minExtension,
      totalLength: horizontalLength + minExtension,
      description: inputs.hookType + " deg standard hook",
      note: "Use the code-specified internal bend diameter for the selected hook."
    };
  }

  function calculateAll(inputs) {
    var factors = calculateFactors(inputs);
    var effectiveConcreteStrength = Math.min(inputs.concreteStrength, CONCRETE_STRENGTH_CAP);
    var minimumDevelopmentLength = MIN_DEVELOPMENT_LENGTH_FACTOR * factors.k1 * inputs.barDiameter;
    var numerator = 0.5 * factors.k1 * factors.k3 * inputs.yieldStrength * inputs.barDiameter;
    var denominator = factors.k2 * Math.sqrt(effectiveConcreteStrength);
    var developmentLength = Math.max(numerator / denominator, minimumDevelopmentLength);

    if (inputs.isSlipFormed) {
      developmentLength = developmentLength * SLIP_FORM_FACTOR;
    }

    var spacingTerm = inputs.elementType === "narrow" && inputs.spacing > 3 * inputs.barDiameter ? 1.5 * inputs.spacing : 0;
    var lapLength = inputs.elementType === "wide"
      ? Math.max(factors.k7 * developmentLength, minimumDevelopmentLength)
      : Math.max(minimumDevelopmentLength, factors.k7 * developmentLength, developmentLength + spacingTerm);
    var bundleFactor = BUNDLE_FACTORS[inputs.spliceType];
    var finalLength = lapLength * bundleFactor;
    var hook = calculateHookDetails(inputs, developmentLength);
    var reinforcementRatio = inputs.areaRequired > 0 && inputs.areaProvided > 0
      ? inputs.areaProvided / inputs.areaRequired
      : null;

    return {
      developmentLength: developmentLength,
      lapLength: lapLength,
      finalLength: finalLength,
      isBundle: inputs.spliceType !== "single",
      bundleType: inputs.spliceType !== "single" ? inputs.spliceType : null,
      hook: hook,
      isSlipFormed: inputs.isSlipFormed,
      factors: factors,
      intermediates: {
        effectiveConcreteStrength: effectiveConcreteStrength,
        minimumDevelopmentLength: minimumDevelopmentLength,
        spacingTerm: spacingTerm,
        bundleFactor: bundleFactor,
        reinforcementRatio: reinforcementRatio
      }
    };
  }

  function validateInputs(inputs) {
    var errors = {};
    var warnings = [];

    Object.keys(FIELD_RULES).forEach(function (key) {
      var rule = FIELD_RULES[key];
      var value = inputs[key];

      if (value === null) {
        if (!rule.allowZero) {
          errors[key] = rule.label + " is required.";
        } else {
          inputs[key] = 0;
        }
        return;
      }

      if (!rule.allowZero && value === 0) {
        errors[key] = rule.label + " cannot be zero.";
        return;
      }

      if (value < rule.min || value > rule.max) {
        errors[key] = rule.label + " must be between " + rule.min + " and " + rule.max + ".";
      }
    });

    if (inputs.cover !== null && inputs["bar-diameter"] !== null && inputs.cover < inputs["bar-diameter"]) {
      warnings.push("Cover is less than bar diameter, which may not be practical in detailing.");
    }

    if (inputs["area-required"] > 0 && inputs["area-provided"] > 0 && inputs["area-provided"] < inputs["area-required"]) {
      warnings.push("Provided steel area is less than required steel area, so the reduced lap factor will not apply.");
    }

    if (inputs["spacing"] === 0 && inputs["element-type"] === "narrow") {
      warnings.push("Spacing has been entered as zero, so the narrow-element spacing term will not increase lap length.");
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors: errors,
      warnings: warnings
    };
  }

  function SteelDevelopmentLengthTool(root) {
    this.root = root;
    this.utils = getUtils();
    this.savedResults = readStorage();
    this.lastState = null;
    this.fields = {
      barDiameter: root.querySelector('[data-field="bar-diameter"]'),
      yieldStrength: root.querySelector('[data-field="yield-strength"]'),
      concreteStrength: root.querySelector('[data-field="concrete-strength"]'),
      cover: root.querySelector('[data-field="cover"]'),
      spacing: root.querySelector('[data-field="spacing"]'),
      areaProvided: root.querySelector('[data-field="area-provided"]'),
      areaRequired: root.querySelector('[data-field="area-required"]'),
      elementType: root.querySelector('[data-field="element-type"]'),
      spliceType: root.querySelector('[data-field="splice-type"]'),
      hookType: root.querySelector('[data-field="hook-type"]'),
      isHorizontal: root.querySelector('[data-field="is-horizontal"]'),
      hasConcreteBelow: root.querySelector('[data-field="has-concrete-below"]'),
      isSlipFormed: root.querySelector('[data-field="is-slip-formed"]')
    };
    this.diagram = root.querySelector('[data-role="diagram"]');
    this.savedResultsBody = root.querySelector('[data-role="saved-results"]');
    this.secondaryPanel = root.querySelector('[data-panel="secondary-properties"]');
    this.equationsPanel = root.querySelector('[data-panel="equations-panel"]');
    this.secondaryIndicator = root.querySelector('[data-role="secondary-indicator"]');
    this.equationIndicator = root.querySelector('[data-role="equation-indicator"]');
    this.equationPrimary = root.querySelector('[data-role="equation-primary"]');
    this.equationSecondary = root.querySelector('[data-role="equation-secondary"]');
    this.outputs = {
      developmentLength: root.querySelector('[data-output="development-length"]'),
      lapLength: root.querySelector('[data-output="lap-length"]'),
      finalLength: root.querySelector('[data-output="final-length"]'),
      k1: root.querySelector('[data-output="k1"]'),
      k2: root.querySelector('[data-output="k2"]'),
      k3: root.querySelector('[data-output="k3"]'),
      k7: root.querySelector('[data-output="k7"]'),
      effectiveConcrete: root.querySelector('[data-output="effective-concrete"]'),
      minimumLength: root.querySelector('[data-output="minimum-length"]'),
      spacingTerm: root.querySelector('[data-output="spacing-term"]'),
      bundleFactor: root.querySelector('[data-output="bundle-factor"]'),
      reinforcementRatio: root.querySelector('[data-output="reinforcement-ratio"]'),
      hookTypeDisplay: root.querySelector('[data-output="hook-type-display"]'),
      hookHorizontal: root.querySelector('[data-output="hook-horizontal"]'),
      hookExtension: root.querySelector('[data-output="hook-extension"]'),
      hookTotal: root.querySelector('[data-output="hook-total"]'),
      hookNote: root.querySelector('[data-output="hook-note"]'),
      bundleLabel: root.querySelector('[data-output="bundle-label"]'),
      developmentMode: root.querySelector('[data-output="development-mode"]'),
      statusTitle: root.querySelector('[data-output="status-title"]'),
      statusText: root.querySelector('[data-output="status-text"]'),
      summaryCover: root.querySelector('[data-output="summary-cover"]'),
      summaryConcreteCap: root.querySelector('[data-output="summary-concrete-cap"]'),
      summaryLapMode: root.querySelector('[data-output="summary-lap-mode"]')
    };
    this.actions = {
      save: root.querySelector('[data-action="save-result"]'),
      clear: root.querySelector('[data-action="clear-saved"]'),
      exportWordReport: root.querySelector('[data-action="export-word-report"]'),
      toggleSecondary: root.querySelector('[data-action="toggle-secondary-properties"]'),
      toggleEquations: root.querySelector('[data-action="toggle-equations-panel"]')
    };
  }

  SteelDevelopmentLengthTool.prototype.init = function () {
    var self = this;

    Object.keys(this.fields).forEach(function (key) {
      var field = self.fields[key];
      if (!field) {
        return;
      }
      var eventName = field.tagName === "SELECT" || field.type === "checkbox" ? "change" : "input";
      field.addEventListener(eventName, function () {
        self.update();
      });
    });

    this.actions.save.addEventListener("click", function () {
      self.saveCurrentResult();
    });

    this.actions.clear.addEventListener("click", function () {
      self.savedResults = [];
      writeStorage(self.savedResults);
      self.renderSavedResults();
    });

    this.actions.exportWordReport.addEventListener("click", function () {
      self.exportWordReport();
    });

    this.actions.toggleSecondary.addEventListener("click", function () {
      self.togglePanel(self.secondaryPanel, self.secondaryIndicator);
    });

    this.actions.toggleEquations.addEventListener("click", function () {
      self.togglePanel(self.equationsPanel, self.equationIndicator);
    });

    this.renderEquations();
    this.renderSavedResults();
    this.update();
  };

  SteelDevelopmentLengthTool.prototype.togglePanel = function (panel, indicator) {
    var isCollapsed = panel.classList.toggle("is-collapsed");
    indicator.textContent = isCollapsed ? "Show" : "Hide";
    indicator.closest("button").setAttribute("aria-expanded", isCollapsed ? "false" : "true");
  };

  SteelDevelopmentLengthTool.prototype.readInputs = function () {
    return {
      "bar-diameter": parseNumber(this.fields.barDiameter.value),
      "yield-strength": parseNumber(this.fields.yieldStrength.value),
      "concrete-strength": parseNumber(this.fields.concreteStrength.value),
      cover: parseNumber(this.fields.cover.value),
      spacing: parseNumber(this.fields.spacing.value),
      "area-provided": parseNumber(this.fields.areaProvided.value),
      "area-required": parseNumber(this.fields.areaRequired.value),
      "element-type": this.fields.elementType.value,
      "splice-type": this.fields.spliceType.value,
      "hook-type": this.fields.hookType.value,
      "is-horizontal": this.fields.isHorizontal.checked,
      "has-concrete-below": this.fields.hasConcreteBelow.checked,
      "is-slip-formed": this.fields.isSlipFormed.checked
    };
  };

  SteelDevelopmentLengthTool.prototype.normaliseInputs = function (raw) {
    return {
      barDiameter: raw["bar-diameter"] || 0,
      yieldStrength: raw["yield-strength"] || 0,
      concreteStrength: raw["concrete-strength"] || 0,
      cover: raw.cover || 0,
      spacing: raw.spacing || 0,
      areaProvided: raw["area-provided"] || 0,
      areaRequired: raw["area-required"] || 0,
      elementType: raw["element-type"],
      spliceType: raw["splice-type"],
      hookType: raw["hook-type"],
      isHorizontal: raw["is-horizontal"],
      hasConcreteBelow: raw["has-concrete-below"],
      isSlipFormed: raw["is-slip-formed"]
    };
  };

  SteelDevelopmentLengthTool.prototype.updateValidationUI = function (errors) {
    var self = this;
    this.root.querySelectorAll("[data-error-for]").forEach(function (node) {
      var key = node.getAttribute("data-error-for");
      node.textContent = errors[key] || "";
      var field = self.root.querySelector('[data-field="' + key + '"]');
      var shell = field ? field.closest(".sdl-field-control, .sdl-select-control") : null;
      if (shell) {
        shell.classList.toggle("has-error", Boolean(errors[key]));
      }
    });
  };

  SteelDevelopmentLengthTool.prototype.setInvalidState = function (validation) {
    this.lastState = null;
    this.actions.save.disabled = true;
    this.actions.exportWordReport.disabled = true;
    this.outputs.developmentLength.textContent = "--";
    this.outputs.lapLength.textContent = "--";
    this.outputs.finalLength.textContent = "--";
    this.outputs.k1.textContent = "--";
    this.outputs.k2.textContent = "--";
    this.outputs.k3.textContent = "--";
    this.outputs.k7.textContent = "--";
    this.outputs.effectiveConcrete.textContent = "--";
    this.outputs.minimumLength.textContent = "--";
    this.outputs.spacingTerm.textContent = "--";
    this.outputs.bundleFactor.textContent = "--";
    this.outputs.reinforcementRatio.textContent = "--";
    this.outputs.hookTypeDisplay.textContent = "Not active";
    this.outputs.hookHorizontal.textContent = "--";
    this.outputs.hookExtension.textContent = "--";
    this.outputs.hookTotal.textContent = "--";
    this.outputs.hookNote.textContent = "Hook information appears when a hook or cog type is selected.";
    this.outputs.bundleLabel.textContent = "Single bar";
    this.outputs.developmentMode.textContent = "Awaiting valid inputs";
    this.outputs.statusTitle.textContent = "Results are unavailable";
    this.outputs.statusText.textContent = validation.warnings[0] || "Resolve the highlighted inputs to restore the live engineering output.";
    this.outputs.summaryCover.textContent = "--";
    this.outputs.summaryConcreteCap.textContent = "--";
    this.outputs.summaryLapMode.textContent = "--";
    this.renderCompliance(validation.warnings, true);
    createEmptyState(this.diagram);
  };

  SteelDevelopmentLengthTool.prototype.renderCompliance = function (warnings, isInvalid) {
    var items = [];

    if (isInvalid) {
      items.push({
        state: "danger",
        title: "Validation required",
        text: "One or more required inputs are invalid. Results and export are disabled until those issues are resolved."
      });
    } else {
      items.push({
        state: "ok",
        title: "Minimum length check satisfied",
        text: "The displayed design length is checked against the governing 29 × k1 × db minimum requirement."
      });
    }

    warnings.forEach(function (warning) {
      items.push({
        state: "warning",
        title: "Engineering note",
        text: warning
      });
    });

    this.root.querySelector('[data-role="compliance-list"]').innerHTML = items.map(function (item) {
      return [
        '<div class="sdl-compliance-item" data-state="', item.state, '">',
        '<strong>', escapeHtml(item.title), '</strong>',
        '<p>', escapeHtml(item.text), '</p>',
        '</div>'
      ].join("");
    }).join("");
  };

  SteelDevelopmentLengthTool.prototype.update = function () {
    var rawInputs = this.readInputs();
    var validation = validateInputs(rawInputs);
    this.updateValidationUI(validation.errors);

    if (!validation.isValid) {
      this.setInvalidState(validation);
      return;
    }

    var inputs = this.normaliseInputs(rawInputs);
    var results = calculateAll(inputs);

    this.lastState = {
      timestamp: Date.now(),
      inputs: inputs,
      results: results,
      warnings: validation.warnings
    };

    this.actions.save.disabled = false;
    this.actions.exportWordReport.disabled = false;
    this.renderOutputs(inputs, results, validation.warnings);
    this.drawDiagram(inputs, results);
  };

  SteelDevelopmentLengthTool.prototype.renderOutputs = function (inputs, results, warnings) {
    var utils = this.utils;
    this.outputs.developmentLength.textContent = utils.formatNumber(results.developmentLength, 0) + " mm";
    this.outputs.lapLength.textContent = utils.formatNumber(results.lapLength, 0) + " mm";
    this.outputs.finalLength.textContent = utils.formatNumber(results.finalLength, 0) + " mm";
    this.outputs.k1.textContent = utils.formatNumber(results.factors.k1, 2);
    this.outputs.k2.textContent = utils.formatNumber(results.factors.k2, 2);
    this.outputs.k3.textContent = utils.formatNumber(results.factors.k3, 2);
    this.outputs.k7.textContent = utils.formatNumber(results.factors.k7, 2);
    this.outputs.effectiveConcrete.textContent = utils.formatNumber(results.intermediates.effectiveConcreteStrength, 1) + " MPa";
    this.outputs.minimumLength.textContent = utils.formatNumber(results.intermediates.minimumDevelopmentLength, 0) + " mm";
    this.outputs.spacingTerm.textContent = utils.formatNumber(results.intermediates.spacingTerm, 0) + " mm";
    this.outputs.bundleFactor.textContent = utils.formatNumber(results.intermediates.bundleFactor, 2);
    this.outputs.reinforcementRatio.textContent = results.intermediates.reinforcementRatio === null
      ? "Not active"
      : utils.formatNumber(results.intermediates.reinforcementRatio, 2);
    this.outputs.bundleLabel.textContent = inputs.spliceType === "single"
      ? "Single bar"
      : inputs.spliceType === "bundle3"
        ? "3-bar bundle"
        : "4-bar bundle";
    this.outputs.developmentMode.textContent = inputs.hookType === "none" ? "Straight bar development" : "Hook option shown";
    this.outputs.statusTitle.textContent = results.isBundle || results.isSlipFormed ? "Adjustment applied" : "Lengths updated";
    this.outputs.statusText.textContent = "Calculated from the current reinforcement inputs" + (results.isBundle ? ", including bundle adjustment." : ".");
    this.outputs.summaryCover.textContent = utils.formatNumber(inputs.cover, 0) + " mm";
    this.outputs.summaryConcreteCap.textContent = utils.formatNumber(results.intermediates.effectiveConcreteStrength, 1) + " MPa";
    this.outputs.summaryLapMode.textContent = inputs.elementType === "wide" ? "Wide element" : "Narrow element";

    if (results.hook) {
      this.outputs.hookTypeDisplay.textContent = results.hook.description;
      this.outputs.hookHorizontal.textContent = utils.formatNumber(results.hook.horizontalLength, 0) + " mm";
      this.outputs.hookExtension.textContent = utils.formatNumber(results.hook.minExtension, 0) + " mm";
      this.outputs.hookTotal.textContent = utils.formatNumber(results.hook.totalLength, 0) + " mm";
      this.outputs.hookNote.textContent = results.hook.note;
    } else {
      this.outputs.hookTypeDisplay.textContent = "Not active";
      this.outputs.hookHorizontal.textContent = "--";
      this.outputs.hookExtension.textContent = "--";
      this.outputs.hookTotal.textContent = "--";
      this.outputs.hookNote.textContent = "Hook information appears when a hook or cog type is selected.";
    }

    this.renderCompliance(warnings, false);
  };

  SteelDevelopmentLengthTool.prototype.renderEquations = function () {
    var primaryLatex = String.raw`L_{sy.tb}=\frac{0.5\,k_1\,k_3\,f_{sy}\,d_b}{k_2\sqrt{f'_c}}\ge 29k_1d_b`;
    var secondaryLatex = String.raw`L_{sy.t.lap}=\max(k_7L_{sy.tb},29k_1d_b)\ \text{wide},\quad \max(k_7L_{sy.tb},29k_1d_b,L_{sy.tb}+1.5s_b)\ \text{narrow}`;

    if (window.katex) {
      window.katex.render(primaryLatex, this.equationPrimary, { throwOnError: false, displayMode: true });
      window.katex.render(secondaryLatex, this.equationSecondary, { throwOnError: false, displayMode: true });
      return;
    }

    this.equationPrimary.textContent = "Lsy.tb = (0.5 × k1 × k3 × fsy × db) / (k2 × √f'c) ≥ 29 × k1 × db";
    this.equationSecondary.textContent = "Lsy.t.lap = max(k7 × Lsy.tb, 29 × k1 × db) for wide elements, and max(k7 × Lsy.tb, 29 × k1 × db, Lsy.tb + 1.5 × sb) for narrow elements.";
  };

  SteelDevelopmentLengthTool.prototype.drawDiagram = function (inputs, results) {
    var coverScale = Math.min(38, Math.max(14, inputs.cover / 2));
    var barRadius = Math.min(20, Math.max(8, inputs.barDiameter / 1.6));
    var developmentScale = Math.min(260, Math.max(150, results.finalLength / 6));
    var bundleCount = inputs.spliceType === "bundle4" ? 4 : inputs.spliceType === "bundle3" ? 3 : 1;
    var rightAnchorX = 110 + developmentScale;
    var coverY = 70 + coverScale;
    var dbArrowY = 128;
    var hookTopY = 124;
    var hookInnerY = 150;
    var hookBackX = Math.max(rightAnchorX - 38, 164);
    var hookPath = "";

    if (inputs.hookType === "90cog") {
      hookPath = "M " + rightAnchorX + " 176 L " + rightAnchorX + " " + hookTopY;
    } else if (inputs.hookType === "135") {
      hookPath = "M " + rightAnchorX + " 176 L " + rightAnchorX + " " + hookTopY + " L " + hookBackX + " " + hookInnerY;
    } else if (inputs.hookType === "180") {
      hookPath = "M " + rightAnchorX + " 176 L " + rightAnchorX + " " + hookTopY + " C " + rightAnchorX + " 106 " + (rightAnchorX - 12) + " 96 " + (rightAnchorX - 24) + " 96 L " + hookBackX + " 96";
    }

    this.diagram.innerHTML = [
      '<defs>',
      '<marker id="sdl-arrow-head" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">',
      '<path d="M 0 0 L 8 4 L 0 8 z" fill="#2563eb"></path>',
      '</marker>',
      '</defs>',
      '<rect x="0" y="0" width="640" height="360" rx="28" fill="#f9fbfa"></rect>',
      buildGrid(),
      '<rect x="78" y="70" width="470" height="170" rx="18" fill="rgba(244,248,247,0.95)" stroke="rgba(60,94,88,0.24)" stroke-width="1.3"></rect>',
      '<text x="96" y="102" fill="#1d4ed8" font-size="12" font-weight="700">Concrete section</text>',
      '<line x1="102" y1="176" x2="', rightAnchorX, '" y2="176" stroke="#2563eb" stroke-width="5" stroke-linecap="round"></line>',
      buildBars(bundleCount, barRadius),
      hookPath ? '<path d="' + hookPath + '" fill="none" stroke="#2563eb" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path>' : '',
      '<line x1="78" y1="', coverY, '" x2="110" y2="', coverY, '" stroke="#2563eb" stroke-width="1.6"></line>',
      '<line x1="110" y1="', coverY, '" x2="110" y2="176" stroke="#2563eb" stroke-width="1.6"></line>',
      '<line x1="78" y1="176" x2="110" y2="176" stroke="#2563eb" stroke-width="1.6"></line>',
      '<text x="42" y="', coverY - 10, '" fill="#17312d" font-size="13">cd = ', escapeHtml(String(inputs.cover)), ' mm</text>',
      '<line x1="110" y1="274" x2="', rightAnchorX, '" y2="274" stroke="#2563eb" stroke-width="1.6" marker-start="url(#sdl-arrow-head)" marker-end="url(#sdl-arrow-head)"></line>',
      '<text x="188" y="258" fill="#17312d" font-size="13">Required length = ', Math.round(results.finalLength), ' mm</text>',
      '<line x1="110" y1="310" x2="110" y2="56" stroke="rgba(37,99,235,0.32)" stroke-width="1.6" stroke-dasharray="4 6"></line>',
      '<line x1="110" y1="176" x2="576" y2="176" stroke="rgba(37,99,235,0.32)" stroke-width="1.6" stroke-dasharray="4 6"></line>',
      '<text x="116" y="62" fill="#1d4ed8" font-size="12" font-weight="700">y</text>',
      '<text x="580" y="172" fill="#1d4ed8" font-size="12" font-weight="700">x</text>',
      '<line x1="110" y1="', dbArrowY, '" x2="', 110 + barRadius * 2, '" y2="', dbArrowY, '" stroke="#2563eb" stroke-width="1.6" marker-start="url(#sdl-arrow-head)" marker-end="url(#sdl-arrow-head)"></line>',
      '<text x="120" y="', dbArrowY - 12, '" fill="#17312d" font-size="13">db = ', escapeHtml(String(inputs.barDiameter)), ' mm</text>',
      inputs.elementType === "narrow"
        ? '<line x1="190" y1="204" x2="248" y2="204" stroke="#2563eb" stroke-width="1.6" stroke-dasharray="6 6"></line><text x="192" y="222" fill="#17312d" font-size="13">sb = ' + escapeHtml(String(inputs.spacing)) + ' mm</text>'
        : '',
      inputs.hookType !== "none" && results.hook
        ? '<text x="344" y="118" fill="#1d4ed8" font-size="13">Hook extension = ' + Math.round(results.hook.minExtension) + ' mm</text>'
        : '',
      '<text x="344" y="94" fill="#17312d" font-size="13">Lsy.tb = ', Math.round(results.developmentLength), ' mm</text>',
      '<text x="344" y="226" fill="#17312d" font-size="13">Lsy.t.lap = ', Math.round(results.lapLength), ' mm</text>'
    ].join("");
  };

  SteelDevelopmentLengthTool.prototype.saveCurrentResult = function () {
    if (!this.lastState) {
      return;
    }

    this.savedResults.unshift({
      timestamp: this.lastState.timestamp,
      inputs: this.lastState.inputs,
      results: this.lastState.results
    });
    writeStorage(this.savedResults);
    this.savedResults = readStorage();
    this.renderSavedResults();
  };

  SteelDevelopmentLengthTool.prototype.renderSavedResults = function () {
    var utils = this.utils;
    if (!this.savedResults.length) {
      this.savedResultsBody.innerHTML = '<tr><td class="sdl-empty-row" colspan="10">No saved scenarios yet.</td></tr>';
      return;
    }

    this.savedResultsBody.innerHTML = this.savedResults.map(function (entry) {
      return [
        "<tr>",
        "<td>", escapeHtml(formatTimestamp(entry.timestamp)), "</td>",
        "<td>", utils.formatNumber(entry.inputs.barDiameter, 0), " mm</td>",
        "<td>", utils.formatNumber(entry.inputs.yieldStrength, 0), " MPa</td>",
        "<td>", utils.formatNumber(entry.inputs.concreteStrength, 0), " MPa</td>",
        "<td>", utils.formatNumber(entry.inputs.cover, 0), " mm</td>",
        "<td>", entry.inputs.elementType === "wide" ? "Wide" : "Narrow", "</td>",
        "<td>", entry.inputs.spliceType === "single" ? "Single" : entry.inputs.spliceType === "bundle3" ? "3-bar" : "4-bar", "</td>",
        "<td>", utils.formatNumber(entry.results.developmentLength, 0), " mm</td>",
        "<td>", utils.formatNumber(entry.results.lapLength, 0), " mm</td>",
        '<td class="sdl-table-emphasis">', utils.formatNumber(entry.results.finalLength, 0), " mm</td>",
        "</tr>"
      ].join("");
    }).join("");
  };

  SteelDevelopmentLengthTool.prototype.buildCalculationReportData = async function () {
    var state = this.lastState;
    if (!state) {
      throw new Error("No valid calculation state is available for export.");
    }

    var figure = await createVisualisationSection(this.root);
    var generatedAt = new Date();
    var reinforcementRatio = state.results.intermediates.reinforcementRatio === null
      ? "Not activated"
      : this.utils.formatNumber(state.results.intermediates.reinforcementRatio, 2);

    return {
      metadata: {
        title: "Steel Development Length Engineering Calculation Sheet",
        subtitle: "Native WordPress calculator export",
        toolSlug: "steel-development-length",
        company: this.root.dataset.reportCompany || "Not specified",
        project: this.root.dataset.reportProject || "Not specified",
        preparedBy: this.root.dataset.reportPreparedBy || "Not specified",
        disclaimer: this.root.dataset.reportDisclaimer || "",
        generatedAt: formatDateTime(generatedAt)
      },
      summaryItems: [
        { label: "Final required length", value: Math.round(state.results.finalLength) + " mm", className: "pass" },
        { label: "Basic development length", value: Math.round(state.results.developmentLength) + " mm" },
        { label: "Lap splice length", value: Math.round(state.results.lapLength) + " mm" },
        { label: "Element type", value: state.inputs.elementType === "wide" ? "Wide element" : "Narrow element" }
      ],
      inputRows: [
        ["Bar diameter, db", String(state.inputs.barDiameter), "mm"],
        ["Yield strength, fsy", String(state.inputs.yieldStrength), "MPa"],
        ["Concrete strength, f'c", String(state.inputs.concreteStrength), "MPa"],
        ["Cover to bar, cd", String(state.inputs.cover), "mm"],
        ["Bar spacing, sb", String(state.inputs.spacing), "mm"],
        ["Provided steel area, As,prov", String(state.inputs.areaProvided), "mm2"],
        ["Required steel area, As,req", String(state.inputs.areaRequired), "mm2"],
        ["Element type", state.inputs.elementType === "wide" ? "Wide" : "Narrow", "-"],
        ["Splice type", state.inputs.spliceType, "-"],
        ["Hook type", state.inputs.hookType === "none" ? "None" : state.inputs.hookType + " deg", "-"],
        ["Horizontal reinforcement", state.inputs.isHorizontal ? "Yes" : "No", "-"],
        ["Concrete below > 300 mm", state.inputs.hasConcreteBelow ? "Yes" : "No", "-"],
        ["Slip-formed construction", state.inputs.isSlipFormed ? "Yes" : "No", "-"]
      ],
      finalRows: [
        ["Basic development length, Lsy.tb", String(Math.round(state.results.developmentLength)), "mm"],
        ["Lap splice length, Lsy.t.lap", String(Math.round(state.results.lapLength)), "mm"],
        ["Final required length, Lreq", String(Math.round(state.results.finalLength)), "PASS"],
        ["Hook total length", state.results.hook ? String(Math.round(state.results.hook.totalLength)) : "Not applicable", state.results.hook ? "mm" : "-"]
      ],
      intermediateRows: [
        ["k1 bar position factor", this.utils.formatNumber(state.results.factors.k1, 2), "-"],
        ["k2 bar size factor", this.utils.formatNumber(state.results.factors.k2, 2), "-"],
        ["k3 cover factor", this.utils.formatNumber(state.results.factors.k3, 2), "-"],
        ["k7 lap factor", this.utils.formatNumber(state.results.factors.k7, 2), "-"],
        ["Effective concrete strength", this.utils.formatNumber(state.results.intermediates.effectiveConcreteStrength, 1), "MPa"],
        ["Minimum code length", this.utils.formatNumber(state.results.intermediates.minimumDevelopmentLength, 0), "mm"],
        ["Spacing term", this.utils.formatNumber(state.results.intermediates.spacingTerm, 0), "mm"],
        ["Bundle factor", this.utils.formatNumber(state.results.intermediates.bundleFactor, 2), "-"],
        ["As,prov / As,req", reinforcementRatio, "-"]
      ],
      equationRows: [
        ["Development length", "Lsy.tb = (0.5 × k1 × k3 × fsy × db) / (k2 × √f'c) ≥ 29 × k1 × db", "basic reinforcement development length"],
        ["Wide element lap", "Lsy.t.lap = max(k7 × Lsy.tb, 29 × k1 × db)", "wide-element lap splice check"],
        ["Narrow element lap", "Lsy.t.lap = max(k7 × Lsy.tb, 29 × k1 × db, Lsy.tb + 1.5 × sb)", "narrow-element lap splice check"],
        ["Engineering notation", "ϕMu ≤ ϕMn; Σ checks satisfy Lreq ≥ 29 × k1 × db", "readable engineering notation for report issue"]
      ],
      methodologyItems: [
        "Validate all required numeric inputs before calculations are updated or exported.",
        "Calculate k-factors from bar position, bar diameter, concrete cover, and reinforcement ratio inputs.",
        "Compute the basic development length and enforce the minimum 29 × k1 × db requirement.",
        "Apply wide- or narrow-element lap logic, including the spacing term where sb exceeds 3db.",
        "Apply bundle and hook adjustments where selected, then assemble the Word report from structured calculation data."
      ],
      assumptions: [
        "The concrete strength used in the development length equation is capped at 65 MPa.",
        "The k3 cover factor is limited to the range 0.7 to 1.0.",
        "The reduced lap factor k7 = 1.0 is used only when As,prov ≥ 2 × As,req.",
        "Spacing contributes to lap length only for narrow elements when sb > 3db.",
        "The exported visualisation reflects the current validated state of the calculator at the time of report generation."
      ],
      diagramImage: figure,
      visualCaption: figure ? figure.caption : "Current live development length visualisation"
    };
  };

  SteelDevelopmentLengthTool.prototype.exportWordReport = async function () {
    if (!this.lastState) {
      return;
    }

    if (!window.docx) {
      window.alert("The Word export library is not available on this page.");
      return;
    }

    try {
      this.actions.exportWordReport.disabled = true;
      this.actions.exportWordReport.textContent = "Preparing Report...";
      var reportData = await this.buildCalculationReportData();
      var reportDocument = await buildWordReportDocument(reportData);
      var blob = await window.docx.Packer.toBlob(reportDocument);
      triggerDownload(blob, reportData.metadata.toolSlug + "_" + formatFileTimestamp(new Date()) + ".docx");
    } catch (error) {
      window.console.error("Steel development length Word export failed.", error);
      window.alert("The Word report could not be generated. Please review the browser console for details.");
    } finally {
      this.actions.exportWordReport.disabled = false;
      this.actions.exportWordReport.textContent = "Export Word Report";
    }
  };

  function buildGrid() {
    var parts = [];
    for (var i = 0; i < 13; i += 1) {
      var position = i * 32;
      parts.push('<line x1="' + (position * 2) + '" y1="0" x2="' + (position * 2) + '" y2="360" stroke="rgba(37,99,235,0.08)" stroke-width="1"></line>');
      parts.push('<line x1="0" y1="' + position + '" x2="640" y2="' + position + '" stroke="rgba(37,99,235,0.08)" stroke-width="1"></line>');
    }
    return parts.join("");
  }

  function buildBars(bundleCount, barRadius) {
    var bars = [];
    for (var i = 0; i < bundleCount; i += 1) {
      bars.push(
        '<circle cx="' + (110 + i * (barRadius * 2.15)) + '" cy="176" r="' + barRadius + '" fill="rgba(37,99,235,0.16)" stroke="#2563eb" stroke-width="2.5"></circle>'
      );
    }
    return bars.join("");
  }

  async function createVisualisationSection(root) {
    var container = root.querySelector('[data-export-visualization="true"]');
    if (!container) {
      return null;
    }

    var svg = container.querySelector("svg");
    if (svg) {
      return extractSvgAsPng(svg, container.dataset.exportCaption || svg.dataset.exportCaption || svg.getAttribute("aria-label"));
    }

    var canvas = container.querySelector("canvas");
    if (canvas) {
      return extractCanvasAsPng(canvas, container.dataset.exportCaption || "Engineering visualisation");
    }

    return null;
  }

  async function extractSvgAsPng(svg, caption) {
    var clonedSvg = cloneSvgWithComputedStyles(svg);
    var bounds = svg.getBoundingClientRect();
    var width = Math.max(bounds.width, Number(svg.getAttribute("width")) || 640);
    var height = Math.max(bounds.height, Number(svg.getAttribute("height")) || 360);
    var scale = 2;

    clonedSvg.setAttribute("width", String(width));
    clonedSvg.setAttribute("height", String(height));
    if (!clonedSvg.getAttribute("xmlns")) {
      clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    }

    var serialized = new XMLSerializer().serializeToString(clonedSvg);
    var dataUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(serialized);
    var image = await loadImage(dataUrl);
    var canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    var context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Unable to create SVG export canvas.");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.scale(scale, scale);
    context.drawImage(image, 0, 0, width, height);

    return {
      caption: caption || "Development length detailing visualisation",
      dataUrl: canvas.toDataURL("image/png"),
      width: width,
      height: height
    };
  }

  async function extractCanvasAsPng(canvasElement, caption) {
    return {
      caption: caption || "Engineering visualisation",
      dataUrl: canvasElement.toDataURL("image/png"),
      width: canvasElement.width,
      height: canvasElement.height
    };
  }

  function cloneSvgWithComputedStyles(svg) {
    var clone = svg.cloneNode(true);
    var sourceElements = [svg].concat(Array.prototype.slice.call(svg.querySelectorAll("*")));
    var targetElements = [clone].concat(Array.prototype.slice.call(clone.querySelectorAll("*")));

    sourceElements.forEach(function (sourceElement, index) {
      var targetElement = targetElements[index];
      if (!targetElement) {
        return;
      }

      var computedStyle = window.getComputedStyle(sourceElement);
      var styleText = Array.prototype.slice.call(computedStyle).map(function (propertyName) {
        return propertyName + ":" + computedStyle.getPropertyValue(propertyName) + ";";
      }).join("");

      targetElement.setAttribute("style", styleText);
    });

    return clone;
  }

  function loadImage(url) {
    return new Promise(function (resolve, reject) {
      var image = new Image();
      image.onload = function () { resolve(image); };
      image.onerror = function () { reject(new Error("Unable to load image for report export.")); };
      image.src = url;
    });
  }

  async function addImageToDoc(ImageRun, Paragraph, figure, figureIndex) {
    var imageData = await dataUrlToUint8Array(figure.dataUrl);
    var imageWidth = Math.min(520, figure.width);
    var imageHeight = Math.round(imageWidth * (figure.height / figure.width));

    return [
      new Paragraph({
        alignment: window.docx.AlignmentType.CENTER,
        spacing: { before: 80, after: 60 },
        children: [
          new ImageRun({
            data: imageData,
            transformation: {
              width: imageWidth,
              height: imageHeight
            }
          })
        ]
      }),
      new Paragraph({
        alignment: window.docx.AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new window.docx.TextRun({
            text: "Figure " + figureIndex + " – " + figure.caption,
            italics: true,
            size: 20,
            color: "475569"
          })
        ]
      })
    ];
  }

  async function dataUrlToUint8Array(dataUrl) {
    var response = await fetch(dataUrl);
    var buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  }

  function createMetadataSection(Table, TableRow, TableCell, Paragraph, TextRun, BorderStyle, ShadingType, WidthType, metadata) {
    return [
      createSectionHeading(Paragraph, TextRun, "Project Metadata"),
      createWordTable(Table, TableRow, TableCell, Paragraph, TextRun, BorderStyle, ShadingType, WidthType, ["Field", "Value"], [
        ["Company", metadata.company || "Not specified"],
        ["Project", metadata.project || "Not specified"],
        ["Prepared By", metadata.preparedBy || "Not specified"],
        ["Generated", metadata.generatedAt || formatDateTime(new Date())]
      ])
    ];
  }

  function createInputsTable(Table, TableRow, TableCell, Paragraph, TextRun, BorderStyle, ShadingType, WidthType, rows) {
    return [
      createSectionHeading(Paragraph, TextRun, "Input Parameters"),
      createWordTable(Table, TableRow, TableCell, Paragraph, TextRun, BorderStyle, ShadingType, WidthType, ["Parameter", "Value", "Units"], rows)
    ];
  }

  function createResultsTable(Table, TableRow, TableCell, Paragraph, TextRun, BorderStyle, ShadingType, WidthType, rows) {
    return [
      createSectionHeading(Paragraph, TextRun, "Results and Checks"),
      createWordTable(Table, TableRow, TableCell, Paragraph, TextRun, BorderStyle, ShadingType, WidthType, ["Result", "Value", "Units"], rows)
    ];
  }

  function createCalculationSection(Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, ShadingType, WidthType, reportData) {
    return [
      createSectionHeading(Paragraph, TextRun, "Calculation Methodology"),
      createBulletParagraphs(Paragraph, TextRun, reportData.methodologyItems),
      createSectionHeading(Paragraph, TextRun, "Governing Equations"),
      reportData.equationRows.map(function (row) {
        return createEquationParagraph(Paragraph, TextRun, row[0], row[1], row[2]);
      }),
      createSectionHeading(Paragraph, TextRun, "Intermediate Calculations"),
      createWordTable(Table, TableRow, TableCell, Paragraph, TextRun, BorderStyle, ShadingType, WidthType, ["Calculation", "Value", "Units"], reportData.intermediateRows)
    ].flat();
  }

  function createEquationParagraph(Paragraph, TextRun, title, expression, purpose) {
    return new Paragraph({
      style: "BodyCompact",
      spacing: { after: 100 },
      children: [
        new TextRun({ text: title + ": ", bold: true }),
        new TextRun({ text: expression || "Not available" }),
        new TextRun({ text: purpose ? "  (" + purpose + ")" : "", italics: true, color: "4B5563" })
      ]
    });
  }

  async function createVisualisationSectionDoc(ImageRun, Paragraph, figure, caption) {
    var children = [createSectionHeading(Paragraph, window.docx.TextRun, "Visualisation Section")];
    children.push(new Paragraph({
      style: "BodyCompact",
      children: [new window.docx.TextRun({ text: caption || "Current live development length visualisation.", color: "4B5563" })]
    }));

    if (!figure) {
      children.push(new Paragraph({
        style: "BodyCompact",
        children: [new window.docx.TextRun({ text: "The live visualisation could not be embedded in this report.", color: "B02A37" })]
      }));
      return children;
    }

    var imageParagraphs = await addImageToDoc(ImageRun, Paragraph, figure, 1);
    return children.concat(imageParagraphs);
  }

  function createAssumptionsSection(Paragraph, TextRun, assumptions, disclaimer) {
    var children = [
      createSectionHeading(Paragraph, TextRun, "Assumptions and Notes")
    ].concat(createBulletParagraphs(Paragraph, TextRun, assumptions));

    if (disclaimer) {
      children.push(createSectionHeading(Paragraph, TextRun, "Disclaimer"));
      children.push(new Paragraph({
        style: "BodyCompact",
        children: [new TextRun({ text: disclaimer, color: "6B7280" })]
      }));
    }

    return children;
  }

  async function buildWordReportDocument(reportData) {
    var docx = window.docx;
    var AlignmentType = docx.AlignmentType;
    var BorderStyle = docx.BorderStyle;
    var Document = docx.Document;
    var Footer = docx.Footer;
    var ImageRun = docx.ImageRun;
    var PageNumber = docx.PageNumber;
    var Paragraph = docx.Paragraph;
    var ShadingType = docx.ShadingType;
    var Table = docx.Table;
    var TableCell = docx.TableCell;
    var TableRow = docx.TableRow;
    var TextRun = docx.TextRun;
    var WidthType = docx.WidthType;

    var visualisationSection = await createVisualisationSectionDoc(ImageRun, Paragraph, reportData.diagramImage, reportData.visualCaption);
    var footer = new Footer({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Page ", size: 16, color: "6B7280" }),
            PageNumber.CURRENT,
            new TextRun({ text: " of ", size: 16, color: "6B7280" }),
            PageNumber.TOTAL_PAGES
          ]
        })
      ]
    });

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
            paragraph: { spacing: { after: 120 } }
          },
          {
            id: "ReportHeading",
            name: "Report Heading",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: { bold: true, size: 24, color: "1F2937" },
            paragraph: { spacing: { before: 180, after: 80 }, keepNext: true }
          },
          {
            id: "BodyCompact",
            name: "Body Compact",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: { size: 18, color: "222222" },
            paragraph: { spacing: { after: 60 } }
          }
        ]
      },
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720,
                right: 720,
                bottom: 720,
                left: 720
              }
            }
          },
          footers: { default: footer },
          children: [
            createReportTitleParagraph(Paragraph, TextRun, reportData.metadata),
            createReportSubtitleParagraph(Paragraph, TextRun, reportData.metadata),
            createMetadataSection(Table, TableRow, TableCell, Paragraph, TextRun, BorderStyle, ShadingType, WidthType, reportData.metadata),
            createSummarySection(Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, ShadingType, WidthType, reportData.summaryItems),
            createInputsTable(Table, TableRow, TableCell, Paragraph, TextRun, BorderStyle, ShadingType, WidthType, reportData.inputRows),
            createResultsTable(Table, TableRow, TableCell, Paragraph, TextRun, BorderStyle, ShadingType, WidthType, reportData.finalRows),
            visualisationSection,
            createCalculationSection(Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, ShadingType, WidthType, reportData),
            createAssumptionsSection(Paragraph, TextRun, reportData.assumptions, reportData.metadata.disclaimer)
          ].flat()
        }
      ]
    });
  }

  function createReportTitleParagraph(Paragraph, TextRun, metadata) {
    return new Paragraph({
      style: "ReportTitle",
      children: [new TextRun({ text: metadata.title || "Engineering Calculation Report", bold: true })]
    });
  }

  function createReportSubtitleParagraph(Paragraph, TextRun, metadata) {
    return new Paragraph({
      style: "BodyCompact",
      children: [new TextRun({ text: metadata.subtitle || "", italics: true, color: "4B5563" })]
    });
  }

  function createSummarySection(Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, ShadingType, WidthType, summaryItems) {
    return [
      createSectionHeading(Paragraph, TextRun, "Design Summary"),
      createWordTable(Table, TableRow, TableCell, Paragraph, TextRun, BorderStyle, ShadingType, WidthType, ["Metric", "Value"], summaryItems.map(function (item) {
        return [item.label, item.value];
      }), { valueStyles: summaryItems })
    ];
  }

  function createSectionHeading(Paragraph, TextRun, text) {
    return new Paragraph({
      style: "ReportHeading",
      heading: window.docx.HeadingLevel.HEADING_2,
      children: [new TextRun({ text: text, bold: true })]
    });
  }

  function createBulletParagraphs(Paragraph, TextRun, items) {
    if (!items || !items.length) {
      return [new Paragraph({
        style: "BodyCompact",
        children: [new TextRun({ text: "No additional notes were available for this section.", color: "6B7280" })]
      })];
    }

    return items.map(function (item) {
      return new Paragraph({
        style: "BodyCompact",
        children: [
          new TextRun({ text: "• ", bold: true }),
          new TextRun({ text: item })
        ]
      });
    });
  }

  function createWordTable(Table, TableRow, TableCell, Paragraph, TextRun, BorderStyle, ShadingType, WidthType, headers, rows, options) {
    var border = { style: BorderStyle.SINGLE, size: 1, color: "D9DEE3" };
    var tableRows = [
      new TableRow({
        tableHeader: true,
        children: headers.map(function (header) {
          return new TableCell({
            shading: { fill: "F3F5F7", type: ShadingType.CLEAR, color: "auto" },
            borders: { top: border, right: border, bottom: border, left: border },
            margins: { top: 90, bottom: 90, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: header, bold: true, size: 18 })] })]
          });
        })
      })
    ];

    (rows || []).forEach(function (row) {
      tableRows.push(new TableRow({
        children: row.map(function (cell, index) {
          return new TableCell({
            borders: { top: border, right: border, bottom: border, left: border },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ children: [createTableCellRun(TextRun, String(cell || ""), index === 0, row, options || {})] })]
          });
        })
      }));
    });

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: tableRows
    });
  }

  function createTableCellRun(TextRun, value, isLabelCell, row, options) {
    var unitsText = String(row && row[2] || "");
    var valueStyle = options.valueStyles && options.valueStyles.find(function (item) {
      return item.value === row[1];
    });
    var color = isLabelCell
      ? "1F2937"
      : valueStyle && valueStyle.className === "pass" || unitsText === "PASS"
        ? "157347"
        : valueStyle && valueStyle.className === "fail" || unitsText === "FAIL"
          ? "B02A37"
          : valueStyle && valueStyle.className === "review"
            ? "9A6700"
            : "222222";

    return new TextRun({
      text: value,
      bold: isLabelCell || unitsText === "PASS" || unitsText === "FAIL",
      color: color,
      size: 18
    });
  }

  function triggerDownload(blob, filename) {
    var url = window.URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () {
      window.URL.revokeObjectURL(url);
    }, 1000);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function boot() {
    document.querySelectorAll('.et-tool[data-tool-slug="steel-development-length"]').forEach(function (root) {
      if (root.dataset.etPremiumInitialised === "true") {
        return;
      }
      root.dataset.etPremiumInitialised = "true";
      new SteelDevelopmentLengthTool(root).init();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  document.addEventListener("engineering-tools:ready", boot);
}());
