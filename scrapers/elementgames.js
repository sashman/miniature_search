const { sleep } = require("usleep");
const fetch = require("node-fetch");
const { parse } = require("node-html-parser");
const config = require("./config");
const { Client } = require("@elastic/elasticsearch");
const client = new Client({ node: config.elasticsearch_endpoint });
const { setUpIndex, insertContent, flatten } = require("./common");

const rootUrl = "https://elementgames.co.uk";

(async function main() {
  await setUpIndex(client);

  const games = [
    {
      title: "Warhammer Age of Sigmar",
      urlPath: "new-warhammer-age-of-sigmar",
      factions: [
        {
          title: "Grand Alliance Order",
          urlPath: "forces-of-order-",
          races: [
            { title: "Aelves", urlPath: "darkling-covens" },
            { title: "Daughters of Khaine", urlPath: "daughters-of-khaine" },
            { title: "Dispossessed", urlPath: "dispossessed" },
            { title: "Cities of Sigmar", urlPath: "free-peoples" },
            { title: "Fyreslayers", urlPath: "fyreslayers" },
            { title: "Idoneth Deepkin", urlPath: "idoneth-deepkin" },
            {
              title: "The Kharadron Overlords",
              urlPath: "kharadron-overlords",
            },
            { title: "Seraphon", urlPath: "seraphon" },
            { title: "Stormcast Eternals", urlPath: "stormcast-eternals" },
            { title: "Sylvaneth", urlPath: "sylvaneth" },
          ],
        },
        {
          title: "Grand Alliance Chaos",
          urlPath: "forces-of-chaos",
          races: [
            { title: "Beasts of Chaos", urlPath: "beasts-of-chaoscat" },
            { title: "Blades of Khorne", urlPath: "blades-of-khorne" },
            {
              title: "Disciples of Tzeentch",
              urlPath: "disciples-of-tzeentch",
            },
            { title: "Hedonites of Slaanesh", urlPath: "slaanesh" },
            { title: "Maggotkin of Nurgle", urlPath: "nurgle" },
            { title: "The Skaven", urlPath: "clan-pestilens" },
            { title: "Slaves to Darkness", urlPath: "everchosen" },
          ],
        },
        {
          title: "Grand Alliance Death",
          urlPath: "forces-of-death",
          races: [
            { title: "Flesh-eater Courts", urlPath: "flesh-eater-courts" },
            { title: "Legions of Nagash", urlPath: "deathlords" },
            { title: "Nighthaunt", urlPath: "nighthaunt" },
            { title: "Ossiarch Bonereapers", urlPath: "ossiarch-bonereapers" },
          ],
        },
        {
          title: "Grand Alliance Destruction",
          urlPath: "forces-of-destruction",
          races: [
            { title: "Gloomspite Gitz", urlPath: "moonclan-grots" },
            { title: "Ogor Mawtribes", urlPath: "beastclaw-raiders" },
            { title: "Orruk Warclans", urlPath: "ironjawz" },
            { title: "Orruk Warclans", urlPath: "bonesplitterz" },
          ],
        },
      ],
    },
    {
      title: "Warhammer 40k",
      urlPath: "warhammer-40k",
      factions: [
        {
          title: "Space Marines",
          races: [
            { title: "Blood Angels", urlPath: "blood-angels" },
            { title: "Dark Angels", urlPath: "dark-angels" },
            { title: "Death Watch", urlPath: "deathwatch" },
            { title: "Grey Knights", urlPath: "grey-knights" },
            { title: "Space Wolves", urlPath: "space-wolves" },
            { title: "Space Marines", urlPath: "space-marines" },
          ],
        },
        {
          title: "Armies of the Imperium",
          races: [
            { title: "Adepta Sororitas", urlPath: "sisters-of-battle" },
            { title: "Adeptus Custodes", urlPath: "totp" },
            { title: "Adeptus Mechanicus", urlPath: "adeptus-mechanicus" },
            { title: "Astra Militarum", urlPath: "imperial-guard" },
            { title: "Imperial Knights", urlPath: "imperial-knights" },
            { title: "Officio Assassinorum", urlPath: "imperial-agents" },
          ],
        },
        {
          title: "Armies of Chaos",
          races: [
            { title: "Chaos Daemons", urlPath: "chaos-daemons" },
            { title: "Death Guard", urlPath: "death-guard" },
            { title: "Thousand Sons", urlPath: "thousand-sons" },
            { title: "Chaos Space Marines", urlPath: "chaos-space-marines" },
          ],
        },
        {
          title: "Xenos Armies",
          races: [
            { title: "Craftworlds", urlPath: "eldar" },
            { title: "Drukhari", urlPath: "dark-eldar" },
            { title: "Genestealer Cults", urlPath: "genestealer-cults" },
            { title: "Harlequins", urlPath: "harlequins" },
            { title: "Necrons", urlPath: "necrons" },
            { title: "Orks", urlPath: "orks" },
            { title: "T'au Empire", urlPath: "tau-empire" },
            { title: "Tyranids", urlPath: "tyranids" },
          ],
        },
      ],
    },
    {
      title: "Middle Earth",
      urlPath: "MESBG",
      factions: [
        {
          title: "The Lord of The Rings Good",
          urlPath: "good",
          races: [
            { title: "Arnor", urlPath: "arnor" },
            { title: "Fangorn", urlPath: "fangorn" },
            { title: "Lothlorien", urlPath: "lothlorien" },
            { title: "Minas Tirith", urlPath: "minas-tirith" },
            { title: "Numenor", urlPath: "numenor" },
            { title: "Rivendell", urlPath: "rivendell" },
            { title: "Rohan", urlPath: "rohan" },
            {
              title: "The Dead of Dunharrow",
              urlPath: "the-dead-of-dunharrow",
            },
            { title: "The Fellowship", urlPath: "the-fellowship" },
            { title: "The Fiefdoms", urlPath: "the-fiefdoms" },
            {
              title: "The Kingdom of Khazad-Dum",
              urlPath: "the-kingdom-of-khazad-dum",
            },
            { title: "The Misty Mountains", urlPath: "the-misty-mountains" },
            { title: "The Rangers", urlPath: "the-rangers" },
            { title: "The Shire", urlPath: "the-shire" },
            {
              title: "Wanderers in the Wild",
              urlPath: "wanderers-in-the-wild",
            },
            {
              title: "Wildmen of Druadan",
              urlPath: "the-woses-of-druadan-forest-cat",
            },
          ],
        },
        {
          title: "The Lord of The Rings Evil",
          urlPath: "evil",
          races: [
            { title: "Angmar", urlPath: "angmar" },
            { title: "Barad-Dur", urlPath: "barad-dur" },
            { title: "Corsairs of Umbar", urlPath: "corsairs-of-umbar" },
            { title: "Far Harad", urlPath: "far-harad" },
            { title: "Isengard", urlPath: "isengard" },
            { title: "Mordor", urlPath: "mordor" },
            { title: "Moria", urlPath: "moria" },
            { title: "Sharkey's Rogues", urlPath: "sharkeys-rogues" },
            { title: "The Easterlings", urlPath: "the-easterlings" },
            { title: "The Serpent Horde", urlPath: "the-serpent-horde" },
            { title: "Variags of Khand", urlPath: "variags-of-khand" },
          ],
        },
        {
          title: "The Hobbit Good",
          urlPath: "good",
          races: [
            { title: "Army of Thror", urlPath: "army-of-thror" },
            { title: "Erebor Reclaimed", urlPath: "erebor-reclaimed" },
            { title: "Garrison of Dale", urlPath: "garrison-of-dale" },
            { title: "Halls of Thranduil", urlPath: "thranduils-halls" },
            { title: "Radagast's Alliance", urlPath: "radagasts-alliance" },
            {
              title: "The Army of Lake-town",
              urlPath: "the-army-of-lake-town",
            },
            {
              title: "The Survivor's of Lake-town",
              urlPath: "the-survivors-of-lake-town",
            },
            { title: "Thorin's Company", urlPath: "thorins-company" },
          ],
        },
        {
          title: "The Hobbit Evil",
          urlPath: "evil",
          races: [
            { title: "Azog's Hunters", urlPath: "azogs-hunters" },
            { title: "Azog's Legion", urlPath: "azogs-legion" },
            {
              title: "Dark Powers of Dol Guldur",
              urlPath: "dark-powers-of-dol-guldur",
            },
            {
              title: "Desolator of the North",
              urlPath: "desolator-of-the-north",
            },
            { title: "Goblin Town", urlPath: "goblin-town" },
            {
              title: "The Dark Denizens of Mirkwood",
              urlPath: "the-dark-denizens-of-mirkwood",
            },
            { title: "The Trolls", urlPath: "the-trolls" },
          ],
        },
      ],
    },
  ];

  const getProducts = (page, game, faction, race) => {
    const document = parse(page);

    const productNodes = document.querySelectorAll("div.productgrid");
    return productNodes.map((productNode) => {
      const date = new Date();
      const nameNode = productNode.querySelector("h3.producttitle");
      const name = nameNode.text;
      const imgNode = productNode.querySelector("img.productimage");
      const imgSrc = imgNode && imgNode.getAttribute("src");
      const linkNode = productNode.querySelector("a");
      const link = linkNode.getAttribute("href").replace(/\.\.\//g, "");
      const priceNode = productNode.querySelector("span.price");
      const price = priceNode.text ? priceNode.text.replace("£", "") : null;
      const inStockNode = productNode.querySelector(
        "div.productinfo div div div"
      );
      const inStockText = inStockNode.text;
      const inStockMatches = inStockText
        ? inStockText.match(/(\d+) In Stock/)
        : [];
      const inStockQuantity =
        inStockMatches && inStockMatches.length > 0
          ? parseInt(inStockMatches[1])
          : 0;

      return {
        imgSrc,
        link: `${rootUrl}/${link}`,
        title: name,
        game: game.title,
        faction: faction.title,
        race: race.title,
        price,
        name,
        inStockQuantity,
        website: rootUrl.replace("https://", ""),
        date: date.toISOString(),
      };
    });
  };

  const flatten = (arr) => {
    return arr.reduce(function (flat, toFlatten) {
      return flat.concat(
        Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten
      );
    }, []);
  };

  const url = (gameUrlPath, factionCode, raceCode) => {
    const path = [gameUrlPath, factionCode, raceCode].join("/");

    return `${rootUrl}/games-workshop/${path}`;
  };

  const nestedCombinations = games.map((game) =>
    game.factions.map((faction) =>
      faction.races.map((race) => ({ game, faction, race }))
    )
  );
  const combinations = flatten(nestedCombinations);
  for (const { game, faction, race } of combinations) {
    const urlString = url(game.urlPath, faction.urlPath, race.urlPath);
    console.log(urlString);

    const page = await fetch(urlString).then((res) => res.text());
    const content = getProducts(page, game, faction, race);

    console.log(game.title, faction.title, race.title);
    console.log(content.length);
    await insertContent(client, content);

    const duration = Math.floor(Math.random() * 30);
    console.log(`Sleeping for ${duration}s`);

    await sleep(duration);
  }
})();
