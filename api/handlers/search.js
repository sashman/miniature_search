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
    bool: {
      ...(filters
        ? {
            filter: filters.map((filter) => ({
              term: {
                [`${Object.keys(filter)[0]}.keyword`]: filter[
                  Object.keys(filter)[0]
                ],
              },
            })),
          }
        : {}),
      must: {
        multi_match: {
          query: input,
          type: "most_fields",
          fields: ["title^3", "name^3", "race^2", "faction", "game"],
        },
      },
    },
  },
});

const getResults = async (esClient, input, filters) => {
  if (!input) {
    return {
      error: "'input' must not be empty",
    };
  }

  const body = query(input, filters);

  const results = await esClient.search({
    index: "miniatures",
    filter_path:
      "hits.hits._id,hits.hits._score,hits.hits.highlight,hits.hits._source,hits.total",
    body,
  });

  const response = {
    total: results.body.hits.total.value,
    results: results.body.hits.hits
      ? results.body.hits.hits.map(
          ({
            _score,
            _id,
            _source: {
              game,
              website,
              race,
              price,
              faction,
              link,
              name,
              title,
              inStockQuantity,
            },
          }) => ({
            _score,
            id: _id,
            game,
            website,
            race,
            price,
            faction,
            link,
            name,
            title,
            inStockQuantity,
          })
        )
      : [],
  };

  return response;
};
