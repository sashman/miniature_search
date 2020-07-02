import React, { useState } from "react";
import "./App.css";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";
import useFetch from "use-http";

import Filters from "./filters/Filters";
import AppliedFilters from "./filters/AppliedFilters";
import Results from "./results/Results";

import { apiUrl } from "./config";

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
  const [activeFilters, setActiveFilters] = useState({});

  const filtersToQuery = () => {
    return Object.keys(activeFilters).map((activeFilterKey) => {
      const name = activeFilters[activeFilterKey];
      const value = activeFilterKey.replace(`${name}:`, "");

      return { [name]: value };
    });
  };

  const options = {
    body: {
      input: searchTerm,
      filters: filtersToQuery(),
    },
    headers: { "Content-Type": "application/json" },
  };
  const { post, response, loading, error } = useFetch(apiUrl);

  const search = async () => {
    if (!searchTerm) {
      return;
    }

    const results = await post("/search", options.body);

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
                onKeyPress: (event) => {
                  if (event.key === "Enter") {
                    search();
                    event.preventDefault();
                  }
                },
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
          <Filters
            activeFilters={activeFilters}
            setActiveFilters={setActiveFilters}
          />
          <AppliedFilters activeFilters={activeFilters} />
          {error && (
            <Typography style={{ margin: "10px" }} color="secondary">
              Error loading results...
            </Typography>
          )}
          {loading && <Loading />}
          {!error && !loading && <Results data={results} />}
        </header>
      </ThemeProvider>
    </div>
  );
}

export default App;
