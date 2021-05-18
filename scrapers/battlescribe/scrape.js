const fs = require("fs")
const { sleep } = require("usleep")
const simpleGit = require("simple-git")
const glob = require("glob")
const xpath = require("xpath"),
  dom = require("xmldom").DOMParser
const select = xpath.useNamespaces({
  ns: "http://www.battlescribe.net/schema/catalogueSchema",
  gsns: "http://www.battlescribe.net/schema/gameSystemSchema",
})

const debug = !!process.env.DEBUG
const dryRun = !!process.env.DRY_RUN
const catalogueFile = process.env.FILE

const htmlEntities = require("html-entities")
const config = require("./config")
const { Client } = require("@elastic/elasticsearch")
const client = new Client({ node: config.elasticsearch_endpoint })
const { setUpIndex, insertContent } = require("./common")

const nodeName = require("./parsers/node-name")
const parseProfile = require("./parsers/profile")
const parseInfoLink = require("./parsers/info-links")
const { parseWeapon } = require("./parsers/weapons")
const { normalizeParsedWoundTrack } = require("./parsers/wound-track")

;(async function main() {
  const wh40kUrl = "git@github.com:BSData/wh40k.git"
  const wh40kPath = "wh40k"

  const downloadData = async () => {
    if (fs.existsSync(wh40kPath)) {
      const git = simpleGit(`${__dirname}/${wh40kPath}`)
      const pull = await git.pull()
    } else {
      const git = simpleGit()
      console.log(`No data found, cloning from ${wh40kUrl}...`)
      console.log(await git.clone(wh40kUrl))
    }
  }

  const decode = (value) => htmlEntities.decode(value)

  const readGameSystem = (file) => {
    const xml = fs.readFileSync(file, { encoding: "UTF-8" })
    return new dom().parseFromString(xml)
  }

  const readCatalogue = (file, gameSystemDoc) => {
    const xml = fs.readFileSync(file, { encoding: "UTF-8" })
    const doc = new dom().parseFromString(xml)

    const selectionEntryGroups = select(
      [
        "//ns:sharedSelectionEntries/ns:selectionEntry",
        // "//ns:sharedSelectionEntries/ns:selectionEntry[@type='model' or @type='unit']",
        // "//ns:sharedSelectionEntries/ns:selectionEntry/ns:selectionEntries/ns:selectionEntry[@type='model' or @type='unit']",
      ].join(" | "),
      doc
    )

    return selectionEntryGroups.map((selectionEntryGroup) => {
      const name = nodeName(selectionEntryGroup)

      if (debug) {
        console.log(name)
      }

      const unitProfiles = select(
        ".//ns:profiles/ns:profile[@typeName='Unit']",
        selectionEntryGroup
      )

      const parsedUnitProfiles = unitProfiles.map(parseProfile()).flat()

      if (debug) {
        // console.log(parsedUnitProfiles)
      }

      const abilityProfiles = select(
        ".//ns:profiles/ns:profile[@typeName='Abilities']",
        selectionEntryGroup
      )

      const parsedAbilityProfiles = abilityProfiles.map(parseProfile()).flat()

      const psykerProfiles = select(
        ".//ns:profiles/ns:profile[@typeName='Psyker']",
        selectionEntryGroup
      )

      const parsedPsykerProfiles = psykerProfiles.map(parseProfile()).flat()

      const infoLinks = select(
        ".//ns:infoLinks/ns:infoLink[@type='profile']",
        selectionEntryGroup
      )

      const parsedInfoLinks = [] //infoLinks.map(parseInfoLink(doc)).flat()

      const categoryLinks = select(
        ".//ns:categoryLinks/ns:categoryLink[@name!='New CategoryLink' and @name!='']",
        selectionEntryGroup
      )

      const missingCategoryLinks = select(
        ".//ns:categoryLinks/ns:categoryLink[@name='New CategoryLink' or @name='']",
        selectionEntryGroup
      )

      const parsedMissingCategoryLinks = missingCategoryLinks.map(
        (categoryLink) => {
          const targetId = select("@targetId", categoryLink)[0]?.value

          const gameSystemCategoryEntries = select(
            `//gsns:categoryEntries/gsns:categoryEntry[@id='${targetId}']`,
            gameSystemDoc
          )

          const localCategoryEntries = select(
            `//ns:categoryEntries/ns:categoryEntry[@id='${targetId}']`,
            doc
          )

          return [gameSystemCategoryEntries, localCategoryEntries]
            .flat()
            .map((gameSystemCategoryEntry) => nodeName(gameSystemCategoryEntry))
        }
      )

      const parsedCategoryLinks = categoryLinks
        .map((categoryLink) => nodeName(categoryLink))
        .concat(parsedMissingCategoryLinks)
        .flat()

      const weaponOptionEntryLinks = select(
        [".//ns:entryLink", ".//ns:selectionEntry"].join(" | "),
        selectionEntryGroup
      )

      const parsedWeapons = weaponOptionEntryLinks
        .map(parseWeapon(doc, gameSystemDoc))
        .flat()
        .filter((item) => !!item)

      const woundTrackProfiles = select(
        "ns:profiles/ns:profile[@typeName='Wound Track']",
        selectionEntryGroup
      )

      const normalizedWoundTrackProfiles = woundTrackProfiles.reduce(
        normalizeParsedWoundTrack,
        {}
      )

      return {
        source: file,
        name,
        unit: parsedUnitProfiles,
        ability: parsedAbilityProfiles,
        psyker: parsedPsykerProfiles,
        infoLinks: parsedInfoLinks,
        keywords: parsedCategoryLinks,
        woundTrack: normalizedWoundTrackProfiles.mapped,
        weapons: parsedWeapons,
      }
    })
  }

  await setUpIndex(client)
  await downloadData()
  const gameSystem = readGameSystem(`${wh40kPath}/Warhammer 40,000.gst`)
  const files = catalogueFile
    ? glob.sync(catalogueFile)
    : glob.sync(`${wh40kPath}/**/*.cat`)
  const catalogues = files.map((file) => {
    console.log(file)
    return readCatalogue(file, gameSystem)
  })

  if (!dryRun) {
    console.log("Writing to index")
    for (const catalogue of catalogues) {
      if (catalogue.length < 1) {
        continue
      }

      await insertContent(client, catalogue)
    }
  }
})()
