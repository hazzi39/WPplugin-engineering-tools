(function () {
  "use strict";

  var TOOL_SLUG = "concrete-shear-strength";
  var STORAGE_PREFIX = "engineering-tools-concrete-shear-strength-v1";
  var FIELD_RULES = {
    "v-star": { label: "V*", min: 0, max: 20000, allowZero: true },
    "m-star": { label: "M*", min: 0, max: 10000, allowZero: true },
    "n-star": { label: "N*", min: -20000, max: 20000, allowZero: true },
    "p-v": { label: "Pv", min: 0, max: 5000, allowZero: true },
    "gamma-p": { label: "γp", min: 0, max: 1.2, allowZero: true },
    "b-v": { label: "bv", min: 100, max: 4000 },
    "d-v": { label: "dv", min: 100, max: 4000 },
    "d-g": { label: "dg", min: 0, max: 63, allowZero: true },
    "f-c": { label: "f'c", min: 20, max: 100 },
    "longitudinal-bar-count": { label: "Longitudinal bar count", min: 2, max: 24, integer: true },
    "longitudinal-bar-diameter": { label: "Longitudinal bar diameter", min: 10, max: 50 },
    "a-pt": { label: "Apt", min: 0, max: 80000, allowZero: true },
    "f-po": { label: "fpo", min: 0, max: 2000, allowZero: true },
    "e-s": { label: "Es", min: 100000, max: 250000 },
    "e-p": { label: "Ep", min: 100000, max: 250000 },
    "stirrup-sets": { label: "Shear reinforcement sets", min: 1, max: 8, integer: true },
    "leg-count": { label: "Effective shear legs", min: 1, max: 8, integer: true },
    "bar-diameter": { label: "Shear bar diameter", min: 6, max: 40 },
    "s": { label: "Spacing s", min: 50, max: 1000 },
    "f-syf": { label: "fsy,f", min: 200, max: 750 },
    "alpha-v": { label: "αv", min: 1, max: 90 }
  };

  function getUtils() {
    return window.EngineeringTools && window.EngineeringTools.utils ? window.EngineeringTools.utils : null;
  }

  function parseNumber(value) {
    var trimmed = String(value === undefined || value === null ? "" : value).trim();
    if (trimmed === "") {
      return null;
    }

    var utils = getUtils();
    if (utils && typeof utils.parseNumber === "function") {
      var parsedFromUtils = utils.parseNumber(trimmed, null);
      return Number.isFinite(parsedFromUtils) ? parsedFromUtils : null;
    }

    var parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
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

  function formatDateTime(value) {
    return new Date(value).toLocaleString("en-AU", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
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

  function ConcreteShearStrengthTool(root, index) {
    this.root = root;
    this.index = index;
    this.storageKey = STORAGE_PREFIX + "::" + window.location.pathname + "::" + index;
    this.savedResults = readStorage(this.storageKey);
    this.lastState = null;
    this.fields = {};
    this.outputs = {};
    this.actions = {};
    this.panels = {};
    this.panelLabels = {};
    this.diagram = null;
    this.savedResultsBody = null;
  }

  ConcreteShearStrengthTool.prototype.init = function () {
    this.captureNodes();
    this.bindEvents();
    this.renderSavedResults();
    this.renderEquationsPlaceholder();
    this.update();
  };

  ConcreteShearStrengthTool.prototype.captureNodes = function () {
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

    this.panelLabels.secondary = this.root.querySelector('[data-role="secondary-toggle-label"]');
    this.panelLabels.equations = this.root.querySelector('[data-role="equation-toggle-label"]');
    this.diagram = this.root.querySelector('[data-role="diagram"]');
    this.savedResultsBody = this.root.querySelector('[data-role="saved-results"]');
    this.checksList = this.root.querySelector('[data-role="checks-list"]');
    this.heroCard = this.root.querySelector('[data-role="hero-card"]');
  };

  ConcreteShearStrengthTool.prototype.bindEvents = function () {
    var self = this;

    Object.keys(this.fields).forEach(function (key) {
      var field = self.fields[key];
      field.addEventListener("input", function () {
        self.update();
      });
      field.addEventListener("change", function () {
        self.update();
      });
    });

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

    if (this.actions["clear-results"]) {
      this.actions["clear-results"].addEventListener("click", function () {
        self.savedResults = [];
        writeStorage(self.storageKey, self.savedResults);
        self.renderSavedResults();
      });
    }

    if (this.actions["toggle-secondary"]) {
      this.actions["toggle-secondary"].addEventListener("click", function () {
        self.togglePanel("secondary");
      });
    }

    if (this.actions["toggle-equations"]) {
      this.actions["toggle-equations"].addEventListener("click", function () {
        self.togglePanel("equations");
      });
    }
  };

  ConcreteShearStrengthTool.prototype.togglePanel = function (name) {
    var panel = this.panels[name];
    if (!panel) {
      return;
    }

    var isCollapsed = panel.classList.toggle("is-collapsed");
    var button = this.actions["toggle-" + name];
    if (button) {
      button.setAttribute("aria-expanded", isCollapsed ? "false" : "true");
    }

    if (this.panelLabels[name]) {
      this.panelLabels[name].textContent = isCollapsed ? "Show" : "Hide";
    }
  };

  ConcreteShearStrengthTool.prototype.resetForm = function () {
    var defaults = {
      "v-star": "400",
      "m-star": "25",
      "n-star": "50",
      "p-v": "0",
      "gamma-p": "1.00",
      "b-v": "600",
      "d-v": "800",
      "d-g": "20",
      "f-c": "40",
      "longitudinal-bar-count": "4",
      "longitudinal-bar-diameter": "32",
      "a-pt": "0",
      "f-po": "0",
      "e-s": "200000",
      "e-p": "195000",
      "stirrup-sets": "1",
      "leg-count": "2",
      "bar-diameter": "12",
      "s": "300",
      "f-syf": "500",
      "alpha-v": "90"
    };

    Object.keys(defaults).forEach(function (key) {
      if (this.fields[key]) {
        this.fields[key].value = defaults[key];
      }
    }, this);

    this.update();
  };

  ConcreteShearStrengthTool.prototype.readInputs = function () {
    return {
      vStar: parseNumber(this.fields["v-star"].value),
      mStar: parseNumber(this.fields["m-star"].value),
      nStar: parseNumber(this.fields["n-star"].value),
      pV: parseNumber(this.fields["p-v"].value),
      gammaP: parseNumber(this.fields["gamma-p"].value),
      bV: parseNumber(this.fields["b-v"].value),
      dV: parseNumber(this.fields["d-v"].value),
      dG: parseNumber(this.fields["d-g"].value),
      fC: parseNumber(this.fields["f-c"].value),
      longitudinalBarCount: parseNumber(this.fields["longitudinal-bar-count"].value),
      longitudinalBarDiameter: parseNumber(this.fields["longitudinal-bar-diameter"].value),
      aPt: parseNumber(this.fields["a-pt"].value),
      fPo: parseNumber(this.fields["f-po"].value),
      eS: parseNumber(this.fields["e-s"].value),
      eP: parseNumber(this.fields["e-p"].value),
      stirrupSets: parseNumber(this.fields["stirrup-sets"].value),
      legCount: parseNumber(this.fields["leg-count"].value),
      barDiameter: parseNumber(this.fields["bar-diameter"].value),
      spacing: parseNumber(this.fields["s"].value),
      fSyF: parseNumber(this.fields["f-syf"].value),
      alphaV: parseNumber(this.fields["alpha-v"].value)
    };
  };

  ConcreteShearStrengthTool.prototype.validateInputs = function (raw) {
    var errors = {};
    var values = {};

    Object.keys(FIELD_RULES).forEach(function (fieldName) {
      var meta = FIELD_RULES[fieldName];
      var value = selfValue(raw, fieldName);

      if (value === null) {
        errors[fieldName] = meta.label + " is required.";
        return;
      }

      if (!meta.allowZero && value <= 0) {
        errors[fieldName] = meta.label + " must be greater than zero.";
        return;
      }

      if (value < meta.min || value > meta.max) {
        errors[fieldName] = meta.label + " must be between " + meta.min + " and " + meta.max + ".";
        return;
      }

      if (meta.integer && Math.round(value) !== value) {
        errors[fieldName] = meta.label + " must be a whole number.";
        return;
      }

      values[fieldName] = value;
    });

    var singleLongitudinalBarArea = Math.PI * Math.pow(raw.longitudinalBarDiameter || 0, 2) / 4;
    var aSt = (raw.longitudinalBarCount || 0) * singleLongitudinalBarArea;

    if (((raw.eS || 0) * aSt) + ((raw.eP || 0) * (raw.aPt || 0)) <= 0) {
      errors["longitudinal-bar-count"] = "Longitudinal stiffness must be greater than zero.";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors: errors,
      values: raw
    };
  };

  ConcreteShearStrengthTool.prototype.updateValidationUI = function (errors) {
    var self = this;

    this.root.querySelectorAll("[data-error-for]").forEach(function (node) {
      var key = node.getAttribute("data-error-for");
      node.textContent = errors[key] || "";
      var field = self.fields[key];
      var shell = field ? field.closest(".et-css__control") : null;
      if (shell) {
        shell.classList.toggle("has-error", Boolean(errors[key]));
      }
    });
  };

  ConcreteShearStrengthTool.prototype.calculate = function (inputs) {
    var vStarN = inputs.vStar * 1000;
    var pVN = inputs.pV * 1000;
    var nStarN = inputs.nStar * 1000;
    var mStarNmm = inputs.mStar * 1000000;
    var alphaVRad = inputs.alphaV * Math.PI / 180;
    var singleLongitudinalBarArea = Math.PI * Math.pow(inputs.longitudinalBarDiameter, 2) / 4;
    var aSt = inputs.longitudinalBarCount * singleLongitudinalBarArea;
    var kDg = Math.max(32 / (16 + inputs.dG), 0.8);
    var longitudinalStiffness = 2 * ((inputs.eS * aSt) + (inputs.eP * inputs.aPt));
    var epsilonX = (
      Math.abs(mStarNmm / inputs.dV) +
      Math.abs(vStarN) -
      inputs.gammaP * pVN +
      0.5 * nStarN -
      inputs.aPt * inputs.fPo
    ) / longitudinalStiffness;

    epsilonX = Math.max(Math.min(epsilonX, 0.003), 0);

    var thetaV = 29 + 7000 * epsilonX;
    var thetaVRad = thetaV * Math.PI / 180;
    var kvLimit = 0.4 / (1 + 1500 * epsilonX);
    var kV = Math.min(
      kvLimit * (1300 / (1000 + kDg * inputs.dV)),
      kvLimit
    );
    var singleShearBarArea = Math.PI * Math.pow(inputs.barDiameter, 2) / 4;
    var aSv = inputs.stirrupSets * inputs.legCount * singleShearBarArea;
    var aSvMin = 0.08 * Math.sqrt(inputs.fC) * inputs.bV * inputs.spacing / inputs.fSyF;
    var concreteStrength = Math.sqrt(Math.min(inputs.fC, 64));
    var vUc = kV * concreteStrength * inputs.bV * inputs.dV;
    var vUs = ((aSv * inputs.fSyF * inputs.dV) / inputs.spacing) * (
      Math.sin(alphaVRad) * (1 / Math.tan(thetaVRad)) + Math.cos(alphaVRad)
    );
    var phiVu = 0.85 * (vUc + vUs);
    var netDemand = Math.max(inputs.vStar - inputs.gammaP * inputs.pV, 0);
    var utilization = netDemand / (phiVu / 1000);
    var reserve = phiVu / 1000 - netDemand;

    return {
      inputs: inputs,
      phiVu: phiVu / 1000,
      vUc: vUc / 1000,
      vUs: vUs / 1000,
      aSt: aSt,
      singleLongitudinalBarArea: singleLongitudinalBarArea,
      aSv: aSv,
      singleShearBarArea: singleShearBarArea,
      kV: kV,
      epsilonX: epsilonX,
      kDg: kDg,
      thetaV: thetaV,
      aSvMin: aSvMin,
      netDemand: netDemand,
      utilization: utilization,
      reserve: reserve,
      concreteStrength: concreteStrength,
      longitudinalStiffness: longitudinalStiffness,
      checks: [
        {
          state: reserve >= 0 ? "pass" : "fail",
          title: "Strength requirement",
          detail: "ϕVu " + formatNumber(phiVu / 1000, 1) + " kN vs demand " + formatNumber(netDemand, 1) + " kN"
        },
        {
          state: aSv >= aSvMin ? "pass" : "warn",
          title: "Minimum shear reinforcement",
          detail: "Asv " + formatNumber(aSv, 0) + " mm² vs Asv,min " + formatNumber(aSvMin, 0) + " mm²"
        },
        {
          state: aSt > 0 ? "pass" : "fail",
          title: "Longitudinal reinforcement",
          detail: "Ast " + formatNumber(aSt, 0) + " mm² from " + formatNumber(inputs.longitudinalBarCount, 0) + " bars of ϕ" + formatNumber(inputs.longitudinalBarDiameter, 0)
        },
        {
          state: thetaV >= 29 && thetaV <= 50 ? "pass" : "warn",
          title: "Compression field angle",
          detail: "θv = " + formatNumber(thetaV, 2) + "° from εx = " + formatNumber(epsilonX, 6)
        }
      ]
    };
  };

  ConcreteShearStrengthTool.prototype.renderEquations = function (result) {
    if (!window.katex || typeof window.katex.render !== "function") {
      return;
    }

    var primaryNode = this.root.querySelector('[data-role="equation-primary"]');
    var secondaryNode = this.root.querySelector('[data-role="equation-secondary"]');

    if (!primaryNode || !secondaryNode) {
      return;
    }

    window.katex.render(String.raw`\phi V_u \ge V^\* - \gamma_p P_v = ` + formatNumber(result.netDemand, 2) + String.raw`\ \text{kN}`, primaryNode, {
      displayMode: true,
      throwOnError: false
    });

    window.katex.render(String.raw`\begin{aligned}
    A_{st} &= n_b \left(\frac{\pi \phi_s^2}{4}\right) = ` + formatNumber(result.aSt, 2) + String.raw`\ \text{mm}^2 \\
    A_{sv} &= n_s n_l \left(\frac{\pi \phi_v^2}{4}\right) = ` + formatNumber(result.aSv, 2) + String.raw`\ \text{mm}^2 \\
    V_{uc} &= k_v \sqrt{f'_c}\, b_v d_v = ` + formatNumber(result.vUc, 2) + String.raw`\ \text{kN} \\
    V_{us} &= \frac{A_{sv} f_{sy.f} d_v}{s}\left(\sin \alpha_v \cot \theta_v + \cos \alpha_v\right) = ` + formatNumber(result.vUs, 2) + String.raw`\ \text{kN}
    \end{aligned}`, secondaryNode, {
      displayMode: true,
      throwOnError: false
    });
  };

  ConcreteShearStrengthTool.prototype.renderEquationsPlaceholder = function () {
    if (!window.katex || typeof window.katex.render !== "function") {
      return;
    }

    var primaryNode = this.root.querySelector('[data-role="equation-primary"]');
    var secondaryNode = this.root.querySelector('[data-role="equation-secondary"]');

    if (!primaryNode || !secondaryNode) {
      return;
    }

    window.katex.render(String.raw`\phi V_u \ge V^\* - \gamma_p P_v`, primaryNode, {
      displayMode: true,
      throwOnError: false
    });

    window.katex.render(String.raw`A_{st},\ A_{sv},\ V_{uc},\ \text{and}\ V_{us}\ \text{will appear here when inputs are valid.}`, secondaryNode, {
      displayMode: true,
      throwOnError: false
    });
  };

  ConcreteShearStrengthTool.prototype.renderInvalid = function () {
    this.lastState = null;
    this.outputs["visual-status"].textContent = "Awaiting valid inputs";
    this.outputs["status-pill"].textContent = "No result";
    this.outputs["status-pill"].removeAttribute("data-tone");
    this.heroCard.setAttribute("data-tone", "idle");
    this.outputs["phi-vu"].textContent = "--";
    this.outputs["hero-note"].textContent = "Resolve the highlighted input issues to enable the design calculation.";
    this.outputs["net-demand"].textContent = "--";
    this.outputs["vuc"].textContent = "--";
    this.outputs["vus"].textContent = "--";
    this.outputs["asv-min"].textContent = "--";
    this.outputs["a-st"].textContent = "--";
    this.outputs["a-sv"].textContent = "--";
    this.outputs["single-longitudinal-area"].textContent = "--";
    this.outputs["single-shear-area"].textContent = "--";
    this.outputs["k-v"].textContent = "--";
    this.outputs["epsilon-x"].textContent = "--";
    this.outputs["k-dg"].textContent = "--";
    this.outputs["theta-v"].textContent = "--";
    this.outputs["sqrt-fc"].textContent = "--";
    this.outputs["longitudinal-stiffness"].textContent = "--";
    this.actions["save-result"].disabled = true;
    this.renderEquationsPlaceholder();
    this.drawEmptyDiagram();
  };

  ConcreteShearStrengthTool.prototype.renderOutputs = function (result) {
    var tone = result.reserve >= 0 ? "pass" : "fail";
    var utilizationTone = result.reserve >= 0 ? "pass" : "fail";

    this.outputs["visual-status"].textContent = result.reserve >= 0
      ? "Capacity reserve " + formatNumber(result.reserve, 1) + " kN"
      : "Shortfall " + formatNumber(Math.abs(result.reserve), 1) + " kN";
    this.outputs["visual-status"].setAttribute("data-tone", tone);
    this.outputs["status-pill"].textContent = result.reserve >= 0
      ? "Utilisation " + formatNumber(result.utilization * 100, 1) + "%"
      : "Overstressed " + formatNumber(result.utilization * 100, 1) + "%";
    this.outputs["status-pill"].setAttribute("data-tone", utilizationTone);
    this.heroCard.setAttribute("data-tone", tone);
    this.outputs["phi-vu"].textContent = formatNumber(result.phiVu, 2) + " kN";
    this.outputs["hero-note"].textContent = result.reserve >= 0
      ? "The calculated design shear strength exceeds the net applied demand."
      : "The net applied demand exceeds the current design shear strength.";
    this.outputs["net-demand"].textContent = formatNumber(result.netDemand, 2) + " kN";
    this.outputs["vuc"].textContent = formatNumber(result.vUc, 2) + " kN";
    this.outputs["vus"].textContent = formatNumber(result.vUs, 2) + " kN";
    this.outputs["asv-min"].textContent = formatNumber(result.aSvMin, 0) + " mm²";
    this.outputs["a-st"].textContent = formatNumber(result.aSt, 0) + " mm²";
    this.outputs["a-sv"].textContent = formatNumber(result.aSv, 0) + " mm²";
    this.outputs["single-longitudinal-area"].textContent = formatNumber(result.singleLongitudinalBarArea, 1) + " mm²";
    this.outputs["single-shear-area"].textContent = formatNumber(result.singleShearBarArea, 1) + " mm²";
    this.outputs["k-v"].textContent = formatNumber(result.kV, 4);
    this.outputs["epsilon-x"].textContent = formatNumber(result.epsilonX, 6);
    this.outputs["k-dg"].textContent = formatNumber(result.kDg, 3);
    this.outputs["theta-v"].textContent = formatNumber(result.thetaV, 2) + "°";
    this.outputs["sqrt-fc"].textContent = formatNumber(result.concreteStrength, 3);
    this.outputs["longitudinal-stiffness"].textContent = formatNumber(result.longitudinalStiffness, 0);
    this.renderChecks(result.checks);
    this.renderEquations(result);
    this.drawDiagram(result);
    this.actions["save-result"].disabled = false;
  };

  ConcreteShearStrengthTool.prototype.renderChecks = function (checks) {
    this.checksList.innerHTML = checks.map(function (check) {
      return [
        '<li class="et-css__check-item et-css__check-item--', check.state, '">',
        '<strong>', escapeHtml(check.title), '</strong>',
        '<p>', escapeHtml(check.detail), '</p>',
        '</li>'
      ].join("");
    }).join("");
  };

  ConcreteShearStrengthTool.prototype.drawEmptyDiagram = function () {
    this.diagram.innerHTML = [
      '<rect x="0" y="0" width="640" height="420" fill="#f8fbff"></rect>',
      '<g stroke="rgba(37,99,235,0.07)" stroke-width="1">',
      buildGridLines(640, 420, 24),
      '</g>',
      '<text x="320" y="205" text-anchor="middle" class="et-css__diagram-empty">Awaiting valid inputs</text>',
      '<text x="320" y="228" text-anchor="middle" class="et-css__diagram-empty">Complete the required fields to draw the section.</text>'
    ].join("");
  };

  ConcreteShearStrengthTool.prototype.drawDiagram = function (result) {
    var inputs = result.inputs;
    var bV = clamp(inputs.bV, 100, 4000);
    var dV = clamp(inputs.dV, 100, 4000);
    var alphaV = clamp(inputs.alphaV, 1, 90);
    var thetaV = clamp(result.thetaV, 20, 65);
    var spacing = clamp(inputs.spacing, 50, 1000);
    var longitudinalBarCount = clamp(inputs.longitudinalBarCount, 2, 24);
    var longitudinalBarDiameter = clamp(inputs.longitudinalBarDiameter, 10, 50);
    var aSt = result.aSt;
    var legCount = clamp(inputs.legCount, 1, 8);
    var stirrupSets = clamp(inputs.stirrupSets, 1, 8);
    var barDiameter = clamp(inputs.barDiameter, 6, 40);
    var demand = clamp(result.netDemand, 0, 2000);

    var scale = Math.min(250 / bV, 210 / dV);
    var width = bV * scale;
    var height = dV * scale;
    var originX = 120;
    var originY = 94;
    var centerX = originX + width / 2;
    var centerY = originY + height / 2;
    var stirrupCount = Math.max(1, Math.min(legCount, 8));
    var bottomBarCount = Math.max(2, Math.min(longitudinalBarCount, 24));
    var shearArrowLength = 70 + (demand / 2000) * 70;

    var bars = Array.from({ length: bottomBarCount }, function (_, index) {
      var x = originX + ((index + 1) * width) / (bottomBarCount + 1);
      var radius = clamp(longitudinalBarDiameter * 0.28, 4.5, 8.5);
      return '<circle class="et-css__diagram-bar" cx="' + x + '" cy="' + (originY + height - 18) + '" r="' + radius + '" />';
    }).join("");

    var stirrups = Array.from({ length: stirrupCount }, function (_, index) {
      var x = originX + 26 + (index * (width - 52)) / Math.max(stirrupCount - 1, 1);
      return '<path class="et-css__diagram-stirrup" d="M ' + x + " " + (originY + 18) + " L " + x + " " + (originY + height - 26) + '" />';
    }).join("");

    this.diagram.innerHTML = [
      '<defs>',
      '<marker id="et-css-arrow-end" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">',
      '<path d="M 0 0 L 10 5 L 0 10 z" fill="#1778d6"></path>',
      '</marker>',
      '<marker id="et-css-arrow-start" markerWidth="10" markerHeight="10" refX="2" refY="5" orient="auto" markerUnits="strokeWidth">',
      '<path d="M 10 0 L 0 5 L 10 10 z" fill="#7096af"></path>',
      '</marker>',
      "</defs>",
      '<rect x="0" y="0" width="640" height="420" fill="#f8fbff"></rect>',
      '<g stroke="rgba(37,99,235,0.07)" stroke-width="1">',
      buildGridLines(640, 420, 24),
      "</g>",
      '<line class="et-css__diagram-axis" x1="' + centerX + '" y1="' + (originY - 36) + '" x2="' + centerX + '" y2="' + (originY + height + 36) + '" />',
      '<line class="et-css__diagram-axis" x1="' + (originX - 36) + '" y1="' + centerY + '" x2="' + (originX + width + 200) + '" y2="' + centerY + '" />',
      '<rect class="et-css__diagram-outline" x="' + originX + '" y="' + originY + '" width="' + width + '" height="' + height + '" rx="22" />',
      stirrups,
      bars,
      '<line class="et-css__diagram-arrow" x1="' + (originX - 58) + '" y1="' + (originY + height - 16) + '" x2="' + (originX - 58) + '" y2="' + (originY + height - 16 - shearArrowLength) + '" />',
      '<text class="et-css__diagram-label" x="' + (originX - 86) + '" y="' + (originY + height - shearArrowLength - 30) + '">V*</text>',
      '<line class="et-css__diagram-arrow" x1="' + (originX + width + 78) + '" y1="' + (originY + height - 10) + '" x2="' + (originX + width + 78) + '" y2="' + (originY + height - 92) + '" />',
      '<text class="et-css__diagram-label" x="' + (originX + width + 62) + '" y="' + (originY + height - 108) + '">P<tspan baseline-shift="sub">v</tspan></text>',
      '<line class="et-css__diagram-dim" x1="' + originX + '" y1="' + (originY + height + 42) + '" x2="' + (originX + width) + '" y2="' + (originY + height + 42) + '" />',
      '<text class="et-css__diagram-label" x="' + (centerX - 16) + '" y="' + (originY + height + 70) + '">b<tspan baseline-shift="sub">v</tspan></text>',
      '<text class="et-css__diagram-caption" x="' + (centerX - 34) + '" y="' + (originY + height + 90) + '">' + escapeHtml(formatNumber(bV, 0)) + " mm</text>",
      '<line class="et-css__diagram-dim" x1="' + (originX + width + 34) + '" y1="' + originY + '" x2="' + (originX + width + 34) + '" y2="' + (originY + height) + '" />',
      '<text class="et-css__diagram-label" x="' + (originX + width + 48) + '" y="' + (originY + 18) + '">d<tspan baseline-shift="sub">v</tspan></text>',
      '<text class="et-css__diagram-caption" x="' + (originX + width + 48) + '" y="' + (originY + 38) + '">' + escapeHtml(formatNumber(dV, 0)) + " mm</text>",
      '<circle cx="' + centerX + '" cy="' + centerY + '" r="4.5" fill="#2f5d7d" />',
      '<text class="et-css__diagram-caption" x="' + (centerX + 12) + '" y="' + (centerY - 8) + '">centroid</text>',
      '<text class="et-css__diagram-label" x="' + (originX + width + 18) + '" y="' + (originY + 164) + '">θ<tspan baseline-shift="sub">v</tspan> = ' + escapeHtml(formatNumber(thetaV, 1)) + '°</text>',
      '<text class="et-css__diagram-label" x="' + (originX + width + 18) + '" y="' + (originY + 188) + '">α<tspan baseline-shift="sub">v</tspan> = ' + escapeHtml(formatNumber(alphaV, 0)) + '°</text>',
      '<text class="et-css__diagram-caption" x="' + (originX + 16) + '" y="' + (originY - 6) + '">' + escapeHtml(formatNumber(stirrupSets, 0)) + " set × " + escapeHtml(formatNumber(legCount, 0)) + " legs × ϕ" + escapeHtml(formatNumber(barDiameter, 0)) + " @ " + escapeHtml(formatNumber(spacing, 0)) + " mm</text>",
      '<text class="et-css__diagram-caption" x="' + (originX + 16) + '" y="' + (originY + height + 118) + '">' + escapeHtml(formatNumber(longitudinalBarCount, 0)) + " bars × ϕ" + escapeHtml(formatNumber(longitudinalBarDiameter, 0)) + " → A<tspan baseline-shift=\"sub\">st</tspan> = " + escapeHtml(formatNumber(aSt, 0)) + " mm²</text>"
    ].join("");
  };

  ConcreteShearStrengthTool.prototype.renderSavedResults = function () {
    if (!this.savedResults.length) {
      this.savedResultsBody.innerHTML = '<tr><td class="et-css__empty-row" colspan="8">No saved scenarios yet.</td></tr>';
      return;
    }

    this.savedResultsBody.innerHTML = this.savedResults.map(function (row) {
      return [
        "<tr>",
        "<td>", escapeHtml(formatDateTime(row.timestamp)), "</td>",
        "<td>", escapeHtml(row.section), "</td>",
        "<td>", escapeHtml(row.longitudinal), "</td>",
        "<td>", escapeHtml(row.reinforcement), "</td>",
        "<td>", escapeHtml(row.phiVu), "</td>",
        "<td>", escapeHtml(row.demand), "</td>",
        "<td>", escapeHtml(row.utilisation), "</td>",
        "<td>", escapeHtml(row.status), "</td>",
        "</tr>"
      ].join("");
    }).join("");
  };

  ConcreteShearStrengthTool.prototype.saveCurrentResult = function () {
    if (!this.lastState) {
      return;
    }

    var result = this.lastState.result;
    this.savedResults.unshift({
      timestamp: this.lastState.timestamp,
      section: "bv " + formatNumber(result.inputs.bV, 0) + " mm · dv " + formatNumber(result.inputs.dV, 0) + " mm · f'c " + formatNumber(result.inputs.fC, 0) + " MPa",
      longitudinal: formatNumber(result.inputs.longitudinalBarCount, 0) + " bars × ϕ" + formatNumber(result.inputs.longitudinalBarDiameter, 0) + " → Ast " + formatNumber(result.aSt, 0) + " mm²",
      reinforcement: formatNumber(result.inputs.stirrupSets, 0) + " set × " + formatNumber(result.inputs.legCount, 0) + " legs × ϕ" + formatNumber(result.inputs.barDiameter, 0) + " → Asv " + formatNumber(result.aSv, 0) + " mm² @ " + formatNumber(result.inputs.spacing, 0) + " mm",
      phiVu: formatNumber(result.phiVu, 2) + " kN",
      demand: formatNumber(result.netDemand, 2) + " kN",
      utilisation: formatNumber(result.utilization * 100, 1) + "%",
      status: result.reserve >= 0 ? "PASS" : "FAIL"
    });

    writeStorage(this.storageKey, this.savedResults);
    this.renderSavedResults();
  };

  ConcreteShearStrengthTool.prototype.update = function () {
    var raw = this.readInputs();
    var validation = this.validateInputs(raw);
    this.updateValidationUI(validation.errors);

    if (!validation.isValid) {
      this.renderInvalid();
      return;
    }

    var result = this.calculate(validation.values);
    this.lastState = {
      timestamp: new Date().toISOString(),
      result: result
    };
    this.renderOutputs(result);
  };

  function selfValue(raw, fieldName) {
    var map = {
      "v-star": raw.vStar,
      "m-star": raw.mStar,
      "n-star": raw.nStar,
      "p-v": raw.pV,
      "gamma-p": raw.gammaP,
      "b-v": raw.bV,
      "d-v": raw.dV,
      "d-g": raw.dG,
      "f-c": raw.fC,
      "longitudinal-bar-count": raw.longitudinalBarCount,
      "longitudinal-bar-diameter": raw.longitudinalBarDiameter,
      "a-pt": raw.aPt,
      "f-po": raw.fPo,
      "e-s": raw.eS,
      "e-p": raw.eP,
      "stirrup-sets": raw.stirrupSets,
      "leg-count": raw.legCount,
      "bar-diameter": raw.barDiameter,
      "s": raw.spacing,
      "f-syf": raw.fSyF,
      "alpha-v": raw.alphaV
    };

    return map[fieldName];
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

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function boot() {
    document.querySelectorAll('.et-tool[data-et-tool="' + TOOL_SLUG + '"]').forEach(function (root, index) {
      if (root.dataset.etInitialised === "true") {
        return;
      }

      root.dataset.etInitialised = "true";
      new ConcreteShearStrengthTool(root, index).init();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  document.addEventListener("engineering-tools:ready", boot);
}());
