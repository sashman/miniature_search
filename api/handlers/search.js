module.exports = {
  search: (esClient) => async (req, res) =>
    res.json(await getResults(esClient, req.body.input, req.body.filters)),
};

const createFilters = (filters) => ({
  filter: filters.map((filter) => ({
    term: {
      [`${Object.keys(filter)[0]}.keyword`]: Object.values(filter)[0],
    },
  })),
});

const query = (input, filters) => ({
  size: 0,
  query: {
    bool: {
      ...(filters ? createFilters(filters) : {}),
      must: {
        multi_match: {
          query: input,
          type: "most_fields",
          fields: ["title^3", "name^3", "race^2", "faction", "game"],
        },
      },
    },
  },
  aggs: {
    website_results: {
      terms: {
        field: "website.keyword",
      },
      aggs: {
        latest_results: {
          terms: {
            field: "name.keyword",
            order: {
              maximum_score: "desc",
            },
          },
          aggs: {
            maximum_score: {
              max: {
                script: {
                  source: "_score",
                },
              },
            },
            hits: {
              top_hits: {
                size: 1,
                sort: [{ date: "desc" }],
              },
            },
          },
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
      "hits.hits._id,hits.hits._score,hits.hits.highlight,hits.hits._source,hits.total,aggregations",
    body,
  });

  const {
    body: {
      aggregations: {
        website_results: { buckets },
      },
    },
  } = results;

  const flatBuckets = buckets
    .map((bucket) => bucket.latest_results.buckets)
    .flat();

  const response = {
    total: 0,
    results: flatBuckets
      ? flatBuckets.map(
          ({
            hits: {
              hits: {
                hits: [
                  {
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
                  },
                ],
              },
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
