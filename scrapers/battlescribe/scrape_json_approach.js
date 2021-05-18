const fs = require("fs")
const simpleGit = require("simple-git")
const glob = require("glob")
const parser = require("fast-xml-parser")
const htmlEntities = require("html-entities")
const config = require("./config")
const { Client } = require("@elastic/elasticsearch")
const client = new Client({ node: config.elasticsearch_endpoint })
const { setUpIndex, insertContent, flatten } = require("./common")

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

  const catalogueJson = (file) => {
    const data = fs.readFileSync(file, { encoding: "UTF-8" })
    return parser.parse(data, {
      ignoreAttributes: false,
      attributeNamePrefix: "_",
    })
  }

  const combineCharacteristics = (characteristic) =>
    characteristic.reduce(
      (accumulated, value) => ({
        ...accumulated,
        [decode(value["_name"])]: decode(value["#text"].toString()),
      }),
      {}
    )

  const woundTrackCharacteristic = (accumulated, characteristic) => {
    const remaining = characteristic.find(
      (value) => value["_name"] === "Remaining W"
    )
    if (remaining && remaining["#text"] === "-") {
      return {
        ...accumulated,
        wound_track_characteristic_map: characteristic.reduce(
          (accumulated, value) => ({
            ...accumulated,
            ...(value["_name"] !== "Remaining W"
              ? { [value["_name"]]: decode(value["#text"].toString()) }
              : {}),
          }),
          {}
        ),
      }
    }

    return {
      ...accumulated,
      "Wound Track": [
        ...(accumulated["Wound Track"] || []),
        characteristic.reduce(
          (accumulatedCharacteristic, value) => ({
            ...accumulatedCharacteristic,
            [(accumulated.wound_track_characteristic_map || {})[
              value["_name"]
            ] || decode(value["_name"])]: decode(value["#text"].toString()),
          }),
          {}
        ),
      ],
    }
  }

  const extractUnitProfiles = (profiles) => {
    const profileList = Array.isArray(profiles) ? profiles : [profiles]

    return profileList.reduce(
      (
        accumulated,
        { _typeName, _name, characteristics: { characteristic } }
      ) => {
        if (_typeName === "Unit") {
          return {
            ...accumulated,
            Unit: combineCharacteristics(characteristic),
          }
        }

        if (_typeName === "Psyker") {
          return {
            ...accumulated,
            Psyker: combineCharacteristics(characteristic),
          }
        }

        if (_typeName === "Wound Track") {
          return woundTrackCharacteristic(accumulated, characteristic)
        }

        if (Array.isArray(characteristic)) {
          const flattenedCharacteritics = characteristic.map(
            (characteristicItem) => ({
              name: decode(characteristicItem._name),
              value: decode(characteristicItem["#text"].toString()),
            })
          )

          return {
            ...accumulated,
            Abilities: [
              ...(accumulated["Abilities"] || []),
              ...flattenedCharacteritics,
            ],
          }
        }

        return {
          ...accumulated,
          Abilities: [
            ...(accumulated["Abilities"] || []),
            {
              name: decode(characteristic._name),
              value: decode(characteristic["#text"].toString()),
            },
          ],
        }
      },
      {}
    )
  }

  const modelOrUnitFilter = ({ _type }) => ["model", "unit"].includes(_type)

  const listify = (item) => (Array.isArray(item) ? item : [item])

  const profilesFromSelectionEntry = (selectionEntry) => {
    // console.log(selectionEntry);
    if (selectionEntry.selectionEntries) {
      return listify(selectionEntry.selectionEntries.selectionEntry)
        .filter(modelOrUnitFilter)
        .map((selectionEntry) => {
          try {
            const {
              profiles: { profile },
            } = selectionEntry

            return profile
          } catch (error) {
            return []
          }
        })
        .flat()
    }

    try {
      const {
        profiles: { profile },
      } = selectionEntry

      return profile
    } catch (error) {
      return []
    }
  }

  const unitsInCatalogue = (jsonObj, file) => {
    try {
      const {
        catalogue: {
          sharedSelectionEntries: { selectionEntry },
          sharedProfiles
        },
      } = jsonObj
      const selectionEntryList = listify(selectionEntry)
      const indexedSharedProfiles = sharedProfiles.profile.reduce((accumuldated, sp) => ({
        ...accumuldated,
        [sp._id]: sp
      }))
      // console.log(indexedSharedProfiles);

      const units = selectionEntryList
        .filter(modelOrUnitFilter)
        .map((selectionEntry) => {
          try {
            const profile = profilesFromSelectionEntry(selectionEntry)
            const unitProfiles = extractUnitProfiles(profile)

            return {
              name: decode(selectionEntry._name),
              id: selectionEntry._id,
              source: file,
              ...unitProfiles,
            }
          } catch (error) {
            console.error(error)
            console.log(selectionEntry)
            return {}
          }
        })

      return units
    } catch (error) {
      console.error(error)
      console.log(jsonObj.catalogue.sharedSelectionEntries)
      return []
    }
  }

  const denormalizecatalogue = (cat, file) => {
    const units = unitsInCatalogue(cat, file)
    // console.log(JSON.stringify(units, null, 2))
    // console.log(units.length)
    return units
  }

  const decode = (value) => htmlEntities.decode(value)

  await setUpIndex(client)
  await downloadData()
  const files = glob.sync(`${wh40kPath}/**/Tyranids.cat`)
  const catalogues = files.map((file) => {
    const catalogue = catalogueJson(file)
    console.log(file)
    const denormalizedcatalogue = denormalizecatalogue(catalogue, file)
    console.log(denormalizedcatalogue)

    // if(denormalizedcatalogue.length > 0){
    //   return insertContent(client, denormalizedcatalogue)
    // } 

    return Promise.resolve()
  })

  await Promise.all(catalogues)
})()
