const xpath = require("xpath")
const select = xpath.useNamespaces({
  ns: "http://www.battlescribe.net/schema/catalogueSchema",
})

const nodeName = (node) => select("@name", node)[0]?.value

module.exports = nodeName
