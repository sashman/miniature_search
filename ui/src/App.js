import React, { useState } from "react";
import MetaTags from "react-meta-tags";
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
import { Container } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import GitHubIcon from '@material-ui/icons/GitHub';
import MailOutlineIcon from '@material-ui/icons/MailOutline';

const title = "Miniature Search";

const theme = createMuiTheme({
  overrides: {
    MuiFormLabel: {
      // Name of the rule
      root: {
        color: "white",
      },
    },
    MuiButton: {
      // Name of the rule
      root: {
        minWidth: null,
        margin: "10px",
        padding: "16px",
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
const Logo = () => (
  <img
    src="logo192.png"
    className="App-logo"
    alt="Logo"
    style={{
      verticalAlign: "middle",
      maxHeight: "40px",
      padding: "15px",
    }}
  />
);

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
    const results = await post("/search", options.body);

    if (response.ok) setResults(results);
  };

  return (
    <div className="App">
      <MetaTags>
        <title>{title}</title>
      </MetaTags>
      <ThemeProvider theme={theme}>
        <header className="App-header">
          <Container maxWidth="lg" style={{ flex: "1 0 auto" }} >
            <div
              style={{
                paddingTop: "7%",
              }}
            ></div>
            <div
              style={{
                alignItems: "center",
              }}
            >
              <form
                style={{
                  verticalAlign: "middle",
                  display: "flex",
                }}
                noValidate
                autoComplete="off"
              >
                <Logo />
                <TextField
                  label="Search"
                  placeholder="Space Marines"
                  fullWidth
                  autoFocus
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
                <Button variant="contained" color="primary" onClick={search}>
                  <SearchIcon fontSize="small" />
                </Button>
              </form>
            </div>
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
            {!error && !loading && <Results style={{
              minHeight: "70%"
            }} data={results} />}

          </Container>
          <div className="footer">
            <div className="footer-left">
              Created by <a href="mailto:sashman90@gmail.com">Sashman</a>
            </div>
            <div className="footer-right">
              <a href="mailto:sashman90@gmail.com"><MailOutlineIcon fontSize="inherit"/></a>
              <a href="https://github.com/sashman/"><GitHubIcon fontSize="inherit"/></a>
            </div>
          </div>

        </header>
      </ThemeProvider>
    </div >
  );
}

export default App;
