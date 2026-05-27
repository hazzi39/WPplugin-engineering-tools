(function () {
  "use strict";

  var TOOL_SLUG = "punching-shear-design";
  var STORAGE_PREFIX = "engineering-tools-punching-shear-design-v1";
  var FIELD_RULES = {
    "phi": { label: "Strength reduction factor", min: 0.4, max: 1.0 },
    "kdg": { label: "Aggregate size factor", min: 0, max: 40, allowZero: true },
    "slab-thickness": { label: "Slab thickness", min: 100, max: 3000 },
    "effective-depth": { label: "Effective depth", min: 60, max: 2500 },
    "mean-effective-depth": { label: "Mean effective depth", min: 60, max: 2500, optional: true },
    "shear-depth": { label: "Effective shear depth", min: 60, max: 2500, optional: true },
    "support-x": { label: "Support dimension X", min: 50, max: 5000, optional: true },
    "support-y": { label: "Support dimension Y", min: 50, max: 5000, optional: true },
    "support-diameter": { label: "Support diameter", min: 50, max: 5000, optional: true },
    "design-shear": { label: "Design shear", min: 1, max: 100000 },
    "moment-x": { label: "Moment about x-axis", min: -500000, max: 500000, allowZero: true },
    "moment-y": { label: "Moment about y-axis", min: -500000, max: 500000, allowZero: true },
    "flexure-moment-x": { label: "Flexural moment Mfx*", min: -500000, max: 500000, allowZero: true, optional: true },
    "flexure-moment-y": { label: "Flexural moment Mfy*", min: -500000, max: 500000, allowZero: true, optional: true },
    "concrete-strength": { label: "Concrete strength", min: 15, max: 100 },
    "prestress": { label: "Prestress", min: 0, max: 20, allowZero: true },
    "shear-reinforcement-yield": { label: "Shear reinforcement yield strength", min: 200, max: 1200 },
    "asv": { label: "Shear reinforcement area", min: 1, max: 100000, optional: true },
    "spacing-radial": { label: "Radial spacing", min: 20, max: 3000, optional: true },
    "spacing-transverse": { label: "Transverse spacing", min: 20, max: 6000, optional: true },
    "first-fitment-distance": { label: "First fitment distance", min: 10, max: 3000, optional: true },
    "reinforcement-extent": { label: "Reinforcement extent", min: 0, max: 5000, allowZero: true, optional: true }
  };

  function getUtils() {
    return window.EngineeringTools && window.EngineeringTools.utils ? window.EngineeringTools.utils : null;
  }

  function parseNumber(value) {
    var trimmed = String(value === undefined || value === null ? "" : value).trim();
    if (trimmed === "") {
      return null;
    }

    var parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function uniqueId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }

    return "et-psd-" + Date.now() + "-" + Math.floor(Math.random() * 100000);
  }

  function formatNumber(value, decimals) {
    var utils = getUtils();
    if (utils && typeof utils.formatNumber === "function") {
      return utils.formatNumber(value, decimals);
    }

    return new Intl.NumberFormat("en-AU", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  }

  function formatForceKilonewtons(valueNewtons, decimals) {
    return formatNumber(valueNewtons / 1000, decimals || 1) + " kN";
  }

  function formatMomentKilonewtonMeters(valueNmm, decimals) {
    return formatNumber(valueNmm / 1000000, decimals || 1) + " kNm";
  }

  function formatDateTime(value) {
    return new Date(value).toLocaleString("en-AU", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function createEmptyDiagramMarkup() {
    return [
      '<rect x="0" y="0" width="540" height="420" fill="#f8fbff"></rect>',
      '<g stroke="rgba(37,99,235,0.07)" stroke-width="1">',
      buildGridLines(540, 420, 24),
      '</g>',
      '<text x="270" y="205" text-anchor="middle" class="et-psd__diagram-empty">Awaiting valid inputs</text>',
      '<text x="270" y="228" text-anchor="middle" class="et-psd__diagram-empty">Complete the geometry and action fields to draw the critical perimeter.</text>'
    ].join("");
  }

  function buildGridLines(width, height, spacing) {
    var lines = [];
    var x;
    var y;

    for (x = 0; x <= width; x += spacing) {
      lines.push('<line x1="' + x + '" y1="0" x2="' + x + '" y2="' + height + '"></line>');
    }

    for (y = 0; y <= height; y += spacing) {
      lines.push('<line x1="0" y1="' + y + '" x2="' + width + '" y2="' + y + '"></line>');
    }

    return lines.join("");
  }

  function getUtilisationTone(utilisation) {
    if (utilisation <= 0.75) {
      return "pass";
    }

    if (utilisation <= 0.95) {
      return "warn";
    }

    return "fail";
  }

  function getStatusLabel(pass) {
    return pass ? "PASS" : "FAIL";
  }

  function readStorage(key) {
    try {
      var raw = window.localStorage.getItem(key);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value.slice(0, 20)));
    } catch (error) {
      // Ignore storage failures.
    }
  }

  function PunchingShearTool(root, index) {
    this.root = root;
    this.index = index;
    this.storageKey = STORAGE_PREFIX + "::" + window.location.pathname + "::" + index;
    this.savedResults = readStorage(this.storageKey);
    this.lastState = null;
    this.fields = {};
    this.outputs = {};
    this.actions = {};
    this.panels = {};
    this.sections = {};
    this.supportChoices = [];
    this.diagram = null;
    this.savedResultsBody = null;
  }

  PunchingShearTool.prototype.init = function () {
    this.captureNodes();
    this.bindEvents();
    this.renderEquations();
    this.renderSavedResults();
    this.syncSupportType();
    this.syncReinforcementFields();
    this.update();
  };

  PunchingShearTool.prototype.captureNodes = function () {
    var self = this;

    this.root.querySelectorAll("[data-field]").forEach(function (node) {
      self.fields[node.getAttribute("data-field")] = node;
    });

    this.root.querySelectorAll("[data-output]").forEach(function (node) {
      self.outputs[node.getAttribute("data-output")] = node;
    });

    this.root.querySelectorAll("[data-action]").forEach(function (node) {
      self.actions[node.getAttribute("data-action")] = node;
    });

    this.root.querySelectorAll("[data-panel]").forEach(function (node) {
      self.panels[node.getAttribute("data-panel")] = node;
    });

    this.root.querySelectorAll("[data-section]").forEach(function (node) {
      self.sections[node.getAttribute("data-section")] = node;
    });

    this.supportChoices = Array.prototype.slice.call(this.root.querySelectorAll('[data-action="set-support-type"]'));
    this.diagram = this.root.querySelector('[data-role="diagram"]');
    this.savedResultsBody = this.root.querySelector('[data-role="saved-results"]');
  };

  PunchingShearTool.prototype.bindEvents = function () {
    var self = this;

    Object.keys(this.fields).forEach(function (key) {
      var field = self.fields[key];
      var eventName = field.type === "checkbox" || field.tagName === "SELECT" ? "change" : "input";
      field.addEventListener(eventName, function () {
        if (key === "has-shear-reinforcement") {
          self.syncReinforcementFields();
        }

        self.update();
      });
    });

    this.supportChoices.forEach(function (button) {
      button.addEventListener("click", function () {
        self.fields["support-type"].value = button.getAttribute("data-value");
        self.syncSupportType();
        self.update();
      });
    });

    if (this.actions["toggle-equations"]) {
      this.actions["toggle-equations"].addEventListener("click", function () {
        self.togglePanel("equations", self.root.querySelector('[data-role="equation-toggle-label"]'));
      });
    }

    if (this.actions["reset-form"]) {
      this.actions["reset-form"].addEventListener("click", function () {
        self.resetForm();
      });
    }

    if (this.actions["save-result"]) {
      this.actions["save-result"].addEventListener("click", function () {
        self.saveCurrentResult();
      });
    }

    if (this.actions["export-word-report"]) {
      this.actions["export-word-report"].addEventListener("click", function () {
        self.exportWordReport();
      });
    }

    if (this.actions["clear-results"]) {
      this.actions["clear-results"].addEventListener("click", function () {
        self.savedResults = [];
        writeStorage(self.storageKey, self.savedResults);
        self.renderSavedResults();
      });
    }

  };

  PunchingShearTool.prototype.resetForm = function () {
    var defaults = {
      "phi": "0.70",
      "kdg": "20",
      "slab-thickness": "260",
      "effective-depth": "210",
      "mean-effective-depth": "",
      "shear-depth": "",
      "support-type": "rectangular",
      "support-x": "400",
      "support-y": "650",
      "support-diameter": "550",
      "design-shear": "50",
      "moment-x": "25",
      "moment-y": "25",
      "flexure-moment-x": "",
      "flexure-moment-y": "",
      "concrete-strength": "40",
      "prestress": "0",
      "shear-reinforcement-yield": "500",
      "asv": "1256",
      "spacing-radial": "120",
      "spacing-transverse": "220",
      "first-fitment-distance": "160",
      "reinforcement-extent": "320"
    };

    var toggles = {
      "ignore-moment-transfer": false,
      "has-shear-reinforcement": false,
      "no-collapse-consequence": false
    };

    Object.keys(defaults).forEach(function (key) {
      if (this.fields[key]) {
        this.fields[key].value = defaults[key];
      }
    }, this);

    Object.keys(toggles).forEach(function (key) {
      if (this.fields[key]) {
        this.fields[key].checked = toggles[key];
      }
    }, this);

    this.syncSupportType();
    this.syncReinforcementFields();
    this.update();
  };

  PunchingShearTool.prototype.togglePanel = function (name, labelNode) {
    var panel = this.panels[name];
    if (!panel) {
      return;
    }

    var isCollapsed = panel.classList.toggle("is-collapsed");
    if (this.actions["toggle-equations"]) {
      this.actions["toggle-equations"].setAttribute("aria-expanded", isCollapsed ? "false" : "true");
    }

    if (labelNode) {
      labelNode.textContent = isCollapsed ? "Show" : "Hide";
    }
  };

  PunchingShearTool.prototype.syncSupportType = function () {
    var supportType = this.fields["support-type"].value;
    var rectSection = this.sections["support-rectangular"];
    var circularSection = this.sections["support-circular"];

    if (rectSection) {
      rectSection.classList.toggle("is-hidden", supportType !== "rectangular");
    }

    if (circularSection) {
      circularSection.classList.toggle("is-hidden", supportType !== "circular");
    }

    this.supportChoices.forEach(function (button) {
      button.classList.toggle("is-active", button.getAttribute("data-value") === supportType);
    });
  };

  PunchingShearTool.prototype.syncReinforcementFields = function () {
    var isActive = this.fields["has-shear-reinforcement"].checked;
    var section = this.sections["reinforcement-fields"];
    if (section) {
      section.classList.toggle("is-hidden", !isActive);
    }
  };

  PunchingShearTool.prototype.readInputs = function () {
    return {
      phi: parseNumber(this.fields["phi"].value),
      kdg: parseNumber(this.fields["kdg"].value),
      slabThickness: parseNumber(this.fields["slab-thickness"].value),
      effectiveDepth: parseNumber(this.fields["effective-depth"].value),
      meanEffectiveDepth: parseNumber(this.fields["mean-effective-depth"].value),
      shearDepth: parseNumber(this.fields["shear-depth"].value),
      supportType: this.fields["support-type"].value,
      supportX: parseNumber(this.fields["support-x"].value),
      supportY: parseNumber(this.fields["support-y"].value),
      supportDiameter: parseNumber(this.fields["support-diameter"].value),
      designShear: parseNumber(this.fields["design-shear"].value),
      momentX: parseNumber(this.fields["moment-x"].value),
      momentY: parseNumber(this.fields["moment-y"].value),
      flexureMomentX: parseNumber(this.fields["flexure-moment-x"].value),
      flexureMomentY: parseNumber(this.fields["flexure-moment-y"].value),
      ignoreMomentTransfer: this.fields["ignore-moment-transfer"].checked,
      concreteStrength: parseNumber(this.fields["concrete-strength"].value),
      prestress: parseNumber(this.fields["prestress"].value),
      shearReinforcementYield: parseNumber(this.fields["shear-reinforcement-yield"].value),
      hasShearReinforcement: this.fields["has-shear-reinforcement"].checked,
      asv: parseNumber(this.fields["asv"].value),
      spacingRadial: parseNumber(this.fields["spacing-radial"].value),
      spacingTransverse: parseNumber(this.fields["spacing-transverse"].value),
      firstFitmentDistance: parseNumber(this.fields["first-fitment-distance"].value),
      reinforcementExtent: parseNumber(this.fields["reinforcement-extent"].value),
      noCollapseConsequence: this.fields["no-collapse-consequence"].checked
    };
  };

  PunchingShearTool.prototype.validateInputs = function (raw) {
    var errors = {};
    var assumptions = [];
    var warnings = [];
    var supportType = raw.supportType;
    var reinforcementRequired = raw.hasShearReinforcement;

    function validateNumeric(fieldName, value, meta, targetErrors) {
      if (value === null) {
        if (!meta.optional) {
          targetErrors[fieldName] = meta.label + " is required.";
        }
        return null;
      }

      if (!meta.allowZero && value <= 0) {
        targetErrors[fieldName] = meta.label + " must be greater than zero.";
        return null;
      }

      if (value < meta.min || value > meta.max) {
        targetErrors[fieldName] = meta.label + " must be between " + meta.min + " and " + meta.max + ".";
        return null;
      }

      return value;
    }

    Object.keys(FIELD_RULES).forEach(function (fieldName) {
      var shouldSkip = false;
      if (fieldName === "support-x" || fieldName === "support-y") {
        shouldSkip = supportType !== "rectangular";
      }
      if (fieldName === "support-diameter") {
        shouldSkip = supportType !== "circular";
      }
      if (
        fieldName === "asv" ||
        fieldName === "spacing-radial" ||
        fieldName === "spacing-transverse" ||
        fieldName === "first-fitment-distance" ||
        fieldName === "reinforcement-extent"
      ) {
        shouldSkip = !reinforcementRequired;
      }

      if (!shouldSkip) {
        validateNumeric(fieldName, selfValue(raw, fieldName), FIELD_RULES[fieldName], errors);
      }
    });

    if (raw.effectiveDepth !== null && raw.meanEffectiveDepth === null) {
      raw.meanEffectiveDepth = raw.effectiveDepth;
      assumptions.push("Mean effective depth d_om was not entered, so d_om = d_o was adopted.");
    }

    if (raw.effectiveDepth !== null && raw.shearDepth === null) {
      raw.shearDepth = raw.effectiveDepth;
      assumptions.push("Effective shear depth d_v was not entered, so d_v = d_o was adopted.");
    }

    if (supportType === "rectangular") {
      if (raw.supportX === null) {
        errors["support-x"] = "Support dimension X is required.";
      }
      if (raw.supportY === null) {
        errors["support-y"] = "Support dimension Y is required.";
      }
      if (raw.supportX !== null && raw.supportY !== null && raw.supportY < raw.supportX) {
        errors["support-y"] = "Y must be greater than or equal to X for a rectangular support.";
      }
    } else {
      if (raw.supportDiameter === null) {
        errors["support-diameter"] = "Support diameter is required for the circular option.";
      }
    }

    if (raw.effectiveDepth !== null && raw.slabThickness !== null && raw.effectiveDepth >= raw.slabThickness) {
      errors["effective-depth"] = "d_o must be less than the slab thickness D_s.";
    }

    if (raw.meanEffectiveDepth !== null && raw.slabThickness !== null && raw.meanEffectiveDepth >= raw.slabThickness) {
      errors["mean-effective-depth"] = "d_om must be less than the slab thickness D_s.";
    }

    if (raw.shearDepth !== null && raw.slabThickness !== null && raw.shearDepth >= raw.slabThickness) {
      errors["shear-depth"] = "d_v must be less than the slab thickness D_s.";
    }

    if (
      raw.flexureMomentX !== null &&
      raw.momentX !== null &&
      raw.momentX !== 0 &&
      Math.abs(raw.flexureMomentX) > Math.abs(raw.momentX)
    ) {
      errors["flexure-moment-x"] = "M_fx* cannot exceed the magnitude of M_vx*.";
    }

    if (
      raw.flexureMomentY !== null &&
      raw.momentY !== null &&
      raw.momentY !== 0 &&
      Math.abs(raw.flexureMomentY) > Math.abs(raw.momentY)
    ) {
      errors["flexure-moment-y"] = "M_fy* cannot exceed the magnitude of M_vy*.";
    }

    if (raw.ignoreMomentTransfer) {
      warnings.push("Moment transfer has been ignored. This may be unconservative where the support transfers moment into the slab.");
    }

    warnings.push("This version is limited to internal supports or concentrated loads with rectangular or circular geometry.");

    return {
      isValid: Object.keys(errors).length === 0,
      errors: errors,
      assumptions: assumptions,
      warnings: warnings,
      values: raw
    };
  };

  function selfValue(raw, fieldName) {
    var map = {
      "phi": raw.phi,
      "kdg": raw.kdg,
      "slab-thickness": raw.slabThickness,
      "effective-depth": raw.effectiveDepth,
      "mean-effective-depth": raw.meanEffectiveDepth,
      "shear-depth": raw.shearDepth,
      "support-x": raw.supportX,
      "support-y": raw.supportY,
      "support-diameter": raw.supportDiameter,
      "design-shear": raw.designShear,
      "moment-x": raw.momentX,
      "moment-y": raw.momentY,
      "flexure-moment-x": raw.flexureMomentX,
      "flexure-moment-y": raw.flexureMomentY,
      "concrete-strength": raw.concreteStrength,
      "prestress": raw.prestress,
      "shear-reinforcement-yield": raw.shearReinforcementYield,
      "asv": raw.asv,
      "spacing-radial": raw.spacingRadial,
      "spacing-transverse": raw.spacingTransverse,
      "first-fitment-distance": raw.firstFitmentDistance,
      "reinforcement-extent": raw.reinforcementExtent
    };

    return map[fieldName];
  }

  PunchingShearTool.prototype.updateValidationUI = function (errors) {
    var self = this;

    this.root.querySelectorAll("[data-error-for]").forEach(function (node) {
      var key = node.getAttribute("data-error-for");
      node.textContent = errors[key] || "";
      var field = self.fields[key];
      var shell = field ? field.closest(".et-psd__control") : null;
      if (shell) {
        shell.classList.toggle("has-error", Boolean(errors[key]));
      }
    });
  };

  PunchingShearTool.prototype.calculate = function (inputs, assumptions, warnings) {
    var bl;
    var bt;
    var u;
    var uFace;
    var dcrit = null;
    var radius = null;
    var betaH;
    var shortDimension = null;
    var longDimension = null;
    var diameter = null;

    if (inputs.supportType === "rectangular") {
      shortDimension = inputs.supportX;
      longDimension = inputs.supportY;
      bt = shortDimension + inputs.meanEffectiveDepth;
      bl = longDimension + inputs.meanEffectiveDepth;
      u = 2 * (bt + bl);
      uFace = 2 * (shortDimension + longDimension);
      betaH = longDimension / shortDimension;
    } else {
      diameter = inputs.supportDiameter;
      dcrit = diameter + inputs.meanEffectiveDepth;
      radius = dcrit / 2;
      bt = dcrit;
      bl = dcrit;
      u = Math.PI * dcrit;
      uFace = Math.PI * diameter;
      betaH = 1;
    }

    var sqrtFc = Math.sqrt(inputs.concreteStrength);
    var sqrtFcLimited = Math.min(sqrtFc, 8);
    var kvs = clamp((1000 - inputs.slabThickness) / 700, 0.5, 1);
    if (inputs.noCollapseConsequence) {
      kvs = 1;
    }

    var asvMinimumBase = inputs.hasShearReinforcement && inputs.spacingRadial
      ? (0.08 * u * inputs.spacingRadial * sqrtFc) / inputs.shearReinforcementYield
      : 0;
    var minimumCheckPass = inputs.hasShearReinforcement && inputs.asv
      ? inputs.asv >= asvMinimumBase
      : false;

    var kvucsBase = Math.min(1300 / (1000 + inputs.kdg * inputs.shearDepth), 1);
    var kvucsAdopted = inputs.hasShearReinforcement && minimumCheckPass ? 1 : kvucsBase;
    var fcv1 = 0.17 * kvucsAdopted * (1 + 2 / betaH) * sqrtFcLimited;
    var fcv2 = 0.34 * kvucsAdopted * sqrtFcLimited;
    var fcv = Math.min(fcv1, fcv2);
    var vuc = u * inputs.meanEffectiveDepth * (fcv + 0.3 * inputs.prestress);
    var phiVuc = inputs.phi * vuc;

    var momentXAppliedNmm = inputs.momentX * 1000000;
    var momentYAppliedNmm = inputs.momentY * 1000000;
    var flexureMomentXNmm = (inputs.flexureMomentX || 0) * 1000000;
    var flexureMomentYNmm = (inputs.flexureMomentY || 0) * 1000000;
    var eccentricMomentX = 0;
    var eccentricMomentY = 0;
    var methodX = "Ignored by user selection";
    var methodY = "Ignored by user selection";

    if (!inputs.ignoreMomentTransfer) {
      if (inputs.flexureMomentX !== null) {
        eccentricMomentX = momentXAppliedNmm - flexureMomentXNmm;
        methodX = "Calculated from M_vx* - M_fx*";
      } else {
        eccentricMomentX = momentXAppliedNmm * (1 - 1 / (1 + (2 / 3) * Math.sqrt(bl / bt)));
        methodX = "Estimated using the Clause 9.2 simplified expression";
      }

      if (inputs.flexureMomentY !== null) {
        eccentricMomentY = momentYAppliedNmm - flexureMomentYNmm;
        methodY = "Calculated from M_vy* - M_fy*";
      } else {
        eccentricMomentY = momentYAppliedNmm * (1 - 1 / (1 + (2 / 3) * Math.sqrt(bt / bl)));
        methodY = "Estimated using the Clause 9.2 simplified expression";
      }
    }

    var jx = inputs.supportType === "rectangular"
      ? (Math.pow(bl, 3) / 6) + (bl * Math.pow(bt, 2) / 2)
      : Math.PI * Math.pow(radius, 3);
    var jy = inputs.supportType === "rectangular"
      ? (Math.pow(bt, 3) / 6) + (bt * Math.pow(bl, 2) / 2)
      : Math.PI * Math.pow(radius, 3);
    var yx = inputs.supportType === "rectangular" ? bt / 2 : radius;
    var yy = inputs.supportType === "rectangular" ? bl / 2 : radius;
    var designShearN = inputs.designShear * 1000;
    var vBase = designShearN / u;
    var vMx = (eccentricMomentX * yx) / jx;
    var vMy = (eccentricMomentY * yy) / jy;
    var vStar = vBase + Math.abs(vMx) + Math.abs(vMy);
    var totalShearDemand = vStar * u;

    var vus = inputs.hasShearReinforcement && inputs.asv && inputs.spacingRadial
      ? (inputs.asv * inputs.shearReinforcementYield * inputs.shearDepth) / inputs.spacingRadial
      : 0;

    var kvuc = clamp(phiVuc / totalShearDemand, 0.5, 1);
    var vu = kvuc * vuc + vus;
    var phiVu = inputs.phi * vu;
    var utilisation = totalShearDemand / phiVu;
    var pass = totalShearDemand <= phiVu;
    var vuMax = 0.2 * uFace * inputs.meanEffectiveDepth * inputs.concreteStrength;
    var phiVuMax = inputs.phi * vuMax;
    var facePass = designShearN <= phiVuMax;
    var minimumRequired = totalShearDemand >= kvs * phiVuc;
    var asvMinimum = asvMinimumBase;
    var vusMin = asvMinimum > 0 && inputs.spacingRadial
      ? (asvMinimum * inputs.shearReinforcementYield * inputs.shearDepth) / inputs.spacingRadial
      : 0;
    var phiVuMin = inputs.phi * (kvuc * vuc + vusMin);
    var radialLimit = inputs.hasShearReinforcement
      ? totalShearDemand <= phiVuMin
        ? Math.min(0.75 * inputs.slabThickness, 600)
        : Math.min(0.5 * inputs.slabThickness, 300)
      : null;
    var transverseLimit = inputs.hasShearReinforcement
      ? totalShearDemand <= phiVuMin
        ? 1.75 * inputs.slabThickness
        : 1.25 * inputs.slabThickness
      : null;
    var radialCheckPass = inputs.hasShearReinforcement && inputs.spacingRadial && radialLimit !== null
      ? inputs.spacingRadial <= radialLimit
      : null;
    var transverseCheckPass = inputs.hasShearReinforcement && inputs.spacingTransverse && transverseLimit !== null
      ? inputs.spacingTransverse <= transverseLimit
      : null;
    var firstFitmentMin = inputs.hasShearReinforcement ? Math.min(0.2 * inputs.slabThickness, 200) : null;
    var firstFitmentMax = inputs.hasShearReinforcement ? Math.max(0.4 * inputs.slabThickness, 300) : null;
    var firstFitmentMinPass = inputs.hasShearReinforcement && inputs.firstFitmentDistance !== null
      ? inputs.firstFitmentDistance >= firstFitmentMin
      : null;
    var firstFitmentMaxPass = inputs.hasShearReinforcement && inputs.firstFitmentDistance !== null
      ? inputs.firstFitmentDistance <= firstFitmentMax
      : null;
    var extentRequired = inputs.hasShearReinforcement ? inputs.slabThickness : null;
    var extentPass = inputs.hasShearReinforcement && inputs.reinforcementExtent !== null
      ? inputs.reinforcementExtent >= extentRequired
      : null;
    var overallDetailingPass = inputs.hasShearReinforcement
      ? Boolean(radialCheckPass && transverseCheckPass && firstFitmentMinPass && firstFitmentMaxPass && extentPass)
      : null;

    return {
      standardLabel: "AS 5100.5:2017 + 2024 Amendment, Clause 9.2",
      assumptions: assumptions,
      warnings: warnings,
      inputs: inputs,
      criticalPerimeter: {
        supportType: inputs.supportType,
        shortDimension: shortDimension,
        longDimension: longDimension,
        diameter: diameter,
        bl: bl,
        bt: bt,
        u: u,
        uFace: uFace,
        dcrit: dcrit,
        radius: radius
      },
      momentTransfer: {
        momentXApplied: momentXAppliedNmm,
        momentYApplied: momentYAppliedNmm,
        flexureMomentX: flexureMomentXNmm,
        flexureMomentY: flexureMomentYNmm,
        eccentricMomentX: eccentricMomentX,
        eccentricMomentY: eccentricMomentY,
        methodX: methodX,
        methodY: methodY,
        jx: jx,
        jy: jy,
        yx: yx,
        yy: yy
      },
      demand: {
        vBase: vBase,
        vMx: vMx,
        vMy: vMy,
        vStar: vStar,
        totalShearDemand: totalShearDemand
      },
      concreteCapacity: {
        betaH: betaH,
        sqrtFc: sqrtFc,
        sqrtFcLimited: sqrtFcLimited,
        kvucsBase: kvucsBase,
        kvucsAdopted: kvucsAdopted,
        fcv1: fcv1,
        fcv2: fcv2,
        fcv: fcv,
        vuc: vuc,
        phiVuc: phiVuc
      },
      shearReinforcement: {
        provided: inputs.hasShearReinforcement,
        asvProvided: inputs.asv || 0,
        asvMinimum: asvMinimum,
        vus: vus,
        minimumRequired: minimumRequired,
        minimumCheckPass: inputs.hasShearReinforcement ? minimumCheckPass : false
      },
      strength: {
        kvuc: kvuc,
        vu: vu,
        phiVu: phiVu,
        utilisation: utilisation,
        pass: pass
      },
      faceCheck: {
        vuMax: vuMax,
        phiVuMax: phiVuMax,
        pass: facePass
      },
      minimumReinforcementTrigger: {
        kvs: kvs,
        kvsPhiVuc: kvs * phiVuc,
        required: minimumRequired
      },
      detailing: {
        phiVuMin: phiVuMin,
        radialLimit: radialLimit,
        radialCheckPass: radialCheckPass,
        transverseLimit: transverseLimit,
        transverseCheckPass: transverseCheckPass,
        firstFitmentMin: firstFitmentMin,
        firstFitmentMax: firstFitmentMax,
        firstFitmentMinPass: firstFitmentMinPass,
        firstFitmentMaxPass: firstFitmentMaxPass,
        extentRequired: extentRequired,
        extentPass: extentPass,
        overallPass: overallDetailingPass,
        anchorageChecklist: [
          "Confirm each reinforcement line is anchored above and below the slab tension field.",
          "Confirm reinforcement extends from the support face to at least D_s beyond the perimeter where V* <= phiV_uc.",
          "Confirm stud rails or stirrups remain compatible with cover, congestion, and local anchorage rules."
        ]
      }
    };
  };

  PunchingShearTool.prototype.getVisualizationGeometry = function (report) {
    var centerX = 270;
    var centerY = 210;

    if (report.criticalPerimeter.supportType === "circular") {
      var supportDiameter = report.criticalPerimeter.diameter;
      var perimeterDiameter = report.criticalPerimeter.dcrit;
      var scaleCircle = 210 / perimeterDiameter;
      var supportRadius = (supportDiameter * scaleCircle) / 2;
      var perimeterRadius = (perimeterDiameter * scaleCircle) / 2;

      return {
        supportType: "circular",
        support: {
          x: centerX - supportRadius,
          y: centerY - supportRadius,
          width: supportRadius * 2,
          height: supportRadius * 2,
          radius: supportRadius
        },
        perimeter: {
          x: centerX - perimeterRadius,
          y: centerY - perimeterRadius,
          width: perimeterRadius * 2,
          height: perimeterRadius * 2,
          radius: perimeterRadius
        }
      };
    }

    var scaleRect = 230 / Math.max(report.criticalPerimeter.bt, report.criticalPerimeter.bl);
    var supportWidth = report.criticalPerimeter.longDimension * scaleRect;
    var supportHeight = report.criticalPerimeter.shortDimension * scaleRect;
    var perimeterWidth = report.criticalPerimeter.bl * scaleRect;
    var perimeterHeight = report.criticalPerimeter.bt * scaleRect;

    return {
      supportType: "rectangular",
      support: {
        x: centerX - supportWidth / 2,
        y: centerY - supportHeight / 2,
        width: supportWidth,
        height: supportHeight
      },
      perimeter: {
        x: centerX - perimeterWidth / 2,
        y: centerY - perimeterHeight / 2,
        width: perimeterWidth,
        height: perimeterHeight
      }
    };
  };

  PunchingShearTool.prototype.drawDiagram = function (report) {
    var geometry = this.getVisualizationGeometry(report);
    var lines = [];
    var showMoments = !report.inputs.ignoreMomentTransfer;

    lines.push('<defs>');
    lines.push('<marker id="' + this.root.id + '-arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M 0 0 L 8 4 L 0 8 z" fill="#0f9f9b"></path></marker>');
    lines.push('</defs>');
    lines.push('<rect x="0" y="0" width="540" height="420" fill="#f8fbff"></rect>');
    lines.push('<g stroke="rgba(37,99,235,0.07)" stroke-width="1">' + buildGridLines(540, 420, 24) + '</g>');
    lines.push('<line x1="270" y1="42" x2="270" y2="378" stroke="rgba(22,48,71,0.22)" stroke-width="1.2"></line>');
    lines.push('<line x1="60" y1="210" x2="480" y2="210" stroke="rgba(22,48,71,0.22)" stroke-width="1.2"></line>');
    lines.push('<text x="278" y="58" fill="#667b92" font-size="14">y</text>');
    lines.push('<text x="454" y="201" fill="#667b92" font-size="14">x</text>');
    lines.push('<circle cx="270" cy="210" r="3.5" fill="#2563eb"></circle>');
    lines.push('<text x="282" y="226" fill="#667b92" font-size="13">centroid</text>');

    if (geometry.supportType === "rectangular") {
      lines.push('<rect x="' + geometry.perimeter.x + '" y="' + geometry.perimeter.y + '" width="' + geometry.perimeter.width + '" height="' + geometry.perimeter.height + '" rx="18" fill="rgba(15,159,155,0.08)" stroke="#0f9f9b" stroke-width="2.2" stroke-dasharray="7 7"></rect>');
      lines.push('<rect x="' + geometry.support.x + '" y="' + geometry.support.y + '" width="' + geometry.support.width + '" height="' + geometry.support.height + '" rx="14" fill="rgba(37,99,235,0.14)" stroke="#2563eb" stroke-width="2.4"></rect>');
      lines.push('<line x1="' + geometry.perimeter.x + '" y1="' + (geometry.perimeter.y - 28) + '" x2="' + (geometry.perimeter.x + geometry.perimeter.width) + '" y2="' + (geometry.perimeter.y - 28) + '" stroke="#0f9f9b" stroke-width="1.5" marker-start="url(#' + this.root.id + '-arrow)" marker-end="url(#' + this.root.id + '-arrow)"></line>');
      lines.push('<text x="270" y="' + (geometry.perimeter.y - 38) + '" text-anchor="middle" fill="#163047" font-size="13">Y + d_om = ' + escapeHtml(formatNumber(report.criticalPerimeter.bl, 0)) + ' mm</text>');
      lines.push('<line x1="' + (geometry.perimeter.x + geometry.perimeter.width + 28) + '" y1="' + geometry.perimeter.y + '" x2="' + (geometry.perimeter.x + geometry.perimeter.width + 28) + '" y2="' + (geometry.perimeter.y + geometry.perimeter.height) + '" stroke="#0f9f9b" stroke-width="1.5" marker-start="url(#' + this.root.id + '-arrow)" marker-end="url(#' + this.root.id + '-arrow)"></line>');
      lines.push('<text x="' + (geometry.perimeter.x + geometry.perimeter.width + 44) + '" y="214" fill="#163047" font-size="13" transform="rotate(90 ' + (geometry.perimeter.x + geometry.perimeter.width + 44) + ' 214)">X + d_om = ' + escapeHtml(formatNumber(report.criticalPerimeter.bt, 0)) + ' mm</text>');
    } else {
      lines.push('<circle cx="270" cy="210" r="' + geometry.perimeter.radius + '" fill="rgba(15,159,155,0.08)" stroke="#0f9f9b" stroke-width="2.2" stroke-dasharray="7 7"></circle>');
      lines.push('<circle cx="270" cy="210" r="' + geometry.support.radius + '" fill="rgba(37,99,235,0.14)" stroke="#2563eb" stroke-width="2.4"></circle>');
      lines.push('<line x1="270" y1="210" x2="' + (270 + geometry.perimeter.radius) + '" y2="210" stroke="#0f9f9b" stroke-width="1.5" marker-end="url(#' + this.root.id + '-arrow)"></line>');
      lines.push('<text x="' + (360) + '" y="193" fill="#163047" font-size="13">r = ' + escapeHtml(formatNumber(report.criticalPerimeter.radius, 0)) + ' mm</text>');
      lines.push('<line x1="' + (270 - geometry.support.radius) + '" y1="' + (210 + geometry.support.radius + 28) + '" x2="' + (270 + geometry.support.radius) + '" y2="' + (210 + geometry.support.radius + 28) + '" stroke="#2563eb" stroke-width="1.5" marker-start="url(#' + this.root.id + '-arrow)" marker-end="url(#' + this.root.id + '-arrow)"></line>');
      lines.push('<text x="270" y="' + (210 + geometry.support.radius + 18) + '" text-anchor="middle" fill="#163047" font-size="13">D_col = ' + escapeHtml(formatNumber(report.criticalPerimeter.diameter, 0)) + ' mm</text>');
    }

    lines.push('<text x="270" y="214" text-anchor="middle" fill="#163047" font-size="14" font-weight="700">Support / loaded area</text>');
    lines.push('<text x="270" y="338" text-anchor="middle" fill="#0f9f9b" font-size="14" font-weight="700">Critical perimeter u = ' + escapeHtml(formatNumber(report.criticalPerimeter.u, 0)) + ' mm</text>');

    if (showMoments) {
      lines.push('<path d="M 144 126 C 172 84, 222 80, 252 106" fill="none" stroke="#2563eb" stroke-width="2"></path>');
      lines.push('<path d="M 396 296 C 372 336, 320 340, 292 314" fill="none" stroke="#2563eb" stroke-width="2"></path>');
      lines.push('<text x="136" y="116" fill="#2563eb" font-size="13">Mvx*</text>');
      lines.push('<text x="392" y="320" fill="#2563eb" font-size="13">Mvy*</text>');
    }

    if (report.inputs.hasShearReinforcement) {
      lines.push('<circle cx="214" cy="154" r="5" fill="#0f9f9b"></circle>');
      lines.push('<circle cx="326" cy="154" r="5" fill="#0f9f9b"></circle>');
      lines.push('<circle cx="214" cy="266" r="5" fill="#0f9f9b"></circle>');
      lines.push('<circle cx="326" cy="266" r="5" fill="#0f9f9b"></circle>');
      lines.push('<text x="270" y="126" text-anchor="middle" fill="#0f9f9b" font-size="12">Indicative shear reinforcement</text>');
    }

    this.diagram.innerHTML = lines.join("");
  };

  PunchingShearTool.prototype.renderEquations = function () {
    var equations = {
      strength: "V_u = k_{vuc}V_{uc}+V_{us},\\quad V_{uc}=u d_{om}(f_{cv}+0.3\\sigma_{cp})",
      demand: "v^{*}=\\frac{V_v^{*}}{u}+\\left|\\frac{M_{vvx}^{*}y_x}{J_x}\\right|+\\left|\\frac{M_{vvy}^{*}y_y}{J_y}\\right|",
      detailing: "A_{sv,min}=\\frac{0.08u s\\sqrt{f'_c}}{f_{sy,f}},\\quad V_{u,max}=0.2u_{face}d_{om}f'_c"
    };

    this.renderMath(this.root.querySelector('[data-role="equation-strength"]'), equations.strength);
    this.renderMath(this.root.querySelector('[data-role="equation-demand"]'), equations.demand);
    this.renderMath(this.root.querySelector('[data-role="equation-detailing"]'), equations.detailing);
  };

  PunchingShearTool.prototype.renderMath = function (target, expression) {
    if (!target) {
      return;
    }

    if (window.katex) {
      window.katex.render(expression, target, {
        throwOnError: false,
        displayMode: true
      });
      return;
    }

    target.textContent = expression;
  };

  PunchingShearTool.prototype.setInvalidState = function (validation) {
    this.lastState = null;
    this.actions["save-result"].disabled = true;
    if (this.actions["export-word-report"]) {
      this.actions["export-word-report"].disabled = true;
    }
    this.outputs["support-type-pill"].textContent = this.fields["support-type"].value === "rectangular" ? "Rectangular" : "Circular";
    this.outputs["critical-perimeter-caption"].textContent = "Awaiting valid inputs";
    this.outputs["moment-transfer-caption"].textContent = this.fields["ignore-moment-transfer"].checked ? "Ignored by user selection" : "Clause 9.2 active";
    this.outputs["phi-vu"].textContent = "--";
    this.outputs["demand-total"].textContent = "--";
    this.outputs["utilisation"].textContent = "--";
    this.outputs["status-text"].textContent = "--";
    this.outputs["status-pill"].textContent = "Invalid";
    this.outputs["status-pill"].dataset.tone = "fail";
    this.outputs["hero-note"].textContent = "Resolve the highlighted inputs to regenerate strength and detailing checks.";
    this.outputs["perimeter-u"].textContent = "--";
    this.outputs["beta-h"].textContent = "--";
    this.outputs["kvucs"].textContent = "--";
    this.outputs["fcv"].textContent = "--";
    this.outputs["phi-vuc"].textContent = "--";
    this.outputs["vus"].textContent = "--";
    this.outputs["face-check"].textContent = "--";
    this.outputs["min-reinforcement-trigger"].textContent = "--";
    this.outputs["detailing-check"].textContent = "--";
    if (this.outputs["export-feedback"]) {
      this.outputs["export-feedback"].textContent = "";
    }
    this.root.querySelector('[data-role="hero-metric"]').dataset.tone = "idle";
    this.renderNotices(validation.warnings, true);
    this.diagram.innerHTML = createEmptyDiagramMarkup();
  };

  PunchingShearTool.prototype.renderNotices = function (warnings, isInvalid) {
    var notices = [];

    if (isInvalid) {
      notices.push({
        tone: "fail",
        title: "Validation required",
        text: "One or more required fields are invalid. Results, saving, and print export remain disabled until corrected."
      });
    } else {
      notices.push({
        tone: "info",
        title: "Scope note",
        text: "This calculator applies to internal supports only under AS 5100.5 Clause 9.2."
      });
    }

    warnings.forEach(function (warning) {
      notices.push({
        tone: "warn",
        title: "Engineering note",
        text: warning
      });
    });

    this.root.querySelector('[data-role="notice-stack"]').innerHTML = notices.map(function (notice) {
      return [
        '<div class="et-psd__notice" data-tone="', notice.tone, '">',
        '<strong>', escapeHtml(notice.title), '</strong>',
        '<p>', escapeHtml(notice.text), '</p>',
        '</div>'
      ].join("");
    }).join("");
  };

  PunchingShearTool.prototype.renderOutputs = function (report) {
    var tone = getUtilisationTone(report.strength.utilisation);
    var hero = this.root.querySelector('[data-role="hero-metric"]');
    var statusLabel = getStatusLabel(report.strength.pass);

    hero.dataset.tone = tone;
    this.outputs["support-type-pill"].textContent = report.inputs.supportType === "rectangular" ? "Rectangular" : "Circular";
    this.outputs["critical-perimeter-caption"].textContent = "u = " + formatNumber(report.criticalPerimeter.u, 0) + " mm";
    this.outputs["moment-transfer-caption"].textContent = report.inputs.ignoreMomentTransfer ? "Ignored by user selection" : "Clause 9.2 active";
    this.outputs["phi-vu"].textContent = formatForceKilonewtons(report.strength.phiVu, 1);
    this.outputs["demand-total"].textContent = formatForceKilonewtons(report.demand.totalShearDemand, 1);
    this.outputs["utilisation"].textContent = formatNumber(report.strength.utilisation, 3);
    this.outputs["status-text"].textContent = statusLabel;
    this.outputs["status-pill"].textContent = statusLabel;
    this.outputs["status-pill"].dataset.tone = tone;
    this.outputs["hero-note"].textContent = "Concrete capacity, reinforcement contribution, and face shear checks are updated in real time.";
    this.outputs["perimeter-u"].textContent = formatNumber(report.criticalPerimeter.u, 0) + " mm";
    this.outputs["beta-h"].textContent = formatNumber(report.concreteCapacity.betaH, 3);
    this.outputs["kvucs"].textContent = formatNumber(report.concreteCapacity.kvucsAdopted, 3);
    this.outputs["fcv"].textContent = formatNumber(report.concreteCapacity.fcv, 3) + " MPa";
    this.outputs["phi-vuc"].textContent = formatForceKilonewtons(report.concreteCapacity.phiVuc, 1);
    this.outputs["vus"].textContent = formatForceKilonewtons(report.shearReinforcement.vus, 1);
    this.outputs["face-check"].textContent = report.faceCheck.pass ? "PASS" : "FAIL";
    this.outputs["min-reinforcement-trigger"].textContent = report.minimumReinforcementTrigger.required ? "YES" : "NO";
    this.outputs["detailing-check"].textContent = formatPassFail(report.detailing.overallPass);
    if (this.outputs["export-feedback"]) {
      this.outputs["export-feedback"].textContent = "";
    }
    this.renderNotices(report.warnings, false);
  };

  function formatPassFail(value) {
    if (value === null) {
      return "N/A";
    }

    return value ? "PASS" : "FAIL";
  }

  PunchingShearTool.prototype.renderSavedResults = function () {
    if (!this.savedResults.length) {
      this.savedResultsBody.innerHTML = '<tr><td class="et-psd__empty-row" colspan="7">No saved scenarios yet.</td></tr>';
      return;
    }

    this.savedResultsBody.innerHTML = this.savedResults.map(function (row) {
      return [
        "<tr>",
        "<td>", escapeHtml(formatDateTime(row.timestamp)), "</td>",
        "<td>", escapeHtml(row.supportType), "</td>",
        "<td>", escapeHtml(row.geometry), "</td>",
        "<td>", escapeHtml(row.demand), "</td>",
        "<td>", escapeHtml(row.capacity), "</td>",
        "<td>", escapeHtml(row.utilisation), "</td>",
        '<td class="', row.pass ? "et-psd__report-status-pass" : "et-psd__report-status-fail", '">', escapeHtml(row.status), "</td>",
        "</tr>"
      ].join("");
    }).join("");
  };

  PunchingShearTool.prototype.saveCurrentResult = function () {
    if (!this.lastState) {
      return;
    }

    var report = this.lastState.report;
    var geometry = report.inputs.supportType === "rectangular"
      ? formatNumber(report.criticalPerimeter.shortDimension, 0) + " x " + formatNumber(report.criticalPerimeter.longDimension, 0) + " mm"
      : "D = " + formatNumber(report.criticalPerimeter.diameter, 0) + " mm";

    this.savedResults.unshift({
      id: uniqueId(),
      timestamp: new Date().toISOString(),
      supportType: report.inputs.supportType,
      geometry: geometry,
      demand: formatForceKilonewtons(report.demand.totalShearDemand, 1),
      capacity: formatForceKilonewtons(report.strength.phiVu, 1),
      utilisation: formatNumber(report.strength.utilisation, 3),
      status: getStatusLabel(report.strength.pass),
      pass: report.strength.pass
    });
    this.savedResults = this.savedResults.slice(0, 20);
    writeStorage(this.storageKey, this.savedResults);
    this.renderSavedResults();
  };

  PunchingShearTool.prototype.exportWordReport = async function () {
    var reportData;
    var documentDefinition;
    var blob;

    if (!this.lastState) {
      return;
    }

    if (!window.docx) {
      if (this.outputs["export-feedback"]) {
        this.outputs["export-feedback"].textContent = "Word export is unavailable because the docx library did not load.";
      }
      return;
    }

    try {
      this.actions["export-word-report"].disabled = true;
      this.actions["export-word-report"].textContent = "Exporting...";

      if (this.outputs["export-feedback"]) {
        this.outputs["export-feedback"].textContent = "";
      }

      reportData = await buildWordReportData(this.lastState.report, this.root);
      documentDefinition = await buildWordReportDocument(reportData);
      blob = await window.docx.Packer.toBlob(documentDefinition);
      triggerDownload(blob, reportData.fileName);

      if (this.outputs["export-feedback"]) {
        this.outputs["export-feedback"].textContent = "Word report exported successfully.";
      }
    } catch (error) {
      window.console.error("Punching shear Word export failed.", error);
      if (this.outputs["export-feedback"]) {
        this.outputs["export-feedback"].textContent = error && error.message ? error.message : "Unable to export the Word report.";
      }
    } finally {
      this.actions["export-word-report"].disabled = false;
      this.actions["export-word-report"].textContent = "Export Word Report";
    }
  };

  PunchingShearTool.prototype.buildReportHtml = function (report) {
    var metadata = {
      company: this.root.getAttribute("data-report-company") || "Not specified",
      project: this.root.getAttribute("data-report-project") || "Not specified",
      preparedBy: this.root.getAttribute("data-report-prepared-by") || "Not specified",
      disclaimer: this.root.getAttribute("data-report-disclaimer") || ""
    };
    var diagramMarkup = this.diagram ? this.diagram.outerHTML : "";
    var supportDescription = report.inputs.supportType === "rectangular"
      ? formatNumber(report.criticalPerimeter.shortDimension, 0) + " mm x " + formatNumber(report.criticalPerimeter.longDimension, 0) + " mm"
      : "Diameter " + formatNumber(report.criticalPerimeter.diameter, 0) + " mm";
    var detailRows = [
      ["Radial spacing limit", report.detailing.radialLimit !== null ? formatNumber(report.detailing.radialLimit, 0) + " mm" : "N/A", formatPassFail(report.detailing.radialCheckPass)],
      ["Transverse spacing limit", report.detailing.transverseLimit !== null ? formatNumber(report.detailing.transverseLimit, 0) + " mm" : "N/A", formatPassFail(report.detailing.transverseCheckPass)],
      ["First fitment minimum", report.detailing.firstFitmentMin !== null ? formatNumber(report.detailing.firstFitmentMin, 0) + " mm" : "N/A", formatPassFail(report.detailing.firstFitmentMinPass)],
      ["First fitment maximum", report.detailing.firstFitmentMax !== null ? formatNumber(report.detailing.firstFitmentMax, 0) + " mm" : "N/A", formatPassFail(report.detailing.firstFitmentMaxPass)],
      ["Reinforcement extent", report.detailing.extentRequired !== null ? ">= " + formatNumber(report.detailing.extentRequired, 0) + " mm" : "N/A", formatPassFail(report.detailing.extentPass)]
    ];

    return [
      '<section class="et-psd__report-block">',
      '<h4>Report Metadata</h4>',
      '<div class="et-psd__report-grid">',
      this.reportRow("Standard", report.standardLabel),
      this.reportRow("Generated", formatDateTime(new Date().toISOString())),
      this.reportRow("Company", metadata.company),
      this.reportRow("Project", metadata.project),
      this.reportRow("Prepared by", metadata.preparedBy),
      this.reportRow("Support condition", "Internal support only"),
      "</div>",
      "</section>",
      '<section class="et-psd__report-block">',
      '<h4>Design Summary</h4>',
      '<div class="et-psd__report-grid">',
      this.reportRow("Support type", report.inputs.supportType),
      this.reportRow("Support geometry", supportDescription),
      this.reportRow("V*", formatForceKilonewtons(report.demand.totalShearDemand, 1)),
      this.reportRow("phiV_u", formatForceKilonewtons(report.strength.phiVu, 1)),
      this.reportRow("Utilisation", formatNumber(report.strength.utilisation, 3)),
      this.reportRow("Status", getStatusLabel(report.strength.pass)),
      "</div>",
      "</section>",
      '<section class="et-psd__report-block">',
      "<h4>Live Diagram</h4>",
      '<div class="et-psd__report-figure">',
      diagramMarkup,
      "<p>Critical perimeter and support geometry at the current validated state.</p>",
      "</div>",
      "</section>",
      '<section class="et-psd__report-block">',
      '<h4>Inputs</h4>',
      '<div class="et-psd__report-grid">',
      this.reportRow("phi", formatNumber(report.inputs.phi, 2)),
      this.reportRow("k_dg", formatNumber(report.inputs.kdg, 0)),
      this.reportRow("D_s", formatNumber(report.inputs.slabThickness, 0) + " mm"),
      this.reportRow("d_o", formatNumber(report.inputs.effectiveDepth, 0) + " mm"),
      this.reportRow("d_om", formatNumber(report.inputs.meanEffectiveDepth, 0) + " mm"),
      this.reportRow("d_v", formatNumber(report.inputs.shearDepth, 0) + " mm"),
      this.reportRow("V_v*", formatNumber(report.inputs.designShear, 1) + " kN"),
      this.reportRow("M_vx*", formatNumber(report.inputs.momentX, 1) + " kNm"),
      this.reportRow("M_vy*", formatNumber(report.inputs.momentY, 1) + " kNm"),
      this.reportRow("f'c", formatNumber(report.inputs.concreteStrength, 1) + " MPa"),
      this.reportRow("sigma_cp", formatNumber(report.inputs.prestress, 2) + " MPa"),
      this.reportRow("f_sy,f", formatNumber(report.inputs.shearReinforcementYield, 0) + " MPa"),
      "</div>",
      "</section>",
      '<section class="et-psd__report-block">',
      '<h4>Critical Perimeter and Demand</h4>',
      '<div class="et-psd__report-grid">',
      this.reportRow("u", formatNumber(report.criticalPerimeter.u, 0) + " mm"),
      this.reportRow("u_face", formatNumber(report.criticalPerimeter.uFace, 0) + " mm"),
      this.reportRow("b_t", formatNumber(report.criticalPerimeter.bt, 0) + " mm"),
      this.reportRow("b_l", formatNumber(report.criticalPerimeter.bl, 0) + " mm"),
      this.reportRow("v_base", formatNumber(report.demand.vBase, 3) + " N/mm"),
      this.reportRow("v_mx", formatNumber(report.demand.vMx, 3) + " N/mm"),
      this.reportRow("v_my", formatNumber(report.demand.vMy, 3) + " N/mm"),
      this.reportRow("v*", formatNumber(report.demand.vStar, 3) + " N/mm"),
      "</div>",
      "</section>",
      '<section class="et-psd__report-block">',
      '<h4>Strength and Checks</h4>',
      '<div class="et-psd__report-grid">',
      this.reportRow("beta_h", formatNumber(report.concreteCapacity.betaH, 3)),
      this.reportRow("k_vucs", formatNumber(report.concreteCapacity.kvucsAdopted, 3)),
      this.reportRow("f_cv", formatNumber(report.concreteCapacity.fcv, 3) + " MPa"),
      this.reportRow("phiV_uc", formatForceKilonewtons(report.concreteCapacity.phiVuc, 1)),
      this.reportRow("V_us", formatForceKilonewtons(report.shearReinforcement.vus, 1)),
      this.reportRow("k_vuc", formatNumber(report.strength.kvuc, 3)),
      this.reportRow("V_u,max", formatForceKilonewtons(report.faceCheck.phiVuMax, 1)),
      this.reportRow("Face shear check", formatPassFail(report.faceCheck.pass)),
      this.reportRow("Minimum reinforcement trigger", report.minimumReinforcementTrigger.required ? "YES" : "NO"),
      this.reportRow("A_sv,min", formatNumber(report.shearReinforcement.asvMinimum, 1) + " mm²"),
      "</div>",
      "</section>",
      '<section class="et-psd__report-block">',
      '<h4>Detailing Checks</h4>',
      '<table class="et-psd__report-table"><thead><tr><th>Check</th><th>Requirement</th><th>Status</th></tr></thead><tbody>',
      detailRows.map(function (row) {
        var statusClass = row[2] === "PASS" ? "et-psd__report-status-pass" : row[2] === "FAIL" ? "et-psd__report-status-fail" : "et-psd__report-status-warn";
        return "<tr><td>" + escapeHtml(row[0]) + "</td><td>" + escapeHtml(row[1]) + "</td><td class=\"" + statusClass + "\">" + escapeHtml(row[2]) + "</td></tr>";
      }).join(""),
      "</tbody></table>",
      "</section>",
      '<section class="et-psd__report-block">',
      '<h4>Methodology and Notes</h4>',
      '<ul class="et-psd__bullet-list">',
      '<li>Critical perimeter geometry is derived for internal rectangular or circular supports only.</li>',
      '<li>Transferred moments are resolved into eccentric shear directly from M_v* - M_f* where flexural moments are entered. Otherwise the simplified Clause 9.2 expression is applied.</li>',
      '<li>Total punching demand is evaluated from base shear flow plus absolute biaxial moment-induced shear flow terms.</li>',
      '<li>Concrete strength, shear reinforcement contribution, maximum face shear, minimum reinforcement, and detailing checks are reported in design-force form.</li>',
      '</ul>',
      report.assumptions.length ? '<h4>Assumptions</h4><ul class="et-psd__bullet-list">' + report.assumptions.map(function (item) { return "<li>" + escapeHtml(item) + "</li>"; }).join("") + "</ul>" : "",
      report.warnings.length ? '<h4>Warnings</h4><ul class="et-psd__bullet-list">' + report.warnings.map(function (item) { return "<li>" + escapeHtml(item) + "</li>"; }).join("") + "</ul>" : "",
      '<h4>Anchorage checklist</h4><ul class="et-psd__bullet-list">' + report.detailing.anchorageChecklist.map(function (item) { return "<li>" + escapeHtml(item) + "</li>"; }).join("") + "</ul>",
      metadata.disclaimer ? "<h4>Disclaimer</h4><p>" + escapeHtml(metadata.disclaimer) + "</p>" : "",
      "</section>"
    ].join("");
  };

  PunchingShearTool.prototype.reportRow = function (label, value) {
    return [
      '<div class="et-psd__report-row">',
      '<span class="et-psd__report-label">', escapeHtml(label), "</span>",
      '<strong class="et-psd__report-value">', escapeHtml(value), "</strong>",
      "</div>"
    ].join("");
  };

  PunchingShearTool.prototype.update = function () {
    var raw = this.readInputs();
    var validation = this.validateInputs(raw);
    this.updateValidationUI(validation.errors);

    if (!validation.isValid) {
      this.setInvalidState(validation);
      return;
    }

    var report = this.calculate(validation.values, validation.assumptions, validation.warnings);
    this.lastState = {
      report: report,
      timestamp: new Date().toISOString()
    };

    this.actions["save-result"].disabled = false;
    if (this.actions["export-word-report"]) {
      this.actions["export-word-report"].disabled = false;
    }
    this.renderOutputs(report);
    this.drawDiagram(report);
  };

  async function buildWordReportData(report, root) {
    var figures = await createVisualisationSection(root);
    var generatedAtIso = new Date().toISOString();

    return {
      title: "Punching Shear Design Report",
      fileName: "punching-shear-design_" + formatFileStamp(generatedAtIso) + ".docx",
      metadata: [
        ["Project", root.getAttribute("data-report-project") || "Not specified"],
        ["Company", root.getAttribute("data-report-company") || "Not specified"],
        ["Prepared By", root.getAttribute("data-report-prepared-by") || "Not specified"],
        ["Standard", report.standardLabel],
        ["Support Condition", "Internal supports only"],
        ["Generated", formatDateTime(generatedAtIso)]
      ],
      summaryRows: [
        ["Design Status", report.strength.pass ? "PASS" : "FAIL"],
        ["Support Type", report.criticalPerimeter.supportType],
        ["Utilisation", formatNumber(report.strength.utilisation, 3)],
        ["Maximum Face Check", formatPassFail(report.faceCheck.pass)],
        ["Minimum Shear Reinforcement", report.minimumReinforcementTrigger.required ? "YES" : "NO"],
        ["Detailing Compliance", formatPassFail(report.detailing.overallPass)]
      ],
      inputRows: [
        ["phi", formatNumber(report.inputs.phi, 2)],
        ["k_dg", formatNumber(report.inputs.kdg, 0)],
        ["D_s", formatNumber(report.inputs.slabThickness, 0) + " mm"],
        ["d_o", formatNumber(report.inputs.effectiveDepth, 0) + " mm"],
        ["d_om", formatNumber(report.inputs.meanEffectiveDepth, 0) + " mm"],
        ["d_v", formatNumber(report.inputs.shearDepth, 0) + " mm"],
        [
          report.inputs.supportType === "rectangular" ? "X, Y" : "D_col",
          report.inputs.supportType === "rectangular"
            ? formatNumber(report.inputs.supportX || 0, 0) + " mm, " + formatNumber(report.inputs.supportY || 0, 0) + " mm"
            : formatNumber(report.inputs.supportDiameter || 0, 0) + " mm"
        ],
        ["V_v*", formatNumber(report.inputs.designShear, 1) + " kN"],
        ["M_vx*", formatNumber(report.inputs.momentX, 1) + " kNm"],
        ["M_vy*", formatNumber(report.inputs.momentY, 1) + " kNm"],
        ["M_fx*", formatNumber(report.inputs.flexureMomentX || 0, 1) + " kNm"],
        ["M_fy*", formatNumber(report.inputs.flexureMomentY || 0, 1) + " kNm"],
        ["f'c", formatNumber(report.inputs.concreteStrength, 1) + " MPa"],
        ["sigma_cp", formatNumber(report.inputs.prestress, 2) + " MPa"],
        ["f_sy,f", formatNumber(report.inputs.shearReinforcementYield, 0) + " MPa"],
        ["A_sv", formatNumber(report.inputs.asv || 0, 1) + " mm²"],
        ["s", formatNumber(report.inputs.spacingRadial || 0, 0) + " mm"],
        ["s_t", formatNumber(report.inputs.spacingTransverse || 0, 0) + " mm"]
      ],
      resultRows: [
        ["V*", formatForceKilonewtons(report.demand.totalShearDemand)],
        ["V_uc", formatForceKilonewtons(report.concreteCapacity.vuc)],
        ["phiV_uc", formatForceKilonewtons(report.concreteCapacity.phiVuc)],
        ["V_us", formatForceKilonewtons(report.shearReinforcement.vus)],
        ["V_u", formatForceKilonewtons(report.strength.vu)],
        ["phiV_u", formatForceKilonewtons(report.strength.phiVu)]
      ],
      calculationRows: [
        ["u", formatNumber(report.criticalPerimeter.u, 0) + " mm"],
        ["u_face", formatNumber(report.criticalPerimeter.uFace, 0) + " mm"],
        ["b_l", formatNumber(report.criticalPerimeter.bl, 0) + " mm"],
        ["b_t", formatNumber(report.criticalPerimeter.bt, 0) + " mm"],
        ["M_vvx*", formatMomentKilonewtonMeters(report.momentTransfer.eccentricMomentX)],
        ["M_vvy*", formatMomentKilonewtonMeters(report.momentTransfer.eccentricMomentY)],
        ["J_x", formatNumber(report.momentTransfer.jx, 0) + " mm³"],
        ["J_y", formatNumber(report.momentTransfer.jy, 0) + " mm³"],
        ["y_x", formatNumber(report.momentTransfer.yx, 0) + " mm"],
        ["y_y", formatNumber(report.momentTransfer.yy, 0) + " mm"],
        ["v_base", formatNumber(report.demand.vBase, 3) + " N/mm"],
        ["v_mx", formatNumber(report.demand.vMx, 3) + " N/mm"],
        ["v_my", formatNumber(report.demand.vMy, 3) + " N/mm"],
        ["v*", formatNumber(report.demand.vStar, 3) + " N/mm"],
        ["beta_h", formatNumber(report.concreteCapacity.betaH, 3)],
        ["k_vucs", formatNumber(report.concreteCapacity.kvucsAdopted, 3)],
        ["f_cv", formatNumber(report.concreteCapacity.fcv, 3) + " MPa"],
        ["k_vuc", formatNumber(report.strength.kvuc, 3)],
        ["k_vs", formatNumber(report.minimumReinforcementTrigger.kvs, 3)],
        ["A_sv,min", formatNumber(report.shearReinforcement.asvMinimum, 1) + " mm²"],
        ["Spacing checks", "Radial " + formatPassFail(report.detailing.radialCheckPass) + ", Transverse " + formatPassFail(report.detailing.transverseCheckPass)],
        ["Extent check", formatPassFail(report.detailing.extentPass) + " (required >= " + formatNumber(report.detailing.extentRequired || 0, 0) + " mm)"]
      ],
      methodology: [
        "Critical perimeter geometry is derived for internal rectangular or circular supports only.",
        "Transferred moments are resolved into eccentric shear directly from M_v* - M_f* where available, otherwise the simplified AS 5100.5 Clause 9.2 expression is applied.",
        "Shear demand is evaluated from the sum of base shear flow and absolute biaxial moment-induced shear flow terms.",
        "Concrete strength, shear reinforcement contribution, maximum face shear, minimum shear reinforcement, and detailing checks are reported in design-force form."
      ],
      equations: [
        "V_u = k_vuc V_uc + V_us",
        "V_uc = u d_om (f_cv + 0.3 sigma_cp)",
        "v* = V_v*/u + |M_vvx* y_x / J_x| + |M_vvy* y_y / J_y|",
        "V_u,max = 0.2 u_face d_om f'c",
        "A_sv,min = 0.08 u s sqrt(f'c) / f_sy,f"
      ],
      assumptions: report.assumptions.length ? report.assumptions : ["No automatic depth assumptions were required."],
      disclaimer: [
        root.getAttribute("data-report-disclaimer") || "This report is generated automatically from user-entered data and should be reviewed by a qualified engineer.",
        "Edge supports, corner supports, slab openings, and irregular support shapes are outside the scope of this export.",
        "The engineer remains responsible for verifying the applicability of AS 5100.5 requirements, detailing provisions, load combinations, and constructability constraints."
      ],
      figures: figures
    };
  }

  async function buildWordReportDocument(reportData) {
    var docx = window.docx;
    var documentChildren = [];

    documentChildren.push(new docx.Paragraph({
      text: reportData.title,
      heading: docx.HeadingLevel.TITLE,
      spacing: { after: 120 }
    }));
    documentChildren.push(new docx.Paragraph({
      children: [new docx.TextRun({ text: "Professional engineering calculation sheet export", italics: true, color: "5D7682" })],
      spacing: { after: 220 }
    }));
    documentChildren.push(createWordTable("Report Metadata", "Value", reportData.metadata));
    documentChildren.push(createWordTable("Design Summary", "Value", reportData.summaryRows));
    documentChildren.push(createWordTable("Inputs", "Value", reportData.inputRows));
    documentChildren.push(createWordTable("Key Results", "Value", reportData.resultRows));
    documentChildren.push(new docx.Paragraph({ text: "", pageBreakBefore: true }));
    documentChildren.push(new docx.Paragraph({ text: "Governing Equations", heading: docx.HeadingLevel.HEADING_1, spacing: { after: 120 } }));
    reportData.equations.forEach(function (equation) {
      documentChildren.push(new docx.Paragraph({
        children: [new docx.TextRun({ text: equation, bold: true })],
        spacing: { after: 60 }
      }));
    });
    documentChildren.push(new docx.Paragraph({ text: "Methodology", heading: docx.HeadingLevel.HEADING_1, spacing: { before: 180, after: 120 } }));
    reportData.methodology.forEach(function (line) {
      documentChildren.push(new docx.Paragraph({ text: line, bullet: { level: 0 }, spacing: { after: 80 } }));
    });
    documentChildren.push(new docx.Paragraph({ text: "", pageBreakBefore: true }));
    documentChildren.push(new docx.Paragraph({ text: "Visualisation", heading: docx.HeadingLevel.HEADING_1, spacing: { after: 120 } }));
    (await createVisualisationParagraphs(reportData.figures)).forEach(function (paragraph) {
      documentChildren.push(paragraph);
    });
    documentChildren.push(new docx.Paragraph({ text: "", pageBreakBefore: true }));
    documentChildren.push(createWordTable("Calculation Item", "Value", reportData.calculationRows));
    documentChildren.push(new docx.Paragraph({ text: "Assumptions", heading: docx.HeadingLevel.HEADING_1, spacing: { before: 180, after: 120 } }));
    reportData.assumptions.forEach(function (line) {
      documentChildren.push(new docx.Paragraph({ text: line, bullet: { level: 0 }, spacing: { after: 60 } }));
    });
    documentChildren.push(new docx.Paragraph({ text: "Disclaimer", heading: docx.HeadingLevel.HEADING_1, spacing: { before: 180, after: 120 } }));
    reportData.disclaimer.forEach(function (line) {
      documentChildren.push(new docx.Paragraph({ text: line, spacing: { after: 80 } }));
    });

    return new docx.Document({
      creator: "Punching Shear Design",
      title: reportData.title,
      description: "Engineering punching shear calculation sheet export",
      sections: [{
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 720, right: 720, bottom: 720, left: 720 }
          }
        },
        footers: {
          default: new docx.Footer({
            children: [
              new docx.Paragraph({
                alignment: docx.AlignmentType.CENTER,
                children: [
                  new docx.TextRun({ text: "Page ", size: 18, color: "5D7682" }),
                  docx.PageNumber.CURRENT,
                  new docx.TextRun({ text: " of ", size: 18, color: "5D7682" }),
                  docx.PageNumber.TOTAL_PAGES
                ]
              })
            ]
          })
        },
        children: documentChildren
      }]
    });
  }

  function createWordTable(leftHeader, rightHeader, rows) {
    var docx = window.docx;
    var border = { style: docx.BorderStyle.SINGLE, size: 1, color: "D1DDE3" };

    function headerCell(text) {
      return new docx.TableCell({
        width: { size: 50, type: docx.WidthType.PERCENTAGE },
        shading: { fill: "DCEAF3" },
        children: [new docx.Paragraph({ children: [new docx.TextRun({ text: text, bold: true, color: "17313A" })] })]
      });
    }

    function bodyCell(text) {
      return new docx.TableCell({
        children: [new docx.Paragraph({ children: [new docx.TextRun({ text: String(text), color: "17313A" })] })],
        borders: { top: border, bottom: border, left: border, right: border }
      });
    }

    return new docx.Table({
      width: { size: 100, type: docx.WidthType.PERCENTAGE },
      layout: docx.TableLayoutType.FIXED,
      rows: [
        new docx.TableRow({ tableHeader: true, children: [headerCell(leftHeader), headerCell(rightHeader)] })
      ].concat((rows || []).map(function (row) {
        return new docx.TableRow({ children: [bodyCell(row[0]), bodyCell(row[1])] });
      }))
    });
  }

  async function createVisualisationSection(root) {
    var svg = root.querySelector('[data-role="diagram"]');
    if (!svg) {
      return [];
    }

    return [{
      caption: "Figure 1 - Engineering visualisation",
      image: await extractSvgAsPng(svg, 2)
    }];
  }

  async function createVisualisationParagraphs(figures) {
    var docx = window.docx;

    if (!figures.length) {
      return [new docx.Paragraph({ text: "No visualisations were available at export time." })];
    }

    return (await Promise.all(figures.map(async function (figure) {
      var fitted = fitImageWithinPage(figure.image.width, figure.image.height, 640);
      return [
        new docx.Paragraph({
          alignment: docx.AlignmentType.CENTER,
          spacing: { before: 80, after: 60 },
          children: [
            new docx.ImageRun({
              data: figure.image.data,
              type: "png",
              transformation: { width: fitted.width, height: fitted.height }
            })
          ]
        }),
        new docx.Paragraph({
          alignment: docx.AlignmentType.CENTER,
          spacing: { after: 160 },
          children: [new docx.TextRun({ text: figure.caption, italics: true, color: "5D7682" })]
        })
      ];
    }))).flat();
  }

  async function extractSvgAsPng(svgElement, scale) {
    var clonedSvg = svgElement.cloneNode(true);
    var viewBox = svgElement.viewBox.baseVal;
    var width = viewBox && viewBox.width ? viewBox.width : svgElement.clientWidth || Number(svgElement.getAttribute("width")) || 540;
    var height = viewBox && viewBox.height ? viewBox.height : svgElement.clientHeight || Number(svgElement.getAttribute("height")) || 420;
    var serializer = new XMLSerializer();
    var blob;
    var url;
    var image;
    var canvas;
    var context;
    var pngBlob;

    inlineSvgStyles(svgElement, clonedSvg);
    clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clonedSvg.setAttribute("width", String(width));
    clonedSvg.setAttribute("height", String(height));

    blob = new Blob([serializer.serializeToString(clonedSvg)], { type: "image/svg+xml;charset=utf-8" });
    url = URL.createObjectURL(blob);

    try {
      image = await loadImage(url);
      canvas = document.createElement("canvas");
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Unable to create canvas context for SVG export.");
      }

      context.setTransform(scale, 0, 0, scale, 0, 0);
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
      pngBlob = await canvasToBlob(canvas);

      return {
        data: new Uint8Array(await pngBlob.arrayBuffer()),
        width: canvas.width,
        height: canvas.height
      };
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function inlineSvgStyles(sourceNode, clonedNode) {
    var computedStyle = window.getComputedStyle(sourceNode);
    clonedNode.setAttribute("style", Array.from(computedStyle).map(function (property) {
      return property + ":" + computedStyle.getPropertyValue(property) + ";";
    }).join(""));

    Array.from(sourceNode.children).forEach(function (child, index) {
      if (clonedNode.children[index]) {
        inlineSvgStyles(child, clonedNode.children[index]);
      }
    });
  }

  function loadImage(url) {
    return new Promise(function (resolve, reject) {
      var image = new Image();
      image.onload = function () { resolve(image); };
      image.onerror = function () { reject(new Error("Unable to load image for Word export.")); };
      image.src = url;
    });
  }

  function canvasToBlob(canvas) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error("Unable to convert canvas to PNG blob."));
      }, "image/png");
    });
  }

  function fitImageWithinPage(width, height, maxWidth) {
    if (width <= maxWidth) {
      return { width: width, height: height };
    }

    var ratio = maxWidth / width;
    return { width: Math.round(width * ratio), height: Math.round(height * ratio) };
  }

  function formatFileStamp(isoString) {
    var date = new Date(isoString);
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, "0");
    var day = String(date.getDate()).padStart(2, "0");
    var hours = String(date.getHours()).padStart(2, "0");
    var minutes = String(date.getMinutes()).padStart(2, "0");
    return year + "-" + month + "-" + day + "_" + hours + minutes;
  }

  function triggerDownload(blob, fileName) {
    var url = window.URL.createObjectURL(blob);
    var anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(function () {
      window.URL.revokeObjectURL(url);
    }, 1000);
  }

  function boot() {
    document.querySelectorAll('.et-tool[data-et-tool="' + TOOL_SLUG + '"]').forEach(function (root, index) {
      if (root.dataset.etInitialised === "true") {
        return;
      }

      root.dataset.etInitialised = "true";
      new PunchingShearTool(root, index).init();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  document.addEventListener("engineering-tools:ready", boot);
}());
