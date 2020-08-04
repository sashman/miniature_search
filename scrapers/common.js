const fs = require("fs");
const config = require(`${__dirname}/config`);
const indexName = "miniatures";
const mapping = fs.readFileSync(`${__dirname}/mapping.json`);

const setUpIndex = async (client) => {
  console.log(`Writing to ${config.elasticsearch_endpoint}`);

  const { body: exists } = await client.indices.exists({
    index: indexName,
    local: true,
    flat_settings: true,
  });

  !exists &&
    (await client.indices.create({
      index: indexName,
      body: mapping,
    }));
};

const flatten = (arr) => {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(
      Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten
    );
  }, []);
};

const insertContent = async (client, content) => {
  const body = flatten(
    content.map((doc) => [[{ index: { _index: indexName, _id: doc.id } }, doc]])
  );

  if (process.env.DEBUG === "true") {
    console.log(body);
  } else {
    const response = await client.bulk({
      index: indexName,
      body,
    });

    if (response.body.errors) {
      console.log(response.body.items.map((item) => item.index.error));
    }
  }
};

module.exports = {
  setUpIndex,
  insertContent,
  indexName,
  mapping,
  flatten,
};
