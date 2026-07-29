import React from "react";
import { createRoot } from "react-dom/client";
import Home from "./source/app/page";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Missing #root container");
}

createRoot(container).render(
  <React.StrictMode>
    <Home />
  </React.StrictMode>,
);
