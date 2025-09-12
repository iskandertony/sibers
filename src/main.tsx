import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./root/App";
import "antd/dist/reset.css";
import "@/shared/styles/index.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
