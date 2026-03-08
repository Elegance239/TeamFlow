// Entry point for the build script in your package.json
import React from "react"
import { createRoot } from "react-dom/client";
import App from "./App";
import "./application.css";

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("root");
  if (root) {
    createRoot(root).render(
      <App />
    );
  }
});