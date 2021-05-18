const xpath = require("xpath")
const select = xpath.useNamespaces({
  ns: "http://www.battlescribe.net/schema/catalogueSchema",
  gsns: "http://www.battlescribe.net/schema/gameSystemSchema",
})

const nodeName = require("./node-name")
const parseInfoLink = require("./info-links")
const parseProfile = require("./profile")

const parseSelectionEntryGroup = (
  selectionEntryGroup,
  doc,
  gameSystemDoc,
  local
) => {
  const namespace = local ? "ns" : "gsns"

  const entryLinks = select(`.//${namespace}:entryLink`, selectionEntryGroup)

  return entryLinks.map((entryLink) =>
    parseWeapon(doc, gameSystemDoc)(entryLink)
  )
}

const parseSelectionEntry = (
  selectionEntry,
  doc,
  gameSystemDoc,
  local = true
) => {
  const namespace = local ? "ns" : "gsns"
  const infoLinks = select(
    `.//${namespace}:infoLinks/${namespace}:infoLink`,
    selectionEntry
  )

  const parsedInfoLinks = infoLinks
    .map(parseInfoLink(doc, null, { typeName: "Weapon" }))
    .concat(
      infoLinks.map(
        parseInfoLink(gameSystemDoc, "gsns", { typeName: "Weapon" })
      )
    )
    .flat()
    .filter((item) => !!item)

  const profiles = select(
    `.//${namespace}:profile[@typeName='Weapon']`,
    selectionEntry
  )
  const parsedProfiles = profiles
    .map((profile) => parseProfile(namespace)(profile))
    .flat()

  return parsedInfoLinks.concat(parsedProfiles)
}

const parseEntryLink = (entryLink, doc, gameSystemDoc) => {
  const targetId = select("@targetId", entryLink)[0]?.value
  const localLinkTarget = select(`//*[@id='${targetId}']`, doc)[0]
  const globalLinkTarget = select(`//*[@id='${targetId}']`, gameSystemDoc)[0]

  const linkTarget = localLinkTarget || globalLinkTarget
  const local = !!localLinkTarget

  const parser = parserMap[linkTarget?.tagName]

  return parser ? parser(linkTarget, doc, gameSystemDoc, local) : null
}

const parseWeapon = (doc, gameSystemDoc) => (weaponOptionEntryLink) => {
  const parser = parserMap[weaponOptionEntryLink?.tagName]

  return parser ? parser(weaponOptionEntryLink, doc, gameSystemDoc) : null
}

const parserMap = {
  entryLink: parseEntryLink,
  selectionEntry: parseSelectionEntry,
  selectionEntryGroup: parseSelectionEntryGroup,
}

module.exports = {
  parseWeapon,
}
