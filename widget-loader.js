/**
 * DeSO Address Lookup Widget Loader
 * 
 * This script allows you to embed the DeSO widget into any webpage
 * by simply including a script tag and a div with a specific ID.
 * 
 * Usage:
 * 1. Include React and ReactDOM scripts (or let this script load them)
 * 2. Include this script
 * 3. Add a div with id="deso-widget-root" where you want the widget
 */

(function() {
  'use strict';

  // Configuration
  const WIDGET_CONFIG = {
    reactVersion: '18',
    containerId: 'deso-widget-root',
    loadReact: true // Set to false if React is already loaded
  };

  // API endpoints
  const GEOCODER =
    "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates";
  const SUGGESTER =
    "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest";
  const FEATURE_LAYER_QUERY_BASE =
    "https://services8.arcgis.com/9CUL84k8apjo6IDh/arcgis/rest/services/DeSO_Attribut_RegInd_2025/FeatureServer/0/query";

  // Utility functions
  function encodeGeometryJSON(obj) {
    return JSON.stringify(obj);
  }

  function lonLatToWebMercator(lon, lat) {
    const x = (lon * 20037508.34) / 180;
    let y = Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180);
    y = (y * 20037508.34) / 180;
    return { x, y };
  }

  // Load external script
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.crossOrigin = 'anonymous';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Inject widget styles
  function injectStyles() {
    if (document.getElementById('deso-widget-styles')) return;

    const style = document.createElement('style');
    style.id = 'deso-widget-styles';
    style.textContent = `
      .deso-widget-container * {
        box-sizing: border-box;
      }
      .deso-widget-container {
        width: 100%;
        background-color: #f8fafc;
        color: #0f172a;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        padding: 1.5rem;
      }
      .deso-widget-content {
        width: 100%;
        max-width: 42rem;
        margin: 0 auto;
      }
      .deso-widget-header {
        margin-bottom: 1.5rem;
      }
      .deso-widget-title {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0 0 0.5rem 0;
      }
      .deso-widget-subtitle {
        font-size: 0.875rem;
        color: #475569;
      }
      .deso-widget-form {
        background-color: white;
        border-radius: 1rem;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        border: 1px solid #e2e8f0;
        padding: 1rem;
        display: flex;
        gap: 0.75rem;
        position: relative;
      }
      .deso-widget-input-wrapper {
        flex: 1;
        position: relative;
      }
      .deso-widget-input {
        width: 100%;
        border-radius: 0.75rem;
        border: 1px solid #cbd5e1;
        padding: 0.5rem 0.75rem;
        font-size: 1rem;
        outline: none;
      }
      .deso-widget-input:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
      }
      .deso-widget-suggestions {
        position: absolute;
        z-index: 20;
        left: 0;
        right: 0;
        margin-top: 0.25rem;
        max-height: 16rem;
        overflow: auto;
        border-radius: 0.75rem;
        border: 1px solid #e2e8f0;
        background-color: white;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        list-style: none;
        padding: 0;
        margin: 0.25rem 0 0 0;
      }
      .deso-widget-suggestion-item {
        padding: 0.5rem 0.75rem;
        font-size: 0.875rem;
        cursor: pointer;
      }
      .deso-widget-suggestion-item:hover,
      .deso-widget-suggestion-item.highlighted {
        background-color: #eff6ff;
      }
      .deso-widget-button {
        border-radius: 0.75rem;
        padding: 0.5rem 1rem;
        background-color: #2563eb;
        color: white;
        font-weight: 500;
        border: none;
        cursor: pointer;
        font-size: 1rem;
      }
      .deso-widget-button:hover:not(:disabled) {
        background-color: #1d4ed8;
      }
      .deso-widget-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .deso-widget-error {
        margin-top: 1rem;
        background-color: #fef2f2;
        border: 1px solid #fecaca;
        color: #991b1b;
        border-radius: 0.75rem;
        padding: 0.75rem;
      }
      .deso-widget-results {
        margin-top: 1.5rem;
        display: grid;
        gap: 1rem;
      }
      .deso-widget-card {
        background-color: white;
        border-radius: 1rem;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        border: 1px solid #e2e8f0;
        padding: 1rem;
      }
      .deso-widget-label {
        font-size: 0.875rem;
        color: #64748b;
        margin-bottom: 0.25rem;
      }
      .deso-widget-value {
        font-weight: 500;
      }
      .deso-widget-coords {
        font-size: 0.75rem;
        color: #64748b;
        margin-top: 0.25rem;
      }
      .deso-widget-debug {
        font-size: 0.75rem;
        color: #94a3b8;
        margin-bottom: 0.5rem;
      }
      .deso-widget-table {
        width: 100%;
        font-size: 0.875rem;
        border-collapse: collapse;
      }
      .deso-widget-table td {
        padding: 0.25rem 0.75rem 0.25rem 0;
        vertical-align: top;
      }
      .deso-widget-table td:first-child {
        color: #64748b;
      }
      .deso-widget-link {
        text-decoration: underline;
        color: inherit;
      }
    `;
    document.head.appendChild(style);
  }

  // Widget component (React.createElement version)
  function createWidgetComponent() {
    const { useState, useRef } = React;

    return function AddressToAreaLookup() {
      const [input, setInput] = useState("");
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState("");
      const [suggestions, setSuggestions] = useState([]);
      const [showSuggest, setShowSuggest] = useState(false);
      const [highlight, setHighlight] = useState(-1);
      const [selectedMagicKey, setSelectedMagicKey] = useState(null);
      const [result, setResult] = useState(null);
      const debounceRef = useRef(null);

      async function suggestAddresses(text) {
        const params = new URLSearchParams({
          f: "json",
          text,
          maxSuggestions: "7",
          countryCode: "SE",
          category: "Address",
        });
        const url = `${SUGGESTER}?${params.toString()}`;
        const res = await fetch(url);
        if (!res.ok) return [];
        const data = await res.json();
        return (data?.suggestions || []).map((s) => ({ text: s.text, magicKey: s.magicKey }));
      }

      async function geocodeAddress(address, magicKey) {
        const params = new URLSearchParams({
          f: "json",
          singleLine: address,
          maxLocations: "5",
          outFields: "*",
          countryCode: "SE",
          category: "Address",
        });
        if (magicKey) params.set("magicKey", magicKey);

        const url = `${GEOCODER}?${params.toString()}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Geocoder HTTP ${res.status}`);
        const data = await res.json();
        const best = data?.candidates?.[0];
        if (!best) throw new Error("No geocoding match for that address.");
        const { x: lon, y: lat } = best.location || {};
        if (typeof lon !== "number" || typeof lat !== "number") {
          throw new Error("Geocoder returned invalid coordinates.");
        }
        return { label: best.address || address, lon, lat };
      }

      async function queryAreaForPoint(lon, lat) {
        async function run(paramsObj) {
          const params = new URLSearchParams(paramsObj);
          const url = `${FEATURE_LAYER_QUERY_BASE}?${params.toString()}`;
          const res = await fetch(url);
          if (!res.ok) throw new Error(`FeatureServer HTTP ${res.status}`);
          const data = await res.json();
          return { attrs: data?.features?.[0]?.attributes || null, url };
        }

        const p1 = {
          f: "json",
          where: "1=1",
          geometry: encodeGeometryJSON({ x: lon, y: lat, spatialReference: { wkid: 4326 } }),
          geometryType: "esriGeometryPoint",
          inSR: "4326",
          distance: "300",
          units: "esriSRUnit_Meter",
          spatialRel: "esriSpatialRelIntersects",
          outFields: "*",
          returnGeometry: "false",
        };
        const r1 = await run(p1);
        if (r1.attrs) return r1;

        const { x: mx, y: my } = lonLatToWebMercator(lon, lat);
        const p2 = {
          ...p1,
          geometry: encodeGeometryJSON({ x: mx, y: my, spatialReference: { wkid: 102100 } }),
          inSR: "102100",
        };
        const r2 = await run(p2);
        return r2;
      }

      async function onSearch(e) {
        e.preventDefault();
        setError("");
        setResult(null);
        setShowSuggest(false);
        const addr = input.trim();
        if (!addr) return;

        try {
          setLoading(true);
          const { label, lon, lat } = await geocodeAddress(addr, selectedMagicKey || undefined);
          const r = await queryAreaForPoint(lon, lat);
          setResult({
            addressLabel: label,
            lon,
            lat,
            attributes: r.attrs,
            debug: { lastLon: lon, lastLat: lat, lastUrl: r.url },
          });
        } catch (err) {
          setError(err && err.message ? err.message : "Something went wrong");
        } finally {
          setLoading(false);
        }
      }

      function handleInputChange(text) {
        setInput(text);
        setSelectedMagicKey(null);
        setHighlight(-1);
        if (debounceRef.current) window.clearTimeout(debounceRef.current);
        if (text.length < 3) {
          setSuggestions([]);
          setShowSuggest(false);
          return;
        }
        debounceRef.current = window.setTimeout(async () => {
          const list = await suggestAddresses(text);
          setSuggestions(list);
          setShowSuggest(true);
        }, 250);
      }

      function selectSuggestion(index) {
        const s = suggestions[index];
        if (!s) return;
        setInput(s.text);
        setSelectedMagicKey(s.magicKey);
        setShowSuggest(false);
      }

      function handleKeyDown(e) {
        if (!showSuggest || suggestions.length === 0) return;
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setHighlight((h) => (h + 1) % suggestions.length);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setHighlight((h) => (h <= 0 ? suggestions.length - 1 : h - 1));
        } else if (e.key === "Enter") {
          if (highlight >= 0) {
            e.preventDefault();
            selectSuggestion(highlight);
          }
        } else if (e.key === "Escape") {
          setShowSuggest(false);
        }
      }

      return React.createElement(
        "div",
        { className: "deso-widget-container", onClick: () => setShowSuggest(false) },
        React.createElement(
          "div",
          { className: "deso-widget-content" },
          React.createElement(
            "header",
            { className: "deso-widget-header" },
            React.createElement("h1", { className: "deso-widget-title" }, "DeSO Address Lookup"),
            React.createElement(
              "p",
              { className: "deso-widget-subtitle" },
              'Type an address. Select a suggestion, then Search.'
            )
          ),
          React.createElement(
            "form",
            { onSubmit: onSearch, className: "deso-widget-form" },
            React.createElement(
              "div",
              { className: "deso-widget-input-wrapper" },
              React.createElement("input", {
                value: input,
                onChange: (e) => handleInputChange(e.target.value),
                onFocus: () => input.length > 2 && setShowSuggest(true),
                onKeyDown: handleKeyDown,
                placeholder: "Enter address…",
                className: "deso-widget-input",
                "aria-label": "Address",
                autoComplete: "off",
              }),
              showSuggest &&
                suggestions.length > 0 &&
                React.createElement(
                  "ul",
                  { className: "deso-widget-suggestions" },
                  suggestions.map((s, i) =>
                    React.createElement(
                      "li",
                      {
                        key: s.magicKey,
                        className: "deso-widget-suggestion-item" + (i === highlight ? " highlighted" : ""),
                        onMouseDown: (e) => e.preventDefault(),
                        onClick: () => selectSuggestion(i),
                      },
                      s.text
                    )
                  )
                )
            ),
            React.createElement(
              "button",
              {
                type: "submit",
                disabled: loading,
                className: "deso-widget-button",
              },
              loading ? "Searching…" : "Search"
            )
          ),
          error &&
            React.createElement(
              "div",
              { className: "deso-widget-error" },
              error
            ),
          result &&
            React.createElement(
              "div",
              { className: "deso-widget-results" },
              React.createElement(
                "div",
                { className: "deso-widget-card" },
                React.createElement("div", { className: "deso-widget-label" }, "Matched address"),
                React.createElement("div", { className: "deso-widget-value" }, result.addressLabel),
                React.createElement(
                  "div",
                  { className: "deso-widget-coords" },
                  `${result.lat.toFixed(6)}, ${result.lon.toFixed(6)} (WGS84)`
                )
              ),
              React.createElement(
                "div",
                { className: "deso-widget-card" },
                React.createElement("div", { className: "deso-widget-label", style: { marginBottom: "0.5rem" } }, "Area result"),
                result?.debug &&
                  React.createElement(
                    "div",
                    { className: "deso-widget-debug" },
                    `Debug: ${result.debug.lastLon}, ${result.debug.lastLat}`,
                    result.debug.lastUrl &&
                      React.createElement(
                        React.Fragment,
                        null,
                        React.createElement("br"),
                        React.createElement(
                          "a",
                          {
                            className: "deso-widget-link",
                            href: result.debug.lastUrl,
                            target: "_blank",
                            rel: "noreferrer",
                          },
                          "Open last request"
                        )
                      )
                  ),
                result.attributes
                  ? React.createElement(
                      "table",
                      { className: "deso-widget-table" },
                      React.createElement(
                        "tbody",
                        null,
                        React.createElement(
                          "tr",
                          null,
                          React.createElement("td", null, "DeSO code"),
                          React.createElement("td", { className: "deso-widget-value" }, result.attributes.Deso ?? "—")
                        ),
                        React.createElement(
                          "tr",
                          null,
                          React.createElement("td", null, "Region code"),
                          React.createElement("td", { className: "deso-widget-value" }, result.attributes.Regsokod ?? "—")
                        ),
                        React.createElement(
                          "tr",
                          null,
                          React.createElement("td", null, "Region name"),
                          React.createElement("td", { className: "deso-widget-value" }, result.attributes.Regsonamn ?? "—")
                        ),
                        React.createElement(
                          "tr",
                          null,
                          React.createElement("td", null, "Municipality"),
                          React.createElement(
                            "td",
                            { className: "deso-widget-value" },
                            result.attributes.Kommunnamn ?? result.attributes.Kommun ?? "—"
                          )
                        ),
                        React.createElement(
                          "tr",
                          null,
                          React.createElement("td", null, "County"),
                          React.createElement("td", { className: "deso-widget-value" }, result.attributes["Län"] ?? "—")
                        ),
                        React.createElement(
                          "tr",
                          null,
                          React.createElement("td", null, "Area type"),
                          React.createElement("td", { className: "deso-widget-value" }, result.attributes.Typ_Av_Omr ?? "—")
                        )
                      )
                    )
                  : React.createElement("div", { style: { color: "#475569" } }, "No polygon matched this point.")
              )
            )
        )
      );
    };
  }

  // Initialize widget
  async function init() {
    // Inject styles
    injectStyles();

    // Load React if needed
    if (WIDGET_CONFIG.loadReact) {
      if (typeof React === 'undefined') {
        await loadScript(`https://unpkg.com/react@${WIDGET_CONFIG.reactVersion}/umd/react.production.min.js`);
      }
      if (typeof ReactDOM === 'undefined') {
        await loadScript(`https://unpkg.com/react-dom@${WIDGET_CONFIG.reactVersion}/umd/react-dom.production.min.js`);
      }
    }

    // Wait for container
    const container = document.getElementById(WIDGET_CONFIG.containerId);
    if (!container) {
      console.error(`DeSO Widget: Container with id "${WIDGET_CONFIG.containerId}" not found.`);
      return;
    }

    // Check for React
    if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
      console.error('DeSO Widget: React is not loaded. Please include React and ReactDOM scripts.');
      return;
    }

    // Create and render widget
    const WidgetComponent = createWidgetComponent();
    const root = ReactDOM.createRoot(container);
    root.render(React.createElement(WidgetComponent));
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export for manual initialization
  window.DeSOWidget = {
    init: init,
    config: WIDGET_CONFIG
  };
})();
