module.exports = {
  elasticsearch_endpoint:
    process.env.ELASTICSEARCH_ENDPOINT || "http://localhost:9200",
    indexAliasName: "estore-miniatures"
};
