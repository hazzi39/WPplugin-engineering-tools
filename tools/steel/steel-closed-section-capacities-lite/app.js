(function () {
  "use strict";

  var TOOL_SLUG = "steel-closed-section-capacities-lite";
  var STORAGE_PREFIX = "engineering-tools-steel-closed-section-capacities-lite-v1";
  var MAX_REASONABLE_INPUT = 1000000;
  var DEFAULT_STATE = {
    family: "CHS",
    grade: "C350",
    designation: "193.7x8.0CHS",
    compression: "50",
    tension: "0",
    momentMajor: "50",
    momentMinor: "0",
    shearMajor: "20",
    shearMinor: "0",
    torsion: "0"
  };
  var FAMILY_DEFAULTS = {
    CHS: { grade: "C350", designation: "193.7x8.0CHS" },
    SHS: { grade: "C350", designation: "150x150x9.0SHS" },
    RHS: { grade: "C350", designation: "250x150x9.0RHS" }
  };
  var ROWS = [
    ["RHS", "C350", "250x150x9.0RHS", 51.8, 2080, 2080, 168, 117, 759, 449, 449],
    ["RHS", "C350", "200x100x9.0RHS", 37.7, 1510, 1510, 92.4, 56.8, 590, 279, 279],
    ["RHS", "C350", "185x65x6.0RHS", 21.4, 861, 861, 46.7, 20.8, 366, 120, 120],
    ["RHS", "C350", "152x76x9.5RHS", 28.7, 1150, 1150, 51.6, 31.5, 455, 205, 205],
    ["RHS", "C350", "150x100x9.0RHS", 30.6, 1230, 1230, 58.2, 43.9, 435, 279, 279],
    ["RHS", "C350", "127x51x60RHS", 14.7, 589, 589, 21.7, 11.3, 245, 88.5, 88.5],
    ["RHS", "C350", "125x75x60RHS", 16.7, 672, 672, 26.5, 18.6, 247, 143, 143],
    ["RHS", "C350", "102x76x60RHS", 14.7, 589, 589, 19.5, 15.9, 199, 145, 145],
    ["RHS", "C350", "100x50x60RHS", 12, 483, 483, 14.3, 8.74, 190, 86.2, 86.2],
    ["RHS", "C350", "76x38x40RHS", 6.23, 250, 250, 5.71, 3.5, 97.9, 45.4, 45.4],
    ["RHS", "C350", "75x50x6.0RHS", 9.67, 388, 388, 8.84, 6.66, 138, 86.2, 86.2],
    ["RHS", "C350", "75x25x3.0RHS", 4.25, 170, 170, 3.68, 1.64, 72.8, 21.5, 21.5],
    ["RHS", "C350", "65x35x4.0RHS", 5.35, 215, 215, 4.18, 2.7, 82.4, 40.8, 40.8],
    ["RHS", "C350", "50x25x3.0RHS", 3.07, 123, 123, 1.85, 1.12, 47.5, 21.5, 21.5],
    ["RHS", "C350", "50x20x3.0RHS", 2.83, 114, 114, 1.62, 0.827, 46.9, 15.9, 15.9],
    ["RHS", "C350", "38x25x1.6RHS", 1.45, 58.2, 58.2, 0.725, 0.543, 20.4, 13.2, 13.2],
    ["RHS", "C450", "200x100x6.0RHS", 26.2, 1310, 1270, 85.1, 44.4, 522, 257, 257],
    ["RHS", "C450", "150x100x6.0RHS", 21.4, 1110, 1050, 54.4, 40.7, 389, 257, 257],
    ["RHS", "C450", "150x50x60RHS", 16.7, 864, 816, 36.9, 16.4, 374, 111, 111],
    ["RHS", "C450", "127x51x60RHS", 14.7, 757, 715, 27.9, 14.5, 315, 114, 114],
    ["RHS", "C450", "125x75x60RHS", 16.7, 884, 816, 34.1, 23.9, 317, 184, 184],
    ["RHS", "C450", "102x76x60RHS", 14.7, 757, 715, 25.1, 20.5, 255, 187, 187],
    ["RHS", "C450", "100x50x60RHS", 12, 621, 586, 18.4, 11.2, 244, 111, 9.94],
    ["RHS", "C450", "76x38x40RHS", 6.23, 321, 303, 7.34, 4.5, 126, 58.3, 4.03],
    ["RHS", "C450", "75x50x60RHS", 9.67, 499, 471, 11.4, 8.56, 178, 111, 7.11],
    ["RHS", "C450", "75x25x25RHS", 3.6, 186, 176, 4.07, 1.64, 79.1, 24.3, 1.73],
    ["RHS", "C450", "65x35x4.0RHS", 5.35, 276, 291, 5.35, 3.48, 106, 52.5, 3.05],
    ["RHS", "C450", "50x25x3.0RHS", 3.07, 158, 149, 2.37, 1.44, 61.1, 27.7, 1.26],
    ["SHS", "C350", "250x250x9.0SHS", 65.9, 2650, 2650, 234, null, 780, null, 184],
    ["SHS", "C350", "150x150x9.0SHS", 37.7, 1510, 1510, 78.2, null, 444, null, 59.7],
    ["SHS", "C350", "125x125x9.0SHS", 30.6, 1230, 1230, 52, null, 360, null, 39.3],
    ["SHS", "C350", "100x100x9.0SHS", 23.5, 944, 944, 31, null, 276, null, 23.2],
    ["SHS", "C350", "89x89x6.0SHS", 14.7, 589, 589, 17.9, null, 172, null, 13.6],
    ["SHS", "C350", "75x75x6.0SHS", 12, 483, 483, 12.1, null, 141, null, 9.11],
    ["SHS", "C350", "65x65x6.0SHS", 10.1, 407, 407, 8.67, null, 119, null, 6.46],
    ["SHS", "C350", "50x50x5.0SHS", 6.39, 256, 256, 4.14, null, 74.7, null, 3.07],
    ["SHS", "C350", "40x40x4.0SHS", 5.35, 215, 215, 3.59, null, 62.7, null, 2.7],
    ["SHS", "C350", "30x30x3.0SHS", 2.82, 113, 113, 1.56, null, 32.7, null, 1.17],
    ["SHS", "C350", "20x20x2.0SHS", 1.88, 75.3, 75.3, 1.07, null, 22, null, 0.824],
    ["SHS", "C450", "150x150x6.0SHS", 26.2, 1350, 1270, 71, null, 397, null, 55.7],
    ["SHS", "C450", "125x125x6.0SHS", 21.4, 1110, 1050, 48.6, null, 325, null, 37.4],
    ["SHS", "C450", "100x100x6.0SHS", 16.7, 864, 816, 29.8, null, 253, null, 22.7],
    ["SHS", "C450", "90x90x3.0SHS", 8.01, 413, 390, 11.9, null, 121, null, 10.3],
    ["SHS", "C450", "75x75x6.0SHS", 12, 621, 586, 15.6, null, 181, null, 11.7],
    ["SHS", "C450", "65x65x6.0SHS", 10.1, 523, 494, 11.1, null, 153, null, 8.31],
    ["SHS", "C450", "50x50x5.0SHS", 6.39, 330, 311, 5.33, null, 96, null, 3.95],
    ["SHS", "C450", "40x40x4.0SHS", 4.09, 211, 199, 2.73, null, 61.4, null, 2.02],
    ["CHS", "C250", "610.0x12.7CHS", 187, 5360, 5360, 1020, null, 1930, null, 941],
    ["CHS", "C250", "508.0x12.7CHS", 155, 4450, 4450, 701, null, 1600, null, 645],
    ["CHS", "C250", "165.1x5.4CHS", 21.3, 610, 610, 31, null, 219, null, 28.3],
    ["CHS", "C250", "139.7x5.4CHS", 17.9, 513, 513, 21.9, null, 185, null, 19.9],
    ["CHS", "C250", "114.3x5.4CHS", 14.5, 416, 416, 14.4, null, 150, null, 13],
    ["CHS", "C250", "88.9x5.9CHS", 12.1, 346, 346, 9.16, null, 125, null, 8.09],
    ["CHS", "C250", "76.1x5.9CHS", 10.2, 293, 293, 6.56, null, 105, null, 5.73],
    ["CHS", "C250", "60.3x5.4CHS", 7.31, 210, 210, 3.67, null, 75.4, null, 3.17],
    ["CHS", "C250", "48.3x5.4CHS", 5.71, 164, 164, 2.25, null, 59, null, 1.9],
    ["CHS", "C250", "42.4x4.9CHS", 4.53, 130, 130, 1.56, null, 46.8, null, 1.31],
    ["CHS", "C250", "33.7x4.5CHS", 3.24, 92.9, 92.9, 0.87, null, 33.4, null, 0.722],
    ["CHS", "C250", "26.9x4.0CHS", 2.26, 64.7, 64.7, 0.477, null, 23.3, null, 0.39],
    ["CHS", "C250", "21.3x3.6CHS", 1.57, 45, 45, 0.257, null, 16.2, null, 0.207],
    ["CHS", "C350", "457.0x12.7CHS", 139, 5580, 5580, 789, null, 2010, null, 724],
    ["CHS", "C350", "406.4x12.7CHS", 123, 4950, 4950, 620, null, 1780, null, 567],
    ["CHS", "C350", "355.6x12.7CHS", 107, 4310, 4310, 471, null, 1550, null, 428],
    ["CHS", "C350", "323.9x12.7CHS", 97.5, 3910, 3910, 388, null, 1410, null, 351],
    ["CHS", "C350", "273.1x12.7CHS", 81.6, 3270, 3270, 271, null, 1180, null, 244],
    ["CHS", "C350", "219.1x12.7CHS", 64.6, 2590, 2590, 171, null, 934, null, 152],
    ["CHS", "C350", "193.7x8.0CHS", 36.6, 1470, 1470, 87, null, 529, null, 78.7],
    ["CHS", "C350", "168.3x11.0CHS", 42.7, 1710, 1710, 85.9, null, 616, null, 75.9],
    ["CHS", "C350", "165.1x3.5CHS", 13.9, 560, 560, 27.3, null, 201, null, 26.6],
    ["CHS", "C350", "152.4x6.0CHS", 21.7, 869, 869, 40.5, null, 313, null, 36.7],
    ["CHS", "C350", "139.7x3.5CHS", 11.8, 472, 472, 20.1, null, 170, null, 18.8],
    ["CHS", "C350", "127.0x6.0CHS", 17.9, 718, 718, 27.7, null, 259, null, 24.9],
    ["CHS", "C350", "114.3x6.0CHS", 16, 643, 643, 22.2, null, 231, null, 19.9],
    ["CHS", "C350", "101.6x6.4CHS", 15, 603, 603, 18.3, null, 217, null, 16.2],
    ["CHS", "C350", "88.9x5.5CHS", 11.3, 454, 454, 12.1, null, 163, null, 10.7],
    ["CHS", "C350", "76.1x3.2CHS", 5.75, 231, 231, 5.36, null, 83.1, null, 4.85],
    ["CHS", "C350", "48.3x3.2CHS", 3.56, 143, 143, 2.05, null, 51.4, null, 1.81],
    ["CHS", "C350", "42.4x2.6CHS", 2.55, 102, 102, 1.3, null, 36.9, null, 1.15],
    ["CHS", "C350", "21.3x2.0CHS", 0.952, 38.2, 38.2, 0.236, null, 13.8, null, 0.203]
  ];

  var SECTIONS = ROWS.map(function (row) {
    return {
      family: row[0],
      grade: row[1],
      designation: row[2],
      capacities: {
        mass: row[3],
        compression: row[4],
        tension: row[5],
        momentMajor: row[6],
        momentMinor: row[7],
        shearMajor: row[8],
        shearMinor: row[9],
        torsion: row[10]
      }
    };
  }).map(function (section) {
    section.geometry = parseGeometry(section.family, section.designation);
    section.area = getAreaEstimate(section);
    return section;
  });

  function formatNumber(value, digits) {
    return new Intl.NumberFormat("en-AU", {
      minimumFractionDigits: digits === 0 ? 0 : 0,
      maximumFractionDigits: typeof digits === "number" ? digits : 2
    }).format(value);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#039;"
      }[character];
    });
  }

  function formatDateTime(timestamp) {
    return new Date(timestamp).toLocaleString("en-AU");
  }

  function parseGeometry(family, designation) {
    var normalized = String(designation).replace(/[^0-9A-Za-z.]+/g, "x");
    var numericValues = normalized.match(/\d+(\.\d+)?/g) || [];
    var values = numericValues.map(Number);

    if (family === "CHS") {
      return {
        outerDiameter: values[0] || 0,
        thickness: values[1] || 0
      };
    }

    var width = values[0] || 0;
    var depth = family === "SHS" ? width : (values[1] || width);
    var rawThickness = family === "SHS" ? (values[1] || 0) : (values[2] || 0);
    return {
      width: width,
      depth: depth,
      thickness: rawThickness >= 20 ? rawThickness / 10 : rawThickness
    };
  }

  function getAreaEstimate(section) {
    if (section.family === "CHS") {
      var outerRadius = section.geometry.outerDiameter / 2;
      var innerRadius = Math.max(outerRadius - section.geometry.thickness, 0);
      return Math.PI * (outerRadius * outerRadius - innerRadius * innerRadius);
    }

    var width = section.geometry.width || 0;
    var depth = section.geometry.depth || 0;
    var innerWidth = Math.max(width - 2 * section.geometry.thickness, 0);
    var innerDepth = Math.max(depth - 2 * section.geometry.thickness, 0);
    return width * depth - innerWidth * innerDepth;
  }

  function getFamilies() {
    return ["CHS", "SHS", "RHS"];
  }

  function getGrades(family) {
    var grades = [];
    SECTIONS.forEach(function (section) {
      if (section.family === family && grades.indexOf(section.grade) === -1) {
        grades.push(section.grade);
      }
    });
    return grades;
  }

  function getDesignations(family, grade) {
    return SECTIONS.filter(function (section) {
      return section.family === family && section.grade === grade;
    }).map(function (section) {
      return section.designation;
    });
  }

  function getSection(family, grade, designation) {
    return SECTIONS.find(function (section) {
      return section.family === family && section.grade === grade && section.designation === designation;
    }) || null;
  }

  function buildRatio(label, symbol, demand, capacity) {
    return {
      label: label,
      symbol: symbol,
      demand: demand,
      capacity: capacity,
      ratio: capacity > 0 ? demand / capacity : 0
    };
  }

  function parseInputValue(value) {
    return value.trim() === "" ? 0 : Number(value);
  }

  function validateNumber(label, value, errors, key) {
    if (value.trim() === "") {
      return;
    }

    var numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      errors[key] = label + " must be numeric.";
      return;
    }
    if (numeric < 0) {
      errors[key] = label + " cannot be negative.";
      return;
    }
    if (numeric > MAX_REASONABLE_INPUT) {
      errors[key] = label + " is outside the supported engineering range.";
    }
  }

  function computeResult(section, demandValues) {
    var ratios = [
      buildRatio("Compression", "\u03d5NC", demandValues.compression, section.capacities.compression),
      buildRatio("Tension", "\u03d5NT", demandValues.tension, section.capacities.tension),
      buildRatio(section.family === "RHS" ? "Major Moment" : "Moment", section.family === "RHS" ? "\u03d5MX" : "\u03d5M", demandValues.momentMajor, section.capacities.momentMajor),
      buildRatio(section.family === "RHS" ? "Major Shear" : "Shear", section.family === "RHS" ? "\u03d5VX" : "\u03d5V", demandValues.shearMajor, section.capacities.shearMajor),
      buildRatio("Torsion", "\u03d5T", demandValues.torsion, section.capacities.torsion)
    ];

    if (section.family === "RHS" && section.capacities.momentMinor !== null && section.capacities.shearMinor !== null) {
      ratios.push(buildRatio("Minor Moment", "\u03d5MY", demandValues.momentMinor, section.capacities.momentMinor));
      ratios.push(buildRatio("Minor Shear", "\u03d5VY", demandValues.shearMinor, section.capacities.shearMinor));
    }

    var governing = ratios.reduce(function (current, entry) {
      return entry.ratio > current.ratio ? entry : current;
    }, ratios[0]);

    return {
      ratios: ratios,
      governingRatio: governing.ratio,
      controllingMode: governing.label,
      governingSymbol: governing.symbol,
      status: governing.ratio <= 1 ? "PASS" : "FAIL"
    };
  }

  function createSvgNode(tagName, attributes) {
    var node = document.createElementNS("http://www.w3.org/2000/svg", tagName);
    Object.keys(attributes).forEach(function (key) {
      node.setAttribute(key, String(attributes[key]));
    });
    return node;
  }

  function readStorage(key) {
    try {
      var value = window.localStorage.getItem(key);
      return value ? JSON.parse(value) : [];
    } catch (error) {
      return [];
    }
  }

  function writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      return;
    }
  }

  function createMetadataSection(docx, data) {
    return [
      new docx.Paragraph({ text: data.title, heading: docx.HeadingLevel.TITLE, spacing: { after: 80 } }),
      new docx.Paragraph({
        children: [new docx.TextRun({ text: "Structural engineering calculation sheet", size: 24, color: "5D7682" })],
        spacing: { after: 120 }
      }),
      createCompactTable(docx, ["Field", "Value"], [
        ["Company", data.metadata.company],
        ["Project", data.metadata.project],
        ["Project No.", data.metadata.projectNumber],
        ["Client", data.metadata.client],
        ["Prepared By", data.metadata.preparedBy],
        ["Checked By", data.metadata.checkedBy],
        ["Issue Purpose", data.metadata.issuePurpose],
        ["Generated", data.generatedLabel],
        ["Tool", data.title],
        ["Reference", data.reference]
      ])
    ];
  }

  function createInputsTable(docx, data) {
    return createCompactTable(docx, ["Input", "Value", "Unit"], data.inputRows);
  }

  function createResultsTable(docx, data) {
    return createCompactTable(docx, ["Check", "Demand", "Capacity", "Ratio"], data.resultRows, true);
  }

  function createCalculationSection(docx, data) {
    var content = [
      new docx.Paragraph({
        children: [new docx.TextRun({ text: "Methodology", bold: true, color: "1778D6", size: 24 })],
        spacing: { before: 120, after: 60 }
      })
    ];

    data.methodology.forEach(function (item) {
      content.push(new docx.Paragraph({ text: item, bullet: { level: 0 }, spacing: { after: 40 } }));
    });

    content.push(new docx.Paragraph({
      children: [new docx.TextRun({ text: "Governing Equations", bold: true, color: "1778D6", size: 24 })],
      spacing: { before: 120, after: 60 }
    }));

    data.equations.forEach(function (equation) {
      content.push(createEquationParagraph(docx, equation));
    });

    content.push(new docx.Paragraph({
      children: [new docx.TextRun({ text: "Intermediate Calculations", bold: true, color: "1778D6", size: 24 })],
      spacing: { before: 120, after: 60 }
    }));

    content.push(createCompactTable(docx, ["Item", "Value"], data.intermediateRows));
    return content;
  }

  function createEquationParagraph(docx, text) {
    return new docx.Paragraph({
      spacing: { after: 50 },
      children: [new docx.TextRun({ text: text, size: 20, color: "17313A" })]
    });
  }

  function createVisualisationSection(docx, visualisations) {
    var content = [
      new docx.Paragraph({
        children: [new docx.TextRun({ text: "Visualisation", bold: true, color: "1778D6", size: 24 })],
        spacing: { before: 120, after: 60 }
      })
    ];

    visualisations.forEach(function (figure, index) {
      content = content.concat(addImageToDoc(docx, figure, index + 1));
    });
    return content;
  }

  function createAssumptionsSection(docx, data) {
    var content = [
      new docx.Paragraph({
        children: [new docx.TextRun({ text: "Assumptions", bold: true, color: "1778D6", size: 24 })],
        spacing: { before: 120, after: 60 }
      })
    ];

    data.assumptions.forEach(function (item) {
      content.push(new docx.Paragraph({ text: item, bullet: { level: 0 }, spacing: { after: 40 } }));
    });

    content.push(new docx.Paragraph({
      children: [new docx.TextRun({ text: "Disclaimer", bold: true, color: "1778D6", size: 24 })],
      spacing: { before: 120, after: 60 }
    }));
    content.push(new docx.Paragraph({ text: data.metadata.disclaimer, spacing: { after: 40 } }));
    return content;
  }

  function createCompactTable(docx, headers, rows, isResultTable) {
    return new docx.Table({
      width: { size: 100, type: docx.WidthType.PERCENTAGE },
      layout: docx.TableLayoutType.FIXED,
      rows: [
        new docx.TableRow({
          tableHeader: true,
          children: headers.map(function (header) {
            return new docx.TableCell({
              shading: { fill: "EAF2F8" },
              children: [
                new docx.Paragraph({
                  alignment: docx.AlignmentType.CENTER,
                  children: [new docx.TextRun({ text: header, bold: true, color: "17313A", size: 18 })]
                })
              ]
            });
          })
        })
      ].concat(rows.map(function (row) {
        return new docx.TableRow({
          children: row.map(function (value, index) {
            var style = {
              text: String(value),
              color: "17313A",
              size: 18
            };

            if (isResultTable && index === row.length - 1 && /^PASS|FAIL/.test(String(row[row.length - 1]))) {
              style.bold = true;
              style.color = String(row[row.length - 1]).indexOf("PASS") === 0 ? "1F7A5C" : "B14A52";
            }

            return new docx.TableCell({
              children: [
                new docx.Paragraph({
                  alignment: index === 0 ? docx.AlignmentType.LEFT : docx.AlignmentType.CENTER,
                  children: [new docx.TextRun(style)]
                })
              ]
            });
          })
        });
      }))
    });
  }

  function buildCalculationReportData(tool) {
    if (!tool.lastState) {
      return Promise.reject(new Error("No result available."));
    }

    var state = tool.lastState;
    return createVisualisationExports(tool.root).then(function (visualisations) {
      return {
        title: "Steel Closed Section Capacities (Lite)",
        generated: new Date(),
        generatedLabel: new Date().toLocaleString("en-AU"),
        reference: "Closed steel section tabulated capacities",
        metadata: {
          company: tool.getMetadataValue("report-company", "data-report-company", "Not specified"),
          project: tool.getMetadataValue("report-project", "data-report-project", "Not specified"),
          projectNumber: tool.getMetadataValue("report-project-number", "data-report-project-number", "Not specified"),
          client: tool.getMetadataValue("report-client", "data-report-client", "Not specified"),
          preparedBy: tool.getMetadataValue("report-prepared-by", "data-report-prepared-by", "Not specified"),
          checkedBy: tool.getMetadataValue("report-checked-by", "data-report-checked-by", "Not specified"),
          issuePurpose: tool.getMetadataValue("report-issue-purpose", "data-report-issue-purpose", "Design verification"),
          disclaimer: tool.root.getAttribute("data-report-disclaimer") || "This exported calculation sheet should be reviewed by a qualified engineer before issue."
        },
        section: state.section,
        demandValues: state.demandValues,
        result: state.result,
        inputRows: buildInputRows(state),
        resultRows: buildResultRows(state),
        methodology: [
          "The calculator compares applied actions directly against tabulated closed section capacities using demand-to-capacity ratios.",
          "The governing utilisation ratio η is taken as the maximum active ratio from compression, tension, bending, shear, and torsion actions.",
          "The live SVG is generated from section designation geometry to support engineering communication and reporting."
        ],
        equations: buildEquationText(state.section),
        intermediateRows: buildIntermediateRows(state),
        assumptions: [
          "Section geometry for the visualisation is inferred from the designation string and used for communication rather than detailed fabrication definition.",
          "Tabulated capacities are assumed to be applicable to the selected family, grade, and designation for the intended design scenario.",
          "The saved scenario and export capture the current browser-side tool state only."
        ],
        visualisations: visualisations
      };
    });
  }

  function buildInputRows(state) {
    var rows = [
      ["Section family", state.section.family, "-"],
      ["Steel grade", state.section.grade, "-"],
      ["Designation", state.section.designation, "-"],
      ["Compression demand N*c", formatNumber(state.demandValues.compression, 2), "kN"],
      ["Tension demand N*t", formatNumber(state.demandValues.tension, 2), "kN"],
      ["Moment M*", formatNumber(state.demandValues.momentMajor, 2), "kNm"],
      ["Shear V*", formatNumber(state.demandValues.shearMajor, 2), "kN"],
      ["Torsion T*", formatNumber(state.demandValues.torsion, 2), "kNm"]
    ];

    if (state.section.family === "RHS") {
      rows.splice(6, 0, ["Minor moment M*y", formatNumber(state.demandValues.momentMinor, 2), "kNm"]);
      rows.splice(8, 0, ["Minor shear V*y", formatNumber(state.demandValues.shearMinor, 2), "kN"]);
    }
    return rows;
  }

  function buildResultRows(state) {
    return state.result.ratios.map(function (ratio) {
      var statusText = ratio.ratio <= 1 ? "PASS" : "FAIL";
      return [
        ratio.symbol + " " + ratio.label,
        formatNumber(ratio.demand, 2),
        formatNumber(ratio.capacity, 2),
        statusText + " \u00b7 \u03b7 = " + formatNumber(ratio.ratio, 3)
      ];
    });
  }

  function buildIntermediateRows(state) {
    var rows = [
      ["Governing mode", state.result.controllingMode],
      ["Governing utilisation η", formatNumber(state.result.governingRatio, 3)],
      ["Reserve factor", Number.isFinite(1 / state.result.governingRatio) ? formatNumber(1 / state.result.governingRatio, 3) : "--"],
      ["Mass per metre", formatNumber(state.section.capacities.mass, 2) + " kg/m"],
      ["Area estimate", formatNumber(state.section.area, 0) + " mm²"]
    ];

    if (state.section.family === "CHS") {
      rows.push(["Outer diameter Dₒ", formatNumber(state.section.geometry.outerDiameter, 1) + " mm"]);
    } else {
      rows.push(["Depth D", formatNumber(state.section.geometry.depth, 1) + " mm"]);
      rows.push(["Width B", formatNumber(state.section.geometry.width, 1) + " mm"]);
    }

    rows.push(["Thickness t", formatNumber(state.section.geometry.thickness, 1) + " mm"]);
    return rows;
  }

  function buildEquationText(section) {
    if (section.family === "RHS") {
      return [
        "η = max(N*c / ϕNs, N*t / ϕNt, M*x / ϕMsx, M*y / ϕMsy, V*x / ϕVvx, V*y / ϕVvy, T* / ϕMz)",
        "PASS when η ≤ 1.0"
      ];
    }

    return [
      "η = max(N*c / ϕNs, N*t / ϕNt, M* / ϕMs, V* / ϕVv, T* / ϕMz)",
      "PASS when η ≤ 1.0"
    ];
  }

  function exportWordReport(tool) {
    var docx = window.docx;
    if (!docx) {
      return Promise.reject(new Error("docx library is unavailable."));
    }

    return buildCalculationReportData(tool).then(function (data) {
      var footer = new docx.Footer({
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
      });

      var children = [];
      children = children.concat(createMetadataSection(docx, data));
      children.push(new docx.Paragraph({ spacing: { after: 80 } }));
      children.push(createResultsTable(docx, data));
      children.push(new docx.Paragraph({ spacing: { after: 80 } }));
      children.push(createInputsTable(docx, data));
      children = children.concat(createCalculationSection(docx, data));
      children = children.concat(createVisualisationSection(docx, data.visualisations));
      children = children.concat(createAssumptionsSection(docx, data));

      var documentInstance = new docx.Document({
        creator: "Engineering Tools",
        title: data.title,
        sections: [{
          properties: {
            page: {
              margin: { top: 720, right: 720, bottom: 720, left: 720, header: 360, footer: 360 },
              size: { width: 11906, height: 16838 }
            }
          },
          footers: { default: footer },
          children: children
        }]
      });

      return docx.Packer.toBlob(documentInstance).then(function (blob) {
        triggerDownload(blob, "steel-closed-section-capacities-lite_" + formatFileTimestamp(new Date()) + ".docx");
      });
    });
  }

  function createVisualisationExports(root) {
    var figures = [];
    var svgElements = root.querySelectorAll("[data-export-visualization='true'] svg");
    var canvasElements = root.querySelectorAll("[data-export-visualization='true'] canvas");
    var tasks = [];

    svgElements.forEach(function (svgElement, index) {
      var caption = svgElement.closest("[data-export-visualization='true']").getAttribute("data-export-caption") || ("Figure " + (index + 1));
      tasks.push(extractSvgAsPng(svgElement).then(function (image) {
        if (image) {
          image.caption = caption;
          figures.push(image);
        }
      }));
    });

    canvasElements.forEach(function (canvasElement, index) {
      var caption = canvasElement.closest("[data-export-visualization='true']").getAttribute("data-export-caption") || ("Figure " + (svgElements.length + index + 1));
      tasks.push(extractCanvasAsPng(canvasElement).then(function (image) {
        if (image) {
          image.caption = caption;
          figures.push(image);
        }
      }));
    });

    return Promise.all(tasks).then(function () {
      return figures;
    });
  }

  function extractSvgAsPng(svgElement) {
    var clonedSvg = cloneSvgWithComputedStyles(svgElement);
    var viewBox = svgElement.viewBox && svgElement.viewBox.baseVal;
    var width = viewBox && viewBox.width ? viewBox.width : 420;
    var height = viewBox && viewBox.height ? viewBox.height : 300;
    clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clonedSvg.setAttribute("width", String(width));
    clonedSvg.setAttribute("height", String(height));
    var blob = new Blob([new XMLSerializer().serializeToString(clonedSvg)], { type: "image/svg+xml;charset=utf-8" });
    var url = URL.createObjectURL(blob);

    return loadImage(url).then(function (image) {
      var canvas = document.createElement("canvas");
      canvas.width = width * 2;
      canvas.height = height * 2;
      var context = canvas.getContext("2d");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvasToBlob(canvas).then(function (pngBlob) {
        return blobToUint8Array(pngBlob).then(function (data) {
          return {
            data: data,
            width: canvas.width,
            height: canvas.height
          };
        });
      });
    }).finally(function () {
      URL.revokeObjectURL(url);
    });
  }

  function extractCanvasAsPng(canvasElement) {
    return canvasToBlob(canvasElement).then(function (blob) {
      return blobToUint8Array(blob).then(function (data) {
        return {
          data: data,
          width: canvasElement.width,
          height: canvasElement.height
        };
      });
    });
  }

  function addImageToDoc(docx, figure, index) {
    var targetWidth = Math.min(520, Math.round(figure.width / 2));
    var targetHeight = Math.round(targetWidth * (figure.height / figure.width));
    return [
      new docx.Paragraph({
        alignment: docx.AlignmentType.CENTER,
        spacing: { before: 40, after: 20 },
        children: [
          new docx.ImageRun({
            data: figure.data,
            type: "png",
            transformation: { width: targetWidth, height: targetHeight }
          })
        ]
      }),
      new docx.Paragraph({
        alignment: docx.AlignmentType.CENTER,
        spacing: { after: 70 },
        children: [new docx.TextRun({ text: "Figure " + index + " - " + figure.caption.replace(/^Figure\s+\d+\s*-\s*/i, ""), italics: true, color: "5D7682", size: 18 })]
      })
    ];
  }

  function cloneSvgWithComputedStyles(svgElement) {
    var clone = svgElement.cloneNode(true);
    var sourceElements = [svgElement].concat(Array.prototype.slice.call(svgElement.querySelectorAll("*")));
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
      image.onerror = function () { reject(new Error("Unable to load the SVG image.")); };
      image.src = url;
    });
  }

  function canvasToBlob(canvas) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        if (!blob) {
          reject(new Error("Unable to convert canvas to PNG."));
          return;
        }
        resolve(blob);
      }, "image/png");
    });
  }

  function blobToUint8Array(blob) {
    return blob.arrayBuffer().then(function (buffer) {
      return new Uint8Array(buffer);
    });
  }

  function triggerDownload(blob, fileName) {
    var link = document.createElement("a");
    var url = URL.createObjectURL(blob);
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
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

  function SteelClosedSectionCapacitiesLite(root) {
    this.root = root;
    this.instanceId = root.getAttribute("data-et-instance") || "0";
    this.storageKey = STORAGE_PREFIX + "-" + this.instanceId;
    this.fields = {};
    this.metadataFields = {};
    this.outputs = {};
    this.actions = {};
    this.rhsOnly = Array.prototype.slice.call(root.querySelectorAll("[data-rhs-only]"));
    this.diagram = root.querySelector("[data-role='diagram']");
    this.heroPanel = root.querySelector("[data-role='hero-panel']");
    this.meterFill = root.querySelector("[data-role='meter-fill']");
    this.ratioList = root.querySelector("[data-role='ratio-list']");
    this.savedResultsBody = root.querySelector("[data-role='saved-results']");
    this.savedResults = readStorage(this.storageKey);
    this.lastState = null;
    this.isExporting = false;
  }

  SteelClosedSectionCapacitiesLite.prototype.init = function () {
    var self = this;
    [
      "family", "grade", "designation", "compression", "tension", "moment-major",
      "moment-minor", "shear-major", "shear-minor", "torsion"
    ].forEach(function (fieldName) {
      self.fields[fieldName] = self.root.querySelector("[data-field='" + fieldName + "']");
    });

    [
      "report-company",
      "report-project",
      "report-project-number",
      "report-client",
      "report-prepared-by",
      "report-checked-by",
      "report-issue-purpose"
    ].forEach(function (fieldName) {
      self.metadataFields[fieldName] = self.root.querySelector("[data-field='" + fieldName + "']");
    });

    [
      "diagram-note", "status-pill", "governing-utilisation", "hero-note", "status-text",
      "governing-mode", "reserve-factor", "selection-note", "diagram-tag", "mass", "area", "depth",
      "width", "thickness", "phi-ns", "phi-nt", "phi-m", "phi-v", "phi-t", "export-feedback"
    ].forEach(function (outputName) {
      self.outputs[outputName] = self.root.querySelector("[data-output='" + outputName + "']");
    });

    ["save-result", "clear-results", "export-word-report"].forEach(function (actionName) {
      self.actions[actionName] = self.root.querySelector("[data-action='" + actionName + "']");
    });

    this.bindEvents();
    this.populateFamilies();
    this.renderSavedResults();
    this.syncSelection(DEFAULT_STATE.family, DEFAULT_STATE.grade, DEFAULT_STATE.designation);
    this.applyDefaultInputs();
    this.update();
  };

  SteelClosedSectionCapacitiesLite.prototype.bindEvents = function () {
    var self = this;

    this.fields.family.addEventListener("change", function () {
      self.handleFamilyChange();
    });

    this.fields.grade.addEventListener("change", function () {
      self.handleGradeChange();
    });

    this.fields.designation.addEventListener("change", function () {
      self.update();
    });

    ["compression", "tension", "moment-major", "moment-minor", "shear-major", "shear-minor", "torsion"].forEach(function (key) {
      self.fields[key].addEventListener("input", function () {
        self.update();
      });
    });

    this.actions["save-result"].addEventListener("click", function () {
      self.saveCurrentResult();
    });

    this.actions["clear-results"].addEventListener("click", function () {
      self.savedResults = [];
      writeStorage(self.storageKey, self.savedResults);
      self.renderSavedResults();
    });

    this.actions["export-word-report"].addEventListener("click", function () {
      self.handleExport();
    });
  };

  SteelClosedSectionCapacitiesLite.prototype.populateFamilies = function () {
    populateSelect(this.fields.family, getFamilies(), DEFAULT_STATE.family);
  };

  SteelClosedSectionCapacitiesLite.prototype.handleFamilyChange = function () {
    var family = this.fields.family.value;
    var defaults = FAMILY_DEFAULTS[family] || {};
    var grades = getGrades(family);
    var grade = grades.indexOf(defaults.grade) !== -1 ? defaults.grade : grades[0];
    populateSelect(this.fields.grade, grades, grade);

    var designations = getDesignations(family, grade);
    var designation = designations.indexOf(defaults.designation) !== -1 ? defaults.designation : designations[0];
    populateSelect(this.fields.designation, designations, designation);
    this.update();
  };

  SteelClosedSectionCapacitiesLite.prototype.handleGradeChange = function () {
    var family = this.fields.family.value;
    var grade = this.fields.grade.value;
    var designations = getDesignations(family, grade);
    var designation = designations.indexOf(this.fields.designation.value) !== -1 ? this.fields.designation.value : designations[0];
    populateSelect(this.fields.designation, designations, designation);
    this.update();
  };

  SteelClosedSectionCapacitiesLite.prototype.syncSelection = function (family, grade, designation) {
    populateSelect(this.fields.family, getFamilies(), family);
    populateSelect(this.fields.grade, getGrades(family), grade);
    populateSelect(this.fields.designation, getDesignations(family, grade), designation);
  };

  SteelClosedSectionCapacitiesLite.prototype.applyDefaultInputs = function () {
    this.fields.compression.value = DEFAULT_STATE.compression;
    this.fields.tension.value = DEFAULT_STATE.tension;
    this.fields["moment-major"].value = DEFAULT_STATE.momentMajor;
    this.fields["moment-minor"].value = DEFAULT_STATE.momentMinor;
    this.fields["shear-major"].value = DEFAULT_STATE.shearMajor;
    this.fields["shear-minor"].value = DEFAULT_STATE.shearMinor;
    this.fields.torsion.value = DEFAULT_STATE.torsion;
  };

  SteelClosedSectionCapacitiesLite.prototype.collectDemandValues = function () {
    return {
      compression: parseInputValue(this.fields.compression.value),
      tension: parseInputValue(this.fields.tension.value),
      momentMajor: parseInputValue(this.fields["moment-major"].value),
      momentMinor: parseInputValue(this.fields["moment-minor"].value),
      shearMajor: parseInputValue(this.fields["shear-major"].value),
      shearMinor: parseInputValue(this.fields["shear-minor"].value),
      torsion: parseInputValue(this.fields.torsion.value)
    };
  };

  SteelClosedSectionCapacitiesLite.prototype.validate = function () {
    var errors = {};
    if (!this.fields.family.value) {
      errors.family = "Select a section family.";
    }
    if (!this.fields.grade.value) {
      errors.grade = "Select a steel grade.";
    }
    if (!this.fields.designation.value) {
      errors.designation = "Select a designation.";
    }

    validateNumber("Compression demand", this.fields.compression.value, errors, "compression");
    validateNumber("Tension demand", this.fields.tension.value, errors, "tension");
    validateNumber("Moment", this.fields["moment-major"].value, errors, "moment-major");
    validateNumber("Minor moment", this.fields["moment-minor"].value, errors, "moment-minor");
    validateNumber("Shear", this.fields["shear-major"].value, errors, "shear-major");
    validateNumber("Minor shear", this.fields["shear-minor"].value, errors, "shear-minor");
    validateNumber("Torsion", this.fields.torsion.value, errors, "torsion");
    return errors;
  };

  SteelClosedSectionCapacitiesLite.prototype.renderErrors = function (errors) {
    var self = this;
    Object.keys(this.fields).forEach(function (key) {
      var errorNode = self.root.querySelector("[data-error-for='" + key + "']");
      var inputWrap = self.fields[key] && self.fields[key].closest(".et-tool__input-wrap");
      if (errorNode) {
        errorNode.textContent = errors[key] || "";
      }
      if (inputWrap) {
        inputWrap.classList.toggle("has-error", Boolean(errors[key]));
      }
    });
  };

  SteelClosedSectionCapacitiesLite.prototype.update = function () {
    var errors = this.validate();
    var family = this.fields.family.value;
    var grade = this.fields.grade.value;
    var designation = this.fields.designation.value;
    var section = getSection(family, grade, designation);
    var demandValues = this.collectDemandValues();
    this.renderErrors(errors);

    this.toggleRhsInputs(Boolean(section && section.family === "RHS"));
    this.renderSectionProperties(section);
    this.renderEquations(section);
    this.drawDiagram(section, null);

    if (!section || Object.keys(errors).length) {
      this.resetOutputState();
      return;
    }

    var result = computeResult(section, demandValues);
    this.renderResult(section, demandValues, result);
    this.drawDiagram(section, result.controllingMode);
    this.lastState = {
      timestamp: Date.now(),
      section: section,
      demandValues: demandValues,
      result: result
    };
  };

  SteelClosedSectionCapacitiesLite.prototype.toggleRhsInputs = function (show) {
    this.rhsOnly.forEach(function (element) {
      element.hidden = !show;
    });
  };

  SteelClosedSectionCapacitiesLite.prototype.renderSectionProperties = function (section) {
    if (!section) {
      this.outputs["selection-note"].textContent = "--";
      this.outputs["diagram-tag"].textContent = "--";
      this.outputs.mass.textContent = "--";
      this.outputs.area.textContent = "--";
      this.outputs.depth.textContent = "--";
      this.outputs.width.textContent = "--";
      this.outputs.thickness.textContent = "--";
      this.outputs["phi-ns"].textContent = "--";
      this.outputs["phi-nt"].textContent = "--";
      this.outputs["phi-m"].textContent = "--";
      this.outputs["phi-v"].textContent = "--";
      this.outputs["phi-t"].textContent = "--";
      return;
    }

    this.outputs["selection-note"].textContent = section.designation + " \u00b7 " + section.grade;
    this.outputs["diagram-tag"].textContent = section.family;
    this.outputs.mass.textContent = formatNumber(section.capacities.mass, 2) + " kg/m";
    this.outputs.area.textContent = formatNumber(section.area, 0) + " mm²";
    this.outputs.depth.textContent = section.family === "CHS" ? formatNumber(section.geometry.outerDiameter, 1) + " mm" : formatNumber(section.geometry.depth, 1) + " mm";
    this.outputs.width.textContent = section.family === "CHS" ? "Circular" : formatNumber(section.geometry.width, 1) + " mm";
    this.outputs.thickness.textContent = formatNumber(section.geometry.thickness, 1) + " mm";
    this.outputs["phi-ns"].textContent = formatNumber(section.capacities.compression, 2) + " kN";
    this.outputs["phi-nt"].textContent = formatNumber(section.capacities.tension, 2) + " kN";
    this.outputs["phi-m"].textContent = formatNumber(section.capacities.momentMajor, 2) + " kNm";
    this.outputs["phi-v"].textContent = formatNumber(section.capacities.shearMajor, 2) + " kN";
    this.outputs["phi-t"].textContent = formatNumber(section.capacities.torsion, 2) + " kNm";
  };

  SteelClosedSectionCapacitiesLite.prototype.resetOutputState = function () {
    this.heroPanel.dataset.tone = "idle";
    this.outputs["status-pill"].textContent = "PENDING";
    this.outputs["status-pill"].dataset.tone = "";
    this.outputs["governing-utilisation"].textContent = "--";
    this.outputs["hero-note"].textContent = "Results will appear when the selected section and applied actions are valid.";
    this.outputs["status-text"].textContent = "--";
    this.outputs["governing-mode"].textContent = "--";
    this.outputs["reserve-factor"].textContent = "--";
    this.outputs["diagram-note"].textContent = "The section geometry, dimensions, centroid, and governing mode update instantly.";
    if (this.meterFill) {
      this.meterFill.style.width = "0%";
      this.meterFill.dataset.state = "";
    }
    this.ratioList.innerHTML = '<div class="et-scsl__ratio-row"><div><strong>Awaiting valid inputs</strong><span>Input validation must pass before demand-to-capacity ratios can be shown.</span></div><em>--</em></div>';
    this.lastState = null;
  };

  SteelClosedSectionCapacitiesLite.prototype.renderResult = function (section, demandValues, result) {
    var tone = result.status === "PASS" ? "pass" : "fail";
    this.heroPanel.dataset.tone = tone;
    this.outputs["status-pill"].textContent = result.status;
    this.outputs["status-pill"].dataset.tone = tone;
    this.outputs["governing-utilisation"].textContent = formatNumber(result.governingRatio, 3);
    this.outputs["hero-note"].textContent = result.controllingMode + " governs the selected demand set.";
    this.outputs["status-text"].textContent = result.status;
    this.outputs["governing-mode"].textContent = result.governingSymbol + " " + result.controllingMode;
    this.outputs["reserve-factor"].textContent = result.governingRatio > 0 ? formatNumber(1 / result.governingRatio, 3) : "--";
    this.outputs["diagram-note"].textContent = result.controllingMode + " currently governs the section verification.";
    if (this.meterFill) {
      this.meterFill.style.width = Math.min(result.governingRatio * 100, 100) + "%";
      this.meterFill.dataset.state = result.status === "PASS" ? "pass" : "fail";
    }
    this.renderRatios(result);

    this.lastState = {
      timestamp: Date.now(),
      section: section,
      demandValues: demandValues,
      result: result
    };
  };

  SteelClosedSectionCapacitiesLite.prototype.renderRatios = function (result) {
    this.ratioList.innerHTML = result.ratios.map(function (ratio) {
      var state = ratio.ratio <= 1 ? "pass" : "fail";
      return [
        '<div class="et-scsl__ratio-row" data-state="', state, '">',
        "<div>",
        "<strong>", escapeHtml(ratio.label), "</strong>",
        "<span>", escapeHtml(ratio.symbol), " = ", escapeHtml(formatNumber(ratio.ratio, 3)), " using demand ", escapeHtml(formatNumber(ratio.demand, 2)), " and capacity ", escapeHtml(formatNumber(ratio.capacity, 2)), ".</span>",
        "</div>",
        "<em>", escapeHtml(formatNumber(ratio.ratio, 3)), "</em>",
        "</div>"
      ].join("");
    }).join("");
  };

  SteelClosedSectionCapacitiesLite.prototype.renderEquations = function (section) {
    var primary = this.root.querySelector("[data-role='equation-primary']");
    var secondary = this.root.querySelector("[data-role='equation-secondary']");

    if (!primary || !secondary) {
      return;
    }

    var equationSet = section && section.family === "RHS"
      ? [
        String.raw`\eta = \max\left(\frac{N_c^\ast}{\phi N_s}, \frac{N_t^\ast}{\phi N_t}, \frac{M_x^\ast}{\phi M_{sx}}, \frac{M_y^\ast}{\phi M_{sy}}, \frac{V_x^\ast}{\phi V_{vx}}, \frac{V_y^\ast}{\phi V_{vy}}, \frac{T^\ast}{\phi M_z}\right)`,
        String.raw`\text{PASS when } \eta \leq 1.0`
      ]
      : [
        String.raw`\eta = \max\left(\frac{N_c^\ast}{\phi N_s}, \frac{N_t^\ast}{\phi N_t}, \frac{M^\ast}{\phi M_s}, \frac{V^\ast}{\phi V_v}, \frac{T^\ast}{\phi M_z}\right)`,
        String.raw`\text{PASS when } \eta \leq 1.0`
      ];

    if (window.katex && typeof window.katex.render === "function") {
      window.katex.render(equationSet[0], primary, { throwOnError: false, displayMode: true });
      window.katex.render(equationSet[1], secondary, { throwOnError: false, displayMode: true });
      return;
    }

    primary.textContent = buildEquationText(section || { family: "CHS" })[0];
    secondary.textContent = buildEquationText(section || { family: "CHS" })[1];
  };

  SteelClosedSectionCapacitiesLite.prototype.drawDiagram = function (section, controllingMode) {
    if (!this.diagram) {
      return;
    }

    this.diagram.innerHTML = "";

    for (var x = 0; x <= 420; x += 24) {
      this.diagram.appendChild(createSvgNode("line", { x1: x, y1: 0, x2: x, y2: 300, class: "et-scsl__svg-grid" }));
    }
    for (var y = 0; y <= 300; y += 24) {
      this.diagram.appendChild(createSvgNode("line", { x1: 0, y1: y, x2: 420, y2: y, class: "et-scsl__svg-grid" }));
    }

    if (!section) {
      this.diagram.appendChild(createSvgNode("text", { x: 210, y: 156, "text-anchor": "middle", class: "et-scsl__svg-note" }));
      this.diagram.lastChild.textContent = "Select a section to generate the live visualisation";
      return;
    }

    this.diagram.appendChild(createSvgNode("line", { x1: 210, y1: 36, x2: 210, y2: 264, class: "et-scsl__svg-axis" }));
    this.diagram.appendChild(createSvgNode("line", { x1: 72, y1: 150, x2: 348, y2: 150, class: "et-scsl__svg-axis" }));
    this.diagram.appendChild(createSvgNode("circle", { cx: 210, cy: 150, r: 4, class: "et-scsl__svg-centroid" }));

    if (section.family === "CHS") {
      var outer = section.geometry.outerDiameter;
      var thickness = section.geometry.thickness;
      var inner = Math.max(outer - 2 * thickness, 0);
      var scale = Math.min(168 / outer, 1.75);
      var outerRadius = outer * scale / 2;
      var innerRadius = inner * scale / 2;

      this.diagram.appendChild(createSvgNode("circle", { cx: 210, cy: 150, r: outerRadius, class: "et-scsl__svg-outline" }));
      this.diagram.appendChild(createSvgNode("circle", { cx: 210, cy: 150, r: innerRadius, class: "et-scsl__svg-void" }));
      this.addDimensionLine(210 - outerRadius, 238, 210 + outerRadius, 238, "Dₒ = " + formatNumber(outer, 1) + " mm");
      this.addDimensionLine(210 + innerRadius, 92, 210 + outerRadius, 92, "t = " + formatNumber(thickness, 1) + " mm");
    } else {
      var width = section.geometry.width;
      var depth = section.geometry.depth;
      var wall = section.geometry.thickness;
      var shapeScale = Math.min(210 / width, 170 / depth, 2.1);
      var scaledWidth = width * shapeScale;
      var scaledDepth = depth * shapeScale;
      var scaledWall = Math.max(wall * shapeScale, 4);
      var left = 210 - scaledWidth / 2;
      var top = 150 - scaledDepth / 2;

      this.diagram.appendChild(createSvgNode("rect", {
        x: left,
        y: top,
        width: scaledWidth,
        height: scaledDepth,
        rx: 18,
        ry: 18,
        class: "et-scsl__svg-outline"
      }));
      this.diagram.appendChild(createSvgNode("rect", {
        x: left + scaledWall,
        y: top + scaledWall,
        width: Math.max(scaledWidth - 2 * scaledWall, 0),
        height: Math.max(scaledDepth - 2 * scaledWall, 0),
        rx: 10,
        ry: 10,
        class: "et-scsl__svg-void"
      }));

      this.addDimensionLine(left, 244, left + scaledWidth, 244, "B = " + formatNumber(width, 1) + " mm");
      this.addDimensionLine(58, top, 58, top + scaledDepth, "D = " + formatNumber(depth, 1) + " mm", true);
      this.addDimensionLine(left + scaledWidth + 18, top + scaledWall, left + scaledWidth + 18, top, "t = " + formatNumber(wall, 1) + " mm", true);
    }

    this.diagram.appendChild(createSvgNode("text", { x: 210, y: 26, "text-anchor": "middle", class: "et-scsl__svg-note" }));
    this.diagram.lastChild.textContent = "Centroidal axes";

    if (controllingMode) {
      this.diagram.appendChild(createSvgNode("text", { x: 210, y: 286, "text-anchor": "middle", class: "et-scsl__svg-note" }));
      this.diagram.lastChild.textContent = "Governing mode: " + controllingMode;
    }
  };

  SteelClosedSectionCapacitiesLite.prototype.addDimensionLine = function (x1, y1, x2, y2, label, isVertical) {
    this.diagram.appendChild(createSvgNode("line", { x1: x1, y1: y1, x2: x2, y2: y2, class: "et-scsl__svg-dimension" }));

    if (isVertical) {
      this.diagram.appendChild(createSvgNode("line", { x1: x1 - 6, y1: y1, x2: x1 + 6, y2: y1, class: "et-scsl__svg-arrow" }));
      this.diagram.appendChild(createSvgNode("line", { x1: x2 - 6, y1: y2, x2: x2 + 6, y2: y2, class: "et-scsl__svg-arrow" }));
      this.diagram.appendChild(createSvgNode("text", {
        x: x1 - 10,
        y: (y1 + y2) / 2,
        "text-anchor": "end",
        class: "et-scsl__svg-label"
      }));
      this.diagram.lastChild.textContent = label;
      return;
    }

    this.diagram.appendChild(createSvgNode("line", { x1: x1, y1: y1 - 6, x2: x1, y2: y1 + 6, class: "et-scsl__svg-arrow" }));
    this.diagram.appendChild(createSvgNode("line", { x1: x2, y1: y2 - 6, x2: x2, y2: y2 + 6, class: "et-scsl__svg-arrow" }));
    this.diagram.appendChild(createSvgNode("text", {
      x: (x1 + x2) / 2,
      y: y1 - 10,
      "text-anchor": "middle",
      class: "et-scsl__svg-label"
    }));
    this.diagram.lastChild.textContent = label;
  };

  SteelClosedSectionCapacitiesLite.prototype.saveCurrentResult = function () {
    if (!this.lastState) {
      return;
    }

    this.savedResults.unshift({
      timestamp: this.lastState.timestamp,
      sectionLabel: this.lastState.section.designation + " \u00b7 " + this.lastState.section.grade,
      demands: this.buildDemandSummary(this.lastState.section, this.lastState.demandValues),
      phi: formatNumber(this.lastState.result.governingRatio, 3),
      mode: this.lastState.result.controllingMode,
      status: this.lastState.result.status
    });

    this.savedResults = this.savedResults.slice(0, 20);
    writeStorage(this.storageKey, this.savedResults);
    this.renderSavedResults();
  };

  SteelClosedSectionCapacitiesLite.prototype.buildDemandSummary = function (section, demandValues) {
    var parts = [];
    if (demandValues.compression > 0) {
      parts.push("N*c " + formatNumber(demandValues.compression, 2) + " kN");
    }
    if (demandValues.tension > 0) {
      parts.push("N*t " + formatNumber(demandValues.tension, 2) + " kN");
    }
    if (demandValues.momentMajor > 0) {
      parts.push("M* " + formatNumber(demandValues.momentMajor, 2) + " kNm");
    }
    if (section.family === "RHS" && demandValues.momentMinor > 0) {
      parts.push("M*y " + formatNumber(demandValues.momentMinor, 2) + " kNm");
    }
    if (demandValues.shearMajor > 0) {
      parts.push("V* " + formatNumber(demandValues.shearMajor, 2) + " kN");
    }
    if (section.family === "RHS" && demandValues.shearMinor > 0) {
      parts.push("V*y " + formatNumber(demandValues.shearMinor, 2) + " kN");
    }
    if (demandValues.torsion > 0) {
      parts.push("T* " + formatNumber(demandValues.torsion, 2) + " kNm");
    }
    return parts.length ? parts.join(" \u00b7 ") : "No applied action";
  };

  SteelClosedSectionCapacitiesLite.prototype.renderSavedResults = function () {
    if (!this.savedResults.length) {
      this.savedResultsBody.innerHTML = '<tr><td class="et-scsl__empty-row" colspan="6">No saved results yet.</td></tr>';
      return;
    }

    this.savedResultsBody.innerHTML = this.savedResults.map(function (row) {
      return [
        "<tr>",
        "<td>", escapeHtml(formatDateTime(row.timestamp)), "</td>",
        "<td>", escapeHtml(row.sectionLabel), "</td>",
        "<td>", escapeHtml(row.demands), "</td>",
        "<td>", escapeHtml(row.mode), "</td>",
        "<td>", escapeHtml(row.phi), "</td>",
        "<td>", escapeHtml(row.status), "</td>",
        "</tr>"
      ].join("");
    }).join("");
  };

  SteelClosedSectionCapacitiesLite.prototype.handleExport = function () {
    var self = this;
    if (!this.lastState || this.isExporting) {
      return;
    }

    this.isExporting = true;
    this.actions["export-word-report"].disabled = true;
    this.outputs["export-feedback"].textContent = "Exporting Word report...";

    exportWordReport(this).then(function () {
      self.outputs["export-feedback"].textContent = "Word report generated successfully.";
    }).catch(function () {
      self.outputs["export-feedback"].textContent = "Unable to export the Word report.";
    }).finally(function () {
      self.isExporting = false;
      self.actions["export-word-report"].disabled = false;
    });
  };

  SteelClosedSectionCapacitiesLite.prototype.getMetadataValue = function (fieldName, attributeName, fallback) {
    var field = this.metadataFields[fieldName];
    if (field && field.value.trim() !== "") {
      return field.value.trim();
    }

    return this.root.getAttribute(attributeName) || fallback;
  };

  function populateSelect(select, options, selectedValue) {
    select.innerHTML = options.map(function (value) {
      var selected = value === selectedValue ? ' selected="selected"' : "";
      return '<option value="' + escapeHtml(value) + '"' + selected + ">" + escapeHtml(value) + "</option>";
    }).join("");
  }

  function boot() {
    document.querySelectorAll('.et-tool[data-et-tool="' + TOOL_SLUG + '"]').forEach(function (root) {
      if (root.dataset.etInitialised === "true") {
        return;
      }
      root.dataset.etInitialised = "true";
      new SteelClosedSectionCapacitiesLite(root).init();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  document.addEventListener("engineering-tools:ready", boot);
}());
