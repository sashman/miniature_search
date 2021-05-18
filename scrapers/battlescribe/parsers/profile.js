const xpath = require("xpath")
const select = xpath.useNamespaces({
  ns: "http://www.battlescribe.net/schema/catalogueSchema",
  gsns: "http://www.battlescribe.net/schema/gameSystemSchema",
})

const nodeName = require("./node-name")

const parseProfile = (namespace) => (profile) => {
  const ns = namespace || "ns"
  const profileName = nodeName(profile)

  const characteristics = select(
    `./${ns}:characteristics/${ns}:characteristic`,
    profile
  )

  return characteristics.map((characteristic) => {
    const name = nodeName(characteristic)

    return {
      profileName,
      name,
      value: characteristic?.firstChild?.data,
    }
  })
}

module.exports = parseProfile
