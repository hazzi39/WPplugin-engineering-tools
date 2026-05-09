(function () {
  "use strict";

  var STORAGE_KEY = "engineering-tools-timber-column-results-v1";

  function getUtils() {
    return window.EngineeringTools && window.EngineeringTools.utils;
  }

  function readSavedResults() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function writeSavedResults(results) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(results.slice(0, 10)));
    } catch (error) {
      // Ignore storage quota failures for lightweight embeds.
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

  function TimberColumnCalculator(root) {
    this.root = root;
    this.fields = {
      width: root.querySelector('[data-field="width"]'),
      depth: root.querySelector('[data-field="depth"]'),
      length: root.querySelector('[data-field="length"]')
    };
    this.outputs = {
      area: root.querySelector('[data-output="area"]'),
      volume: root.querySelector('[data-output="volume"]'),
      aspectRatio: root.querySelector('[data-output="aspect-ratio"]'),
      slenderness: root.querySelector('[data-output="slenderness"]')
    };
    this.status = {
      shell: root.querySelector('[data-role="status"]'),
      title: root.querySelector('[data-role="status-title"]'),
      text: root.querySelector('[data-role="status-text"]')
    };
    this.savedResultsBody = root.querySelector('[data-role="saved-results"]');
    this.saveButton = root.querySelector('[data-action="save-result"]');
    this.clearButton = root.querySelector('[data-action="clear-saved"]');
    this.savedResults = readSavedResults();
    this.lastResult = null;
  }

  TimberColumnCalculator.prototype.init = function () {
    var self = this;
    Object.keys(this.fields).forEach(function (key) {
      self.fields[key].addEventListener("input", function () {
        self.update();
      });
    });

    this.saveButton.addEventListener("click", function () {
      self.saveResult();
    });

    this.clearButton.addEventListener("click", function () {
      self.savedResults = [];
      writeSavedResults(self.savedResults);
      self.renderSavedResults();
    });

    this.update();
    this.renderSavedResults();
  };

  TimberColumnCalculator.prototype.readInputs = function () {
    var utils = getUtils();
    return {
      width: utils.parseNumber(this.fields.width.value, 0),
      depth: utils.parseNumber(this.fields.depth.value, 0),
      length: utils.parseNumber(this.fields.length.value, 0)
    };
  };

  TimberColumnCalculator.prototype.update = function () {
    var inputs = this.readInputs();
    if (inputs.width <= 0 || inputs.depth <= 0 || inputs.length <= 0) {
      this.lastResult = null;
      this.status.shell.dataset.state = "warning";
      this.status.title.textContent = "Invalid input";
      this.status.text.textContent = "Width, depth, and length must all be greater than zero.";
      this.outputs.area.textContent = "--";
      this.outputs.volume.textContent = "--";
      this.outputs.aspectRatio.textContent = "--";
      this.outputs.slenderness.textContent = "--";
      return;
    }

    var utils = getUtils();
    var area = inputs.width * inputs.depth;
    var volume = area * inputs.length / 1000000000;
    var aspectRatio = inputs.depth / inputs.width;
    var slenderness = inputs.length / Math.min(inputs.width, inputs.depth);

    this.lastResult = {
      timestamp: Date.now(),
      width: inputs.width,
      depth: inputs.depth,
      length: inputs.length,
      area: area,
      volume: volume,
      aspectRatio: aspectRatio,
      slenderness: slenderness
    };

    this.outputs.area.textContent = utils.formatNumber(area, 0);
    this.outputs.volume.textContent = utils.formatNumber(volume, 3);
    this.outputs.aspectRatio.textContent = utils.formatNumber(aspectRatio, 2);
    this.outputs.slenderness.textContent = utils.formatNumber(slenderness, 1);
    this.status.shell.dataset.state = slenderness > 30 ? "warning" : "ok";
    this.status.title.textContent = slenderness > 30 ? "High slenderness indicator" : "Geometry updated";
    this.status.text.textContent = slenderness > 30
      ? "This quick geometry check suggests a relatively slender member. Use full code-based timber capacity checks before design decisions."
      : "Section geometry updates instantly and is ready to be saved into the session table.";
  };

  TimberColumnCalculator.prototype.saveResult = function () {
    if (! this.lastResult) {
      return;
    }

    this.savedResults.unshift(this.lastResult);
    writeSavedResults(this.savedResults);
    this.savedResults = readSavedResults();
    this.renderSavedResults();
  };

  TimberColumnCalculator.prototype.renderSavedResults = function () {
    var utils = getUtils();
    if (! this.savedResults.length) {
      this.savedResultsBody.innerHTML = '<tr><td class="et-tool__empty" colspan="7">No results saved yet.</td></tr>';
      return;
    }

    this.savedResultsBody.innerHTML = this.savedResults.map(function (result) {
      return [
        "<tr>",
        "<td>" + formatTimestamp(result.timestamp) + "</td>",
        "<td>" + utils.formatNumber(result.width, 0) + " mm</td>",
        "<td>" + utils.formatNumber(result.depth, 0) + " mm</td>",
        "<td>" + utils.formatNumber(result.length, 0) + " mm</td>",
        "<td>" + utils.formatNumber(result.area, 0) + " mm²</td>",
        "<td>" + utils.formatNumber(result.volume, 3) + " m³</td>",
        "<td>" + utils.formatNumber(result.slenderness, 1) + "</td>",
        "</tr>"
      ].join("");
    }).join("");
  };

  function boot() {
    document.querySelectorAll('.et-tool[data-tool-slug="timber-column-calculator"]').forEach(function (root) {
      if (root.dataset.etInitialised === "true") {
        return;
      }

      root.dataset.etInitialised = "true";
      new TimberColumnCalculator(root).init();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  document.addEventListener("engineering-tools:ready", boot);
}());
