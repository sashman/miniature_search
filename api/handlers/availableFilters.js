module.exports = {
  availableFilters: (esClient) => async (req, res) => {
    try {
      const filters = await getFilters(esClient);
      return res.json(filters);
    } catch (error) {
      return res.status(502).json({ error });
    }
  },
};

const body = {
  aggs: {
    games: {
      terms: {
        field: "game.keyword",
      },
      aggs: {
        factions: {
          terms: {
            field: "faction.keyword",
          },
          aggs: {
            races: {
              terms: {
                field: "race.keyword",
                size: 50,
              },
            },
          },
        },
      },
    },
  },
  size: 0,
};

const getFilters = async (esClient) => {
  const response = await esClient.search({
    index: "miniatures",
    body,
  });

  return response.body.aggregations.games.buckets.map((game) => ({
    name: game.key,
    count: game.doc_count,
    factions: game.factions.buckets.map((faction) => ({
      name: faction.key,
      count: faction.doc_count,
      races: faction.races.buckets.map((race) => ({
        name: race.key,
        count: race.doc_count,
      })),
    })),
  }));
};
