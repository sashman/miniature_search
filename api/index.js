const express = require("express");
const config = require("./config");
const { Client } = require("@elastic/elasticsearch");
const client = new Client({ node: config.elasticsearch_endpoint });

const app = express();
const { search } = require("./handlers/search");
const { availableFilters } = require("./handlers/availableFilters");

const port = process.env.PORT || 3000;

app.use(express.json());
app.get("/", (req, res) => res.send("ok"));
app.get("/search", search(client));
app.get("/available_filters", availableFilters(client));

app.listen(port, () =>
  console.log(`App listening at http://localhost:${port}`)
);
