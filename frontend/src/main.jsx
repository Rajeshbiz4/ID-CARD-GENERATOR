import React from "react";
import ReactDOM from "react-dom/client";

import {
  BrowserRouter,
} from "react-router-dom";

import {
  CssBaseline,
  ThemeProvider,
} from "@mui/material";

import App from "./App";
import GlobalLoader from "./GlobalLoader";
import { theme } from "./theme";
import "./styles.css";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <App />

        <GlobalLoader />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
