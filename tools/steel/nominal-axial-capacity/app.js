(function () {
  "use strict";

  var TOOL_SLUG = "nominal-axial-capacity";
  var STORAGE_PREFIX = "engineering-tools-nominal-axial-capacity-v2";
  var PHI = 0.9;
  var PI = Math.PI;
  var SVG_NS = "http://www.w3.org/2000/svg";
  var SECTION_TYPE_OPTIONS = [
    { value: "solidCircle", label: "Solid circle" },
    { value: "circularHollow", label: "Circular hollow section" },
    { value: "solidSquare", label: "Solid square" },
    { value: "squareHollow", label: "Square hollow section" },
    { value: "solidRectangle", label: "Solid rectangle" },
    { value: "rectangleHollow", label: "Rectangular hollow section" },
    { value: "iSection", label: "I-section" }
  ];
  var MEMBER_TYPES = [
    {
      value: "Braced member",
      label: "Braced member",
      endRestraints: [
        { value: "Fixed against rotation at both ends", label: "Fixed against rotation at both ends", ke: 0.7 },
        { value: "Pinned - fixed", label: "Pinned - fixed", ke: 0.85 },
        { value: "Pinned - pinned", label: "Pinned - pinned", ke: 1.0 }
      ]
    },
    {
      value: "Sway member",
      label: "Sway member",
      endRestraints: [
        { value: "Fixed rotation - fixed", label: "Fixed rotation - fixed", ke: 1.2 },
        { value: "Free rotation - fixed", label: "Free rotation - fixed", ke: 2.2 },
        { value: "Fixed rotation - pinned", label: "Fixed rotation - pinned", ke: 2.2 }
      ]
    }
  ];
  var SECTION_DESCRIPTIONS = [
    {
      value: "rhs-chs-stress-relieved",
      label: "RHS / CHS stress-relieved",
      details: "Hot-formed RHS sections and CHS sections. Cold-formed, stress-relieved RHS sections and CHS sections.",
      kf: 1.0,
      alphaB: -1.0
    },
    {
      value: "rhs-chs-non-stress-relieved",
      label: "RHS / CHS non-stress-relieved",
      details: "Cold-formed, non-stress-relieved RHS sections and CHS sections.",
      kf: 1.0,
      alphaB: -0.5
    },
    {
      value: "rolled-ub-uc-and-welded-box",
      label: "Rolled UB / UC and welded box",
      details: "Hot-rolled UB and UC sections with flange thickness up to 40 mm, welded H/I sections from flame-cut plates, and welded box sections.",
      kf: 1.0,
      alphaB: 0.0
    },
    {
      value: "channels-tees-other-listed",
      label: "Channels, tees, and other listed sections",
      details: "Tees flame-cut from universal sections and angles, hot-rolled channels, welded H/I sections from as-rolled plates up to 40 mm, and other sections not listed elsewhere.",
      kf: 1.0,
      alphaB: 0.5
    },
    {
      value: "heavy-rolled-ub-uc",
      label: "Heavy rolled UB / UC",
      details: "Hot-rolled UB and UC sections with flange thickness over 40 mm, and welded H/I sections fabricated from as-rolled plates over 40 mm.",
      kf: 1.0,
      alphaB: 1.0
    },
    {
      value: "compact-hollow-sections",
      label: "Compact hollow sections",
      details: "Hot-formed RHS / CHS and cold-formed stress-relieved or non-stress-relieved RHS / CHS sections.",
      kf: 0.9,
      alphaB: -0.5
    },
    {
      value: "ub-uc-and-box-reduced-kf",
      label: "UB / UC and box, reduced kf",
      details: "Hot-rolled UB and UC sections up to 40 mm flange thickness, and welded box sections.",
      kf: 0.9,
      alphaB: 0.0
    },
    {
      value: "welded-h-i-reduced-kf",
      label: "Welded H / I sections, reduced kf",
      details: "Welded H-sections and I-sections with flange thickness up to 40 mm.",
      kf: 0.9,
      alphaB: 0.5
    },
    {
      value: "other-sections-reduced-kf",
      label: "Other sections, reduced kf",
      details: "Other sections not listed in this table group.",
      kf: 0.9,
      alphaB: 1.0
    }
  ];
  var SHAPE_DEFINITIONS = {
    solidCircle: {
      label: "Solid circle",
      defaults: { r: "60" },
      fields: [
        { symbol: "r", label: "Radius", unit: "mm", help: "Radius of the circular section.", min: 1, max: 5000 }
      ]
    },
    circularHollow: {
      label: "Circular hollow section",
      defaults: { r_o: "75", r_i: "65" },
      fields: [
        { symbol: "r_o", label: "Outer radius", unit: "mm", help: "Outer radius of the CHS.", min: 1, max: 5000 },
        { symbol: "r_i", label: "Inner radius", unit: "mm", help: "Inner radius of the CHS.", min: 1, max: 5000 }
      ]
    },
    solidSquare: {
      label: "Solid square",
      defaults: { a: "120" },
      fields: [
        { symbol: "a", label: "Width", unit: "mm", help: "Overall width of the square section.", min: 1, max: 5000 }
      ]
    },
    squareHollow: {
      label: "Square hollow section",
      defaults: { a_o: "125", a_i: "109" },
      fields: [
        { symbol: "a_o", label: "Outer width", unit: "mm", help: "Outside width of the SHS.", min: 1, max: 5000 },
        { symbol: "a_i", label: "Inner width", unit: "mm", help: "Inside width of the SHS.", min: 1, max: 5000 }
      ]
    },
    solidRectangle: {
      label: "Solid rectangle",
      defaults: { b: "150", h: "100" },
      fields: [
        { symbol: "b", label: "Width", unit: "mm", help: "Section width.", min: 1, max: 5000 },
        { symbol: "h", label: "Depth", unit: "mm", help: "Section depth.", min: 1, max: 5000 }
      ]
    },
    rectangleHollow: {
      label: "Rectangular hollow section",
      defaults: { b_o: "150", h_o: "100", b_i: "134", h_i: "84" },
      fields: [
        { symbol: "b_o", label: "Outer width", unit: "mm", help: "Outside width of the RHS.", min: 1, max: 5000 },
        { symbol: "h_o", label: "Outer depth", unit: "mm", help: "Outside depth of the RHS.", min: 1, max: 5000 },
        { symbol: "b_i", label: "Inner width", unit: "mm", help: "Inside width of the RHS.", min: 1, max: 5000 },
        { symbol: "h_i", label: "Inner depth", unit: "mm", help: "Inside depth of the RHS.", min: 1, max: 5000 }
      ]
    },
    iSection: {
      label: "I-section",
      defaults: { b_f: "200", t_f: "12", t_w: "8", D: "300", d_1: "276" },
      fields: [
        { symbol: "b_f", label: "Flange width", unit: "mm", help: "Overall flange width.", min: 1, max: 5000 },
        { symbol: "t_f", label: "Flange thickness", unit: "mm", help: "Flange plate thickness.", min: 1, max: 5000 },
        { symbol: "t_w", label: "Web thickness", unit: "mm", help: "Web plate thickness.", min: 1, max: 5000 },
        { symbol: "D", label: "Overall depth", unit: "mm", help: "Total section depth.", min: 1, max: 5000 },
        { symbol: "d_1", label: "Clear web depth", unit: "mm", help: "Clear distance between flange toes.", min: 1, max: 5000 }
      ]
    }
  };
  var FIELD_RULES = {
    L: { label: "Actual length", min: 100, max: 30000, allowZero: false },
    fy: { label: "Yield strength", min: 100, max: 1000, allowZero: false }
  };
  var BASE_DEFAULTS = {
    memberType: "Braced member",
    endRestraint: "Pinned - pinned",
    sectionDescription: "rhs-chs-stress-relieved",
    sectionShape: "rectangleHollow",
    bucklingAxis: "x",
    L: "4000",
    fy: "350"
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

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function uniqueId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }

    return "et-nac-" + Date.now() + "-" + Math.floor(Math.random() * 100000);
  }

  function formatDateTime(value) {
    return new Date(value).toLocaleString("en-AU", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  }

  function formatFileStamp(isoString) {
    var date = new Date(isoString);
    var pad = function (number) {
      return String(number).padStart(2, "0");
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

      var parsed = JSON.parse(raw);
      return parsed === null ? fallback : parsed;
    } catch (error) {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // Ignore storage failures in embedded calculators.
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

  function setFieldValue(field, value) {
    if (field) {
      field.value = String(value);
    }
  }

  function setText(node, value) {
    if (node) {
      node.textContent = value;
    }
  }

  function seedSelect(selectNode, items, formatter) {
    if (!selectNode) {
      return;
    }

    selectNode.innerHTML = items.map(function (item) {
      var label = formatter ? formatter(item) : item.label;
      return '<option value="' + escapeHtml(item.value) + '">' + escapeHtml(label) + "</option>";
    }).join("");
  }

  function pickMemberType(memberTypeValue) {
    return MEMBER_TYPES.find(function (item) {
      return item.value === memberTypeValue;
    }) || MEMBER_TYPES[0];
  }

  function pickSectionDescription(sectionDescriptionValue) {
    return SECTION_DESCRIPTIONS.find(function (item) {
      return item.value === sectionDescriptionValue;
    }) || SECTION_DESCRIPTIONS[0];
  }

  function pickEndRestraint(memberTypeValue, endRestraintValue) {
    var memberType = pickMemberType(memberTypeValue);
    return memberType.endRestraints.find(function (item) {
      return item.value === endRestraintValue;
    }) || memberType.endRestraints[0];
  }

  function pickShape(shapeKey) {
    return SHAPE_DEFINITIONS[shapeKey] || SHAPE_DEFINITIONS.rectangleHollow;
  }

  function getShapeDefaults(shapeKey) {
    return Object.assign({}, pickShape(shapeKey).defaults);
  }

  function getShapeFields(shapeKey) {
    return pickShape(shapeKey).fields.slice();
  }

  function parseSectionParams(rawParams) {
    return Object.fromEntries(Object.keys(rawParams).map(function (key) {
      return [key, Number(rawParams[key]) || 0];
    }));
  }

  function validateSectionParams(shapeKey, rawParams) {
    var errors = {};
    var fields = getShapeFields(shapeKey);
    var params = parseSectionParams(rawParams);

    fields.forEach(function (field) {
      var rawValue = rawParams[field.symbol] || "";

      if (String(rawValue).trim().length === 0) {
        errors[field.symbol] = "This field is required.";
        return;
      }

      if (!/^-?\d*\.?\d*$/.test(String(rawValue).trim())) {
        errors[field.symbol] = "Enter a numeric value only.";
        return;
      }

      if (!Number.isFinite(Number(rawValue)) || Number(rawValue) <= 0) {
        errors[field.symbol] = "Value must be greater than zero.";
      }
    });

    if (Object.keys(errors).length > 0) {
      return errors;
    }

    if (shapeKey === "circularHollow" && params.r_i >= params.r_o) {
      errors.r_i = "Inner radius must be smaller than outer radius.";
    }

    if (shapeKey === "squareHollow" && params.a_i >= params.a_o) {
      errors.a_i = "Inner width must be smaller than outer width.";
    }

    if (shapeKey === "rectangleHollow") {
      if (params.b_i >= params.b_o) {
        errors.b_i = "Inner width must be smaller than outer width.";
      }

      if (params.h_i >= params.h_o) {
        errors.h_i = "Inner depth must be smaller than outer depth.";
      }
    }

    if (shapeKey === "iSection") {
      if (params.d_1 >= params.D) {
        errors.d_1 = "Clear web depth must be smaller than overall depth.";
      }

      if ((2 * params.t_f) + params.d_1 > params.D) {
        errors.D = "Overall depth must accommodate flanges and clear web depth.";
      }

      if (params.t_w >= params.b_f) {
        errors.t_w = "Web thickness must be smaller than flange width.";
      }
    }

    return errors;
  }

  function calculateSectionProperties(shapeKey, rawParams) {
    var p = parseSectionParams(rawParams);
    var result = {
      A: 0,
      rx: 0,
      ry: 0,
      isValid: false
    };

    if (shapeKey === "solidCircle") {
      var r = p.r;
      result.A = PI * r * r;
      result.rx = r / 2;
      result.ry = r / 2;
    } else if (shapeKey === "circularHollow") {
      var ro = p.r_o;
      var ri = p.r_i;

      if (ri >= ro) {
        return result;
      }

      result.A = PI * ((ro * ro) - (ri * ri));
      result.rx = 0.5 * Math.sqrt((ro * ro) + (ri * ri));
      result.ry = result.rx;
    } else if (shapeKey === "solidSquare") {
      var a = p.a;
      result.A = a * a;
      result.rx = a / (2 * Math.sqrt(3));
      result.ry = result.rx;
    } else if (shapeKey === "squareHollow") {
      var ao = p.a_o;
      var ai = p.a_i;

      if (ai >= ao) {
        return result;
      }

      var squareI = (Math.pow(ao, 4) - Math.pow(ai, 4)) / 12;
      result.A = (ao * ao) - (ai * ai);
      result.rx = Math.sqrt(squareI / result.A);
      result.ry = result.rx;
    } else if (shapeKey === "solidRectangle") {
      var b = p.b;
      var h = p.h;
      result.A = b * h;
      result.rx = h / (2 * Math.sqrt(3));
      result.ry = b / (2 * Math.sqrt(3));
    } else if (shapeKey === "rectangleHollow") {
      var bo = p.b_o;
      var ho = p.h_o;
      var bi = p.b_i;
      var hi = p.h_i;

      if (bi >= bo || hi >= ho) {
        return result;
      }

      var ixRect = ((bo * Math.pow(ho, 3)) - (bi * Math.pow(hi, 3))) / 12;
      var iyRect = ((Math.pow(bo, 3) * ho) - (Math.pow(bi, 3) * hi)) / 12;
      result.A = (bo * ho) - (bi * hi);
      result.rx = Math.sqrt(ixRect / result.A);
      result.ry = Math.sqrt(iyRect / result.A);
    } else if (shapeKey === "iSection") {
      var bf = p.b_f;
      var tf = p.t_f;
      var tw = p.t_w;
      var D = p.D;
      var d1 = p.d_1;

      result.A = (2 * tf * bf) + (tw * d1);
      var ixI = ((bf * Math.pow(D, 3)) - (bf * Math.pow(d1, 3)) + (tw * Math.pow(d1, 3))) / 12;
      var iyI = ((2 * tf * Math.pow(bf, 3)) + (d1 * Math.pow(tw, 3))) / 12;
      result.rx = Math.sqrt(ixI / result.A);
      result.ry = Math.sqrt(iyI / result.A);
    }

    result.isValid = result.A > 0 && result.rx > 0 && result.ry > 0 && isFinite(result.A) && isFinite(result.rx) && isFinite(result.ry);
    return result;
  }

  function createEmptyVisual(svg) {
    if (!svg) {
      return;
    }

    svg.innerHTML = "";
    var text = document.createElementNS(SVG_NS, "text");
    text.setAttribute("x", "290");
    text.setAttribute("y", "180");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("fill", "#5f6f81");
    text.setAttribute("font-size", "16");
    text.textContent = "Enter valid inputs to generate the live member visualisation.";
    svg.appendChild(text);
  }

  function createPinnedSupport(x, y, direction) {
    return [
      '<polygon points="' + (x - 18) + "," + y + " " + (x + 18) + "," + y + " " + x + "," + (y + (22 * direction)) + '" fill="rgba(42,105,209,0.16)" stroke="#2a69d1" stroke-width="1.6"></polygon>',
      '<line x1="' + (x - 30) + '" y1="' + (y + (26 * direction)) + '" x2="' + (x + 30) + '" y2="' + (y + (26 * direction)) + '" stroke="#174a99" stroke-width="2"></line>'
    ].join("");
  }

  function createFixedSupport(x, y, direction) {
    var offset = 26 * direction;

    return [
      '<rect x="' + (x - 10) + '" y="' + Math.min(y, y + offset) + '" width="20" height="' + Math.abs(offset) + '" fill="rgba(42,105,209,0.16)" stroke="#2a69d1" stroke-width="1.6"></rect>',
      '<line x1="' + (x - 30) + '" y1="' + (y + offset) + '" x2="' + (x + 30) + '" y2="' + (y + offset) + '" stroke="#174a99" stroke-width="2"></line>'
    ].join("");
  }

  function createFreeEnd(x, y) {
    return '<circle cx="' + x + '" cy="' + y + '" r="12" fill="#ffffff" stroke="#2a69d1" stroke-width="2"></circle>';
  }

  function createSupportSymbol(memberTypeValue, endRestraintValue, position, x, y) {
    var top = position === "top";
    var direction = top ? -1 : 1;
    var restraint = pickEndRestraint(memberTypeValue, endRestraintValue);

    if (restraint.value === "Pinned - pinned") {
      return createPinnedSupport(x, y, direction);
    }

    if (restraint.value === "Pinned - fixed") {
      return top ? createPinnedSupport(x, y, direction) : createFixedSupport(x, y, direction);
    }

    if (restraint.value === "Fixed against rotation at both ends" || restraint.value === "Fixed rotation - fixed") {
      return createFixedSupport(x, y, direction);
    }

    if (restraint.value === "Free rotation - fixed") {
      return top ? createFreeEnd(x, y) : createFixedSupport(x, y, direction);
    }

    if (restraint.value === "Fixed rotation - pinned") {
      return top ? createFixedSupport(x, y, direction) : createPinnedSupport(x, y, direction);
    }

    return createPinnedSupport(x, y, direction);
  }

  function buildMemberVisualMarkup(inputs, results, shapeLabel) {
    var memberX = 290;
    var memberTop = 70;
    var memberBottom = 290;
    var memberHalfWidth = Math.max(22, Math.min(86, results.r / 1.5)) / 2;
    var axisText = inputs.bucklingAxis === "x" ? "Buckling about x-axis" : "Buckling about y-axis";
    var lengthText = "L = " + formatNumber(inputs.L, 0) + " mm";
    var effectiveLengthText = "L_e = " + formatNumber(results.Le, 0) + " mm";
    var radiusText = "r = " + formatNumber(results.r, 2) + " mm";
    var areaText = "A_n = " + formatNumber(results.An, 0) + " mm²";
    var supportTop = createSupportSymbol(inputs.memberType, inputs.endRestraint, "top", memberX, memberTop - 12);
    var supportBottom = createSupportSymbol(inputs.memberType, inputs.endRestraint, "bottom", memberX, memberBottom + 12);
    var sectionShape = "";

    if (inputs.sectionShape === "solidCircle" || inputs.sectionShape === "circularHollow") {
      sectionShape = '<circle cx="110" cy="210" r="' + memberHalfWidth + '" fill="rgba(42,105,209,0.08)" stroke="#2a69d1" stroke-width="2"></circle>';

      if (inputs.sectionShape === "circularHollow") {
        sectionShape += '<circle cx="110" cy="210" r="' + Math.max(0, memberHalfWidth - 10) + '" fill="#f8fbff" stroke="#2a69d1" stroke-width="1.5"></circle>';
      }
    } else if (inputs.sectionShape === "solidSquare" || inputs.sectionShape === "squareHollow") {
      sectionShape = '<rect x="' + (110 - memberHalfWidth) + '" y="' + (210 - memberHalfWidth) + '" width="' + (memberHalfWidth * 2) + '" height="' + (memberHalfWidth * 2) + '" rx="4" fill="rgba(42,105,209,0.08)" stroke="#2a69d1" stroke-width="2"></rect>';

      if (inputs.sectionShape === "squareHollow") {
        sectionShape += '<rect x="' + (110 - (memberHalfWidth - 10)) + '" y="' + (210 - (memberHalfWidth - 10)) + '" width="' + ((memberHalfWidth - 10) * 2) + '" height="' + ((memberHalfWidth - 10) * 2) + '" rx="3" fill="#f8fbff" stroke="#2a69d1" stroke-width="1.5"></rect>';
      }
    } else if (inputs.sectionShape === "solidRectangle" || inputs.sectionShape === "rectangleHollow") {
      var outerWidth = memberHalfWidth * 2.4;
      var outerDepth = memberHalfWidth * 1.6;
      sectionShape = '<rect x="' + (110 - (outerWidth / 2)) + '" y="' + (210 - (outerDepth / 2)) + '" width="' + outerWidth + '" height="' + outerDepth + '" rx="4" fill="rgba(42,105,209,0.08)" stroke="#2a69d1" stroke-width="2"></rect>';

      if (inputs.sectionShape === "rectangleHollow") {
        sectionShape += '<rect x="' + (110 - ((outerWidth - 20) / 2)) + '" y="' + (210 - ((outerDepth - 20) / 2)) + '" width="' + (outerWidth - 20) + '" height="' + (outerDepth - 20) + '" rx="3" fill="#f8fbff" stroke="#2a69d1" stroke-width="1.5"></rect>';
      }
    } else {
      sectionShape = [
        '<path d="M 58 168 H 162 V 184 H 121 V 236 H 162 V 252 H 58 V 236 H 99 V 184 H 58 Z" fill="rgba(42,105,209,0.08)" stroke="#2a69d1" stroke-width="2"></path>',
        '<line x1="110" y1="162" x2="110" y2="258" stroke="#2a69d1" stroke-dasharray="4 4"></line>',
        '<line x1="50" y1="210" x2="170" y2="210" stroke="#2a69d1" stroke-dasharray="4 4"></line>'
      ].join("");
    }

    return [
      '<defs>',
      '<marker id="et-nac-arrow-' + escapeHtml(inputs.instanceKey) + '" markerWidth="12" markerHeight="12" refX="6" refY="6" orient="auto">',
      '<path d="M 0 0 L 12 6 L 0 12 z" fill="#2a69d1"></path>',
      "</marker>",
      "</defs>",
      '<line x1="' + memberX + '" y1="' + memberTop + '" x2="' + memberX + '" y2="' + memberBottom + '" stroke="#174a99" stroke-width="10" stroke-linecap="round"></line>',
      supportTop,
      supportBottom,
      '<line x1="430" y1="' + memberTop + '" x2="430" y2="' + memberBottom + '" stroke="#2a69d1" stroke-width="1.6" marker-start="url(#et-nac-arrow-' + escapeHtml(inputs.instanceKey) + ')" marker-end="url(#et-nac-arrow-' + escapeHtml(inputs.instanceKey) + ')"></line>',
      '<text x="442" y="184" fill="#174a99" font-size="14" font-weight="700">' + escapeHtml(lengthText) + "</text>",
      '<line x1="465" y1="' + (memberTop + 20) + '" x2="465" y2="' + (memberBottom - 20) + '" stroke="#7ea7e3" stroke-width="1.6" marker-start="url(#et-nac-arrow-' + escapeHtml(inputs.instanceKey) + ')" marker-end="url(#et-nac-arrow-' + escapeHtml(inputs.instanceKey) + ')"></line>',
      '<text x="477" y="202" fill="#2a69d1" font-size="14" font-weight="700">' + escapeHtml(effectiveLengthText) + "</text>",
      '<line x1="255" y1="180" x2="325" y2="180" stroke="#2a69d1" stroke-width="1.5" stroke-dasharray="5 5"></line>',
      '<line x1="' + memberX + '" y1="145" x2="' + memberX + '" y2="215" stroke="#2a69d1" stroke-width="1.5" stroke-dasharray="5 5"></line>',
      '<circle cx="' + memberX + '" cy="180" r="5" fill="#2a69d1"></circle>',
      '<text x="246" y="140" fill="#174a99" font-size="13">Centroid / axes</text>',
      '<text x="54" y="78" fill="#17212b" font-size="15" font-weight="700">' + escapeHtml(shapeLabel) + "</text>",
      '<text x="54" y="98" fill="#5f6f81" font-size="13">' + escapeHtml(axisText) + "</text>",
      '<text x="54" y="302" fill="#174a99" font-size="13" font-weight="700">' + escapeHtml(radiusText) + "</text>",
      '<text x="54" y="322" fill="#5f6f81" font-size="13">' + escapeHtml(areaText) + "</text>",
      sectionShape
    ].join("");
  }

  function utilisationGuide(alphaC) {
    if (alphaC > 0.85) {
      return "Low slenderness response with limited buckling reduction.";
    }

    if (alphaC > 0.6) {
      return "Moderate buckling reduction is governing the axial strength.";
    }

    return "";
  }

  function NominalAxialCapacityTool(root, index) {
    this.root = root;
    this.index = index;
    this.scope = root.getAttribute("data-et-storage-scope") || ("instance-" + index);
    this.instanceKey = root.getAttribute("data-et-instance") || ("instance-" + index);
    this.formStorageKey = STORAGE_PREFIX + "::form::" + this.scope;
    this.resultsStorageKey = STORAGE_PREFIX + "::results::" + this.scope;
    this.fields = {};
    this.outputs = {};
    this.actions = {};
    this.panels = {};
    this.roles = {};
    this.geometryInputs = {};
    this.savedResults = readStorage(this.resultsStorageKey, []);
    this.lastState = null;
  }

  NominalAxialCapacityTool.prototype.init = function () {
    this.captureNodes();
    this.seedStaticSelects();
    this.renderEndRestraints(BASE_DEFAULTS.memberType, BASE_DEFAULTS.endRestraint);
    this.renderGeometryFields(BASE_DEFAULTS.sectionShape, getShapeDefaults(BASE_DEFAULTS.sectionShape));
    this.bindEvents();
    this.renderEquations();
    this.restoreFormState();
    this.renderSavedResults();
    this.update();
  };

  NominalAxialCapacityTool.prototype.captureNodes = function () {
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

  NominalAxialCapacityTool.prototype.seedStaticSelects = function () {
    seedSelect(this.fields["member-type"], MEMBER_TYPES);
    seedSelect(this.fields["section-description"], SECTION_DESCRIPTIONS);
    seedSelect(this.fields["section-shape"], SECTION_TYPE_OPTIONS);
    setFieldValue(this.fields["member-type"], BASE_DEFAULTS.memberType);
    setFieldValue(this.fields["section-description"], BASE_DEFAULTS.sectionDescription);
    setFieldValue(this.fields["section-shape"], BASE_DEFAULTS.sectionShape);
    setFieldValue(this.fields["buckling-axis"], BASE_DEFAULTS.bucklingAxis);
    setFieldValue(this.fields.L, BASE_DEFAULTS.L);
    setFieldValue(this.fields.fy, BASE_DEFAULTS.fy);
  };

  NominalAxialCapacityTool.prototype.renderEndRestraints = function (memberTypeValue, selectedValue) {
    var memberType = pickMemberType(memberTypeValue);
    seedSelect(this.fields["end-restraint"], memberType.endRestraints, function (item) {
      return item.label + " • ke = " + item.ke;
    });
    setFieldValue(this.fields["end-restraint"], selectedValue || memberType.endRestraints[0].value);
  };

  NominalAxialCapacityTool.prototype.renderGeometryFields = function (shapeKey, geometryValues) {
    var host = this.roles["geometry-fields"];
    var shape = pickShape(shapeKey);
    var self = this;

    if (!host) {
      return;
    }

    host.innerHTML = shape.fields.map(function (field) {
      var value = geometryValues && geometryValues[field.symbol] !== undefined ? geometryValues[field.symbol] : shape.defaults[field.symbol];

      return [
        '<label class="et-nac__field">',
        '<span class="et-nac__label">' + escapeHtml(field.label) + "</span>",
        '<span class="et-nac__helper">' + escapeHtml(field.help) + "</span>",
        '<span class="et-nac__control">',
        '<input class="et-nac__input" type="number" step="1" min="' + escapeHtml(String(field.min)) + '" max="' + escapeHtml(String(field.max)) + '" value="' + escapeHtml(String(value)) + '" data-et-geometry="' + escapeHtml(field.symbol) + '">',
        '<span class="et-nac__unit">' + escapeHtml(field.unit) + "</span>",
        "</span>",
        '<em class="et-nac__error" data-error-for="geometry-' + escapeHtml(field.symbol) + '"></em>',
        "</label>"
      ].join("");
    }).join("");

    this.geometryInputs = {};
    host.querySelectorAll("[data-et-geometry]").forEach(function (node) {
      var key = node.getAttribute("data-et-geometry");
      self.geometryInputs[key] = node;

      node.addEventListener("input", function () {
        self.persistFormState();
        self.update();
      });

      node.addEventListener("change", function () {
        self.persistFormState();
        self.update();
      });
    });
  };

  NominalAxialCapacityTool.prototype.bindEvents = function () {
    var self = this;

    Object.keys(this.fields).forEach(function (key) {
      if (!self.fields[key]) {
        return;
      }

      self.fields[key].addEventListener("change", function () {
        if (key === "member-type") {
          self.renderEndRestraints(self.fields["member-type"].value, pickMemberType(self.fields["member-type"].value).endRestraints[0].value);
        }

        if (key === "section-shape") {
          self.renderGeometryFields(self.fields["section-shape"].value, getShapeDefaults(self.fields["section-shape"].value));
        }

        self.persistFormState();
        self.update();
      });

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
  };

  NominalAxialCapacityTool.prototype.renderEquations = function () {
    renderKatex(this.roles["equation-primary"], "N_c = \\min(\\alpha_c N_s, N_s),\\qquad \\phi N_c = 0.9N_c", true);
    renderKatex(this.roles["equation-secondary"], "\\lambda_e = \\frac{L_e}{r}\\sqrt{\\frac{k_f f_y}{250}},\\qquad \\lambda = \\lambda_e + \\alpha_a \\alpha_b", true);
    renderKatex(this.roles["equation-tertiary"], "\\alpha_c = \\zeta\\left(1 - \\sqrt{1 - \\left(\\frac{90}{\\zeta\\lambda}\\right)^2}\\right),\\qquad N_s = k_f A_n f_y", true);
  };

  NominalAxialCapacityTool.prototype.restoreFormState = function () {
    var stored = readStorage(this.formStorageKey, null);

    if (!stored || typeof stored !== "object") {
      return;
    }

    setFieldValue(this.fields["member-type"], stored.memberType || BASE_DEFAULTS.memberType);
    setFieldValue(this.fields["section-description"], stored.sectionDescription || BASE_DEFAULTS.sectionDescription);
    setFieldValue(this.fields["section-shape"], stored.sectionShape || BASE_DEFAULTS.sectionShape);
    setFieldValue(this.fields["buckling-axis"], stored.bucklingAxis || BASE_DEFAULTS.bucklingAxis);
    setFieldValue(this.fields.L, stored.L || BASE_DEFAULTS.L);
    setFieldValue(this.fields.fy, stored.fy || BASE_DEFAULTS.fy);
    this.renderEndRestraints(this.fields["member-type"].value, stored.endRestraint || BASE_DEFAULTS.endRestraint);
    this.renderGeometryFields(this.fields["section-shape"].value, stored.geometry || getShapeDefaults(this.fields["section-shape"].value));
  };

  NominalAxialCapacityTool.prototype.persistFormState = function () {
    var geometry = {};

    Object.keys(this.geometryInputs).forEach(function (key) {
      geometry[key] = String(this.geometryInputs[key].value || "");
    }, this);

    writeStorage(this.formStorageKey, {
      memberType: this.fields["member-type"].value,
      endRestraint: this.fields["end-restraint"].value,
      sectionDescription: this.fields["section-description"].value,
      sectionShape: this.fields["section-shape"].value,
      bucklingAxis: this.fields["buckling-axis"].value,
      L: this.fields.L.value,
      fy: this.fields.fy.value,
      geometry: geometry
    });
  };

  NominalAxialCapacityTool.prototype.readInputs = function () {
    var shapeKey = this.fields["section-shape"].value;
    var geometry = {};

    Object.keys(this.geometryInputs).forEach(function (key) {
      geometry[key] = this.geometryInputs[key].value;
    }, this);

    return {
      instanceKey: this.instanceKey,
      memberType: this.fields["member-type"].value,
      endRestraint: this.fields["end-restraint"].value,
      sectionDescription: this.fields["section-description"].value,
      sectionShape: shapeKey,
      bucklingAxis: this.fields["buckling-axis"].value,
      L: parseNumber(this.fields.L.value),
      fy: parseNumber(this.fields.fy.value),
      geometry: geometry
    };
  };

  NominalAxialCapacityTool.prototype.validate = function (inputs) {
    var errors = {};

    Object.keys(FIELD_RULES).forEach(function (key) {
      var rule = FIELD_RULES[key];
      var value = inputs[key];

      if (value === null) {
        errors[key] = "This field is required.";
        return;
      }

      if (!rule.allowZero && value <= 0) {
        errors[key] = "Value must be greater than zero.";
        return;
      }

      if (value < rule.min || value > rule.max) {
        errors[key] = "Expected range " + formatNumber(rule.min, 0) + " to " + formatNumber(rule.max, 0) + ".";
      }
    });

    var sectionErrors = validateSectionParams(inputs.sectionShape, inputs.geometry);
    return {
      fieldErrors: errors,
      sectionErrors: sectionErrors,
      isValid: Object.keys(errors).length === 0 && Object.keys(sectionErrors).length === 0
    };
  };

  NominalAxialCapacityTool.prototype.calculate = function (inputs) {
    var section = pickSectionDescription(inputs.sectionDescription);
    var restraint = pickEndRestraint(inputs.memberType, inputs.endRestraint);
    var properties = calculateSectionProperties(inputs.sectionShape, inputs.geometry);

    if (!properties.isValid) {
      throw new Error("Resolve the highlighted member and geometry fields to view valid results.");
    }

    var An = properties.A;
    var r = inputs.bucklingAxis === "x" ? properties.rx : properties.ry;
    var Ns = section.kf * An * inputs.fy;
    var Le = restraint.ke * inputs.L;
    var Le_r = Le / r;
    var lambda_eta = Le_r * Math.sqrt(section.kf * (inputs.fy / 250));
    var eta = Math.max(0, 0.00326 * (lambda_eta - 13.5));
    var alpha_a = (2100 * (lambda_eta - 13.5)) / ((lambda_eta * lambda_eta) - (15.3 * lambda_eta) + 2050);
    var lambda = lambda_eta + (alpha_a * section.alphaB);
    var zeta = ((Math.pow(Le / 90, 2)) + 1 + eta) / (2 * Math.pow(Le / 90, 2));
    var radicalTerm = Math.max(0, 1 - Math.pow(90 / (zeta * lambda), 2));

    if (!Number.isFinite(lambda) || !Number.isFinite(zeta) || lambda <= 0 || zeta <= 0 || r <= 0 || An <= 0) {
      throw new Error("The current inputs produce a non-physical buckling solution.");
    }

    var alpha_c = zeta * (1 - Math.sqrt(radicalTerm));
    var Nc = Math.min(alpha_c * Ns, Ns);
    var Nuc = PHI * Nc;

    return {
      section: section,
      restraint: restraint,
      properties: properties,
      An: An,
      r: r,
      Le: Le,
      Le_r: Le_r,
      lambda_eta: lambda_eta,
      eta: eta,
      alpha_a: alpha_a,
      lambda: lambda,
      zeta: zeta,
      alpha_c: alpha_c,
      Ns: Ns,
      Nc: Nc,
      Nuc: Nuc
    };
  };

  NominalAxialCapacityTool.prototype.clearErrors = function () {
    this.root.querySelectorAll("[data-error-for]").forEach(function (node) {
      node.textContent = "";
    });
  };

  NominalAxialCapacityTool.prototype.renderErrors = function (validation) {
    var allErrors = Object.assign({}, validation.fieldErrors);
    Object.keys(validation.sectionErrors).forEach(function (key) {
      allErrors["geometry-" + key] = validation.sectionErrors[key];
    });

    Object.keys(allErrors).forEach(function (key) {
      var node = this.root.querySelector('[data-error-for="' + key + '"]');
      if (node) {
        node.textContent = allErrors[key];
      }
    }, this);
  };

  NominalAxialCapacityTool.prototype.renderNotices = function (messages, tone) {
    var host = this.roles["notice-stack"];

    if (!host) {
      return;
    }

    host.innerHTML = (messages || []).map(function (message) {
      return '<div class="et-nac__notice et-nac__notice--' + escapeHtml(tone) + '">' + escapeHtml(message) + "</div>";
    }).join("");
  };

  NominalAxialCapacityTool.prototype.renderInvalidState = function (message) {
    setText(this.outputs["status-pill"], "Awaiting valid inputs");
    setText(this.outputs["capacity-pill"], "No result");
    setText(this.outputs["phi-nc"], "--");
    setText(this.outputs["hero-note"], message || "Results stay disabled until all required values are valid.");
    setText(this.outputs["area-card"], "--");
    setText(this.outputs["radius-card"], "--");
    setText(this.outputs["nc-card"], "--");
    setText(this.outputs["section-family"], "--");
    setText(this.outputs.kf, "--");
    setText(this.outputs["alpha-b"], "--");
    setText(this.outputs.ke, "--");
    setText(this.outputs.rx, "--");
    setText(this.outputs.ry, "--");
    setText(this.outputs.eta, "--");
    setText(this.outputs["alpha-a"], "--");
    setText(this.outputs.zeta, "--");
    setText(this.outputs.lambda, "--");
    setText(this.outputs["alpha-c"], "--");
    setText(this.outputs["le-r"], "--");
    setText(this.outputs["visual-shape"], "Section visualisation paused");
    setText(this.outputs["visual-axis"], "Check required geometry and member inputs");
    setText(this.outputs["visual-length"], "L_e = --");
    setText(this.outputs["visual-radius"], "r = --");

    if (this.outputs["status-pill"]) {
      this.outputs["status-pill"].setAttribute("data-tone", "invalid");
    }

    if (this.outputs["capacity-pill"]) {
      this.outputs["capacity-pill"].setAttribute("data-tone", "invalid");
    }

    createEmptyVisual(this.roles.diagram);
    this.toggleActionState(true);
  };

  NominalAxialCapacityTool.prototype.renderOutputs = function (inputs, results) {
    var guide = utilisationGuide(results.alpha_c);
    var shapeLabel = pickShape(inputs.sectionShape).label;

    setText(this.outputs["status-pill"], "Live capacity ready");
    setText(this.outputs["capacity-pill"], formatNumber(results.Nuc / 1000, 2) + " kN");
    setText(this.outputs["phi-nc"], formatNumber(results.Nuc / 1000, 2) + " kN");
    setText(this.outputs["hero-note"], "Capacity reduction factor φ = " + PHI.toFixed(1) + "." + (guide ? " " + guide : ""));
    setText(this.outputs["area-card"], formatNumber(results.An, 0) + " mm²");
    setText(this.outputs["radius-card"], formatNumber(results.r, 2) + " mm");
    setText(this.outputs["nc-card"], formatNumber(results.Nc / 1000, 2) + " kN");
    setText(this.outputs["section-family"], results.section.label);
    setText(this.outputs.kf, formatNumber(results.section.kf, 2));
    setText(this.outputs["alpha-b"], formatNumber(results.section.alphaB, 2));
    setText(this.outputs.ke, formatNumber(results.restraint.ke, 2));
    setText(this.outputs.rx, formatNumber(results.properties.rx, 2) + " mm");
    setText(this.outputs.ry, formatNumber(results.properties.ry, 2) + " mm");
    setText(this.outputs.eta, formatNumber(results.eta, 4));
    setText(this.outputs["alpha-a"], formatNumber(results.alpha_a, 4));
    setText(this.outputs.zeta, formatNumber(results.zeta, 4));
    setText(this.outputs.lambda, formatNumber(results.lambda, 4));
    setText(this.outputs["alpha-c"], formatNumber(results.alpha_c, 4));
    setText(this.outputs["le-r"], formatNumber(results.Le_r, 2));
    setText(this.outputs["visual-shape"], shapeLabel);
    setText(this.outputs["visual-axis"], "Buckling about " + inputs.bucklingAxis.toUpperCase() + " axis");
    setText(this.outputs["visual-length"], "L_e = " + formatNumber(results.Le, 0) + " mm");
    setText(this.outputs["visual-radius"], "r = " + formatNumber(results.r, 2) + " mm");

    if (this.outputs["status-pill"]) {
      this.outputs["status-pill"].setAttribute("data-tone", "valid");
    }

    if (this.outputs["capacity-pill"]) {
      this.outputs["capacity-pill"].setAttribute("data-tone", "valid");
    }

    if (this.roles.diagram) {
      this.roles.diagram.innerHTML = buildMemberVisualMarkup(inputs, results, shapeLabel);
    }

    this.toggleActionState(false);
  };

  NominalAxialCapacityTool.prototype.toggleActionState = function (disabled) {
    ["save-result", "export-word-report"].forEach(function (actionKey) {
      if (this.actions[actionKey]) {
        this.actions[actionKey].disabled = disabled;
      }
    }, this);
  };

  NominalAxialCapacityTool.prototype.togglePanel = function (panelKey, labelNode) {
    var panel = this.panels[panelKey];
    var action = this.actions[panelKey === "equations" ? "toggle-equations" : "toggle-secondary"];

    if (!panel || !action) {
      return;
    }

    var collapsed = panel.classList.contains("is-collapsed");
    panel.classList.toggle("is-collapsed", !collapsed);
    action.setAttribute("aria-expanded", collapsed ? "true" : "false");

    if (labelNode) {
      labelNode.textContent = collapsed ? "Hide" : "Show";
    }
  };

  NominalAxialCapacityTool.prototype.resetForm = function () {
    setFieldValue(this.fields["member-type"], BASE_DEFAULTS.memberType);
    setFieldValue(this.fields["section-description"], BASE_DEFAULTS.sectionDescription);
    setFieldValue(this.fields["section-shape"], BASE_DEFAULTS.sectionShape);
    setFieldValue(this.fields["buckling-axis"], BASE_DEFAULTS.bucklingAxis);
    setFieldValue(this.fields.L, BASE_DEFAULTS.L);
    setFieldValue(this.fields.fy, BASE_DEFAULTS.fy);
    this.renderEndRestraints(BASE_DEFAULTS.memberType, BASE_DEFAULTS.endRestraint);
    this.renderGeometryFields(BASE_DEFAULTS.sectionShape, getShapeDefaults(BASE_DEFAULTS.sectionShape));
    this.persistFormState();
    this.update();
  };

  NominalAxialCapacityTool.prototype.update = function () {
    var inputs = this.readInputs();
    var validation = this.validate(inputs);
    var notices = [];
    var section = pickSectionDescription(inputs.sectionDescription);

    this.clearErrors();

    if (section.details) {
      notices.push(section.details);
    }

    this.renderNotices(notices, "info");

    if (!validation.isValid) {
      this.renderErrors(validation);
      this.lastState = null;
      this.renderInvalidState("Resolve the highlighted member and geometry fields to view valid results.");
      return;
    }

    try {
      var results = this.calculate(inputs);
      this.lastState = {
        inputs: inputs,
        results: results
      };
      this.renderOutputs(inputs, results);
    } catch (error) {
      this.lastState = null;
      this.renderInvalidState(error instanceof Error ? error.message : "Calculation could not be completed.");
    }
  };

  NominalAxialCapacityTool.prototype.saveCurrentResult = function () {
    if (!this.lastState) {
      return;
    }

    var record = {
      id: uniqueId(),
      timestamp: new Date().toISOString(),
      memberType: this.lastState.inputs.memberType,
      endRestraint: this.lastState.inputs.endRestraint,
      sectionLabel: pickSectionDescription(this.lastState.inputs.sectionDescription).label + " / " + pickShape(this.lastState.inputs.sectionShape).label,
      bucklingAxis: this.lastState.inputs.bucklingAxis,
      L: this.lastState.inputs.L,
      fy: this.lastState.inputs.fy,
      An: this.lastState.results.An,
      r: this.lastState.results.r,
      phiNc: this.lastState.results.Nuc / 1000
    };

    this.savedResults.unshift(record);
    this.savedResults = this.savedResults.slice(0, 20);
    writeStorage(this.resultsStorageKey, this.savedResults);
    this.renderSavedResults();
    setText(this.outputs["export-feedback"], "Result saved to the local audit trail.");
  };

  NominalAxialCapacityTool.prototype.renderSavedResults = function () {
    var body = this.roles["saved-results-body"];

    if (!body) {
      return;
    }

    if (!this.savedResults.length) {
      body.innerHTML = '<tr><td colspan="9" class="et-nac__table-empty">Save design iterations to build a project-side audit trail.</td></tr>';
      setText(this.outputs["saved-count"], "0 saved");
      return;
    }

    body.innerHTML = this.savedResults.map(function (record) {
      return [
        "<tr>",
        "<td>" + escapeHtml(formatDateTime(record.timestamp)) + "</td>",
        "<td>" + escapeHtml(record.memberType) + "</td>",
        "<td>" + escapeHtml(record.sectionLabel) + "</td>",
        "<td>" + escapeHtml(String(record.bucklingAxis).toUpperCase()) + "</td>",
        "<td>" + escapeHtml(formatNumber(record.L, 0)) + "</td>",
        "<td>" + escapeHtml(formatNumber(record.fy, 0)) + "</td>",
        "<td>" + escapeHtml(formatNumber(record.An, 0)) + "</td>",
        "<td>" + escapeHtml(formatNumber(record.r, 2)) + "</td>",
        "<td>" + escapeHtml(formatNumber(record.phiNc, 2)) + "</td>",
        "</tr>"
      ].join("");
    }).join("");

    setText(this.outputs["saved-count"], this.savedResults.length + " saved");
  };

  NominalAxialCapacityTool.prototype.buildCalculationReportData = function () {
    if (!this.lastState) {
      return null;
    }

    var inputs = this.lastState.inputs;
    var results = this.lastState.results;
    var section = results.section;
    var restraint = results.restraint;
    var shape = pickShape(inputs.sectionShape);
    var generatedAt = new Date().toISOString();

    return {
      generatedAt: generatedAt,
      title: "Nominal Axial Capacity",
      summaryResult: results.Nuc / 1000,
      company: this.root.getAttribute("data-report-company") || "Consulting Engineering Issue",
      project: this.root.getAttribute("data-report-project") || "Nominal Axial Capacity Verification",
      preparedBy: this.root.getAttribute("data-report-prepared-by") || "Automated engineering calculator",
      disclaimer: this.root.getAttribute("data-report-disclaimer") || "This automated calculation sheet is intended to support engineering review and does not replace independent professional verification.",
      inputs: [
        { label: "Member type", value: inputs.memberType, unit: "-" },
        { label: "End restraint", value: restraint.label + " (" + formatNumber(restraint.ke, 2) + ")", unit: "-" },
        { label: "Actual length", value: formatNumber(inputs.L, 0), unit: "mm" },
        { label: "Yield strength", value: formatNumber(inputs.fy, 0), unit: "MPa" },
        { label: "Section description", value: section.label, unit: "-" },
        { label: "Section shape", value: shape.label, unit: "-" },
        { label: "Buckling axis", value: inputs.bucklingAxis.toUpperCase(), unit: "-" },
        { label: "Net area", value: formatNumber(results.An, 0), unit: "mm²" },
        { label: "Radius of gyration", value: formatNumber(results.r, 2), unit: "mm" }
      ],
      results: [
        { label: "Section capacity", value: formatNumber(results.Ns / 1000, 2), unit: "kN" },
        { label: "Nominal compression capacity", value: formatNumber(results.Nc / 1000, 2), unit: "kN" },
        { label: "Design compression capacity", value: formatNumber(results.Nuc / 1000, 2), unit: "kN" },
        { label: "Effective length", value: formatNumber(results.Le, 0), unit: "mm" },
        { label: "Slenderness ratio", value: formatNumber(results.Le_r, 2), unit: "-" },
        { label: "Buckling factor", value: formatNumber(results.alpha_c, 4), unit: "-" }
      ],
      calculations: [
        { label: "Effective length", expression: "L_e = k_e × L", value: formatNumber(results.Le, 0) + " mm" },
        { label: "Modified slenderness", expression: "λ_e = (L_e / r) × √(k_f × f_y / 250)", value: formatNumber(results.lambda_eta, 4) },
        { label: "Imperfection factor", expression: "η = max(0, 0.00326(λ_e - 13.5))", value: formatNumber(results.eta, 4) },
        { label: "Section factor", expression: "α_a = 2100(λ_e - 13.5)/(λ_e² - 15.3λ_e + 2050)", value: formatNumber(results.alpha_a, 4) },
        { label: "Overall slenderness", expression: "λ = λ_e + α_a × α_b", value: formatNumber(results.lambda, 4) },
        { label: "Buckling parameter", expression: "ζ = ((L_e/90)² + 1 + η)/(2(L_e/90)²)", value: formatNumber(results.zeta, 4) },
        { label: "Compression reduction", expression: "α_c = ζ(1 - √(1 - (90/(ζλ))²))", value: formatNumber(results.alpha_c, 4) },
        { label: "Section capacity", expression: "N_s = k_f × A_n × f_y", value: formatNumber(results.Ns / 1000, 2) + " kN" }
      ],
      equations: [
        "N_c = min(α_c N_s, N_s)",
        "φN_c = 0.9N_c",
        "N_s = k_f A_n f_y",
        "λ_e = (L_e / r) × √(k_f × f_y / 250)",
        "λ = λ_e + α_a α_b",
        "α_c = ζ(1 - √(1 - (90/(ζλ))²))"
      ],
      assumptions: [
        "Net section resisting axial action is taken as the calculated geometric area of the selected section shape.",
        "No bolt-hole deductions, corrosion reductions, or fabrication tolerances are applied in this report.",
        "The selected end restraint and buckling axis are assumed to represent the governing compression mode.",
        "Calculated section properties: A = " + formatNumber(results.properties.A, 0) + " mm², r_x = " + formatNumber(results.properties.rx, 2) + " mm, r_y = " + formatNumber(results.properties.ry, 2) + " mm."
      ]
    };
  };

  NominalAxialCapacityTool.prototype.createMetadataSection = function (reportData, docxLib) {
    return [
      new docxLib.Paragraph({ heading: docxLib.HeadingLevel.TITLE, text: "Nominal Axial Capacity Engineering Calculation Sheet" }),
      new docxLib.Paragraph({ children: [new docxLib.TextRun(reportData.company + " | " + reportData.project)] }),
      new docxLib.Paragraph({ children: [new docxLib.TextRun("Generated: " + formatDateTime(reportData.generatedAt))] }),
      new docxLib.Paragraph({ children: [new docxLib.TextRun("Checked by: " + reportData.preparedBy)] }),
      new docxLib.Paragraph({ spacing: { after: 200 }, children: [new docxLib.TextRun("Key Result: φN_c = " + formatNumber(reportData.summaryResult, 2) + " kN")] })
    ];
  };

  NominalAxialCapacityTool.prototype.createInputsTable = function (reportData, docxLib) {
    return [
      new docxLib.Paragraph({ heading: docxLib.HeadingLevel.HEADING_1, text: "Inputs" }),
      createDocxTable(reportData.inputs, docxLib)
    ];
  };

  NominalAxialCapacityTool.prototype.createResultsTable = function (reportData, docxLib) {
    return [
      new docxLib.Paragraph({ heading: docxLib.HeadingLevel.HEADING_1, text: "Results" }),
      createDocxTable(reportData.results, docxLib)
    ];
  };

  NominalAxialCapacityTool.prototype.createCalculationSection = function (reportData, docxLib) {
    var paragraphs = [
      new docxLib.Paragraph({ heading: docxLib.HeadingLevel.HEADING_1, text: "Intermediate calculations" })
    ];

    reportData.calculations.forEach(function (item) {
      paragraphs.push(new docxLib.Paragraph({ children: [new docxLib.TextRun({ text: item.label + ": ", bold: true }), new docxLib.TextRun(item.expression + " = " + item.value)] }));
    });

    paragraphs.push(new docxLib.Paragraph({ heading: docxLib.HeadingLevel.HEADING_2, text: "Equation set" }));
    reportData.equations.forEach(function (equation) {
      paragraphs.push(this.createEquationParagraph(equation, docxLib));
    }, this);

    return paragraphs;
  };

  NominalAxialCapacityTool.prototype.createEquationParagraph = function (equation, docxLib) {
    return new docxLib.Paragraph({
      spacing: { after: 80 },
      children: [new docxLib.TextRun({ text: equation, italics: true })]
    });
  };

  NominalAxialCapacityTool.prototype.createVisualisationSection = async function (reportData, docxLib) {
    var container = this.root.querySelector("[data-export-visualization]");
    var paragraphs = [
      new docxLib.Paragraph({ heading: docxLib.HeadingLevel.HEADING_1, text: "Visualisation" })
    ];

    if (!container) {
      return paragraphs;
    }

    var image = await this.extractSvgAsPng(container.querySelector("svg"));
    if (!image) {
      return paragraphs;
    }

    paragraphs.push(this.addImageToDoc(image, docxLib));
    paragraphs.push(new docxLib.Paragraph({ alignment: docxLib.AlignmentType.CENTER, children: [new docxLib.TextRun("Figure 1. Live effective length and section visualisation.")] }));
    return paragraphs;
  };

  NominalAxialCapacityTool.prototype.extractSvgAsPng = function (svgElement) {
    if (!svgElement) {
      return Promise.resolve(null);
    }

    var serializer = new XMLSerializer();
    var svgText = serializer.serializeToString(svgElement);
    var svgBlob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
    var svgUrl = URL.createObjectURL(svgBlob);

    return this.extractCanvasAsPng(svgUrl, 580, 360).finally(function () {
      URL.revokeObjectURL(svgUrl);
    });
  };

  NominalAxialCapacityTool.prototype.extractCanvasAsPng = function (imageSource, width, height) {
    return new Promise(function (resolve) {
      var canvas = document.createElement("canvas");
      var context = canvas.getContext("2d");
      var image = new Image();
      var scale = 2;

      canvas.width = width * scale;
      canvas.height = height * scale;

      image.onload = function () {
        context.scale(scale, scale);
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        resolve({
          data: Uint8Array.from(atob(canvas.toDataURL("image/png").split(",")[1]), function (character) {
            return character.charCodeAt(0);
          }),
          width: canvas.width,
          height: canvas.height
        });
      };

      image.onerror = function () {
        resolve(null);
      };

      image.src = imageSource;
    });
  };

  NominalAxialCapacityTool.prototype.addImageToDoc = function (image, docxLib) {
    var fit = fitImageWithinPage(image.width, image.height, 520);

    return new docxLib.Paragraph({
      alignment: docxLib.AlignmentType.CENTER,
      children: [
        new docxLib.ImageRun({
          data: image.data,
          transformation: {
            width: fit.width,
            height: fit.height
          }
        })
      ]
    });
  };

  NominalAxialCapacityTool.prototype.createAssumptionsSection = function (reportData, docxLib) {
    var paragraphs = [
      new docxLib.Paragraph({ heading: docxLib.HeadingLevel.HEADING_1, text: "Assumptions" })
    ];

    reportData.assumptions.forEach(function (assumption) {
      paragraphs.push(new docxLib.Paragraph({ bullet: { level: 0 }, children: [new docxLib.TextRun(assumption)] }));
    });

    paragraphs.push(new docxLib.Paragraph({ children: [new docxLib.TextRun({ text: "Disclaimer: ", bold: true }), new docxLib.TextRun(reportData.disclaimer)] }));
    return paragraphs;
  };

  NominalAxialCapacityTool.prototype.exportWordReport = async function () {
    var reportData = this.buildCalculationReportData();
    var docxLib = window.docx;

    if (!reportData) {
      setText(this.outputs["export-feedback"], "Enter a valid design state before exporting a report.");
      return;
    }

    if (!docxLib || !docxLib.Document || !docxLib.Packer) {
      setText(this.outputs["export-feedback"], "Word export library is not available on this page.");
      return;
    }

    setText(this.outputs["export-feedback"], "Preparing Word report...");

    try {
      var visualisationSection = await this.createVisualisationSection(reportData, docxLib);
      var documentDefinition = new docxLib.Document({
        sections: [
          {
            footers: {
              default: new docxLib.Footer({
                children: [
                  new docxLib.Paragraph({
                    alignment: docxLib.AlignmentType.CENTER,
                    children: [new docxLib.TextRun("Page "), docxLib.PageNumber.CURRENT]
                  })
                ]
              })
            },
            children: []
              .concat(this.createMetadataSection(reportData, docxLib))
              .concat(this.createResultsTable(reportData, docxLib))
              .concat(this.createInputsTable(reportData, docxLib))
              .concat(this.createCalculationSection(reportData, docxLib))
              .concat(visualisationSection)
              .concat(this.createAssumptionsSection(reportData, docxLib))
          }
        ]
      });
      var blob = await docxLib.Packer.toBlob(documentDefinition);
      var link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "nominal-axial-capacity_" + formatFileStamp(reportData.generatedAt) + ".docx";
      link.click();
      window.setTimeout(function () {
        URL.revokeObjectURL(link.href);
      }, 2000);
      setText(this.outputs["export-feedback"], "Word report exported.");
    } catch (error) {
      setText(this.outputs["export-feedback"], "Unable to export the Word report from this browser session.");
    }
  };

  function createDocxTable(rows, docxLib) {
    return new docxLib.Table({
      width: { size: 100, type: docxLib.WidthType.PERCENTAGE },
      rows: rows.map(function (row, index) {
        return new docxLib.TableRow({
          children: [
            new docxLib.TableCell({
              shading: index % 2 === 0 ? { fill: "F7FAFD" } : undefined,
              children: [new docxLib.Paragraph({ children: [new docxLib.TextRun({ text: row.label, bold: true })] })]
            }),
            new docxLib.TableCell({
              shading: index % 2 === 0 ? { fill: "F7FAFD" } : undefined,
              children: [new docxLib.Paragraph(String(row.value))]
            }),
            new docxLib.TableCell({
              shading: index % 2 === 0 ? { fill: "F7FAFD" } : undefined,
              children: [new docxLib.Paragraph(String(row.unit || ""))]
            })
          ]
        });
      })
    });
  }

  function boot() {
    document.querySelectorAll('[data-et-tool="' + TOOL_SLUG + '"]').forEach(function (root, index) {
      if (root.__etNominalAxialCapacity) {
        return;
      }

      root.__etNominalAxialCapacity = new NominalAxialCapacityTool(root, index);
      root.__etNominalAxialCapacity.init();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
}());
