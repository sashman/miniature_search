import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import TagManager from "react-gtm-module";
import { gtmId, gtmAuth, gaId } from "./config";
import ReactGA from "react-ga";

const tagManagerArgs = {
  gtmId,
  auth: gtmAuth,
  preview: "env-1",
};

TagManager.initialize(tagManagerArgs);

ReactGA.initialize("gaId");
ReactGA.pageview(window.location.pathname + window.location.search);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorker.unregister();
