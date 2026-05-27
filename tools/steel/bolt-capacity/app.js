(function () {
  "use strict";

  var TOOL_SLUG = "bolt-capacity";
  var REDUCTION_FACTOR = 0.8;
  var SHEAR_FACTOR = 0.62;
  var DEFAULT_GRADE = "Grade 8.8";
  var DEFAULT_SIZE = "M20";
  var MAX_SAVED_RESULTS = 20;

  function getUtils() {
    return window.EngineeringTools && window.EngineeringTools.utils;
  }

  function parseCatalogue(root) {
    var node = root.querySelector('[data-et-role="catalogue-json"]');

    if (!node) {
      return [];
    }

    try {
      var parsed = JSON.parse(node.textContent || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function formatNumber(value, decimals) {
    var utils = getUtils();

    if (utils && typeof utils.formatNumber === "function") {
      return utils.formatNumber(value, decimals);
    }

    return Number(value).toFixed(decimals);
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

  function formatDateForFileName(date) {
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, "0");
    var day = String(date.getDate()).padStart(2, "0");
    var hours = String(date.getHours()).padStart(2, "0");
    var minutes = String(date.getMinutes()).padStart(2, "0");

    return "bolt-capacity-suite_" + year + "-" + month + "-" + day + "_" + hours + minutes + ".docx";
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function createStorageKey(root) {
    return "engineering-tools-" + TOOL_SLUG + "-" + (root.getAttribute("data-et-storage-scope") || root.id || "default");
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

  function writeStorage(key, rows) {
    try {
      window.localStorage.setItem(key, JSON.stringify(rows.slice(0, MAX_SAVED_RESULTS)));
    } catch (error) {
      // Ignore storage failures.
    }
  }

  function groupCatalogueByGrade(catalogue) {
    return catalogue.reduce(function (accumulator, row) {
      if (!accumulator[row.boltGrade]) {
        accumulator[row.boltGrade] = [];
      }

      accumulator[row.boltGrade].push(row);
      return accumulator;
    }, {});
  }

  function parseDiameter(size) {
    var match = String(size || "").match(/\d+/);
    return match ? Number(match[0]) : 0;
  }

  function deriveMetrics(spec) {
    var nominalShearCapacity = spec.phiVf / REDUCTION_FACTOR;
    var nominalTensionCapacity = spec.phiNtf / REDUCTION_FACTOR;

    return {
      diameter: parseDiameter(spec.boltSize),
      nominalShearCapacity: nominalShearCapacity,
      nominalTensionCapacity: nominalTensionCapacity,
      reductionFactor: REDUCTION_FACTOR,
      shearFactor: SHEAR_FACTOR,
      shearToTensionRatio: nominalTensionCapacity === 0 ? 0 : nominalShearCapacity / nominalTensionCapacity
    };
  }

  function validateSelection(grade, size, groupedCatalogue) {
    var errors = {};

    if (!grade) {
      errors["bolt-grade"] = "Select a bolt grade from the project dataset.";
    }

    if (grade && !size) {
      errors["bolt-size"] = "Select a bolt size available for the chosen grade.";
    }

    if (grade && size) {
      var rows = groupedCatalogue[grade] || [];
      var exists = rows.some(function (row) {
        return row.boltSize === size;
      });

      if (!exists) {
        errors["bolt-size"] = "Selected size is not available for this grade.";
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors: errors
    };
  }

  function loadImage(source) {
    return new Promise(function (resolve, reject) {
      var image = new Image();
      image.onload = function () {
        resolve(image);
      };
      image.onerror = function () {
        reject(new Error("Unable to load generated visualisation image."));
      };
      image.src = source;
    });
  }

  function dataUrlToUint8Array(dataUrl) {
    return fetch(dataUrl).then(function (response) {
      return response.arrayBuffer();
    }).then(function (buffer) {
      return new Uint8Array(buffer);
    });
  }

  function inlineSvgStyles(sourceElement, targetElement) {
    var sourceNodes = [sourceElement].concat(Array.prototype.slice.call(sourceElement.querySelectorAll("*")));
    var targetNodes = [targetElement].concat(Array.prototype.slice.call(targetElement.querySelectorAll("*")));
    var styleProperties = [
      "fill",
      "stroke",
      "stroke-width",
      "stroke-dasharray",
      "stroke-linecap",
      "stroke-linejoin",
      "opacity",
      "font-family",
      "font-size",
      "font-weight",
      "letter-spacing",
      "text-anchor",
      "dominant-baseline",
      "paint-order",
      "stop-color",
      "stop-opacity"
    ];

    sourceNodes.forEach(function (sourceNode, index) {
      var targetNode = targetNodes[index];

      if (!(sourceNode instanceof Element) || !(targetNode instanceof Element)) {
        return;
      }

      var computedStyle = window.getComputedStyle(sourceNode);
      var inlineStyle = styleProperties.map(function (property) {
        return property + ":" + computedStyle.getPropertyValue(property) + ";";
      }).join("");

      targetNode.setAttribute("style", inlineStyle);
    });
  }

  function extractSvgAsPng(svgElement, scale) {
    var exportScale = scale || 2;
    var clonedSvg = svgElement.cloneNode(true);
    inlineSvgStyles(svgElement, clonedSvg);

    clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clonedSvg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

    var bounds = svgElement.getBoundingClientRect();
    var viewBox = svgElement.viewBox && svgElement.viewBox.baseVal ? svgElement.viewBox.baseVal : null;
    var width = Math.max(bounds.width || 0, viewBox && viewBox.width ? viewBox.width : 520);
    var height = Math.max(bounds.height || 0, viewBox && viewBox.height ? viewBox.height : 360);

    clonedSvg.setAttribute("width", String(width));
    clonedSvg.setAttribute("height", String(height));

    var serializedSvg = new XMLSerializer().serializeToString(clonedSvg);
    var svgBlob = new Blob([serializedSvg], { type: "image/svg+xml;charset=utf-8" });
    var objectUrl = URL.createObjectURL(svgBlob);

    return loadImage(objectUrl).then(function (image) {
      var canvas = document.createElement("canvas");
      var context;

      canvas.width = Math.round(width * exportScale);
      canvas.height = Math.round(height * exportScale);
      context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Unable to create a canvas context for SVG export.");
      }

      context.scale(exportScale, exportScale);
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);

      return dataUrlToUint8Array(canvas.toDataURL("image/png")).then(function (imageData) {
        return {
          imageData: imageData,
          width: Math.round(width),
          height: Math.round(height)
        };
      });
    }).finally(function () {
      URL.revokeObjectURL(objectUrl);
    });
  }

  function extractCanvasAsPng(canvasElement, scale) {
    var exportScale = scale || 2;
    var width = canvasElement.width || Math.round(canvasElement.getBoundingClientRect().width) || 520;
    var height = canvasElement.height || Math.round(canvasElement.getBoundingClientRect().height) || 360;
    var exportCanvas = document.createElement("canvas");
    var context;

    exportCanvas.width = Math.round(width * exportScale);
    exportCanvas.height = Math.round(height * exportScale);
    context = exportCanvas.getContext("2d");

    if (!context) {
      return Promise.reject(new Error("Unable to create a canvas context for chart export."));
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    context.scale(exportScale, exportScale);
    context.drawImage(canvasElement, 0, 0, width, height);

    return dataUrlToUint8Array(exportCanvas.toDataURL("image/png")).then(function (imageData) {
      return {
        imageData: imageData,
        width: width,
        height: height
      };
    });
  }

  function addImageToDoc(docxApi, imageData, caption, width, height) {
    var Paragraph = docxApi.Paragraph;
    var TextRun = docxApi.TextRun;
    var ImageRun = docxApi.ImageRun;
    var AlignmentType = docxApi.AlignmentType;
    var maxWidth = 520;
    var scaledWidth = Math.min(width, maxWidth);
    var scaledHeight = Math.round((height / width) * scaledWidth);

    return [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 80 },
        children: [
          new ImageRun({
            data: imageData,
            transformation: {
              width: scaledWidth,
              height: scaledHeight
            },
            type: "png"
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 140 },
        children: [
          new TextRun({
            text: caption,
            italics: true,
            color: "4D6373",
            size: 18
          })
        ]
      })
    ];
  }

  function createBorderSet(docxApi, color) {
    var BorderStyle = docxApi.BorderStyle;

    return {
      top: { style: BorderStyle.SINGLE, size: 1, color: color },
      right: { style: BorderStyle.SINGLE, size: 1, color: color },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: color },
      left: { style: BorderStyle.SINGLE, size: 1, color: color }
    };
  }

  function createSectionHeading(docxApi, text) {
    var Paragraph = docxApi.Paragraph;
    var HeadingLevel = docxApi.HeadingLevel;
    var TextRun = docxApi.TextRun;

    return new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 220, after: 120 },
      children: [
        new TextRun({
          text: text,
          color: "1B2A38",
          bold: true
        })
      ]
    });
  }

  function createBodyParagraph(docxApi, text) {
    var Paragraph = docxApi.Paragraph;
    var TextRun = docxApi.TextRun;

    return new Paragraph({
      spacing: { after: 90, line: 276 },
      children: [
        new TextRun({
          text: text,
          size: 21,
          color: "304554"
        })
      ]
    });
  }

  function createBulletParagraph(docxApi, text) {
    var Paragraph = docxApi.Paragraph;
    var TextRun = docxApi.TextRun;

    return new Paragraph({
      spacing: { after: 70, line: 260 },
      indent: { left: 240, hanging: 120 },
      children: [
        new TextRun({
          text: "\u2022 ",
          color: "1570EF",
          bold: true
        }),
        new TextRun({
          text: text,
          size: 21,
          color: "304554"
        })
      ]
    });
  }

  function createTableCell(docxApi, text, options) {
    var TableCell = docxApi.TableCell;
    var Paragraph = docxApi.Paragraph;
    var TextRun = docxApi.TextRun;
    var WidthType = docxApi.WidthType;
    var AlignmentType = docxApi.AlignmentType;
    var ShadingType = docxApi.ShadingType;
    var settings = options || {};

    return new TableCell({
      width: settings.width ? { size: settings.width, type: WidthType.DXA } : undefined,
      verticalAlign: AlignmentType.CENTER,
      shading: settings.shadingFill ? {
        type: ShadingType.CLEAR,
        fill: settings.shadingFill,
        color: "auto"
      } : undefined,
      borders: createBorderSet(docxApi, "9DB3C1"),
      margins: {
        top: 90,
        bottom: 90,
        left: 100,
        right: 100
      },
      children: [
        new Paragraph({
          alignment: settings.alignment || AlignmentType.LEFT,
          spacing: { after: 0, before: 0 },
          children: [
            new TextRun({
              text: text,
              bold: Boolean(settings.bold),
              color: settings.color || "223545",
              size: 20
            })
          ]
        })
      ]
    });
  }

  function createKeyValueTable(docxApi, headers, rows, columnWidths, numericColumns) {
    var Table = docxApi.Table;
    var TableRow = docxApi.TableRow;
    var TableLayoutType = docxApi.TableLayoutType;
    var WidthType = docxApi.WidthType;
    var numeric = numericColumns || [];

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      layout: TableLayoutType.FIXED,
      columnWidths: columnWidths,
      rows: [
        new TableRow({
          tableHeader: true,
          children: headers.map(function (header, index) {
            return createTableCell(docxApi, header, {
              bold: true,
              shadingFill: "E9F1F8",
              alignment: numeric.indexOf(index) !== -1 ? docxApi.AlignmentType.CENTER : docxApi.AlignmentType.LEFT
            });
          })
        })
      ].concat(rows.map(function (row) {
        return new TableRow({
          children: row.map(function (value, index) {
            return createTableCell(docxApi, value, {
              shadingFill: "F7FAFC",
              alignment: numeric.indexOf(index) !== -1 ? docxApi.AlignmentType.CENTER : docxApi.AlignmentType.LEFT
            });
          })
        });
      }))
    });
  }

  function createResultStatusTable(docxApi, rows) {
    var Table = docxApi.Table;
    var TableRow = docxApi.TableRow;
    var TableLayoutType = docxApi.TableLayoutType;
    var WidthType = docxApi.WidthType;
    var AlignmentType = docxApi.AlignmentType;

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      layout: TableLayoutType.FIXED,
      columnWidths: [6200, 2200, 2200],
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            createTableCell(docxApi, "Check", { bold: true, shadingFill: "E9F1F8" }),
            createTableCell(docxApi, "Value", { bold: true, shadingFill: "E9F1F8", alignment: AlignmentType.CENTER }),
            createTableCell(docxApi, "Status", { bold: true, shadingFill: "E9F1F8", alignment: AlignmentType.CENTER })
          ]
        })
      ].concat(rows.map(function (row) {
        return new TableRow({
          children: [
            createTableCell(docxApi, row.check, { shadingFill: "F7FAFC" }),
            createTableCell(docxApi, row.value, { shadingFill: "F7FAFC", alignment: AlignmentType.CENTER }),
            createTableCell(docxApi, row.status, {
              shadingFill: row.status === "PASS" ? "EAF7F1" : "FDECEC",
              alignment: AlignmentType.CENTER,
              bold: true,
              color: row.status === "PASS" ? "1D7A46" : "C33434"
            })
          ]
        });
      }))
    });
  }

  function createSavedResultsTable(docxApi, rows) {
    return createKeyValueTable(
      docxApi,
      ["Timestamp", "Grade", "Size", "\u03d5Vf (kN)", "\u03d5Ntf (kN)", "Pitch (mm)", "Edge Distance (mm)"],
      rows.map(function (row) {
        return [
          row.timestamp,
          row.boltGrade,
          row.boltSize,
          row.phiVf.toFixed(1),
          row.phiNtf.toFixed(1),
          row.minimumPitch.toFixed(1),
          row.minEdgeDistanceShear.toFixed(1)
        ];
      }),
      [2600, 1600, 1000, 1300, 1300, 1200, 1400],
      [2, 3, 4, 5, 6]
    );
  }

  function buildCalculationReportData(tool) {
    var spec = tool.lastState.spec;
    var metrics = tool.lastState.metrics;
    var generatedAt = new Date();
    var company = tool.root.getAttribute("data-report-company") || "Not specified";
    var project = tool.root.getAttribute("data-report-project") || "Bolt selection verification";
    var preparedBy = tool.root.getAttribute("data-report-prepared-by") || "Not specified";
    var disclaimer = tool.root.getAttribute("data-report-disclaimer") || "This exported calculation sheet is a software-generated engineering summary and must be reviewed by a qualified engineer before issue.";
    var generatedAtDisplay = generatedAt.toLocaleString("en-AU", {
      dateStyle: "medium",
      timeStyle: "short"
    });

    return {
      fileName: formatDateForFileName(generatedAt),
      title: "Bolt Capacity Engineering Calculation Sheet",
      generatedAtDisplay: generatedAtDisplay,
      metadata: [
        { label: "Company", value: company },
        { label: "Project", value: project },
        { label: "Prepared by", value: preparedBy },
        { label: "Report type", value: "Structural engineering calculation sheet" },
        { label: "Tool", value: "Bolt Capacity Suite" },
        { label: "Selected bolt", value: spec.boltGrade + " / " + spec.boltSize },
        { label: "Generated", value: generatedAtDisplay }
      ],
      designSummary: "This report summarises the selected structural bolt catalogue entry, including reduced shear capacity, reduced tension capacity, detailing minima, and the exported bolt visualisation for issue or review purposes.",
      inputs: [
        { parameter: "Bolt grade", value: spec.boltGrade },
        { parameter: "Bolt size", value: spec.boltSize },
        { parameter: "Nominal diameter", value: String(metrics.diameter.toFixed(0)), units: "mm" },
        { parameter: "Ultimate tensile strength, fuf", value: String(spec.fuf.toFixed(0)), units: "MPa" },
        { parameter: "Tensile area, At", value: String(spec.tensileArea.toFixed(1)), units: "mm^2" },
        { parameter: "Minimum pitch", value: String(spec.minimumPitch.toFixed(1)), units: "mm" },
        { parameter: "Minimum edge distance", value: String(spec.minEdgeDistanceShear.toFixed(1)), units: "mm" },
        { parameter: "Washer outside diameter", value: String(spec.washerMaxOutsideDiameter.toFixed(1)), units: "mm" }
      ],
      results: [
        { parameter: "Reduced shear capacity, \u03d5Vf", value: String(spec.phiVf.toFixed(1)), units: "kN" },
        { parameter: "Reduced tension capacity, \u03d5Ntf", value: String(spec.phiNtf.toFixed(1)), units: "kN" },
        { parameter: "Nominal shear capacity, Vf", value: String(metrics.nominalShearCapacity.toFixed(1)), units: "kN" },
        { parameter: "Nominal tension capacity, Ntf", value: String(metrics.nominalTensionCapacity.toFixed(1)), units: "kN" },
        { parameter: "Reduction factor, \u03d5", value: String(metrics.reductionFactor.toFixed(2)) },
        { parameter: "Shear factor", value: String(metrics.shearFactor.toFixed(2)) },
        { parameter: "Shear/tension ratio", value: String(metrics.shearToTensionRatio.toFixed(2)) }
      ],
      passFailChecks: [
        { check: "Selected catalogue row available", value: spec.boltGrade + " / " + spec.boltSize, status: "PASS" },
        { check: "Reduced design capacities populated", value: spec.phiVf.toFixed(1) + " kN / " + spec.phiNtf.toFixed(1) + " kN", status: "PASS" },
        { check: "Minimum pitch and edge distance available", value: spec.minimumPitch.toFixed(1) + " mm / " + spec.minEdgeDistanceShear.toFixed(1) + " mm", status: "PASS" }
      ],
      equations: [
        {
          label: "Reduced shear capacity",
          equation: "\u03d5Vf = \u03d5 x 0.62 x fuf x At x 10^-3",
          description: "Reduced single-bolt shear capacity implied by the catalogue dataset."
        },
        {
          label: "Reduced tension capacity",
          equation: "\u03d5Ntf = \u03d5 x fuf x At x 10^-3",
          description: "Reduced single-bolt tension capacity implied by the catalogue dataset."
        },
        {
          label: "Capacity relationship",
          equation: "\u03d5Vf <= \u03d5Ntf",
          description: "For the selected entry, the reduced shear capacity is lower than the reduced tension capacity."
        }
      ],
      intermediateCalculations: [
        "Nominal tension capacity: Ntf = fuf x At x 10^-3 = " + spec.fuf.toFixed(0) + " x " + spec.tensileArea.toFixed(1) + " x 10^-3 = " + metrics.nominalTensionCapacity.toFixed(1) + " kN",
        "Reduced tension capacity: \u03d5Ntf = \u03d5 x Ntf = " + metrics.reductionFactor.toFixed(2) + " x " + metrics.nominalTensionCapacity.toFixed(1) + " = " + spec.phiNtf.toFixed(1) + " kN",
        "Nominal shear capacity: Vf = 0.62 x fuf x At x 10^-3 = 0.62 x " + spec.fuf.toFixed(0) + " x " + spec.tensileArea.toFixed(1) + " x 10^-3 = " + metrics.nominalShearCapacity.toFixed(1) + " kN",
        "Reduced shear capacity: \u03d5Vf = \u03d5 x Vf = " + metrics.reductionFactor.toFixed(2) + " x " + metrics.nominalShearCapacity.toFixed(1) + " = " + spec.phiVf.toFixed(1) + " kN",
        "Detailing minima carried into the report image: minimum pitch = " + spec.minimumPitch.toFixed(1) + " mm, minimum edge distance = " + spec.minEdgeDistanceShear.toFixed(1) + " mm, washer diameter = " + spec.washerMaxOutsideDiameter.toFixed(1) + " mm"
      ],
      methodology: [
        "Select the bolt grade and bolt size from the application catalogue.",
        "Read the stored tensile area, ultimate tensile strength, and detailing dimensions from the current catalogue row.",
        "Calculate nominal tension and nominal shear capacities from the selected row using the equations listed in this report.",
        "Apply the reduction factor \u03d5 = 0.80 to produce the reduced design capacities displayed in the application and exported here.",
        "Export the live engineering visualisation as a high-resolution image and embed it in the Word document for issue, print, or PDF conversion."
      ],
      assumptions: [
        "The repository catalogue values are treated as the governing source data for this report.",
        "The selected bolt entry is assumed to be valid for the intended structural design standard and connection configuration.",
        "No connection demand loads are entered in the current tool, so adequacy against applied design actions is outside this exported report scope.",
        "The visualisation is a detailing aid derived from the selected catalogue dimensions and is not a full fabrication drawing."
      ],
      disclaimer: disclaimer,
      savedResults: tool.savedResults.slice()
    };
  }

  function createMetadataSection(docxApi, reportData) {
    return [
      new docxApi.Paragraph({
        heading: docxApi.HeadingLevel.TITLE,
        alignment: docxApi.AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new docxApi.TextRun({
            text: reportData.title,
            bold: true,
            color: "19344A",
            size: 30
          })
        ]
      }),
      new docxApi.Paragraph({
        alignment: docxApi.AlignmentType.CENTER,
        spacing: { after: 180 },
        children: [
          new docxApi.TextRun({
            text: "Professional engineering calculation sheet export",
            color: "1570EF",
            size: 22
          })
        ]
      }),
      createKeyValueTable(
        docxApi,
        ["Metadata", "Value"],
        reportData.metadata.map(function (row) {
          return [row.label, row.value];
        }),
        [2600, 7000]
      ),
      createSectionHeading(docxApi, "Design Summary"),
      createBodyParagraph(docxApi, reportData.designSummary)
    ];
  }

  function createInputsTable(docxApi, reportData) {
    return createKeyValueTable(
      docxApi,
      ["Input", "Value", "Units"],
      reportData.inputs.map(function (row) {
        return [row.parameter, row.value, row.units || "-"];
      }),
      [5200, 2600, 1800],
      [1, 2]
    );
  }

  function createResultsTable(docxApi, reportData) {
    return createKeyValueTable(
      docxApi,
      ["Result", "Value", "Units"],
      reportData.results.map(function (row) {
        return [row.parameter, row.value, row.units || "-"];
      }),
      [5200, 2600, 1800],
      [1, 2]
    );
  }

  function createEquationParagraph(docxApi, label, equation, note) {
    return new docxApi.Paragraph({
      spacing: { after: 90, line: 276 },
      children: [
        new docxApi.TextRun({
          text: label + ": ",
          bold: true,
          color: "1B2A38"
        }),
        new docxApi.TextRun({
          text: equation,
          color: "1570EF"
        })
      ].concat(note ? [
        new docxApi.TextRun({
          text: " - " + note,
          color: "4D6373"
        })
      ] : [])
    });
  }

  function createCalculationSection(docxApi, reportData) {
    var children = [
      createSectionHeading(docxApi, "Methodology")
    ];

    reportData.methodology.forEach(function (line) {
      children.push(createBulletParagraph(docxApi, line));
    });

    children.push(createSectionHeading(docxApi, "Governing Equations"));

    reportData.equations.forEach(function (equation) {
      children.push(createEquationParagraph(docxApi, equation.label, equation.equation, equation.description));
    });

    children.push(createSectionHeading(docxApi, "Intermediate Calculations"));

    reportData.intermediateCalculations.forEach(function (line) {
      children.push(createBodyParagraph(docxApi, line));
    });

    if (reportData.savedResults.length > 0) {
      children.push(createSectionHeading(docxApi, "Saved Results History"));
      children.push(createSavedResultsTable(docxApi, reportData.savedResults));
    }

    return children;
  }

  function buildFigureCaption(element, index) {
    var source = element.getAttribute("aria-label") || element.getAttribute("data-report-caption");
    var readable = source ? source.charAt(0).toUpperCase() + source.slice(1) : "Engineering visualisation";
    return "Figure " + index + " - " + readable;
  }

  function createVisualisationSection(docxApi, root) {
    var figureElements = Array.prototype.slice.call(
      root.querySelectorAll('[data-export-visualization] svg, [data-export-visualization] canvas')
    );
    var figures = [];

    return figureElements.reduce(function (promise, element, index) {
      return promise.then(function () {
        if (element instanceof SVGSVGElement) {
          return extractSvgAsPng(element, 3).then(function (exported) {
            figures.push({
              caption: buildFigureCaption(element, index + 1),
              imageData: exported.imageData,
              width: exported.width,
              height: exported.height
            });
          });
        }

        if (element instanceof HTMLCanvasElement) {
          return extractCanvasAsPng(element, 3).then(function (exportedCanvas) {
            figures.push({
              caption: buildFigureCaption(element, index + 1),
              imageData: exportedCanvas.imageData,
              width: exportedCanvas.width,
              height: exportedCanvas.height
            });
          });
        }

        return Promise.resolve();
      });
    }, Promise.resolve()).then(function () {
      var children = [createSectionHeading(docxApi, "Visualisation Section")];

      if (!figures.length) {
        children.push(createBodyParagraph(docxApi, "No visualisation elements were available at export time."));
        return children;
      }

      children.push(createBodyParagraph(
        docxApi,
        "The following figures were captured directly from the live engineering visualisation layer and embedded as high-resolution PNG images."
      ));

      figures.forEach(function (figure) {
        Array.prototype.push.apply(children, addImageToDoc(docxApi, figure.imageData, figure.caption, figure.width, figure.height));
      });

      return children;
    });
  }

  function createAssumptionsSection(docxApi, reportData) {
    var children = [createSectionHeading(docxApi, "Assumptions")];

    reportData.assumptions.forEach(function (line) {
      children.push(createBulletParagraph(docxApi, line));
    });

    children.push(createSectionHeading(docxApi, "Disclaimer"));
    children.push(createBodyParagraph(docxApi, reportData.disclaimer));
    return children;
  }

  function exportWordReport(tool, reportData) {
    var docxApi = window.docx;

    if (!docxApi) {
      return Promise.reject(new Error("The Word export library is not available on this page."));
    }

    return createVisualisationSection(docxApi, tool.root).then(function (visualisationChildren) {
      var footer = new docxApi.Footer({
        children: [
          new docxApi.Paragraph({
            alignment: docxApi.AlignmentType.CENTER,
            children: [
              new docxApi.TextRun({ text: "Page ", color: "4D6373", size: 18 }),
              new docxApi.TextRun({ children: [docxApi.PageNumber.CURRENT], color: "4D6373", size: 18 }),
              new docxApi.TextRun({ text: " of ", color: "4D6373", size: 18 }),
              new docxApi.TextRun({ children: [docxApi.PageNumber.TOTAL_PAGES], color: "4D6373", size: 18 })
            ]
          })
        ]
      });

      var sectionChildren = []
        .concat(createMetadataSection(docxApi, reportData))
        .concat([
          createSectionHeading(docxApi, "Key Results"),
          createResultsTable(docxApi, reportData),
          createSectionHeading(docxApi, "PASS / FAIL Checks"),
          createResultStatusTable(docxApi, reportData.passFailChecks),
          new docxApi.Paragraph({ children: [new docxApi.PageBreak()] }),
          createSectionHeading(docxApi, "Inputs"),
          createInputsTable(docxApi, reportData)
        ])
        .concat(createCalculationSection(docxApi, reportData))
        .concat([
          new docxApi.Paragraph({ children: [new docxApi.PageBreak()] })
        ])
        .concat(visualisationChildren)
        .concat([
          new docxApi.Paragraph({ children: [new docxApi.PageBreak()] })
        ])
        .concat(createAssumptionsSection(docxApi, reportData));

      var wordDocument = new docxApi.Document({
        sections: [
          {
            properties: {
              page: {
                size: { width: 11906, height: 16838 },
                margin: {
                  top: 720,
                  right: 720,
                  bottom: 900,
                  left: 720,
                  header: 450,
                  footer: 450
                }
              }
            },
            footers: { default: footer },
            children: sectionChildren
          }
        ]
      });

      return docxApi.Packer.toBlob(wordDocument).then(function (blob) {
        var downloadUrl = URL.createObjectURL(blob);
        var link = window.document.createElement("a");
        link.href = downloadUrl;
        link.download = reportData.fileName;
        link.click();
        URL.revokeObjectURL(downloadUrl);
      });
    });
  }

  function BoltCapacityTool(root) {
    this.root = root;
    this.catalogue = parseCatalogue(root);
    this.catalogueByGrade = groupCatalogueByGrade(this.catalogue);
    this.storageKey = createStorageKey(root);
    this.savedResults = readStorage(this.storageKey);
    this.lastState = null;
    this.isExporting = false;
    this.fields = {
      grade: root.querySelector('[data-et-field="bolt-grade"]'),
      size: root.querySelector('[data-et-field="bolt-size"]')
    };
    this.outputs = {
      visualStatus: root.querySelector('[data-et-output="visual-status"]'),
      phiVf: root.querySelector('[data-et-output="phi-vf"]'),
      phiNtf: root.querySelector('[data-et-output="phi-ntf"]'),
      nominalShear: root.querySelector('[data-et-output="nominal-shear"]'),
      nominalTension: root.querySelector('[data-et-output="nominal-tension"]'),
      fuf: root.querySelector('[data-et-output="fuf"]'),
      tensileArea: root.querySelector('[data-et-output="tensile-area"]'),
      tensileAreaProperty: root.querySelector('[data-et-output="tensile-area-property"]'),
      phiFactor: root.querySelector('[data-et-output="phi-factor"]'),
      shearFactor: root.querySelector('[data-et-output="shear-factor"]'),
      ratio: root.querySelector('[data-et-output="ratio"]'),
      diameter: root.querySelector('[data-et-output="diameter"]'),
      minimumPitch: root.querySelector('[data-et-output="minimum-pitch"]'),
      minimumEdgeDistance: root.querySelector('[data-et-output="minimum-edge-distance"]'),
      rolledPlateEdge: root.querySelector('[data-et-output="rolled-plate-edge"]'),
      rolledSectionEdge: root.querySelector('[data-et-output="rolled-section-edge"]'),
      nutHeight: root.querySelector('[data-et-output="nut-height"]'),
      nutFlats: root.querySelector('[data-et-output="nut-flats"]'),
      nutCorners: root.querySelector('[data-et-output="nut-corners"]'),
      washerId: root.querySelector('[data-et-output="washer-id"]'),
      washerOd: root.querySelector('[data-et-output="washer-od"]'),
      washerMinThickness: root.querySelector('[data-et-output="washer-min-thickness"]'),
      washerMaxThickness: root.querySelector('[data-et-output="washer-max-thickness"]')
    };
    this.emptyResult = root.querySelector('[data-et-role="empty-result"]');
    this.diagram = root.querySelector('[data-et-role="diagram"]');
    this.savedResultsBody = root.querySelector('[data-et-role="saved-results-body"]');
    this.equationShear = root.querySelector('[data-et-role="equation-shear"]');
    this.equationTension = root.querySelector('[data-et-role="equation-tension"]');
    this.shearEquation = root.querySelector('[data-et-panel="shear-equation"]');
    this.tensionEquation = root.querySelector('[data-et-panel="tension-equation"]');
    this.shearNote = root.querySelector('[data-et-role="shear-note"]');
    this.tensionNote = root.querySelector('[data-et-role="tension-note"]');
    this.shearIndicator = root.querySelector('[data-et-role="shear-indicator"]');
    this.tensionIndicator = root.querySelector('[data-et-role="tension-indicator"]');
    this.actions = {
      save: root.querySelector('[data-et-action="save-result"]'),
      clear: root.querySelector('[data-et-action="clear-results"]'),
      exportWord: root.querySelector('[data-et-action="export-word-report"]'),
      toggleShear: root.querySelector('[data-et-action="toggle-shear-equation"]'),
      toggleTension: root.querySelector('[data-et-action="toggle-tension-equation"]')
    };
  }

  BoltCapacityTool.prototype.init = function () {
    var self = this;

    this.fields.grade.value = DEFAULT_GRADE;
    this.syncSizeOptions(DEFAULT_SIZE);

    this.fields.grade.addEventListener("change", function () {
      self.syncSizeOptions("");
      self.update();
    });

    this.fields.size.addEventListener("change", function () {
      self.update();
    });

    this.actions.save.addEventListener("click", function () {
      self.saveCurrentResult();
    });

    this.actions.clear.addEventListener("click", function () {
      self.savedResults = [];
      writeStorage(self.storageKey, self.savedResults);
      self.renderSavedResults();
    });

    this.actions.exportWord.addEventListener("click", function () {
      self.handleExportReport();
    });

    this.actions.toggleShear.addEventListener("click", function () {
      self.toggleEquation("shear");
    });

    this.actions.toggleTension.addEventListener("click", function () {
      self.toggleEquation("tension");
    });

    this.renderEquations();
    this.renderSavedResults();
    this.update();
  };

  BoltCapacityTool.prototype.syncSizeOptions = function (preferredSize) {
    var grade = this.fields.grade.value;
    var rows = this.catalogueByGrade[grade] || [];
    var currentValue = preferredSize || this.fields.size.value;
    var sizeField = this.fields.size;

    sizeField.innerHTML = "";

    rows.forEach(function (row) {
      var option = document.createElement("option");
      option.value = row.boltSize;
      option.textContent = row.boltSize;
      sizeField.appendChild(option);
    });

    if (rows.some(function (row) { return row.boltSize === currentValue; })) {
      sizeField.value = currentValue;
    } else if (rows.length) {
      sizeField.value = rows[0].boltSize;
    }
  };

  BoltCapacityTool.prototype.toggleEquation = function (type) {
    var panel = type === "shear" ? this.shearEquation : this.tensionEquation;
    var note = type === "shear" ? this.shearNote : this.tensionNote;
    var toggle = type === "shear" ? this.actions.toggleShear : this.actions.toggleTension;
    var indicator = type === "shear" ? this.shearIndicator : this.tensionIndicator;
    var isCollapsed = panel.classList.toggle("is-collapsed");

    toggle.setAttribute("aria-expanded", isCollapsed ? "false" : "true");
    indicator.textContent = isCollapsed ? "+" : "\u2212";
    note.hidden = !isCollapsed;
  };

  BoltCapacityTool.prototype.renderEquations = function () {
    var shearFallback = "\u03d5Vf = \u03d5 x 0.62 x fuf x At x 10^-3";
    var tensionFallback = "\u03d5Ntf = \u03d5 x fuf x At x 10^-3";

    if (!window.katex) {
      this.equationShear.textContent = shearFallback;
      this.equationTension.textContent = tensionFallback;
      return;
    }

    window.katex.render("\\phi V_f = \\phi \\times 0.62 \\times f_{uf} \\times A_t \\times 10^{-3}", this.equationShear, {
      throwOnError: false,
      displayMode: true
    });
    window.katex.render("\\phi N_{tf} = \\phi \\times f_{uf} \\times A_t \\times 10^{-3}", this.equationTension, {
      throwOnError: false,
      displayMode: true
    });
  };

  BoltCapacityTool.prototype.updateValidationUI = function (errors) {
    var self = this;

    this.root.querySelectorAll("[data-error-for]").forEach(function (node) {
      var key = node.getAttribute("data-error-for");
      var field = self.root.querySelector('[data-et-field="' + key + '"]');
      var shell = field ? field.closest(".et-tool__input-wrap") : null;

      node.textContent = errors[key] || "";

      if (shell) {
        shell.classList.toggle("has-error", Boolean(errors[key]));
      }
    });
  };

  BoltCapacityTool.prototype.findSpec = function (grade, size) {
    var rows = this.catalogueByGrade[grade] || [];

    for (var index = 0; index < rows.length; index += 1) {
      if (rows[index].boltSize === size) {
        return rows[index];
      }
    }

    return null;
  };

  BoltCapacityTool.prototype.setInvalidState = function (validation) {
    var self = this;

    this.lastState = null;
    this.actions.save.disabled = true;
    this.actions.exportWord.disabled = true;
    this.outputs.visualStatus.textContent = "Awaiting selection";

    [
      "phiVf",
      "phiNtf",
      "nominalShear",
      "nominalTension",
      "fuf",
      "tensileArea",
      "tensileAreaProperty",
      "phiFactor",
      "shearFactor",
      "ratio",
      "diameter",
      "minimumPitch",
      "minimumEdgeDistance",
      "rolledPlateEdge",
      "rolledSectionEdge",
      "nutHeight",
      "nutFlats",
      "nutCorners",
      "washerId",
      "washerOd",
      "washerMinThickness",
      "washerMaxThickness"
    ].forEach(function (key) {
      if (self.outputs[key]) {
        self.outputs[key].textContent = "--";
      }
    });

    if (this.emptyResult) {
      this.emptyResult.hidden = false;
    }

    this.drawEmptyDiagram(validation.errors["bolt-grade"] || validation.errors["bolt-size"] || "Awaiting valid selection.");
  };

  BoltCapacityTool.prototype.renderOutputs = function (spec, metrics) {
    this.outputs.visualStatus.textContent = "Diagram active";
    this.outputs.phiVf.textContent = formatNumber(spec.phiVf, 1);
    this.outputs.phiNtf.textContent = formatNumber(spec.phiNtf, 1);
    this.outputs.nominalShear.textContent = formatNumber(metrics.nominalShearCapacity, 1) + " kN";
    this.outputs.nominalTension.textContent = formatNumber(metrics.nominalTensionCapacity, 1) + " kN";
    this.outputs.fuf.textContent = formatNumber(spec.fuf, 0) + " MPa";
    this.outputs.tensileArea.textContent = formatNumber(spec.tensileArea, 1) + " mm^2";
    this.outputs.tensileAreaProperty.textContent = formatNumber(spec.tensileArea, 1) + " mm^2";
    this.outputs.phiFactor.textContent = formatNumber(metrics.reductionFactor, 2);
    this.outputs.shearFactor.textContent = formatNumber(metrics.shearFactor, 2);
    this.outputs.ratio.textContent = formatNumber(metrics.shearToTensionRatio, 2);
    this.outputs.diameter.textContent = formatNumber(metrics.diameter, 0) + " mm";
    this.outputs.minimumPitch.textContent = formatNumber(spec.minimumPitch, 1) + " mm";
    this.outputs.minimumEdgeDistance.textContent = formatNumber(spec.minEdgeDistanceShear, 1) + " mm";
    this.outputs.rolledPlateEdge.textContent = formatNumber(spec.minEdgeDistanceRolledPlate, 1) + " mm";
    this.outputs.rolledSectionEdge.textContent = formatNumber(spec.minEdgeDistanceRolledSection, 1) + " mm";
    this.outputs.nutHeight.textContent = formatNumber(spec.maxNutHeight, 1) + " mm";
    this.outputs.nutFlats.textContent = formatNumber(spec.nutWidthAcrossFlats, 1) + " mm";
    this.outputs.nutCorners.textContent = formatNumber(spec.nutWidthAcrossCorners, 1) + " mm";
    this.outputs.washerId.textContent = formatNumber(spec.washerMaxInsideDiameter, 2) + " mm";
    this.outputs.washerOd.textContent = formatNumber(spec.washerMaxOutsideDiameter, 1) + " mm";
    this.outputs.washerMinThickness.textContent = formatNumber(spec.washerMinThickness, 1) + " mm";
    this.outputs.washerMaxThickness.textContent = formatNumber(spec.washerMaxThickness, 1) + " mm";

    if (this.emptyResult) {
      this.emptyResult.hidden = true;
    }
  };

  BoltCapacityTool.prototype.drawEmptyDiagram = function (message) {
    this.diagram.innerHTML = [
      '<rect x="0" y="0" width="520" height="360" fill="#f8fbfa"></rect>',
      '<text x="260" y="180" text-anchor="middle" class="et-bc-svg-note">' + escapeHtml(message) + "</text>"
    ].join("");
  };

  BoltCapacityTool.prototype.drawDiagram = function (spec, metrics) {
    var diameter = metrics.diameter || 24;
    var washerRadius = Math.min(54, spec.washerMaxOutsideDiameter * 0.9);
    var holeRadius = Math.max(10, diameter * 0.9);
    var edgeDistance = Math.min(120, spec.minEdgeDistanceShear * 2.2);
    var pitchDistance = Math.min(180, spec.minimumPitch * 2.15);
    var shearArrow = 28 + Math.min(80, spec.phiVf / 4.5);
    var tensionArrow = 28 + Math.min(86, spec.phiNtf / 6.5);
    var plateStartX = 78;
    var boltCenterX = plateStartX + edgeDistance;
    var boltCenterY = 193;
    var pitchLabelX = Math.max(170, boltCenterX + pitchDistance * 0.22);
    var washerLabelX = boltCenterX + washerRadius + 44;
    var washerLabelY = boltCenterY + 6;

    this.diagram.innerHTML = [
      "<defs>",
      '<pattern id="' + this.root.id + '-grid" width="24" height="24" patternUnits="userSpaceOnUse">',
      '<path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(109, 140, 161, 0.16)" stroke-width="1"></path>',
      "</pattern>",
      '<marker id="' + this.root.id + '-arrow-blue" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">',
      '<path d="M0,0 L8,4 L0,8 z" fill="#1570ef"></path>',
      "</marker>",
      '<marker id="' + this.root.id + '-arrow-teal" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">',
      '<path d="M0,0 L8,4 L0,8 z" fill="#157068"></path>',
      "</marker>",
      "</defs>",
      '<rect x="0" y="0" width="520" height="360" fill="url(#' + this.root.id + '-grid)" rx="24"></rect>',
      '<rect x="58" y="86" width="404" height="214" rx="26" fill="rgba(255,255,255,0.72)" stroke="rgba(112, 140, 157, 0.22)"></rect>',
      '<rect x="78" y="106" width="364" height="174" rx="20" fill="rgba(228, 239, 244, 0.62)" stroke="rgba(112, 140, 157, 0.20)"></rect>',
      '<line x1="' + (boltCenterX - 6) + '" y1="' + boltCenterY + '" x2="350" y2="' + boltCenterY + '" stroke="rgba(21, 112, 104, 0.18)" stroke-width="1.5" stroke-dasharray="6 6"></line>',
      '<line x1="' + boltCenterX + '" y1="118" x2="' + boltCenterX + '" y2="268" stroke="rgba(21, 112, 104, 0.18)" stroke-width="1.5" stroke-dasharray="6 6"></line>',
      '<text x="' + (boltCenterX + 32) + '" y="130" class="et-bc-svg-axis">y-y</text>',
      '<text x="' + (boltCenterX + pitchDistance * 0.48) + '" y="186" class="et-bc-svg-axis">x-x</text>',
      '<circle cx="' + boltCenterX + '" cy="' + boltCenterY + '" r="' + washerRadius + '" fill="rgba(21, 112, 239, 0.08)" stroke="#1570ef" stroke-width="2.5"></circle>',
      '<circle cx="' + boltCenterX + '" cy="' + boltCenterY + '" r="' + holeRadius + '" fill="#f5f7f6" stroke="#0f5bd3" stroke-width="2.5"></circle>',
      '<polygon points="' + [
        (boltCenterX - washerRadius * 0.7) + "," + boltCenterY,
        (boltCenterX - washerRadius * 0.35) + "," + (boltCenterY - washerRadius * 0.62),
        (boltCenterX + washerRadius * 0.35) + "," + (boltCenterY - washerRadius * 0.62),
        (boltCenterX + washerRadius * 0.7) + "," + boltCenterY,
        (boltCenterX + washerRadius * 0.35) + "," + (boltCenterY + washerRadius * 0.62),
        (boltCenterX - washerRadius * 0.35) + "," + (boltCenterY + washerRadius * 0.62)
      ].join(" ") + '" fill="rgba(21, 112, 104, 0.1)" stroke="#157068" stroke-width="2"></polygon>',
      '<circle cx="' + (boltCenterX + pitchDistance) + '" cy="' + boltCenterY + '" r="' + holeRadius + '" fill="transparent" stroke="rgba(15, 91, 211, 0.4)" stroke-width="2" stroke-dasharray="8 8"></circle>',
      '<line x1="' + plateStartX + '" y1="308" x2="' + boltCenterX + '" y2="308" stroke="#1570ef" stroke-width="2" marker-start="url(#' + this.root.id + '-arrow-blue)" marker-end="url(#' + this.root.id + '-arrow-blue)"></line>',
      '<line x1="' + boltCenterX + '" y1="58" x2="' + (boltCenterX + pitchDistance) + '" y2="58" stroke="#1570ef" stroke-width="2" marker-start="url(#' + this.root.id + '-arrow-blue)" marker-end="url(#' + this.root.id + '-arrow-blue)"></line>',
      '<line x1="' + (boltCenterX + washerRadius + 30) + '" y1="' + (boltCenterY - washerRadius) + '" x2="' + (boltCenterX + washerRadius + 30) + '" y2="' + (boltCenterY + washerRadius) + '" stroke="#157068" stroke-width="2" marker-start="url(#' + this.root.id + '-arrow-teal)" marker-end="url(#' + this.root.id + '-arrow-teal)"></line>',
      '<line x1="' + (boltCenterX - washerRadius) + '" y1="' + boltCenterY + '" x2="' + (boltCenterX - washerRadius - shearArrow) + '" y2="' + boltCenterY + '" stroke="#1570ef" stroke-width="3" marker-end="url(#' + this.root.id + '-arrow-blue)"></line>',
      '<line x1="' + boltCenterX + '" y1="' + (boltCenterY - washerRadius + 8) + '" x2="' + boltCenterX + '" y2="' + (boltCenterY - washerRadius + 8 - tensionArrow) + '" stroke="#157068" stroke-width="3" marker-end="url(#' + this.root.id + '-arrow-teal)"></line>',
      '<text x="96" y="336" class="et-bc-svg-dimension">Minimum edge distance = ' + escapeHtml(formatNumber(spec.minEdgeDistanceShear, 1)) + " mm</text>",
      '<text x="' + pitchLabelX + '" y="48" class="et-bc-svg-dimension">Minimum pitch = ' + escapeHtml(formatNumber(spec.minimumPitch, 1)) + " mm</text>",
      '<text x="' + washerLabelX + '" y="' + washerLabelY + '" class="et-bc-svg-dimension">Washer diameter = ' + escapeHtml(formatNumber(spec.washerMaxOutsideDiameter, 1)) + " mm</text>",
      '<text x="48" y="186" class="et-bc-svg-force">\u03d5Vf</text>',
      '<text x="' + (boltCenterX - 14) + '" y="54" class="et-bc-svg-force et-bc-svg-force--teal">\u03d5Ntf</text>',
      '<text x="82" y="96" class="et-bc-svg-note">Plate face</text>',
      '<text x="300" y="260" class="et-bc-svg-badge">' + escapeHtml(spec.boltGrade) + "</text>",
      '<text x="300" y="288" class="et-bc-svg-badge et-bc-svg-badge--accent">' + escapeHtml(spec.boltSize) + "</text>"
    ].join("");
  };

  BoltCapacityTool.prototype.update = function () {
    var grade = this.fields.grade.value;
    var size = this.fields.size.value;
    var validation = validateSelection(grade, size, this.catalogueByGrade);
    var spec;
    var metrics;

    this.updateValidationUI(validation.errors);

    if (!validation.isValid) {
      this.setInvalidState(validation);
      return;
    }

    spec = this.findSpec(grade, size);

    if (!spec) {
      this.setInvalidState({
        errors: { "bolt-size": "Selected size is not available for this grade." }
      });
      return;
    }

    metrics = deriveMetrics(spec);
    this.lastState = {
      spec: spec,
      metrics: metrics
    };
    this.actions.save.disabled = false;
    this.actions.exportWord.disabled = this.isExporting;
    this.renderOutputs(spec, metrics);
    this.drawDiagram(spec, metrics);
  };

  BoltCapacityTool.prototype.saveCurrentResult = function () {
    var spec;
    var row;

    if (!this.lastState) {
      return;
    }

    spec = this.lastState.spec;
    row = {
      id: Date.now(),
      timestamp: formatTimestamp(Date.now()),
      boltGrade: spec.boltGrade,
      boltSize: spec.boltSize,
      phiVf: spec.phiVf,
      phiNtf: spec.phiNtf,
      minimumPitch: spec.minimumPitch,
      minEdgeDistanceShear: spec.minEdgeDistanceShear
    };

    this.savedResults.unshift(row);
    writeStorage(this.storageKey, this.savedResults);
    this.savedResults = readStorage(this.storageKey);
    this.renderSavedResults();
  };

  BoltCapacityTool.prototype.renderSavedResults = function () {
    if (!this.savedResults.length) {
      this.savedResultsBody.innerHTML = '<tr><td colspan="7" class="et-bc-table-empty">No saved results yet. Choose a bolt and save it to build your comparison table.</td></tr>';
      return;
    }

    this.savedResultsBody.innerHTML = this.savedResults.map(function (row) {
      return [
        "<tr>",
        "<td>", escapeHtml(row.timestamp), "</td>",
        "<td>", escapeHtml(row.boltGrade), "</td>",
        "<td>", escapeHtml(row.boltSize), "</td>",
        "<td>", escapeHtml(formatNumber(row.phiVf, 1)), " kN</td>",
        "<td>", escapeHtml(formatNumber(row.phiNtf, 1)), " kN</td>",
        "<td>", escapeHtml(formatNumber(row.minimumPitch, 1)), " mm</td>",
        "<td>", escapeHtml(formatNumber(row.minEdgeDistanceShear, 1)), " mm</td>",
        "</tr>"
      ].join("");
    }).join("");
  };

  BoltCapacityTool.prototype.handleExportReport = function () {
    var self = this;

    if (!this.lastState || this.isExporting) {
      return;
    }

    this.isExporting = true;
    this.actions.exportWord.disabled = true;
    this.actions.exportWord.textContent = "Exporting Report...";

    exportWordReport(this, buildCalculationReportData(this))
      .catch(function (error) {
        window.console.error(error);
      })
      .finally(function () {
        self.isExporting = false;
        self.actions.exportWord.disabled = !self.lastState;
        self.actions.exportWord.textContent = "Export Word Report";
      });
  };

  function boot() {
    document.querySelectorAll('.et-tool[data-et-tool="' + TOOL_SLUG + '"]').forEach(function (root) {
      if (root.dataset.etInitialised === "true") {
        return;
      }

      root.dataset.etInitialised = "true";
      new BoltCapacityTool(root).init();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  document.addEventListener("engineering-tools:ready", boot);
}());
