(function () {
  "use strict";

  var TOOL_SLUG = "pad-footing-bearing";
  var STORAGE_PREFIX = "engineering-tools-pad-footing-bearing-v1";
  var FIELD_RULES = {
    P: { label: "Axial load P", min: 0.1, max: 1000000, allowZero: false },
    M: { label: "Moment M", min: 0, max: 1000000, allowZero: true },
    B: { label: "Footing width B", min: 0.1, max: 100, allowZero: false },
    D: { label: "Footing length D", min: 0.1, max: 100, allowZero: false }
  };
  var INPUT_DEFINITIONS = {
    P: { math: "P" },
    M: { math: "M" },
    B: { math: "B" },
    D: { math: "D" }
  };

  function getUtils() {
    return window.EngineeringTools && window.EngineeringTools.utils ? window.EngineeringTools.utils : null;
  }

  function parseNumber(value) {
    var utils = getUtils();
    if (utils && typeof utils.parseNumber === "function") {
      return utils.parseNumber(value, null);
    }

    var parsed = Number(value);
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

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function nearlyEqual(a, b, tolerance) {
    return Math.abs(a - b) <= (tolerance || 1e-9);
  }

  function uniqueId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }

    return "et-pfb-" + Date.now() + "-" + Math.floor(Math.random() * 100000);
  }

  function fitImageWithinPage(width, height, maxWidth) {
    if (width <= maxWidth) {
      return { width: width, height: height };
    }

    var scale = maxWidth / width;
    return {
      width: Math.round(width * scale),
      height: Math.round(height * scale)
    };
  }

  function formatFileStamp(isoString) {
    var date = new Date(isoString);
    var pad = function (value) {
      return String(value).padStart(2, "0");
    };

    return [
      date.getFullYear(),
      "-",
      pad(date.getMonth() + 1),
      "-",
      pad(date.getDate()),
      "_",
      pad(date.getHours()),
      pad(date.getMinutes())
    ].join("");
  }

  function readStorage(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      if (!raw) {
        return fallback;
      }

      return JSON.parse(raw);
    } catch (error) {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // Ignore storage failures.
    }
  }

  function renderKatex(node, expression, displayMode) {
    if (!node) {
      return;
    }

    if (window.katex && typeof window.katex.render === "function") {
      window.katex.render(expression, node, {
        throwOnError: false,
        displayMode: Boolean(displayMode)
      });
      return;
    }

    node.textContent = expression;
  }

  function PadFootingBearingTool(root, index) {
    this.root = root;
    this.index = index;
    this.scope = root.getAttribute("data-et-storage-scope") || ("instance-" + index);
    this.formStorageKey = STORAGE_PREFIX + "::form::" + this.scope;
    this.resultsStorageKey = STORAGE_PREFIX + "::results::" + this.scope;
    this.fields = {};
    this.outputs = {};
    this.actions = {};
    this.panels = {};
    this.roles = {};
    this.savedResults = readStorage(this.resultsStorageKey, []);
    this.lastState = null;
  }

  PadFootingBearingTool.prototype.init = function () {
    this.captureNodes();
    this.bindEvents();
    this.renderEquations();
    this.restoreFormState();
    this.renderSavedResults();
    this.update();
  };

  PadFootingBearingTool.prototype.captureNodes = function () {
    var self = this;

    this.root.querySelectorAll("[data-et-field]").forEach(function (node) {
      self.fields[node.getAttribute("data-et-field")] = node;
    });

    this.root.querySelectorAll("[data-et-output]").forEach(function (node) {
      self.outputs[node.getAttribute("data-et-output")] = node;
    });

    this.root.querySelectorAll("[data-et-action]").forEach(function (node) {
      self.actions[node.getAttribute("data-et-action")] = node;
    });

    this.root.querySelectorAll("[data-et-panel]").forEach(function (node) {
      self.panels[node.getAttribute("data-et-panel")] = node;
    });

    this.root.querySelectorAll("[data-et-role]").forEach(function (node) {
      self.roles[node.getAttribute("data-et-role")] = node;
    });
  };

  PadFootingBearingTool.prototype.bindEvents = function () {
    var self = this;

    Object.keys(this.fields).forEach(function (key) {
      self.fields[key].addEventListener("input", function () {
        self.persistFormState();
        self.update();
      });
    });

    if (this.actions["reset-form"]) {
      this.actions["reset-form"].addEventListener("click", function () {
        self.resetForm();
      });
    }

    if (this.actions["toggle-equations"]) {
      this.actions["toggle-equations"].addEventListener("click", function () {
        self.togglePanel("equations", self.roles["equation-toggle-label"]);
      });
    }

    if (this.actions["toggle-secondary"]) {
      this.actions["toggle-secondary"].addEventListener("click", function () {
        self.togglePanel("secondary", self.roles["secondary-toggle-label"]);
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
  };

  PadFootingBearingTool.prototype.renderEquations = function () {
    renderKatex(this.roles["equation-full"], "q_{max}=\\frac{P}{BD}+\\frac{6M}{BD^2},\\;q_{min}=\\frac{P}{BD}-\\frac{6M}{BD^2}", true);
    renderKatex(this.roles["equation-limit"], "e=\\frac{M}{P},\\;e_k=\\frac{D}{6}", true);
    renderKatex(this.roles["equation-partial"], "q_{max}=\\frac{P}{\\frac{3}{2}B\\left(\\frac{D}{2}-e\\right)}=\\frac{2P}{3B\\left(\\frac{D}{2}-e\\right)}", true);
    renderKatex(this.roles["label-p"], INPUT_DEFINITIONS.P.math, false);
    renderKatex(this.roles["label-m"], INPUT_DEFINITIONS.M.math, false);
    renderKatex(this.roles["label-b"], INPUT_DEFINITIONS.B.math, false);
    renderKatex(this.roles["label-d"], INPUT_DEFINITIONS.D.math, false);
    renderKatex(this.roles["visual-equation"], "e=\\frac{M}{P}", false);
  };

  PadFootingBearingTool.prototype.restoreFormState = function () {
    var stored = readStorage(this.formStorageKey, null);
    var self = this;

    if (!stored || typeof stored !== "object") {
      return;
    }

    Object.keys(this.fields).forEach(function (key) {
      if (stored[key] !== undefined && stored[key] !== null) {
        self.fields[key].value = String(stored[key]);
      }
    });
  };

  PadFootingBearingTool.prototype.persistFormState = function () {
    var snapshot = {};
    var self = this;

    Object.keys(this.fields).forEach(function (key) {
      snapshot[key] = self.fields[key].value;
    });

    writeStorage(this.formStorageKey, snapshot);
  };

  PadFootingBearingTool.prototype.resetForm = function () {
    var defaults = {
      P: "1200",
      M: "150",
      B: "2.4",
      D: "2.8"
    };
    var self = this;

    Object.keys(defaults).forEach(function (key) {
      if (self.fields[key]) {
        self.fields[key].value = defaults[key];
      }
    });

    this.persistFormState();
    this.update();
  };

  PadFootingBearingTool.prototype.togglePanel = function (name, labelNode) {
    var panel = this.panels[name];
    var actionName = name === "equations" ? "toggle-equations" : "toggle-secondary";

    if (!panel) {
      return;
    }

    var collapsed = panel.classList.toggle("is-collapsed");
    if (this.actions[actionName]) {
      this.actions[actionName].setAttribute("aria-expanded", collapsed ? "false" : "true");
    }

    if (labelNode) {
      labelNode.textContent = collapsed ? "Show" : "Hide";
    }
  };

  PadFootingBearingTool.prototype.readInputs = function () {
    return {
      P: parseNumber(this.fields.P.value),
      M: parseNumber(this.fields.M.value),
      B: parseNumber(this.fields.B.value),
      D: parseNumber(this.fields.D.value)
    };
  };

  PadFootingBearingTool.prototype.validateInputs = function (raw) {
    var errors = {};
    var fieldKeys = Object.keys(FIELD_RULES);
    var index;
    var key;
    var meta;
    var value;

    for (index = 0; index < fieldKeys.length; index += 1) {
      key = fieldKeys[index];
      meta = FIELD_RULES[key];
      value = raw[key];

      if (value === null) {
        errors[key] = meta.label + " is required.";
        continue;
      }

      if (!meta.allowZero && value <= 0) {
        errors[key] = meta.label + " must be greater than zero.";
        continue;
      }

      if (meta.allowZero && value < 0) {
        errors[key] = meta.label + " cannot be negative.";
        continue;
      }

      if (value < meta.min || value > meta.max) {
        errors[key] = meta.label + " must be between " + meta.min + " and " + meta.max + ".";
      }
    }

    if (Object.keys(errors).length > 0) {
      return {
        isValid: false,
        errors: errors,
        values: raw,
        globalError: "Resolve the highlighted fields to calculate bearing pressure."
      };
    }

    var eccentricity = raw.M / raw.P;
    if (eccentricity >= raw.D / 2) {
      return {
        isValid: false,
        errors: errors,
        values: raw,
        globalError: "Derived eccentricity e = M/P must remain below D/2 to maintain a physically meaningful contact area."
      };
    }

    return {
      isValid: true,
      errors: errors,
      values: raw,
      globalError: ""
    };
  };

  PadFootingBearingTool.prototype.updateValidationUI = function (errors, globalError) {
    var self = this;

    this.root.querySelectorAll("[data-error-for]").forEach(function (node) {
      var key = node.getAttribute("data-error-for");
      var message = errors[key] || "";
      node.textContent = message;

      if (self.fields[key]) {
        var shell = self.fields[key].closest(".et-pfb__control");
        if (shell) {
          shell.classList.toggle("has-error", Boolean(message));
        }
      }
    });

    if (this.roles["notice-stack"]) {
      if (globalError) {
        this.roles["notice-stack"].innerHTML = [
          '<div class="et-pfb__notice et-pfb__notice--error">',
          '<p>' + escapeHtml(globalError) + "</p>",
          "</div>"
        ].join("");
      } else {
        this.roles["notice-stack"].innerHTML = "";
      }
    }
  };

  PadFootingBearingTool.prototype.calculate = function (inputs) {
    var eccentricity = inputs.M / inputs.P;
    var kernelLimit = inputs.D / 6;
    var qAverage = inputs.P / (inputs.B * inputs.D);
    var momentEccentricity = inputs.M / inputs.P;
    var qmin = 0;
    var qmax = 0;
    var contactLength = inputs.D;
    var caseLabel = "Case A · e < e_k";
    var contactCondition = "Full contact";
    var pass = true;

    if (eccentricity <= kernelLimit || nearlyEqual(eccentricity, kernelLimit)) {
      qmax = qAverage + (6 * inputs.M) / (inputs.B * inputs.D * inputs.D);
      qmin = qAverage - (6 * inputs.M) / (inputs.B * inputs.D * inputs.D);
      caseLabel = nearlyEqual(eccentricity, kernelLimit)
        ? "Case B · e = e_k"
        : "Case A · e < e_k";
    } else {
      contactLength = 3 * (inputs.D / 2 - eccentricity);
      qmax = (2 * inputs.P) / (inputs.B * contactLength);
      qmin = 0;
      caseLabel = "Case C · e > e_k";
      contactCondition = "Partial contact";
      pass = false;
    }

    return {
      inputs: inputs,
      eccentricity: eccentricity,
      qAverage: qAverage,
      qmin: qmin,
      qmax: qmax,
      kernelLimit: kernelLimit,
      momentEccentricity: momentEccentricity,
      contactLength: contactLength,
      caseLabel: caseLabel,
      contactCondition: contactCondition,
      pass: pass,
      methodology: [
        "Derived eccentricity is calculated from e = M / P.",
        "The resultant is compared against the limiting eccentricity e_k = D / 6 to determine the governing pressure case.",
        "Full contact uses the linear bearing stress expression q = P/(BD) ± 6M/(BD²).",
        "Partial contact uses a triangular compression block with extent 3(D/2 − e)."
      ],
      assumptions: [
        "The footing is treated as rigid enough to develop a linear bearing pressure distribution.",
        "Compression only is permitted at the soil-footing interface, with no tension transfer.",
        "The check is limited to a rectangular footing under eccentric load about one principal axis."
      ]
    };
  };

  PadFootingBearingTool.prototype.renderOutputs = function (state) {
    this.outputs["status-pill"].textContent = "Live";
    this.outputs["status-pill"].setAttribute("data-tone", "pass");
    this.outputs["contact-pill"].textContent = state.contactCondition;
    this.outputs["contact-pill"].setAttribute("data-tone", state.contactCondition === "Partial contact" ? "warn" : "pass");
    this.outputs["case-caption"].textContent = state.caseLabel;
    this.outputs["contact-caption"].textContent = state.contactCondition + " pressure profile rendered live from the current input state.";
    this.outputs["visual-eccentricity"].textContent = formatNumber(state.eccentricity, 3) + " m";
    this.outputs["qmax-hero"].textContent = formatNumber(state.qmax, 2);
    this.outputs["hero-note"].textContent = "kPa";
    this.outputs["case-card"].textContent = state.caseLabel;
    this.outputs["contact-length-card"].textContent = formatNumber(state.contactLength, 3) + " m";
    this.outputs["range-card"].textContent = formatNumber(state.qmin, 2) + " to " + formatNumber(state.qmax, 2) + " kPa";
    this.outputs.eccentricity.textContent = formatNumber(state.eccentricity, 3) + " m";
    this.outputs.qavg.textContent = formatNumber(state.qAverage, 2) + " kPa";
    this.outputs.qmin.textContent = formatNumber(state.qmin, 2) + " kPa";
    this.outputs["kernel-limit"].textContent = formatNumber(state.kernelLimit, 3) + " m";
    this.outputs["moment-eccentricity"].textContent = formatNumber(state.momentEccentricity, 3) + " m";
    this.outputs["contact-length"].textContent = formatNumber(state.contactLength, 3) + " m";
    this.outputs["pressure-zone"].textContent = state.contactCondition;
  };

  PadFootingBearingTool.prototype.setInvalidState = function (validation) {
    this.lastState = null;
    this.updateValidationUI(validation.errors, validation.globalError);
    this.drawEmptyDiagram();
    this.outputs["status-pill"].textContent = "Awaiting valid inputs";
    this.outputs["status-pill"].removeAttribute("data-tone");
    this.outputs["contact-pill"].textContent = "No result";
    this.outputs["contact-pill"].removeAttribute("data-tone");
    this.outputs["case-caption"].textContent = "Pressure diagram will render here";
    this.outputs["contact-caption"].textContent = "Enter valid footing dimensions and loading to display the centroid, eccentricity, contact length, and pressure block.";
    this.outputs["visual-eccentricity"].textContent = "--";
    this.outputs["qmax-hero"].textContent = "--";
    this.outputs["hero-note"].textContent = "Results stay disabled until all required values are valid.";
    this.outputs["case-card"].textContent = "--";
    this.outputs["contact-length-card"].textContent = "--";
    this.outputs["range-card"].textContent = "--";
    this.outputs.eccentricity.textContent = "--";
    this.outputs.qavg.textContent = "--";
    this.outputs.qmin.textContent = "--";
    this.outputs["kernel-limit"].textContent = "--";
    this.outputs["moment-eccentricity"].textContent = "--";
    this.outputs["contact-length"].textContent = "--";
    this.outputs["pressure-zone"].textContent = "--";
    this.outputs["export-feedback"].textContent = "";

    if (this.actions["save-result"]) {
      this.actions["save-result"].disabled = true;
    }

    if (this.actions["export-word-report"]) {
      this.actions["export-word-report"].disabled = true;
    }
  };

  PadFootingBearingTool.prototype.drawEmptyDiagram = function () {
    var diagram = this.roles.diagram;
    if (!diagram) {
      return;
    }

    diagram.innerHTML = [
      '<rect x="0" y="0" width="580" height="360" fill="transparent"></rect>',
      '<text x="290" y="168" text-anchor="middle" class="et-pfb__diagram-empty">Pressure diagram will render here</text>',
      '<text x="290" y="192" text-anchor="middle" class="et-pfb__diagram-empty">Enter valid geometry and actions to draw the footing response.</text>'
    ].join("");
  };

  PadFootingBearingTool.prototype.drawDiagram = function (state) {
    var diagram = this.roles.diagram;
    var footingX = 68;
    var footingY = 165;
    var footingWidth = 444;
    var footingHeight = 44;
    var axisX = footingX + footingWidth / 2;
    var pressureBaseY = footingY + footingHeight;
    var kernelFraction = state.inputs.D > 0 ? state.kernelLimit / state.inputs.D : 0;
    var eccentricityFraction = state.inputs.D > 0 ? state.eccentricity / state.inputs.D : 0;
    var eccentricityX = axisX + footingWidth * Math.max(-0.36, Math.min(0.36, eccentricityFraction));
    var kernelRightX = footingX + footingWidth * (0.5 + kernelFraction);
    var kernelLeftX = footingX + footingWidth * (0.5 - kernelFraction);
    var contactEndX = state.contactCondition === "Full contact"
      ? footingX + footingWidth
      : footingX + Math.min(footingWidth, Math.max(110, footingWidth * (state.contactLength / state.inputs.D)));
    var normalizedQmin = state.contactCondition === "Full contact" ? state.qmin / state.qmax : 0;
    var pressureTopLeftY = pressureBaseY + 14 + (1 - normalizedQmin) * 54;
    var pressureTopRightY = pressureBaseY + 96;
    var pressurePoints = state.contactCondition === "Full contact"
      ? footingX + "," + (pressureBaseY + 40) + " " + (footingX + footingWidth) + "," + (pressureBaseY + 16) + " " + (footingX + footingWidth) + "," + pressureTopRightY + " " + footingX + "," + pressureTopLeftY
      : footingX + "," + (pressureBaseY + 8) + " " + contactEndX + "," + (pressureBaseY + 8) + " " + contactEndX + "," + pressureTopRightY + " " + footingX + "," + pressureTopLeftY;

    if (!diagram) {
      return;
    }

    diagram.innerHTML = [
      '<defs>',
      '<pattern id="et-pfb-grid-' + this.index + '" width="24" height="24" patternUnits="userSpaceOnUse">',
      '<path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(111, 142, 166, 0.16)" stroke-width="1"></path>',
      '</pattern>',
      '<linearGradient id="et-pfb-footing-' + this.index + '" x1="0%" y1="0%" x2="0%" y2="100%">',
      '<stop offset="0%" stop-color="#eef4f7"></stop>',
      '<stop offset="100%" stop-color="#dbe6ea"></stop>',
      '</linearGradient>',
      '<linearGradient id="et-pfb-pressure-' + this.index + '" x1="0%" y1="0%" x2="100%" y2="0%">',
      '<stop offset="0%" stop-color="#7ed5d0" stop-opacity="0.92"></stop>',
      '<stop offset="100%" stop-color="#2f7be5" stop-opacity="0.96"></stop>',
      '</linearGradient>',
      '</defs>',
      '<rect x="0" y="0" width="580" height="360" fill="url(#et-pfb-grid-' + this.index + ')"></rect>',
      '<line x1="34" y1="' + pressureBaseY + '" x2="540" y2="' + pressureBaseY + '" class="et-pfb__svg-line et-pfb__svg-line--ground"></line>',
      '<rect x="' + footingX + '" y="' + footingY + '" width="' + footingWidth + '" height="' + footingHeight + '" rx="14" fill="url(#et-pfb-footing-' + this.index + ')" class="et-pfb__svg-line et-pfb__svg-line--outline"></rect>',
      '<line x1="' + axisX + '" y1="66" x2="' + axisX + '" y2="252" class="et-pfb__svg-line et-pfb__svg-line--axis"></line>',
      '<line x1="' + kernelLeftX + '" y1="112" x2="' + kernelLeftX + '" y2="210" class="et-pfb__svg-line et-pfb__svg-line--kernel"></line>',
      '<line x1="' + kernelRightX + '" y1="112" x2="' + kernelRightX + '" y2="210" class="et-pfb__svg-line et-pfb__svg-line--kernel"></line>',
      '<line x1="' + eccentricityX + '" y1="72" x2="' + eccentricityX + '" y2="' + footingY + '" class="et-pfb__svg-line et-pfb__svg-line--accent"></line>',
      '<polygon points="' + (eccentricityX - 6) + "," + (footingY - 10) + " " + (eccentricityX + 6) + "," + (footingY - 10) + " " + eccentricityX + "," + (footingY + 6) + '" fill="#2f7be5"></polygon>',
      '<line x1="' + axisX + '" y1="96" x2="' + eccentricityX + '" y2="96" class="et-pfb__svg-line et-pfb__svg-line--ecc"></line>',
      '<line x1="' + axisX + '" y1="90" x2="' + axisX + '" y2="102" class="et-pfb__svg-line et-pfb__svg-line--ecc"></line>',
      '<line x1="' + eccentricityX + '" y1="90" x2="' + eccentricityX + '" y2="102" class="et-pfb__svg-line et-pfb__svg-line--ecc"></line>',
      '<polygon points="' + pressurePoints + '" fill="url(#et-pfb-pressure-' + this.index + ')" opacity="0.95"></polygon>',
      '<line x1="' + footingX + '" y1="286" x2="' + (footingX + footingWidth) + '" y2="286" class="et-pfb__svg-line et-pfb__svg-line--dimension"></line>',
      '<line x1="' + footingX + '" y1="276" x2="' + footingX + '" y2="296" class="et-pfb__svg-line et-pfb__svg-line--dimension"></line>',
      '<line x1="' + (footingX + footingWidth) + '" y1="276" x2="' + (footingX + footingWidth) + '" y2="296" class="et-pfb__svg-line et-pfb__svg-line--dimension"></line>',
      '<line x1="' + footingX + '" y1="312" x2="' + contactEndX + '" y2="312" class="et-pfb__svg-line et-pfb__svg-line--accent"></line>',
      '<line x1="' + footingX + '" y1="304" x2="' + footingX + '" y2="320" class="et-pfb__svg-line et-pfb__svg-line--accent"></line>',
      '<line x1="' + contactEndX + '" y1="304" x2="' + contactEndX + '" y2="320" class="et-pfb__svg-line et-pfb__svg-line--accent"></line>',
      '<text x="' + (eccentricityX + 12) + '" y="88" class="et-pfb__svg-label et-pfb__svg-label--accent">P and resultant</text>',
      '<text x="' + (axisX - 16) + '" y="58" class="et-pfb__svg-label">Centroid axis</text>',
      '<text x="' + (Math.min(axisX, eccentricityX) + Math.abs(eccentricityX - axisX) / 2) + '" y="86" text-anchor="middle" class="et-pfb__svg-label et-pfb__svg-label--teal">e = ' + escapeHtml(formatNumber(state.eccentricity, 3)) + ' m</text>',
      '<text x="' + (kernelRightX + 8) + '" y="124" class="et-pfb__svg-label">Kernel limit e_k = D/6</text>',
      '<text x="' + (eccentricityX + 12) + '" y="74" class="et-pfb__svg-label et-pfb__svg-label--accent">P = ' + escapeHtml(formatNumber(state.inputs.P, 1)) + ' kN</text>',
      '<text x="' + (footingX + footingWidth / 2) + '" y="304" text-anchor="middle" class="et-pfb__svg-label">D = ' + escapeHtml(formatNumber(state.inputs.D, 3)) + ' m</text>',
      '<text x="' + (footingX + (contactEndX - footingX) / 2) + '" y="332" text-anchor="middle" class="et-pfb__svg-label et-pfb__svg-label--accent">' + escapeHtml(state.contactCondition === "Full contact" ? "D" : "3(D/2 - e) = " + formatNumber(state.contactLength, 3) + " m") + '</text>',
      '<text x="' + (contactEndX - 8) + '" y="' + (pressureTopRightY + 18) + '" text-anchor="end" class="et-pfb__svg-label et-pfb__svg-label--accent">qmax = ' + escapeHtml(formatNumber(state.qmax, 2)) + ' kPa</text>',
      '<text x="' + (footingX + 12) + '" y="' + (pressureTopLeftY + 18) + '" class="et-pfb__svg-label et-pfb__svg-label--teal">' + escapeHtml(state.contactCondition === "Full contact" ? "qmin = " + formatNumber(state.qmin, 2) + " kPa" : "q = 0") + '</text>'
    ].join("");
  };

  PadFootingBearingTool.prototype.renderSavedResults = function () {
    var body = this.roles["saved-results-body"];
    if (!body) {
      return;
    }

    if (this.outputs["saved-count"]) {
      this.outputs["saved-count"].textContent = this.savedResults.length + " saved";
    }

    if (!this.savedResults.length) {
      body.innerHTML = '<tr><td colspan="8" class="et-pfb__table-empty">Save design iterations to build a project-side comparison history.</td></tr>';
      return;
    }

    body.innerHTML = this.savedResults.map(function (entry) {
      return [
        "<tr>",
        "<td>" + escapeHtml(formatDateTime(entry.timestamp)) + "</td>",
        "<td>" + escapeHtml(formatNumber(entry.inputs.P, 2)) + "</td>",
        "<td>" + escapeHtml(formatNumber(entry.inputs.M, 2)) + "</td>",
        "<td>" + escapeHtml(formatNumber(entry.inputs.B, 3)) + "</td>",
        "<td>" + escapeHtml(formatNumber(entry.inputs.D, 3)) + "</td>",
        "<td>" + escapeHtml(formatNumber(entry.result.eccentricity, 3)) + "</td>",
        '<td class="et-pfb__table-emphasis">' + escapeHtml(formatNumber(entry.result.qmax, 2)) + "</td>",
        '<td><span class="et-pfb__table-pill' + (entry.result.contactCondition === "Partial contact" ? " is-warn" : "") + '">' + escapeHtml(entry.result.caseLabel) + "</span></td>",
        "</tr>"
      ].join("");
    }).join("");
  };

  PadFootingBearingTool.prototype.saveCurrentResult = function () {
    if (!this.lastState) {
      return;
    }

    var entry = {
      id: uniqueId(),
      timestamp: new Date().toISOString(),
      inputs: this.lastState.inputs,
      result: {
        eccentricity: this.lastState.eccentricity,
        kernelLimit: this.lastState.kernelLimit,
        qAverage: this.lastState.qAverage,
        qmin: this.lastState.qmin,
        qmax: this.lastState.qmax,
        momentEccentricity: this.lastState.momentEccentricity,
        contactLength: this.lastState.contactLength,
        caseLabel: this.lastState.caseLabel,
        contactCondition: this.lastState.contactCondition,
        pass: this.lastState.pass
      }
    };

    this.savedResults = [entry].concat(this.savedResults);
    writeStorage(this.resultsStorageKey, this.savedResults);
    this.renderSavedResults();
  };

  PadFootingBearingTool.prototype.exportWordReport = async function () {
    var button = this.actions["export-word-report"];
    if (!button || !this.lastState || !window.docx) {
      return;
    }

    button.disabled = true;
    this.outputs["export-feedback"].textContent = "Building Word report...";

    try {
      var reportData = await buildCalculationReportData(this);
      await exportWordReport(reportData);
      this.outputs["export-feedback"].textContent = "Word report generated successfully.";
    } catch (error) {
      this.outputs["export-feedback"].textContent = "Unable to generate the Word report. Please try again.";
    } finally {
      button.disabled = false;
    }
  };

  PadFootingBearingTool.prototype.update = function () {
    var raw = this.readInputs();
    var validation = this.validateInputs(raw);

    if (!validation.isValid) {
      this.setInvalidState(validation);
      return;
    }

    this.updateValidationUI({}, "");
    this.lastState = this.calculate(validation.values);
    this.renderOutputs(this.lastState);
    this.drawDiagram(this.lastState);

    if (this.actions["save-result"]) {
      this.actions["save-result"].disabled = false;
    }

    if (this.actions["export-word-report"]) {
      this.actions["export-word-report"].disabled = false;
    }
  };

  async function buildCalculationReportData(instance) {
    var report = instance.lastState;
    var figures = await createVisualisationSection(instance.root);
    var generatedAtIso = new Date().toISOString();

    return {
      title: "Pad Footing Bearing Pressure Report",
      fileName: TOOL_SLUG + "_" + formatFileStamp(generatedAtIso) + ".docx",
      metadata: [
        ["Project", instance.root.getAttribute("data-report-project") || "Not specified"],
        ["Company", instance.root.getAttribute("data-report-company") || "Not specified"],
        ["Prepared By", instance.root.getAttribute("data-report-prepared-by") || "Not specified"],
        ["Tool", "Pad footing bearing pressure calculator"],
        ["Generated", formatDateTime(generatedAtIso)],
        ["Audit trail entries", String(instance.savedResults.length)]
      ],
      summaryRows: [
        ["Pressure case", report.caseLabel],
        ["Bearing condition", report.contactCondition],
        ["Middle-third check", report.pass ? "PASS" : "FAIL"],
        ["qmax", formatNumber(report.qmax, 2) + " kPa"],
        ["qmin", formatNumber(report.qmin, 2) + " kPa"]
      ],
      inputRows: [
        ["P", formatNumber(report.inputs.P, 3) + " kN"],
        ["M", formatNumber(report.inputs.M, 3) + " kN·m"],
        ["B", formatNumber(report.inputs.B, 3) + " m"],
        ["D", formatNumber(report.inputs.D, 3) + " m"]
      ],
      resultRows: [
        ["e = M / P", formatNumber(report.eccentricity, 3) + " m"],
        ["e_k = D / 6", formatNumber(report.kernelLimit, 3) + " m"],
        ["qavg", formatNumber(report.qAverage, 2) + " kPa"],
        ["qmin", formatNumber(report.qmin, 2) + " kPa"],
        ["qmax", formatNumber(report.qmax, 2) + " kPa"],
        ["3(D/2 − e)", formatNumber(report.contactLength, 3) + " m"]
      ],
      calculationRows: [
        ["Area, A = B × D", formatNumber(report.inputs.B * report.inputs.D, 3) + " m²"],
        ["Derived eccentricity, e", formatNumber(report.eccentricity, 3) + " m"],
        ["Kernel limit, e_k", formatNumber(report.kernelLimit, 3) + " m"],
        ["Average pressure, qavg", formatNumber(report.qAverage, 2) + " kPa"],
        ["Minimum pressure, qmin", formatNumber(report.qmin, 2) + " kPa"],
        ["Maximum pressure, qmax", formatNumber(report.qmax, 2) + " kPa"],
        ["Effective contact length", formatNumber(report.contactLength, 3) + " m"]
      ],
      equations: [
        "e = M / P",
        "e_k = D / 6",
        "qmax = P / (B D) + 6M / (B D²), for e ≤ e_k",
        "qmin = P / (B D) − 6M / (B D²), for e ≤ e_k",
        "qmax = 2P / [3B(D/2 − e)], for e > e_k"
      ],
      methodology: report.methodology,
      assumptions: report.assumptions,
      disclaimer: [
        instance.root.getAttribute("data-report-disclaimer") || "This report is software-generated and should be reviewed by a qualified engineer.",
        "The footing is assumed rigid and the interface is assumed unable to sustain tension.",
        "Independent verification of allowable soil bearing pressure, load combinations, and constructability remains the responsibility of the engineer."
      ],
      figures: figures,
      auditTrail: instance.savedResults
    };
  }

  async function exportWordReport(reportData) {
    var docx = window.docx;
    var children = [];

    children.push(new docx.Paragraph({
      text: reportData.title,
      heading: docx.HeadingLevel.TITLE,
      spacing: { after: 120 }
    }));
    children.push(new docx.Paragraph({
      children: [new docx.TextRun({ text: "Professional engineering calculation sheet export", italics: true, color: "5D7682" })],
      spacing: { after: 220 }
    }));
    children.push(createMetadataSection(reportData.metadata));
    children.push(createResultsTable(reportData.summaryRows, "Design Summary", "Value"));
    children.push(new docx.Paragraph({ text: "", pageBreakBefore: true }));
    children.push(createInputsTable(reportData.inputRows));
    Array.prototype.push.apply(children, createCalculationSection(reportData));
    children.push(new docx.Paragraph({ text: "", pageBreakBefore: true }));
    children.push(new docx.Paragraph({ text: "Visualisation", heading: docx.HeadingLevel.HEADING_1, spacing: { after: 120 } }));

    (await addImageToDoc(reportData.figures)).forEach(function (paragraph) {
      children.push(paragraph);
    });

    children.push(new docx.Paragraph({ text: "", pageBreakBefore: true }));
    children.push(createResultsTable(reportData.resultRows, "Calculated Results", "Value"));
    children.push(createResultsTable(reportData.calculationRows, "Intermediate Calculations", "Value"));
    Array.prototype.push.apply(children, createAssumptionsSection(reportData));

    if (reportData.auditTrail && reportData.auditTrail.length) {
      children.push(new docx.Paragraph({ text: "Audit Trail", heading: docx.HeadingLevel.HEADING_1, spacing: { before: 180, after: 120 } }));
      children.push(createResultsTable(reportData.auditTrail.map(function (entry) {
        return [
          formatDateTime(entry.timestamp),
          "P = " + formatNumber(entry.inputs.P, 2) + " kN, M = " + formatNumber(entry.inputs.M, 2) + " kN·m, qmax = " + formatNumber(entry.result.qmax, 2) + " kPa"
        ];
      }), "Timestamp", "Saved scenario"));
    }

    var document = new docx.Document({
      creator: "Engineering Tools",
      title: reportData.title,
      description: "Pad footing bearing pressure engineering calculation sheet",
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
        children: children
      }]
    });

    var blob = await docx.Packer.toBlob(document);
    triggerDownload(blob, reportData.fileName);
  }

  function createMetadataSection(rows) {
    return createResultsTable(rows, "Report Metadata", "Value");
  }

  function createInputsTable(rows) {
    return createResultsTable(rows, "Input", "Value");
  }

  function createResultsTable(rows, leftHeader, rightHeader) {
    var docx = window.docx;
    var border = { style: docx.BorderStyle.SINGLE, size: 1, color: "D1DDE3" };

    function headerCell(text) {
      return new docx.TableCell({
        width: { size: 50, type: docx.WidthType.PERCENTAGE },
        shading: { fill: "DCEAF3" },
        children: [new docx.Paragraph({ children: [new docx.TextRun({ text: text, bold: true, color: "17313A" })] })]
      });
    }

    function bodyCell(text, emphasize) {
      var runOptions = { text: String(text), color: "17313A" };

      if (emphasize === "PASS") {
        runOptions.bold = true;
        runOptions.color = "237A57";
      } else if (emphasize === "FAIL") {
        runOptions.bold = true;
        runOptions.color = "BE4E45";
      }

      return new docx.TableCell({
        children: [new docx.Paragraph({ children: [new docx.TextRun(runOptions)] })],
        borders: { top: border, bottom: border, left: border, right: border }
      });
    }

    return new docx.Table({
      width: { size: 100, type: docx.WidthType.PERCENTAGE },
      layout: docx.TableLayoutType.FIXED,
      rows: [
        new docx.TableRow({ tableHeader: true, children: [headerCell(leftHeader), headerCell(rightHeader)] })
      ].concat((rows || []).map(function (row) {
        var emphasis = row[1] === "PASS" || row[1] === "FAIL" ? row[1] : "";
        return new docx.TableRow({ children: [bodyCell(row[0], ""), bodyCell(row[1], emphasis)] });
      }))
    });
  }

  function createCalculationSection(reportData) {
    var docx = window.docx;
    var content = [
      new docx.Paragraph({ text: "Governing Equations", heading: docx.HeadingLevel.HEADING_1, spacing: { after: 120 } })
    ];

    reportData.equations.forEach(function (equation) {
      content.push(createEquationParagraph(equation));
    });

    content.push(new docx.Paragraph({ text: "Methodology", heading: docx.HeadingLevel.HEADING_1, spacing: { before: 180, after: 120 } }));

    reportData.methodology.forEach(function (line) {
      content.push(new docx.Paragraph({ text: line, bullet: { level: 0 }, spacing: { after: 70 } }));
    });

    return content;
  }

  function createEquationParagraph(equation) {
    var docx = window.docx;
    return new docx.Paragraph({
      children: [new docx.TextRun({ text: equation, bold: true })],
      spacing: { after: 70 }
    });
  }

  async function createVisualisationSection(root) {
    var visuals = [];
    var exportNodes = root.querySelectorAll("[data-export-visualization]");
    var index = 0;

    for (index = 0; index < exportNodes.length; index += 1) {
      var container = exportNodes[index];
      var svg = container.querySelector("svg");
      var canvas = container.querySelector("canvas");
      var image;

      if (svg) {
        image = await extractSvgAsPng(svg, 2);
      } else if (canvas) {
        image = await extractCanvasAsPng(canvas);
      }

      if (image) {
        visuals.push({
          caption: "Figure " + (visuals.length + 1) + " – " + (container.getAttribute("data-report-visualization") || "Engineering visualisation"),
          image: image
        });
      }
    }

    return visuals;
  }

  async function extractSvgAsPng(svgElement, scale) {
    var clonedSvg = svgElement.cloneNode(true);
    var viewBox = svgElement.viewBox.baseVal;
    var width = viewBox && viewBox.width ? viewBox.width : svgElement.clientWidth || 580;
    var height = viewBox && viewBox.height ? viewBox.height : svgElement.clientHeight || 360;
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
        throw new Error("Unable to create canvas context.");
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

  async function extractCanvasAsPng(canvasElement) {
    var blob = await canvasToBlob(canvasElement);
    return {
      data: new Uint8Array(await blob.arrayBuffer()),
      width: canvasElement.width,
      height: canvasElement.height
    };
  }

  async function addImageToDoc(figures) {
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

  function createAssumptionsSection(reportData) {
    var docx = window.docx;
    var content = [
      new docx.Paragraph({ text: "Assumptions", heading: docx.HeadingLevel.HEADING_1, spacing: { before: 180, after: 120 } })
    ];

    reportData.assumptions.forEach(function (line) {
      content.push(new docx.Paragraph({ text: line, bullet: { level: 0 }, spacing: { after: 70 } }));
    });

    content.push(new docx.Paragraph({ text: "Disclaimer", heading: docx.HeadingLevel.HEADING_1, spacing: { before: 180, after: 120 } }));

    reportData.disclaimer.forEach(function (line) {
      content.push(new docx.Paragraph({ text: line, spacing: { after: 70 } }));
    });

    return content;
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
      new PadFootingBearingTool(root, index).init();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  document.addEventListener("engineering-tools:ready", boot);
}());
