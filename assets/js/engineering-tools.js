(function () {
  "use strict";

  function parseNumber(value, fallback) {
    var parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function formatNumber(value, decimals) {
    return new Intl.NumberFormat("en-AU", {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals
    }).format(value);
  }

  window.EngineeringTools = window.EngineeringTools || {};
  window.EngineeringTools.utils = {
    parseNumber: parseNumber,
    formatNumber: formatNumber
  };

  document.dispatchEvent(new CustomEvent("engineering-tools:ready"));
}());
