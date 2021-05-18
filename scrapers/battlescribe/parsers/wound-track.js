const xpath = require("xpath")
const select = xpath.useNamespaces({
  ns: "http://www.battlescribe.net/schema/catalogueSchema",
})

const nodeName = require("./node-name")

const defaultWoundTrackColumnMapping = {
  "Remaining W": "Remaining W",
  "Characteristic 1": "M",
  "Characteristic 2": "BS",
  "Characteristic 3": "A",
}

const normalizeParsedWoundTrack = (accumulated, woundTrackProfile) => {
  const woundTrackCharactertistics = select(
    "ns:characteristics/ns:characteristic",
    woundTrackProfile
  )

  const woundTrackColumns = select(
    "ns:characteristics/ns:characteristic[@name='Remaining W' and text()='-']",
    woundTrackProfile
  )

  if (woundTrackColumns.length > 0) {
    const woundTrackColumnMapping = woundTrackCharactertistics.reduce(
      (acc, woundTrackCharactertistic) => {
        const name = nodeName(woundTrackCharactertistic)
        const value = woundTrackCharactertistic.firstChild.data
        return {
          ...acc,
          [name]: value === "-" ? name : value,
        }
      },
      {}
    )
    accumulated.woundTrackColumnMapping = woundTrackColumnMapping
  }

  const mappedWoundTrackCharactertistics = woundTrackCharactertistics.reduce(
    (acc, woundTrackCharactertistic) => {
      const name = nodeName(woundTrackCharactertistic)
      const mapping =
        accumulated.woundTrackColumnMapping || defaultWoundTrackColumnMapping
      const mappedName = mapping[name]
      const value = woundTrackCharactertistic?.firstChild?.data

      if (!value) {
        return acc
      }

      const additional = {}
      if (name === "Remaining W" && value !== "-") {
        const remainingMax = value.split("-")[1]
        const remainingMin = value.split("-")[0]

        additional["Remaining W Max"] = remainingMax
        additional["Remaining W Min"] = remainingMin
      }

      if (name === "Remaining W" && value === "-") {
        additional.skip = true
      }

      return {
        ...acc,
        [mappedName]: value,
        ...additional,
      }
    },
    {}
  )

  if (!!mappedWoundTrackCharactertistics.skip) {
    return accumulated
  }

  const currentMapped = accumulated.mapped || []

  return {
    ...accumulated,
    mapped: [...currentMapped, mappedWoundTrackCharactertistics],
  }
}

module.exports = { normalizeParsedWoundTrack }
