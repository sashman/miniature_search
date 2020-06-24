module.exports = {
  search: (esClient) => async (req, res) =>
    res.json(await getResults(esClient, req.body.input, req.body.filters)),
};

const query = (input, filters) => ({
  _source: [
    "title",
    "name",
    "race",
    "price",
    "website",
    "link",
    "inStockQuantity",
    "race",
    "faction",
    "game",
  ],
  query: {
    multi_match: {
      query: input,
      fields: ["title^2", "name^2", "race", "faction", "game"],
    },
  },
});

const getResults = async (esClient, input, filters) => {
  if (!input) {
    return {
      error: "'input' must not be empty",
    };
  }

  const response = await esClient.search({
    index: "miniatures",
    filter_path:
      "hits.hits._id,hits.hits._score,hits.hits.highlight,hits.hits._source,hits.total",
    body: query(input, filters),
  });

  return response.body;
};
