(function () {
  "use strict";

  var TOOL_SLUG = "open-section-capacity-lite";
  var DEFAULT_FAMILY = "UB";
  var DEFAULT_DESIGNATION = "150UB18.0";
  var SECTION_TYPE_LABELS = {
    UB: "Universal Beams",
    UC: "Universal Columns",
    PFC: "Parallel Flange Channels",
    WB: "Welded Beams",
    WC: "Welded Columns",
    EA: "Equal Angles",
    UA: "Unequal Angles"
  };
  var SECTION_DATA = [
    { designation: "610UB125", type: "UB", msx: 927, msy: 130, vv: 1180 },
    { designation: "530UB92.4", type: "UB", msx: 640, msy: 92.2, vv: 939 },
    { designation: "460UB82.1", type: "UB", msx: 496, msy: 79.0, vv: 788 },
    { designation: "410UB59.7", type: "UB", msx: 324, msy: 54.8, vv: 548 },
    { designation: "360UB56.7", type: "UB", msx: 273, msy: 52.0, vv: 496 },
    { designation: "310UB46.2", type: "UB", msx: 197, msy: 44.0, vv: 356 },
    { designation: "250UB37.3", type: "UB", msx: 140, msy: 33.5, vv: 283 },
    { designation: "200UB29.8", type: "UB", msx: 90.9, msy: 24.9, vv: 225 },
    { designation: "180UB22.2", type: "UB", msx: 56.2, msy: 11.7, vv: 186 },
    { designation: "150UB18.0", type: "UB", msx: 38.9, msy: 7.74, vv: 161 },
    { designation: "310UC158", type: "UC", msx: 676, msy: 305, vv: 832 },
    { designation: "250UC89.5", type: "UC", msx: 309, msy: 143, vv: 472 },
    { designation: "200UC59.5", type: "UC", msx: 177, msy: 80.6, vv: 337 },
    { designation: "150UC37.2", type: "UC", msx: 83.6, msy: 36.9, vv: 226 },
    { designation: "100UC14.8", type: "UC", msx: 21.4, msy: 9.91, vv: 83.8 },
    { designation: "380PFC", type: "PFC", msx: 238, msy: 33.8, vv: 657 },
    { designation: "300PFC", type: "PFC", msx: 152, msy: 26.1, vv: 415 },
    { designation: "250PFC", type: "PFC", msx: 114, msy: 24.0, vv: 346 },
    { designation: "200PFC", type: "PFC", msx: 59.7, msy: 13.2, vv: 207 },
    { designation: "150PFC", type: "PFC", msx: 37.0, msy: 11.1, vv: 156 },
    { designation: "100PFC", type: "PFC", msx: 11.6, msy: 3.46, vv: 72.6 },
    { designation: "1200WB455", type: "WB", msx: 7110, msy: 1260, vv: 2900 },
    { designation: "1000WB322", type: "WB", msx: 4130, msy: 646, vv: 2490 },
    { designation: "900WB282", type: "WB", msx: 3440, msy: 645, vv: 1730 },
    { designation: "800WB192", type: "WB", msx: 2030, msy: 318, vv: 1190 },
    { designation: "700WB173", type: "WB", msx: 1610, msy: 267, vv: 1100 },
    { designation: "500WC440", type: "WC", msx: 2620, msy: 1260, vv: 2420 },
    { designation: "400WC361", type: "WC", msx: 1880, msy: 810, vv: 2120 },
    { designation: "350WC280", type: "WC", msx: 1240, msy: 618, vv: 1160 },
    { designation: "200x200x26EA", type: "EA", msx: 152, msy: 67.3 },
    { designation: "150x150x19EA", type: "EA", msx: 62.6, msy: 27.8 },
    { designation: "125x125x16EA", type: "EA", msx: 38.6, msy: 17.1 },
    { designation: "100x100x12EA", type: "EA", msx: 18.9, msy: 8.41 },
    { designation: "75x75x10EA", type: "EA", msx: 8.8, msy: 3.93 },
    { designation: "150x100x12UA", type: "UA", msx: 27.6, msy: 9.54 },
    { designation: "125x75x12UA", type: "UA", msx: 18.5, msy: 5.56 },
    { designation: "100x75x10UA", type: "UA", msx: 11.3, msy: 4.59 },
    { designation: "75x50x8UA", type: "UA", msx: 4.9, msy: 1.71 }
  ];
  var FIELD_LIMITS = {
    "moment-x": { min: 0, max: 20000, label: "Major-axis moment" },
    "moment-y": { min: 0, max: 20000, label: "Minor-axis moment" },
    shear: { min: 0, max: 30000, label: "Design shear" }
  };

  function getUtils() {
    return window.EngineeringTools && window.EngineeringTools.utils ? window.EngineeringTools.utils : null;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function parseNumber(value) {
    var parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function formatNumber(value, decimals) {
    var utils = getUtils();
    if (utils && typeof utils.formatNumber === "function") {
      return utils.formatNumber(value, decimals);
    }

    return Number(value).toFixed(decimals);
  }

  function getSectionsForFamily(family) {
    return SECTION_DATA.filter(function (section) {
      return section.type === family;
    });
  }

  function getSectionByDesignation(family, designation) {
    return getSectionsForFamily(family).find(function (section) {
      return section.designation === designation;
    }) || null;
  }

  function getDescriptor(section) {
    var angleMatch = section.designation.match(/^(\d+)x(\d+)x(\d+(?:\.\d+)?)(EA|UA)$/);
    if (angleMatch) {
      return {
        depth: Number(angleMatch[1]),
        width: Number(angleMatch[2]),
        thickness: Number(angleMatch[3]),
        mass: null,
        note: "Leg sizes are derived directly from the angle designation."
      };
    }

    var rolledMatch = section.designation.match(/^(\d+)(UB|UC|PFC|WB|WC)(\d+(?:\.\d+)?)$/);
    if (!rolledMatch) {
      return {
        depth: null,
        width: null,
        thickness: null,
        mass: null,
        note: "Descriptor values are unavailable for the current section."
      };
    }

    var widthRatios = {
      UB: 0.52,
      UC: 0.82,
      PFC: 0.38,
      WB: 0.48,
      WC: 0.8
    };
    var type = rolledMatch[2];
    var depth = Number(rolledMatch[1]);

    return {
      depth: depth,
      width: Math.round(depth * widthRatios[type]),
      thickness: null,
      mass: Number(rolledMatch[3]),
      note: "Depth and mass come from the designation. Width is estimated for visual communication."
    };
  }

  function validate(section, inputs) {
    var errors = {};

    Object.keys(FIELD_LIMITS).forEach(function (key) {
      var rule = FIELD_LIMITS[key];
      var value = parseNumber(inputs[key]);

      if (String(inputs[key]).trim() === "") {
        errors[key] = rule.label + " is required.";
        return;
      }

      if (value === null) {
        errors[key] = "Enter a numeric value for " + rule.label.toLowerCase() + ".";
        return;
      }

      if (value < rule.min) {
        errors[key] = rule.label + " cannot be negative.";
        return;
      }

      if (value > rule.max) {
        errors[key] = rule.label + " is outside the supported range.";
      }
    });

    var shear = parseNumber(inputs.shear);
    if (shear !== null && shear > 0 && !section.vv) {
      errors.shear = "This section does not include a tabulated web shear capacity in the lite table.";
    }

    return errors;
  }

  function calculate(section, inputs) {
    var momentX = parseNumber(inputs["moment-x"]) || 0;
    var momentY = parseNumber(inputs["moment-y"]) || 0;
    var shear = parseNumber(inputs.shear) || 0;
    var majorRatio = momentX / section.msx;
    var minorRatio = momentY / section.msy;
    var shearRatio = section.vv ? shear / section.vv : null;
    var checks = [
      {
        key: "major",
        label: "Major-axis bending",
        demand: momentX,
        capacity: section.msx,
        ratio: majorRatio,
        unit: "kN.m"
      },
      {
        key: "minor",
        label: "Minor-axis bending",
        demand: momentY,
        capacity: section.msy,
        ratio: minorRatio,
        unit: "kN.m"
      }
    ];

    if (shearRatio !== null) {
      checks.push({
        key: "shear",
        label: "Web shear",
        demand: shear,
        capacity: section.vv,
        ratio: shearRatio,
        unit: "kN"
      });
    }

    var governing = checks.reduce(function (current, check) {
      return check.ratio > current.ratio ? check : current;
    }, checks[0]);

    return {
      majorRatio: majorRatio,
      minorRatio: minorRatio,
      shearRatio: shearRatio,
      governing: governing,
      reserveIndex: 1 - governing.ratio,
      status: governing.ratio <= 1 ? "PASS" : "FAIL",
      checks: checks
    };
  }

  function setSelectOptions(select, items, selected) {
    select.innerHTML = items.map(function (item) {
      var isSelected = item.value === selected ? ' selected="selected"' : "";
      return '<option value="' + escapeHtml(item.value) + '"' + isSelected + ">" + escapeHtml(item.label) + "</option>";
    }).join("");
  }

  function OpenSectionCapacityLite(root) {
    this.root = root;
    this.heroPanel = root.querySelector('[data-role="hero-panel"]');
    this.diagram = root.querySelector('[data-role="diagram"]');
    this.checkGrid = root.querySelector('[data-role="check-grid"]');
    this.equationPrimary = root.querySelector('[data-role="equation-primary"]');
    this.equationSecondary = root.querySelector('[data-role="equation-secondary"]');
    this.fields = {
      family: root.querySelector('[data-field="family"]'),
      designation: root.querySelector('[data-field="designation"]'),
      momentX: root.querySelector('[data-field="moment-x"]'),
      momentY: root.querySelector('[data-field="moment-y"]'),
      shear: root.querySelector('[data-field="shear"]')
    };
    this.outputs = {
      statusPill: root.querySelector('[data-output="status-pill"]'),
      governingUtilisation: root.querySelector('[data-output="governing-utilisation"]'),
      heroNote: root.querySelector('[data-output="hero-note"]'),
      statusText: root.querySelector('[data-output="status-text"]'),
      governingCase: root.querySelector('[data-output="governing-case"]'),
      reserveIndex: root.querySelector('[data-output="reserve-index"]'),
      designation: root.querySelector('[data-output="designation"]'),
      diagramNote: root.querySelector('[data-output="diagram-note"]'),
      sectionFamily: root.querySelector('[data-output="section-family"]'),
      depth: root.querySelector('[data-output="depth"]'),
      width: root.querySelector('[data-output="width"]'),
      mass: root.querySelector('[data-output="mass"]'),
      msx: root.querySelector('[data-output="msx"]'),
      msy: root.querySelector('[data-output="msy"]'),
      vv: root.querySelector('[data-output="vv"]'),
      descriptorNote: root.querySelector('[data-output="descriptor-note"]')
    };
    this.actions = {
      reset: root.querySelector('[data-action="reset-inputs"]')
    };
  }

  OpenSectionCapacityLite.prototype.init = function () {
    var self = this;

    this.fields.family.addEventListener("change", function () {
      self.populateDesignations();
      self.update();
    });

    this.fields.designation.addEventListener("change", function () {
      self.update();
    });

    ["momentX", "momentY", "shear"].forEach(function (key) {
      self.fields[key].addEventListener("input", function () {
        self.update();
      });
    });

    if (this.actions.reset) {
      this.actions.reset.addEventListener("click", function () {
        self.fields.family.value = DEFAULT_FAMILY;
        self.populateDesignations(DEFAULT_DESIGNATION);
        self.fields.momentX.value = "10";
        self.fields.momentY.value = "0";
        self.fields.shear.value = "8";
        self.update();
      });
    }

    this.populateDesignations(DEFAULT_DESIGNATION);
    this.renderEquationPlaceholders();
    this.update();
  };

  OpenSectionCapacityLite.prototype.populateDesignations = function (preferredDesignation) {
    var sections = getSectionsForFamily(this.fields.family.value);
    var selectedDesignation = preferredDesignation || (sections[0] ? sections[0].designation : "");

    setSelectOptions(this.fields.designation, sections.map(function (section) {
      return {
        value: section.designation,
        label: section.designation
      };
    }), selectedDesignation);
  };

  OpenSectionCapacityLite.prototype.readInputs = function () {
    return {
      "moment-x": this.fields.momentX.value,
      "moment-y": this.fields.momentY.value,
      shear: this.fields.shear.value
    };
  };

  OpenSectionCapacityLite.prototype.updateValidationUI = function (errors) {
    var self = this;

    this.root.querySelectorAll("[data-error-for]").forEach(function (node) {
      var key = node.getAttribute("data-error-for");
      var field = key === "family" || key === "designation"
        ? self.root.querySelector('[data-field="' + key + '"]')
        : self.root.querySelector('[data-field="' + key + '"]');
      var shell = field ? field.closest(".et-tool__input-wrap") : null;
      node.textContent = errors[key] || "";

      if (shell) {
        shell.classList.toggle("has-error", Boolean(errors[key]));
      }
    });
  };

  OpenSectionCapacityLite.prototype.update = function () {
    var section = getSectionByDesignation(this.fields.family.value, this.fields.designation.value);
    if (!section) {
      this.resetOutputs("Select a valid section to begin the lite check.");
      return;
    }

    var inputs = this.readInputs();
    var errors = validate(section, inputs);
    var descriptor = getDescriptor(section);
    this.updateValidationUI(errors);
    this.renderDescriptor(section, descriptor);

    if (Object.keys(errors).length) {
      this.resetOutputs("Resolve the highlighted inputs to calculate governing utilisation.");
      this.drawDiagram(section, descriptor, null);
      return;
    }

    var result = calculate(section, inputs);
    this.renderResult(section, descriptor, result);
    this.drawDiagram(section, descriptor, result);
    this.renderEquations(section, result);
  };

  OpenSectionCapacityLite.prototype.renderDescriptor = function (section, descriptor) {
    this.outputs.sectionFamily.textContent = SECTION_TYPE_LABELS[section.type] || section.type;
    this.outputs.depth.textContent = descriptor.depth !== null ? formatNumber(descriptor.depth, 0) : "--";
    this.outputs.width.textContent = descriptor.width !== null ? formatNumber(descriptor.width, 0) : "--";
    this.outputs.mass.textContent = descriptor.mass !== null ? formatNumber(descriptor.mass, 1) : "Not available";
    this.outputs.msx.textContent = formatNumber(section.msx, 1) + " kN.m";
    this.outputs.msy.textContent = formatNumber(section.msy, 1) + " kN.m";
    this.outputs.vv.textContent = section.vv ? formatNumber(section.vv, 1) + " kN" : "Not available";
    this.outputs.descriptorNote.textContent = descriptor.note;
  };

  OpenSectionCapacityLite.prototype.renderResult = function (section, descriptor, result) {
    var tone = result.status === "PASS" ? "pass" : "fail";

    this.heroPanel.dataset.tone = tone;
    this.outputs.statusPill.dataset.tone = tone;
    this.outputs.statusPill.textContent = result.status;
    this.outputs.governingUtilisation.textContent = formatNumber(result.governing.ratio, 3);
    this.outputs.heroNote.textContent = result.governing.label + " governs this section at η = " + formatNumber(result.governing.ratio, 3) + ".";
    this.outputs.statusText.textContent = result.status;
    this.outputs.governingCase.textContent = result.governing.label;
    this.outputs.reserveIndex.textContent = formatNumber(result.reserveIndex, 3);
    this.outputs.designation.textContent = section.designation;
    this.outputs.diagramNote.textContent = result.governing.label + " is currently governing. " + descriptor.note;

    this.checkGrid.innerHTML = result.checks.map(function (check) {
      var state = check.ratio <= 1 ? "pass" : "fail";
      return [
        '<div class="et-oscl__check-row" data-state="', state, '">',
        "<div>",
        "<strong>", escapeHtml(check.label), "</strong>",
        "<span>",
        escapeHtml(formatNumber(check.demand, 2) + " / " + formatNumber(check.capacity, 2) + " " + check.unit),
        "</span>",
        "</div>",
        "<em>", escapeHtml(formatNumber(check.ratio, 3)), "</em>",
        "</div>"
      ].join("");
    }).join("");
  };

  OpenSectionCapacityLite.prototype.resetOutputs = function (message) {
    this.heroPanel.dataset.tone = "idle";
    this.outputs.statusPill.dataset.tone = "";
    this.outputs.statusPill.textContent = "PENDING";
    this.outputs.governingUtilisation.textContent = "--";
    this.outputs.heroNote.textContent = message;
    this.outputs.statusText.textContent = "--";
    this.outputs.governingCase.textContent = "--";
    this.outputs.reserveIndex.textContent = "--";
    this.outputs.designation.textContent = this.fields.designation.value || "--";
    this.outputs.diagramNote.textContent = message;
    this.checkGrid.innerHTML = [
      '<div class="et-oscl__check-row">',
      "<div>",
      "<strong>Awaiting validation</strong>",
      "<span>", escapeHtml(message), "</span>",
      "</div>",
      "<em>--</em>",
      "</div>"
    ].join("");
    this.renderEquationPlaceholders();
    this.drawEmptyDiagram();
  };

  OpenSectionCapacityLite.prototype.renderEquationPlaceholders = function () {
    if (window.katex && typeof window.katex.render === "function") {
      window.katex.render(String.raw`\eta_x = \frac{M_x^\*}{\phi M_{sx}}, \qquad \eta_y = \frac{M_y^\*}{\phi M_{sy}}`, this.equationPrimary, {
        throwOnError: false,
        displayMode: true
      });
      window.katex.render(String.raw`\eta_v = \frac{V^\*}{\phi V_v}, \qquad \eta_{gov} = \max(\eta_x,\eta_y,\eta_v)`, this.equationSecondary, {
        throwOnError: false,
        displayMode: true
      });
      return;
    }

    this.equationPrimary.textContent = "ηx = M*x / ϕMsx,   ηy = M*y / ϕMsy";
    this.equationSecondary.textContent = "ηv = V* / ϕVv,   ηgov = max(ηx, ηy, ηv)";
  };

  OpenSectionCapacityLite.prototype.renderEquations = function (section, result) {
    if (!window.katex || typeof window.katex.render !== "function") {
      this.renderEquationPlaceholders();
      return;
    }

    window.katex.render(
      String.raw`\eta_x = \frac{${formatNumber(result.checks[0].demand, 2)}}{${formatNumber(section.msx, 2)}} = ${formatNumber(result.majorRatio, 3)}, \qquad \eta_y = \frac{${formatNumber(result.checks[1].demand, 2)}}{${formatNumber(section.msy, 2)}} = ${formatNumber(result.minorRatio, 3)}`,
      this.equationPrimary,
      {
        throwOnError: false,
        displayMode: true
      }
    );

    var shearCapacity = section.vv ? formatNumber(section.vv, 2) : "\\text{N/A}";
    var shearRatio = result.shearRatio !== null ? formatNumber(result.shearRatio, 3) : "\\text{N/A}";

    window.katex.render(
      String.raw`\eta_v = \frac{${formatNumber(parseNumber(this.fields.shear.value) || 0, 2)}}{${shearCapacity}} = ${shearRatio}, \qquad \eta_{gov} = ${formatNumber(result.governing.ratio, 3)} \leq 1.0`,
      this.equationSecondary,
      {
        throwOnError: false,
        displayMode: true
      }
    );
  };

  OpenSectionCapacityLite.prototype.drawEmptyDiagram = function () {
    this.diagram.innerHTML = [
      '<g>',
      '<text class="et-oscl__svg-empty" x="210" y="140" text-anchor="middle">Valid inputs are required to draw the section.</text>',
      "</g>"
    ].join("");
  };

  OpenSectionCapacityLite.prototype.drawDiagram = function (section, descriptor, result) {
    if (!section || !descriptor) {
      this.drawEmptyDiagram();
      return;
    }

    var width = descriptor.width || 180;
    var depth = descriptor.depth || 180;
    var scaledWidth = Math.min(160, Math.max(58, width * 0.22));
    var scaledDepth = Math.min(190, Math.max(70, depth * 0.22));
    var centerX = 210;
    var centerY = 138;
    var left = centerX - scaledWidth / 2;
    var top = centerY - scaledDepth / 2;
    var shapeMarkup = buildShapeMarkup(section.type, left, top, scaledWidth, scaledDepth);
    var governingText = result ? result.governing.label + " governs" : "Awaiting valid inputs";

    this.diagram.innerHTML = [
      buildGrid(),
      '<line class="et-oscl__svg-axis" x1="30" y1="' + centerY + '" x2="390" y2="' + centerY + '"></line>',
      '<line class="et-oscl__svg-axis" x1="' + centerX + '" y1="24" x2="' + centerX + '" y2="252"></line>',
      shapeMarkup,
      '<circle class="et-oscl__svg-centroid" cx="' + centerX + '" cy="' + centerY + '" r="4"></circle>',
      '<line class="et-oscl__svg-dimension" x1="' + (left - 28) + '" y1="' + top + '" x2="' + (left - 28) + '" y2="' + (top + scaledDepth) + '"></line>',
      '<line class="et-oscl__svg-dimension" x1="' + left + '" y1="' + (top + scaledDepth + 26) + '" x2="' + (left + scaledWidth) + '" y2="' + (top + scaledDepth + 26) + '"></line>',
      '<text class="et-oscl__svg-label" x="' + (left - 34) + '" y="' + centerY + '" text-anchor="end">' + escapeHtml(formatNumber(depth, 0)) + ' mm</text>',
      '<text class="et-oscl__svg-label" x="' + centerX + '" y="' + (top + scaledDepth + 46) + '" text-anchor="middle">' + escapeHtml(formatNumber(width, 0)) + ' mm</text>',
      '<text class="et-oscl__svg-label" x="' + (centerX + 8) + '" y="' + (centerY - 10) + '">C</text>',
      '<text class="et-oscl__svg-label" x="360" y="' + (centerY - 8) + '">x-x</text>',
      '<text class="et-oscl__svg-label" x="' + (centerX + 8) + '" y="42">y-y</text>',
      '<line class="et-oscl__svg-arrow" x1="308" y1="72" x2="350" y2="72"></line>',
      '<line class="et-oscl__svg-arrow" x1="350" y1="72" x2="342" y2="66"></line>',
      '<line class="et-oscl__svg-arrow" x1="350" y1="72" x2="342" y2="78"></line>',
      '<text class="et-oscl__svg-label" x="308" y="62">M*x, M*y, V*</text>',
      '<text class="et-oscl__svg-label" x="210" y="268" text-anchor="middle">' + escapeHtml(governingText) + '</text>'
    ].join("");
  };

  function buildGrid() {
    var lines = [];
    var x;

    for (x = 0; x <= 420; x += 24) {
      lines.push('<line class="et-oscl__svg-grid" x1="' + x + '" y1="0" x2="' + x + '" y2="280"></line>');
    }

    for (x = 0; x <= 280; x += 24) {
      lines.push('<line class="et-oscl__svg-grid" x1="0" y1="' + x + '" x2="420" y2="' + x + '"></line>');
    }

    return lines.join("");
  }

  function buildShapeMarkup(type, left, top, width, depth) {
    if (type === "PFC") {
      return [
        '<path class="et-oscl__svg-shape" d="M', left + width * 0.15, " ", top,
        " L", left + width, " ", top,
        " L", left + width, " ", top + depth * 0.18,
        " L", left + width * 0.36, " ", top + depth * 0.18,
        " L", left + width * 0.36, " ", top + depth * 0.82,
        " L", left + width, " ", top + depth * 0.82,
        " L", left + width, " ", top + depth,
        " L", left + width * 0.15, " ", top + depth,
        ' Z"></path>'
      ].join("");
    }

    if (type === "EA" || type === "UA") {
      return [
        '<path class="et-oscl__svg-shape" d="M', left, " ", top,
        " L", left + width, " ", top,
        " L", left + width, " ", top + depth * 0.18,
        " L", left + width * 0.28, " ", top + depth * 0.18,
        " L", left + width * 0.28, " ", top + depth,
        " L", left, " ", top + depth,
        ' Z"></path>'
      ].join("");
    }

    return [
      '<path class="et-oscl__svg-shape" d="M', left, " ", top,
      " L", left + width, " ", top,
      " L", left + width, " ", top + depth * 0.18,
      " L", left + width * 0.62, " ", top + depth * 0.18,
      " L", left + width * 0.62, " ", top + depth * 0.82,
      " L", left + width, " ", top + depth * 0.82,
      " L", left + width, " ", top + depth,
      " L", left, " ", top + depth,
      " L", left, " ", top + depth * 0.82,
      " L", left + width * 0.38, " ", top + depth * 0.82,
      " L", left + width * 0.38, " ", top + depth * 0.18,
      " L", left, " ", top + depth * 0.18,
      ' Z"></path>'
    ].join("");
  }

  function boot() {
    document.querySelectorAll('[data-et-tool="' + TOOL_SLUG + '"]').forEach(function (root) {
      if (root.dataset.etInitialised === "true") {
        return;
      }

      root.dataset.etInitialised = "true";
      new OpenSectionCapacityLite(root).init();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  document.addEventListener("engineering-tools:ready", boot);
}());
