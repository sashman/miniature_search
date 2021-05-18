const xpath = require("xpath")
const select = xpath.useNamespaces({
  ns: "http://www.battlescribe.net/schema/catalogueSchema",
  gsns: "http://www.battlescribe.net/schema/gameSystemSchema",
})

const nodeName = require("./node-name")
const parseProfile = require("./profile")

const nodeTargetId = (node) => select("@targetId", node)[0].value

const parseInfoLink = (doc, namespace, attributeFilters) => (infoLink) => {
  const ns = namespace || "ns"
  const targetId = nodeTargetId(infoLink)

  const filters = attributeFilters
    ? " and " +
      Object.keys(attributeFilters)
        .map((key) => `@${key}='${attributeFilters[key]}'`)
        .join(" and ")
    : ""

  const profile = select(`//${ns}:profile[@id='${targetId}'${filters}]`, doc)[0]

  if (profile) {
    return parseProfile(namespace)(profile)
  }

  return null
}

module.exports = parseInfoLink
