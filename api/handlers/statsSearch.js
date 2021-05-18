const config = require("./../config");

module.exports = {
  statsSearch: (esClient) => async (req, res) => {
    const { term } = req.query;
    console.log(term);

    return res.json(await getResults(esClient, term));
  },
};

const query = (input) => ({
  query: {
    bool: {
      must: [
        {
          multi_match: {
            query: input,
            fields: ["name"],
            operator: "and",
          },
        },
        {
          exists: {
            field: "unit.name",
          },
        },
      ],
    },
  },
  aggs: {
    profiles: {
      terms: {
        field: "unit.profileName.keyword",
      },
    },

    wepons: {
      terms: {
        field: "weapons.profileName.keyword",
      },
    },
  },
});

const getResults = async (esClient, term) => {
  const body = query(term);

  const results = await esClient.search({
    index: "battlescribe",
    filter_path: "hits.hits._source,hits.total,aggregations",
    body,
  });

  const hits = results?.body?.hits?.hits || [];

  return hits.map(({ _source: { name, unit, weapons } }) => ({
    name,
    models: groupProfiles(unit),
    weapons: groupProfiles(weapons),
  }));
};

const groupProfiles = (unit) =>
  unit.reduce((acc, profile) => {
    const { profileName, name, value } = profile;

    if (!profileName) {
      return acc;
    }

    const currentModel = (acc && acc[profileName]) || {};
    const updatedModel = {
      ...currentModel,
      [name]: value,
    };

    return {
      ...acc,
      [profileName]: updatedModel,
    };
  }, {});
