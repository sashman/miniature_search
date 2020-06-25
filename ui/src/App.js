import React from "react";
import "./App.css";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";

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
              "padding-top": "10%",
            }}
          >
            <TextField
              label="Search"
              style={{
                width: "80%",

                "vertical-align": "bottom",
              }}
            />
            <Button
              variant="contained"
              color="primary"
              style={{ "margin-left": "10px" }}
            >
              Search
            </Button>
          </form>
        </header>
      </ThemeProvider>
    </div>
  );
}

export default App;
