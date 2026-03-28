// Entry point for the build script in your package.json
import React from "react"
import { createRoot } from "react-dom/client";
import App from "./App";
import { getCsrfHeaders } from "./utils/csrf";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS", "TRACE"]);

function isSameOriginRequest(input) {
  const url = typeof input === "string" ? input : input?.url;
  if (!url) return true;

  // Relative URLs are same-origin by definition.
  if (url.startsWith("/")) return true;

  try {
    const target = new URL(url, window.location.origin);
    return target.origin === window.location.origin;
  } catch (error) {
    return false;
  }
}

if (!window.__teamflowCsrfFetchPatched) {
  const originalFetch = window.fetch.bind(window);

  window.fetch = (input, init = {}) => {
    const method = (init.method || "GET").toUpperCase();

    if (SAFE_METHODS.has(method) || !isSameOriginRequest(input)) {
      return originalFetch(input, init);
    }

    const headers = new Headers(init.headers || {});
    const csrfHeaders = getCsrfHeaders();

    Object.entries(csrfHeaders).forEach(([key, value]) => {
      if (!headers.has(key)) headers.set(key, value);
    });

    return originalFetch(input, {
      ...init,
      headers,
    });
  };

  window.__teamflowCsrfFetchPatched = true;
}

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("root");
  if (root) {
    createRoot(root).render(
      <App />
    );
  }
});