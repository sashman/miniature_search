const puppeteer = require("puppeteer");
const { sleep } = require("usleep");
const { Client } = require("@elastic/elasticsearch");
const config = require("./config");
const client = new Client({ node: config.elasticsearch_endpoint });
const { setUpIndex, insertContent, flatten } = require("./common");

const chromeOptions = {
  headless: false,
  defaultViewport: null,
};
const rootUrl = "https://www.games-workshop.com";

(async function main() {
  await setUpIndex(client);

  const games = [
    {
      title: "Warhammer Age of Sigmar",
      urlPath: "Warhammer-Age-of-Sigmar",
      factions: [
        {
          title: "Grand Alliance Order",
          code: 647457687,
          races: [
            { title: "Daughters of Khaine", code: 3368940575 },
            { title: "Cities of Sigmar", code: 78046592 },
            { title: "Fyreslayers", code: 2637716271 },
            { title: "Idoneth Deepkin", code: 440116515 },
            { title: "The Kharadron Overlords", code: 648148254 },
            { title: "Seraphon", code: 2384028138 },
            { title: "Stormcast Eternals", code: 3885722559 },
            { title: "Sylvaneth", code: 4201278636 },
          ],
        },
        {
          title: "Grand Alliance Chaos",
          code: 647457687,
          races: [
            { title: "Beasts of Chaos", code: 369862654 },
            { title: "Blades of Khorne", code: 2779910718 },
            { title: "Disciples of Tzeentch", code: 29455742 },
            { title: "Hedonites of Slaanesh", code: 3100048979 },
            { title: "Maggotkin of Nurgle", code: 1773069611 },
            { title: "The Skaven", code: 240928432 },
            { title: "Slaves to Darkness", code: 4166110358 },
          ],
        },
        {
          title: "Grand Alliance Death",
          code: 647457687,
          races: [
            { title: "Flesh-eater Courts", code: 2334164140 },
            { title: "Legions of Nagash", code: 3737089001 },
            { title: "Nighthaunt", code: 3382336861 },
            { title: "Ossiarch Bonereapers", code: 2606784113 },
          ],
        },
        {
          title: "Grand Alliance Destruction",
          code: 647457687,
          races: [
            { title: "Gloomspite Gitz", code: 4153400398 },
            { title: "Ogor Mawtribes", code: 3106218210 },
            { title: "Orruk Warclans", code: 397335562 },
          ],
        },
      ],
    },
    {
      title: "Warhammer 40k",
      urlPath: "Warhammer-40-000",
      factions: [
        {
          title: "Space Marines",
          code: 1125463923,
          races: [
            { title: "Black Templars", code: 3984380624 },
            { title: "Blood Angels", code: 1320453649 },
            { title: "Dark Angels", code: 1176910732 },
            { title: "Death Watch", code: 49637768 },
            { title: "Grey Knights", code: 3927560896 },
            { title: "Imperial Fists", code: 1915851837 },
            { title: "Iron Hands", code: 2509539302 },
            { title: "Raven Guard", code: 1252943013 },
            { title: "Salamanders", code: 1953378169 },
            { title: "Space Wolves", code: 2160870842 },
            { title: "Ultramarines", code: 2317334297 },
            { title: "White Scars", code: 1504000890 },
            { title: "Space Marines", code: 3694373482 },
          ],
        },
        {
          title: "Armies of the Imperium",
          code: 1125463923,
          races: [
            { title: "Adepta Sororitas", code: 3639190268 },
            { title: "Adeptus Custodes", code: 2129893125 },
            { title: "Adeptus Mechanicus", code: 1001313688 },
            { title: "Astra Militarum", code: 1138996955 },
            { title: "Imperial Knights", code: 725436515 },
            { title: "Inquisition", code: 2964486909 },
            { title: "Officio Assassinorum", code: 1464247808 },
            { title: "Sisters of Silence", code: 48449630 },
            { title: "Sisters of Silence", code: 48449630 },
          ],
        },
        {
          title: "Armies of Chaos",
          code: 1125463923,
          races: [
            { title: "Chaos Daemons", code: 1026809784 },
            { title: "Chaos Knights", code: 1119178932 },
            { title: "Chaos Knights", code: 1119178932 },
            { title: "Death Guard", code: 1136794560 },
            { title: "Thousand Sons", code: 3002274332 },
            { title: "Chaos Space Marines", code: 2590967967 },
          ],
        },
        {
          title: "Xenos Armies",
          code: 1125463923,
          races: [
            { title: "Craftworlds", code: 1525056197 },
            { title: "Drukhari", code: 1816839857 },
            { title: "Genestealer Cults", code: 4251244224 },
            { title: "Harlequins", code: 1869042830 },
            { title: "Necrons", code: 2529025757 },
            { title: "Orks", code: 854227620 },
            { title: "T'au Empire", code: 1465328448 },
            { title: "Tyranids", code: 77492817 },
            { title: "Ynnari", code: 1428264715 },
          ],
        },
      ],
    },
    {
      title: "Middle Earth",
      urlPath: "Middle-earth",
      factions: [
        {
          title: "The Lord of The Rings Good",
          code: 803593788,
          races: [
            { title: "Arnor", code: 4282253952 },
            { title: "Fangorn", code: 1974806405 },
            { title: "Lothlorien", code: 3170377236 },
            { title: "Minas Tirith", code: 3603911447 },
            { title: "Numenor", code: 40172830 },
            { title: "Rivendell", code: 1464530407 },
            { title: "Rohan", code: 2072628847 },
            { title: "The Dead of Dunharrow", code: 1601041306 },
            { title: "The Fellowship", code: 3204586535 },
            { title: "The Fiefdoms", code: 3669749310 },
            { title: "The Kingdom of Khazad-Dum", code: 1641354008 },
            { title: "The Misty Mountains", code: 3488598518 },
            { title: "The Rangers", code: 376662545 },
            { title: "The Shire", code: 2991458413 },
            { title: "Wanderers in the Wild", code: 1203758476 },
            { title: "Wildmen of Druadan", code: 1133777571 },
          ],
        },
        {
          title: "The Lord of The Rings Evil",
          code: 803593788,
          races: [
            { title: "Angmar", code: 2829903466 },
            { title: "Barad-Dur", code: 3565368400 },
            { title: "Corsairs of Umbar", code: 2487733124 },
            { title: "Far Harad", code: 3589513359 },
            { title: "Isengard", code: 4186395242 },
            { title: "Mordor", code: 11716117 },
            { title: "Moria", code: 2500882905 },
            { title: "Sharkey's Rogues", code: 1923260128 },
            { title: "The Easterlings", code: 593210862 },
            { title: "The Serpent Horde", code: 2573189070 },
            { title: "Variags of Khand", code: 3770274325 },
          ],
        },
        {
          title: "The Hobbit Good",
          code: 803593788,
          races: [
            { title: "Army of Thror", code: 2271199794 },
            { title: "Erebor Reclaimed", code: 3310385661 },
            { title: "Garrison of Dale", code: 1820039401 },
            { title: "Halls of Thranduil", code: 4187266412 },
            { title: "Radagast's Alliance", code: 4180820229 },
            { title: "The Army of Lake-town", code: 3635086209 },
            { title: "The Survivor's of Lake-town", code: 158949844 },
            { title: "Thorin's Company", code: 3928493191 },
          ],
        },
        {
          title: "The Hobbit Evil",
          code: 803593788,
          races: [
            { title: "Azog's Hunters", code: 4156911894 },
            { title: "Azog's Legion", code: 871944671 },
            { title: "Dark Powers of Dol Guldur", code: 656227902 },
            { title: "Desolator of the North", code: 2972630186 },
            { title: "Goblin Town", code: 1802079501 },
            { title: "The Dark Denizens of Mirkwood", code: 3664104166 },
            { title: "The Trolls", code: 2386484654 },
          ],
        },
      ],
    },
  ];

  const getProducts = async (page, game, faction, race) => {
    await console.log(url(game.urlPath, faction.code, race.code));

    await page.goto(url(game.urlPath, faction.code, race.code));
    await page.waitForSelector("ul.product-grid");

    return page.evaluate(
      (game, faction, race, rootUrl) => {
        const productNodes = document.querySelectorAll("li.product-item");
        return Object.values(productNodes).map((productNode) => {
          const date = new Date();
          const nameNode = productNode.querySelector("a.product-item__name");

          const gtmProductfieldobject = nameNode.getAttribute(
            "data-gtm-productfieldobject"
          );
          const { quantity, price, name, id, category } = JSON.parse(
            gtmProductfieldobject
          );
          const categories = category.split("|");
          return {
            imgSrc: productNode
              .querySelector(".product-item__image > img")
              .getAttribute("src"),
            link: `${rootUrl}${nameNode.getAttribute("href")}`,
            title: nameNode.innerText.trim(),
            game: game.title,
            faction: faction.title,
            race: race.title,
            quantity,
            price,
            name,
            id,
            categories,
            website: rootUrl.replace("https://", ""),
            date: date.toISOString(),
          };
        });
      },
      game,
      faction,
      race,
      rootUrl
    );
  };

  const url = (gameUrlPath, factionCode, raceCode) =>
    `${rootUrl}/en-GB/${gameUrlPath}?N=${factionCode}+${raceCode}&view=all`;

  try {
    const browser = await puppeteer.launch(chromeOptions);
    const page = await browser.newPage();

    const nestedCombinations = games.map((game) =>
      game.factions.map((faction) =>
        faction.races.map((race) => ({ game, faction, race }))
      )
    );
    const combinations = flatten(nestedCombinations);
    for (const combination of combinations) {
      const content = await getProducts(
        page,
        combination.game,
        combination.faction,
        combination.race
      );

      console.log(
        combination.game.title,
        combination.faction.title,
        combination.race.title
      );
      console.log(content.length);
      await insertContent(client, content);

      const duration = Math.floor(Math.random() * 30);
      console.log(`Sleeping for ${duration}s`);

      await sleep(duration);
    }

    await browser.close();
  } catch (error) {
    console.error(error);
  }
})();
