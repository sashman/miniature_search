import React, { useState } from "react";
import "./App.css";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import useFetch from "use-http";

import Filters from "./filters/Filters";
import Results from "./results/Results";

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

const Loading = () => <CircularProgress />;

function App() {
  const [results, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const options = {
    body: {
      input: searchTerm,
    },
    headers: { "Content-Type": "application/json" },
  };
  const { post, response, loading, error } = useFetch("http://localhost:3000");

  const search = async () => {
    console.log(searchTerm);

    if (!searchTerm) {
      return;
    }

    const results = await post("/search", options.body);
    console.log(results);

    if (response.ok) setResults(results);
  };

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
              InputProps={{
                onChange: (event) => setSearchTerm(event.target.value),
              }}
            />
            <Button
              variant="contained"
              color="primary"
              style={{ marginLeft: "10px" }}
              onClick={search}
            >
              Search
            </Button>
          </form>
          <Filters />

          {loading ? <Loading /> : <Results data={results} />}
        </header>
      </ThemeProvider>
    </div>
  );
}

export default App;
