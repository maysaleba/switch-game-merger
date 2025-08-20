// Required libraries
const { getGamesEurope, getPrices } = require('nintendo-switch-eshop');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// ===== toggle enrichment here =====
const ENABLE_PRICE_ENRICHMENT = true;

// Delay utility
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Safe POST request with retry logic
async function safePost(url, payload, headers, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await axios.post(url, payload, { headers });
    } catch (err) {
      if (attempt === retries - 1) throw err;
      console.warn(`⚠️ Retry ${attempt + 1}: ${err.message}`);
      await delay(1000);
    }
  }
}

// Title normalization
async function normalizeTitleUS(title) {
  return title
    .replace(/[–—]/g, '-') 
    .replace("ŌKAMI™ HD", "OKAMI HD")
    .replace("Ni No Kuni Remastered: Wrath of the White Witch", "Ni no Kuni: Wrath of the White Witch")
    .replace("BLADECHIMERA","Blade Chimera")
    .replace(/\s*-\s*/g, '-')
    .replace(/[^a-zA-Z0-9\s\-+&Ⅱ]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

async function normalizeTitleEU(title) {
  return title
    .replace(/[–—]/g, '-') 
    .replace("Atelier Ryza: Ever Darkness and the Secret Hideout", "Atelier Ryza: Ever Darkness & the Secret Hideout")
    .replace("Attack on Titan", "A.O.T.")
    .replace("Spiritfarer", "Spiritfarer: Farewell Edition")
    .replace("Ni no Kuni™ II: Revenant Kingdom PRINCE'S EDITION", "Ni no Kuni™ II: Revenant Kingdom - The Prince's Edition")
    .replace(/\s*-\s*/g, '-')
    .replace(/[^a-zA-Z0-9\s\-+&Ⅱ]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

// Fetch US games from Algolia (Deals only, Switch + Switch 2)
async function fetchUSGamesOnSale() {
  console.log('▶️ Starting US games fetch...');
  const indices = ['store_game_en_us_title_asc', 'store_game_en_us_title_des'];
  const headers = {
    'Content-Type': 'application/json',
    'x-algolia-agent': 'Algolia for JavaScript (4.23.2); Browser',
    'x-algolia-application-id': 'U3B6GR4UA3',
    'x-algolia-api-key': 'a29c6927638bfd8cee23993e51e721c9'
  };
  const queryPrefixes = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
  const hitsPerPage = 100;

  async function fetchGroup(index, query) {
    let page = 0, nbPages = 1;
    let groupHits = [];
    let seenNSUIDs = new Set();

    do {
      const payload = {
        query,
        filters: '(corePlatforms:"Nintendo Switch" OR corePlatforms:"Nintendo Switch 2") AND (topLevelFilters:"Deals")',
        hitsPerPage,
        page
      };
      const { data } = await safePost(`https://u3b6gr4ua3-dsn.algolia.net/1/indexes/${index}/query`, payload, headers);
      const hits = data.hits || [];
      nbPages = data.nbPages;

      hits.forEach(hit => {
        if (!seenNSUIDs.has(hit.nsuid)) {
          seenNSUIDs.add(hit.nsuid);
          groupHits.push(hit);
        }
      });

      page++;
    } while (page < nbPages);

    // small pause to be polite
    await delay(150);
    return groupHits;
  }

  const allResults = await Promise.all(
    indices.flatMap(index => queryPrefixes.map(prefix => fetchGroup(index, prefix)))
  );

  const combinedHits = allResults.flat();
  const unique = Array.from(new Map(combinedHits.map(hit => [hit.nsuid, hit])).values());
  console.log(`▶️ Completed US games fetch. Total unique NSUIDs: ${unique.length}`);
  return unique;
}

// Optional price enrichment (does not filter anything)
async function enrichWithPrices(games) {
  console.log('💸 Enriching games with prices...');
  const regionSets = { US: ['US', 'MX', 'BR', 'CA', 'CO', 'AR', 'PE'], EU: ['ZA', 'AU', 'NZ', 'NO', 'PL'] };

  const matched = games.filter(g => g.nsuid_us && g.nsuid_eu);
  const onlyUS  = games.filter(g => g.nsuid_us && !g.nsuid_eu);
  const onlyEU  = games.filter(g => !g.nsuid_us && g.nsuid_eu);

  const chunk = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));

  const fetchPrices = async (gamesSubset, nsuidKey, regions) => {
    for (const region of regions) {
      console.log(`   ↪️ Fetching prices for region ${region} (${gamesSubset.length} games)`);
      const gameChunks = chunk(gamesSubset, 50);
      for (let i = 0; i < gameChunks.length; i++) {
        const batch = gameChunks[i];
        const nsuids = batch.map(g => g[nsuidKey]);
        try {
          const result = await getPrices(region, nsuids);
          for (const price of result.prices || []) {
            const game = batch.find(g => g[nsuidKey] == price.title_id);
            if (!game) continue;
            if (!game.prices) game.prices = {};
            game.prices[region] = {
              regular: price.regular_price?.raw_value || '',
              regular_currency: price.regular_price?.currency || '',
              sale: price.discount_price?.raw_value || '',
              sale_currency: price.discount_price?.currency || '',
              sale_start: price.discount_price?.start_datetime || '',
              sale_end: price.discount_price?.end_datetime || ''
            };
          }
        } catch (err) {
          console.warn(`⚠️ Error fetching prices for ${region}: ${err.message}`);
        }
        console.log(`      ✅ Completed batch ${i + 1}/${gameChunks.length} for ${region}`);
        await delay(300);
      }
    }
  };

  await fetchPrices(matched, 'nsuid_us', regionSets.US);
  await fetchPrices(matched, 'nsuid_eu', regionSets.EU);
  await fetchPrices(onlyUS, 'nsuid_us', regionSets.US);
  await fetchPrices(onlyEU, 'nsuid_eu', regionSets.EU);
  console.log('💸 Price enrichment complete.');
}

// Merge US and EU games
async function mergeGames() {
  console.log('🔄 Fetching US and EU games...');
  const [usGames, euGames] = await Promise.all([fetchUSGamesOnSale(), getGamesEurope()]);
  console.log(`✅ Fetched ${usGames.length} US games and ${euGames.length} EU games.`);

  // US: title -> array of games (keeps multiple platforms with same title)
  const usMap = new Map();
  for (const game of usGames) {
    const title = await normalizeTitleUS(game.title);
    const arr = usMap.get(title) || [];
    arr.push(game);
    usMap.set(title, arr);
  }

  const merged = [];

  console.log('🔄 Matching EU and US games...');
  // IMPORTANT: iterate EU list directly (do NOT collapse to a Map by title)
  for (const euGame of euGames) {
    const baseEUId = (euGame.nsuid_txt || []).find(id => id.startsWith("7001"));
    if (!baseEUId) continue;

    const title = await normalizeTitleEU(euGame.title.trim());
    const usCandidates = usMap.get(title) || [];
    const platformEU = euGame.system_names_txt?.join(', ') || 'Nintendo Switch';

    // Find US game with matching platform
    let matchedUS = null;
    for (let i = 0; i < usCandidates.length; i++) {
      const usCandidate = usCandidates[i];
      const platformUS = usCandidate.platform || 'Nintendo Switch';
      if (platformUS === platformEU) {
        matchedUS = usCandidate;
        // remove matched US so it won't match again
        usCandidates.splice(i, 1);
        break;
      }
    }

    if (matchedUS) {
      merged.push({
        title: matchedUS.title || '',
        nsuid_us: matchedUS.nsuid || '',
        nsuid_eu: baseEUId,
        url: matchedUS.url || '',
        releaseDate: matchedUS.releaseDate || '',
        esrbRating: matchedUS.dlcType || '',
        numberOfPlayers: matchedUS.playerCount || '',
        publisher: matchedUS.softwarePublisher || '',
        image: matchedUS.productImageSquare
          ? `https://images.weserv.nl/?url=${matchedUS.productImageSquare}&w=240`
          : matchedUS.productImage
          ? `https://images.weserv.nl/?url=https://assets.nintendo.com/image/upload/${matchedUS.productImage}&w=240`
          : '',
        slug: matchedUS.urlKey || '',
        genre: Array.isArray(matchedUS.genres) ? matchedUS.genres.join(', ') : '',
        platform: matchedUS.platform || 'Nintendo Switch'
      });
    } else {
      // EU-only
      const slugSuffix = platformEU === 'Nintendo Switch 2' ? '-switch-2' : '-switch';
      merged.push({
        title: euGame.title.trim(),
        nsuid_us: '',
        nsuid_eu: baseEUId,
        url: euGame.url,
        releaseDate: euGame.dates_released_dts?.[0] || '',
        esrbRating: euGame.type === 'DLC' ? 'Individual' : '',
        numberOfPlayers: euGame.players_to,
        publisher: euGame.publisher,
        image: euGame.image_url_sq_s
          ? `https://images.weserv.nl/?url=${euGame.image_url_sq_s}&w=240`
          : '',
        slug: euGame.title.trim().toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') + slugSuffix,
        genre: euGame.pretty_game_categories_txt?.join(', ') || '',
        platform: platformEU
      });
    }

    // Update map with remaining US candidates
    if (usCandidates.length > 0) {
      usMap.set(title, usCandidates);
    } else {
      usMap.delete(title);
    }
  }

  // Add unmatched US games (US-only)
  for (const gamesArr of usMap.values()) {
    for (const game of gamesArr) {
      merged.push({
        title: game.title || '',
        nsuid_us: game.nsuid || '',
        nsuid_eu: '',
        url: game.url || '',
        releaseDate: game.releaseDate || '',
        esrbRating: game.dlcType || '',
        numberOfPlayers: game.playerCount || '',
        publisher: game.softwarePublisher || '',
        image: game.productImageSquare
          ? `https://images.weserv.nl/?url=${game.productImageSquare}&w=240`
          : game.productImage
          ? `https://images.weserv.nl/?url=https://assets.nintendo.com/image/upload/${game.productImage}&w=240`
          : '',
        slug: game.urlKey || '',
        genre: Array.isArray(game.genres) ? game.genres.join(', ') : '',
        platform: game.platform || 'Nintendo Switch'
      });
    }
  }

  // Save JSON
  const outputPath = path.join(__dirname, 'matched_nintendo_games.json');
  fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2));
  console.log(`✅ Saved ${merged.length} entries to`, outputPath);

  // Optionally enrich prices without affecting which entries exist
  if (ENABLE_PRICE_ENRICHMENT) {
    await enrichWithPrices(merged);
    fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2));
    console.log(`✅ Saved ${merged.length} entries with prices to`, outputPath);
  }

  return merged;
}

// Run the merge process
mergeGames().catch(console.error);
