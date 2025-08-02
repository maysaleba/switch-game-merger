const fs = require('fs');
const XLSX = require('xlsx');
const dayjs = require('dayjs');
const path = require('path');
const stringSimilarity = require('string-similarity');

// Load game and HLTB data
const data = JSON.parse(fs.readFileSync('matched_nintendo_games.json', 'utf8'));
const hltbData = JSON.parse(fs.readFileSync('hltb.json', 'utf8'));

// Match HLTB info by fuzzy title
function matchHLTB(title, hltbData) {
  const cleanedTitle = title
    .replace("CRISIS CORE –FINAL FANTASY VII– REUNION", "CRISIS CORE: FINAL FANTASY VII REUNION")
    .replace("Prince of Persia The Lost Crown", "Prince of Persia: The Lost Crown")
    .replace(/[^a-zA-Z0-9:+ ]/g, '')
    .trim()
    .toLowerCase();

  let bestScore = 0;
  let bestMatch = null;

  for (const hltb of hltbData) {
    const hltbTitle = hltb.game_name.replace(/[^a-zA-Z0-9:+ ]/g, '').trim().toLowerCase();
    const similarity = stringSimilarity.compareTwoStrings(cleanedTitle, hltbTitle);
    if (similarity > bestScore) {
      bestScore = similarity;
      bestMatch = hltb;
    }
    if (similarity === 1) break;
  }

  if (bestMatch && bestScore >= 0.9) {
    return {
      MainStory: Math.round(bestMatch.comp_main / 3600),
      MainExtra: Math.round(bestMatch.comp_plus / 3600),
      Completionist: Math.round(bestMatch.comp_100 / 3600),
      LowestPrice: `/game/${bestMatch.game_id}`
    };
  }

  return {
    MainStory: '',
    MainExtra: '',
    Completionist: '',
    LowestPrice: ''
  };
}

(async () => {
  const enrichedResults = await Promise.all(data.map(async (game, index) => {
    if (!game.prices) return null;

    const prices = game.prices;
    const getSafe = (region, key) => prices?.[region]?.[key] || '';

    const saleEndsDates = Object.values(prices)
      .map(p => p.sale_end)
      .filter(Boolean)
      .map(d => dayjs(d));

    const saleStartsDates = Object.values(prices)
      .map(p => p.sale_start)
      .filter(Boolean)
      .map(d => dayjs(d));

    if (saleEndsDates.length === 0 || saleStartsDates.length === 0) return null;

    const latestSaleEnd = saleEndsDates.sort((a, b) => b - a)[0].format('YYYY-MM-DD');
    const earliestSaleStart = saleStartsDates.sort((a, b) => a - b)[0].format('YYYY-MM-DD');

    const usSaleRaw = getSafe('US', 'sale');
    const usRegularRaw = getSafe('US', 'regular');
    const auSaleRaw = getSafe('AU', 'sale');
    const auRegularRaw = getSafe('AU', 'regular');
    const zaSaleRaw = getSafe('ZA', 'sale');
    const zaRegularRaw = getSafe('ZA', 'regular');

    const usSale = parseFloat(usSaleRaw);
    const usRegular = parseFloat(usRegularRaw);
    const auSale = parseFloat(auSaleRaw);
    const auRegular = parseFloat(auRegularRaw);
    const zaSale = parseFloat(zaSaleRaw);
    const zaRegular = parseFloat(zaRegularRaw);

    const salePrice = usSaleRaw || '';

    let percentOff = '0%';
    if (!isNaN(usSale) && !isNaN(usRegular) && usRegular > 0) {
      percentOff = `${Math.round((1 - usSale / usRegular) * 100)}%`;
    } else if (!isNaN(auSale) && !isNaN(auRegular) && auRegular > 0) {
      percentOff = `${Math.round((1 - auSale / auRegular) * 100)}%`;
    } else if (!isNaN(zaSale) && !isNaN(zaRegular) && zaRegular > 0) {
      percentOff = `${Math.round((1 - zaSale / zaRegular) * 100)}%`;
    }

    const hltbMatch = matchHLTB(game.title || '', hltbData);

    console.log(`🔍 [${index + 1}/${data.length}] Processed: ${game.title}`);

    return {
      Title: game.title || '',
      SalePrice: salePrice,
      PercentOff: percentOff,
      SaleEnds: latestSaleEnd,
      URL: game.url || '',
      ReleaseDate: game.releaseDate || '',
      ESRBRating: game.esrbRating || '',
      NumberofPlayers: game.numberOfPlayers || '',
      Publisher: game.publisher || '',
      Price: usRegularRaw || auRegularRaw || zaRegularRaw || '',
      LowestPrice: hltbMatch.LowestPrice,
      SaleStarted: earliestSaleStart,
      Image: game.image || '',
      Slug: game.slug || '',
      MexPrice: (game.image || '').replace('https://images.weserv.nl/?url=', '').replace('&w=240', ''),
      MexicoPrice: getSafe('MX', 'sale'),
      BrazilPrice: getSafe('BR', 'sale'),
      CanadaPrice: getSafe('CA', 'sale'),
      ColombiaPrice: getSafe('CO', 'sale'),
      ArgentinaPrice: getSafe('AR', 'sale'),
      NewZealandPrice: getSafe('NZ', 'sale'),
      PeruPrice: getSafe('PE', 'sale'),
      PolandPrice: getSafe('PL', 'sale'),
      NorwayPrice: getSafe('NO', 'sale'),
      SouthafricaPrice: getSafe('ZA', 'sale'),
      AustraliaPrice: getSafe('AU', 'sale'),
      SCORE: '',
      genre: game.genre || '',
      description: '',
      platform: game.platform || '',
      MainStory: hltbMatch.MainStory,
      MainExtra: hltbMatch.MainExtra,
      Completionist: hltbMatch.Completionist
    };
  }));

  const result = enrichedResults.filter(Boolean);

  const worksheet = XLSX.utils.json_to_sheet(result);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

  const outputPath = path.join(__dirname, 'converted_report3.xlsx');
  XLSX.writeFile(workbook, outputPath);

  console.log(`✅ Report saved to converted_report3.xlsx with ${result.length} entries.`);
})();
