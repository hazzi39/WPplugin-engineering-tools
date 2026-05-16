(function () {
  "use strict";

  var TOOL_SLUG = "rc-moment-capacity";
  var STORAGE_PREFIX = "engineering-tools-rc-moment-capacity-v1";
  var FIELD_RULES = {
    fc: { label: "f'c", min: 20, max: 100 },
    fsy: { label: "fsy", min: 250, max: 750 },
    phi: { label: "phi", min: 0.1, max: 1.0 },
    mstar: { label: "M*", min: 0, max: 20000, allowZero: true },
    b: { label: "b", min: 150, max: 2000 },
    D: { label: "D", min: 250, max: 3000 },
    cover: { label: "Cover", min: 20, max: 150 },
    rebarDiameter: { label: "Bar diameter", min: 12, max: 40 },
    rebarCount: { label: "Bar count", min: 1, max: 20, integer: true }
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

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function buildGridLines(width, height, spacing) {
    var lines = [];
    var x;
    var y;

    for (x = 0; x <= width; x += spacing) {
      lines.push('<line class="et-rmc__svg-grid" x1="' + x + '" y1="0" x2="' + x + '" y2="' + height + '"></line>');
    }

    for (y = 0; y <= height; y += spacing) {
      lines.push('<line class="et-rmc__svg-grid" x1="0" y1="' + y + '" x2="' + width + '" y2="' + y + '"></line>');
    }

    return lines.join("");
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

  function MomentCapacityTool(root, index) {
    this.root = root;
    this.index = index;
    this.storageKey = STORAGE_PREFIX + "::" + window.location.pathname + "::" + index;
    this.savedResults = readStorage(this.storageKey);
    this.fields = {};
    this.outputs = {};
    this.actions = {};
    this.numberAnimations = {};
    this.lastState = null;
    this.isExporting = false;
  }

  MomentCapacityTool.prototype.init = function () {
    this.captureNodes();
    this.bindEvents();
    this.renderSavedResults();
    this.renderEquationPlaceholders();
    this.drawEmptyDiagram();
    this.update();
  };

  MomentCapacityTool.prototype.captureNodes = function () {
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

    this.diagram = this.root.querySelector('[data-role="diagram"]');
    this.checksList = this.root.querySelector('[data-role="checks-list"]');
    this.savedResultsBody = this.root.querySelector('[data-role="saved-results"]');
    this.heroCard = this.root.querySelector('[data-role="hero-card"]');
    this.equationPrimary = this.root.querySelector('[data-role="equation-primary"]');
    this.equationSecondary = this.root.querySelector('[data-role="equation-secondary"]');
  };

  MomentCapacityTool.prototype.bindEvents = function () {
    var self = this;

    Object.keys(this.fields).forEach(function (name) {
      self.fields[name].addEventListener("input", function () {
        self.update();
      });
      self.fields[name].addEventListener("change", function () {
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

  MomentCapacityTool.prototype.resetForm = function () {
    var defaults = {
      fc: "40",
      fsy: "500",
      phi: "0.80",
      mstar: "120",
      b: "300",
      D: "600",
      cover: "45",
      rebarDiameter: "20",
      rebarCount: "2"
    };

    Object.keys(defaults).forEach(function (key) {
      if (this.fields[key]) {
        this.fields[key].value = defaults[key];
      }
    }, this);

    this.update();
  };

  MomentCapacityTool.prototype.readInputs = function () {
    return {
      fc: parseNumber(this.fields.fc.value),
      fsy: parseNumber(this.fields.fsy.value),
      phi: parseNumber(this.fields.phi.value),
      mstar: parseNumber(this.fields.mstar.value),
      b: parseNumber(this.fields.b.value),
      D: parseNumber(this.fields.D.value),
      cover: parseNumber(this.fields.cover.value),
      rebarDiameter: parseNumber(this.fields.rebarDiameter.value),
      rebarCount: parseNumber(this.fields.rebarCount.value)
    };
  };

  MomentCapacityTool.prototype.validateInputs = function (values) {
    var errors = {};
    var self = this;

    Object.keys(FIELD_RULES).forEach(function (fieldName) {
      var rule = FIELD_RULES[fieldName];
      var value = values[fieldName];

      if (value === null) {
        errors[fieldName] = rule.label + " is required.";
        return;
      }

      if (!rule.allowZero && value <= 0) {
        errors[fieldName] = rule.label + " must be greater than zero.";
        return;
      }

      if (value < rule.min || value > rule.max) {
        errors[fieldName] = rule.label + " must be between " + rule.min + " and " + rule.max + ".";
        return;
      }

      if (rule.integer && Math.round(value) !== value) {
        errors[fieldName] = rule.label + " must be a whole number.";
      }
    });

    if (values.cover !== null && values.D !== null && values.cover >= values.D - 40) {
      errors.cover = "Cover must leave enough depth for the tension steel layer.";
    }

    if (values.rebarDiameter !== null && values.cover !== null && values.rebarDiameter / 2 >= values.cover) {
      errors.cover = "Cover must be greater than half the bar diameter for this simplified model.";
    }

    if (values.b !== null && values.rebarDiameter !== null && values.rebarCount !== null) {
      var requiredWidth = (values.rebarCount * values.rebarDiameter) + ((values.rebarCount + 1) * 20);
      if (requiredWidth > values.b) {
        errors.rebarCount = "Bars do not fit within the section width using a nominal 20 mm clear spacing.";
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors: errors,
      values: values
    };
  };

  MomentCapacityTool.prototype.updateValidationUI = function (errors) {
    var self = this;

    this.root.querySelectorAll("[data-error-for]").forEach(function (node) {
      var key = node.getAttribute("data-error-for");
      node.textContent = errors[key] || "";
      var field = self.fields[key];
      var shell = field ? field.closest(".et-rmc__control") : null;
      if (shell) {
        shell.classList.toggle("has-error", Boolean(errors[key]));
      }
    });
  };

  MomentCapacityTool.prototype.calculate = function (inputs) {
    var d = inputs.D - inputs.cover;
    var gamma = clamp(1.05 - (0.007 * inputs.fc), 0.67, 0.85);
    var singleBarArea = Math.PI * Math.pow(inputs.rebarDiameter, 2) / 4;
    var as = inputs.rebarCount * singleBarArea;
    var dn = (inputs.fsy * as) / (0.85 * gamma * inputs.fc * inputs.b);
    var ku = dn / d;
    var aDepth = gamma * dn;
    var mu = (0.85 * inputs.fc * gamma * ku * (1 - (0.5 * ku)) * inputs.b * d * d) / 1000000;
    var phiMu = inputs.phi * mu;
    var rho = as / (inputs.b * d);
    var ductilityOk = ku < 0.36;
    var utilisation = inputs.mstar / phiMu;
    var actionOk = utilisation <= 1;
    var statusTone = !actionOk ? "fail" : (ductilityOk ? "pass" : "warn");

    return {
      inputs: inputs,
      d: d,
      gamma: gamma,
      singleBarArea: singleBarArea,
      as: as,
      dn: dn,
      ku: ku,
      aDepth: aDepth,
      rho: rho,
      mu: mu,
      phiMu: phiMu,
      utilisation: utilisation,
      ductilityOk: ductilityOk,
      actionOk: actionOk,
      tone: statusTone,
      checks: [
        {
          state: actionOk ? "pass" : "fail",
          title: "Strength check",
          detail: "M* = " + formatNumber(inputs.mstar, 1) + " kN m against phiMu = " + formatNumber(phiMu, 2) + " kN m."
        },
        {
          state: ductilityOk ? "pass" : (ku <= 0.4 ? "warn" : "fail"),
          title: "Ductility check",
          detail: "ku = " + formatNumber(ku, 3) + " against the recommended limit of 0.36."
        },
        {
          state: dn < inputs.D ? "pass" : "fail",
          title: "Neutral axis depth",
          detail: "dn = " + formatNumber(dn, 1) + " mm within overall section depth D = " + formatNumber(inputs.D, 0) + " mm."
        },
        {
          state: rho <= 0.04 ? "pass" : "warn",
          title: "Reinforcement ratio",
          detail: "rho = " + formatNumber(rho * 100, 2) + "% for the simplified singly reinforced model."
        }
      ]
    };
  };

  MomentCapacityTool.prototype.renderEquationPlaceholders = function () {
    if (!window.katex || typeof window.katex.render !== "function") {
      return;
    }

    window.katex.render(String.raw`M_u = 0.85 f'_c \gamma k_u \left(1 - 0.5k_u\right) b d^2`, this.equationPrimary, {
      displayMode: true,
      throwOnError: false
    });

    window.katex.render(String.raw`k_u = \frac{1}{0.85\gamma}\frac{f_{sy}A_s}{f'_cbd}, \qquad \eta = \frac{M^\*}{\phi M_u}`, this.equationSecondary, {
      displayMode: true,
      throwOnError: false
    });
  };

  MomentCapacityTool.prototype.renderEquations = function (result) {
    if (!window.katex || typeof window.katex.render !== "function") {
      return;
    }

    window.katex.render(
      String.raw`\phi M_u = \phi\left(0.85 f'_c \gamma k_u \left(1 - 0.5k_u\right) b d^2\right) = ` + formatNumber(result.phiMu, 2) + String.raw`\ \text{kN}\cdot\text{m}`,
      this.equationPrimary,
      { displayMode: true, throwOnError: false }
    );

    window.katex.render(
      String.raw`\begin{aligned}
      \gamma &= 1.05 - 0.007f'_c = ` + formatNumber(result.gamma, 3) + String.raw` \\
      A_s &= n\left(\frac{\pi\phi^2}{4}\right) = ` + formatNumber(result.as, 1) + String.raw`\ \text{mm}^2 \\
      d_n &= \frac{f_{sy}A_s}{0.85\gamma f'_cb} = ` + formatNumber(result.dn, 1) + String.raw`\ \text{mm} \\
      k_u &= \frac{d_n}{d} = ` + formatNumber(result.ku, 3) + String.raw` \\
      \eta &= \frac{M^\*}{\phi M_u} = ` + formatNumber(result.utilisation, 3) + String.raw`
      \end{aligned}`,
      this.equationSecondary,
      { displayMode: true, throwOnError: false }
    );
  };

  MomentCapacityTool.prototype.renderChecks = function (checks) {
    this.checksList.innerHTML = checks.map(function (check) {
      return [
        '<li class="et-rmc__check et-rmc__check--', check.state, '">',
        '<strong>', escapeHtml(check.title), '</strong>',
        '<p>', escapeHtml(check.detail), '</p>',
        '</li>'
      ].join("");
    }).join("");
  };

  MomentCapacityTool.prototype.drawEmptyDiagram = function () {
    this.diagram.innerHTML = [
      '<rect x="0" y="0" width="720" height="440" fill="#f8fbff"></rect>',
      buildGridLines(720, 440, 24),
      '<text x="360" y="210" text-anchor="middle" class="et-rmc__diagram-empty">Awaiting valid inputs</text>',
      '<text x="360" y="234" text-anchor="middle" class="et-rmc__diagram-empty">The section, neutral axis, and steel layer will appear here.</text>'
    ].join("");
  };

  MomentCapacityTool.prototype.drawDiagram = function (result) {
    var inputs = result.inputs;
    var b = clamp(inputs.b, 150, 2000);
    var D = clamp(inputs.D, 250, 3000);
    var cover = clamp(inputs.cover, 20, 150);
    var dn = clamp(result.dn, 1, D);
    var d = clamp(result.d, 1, D);
    var barCount = clamp(inputs.rebarCount, 1, 20);
    var barRadius = clamp(inputs.rebarDiameter * 0.22, 5, 10);
    var scale = Math.min(280 / b, 280 / D);
    var width = b * scale;
    var height = D * scale;
    var originX = 170;
    var originY = 80;
    var dnHeight = dn * scale;
    var barY = originY + (d * scale);
    var centroidX = originX + width / 2;
    var centroidY = originY + height / 2;
    var bars = Array.from({ length: barCount }, function (_, index) {
      var x = originX + ((index + 1) * width) / (barCount + 1);
      return '<circle class="et-rmc__svg-bar" cx="' + x + '" cy="' + barY + '" r="' + barRadius + '" />';
    }).join("");

    this.diagram.innerHTML = [
      '<defs>',
      '<marker id="et-rmc-arrow-end" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">',
      '<path d="M 0 0 L 10 5 L 0 10 z" fill="#10979a"></path>',
      '</marker>',
      '<marker id="et-rmc-arrow-start" markerWidth="10" markerHeight="10" refX="2" refY="5" orient="auto" markerUnits="strokeWidth">',
      '<path d="M 10 0 L 0 5 L 10 10 z" fill="#10979a"></path>',
      '</marker>',
      '</defs>',
      '<rect x="0" y="0" width="720" height="440" fill="#f8fbff"></rect>',
      buildGridLines(720, 440, 24),
      '<line class="et-rmc__svg-axis" x1="' + centroidX + '" y1="' + (originY - 34) + '" x2="' + centroidX + '" y2="' + (originY + height + 36) + '" />',
      '<line class="et-rmc__svg-axis" x1="' + (originX - 42) + '" y1="' + centroidY + '" x2="' + (originX + width + 180) + '" y2="' + centroidY + '" />',
      '<rect class="et-rmc__svg-outline" x="' + originX + '" y="' + originY + '" width="' + width + '" height="' + height + '" rx="18" />',
      '<rect class="et-rmc__svg-comp" x="' + originX + '" y="' + originY + '" width="' + width + '" height="' + dnHeight + '" rx="18" />',
      '<line class="et-rmc__svg-cover" x1="' + originX + '" y1="' + (originY + (cover * scale)) + '" x2="' + (originX + width) + '" y2="' + (originY + (cover * scale)) + '" />',
      '<line class="et-rmc__svg-cover" x1="' + originX + '" y1="' + barY + '" x2="' + (originX + width) + '" y2="' + barY + '" />',
      bars,
      '<circle cx="' + centroidX + '" cy="' + centroidY + '" r="4.5" fill="#2f5d7d" />',
      '<text class="et-rmc__svg-caption" x="' + (centroidX + 12) + '" y="' + (centroidY - 8) + '">centroid</text>',
      '<line class="et-rmc__svg-dim" x1="' + originX + '" y1="' + (originY + height + 40) + '" x2="' + (originX + width) + '" y2="' + (originY + height + 40) + '" />',
      '<text class="et-rmc__svg-label" x="' + (centroidX - 8) + '" y="' + (originY + height + 66) + '">b</text>',
      '<text class="et-rmc__svg-caption" x="' + (centroidX - 28) + '" y="' + (originY + height + 84) + '">' + escapeHtml(formatNumber(b, 0)) + ' mm</text>',
      '<line class="et-rmc__svg-dim" x1="' + (originX + width + 36) + '" y1="' + originY + '" x2="' + (originX + width + 36) + '" y2="' + (originY + height) + '" />',
      '<text class="et-rmc__svg-label" x="' + (originX + width + 48) + '" y="' + (originY + 18) + '">D</text>',
      '<text class="et-rmc__svg-caption" x="' + (originX + width + 48) + '" y="' + (originY + 38) + '">' + escapeHtml(formatNumber(D, 0)) + ' mm</text>',
      '<line class="et-rmc__svg-dim" x1="' + (originX - 54) + '" y1="' + originY + '" x2="' + (originX - 54) + '" y2="' + (originY + dnHeight) + '" />',
      '<text class="et-rmc__svg-label" x="' + (originX - 88) + '" y="' + (originY + 16) + '">d<tspan baseline-shift="sub">n</tspan></text>',
      '<text class="et-rmc__svg-caption" x="' + (originX - 118) + '" y="' + (originY + dnHeight / 2) + '">' + escapeHtml(formatNumber(result.dn, 1)) + ' mm</text>',
      '<line class="et-rmc__svg-arrow" x1="' + (originX + width + 92) + '" y1="' + originY + '" x2="' + (originX + width + 92) + '" y2="' + barY + '" />',
      '<text class="et-rmc__svg-label" x="' + (originX + width + 106) + '" y="' + (originY + 18) + '">d</text>',
      '<text class="et-rmc__svg-caption" x="' + (originX + width + 106) + '" y="' + (originY + 40) + '">' + escapeHtml(formatNumber(result.d, 0)) + ' mm</text>',
      '<text class="et-rmc__svg-label" x="' + (originX + width + 18) + '" y="' + (originY + 160) + '">Compression block</text>',
      '<text class="et-rmc__svg-caption" x="' + (originX + width + 18) + '" y="' + (originY + 180) + '">a = ' + escapeHtml(formatNumber(result.aDepth, 1)) + ' mm</text>',
      '<text class="et-rmc__svg-caption" x="' + (originX + 14) + '" y="' + (originY - 8) + '">Top concrete in compression</text>',
      '<text class="et-rmc__svg-caption" x="' + (originX + 14) + '" y="' + (barY + 24) + '">' + escapeHtml(formatNumber(barCount, 0)) + ' bars x ' + escapeHtml(formatNumber(inputs.rebarDiameter, 0)) + ' mm tension steel</text>'
    ].join("");
  };

  MomentCapacityTool.prototype.renderSavedResults = function () {
    if (!this.savedResults.length) {
      this.savedResultsBody.innerHTML = '<tr><td class="et-rmc__empty-row" colspan="9">No saved results yet.</td></tr>';
      return;
    }

    this.savedResultsBody.innerHTML = this.savedResults.map(function (row) {
      return [
        "<tr>",
        "<td>", escapeHtml(formatDateTime(row.timestamp)), "</td>",
        "<td>", escapeHtml(row.section), "</td>",
        "<td>", escapeHtml(row.material), "</td>",
        "<td>", escapeHtml(row.reinforcement), "</td>",
        "<td>", escapeHtml(row.mu), "</td>",
        "<td>", escapeHtml(row.mstar), "</td>",
        "<td>", escapeHtml(row.dn), "</td>",
        "<td>", escapeHtml(row.ku), "</td>",
        "<td>", escapeHtml(row.status), "</td>",
        "</tr>"
      ].join("");
    }).join("");
  };

  MomentCapacityTool.prototype.saveCurrentResult = function () {
    if (!this.lastState) {
      return;
    }

    var result = this.lastState.result;

    this.savedResults.unshift({
      timestamp: this.lastState.timestamp,
      section: "b " + formatNumber(result.inputs.b, 0) + " mm | D " + formatNumber(result.inputs.D, 0) + " mm | cover " + formatNumber(result.inputs.cover, 0) + " mm",
      material: "f'c " + formatNumber(result.inputs.fc, 0) + " MPa | fsy " + formatNumber(result.inputs.fsy, 0) + " MPa | gamma " + formatNumber(result.gamma, 3),
      reinforcement: formatNumber(result.inputs.rebarCount, 0) + " bars | " + formatNumber(result.inputs.rebarDiameter, 0) + " mm | As " + formatNumber(result.as, 0) + " mm^2",
      mu: formatNumber(result.phiMu, 2) + " kN m",
      mstar: formatNumber(result.inputs.mstar, 2) + " kN m",
      dn: formatNumber(result.dn, 1) + " mm",
      ku: formatNumber(result.ku, 3),
      status: result.actionOk ? (result.ductilityOk ? "PASS" : "DUCTILITY REVIEW") : "FAIL"
    });

    writeStorage(this.storageKey, this.savedResults);
    this.renderSavedResults();
  };

  MomentCapacityTool.prototype.animateNumber = function (key, value, decimals, suffix) {
    var node = this.outputs[key];
    if (!node) {
      return;
    }

    var current = this.numberAnimations[key];
    if (current && current.frame) {
      cancelAnimationFrame(current.frame);
    }

    var start = current ? current.value : 0;
    var end = value;
    var startTime = null;
    var duration = 240;
    var self = this;

    function tick(timestamp) {
      if (startTime === null) {
        startTime = timestamp;
      }

      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var nextValue = start + ((end - start) * eased);
      node.textContent = formatNumber(nextValue, decimals) + (suffix || "");

      if (progress < 1) {
        self.numberAnimations[key] = { value: nextValue, frame: requestAnimationFrame(tick) };
      } else {
        self.numberAnimations[key] = { value: end, frame: null };
      }
    }

    this.numberAnimations[key] = { value: start, frame: requestAnimationFrame(tick) };
  };

  MomentCapacityTool.prototype.renderInvalid = function () {
    this.lastState = null;
    this.outputs["visual-status"].textContent = "Awaiting valid inputs";
    this.outputs["visual-status"].removeAttribute("data-tone");
    this.outputs["status-pill"].textContent = "No result";
    this.outputs["status-pill"].removeAttribute("data-tone");
    this.heroCard.setAttribute("data-tone", "idle");
    this.outputs.phiMu.textContent = "--";
    this.outputs.utilisation.textContent = "--";
    this.outputs.mu.textContent = "--";
    this.outputs["hero-note"].textContent = "Resolve the highlighted input issues to enable the capacity calculation.";
    this.outputs.mstar.textContent = "--";
    this.outputs.d.textContent = "--";
    this.outputs.as.textContent = "--";
    this.outputs.dn.textContent = "--";
    this.outputs.ku.textContent = "--";
    this.outputs.gamma.textContent = "--";
    this.outputs.rho.textContent = "--";
    this.outputs.abar.textContent = "--";
    this.outputs.aDepth.textContent = "--";
    this.actions["save-result"].disabled = true;
    if (this.actions["export-word-report"]) {
      this.actions["export-word-report"].disabled = true;
    }
    if (this.outputs["export-feedback"]) {
      this.outputs["export-feedback"].textContent = "";
    }
    this.renderEquationPlaceholders();
    this.renderChecks([
      {
        state: "warn",
        title: "Validation required",
        detail: "Results remain disabled until all inputs pass the engineering checks."
      }
    ]);
    this.drawEmptyDiagram();
  };

  MomentCapacityTool.prototype.renderOutputs = function (result) {
    var tone = result.tone;
    this.outputs["visual-status"].textContent = result.actionOk
      ? "Design action within reduced capacity"
      : "Design action exceeds reduced capacity";
    this.outputs["visual-status"].setAttribute("data-tone", tone);
    this.outputs["status-pill"].textContent = result.actionOk
      ? "η = " + formatNumber(result.utilisation, 3)
      : "η = " + formatNumber(result.utilisation, 3);
    this.outputs["status-pill"].setAttribute("data-tone", tone);
    this.heroCard.setAttribute("data-tone", tone);
    this.animateNumber("phiMu", result.phiMu, 2, " kN m");
    this.animateNumber("utilisation", result.utilisation, 3, "");
    this.animateNumber("mu", result.mu, 2, " kN m");
    this.outputs["hero-note"].textContent = result.actionOk
      ? (result.ductilityOk
        ? "The reduced flexural capacity exceeds M* and the section satisfies the simplified ductility check."
        : "The reduced flexural capacity exceeds M*, but the ductility ratio warrants review.")
      : "The factored design action M* exceeds the reduced flexural capacity phiMu.";
    this.animateNumber("mstar", result.inputs.mstar, 2, " kN m");
    this.animateNumber("d", result.d, 0, " mm");
    this.animateNumber("as", result.as, 0, " mm^2");
    this.animateNumber("dn", result.dn, 1, " mm");
    this.animateNumber("ku", result.ku, 3, "");
    this.animateNumber("gamma", result.gamma, 3, "");
    this.animateNumber("rho", result.rho * 100, 2, " %");
    this.animateNumber("abar", result.singleBarArea, 1, " mm^2");
    this.animateNumber("aDepth", result.aDepth, 1, " mm");
    this.renderChecks(result.checks);
    this.renderEquations(result);
    this.drawDiagram(result);
    this.actions["save-result"].disabled = false;
    if (this.actions["export-word-report"]) {
      this.actions["export-word-report"].disabled = false;
    }
    if (this.outputs["export-feedback"]) {
      this.outputs["export-feedback"].textContent = "";
    }
  };

  MomentCapacityTool.prototype.exportWordReport = async function () {
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
      this.isExporting = true;
      if (this.actions["export-word-report"]) {
        this.actions["export-word-report"].disabled = true;
        this.actions["export-word-report"].textContent = "Preparing Report...";
      }
      if (this.outputs["export-feedback"]) {
        this.outputs["export-feedback"].textContent = "";
      }

      await exportWordReport(this);

      if (this.outputs["export-feedback"]) {
        this.outputs["export-feedback"].textContent = "Word report exported successfully.";
      }
    } catch (error) {
      window.console.error("RC moment capacity Word export failed.", error);
      if (this.outputs["export-feedback"]) {
        this.outputs["export-feedback"].textContent = error && error.message ? error.message : "Unable to export the Word report.";
      }
    } finally {
      this.isExporting = false;
      if (this.actions["export-word-report"]) {
        this.actions["export-word-report"].disabled = !this.lastState;
        this.actions["export-word-report"].textContent = "Export Word Report";
      }
    }
  };

  MomentCapacityTool.prototype.update = function () {
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

  async function buildCalculationReportData(tool) {
    if (!tool || !tool.lastState || !tool.lastState.result) {
      throw new Error("No valid calculation state is available for report export.");
    }

    var result = tool.lastState.result;
    var generatedAt = new Date();
    var rootData = tool.root ? tool.root.dataset : {};
    var status = result.actionOk ? (result.ductilityOk ? "PASS" : "DUCTILITY REVIEW") : "FAIL";
    var statusColor = result.actionOk ? (result.ductilityOk ? "11795F" : "A46D18") : "C03A3A";
    var visualisations = await createVisualisationSection(tool);

    return {
      fileName: "rc-moment-capacity_" + formatFileTimestamp(generatedAt) + ".docx",
      generatedAt: generatedAt,
      title: "RC Moment Capacity Calculator",
      subtitle: "Professional reinforced concrete flexural capacity calculation sheet",
      metadata: {
        company: rootData.reportCompany || "Not specified",
        project: rootData.reportProject || "Not specified",
        preparedBy: rootData.reportPreparedBy || "Not specified",
        checkedBy: rootData.reportCheckedBy || "Not specified",
        tool: "RC Moment Capacity Calculator",
        issuePurpose: "Design verification / client issue draft",
        generated: formatDateTime(generatedAt),
        disclaimer: rootData.reportDisclaimer || "This calculation sheet is software-generated and must be reviewed by a qualified structural engineer before issue."
      },
      summary: {
        status: status,
        statusColor: statusColor,
        phiMu: result.phiMu,
        mstar: result.inputs.mstar,
        utilisation: result.utilisation,
        mu: result.mu,
        ku: result.ku
      },
      inputs: [
        ["Material", "f′c", formatNumber(result.inputs.fc, 0), "MPa"],
        ["Material", "fsy", formatNumber(result.inputs.fsy, 0), "MPa"],
        ["Material", "ϕ", formatNumber(result.inputs.phi, 2), "-"],
        ["Action", "M*", formatNumber(result.inputs.mstar, 2), "kN·m"],
        ["Geometry", "b", formatNumber(result.inputs.b, 0), "mm"],
        ["Geometry", "D", formatNumber(result.inputs.D, 0), "mm"],
        ["Geometry", "cover", formatNumber(result.inputs.cover, 0), "mm"],
        ["Reinforcement", "ϕs", formatNumber(result.inputs.rebarDiameter, 0), "mm"],
        ["Reinforcement", "n", formatNumber(result.inputs.rebarCount, 0), "bars"]
      ],
      results: [
        ["Reduced flexural capacity", formatNumber(result.phiMu, 2), "kN·m", "ϕMu"],
        ["Nominal flexural capacity", formatNumber(result.mu, 2), "kN·m", "Mu"],
        ["Design action", formatNumber(result.inputs.mstar, 2), "kN·m", "M*"],
        ["Utilisation", formatNumber(result.utilisation, 3), "-", "η = M* / ϕMu"],
        ["Ductility ratio", formatNumber(result.ku, 3), "-", "ku"],
        ["Neutral axis depth", formatNumber(result.dn, 1), "mm", "dn"],
        ["Status", { text: status, color: statusColor, bold: true }, "-", "Governing check"]
      ],
      intermediate: [
        ["γ", formatNumber(result.gamma, 3), "-", "Stress block factor"],
        ["d", formatNumber(result.d, 1), "mm", "Effective depth"],
        ["Abar", formatNumber(result.singleBarArea, 1), "mm²", "Single bar area"],
        ["As", formatNumber(result.as, 1), "mm²", "Total tension steel area"],
        ["ρ", formatNumber(result.rho * 100, 2), "%", "Steel ratio"],
        ["dn", formatNumber(result.dn, 1), "mm", "Neutral axis depth"],
        ["a", formatNumber(result.aDepth, 1), "mm", "Compression block depth"],
        ["ku", formatNumber(result.ku, 3), "-", "Ductility ratio"],
        ["Mu", formatNumber(result.mu, 2), "kN·m", "Nominal moment capacity"],
        ["ϕMu", formatNumber(result.phiMu, 2), "kN·m", "Reduced design capacity"]
      ],
      equations: [
        { label: "Stress block factor", expression: "γ = 1.05 − 0.007f′c, limited to 0.67 ≤ γ ≤ 0.85" },
        { label: "Steel area", expression: "As = n × (πϕs² / 4)" },
        { label: "Neutral axis depth", expression: "dn = fsyAs / (0.85γf′cb)" },
        { label: "Ductility ratio", expression: "ku = dn / d" },
        { label: "Nominal moment capacity", expression: "Mu = 0.85f′cγku(1 − 0.5ku)bd²" },
        { label: "Reduced capacity", expression: "ϕMu = ϕ × Mu" },
        { label: "Utilisation", expression: "η = M* / ϕMu" }
      ],
      methodology: [
        "Validate the material, geometry, reinforcement, and design action inputs before any capacity checks are reported.",
        "Determine the effective depth d from the overall depth D and the effective cover to the centroid of the tension steel.",
        "Calculate the bar area and total steel area As from the user-defined bar diameter and number of bars.",
        "Evaluate the neutral axis depth dn and the ductility ratio ku using the simplified singly reinforced rectangular-section equilibrium model.",
        "Compute the nominal flexural capacity Mu, apply the user-defined capacity reduction factor ϕ, and compare M* against ϕMu to obtain utilisation η.",
        "Embed the current live engineering visualisation directly into the Word report as a high-resolution image suitable for printing and PDF conversion."
      ],
      assumptions: [
        "The section is treated as a singly reinforced rectangular section with one tension steel layer.",
        "The effective cover input is interpreted as the distance from the compression face to the centroid of the tension reinforcement layer.",
        "Compression reinforcement, axial force interaction effects, and second-order effects are outside the scope of this simplified flexural model.",
        "The ductility review is based on ku < 0.36.",
        "The exported visualisation reflects the current validated calculation state at the time of report generation."
      ],
      disclaimer: rootData.reportDisclaimer || "This calculation sheet is software-generated and must be reviewed by a qualified structural engineer before issue.",
      visualisations: visualisations
    };
  }

  async function exportWordReport(tool) {
    var reportData = await buildCalculationReportData(tool);
    var doc = window.docx;
    var footer = new doc.Footer({
      children: [
        new doc.Paragraph({
          alignment: doc.AlignmentType.CENTER,
          children: [
            new doc.TextRun({ text: "Page ", size: 18, color: "5D7682" }),
            doc.PageNumber.CURRENT,
            new doc.TextRun({ text: " of ", size: 18, color: "5D7682" }),
            doc.PageNumber.TOTAL_PAGES
          ]
        })
      ]
    });

    var documentChildren = []
      .concat(createMetadataSection(reportData))
      .concat(createResultsTable(reportData))
      .concat([new doc.Paragraph({ children: [new doc.PageBreak()] })])
      .concat(createInputsTable(reportData))
      .concat(createCalculationSection(reportData))
      .concat([new doc.Paragraph({ children: [new doc.PageBreak()] })])
      .concat(await createVisualisationSection(reportData))
      .concat([new doc.Paragraph({ children: [new doc.PageBreak()] })])
      .concat(createAssumptionsSection(reportData));

    var wordDocument = new doc.Document({
      creator: reportData.title,
      title: reportData.title + " Word Report",
      description: "Professional engineering calculation sheet export.",
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720,
                right: 720,
                bottom: 720,
                left: 720,
                header: 360,
                footer: 360
              },
              size: {
                width: 11906,
                height: 16838
              }
            }
          },
          footers: { default: footer },
          children: documentChildren
        }
      ]
    });

    var blob = await doc.Packer.toBlob(wordDocument);
    triggerDownload(blob, reportData.fileName);
  }

  function createMetadataSection(reportData) {
    var doc = window.docx;
    return [
      new doc.Paragraph({
        text: reportData.title,
        heading: doc.HeadingLevel.TITLE,
        spacing: { after: 90 }
      }),
      new doc.Paragraph({
        spacing: { after: 120 },
        children: [new doc.TextRun({ text: reportData.subtitle, color: "5D7682", size: 22 })]
      }),
      createSectionHeading("Project Metadata"),
      createCompactTable(["Field", "Value"], [
        ["Company", reportData.metadata.company],
        ["Project", reportData.metadata.project],
        ["Prepared by", reportData.metadata.preparedBy],
        ["Checked by", reportData.metadata.checkedBy],
        ["Issue purpose", reportData.metadata.issuePurpose],
        ["Generated", reportData.metadata.generated]
      ]),
      createSectionHeading("Design Summary"),
      createCompactTable(["Metric", "Value"], [
        ["Status", { text: reportData.summary.status, color: reportData.summary.statusColor, bold: true }],
        ["ϕMu", formatNumber(reportData.summary.phiMu, 2) + " kN·m"],
        ["M*", formatNumber(reportData.summary.mstar, 2) + " kN·m"],
        ["Utilisation η", formatNumber(reportData.summary.utilisation, 3)],
        ["Mu", formatNumber(reportData.summary.mu, 2) + " kN·m"],
        ["ku", formatNumber(reportData.summary.ku, 3)]
      ])
    ];
  }

  function createInputsTable(reportData) {
    return [
      createSectionHeading("Inputs"),
      createDataTable(["Group", "Parameter", "Value", "Unit"], reportData.inputs)
    ];
  }

  function createResultsTable(reportData) {
    return [
      createSectionHeading("Key Results and PASS / FAIL Checks"),
      createDataTable(["Metric", "Value", "Unit", "Comment"], reportData.results)
    ];
  }

  function createCalculationSection(reportData) {
    var children = [
      createSectionHeading("Methodology")
    ];

    reportData.methodology.forEach(function (item) {
      children.push(new window.docx.Paragraph({
        text: item,
        bullet: { level: 0 },
        spacing: { after: 60 }
      }));
    });

    children.push(createSectionHeading("Governing Equations"));
    reportData.equations.forEach(function (equation) {
      children.push(createEquationParagraph(equation.label, equation.expression));
    });

    children.push(createSectionHeading("Intermediate Calculations"));
    children.push(createDataTable(["Parameter", "Value", "Unit", "Meaning"], reportData.intermediate));

    return children;
  }

  function createEquationParagraph(label, expression) {
    return new window.docx.Paragraph({
      spacing: { after: 70 },
      children: [
        new window.docx.TextRun({ text: label + ": ", bold: true, color: "203040" }),
        new window.docx.TextRun({ text: expression, color: "203040" })
      ]
    });
  }

  async function createVisualisationSection(source) {
    if (source && source.root) {
      var figures = [];
      var container = source.root.querySelector("[data-export-visualization='true']");

      if (!container) {
        return figures;
      }

      var svgElements = Array.prototype.slice.call(container.querySelectorAll("svg"));
      for (var index = 0; index < svgElements.length; index += 1) {
        figures.push(await extractSvgAsPng(svgElements[index], 2, container.dataset.exportCaption || "RC rectangular section flexural visualisation"));
      }

      var canvasElements = Array.prototype.slice.call(container.querySelectorAll("canvas"));
      for (var canvasIndex = 0; canvasIndex < canvasElements.length; canvasIndex += 1) {
        figures.push(await extractCanvasAsPng(canvasElements[canvasIndex], 2, "Engineering visualisation"));
      }

      return figures;
    }

    var reportData = source;
    var children = [createSectionHeading("Visualisation Section")];
    children.push(new window.docx.Paragraph({
      spacing: { after: 80 },
      children: [new window.docx.TextRun({ text: "Current live engineering graphics exported from the calculator.", color: "4B5563" })]
    }));

    if (!reportData.visualisations.length) {
      children.push(new window.docx.Paragraph({
        children: [new window.docx.TextRun({ text: "No visualisation was available at export time.", color: "B02A37" })]
      }));
      return children;
    }

    for (var figureIndex = 0; figureIndex < reportData.visualisations.length; figureIndex += 1) {
      Array.prototype.push.apply(
        children,
        addImageToDoc(
          reportData.visualisations[figureIndex].imageData,
          reportData.visualisations[figureIndex].width,
          reportData.visualisations[figureIndex].height,
          reportData.visualisations[figureIndex].caption || ("Figure " + (figureIndex + 1) + " - Engineering visualisation"),
          figureIndex + 1
        )
      );
    }

    return children;
  }

  async function extractSvgAsPng(svgElement, scale, caption) {
    var clonedSvg = cloneSvgWithComputedStyles(svgElement);
    var bounds = svgElement.getBoundingClientRect();
    var width = Math.max(bounds.width, svgElement.viewBox && svgElement.viewBox.baseVal ? svgElement.viewBox.baseVal.width : 0, 640);
    var height = Math.max(bounds.height, svgElement.viewBox && svgElement.viewBox.baseVal ? svgElement.viewBox.baseVal.height : 0, 420);
    var renderScale = scale || 2;

    if (!clonedSvg.getAttribute("xmlns")) {
      clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    }
    clonedSvg.setAttribute("width", String(width));
    clonedSvg.setAttribute("height", String(height));

    var serialized = new XMLSerializer().serializeToString(clonedSvg);
    var dataUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(serialized);
    var image = await loadImage(dataUrl);
    var canvas = document.createElement("canvas");
    canvas.width = Math.round(width * renderScale);
    canvas.height = Math.round(height * renderScale);
    var context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Unable to create canvas context for SVG export.");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.scale(renderScale, renderScale);
    context.drawImage(image, 0, 0, width, height);

    var blob = await canvasToBlob(canvas);
    return {
      imageData: await blobToUint8Array(blob),
      width: canvas.width,
      height: canvas.height,
      caption: caption || "Engineering visualisation"
    };
  }

  async function extractCanvasAsPng(canvasElement, scale, caption) {
    var exportCanvas = document.createElement("canvas");
    exportCanvas.width = canvasElement.width * (scale || 2);
    exportCanvas.height = canvasElement.height * (scale || 2);
    var context = exportCanvas.getContext("2d");

    if (!context) {
      throw new Error("Unable to create canvas context for chart export.");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    context.drawImage(canvasElement, 0, 0, exportCanvas.width, exportCanvas.height);

    var blob = await canvasToBlob(exportCanvas);
    return {
      imageData: await blobToUint8Array(blob),
      width: exportCanvas.width,
      height: exportCanvas.height,
      caption: caption || "Engineering visualisation"
    };
  }

  function addImageToDoc(imageData, width, height, caption, figureNumber) {
    var targetWidth = Math.min(520, Math.round(width / 2));
    var targetHeight = Math.round(targetWidth * (height / width));
    return [
      new window.docx.Paragraph({
        alignment: window.docx.AlignmentType.CENTER,
        spacing: { before: 70, after: 30 },
        children: [
          new window.docx.ImageRun({
            data: imageData,
            type: "png",
            transformation: {
              width: targetWidth,
              height: targetHeight
            }
          })
        ]
      }),
      new window.docx.Paragraph({
        alignment: window.docx.AlignmentType.CENTER,
        spacing: { after: 90 },
        children: [
          new window.docx.TextRun({
            text: "Figure " + figureNumber + " – " + caption,
            italics: true,
            size: 18,
            color: "5D7682"
          })
        ]
      })
    ];
  }

  function createAssumptionsSection(reportData) {
    var children = [
      createSectionHeading("Assumptions")
    ];

    reportData.assumptions.forEach(function (item) {
      children.push(new window.docx.Paragraph({
        text: item,
        bullet: { level: 0 },
        spacing: { after: 60 }
      }));
    });

    children.push(createSectionHeading("Disclaimer"));
    children.push(new window.docx.Paragraph({
      spacing: { after: 80 },
      children: [new window.docx.TextRun({ text: reportData.disclaimer, color: "4B5563" })]
    }));

    return children;
  }

  function createSectionHeading(text) {
    return new window.docx.Paragraph({
      spacing: { before: 150, after: 80 },
      heading: window.docx.HeadingLevel.HEADING_2,
      children: [new window.docx.TextRun({ text: text, bold: true, color: "1778D6", size: 24 })]
    });
  }

  function createCompactTable(headers, rows) {
    return createDataTable(headers, rows.map(function (row) {
      return [row[0], row[1], "", ""];
    }), { compact: true, truncateTo: 2 });
  }

  function createDataTable(headers, rows, options) {
    var doc = window.docx;
    var tableRows = [];
    var config = options || {};

    tableRows.push(new doc.TableRow({
      tableHeader: true,
      children: headers.map(function (header) {
        return new doc.TableCell({
          shading: { fill: "EAF2F8" },
          verticalAlign: doc.VerticalAlign.CENTER,
          children: [
            new doc.Paragraph({
              alignment: doc.AlignmentType.CENTER,
              children: [new doc.TextRun({ text: header, bold: true, size: 18, color: "203040" })]
            })
          ]
        });
      })
    }));

    rows.forEach(function (row) {
      var visibleCells = config.truncateTo ? row.slice(0, config.truncateTo) : row;
      tableRows.push(new doc.TableRow({
        children: visibleCells.map(function (value, index) {
          var isStatusCell = typeof value === "object" && value !== null && value.text !== undefined;
          var cellValue = isStatusCell ? value.text : value;
          var color = isStatusCell ? value.color : "203040";
          var bold = isStatusCell ? Boolean(value.bold) : false;

          return new doc.TableCell({
            verticalAlign: doc.VerticalAlign.CENTER,
            children: [
              new doc.Paragraph({
                alignment: index === 0 ? doc.AlignmentType.LEFT : doc.AlignmentType.CENTER,
                spacing: { after: config.compact ? 20 : 40 },
                children: [
                  new doc.TextRun({
                    text: String(cellValue),
                    size: 18,
                    color: color,
                    bold: bold
                  })
                ]
              })
            ]
          });
        })
      }));
    });

    return new doc.Table({
      width: { size: 100, type: doc.WidthType.PERCENTAGE },
      layout: doc.TableLayoutType.FIXED,
      borders: {
        top: { style: doc.BorderStyle.SINGLE, size: 1, color: "D1DDE3" },
        bottom: { style: doc.BorderStyle.SINGLE, size: 1, color: "D1DDE3" },
        left: { style: doc.BorderStyle.SINGLE, size: 1, color: "D1DDE3" },
        right: { style: doc.BorderStyle.SINGLE, size: 1, color: "D1DDE3" },
        insideHorizontal: { style: doc.BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
        insideVertical: { style: doc.BorderStyle.SINGLE, size: 1, color: "E2E8F0" }
      },
      rows: tableRows
    });
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

  function canvasToBlob(canvas) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error("Failed to convert canvas to Blob."));
      }, "image/png");
    });
  }

  async function blobToUint8Array(blob) {
    return new Uint8Array(await blob.arrayBuffer());
  }

  function triggerDownload(blob, fileName) {
    var link = window.document.createElement("a");
    var url = URL.createObjectURL(blob);
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  function formatFileTimestamp(date) {
    return [
      String(date.getFullYear()),
      "-",
      String(date.getMonth() + 1).padStart(2, "0"),
      "-",
      String(date.getDate()).padStart(2, "0"),
      "_",
      String(date.getHours()).padStart(2, "0"),
      String(date.getMinutes()).padStart(2, "0")
    ].join("");
  }

  function boot() {
    document.querySelectorAll('.et-tool[data-et-tool="' + TOOL_SLUG + '"]').forEach(function (root, index) {
      if (root.dataset.etInitialised === "true") {
        return;
      }

      root.dataset.etInitialised = "true";
      new MomentCapacityTool(root, index).init();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  document.addEventListener("engineering-tools:ready", boot);
}());
