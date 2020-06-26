import React from "react";
import "./App.css";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";

import Filters from "./filters/Filters";

const theme = createMuiTheme({
  overrides: {
    MuiFormLabel: {
      // Name of the rule
      root: {
        color: "white",
      },
    },
    MuiInput: {
      // Name of the rule
      underline: {
        "&&&&:before": {
          borderBottom: "1px solid white",
        },
      },
      input: {
        color: "white",
      },
    },
    // MuiExpansionPanelDetails: {
    //   root: {
    //     display: "flex",

    //   },
    // },
  },
});

function App() {
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <header className="App-header">
          <form
            noValidate
            autoComplete="off"
            style={{
              width: "50%",
              paddingTop: "10%",
            }}
          >
            <TextField
              label="Search"
              style={{
                width: "80%",

                verticalAlign: "bottom",
              }}
            />
            <Button
              variant="contained"
              color="primary"
              style={{ marginLeft: "10px" }}
            >
              Search
            </Button>
          </form>
          <Filters />
        </header>
      </ThemeProvider>
    </div>
  );
}

export default App;
