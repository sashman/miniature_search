const { sleep } = require("usleep");
const fetch = require("node-fetch");
const { parse } = require("node-html-parser");
const config = require("./config");
const { Client } = require("@elastic/elasticsearch");
const client = new Client({ node: config.elasticsearch_endpoint });
const { setUpIndex, insertContent, flatten } = require("./common");

const rootUrl = "https://www.waylandgames.co.uk";

(async function main() {
  await setUpIndex(client);

  const games = [
    {
      title: "Warhammer Age of Sigmar",
      factions: [
        {
          title: "Grand Alliance Order",
          urlPath: "2468-order-grand-alliance",
          races: [
            {
              title: "Daughters of Khaine",
              urlPath: "faction-daughters_of_khaine",
            },
            {
              title: "Cities of Sigmar",
              urlPath: "faction-cities_of_sigmar",
              pages: 2,
            },
            { title: "Fyreslayers", urlPath: "faction-fyreslayers" },
            { title: "Idoneth Deepkin", urlPath: "faction-idoneth_deepkin" },
            {
              title: "The Kharadron Overlords",
              urlPath: "faction-kharadron_overlords",
            },
            { title: "Seraphon", urlPath: "faction-seraphon", pages: 2 },
            {
              title: "Stormcast Eternals",
              urlPath: "faction-stormcast_eternals",
              pages: 2,
            },
            { title: "Sylvaneth", urlPath: "faction-sylvaneth" },
          ],
        },
        {
          title: "Grand Alliance Chaos",
          urlPath: "2469-chaos-grand-alliance",
          races: [
            { title: "Beasts of Chaos", urlPath: "faction-beasts_of_chaos" },
            { title: "Creatures of Chaos", urlPath: "faction-beasts_of_chaos" },
            {
              title: "Blades of Khorne",
              urlPath: "faction-blades_of_khorne",
              pages: 2,
            },
            {
              title: "Disciples of Tzeentch",
              urlPath: "faction-disciples_of_tzeentch",
              pages: 2,
            },
            {
              title: "Hedonites of Slaanesh",
              urlPath: "faction-hedonites_of_slaanesh",
            },
            {
              title: "Maggotkin of Nurgle",
              urlPath: "faction-maggotkin_of_nurgle",
            },
            { title: "The Skaven", urlPath: "faction-skaven", pages: 2 },
            {
              title: "Slaves to Darkness",
              urlPath: "faction-everchosen_slaves_to_darkness",
              pages: 2,
            },
          ],
        },
        {
          title: "Grand Alliance Death",
          urlPath: "2471-death-grand-alliance",
          races: [
            {
              title: "Flesh-eater Courts",
              urlPath: "faction-flesh_eater_courts",
            },
            {
              title: "Legions of Nagash",
              urlPath: "faction-legions_of_nagash",
              pages: 2,
            },
            { title: "Nighthaunt", urlPath: "faction-nighthaunt" },
            {
              title: "Ossiarch Bonereapers",
              urlPath: "faction-ossiarch_bonereapers",
            },
          ],
        },
        {
          title: "Grand Alliance Destruction",
          urlPath: "2470-destruction-grand-alliance",
          races: [
            { title: "Gloomspite Gitz", urlPath: "faction-gloomspite_gitz" },
            { title: "Ogor Mawtribes", urlPath: "faction-ogor_mawtribes" },
            {
              title: "Ogor Mawtribes",
              urlPath: "faction-ogor_mawtribes/page-2",
            },
            { title: "Orruk Warclans", urlPath: "faction-orruk_warclans" },
          ],
        },
      ],
    },
    {
      title: "Warhammer 40k",
      factions: [
        {
          title: "Space Marines",
          urlPath: "366-adeptus-astartes-space-marines",
          races: [
            {
              title: "Blood Angels",
              urlPath: "faction-blood_angels",
              pages: 2,
            },
            {
              title: "Dark Angels",
              urlPath: "faction-dark_angels",
            },
            {
              title: "Death Watch",
              urlPath: "faction-deathwatch",
            },
            {
              title: "Grey Knights",
              urlPath: "faction-grey_knights",
            },
            {
              title: "Imperial Fists",
              urlPath: "faction-imperial_fists",
            },
            {
              title: "Salamanders",
              urlPath: "faction-salamanders",
            },
            {
              title: "Space Wolves",
              urlPath: "faction-space_wolves",
              pages: 2,
            },
            {
              title: "Ultramarines",
              urlPath: "faction-ultramarines",
            },
            {
              title: "Space Marines",
              urlPath: "faction-space_marines",
              pages: 5,
            },
          ],
        },
        {
          title: "Armies of the Imperium",
          races: [
            {
              title: "Adepta Sororitas",
              urlPath: "5620-adepta-sororitas",
              pages: 2,
            },
            {
              title: "Adeptus Custodes",
              urlPath:
                "353-warhammer-40000?selected_filters=faction-adeptus_custodes",
            },
            { title: "Adeptus Mechanicus", urlPath: "2224-adeptus-mechanicus" },
            {
              title: "Astra Militarum",
              urlPath: "363-astra-militarum",
              pages: 3,
            },
            { title: "Imperial Knights", urlPath: "375-imperial-knights" },
            { title: "Inquisition", urlPath: "5626-inquisition" },
            {
              title: "Officio Assassinorum",
              urlPath:
                "366-adeptus-astartes-space-marines?selected_filters=faction-officio_assassinorum",
            },
          ],
        },
        {
          title: "Armies of Chaos",
          races: [
            { title: "Chaos Daemons", urlPath: "358-chaos-daemons", pages: 2 },
            {
              title: "Death Guard",
              urlPath:
                "359-chaos-space-marines?selected_filters=faction-death_guard",
            },
            {
              title: "Thousand Sons",
              urlPath:
                "359-chaos-space-marines?selected_filters=faction-thousand_sons",
            },
            {
              title: "Chaos Space Marines",
              urlPath:
                "359-chaos-space-marines?selected_filters=faction-chaos_space_marines",
              pages: 2,
            },
          ],
        },
        {
          title: "Xenos Armies",
          races: [
            {
              title: "Craftworlds",
              urlPath: "362-eldar-craftworlds",
              pages: 3,
            },
            { title: "Drukhari", urlPath: "361-dark-eldar", pages: 2 },
            {
              title: "Genestealer Cults",
              urlPath: "3985-genestealer-cults",
              pages: 2,
            },
            { title: "Harlequins", urlPath: "2179-harlequins" },
            { title: "Necrons", urlPath: "364-necrons", pages: 2 },
            { title: "Orks", urlPath: "365-orks", pages: 2 },
            { title: "T'au Empire", urlPath: "370-tau-empire", pages: 2 },
            { title: "Tyranids", urlPath: "372-tyranids", pages: 2 },
          ],
        },
      ],
    },
    {
      title: "Middle Earth",
      urlPath: "5312-middle-earth-strategy-battle-game",
      factions: [
        {
          title: "The Lord of The Rings Good",
          races: [
            { title: "Arnor", urlPath: "faction-arnor" },
            { title: "Fangorn", urlPath: "faction-fangorn" },
            { title: "Lothlorien", urlPath: "faction-lothlorien" },
            { title: "Minas Tirith", urlPath: "faction-minas_tirith" },
            { title: "Numenor", urlPath: "faction-numenor" },
            { title: "Rivendell", urlPath: "faction-rivendell" },
            { title: "Rohan", urlPath: "faction-rohan" },
            {
              title: "The Dead of Dunharrow",
              urlPath: "faction-the_dead_of_dunharrow",
            },
            { title: "The Fellowship", urlPath: "faction-the_fellowship" },
            { title: "The Fiefdoms", urlPath: "faction-the_fiefdoms" },
            {
              title: "The Kingdom of Khazad-Dum",
              urlPath: "faction-the_kingdom_of_khazad_dum",
            },
            { title: "The Rangers", urlPath: "faction-rangers" },
            { title: "The Shire", urlPath: "faction-the_shire" },
            {
              title: "Wanderers in the Wild",
              urlPath: "faction-wanderers_in_the_wild",
            },
            {
              title: "Wildmen of Druadan",
              urlPath: "faction-wildmen_of_druadan",
            },
          ],
        },
        {
          title: "The Lord of The Rings Evil",
          races: [
            { title: "Angmar", urlPath: "faction-angmar" },
            { title: "Barad-Dur", urlPath: "faction-barad_dur" },
            {
              title: "Corsairs of Umbar",
              urlPath: "faction-corsairs_of_umbar",
            },
            { title: "Far Harad", urlPath: "faction-far_harad" },
            { title: "Isengard", urlPath: "faction-isengard" },
            { title: "Mordor", urlPath: "faction-mordor" },
            { title: "Moria", urlPath: "faction-moria" },
            { title: "Sharkey's Rogues", urlPath: "faction-sharkey_s_rogues" },
            { title: "The Easterlings", urlPath: "faction-the_easterlings" },
            {
              title: "The Serpent Horde",
              urlPath: "faction-the_serpent_horde",
            },
            { title: "Variags of Khand", urlPath: "faction-variags_of_khand" },
          ],
        },
        {
          title: "The Hobbit Good",
          races: [
            { title: "Army of Thror", urlPath: "faction-army_of_thror" },
            { title: "Erebor Reclaimed", urlPath: "faction-erebor_reclaimed" },
            { title: "Garrison of Dale", urlPath: "faction-garrison_of_dale" },
            {
              title: "Halls of Thranduil",
              urlPath: "faction-thranduil_s_halls",
            },
            {
              title: "Radagast's Alliance",
              urlPath: "faction-radagasts_alliance",
            },
            {
              title: "The Army of Lake-town",
              urlPath: "faction-the_army_of_laketown",
            },
            {
              title: "The Survivor's of Lake-town",
              urlPath: "faction-the_survivor_s_of_lake_town",
            },
            { title: "Thorin's Company", urlPath: "faction-thorin_s_company" },
          ],
        },
        {
          title: "The Hobbit Evil",
          races: [
            { title: "Azog's Hunters", urlPath: "faction-azog_s_hunters" },
            { title: "Azog's Legion", urlPath: "faction-azog_s_legion" },
            {
              title: "Dark Powers of Dol Guldur",
              urlPath: "faction-dark_powers_of_dol_guldur",
            },
            {
              title: "Desolator of the North",
              urlPath: "faction-desolator_of_the_north",
            },
            { title: "Goblin Town", urlPath: "faction-goblin_town" },
            {
              title: "The Dark Denizens of Mirkwood",
              urlPath: "faction-the_dark_denizens_of_mirkwood",
            },
          ],
        },
      ],
    },
  ];

  const getProducts = (page, game, faction, race) => {
    const document = parse(page);

    const productNodes = document.querySelectorAll("li.ajax_block_product");
    return productNodes.map((productNode) => {
      const date = new Date();
      const nameNode = productNode.querySelector("a.product-name");
      const name = nameNode.text.trim();
      const imgNode = productNode.querySelector("img.img-responsive");
      const imgSrc = imgNode && imgNode.getAttribute("src");
      const linkNode = productNode.querySelector("a.product_img_link");
      const link = linkNode.getAttribute("href").replace(/\.\.\//g, "");
      const priceNode = productNode.querySelector("span.price");
      const price = priceNode.text
        ? priceNode.text.replace("£", "").trim()
        : null;
      const inStockNode = productNode.querySelector("span.quantity-allowed");
      const inStockText = inStockNode ? inStockNode.text.trim() : "";
      const inStockMatches = inStockText
        ? inStockText.match(/(\d+).*items in stock/)
        : [];
      const inStockQuantity =
        inStockMatches && inStockMatches.length > 0
          ? parseInt(inStockMatches[1])
          : 0;

      return {
        imgSrc,
        link,
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

  const url = (gameUrlPath, factionCode, raceCode, pagePath) => {
    if (!factionCode) {
      return [rootUrl, gameUrlPath, raceCode, pagePath]
        .filter((path) => !!path)
        .join("/");
    }

    const url = `${rootUrl}/${factionCode}?selected_filters=${raceCode}`;
    return pagePath ? `${url}/${pagePath}` : url;
  };

  const pageNumber = (number) =>
    number && number >= 1 ? `page-${number + 1}` : "";

  const nestedCombinations = games.map((game) =>
    game.factions.map((faction) =>
      faction.races.map((race) => ({ game, faction, race }))
    )
  );
  const combinations = flatten(nestedCombinations);
  for (const { game, faction, race } of combinations) {
    const { pages } = race;
    const pagePaths = pages
      ? new Array(pages).fill(undefined).map((page, i) => pageNumber(i))
      : [""];
    for (const pagePath of pagePaths) {
      const urlString = url(
        game.urlPath,
        faction.urlPath,
        race.urlPath,
        pagePath
      );
      console.log(urlString);

      const page = await fetch(urlString).then((res) => res.text());
      const content = getProducts(page, game, faction, race);

      console.log(game.title, faction.title, race.title);
      console.log(content.length);
      // await insertContent(client, content);

      const duration = Math.floor(Math.random() * 30);
      console.log(`Sleeping for ${duration}s`);

      await sleep(duration);
    }
  }
})();
