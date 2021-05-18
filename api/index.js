const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const config = require("./config");
const { Client } = require("@elastic/elasticsearch");
const client = new Client({ node: config.elasticsearch_endpoint });

const app = express();
const { search } = require("./handlers/search");
const { availableFilters } = require("./handlers/availableFilters");
const { statsSearch } = require("./handlers/statsSearch");

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan("combined"));
app.get("/", (req, res) => res.send("ok"));
app.post("/search", search(client));
app.get("/available_filters", availableFilters(client));
app.get("/stats/search", statsSearch(client));

app.listen(port, () =>
  console.log(`App listening at http://localhost:${port}`)
);
