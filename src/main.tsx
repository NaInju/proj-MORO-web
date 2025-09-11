import React from "react";
import ReactDOM from "react-dom/client";
import './styles/globals.css'
import { BrowserRouter } from "react-router-dom";
import App from "./App";

const basename = import.meta.env.PROD ? "/proj-MORO-web" : "/";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);