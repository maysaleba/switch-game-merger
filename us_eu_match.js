// Required libraries
const { getGamesEurope, getPrices } = require('nintendo-switch-eshop');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch'); 
const axios = require('axios'); 

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

async function normalizeTitleUS(title) {
  return title
    .replace(/[–—]/g, '-') 
    .replace("ŌKAMI™ HD", "OKAMI HD")
    .replace("Ni No Kuni Remastered: Wrath of the White Witch", "Ni no Kuni: Wrath of the White Witch")
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

async function fetchUSGamesOnSale() {
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
    console.log(`▶️ Fetching index: ${index}, prefix: "${query}"`);
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

      console.log(`   ↪️ Page ${page + 1}/${nbPages} - ${hits.length} hits returned`);
      hits.forEach(hit => {
        if (!seenNSUIDs.has(hit.nsuid)) {
          seenNSUIDs.add(hit.nsuid);
          groupHits.push(hit);
        }
      });

      await delay(150);
      page++;
    } while (page < nbPages);

    return groupHits;
  }

  const allResults = await Promise.all(
    indices.flatMap(index => queryPrefixes.map(prefix => fetchGroup(index, prefix)))
  );

  const combinedHits = allResults.flat();
  return Array.from(new Map(combinedHits.map(hit => [hit.nsuid, hit])).values());
}

async function mergeGames() {
  const [usGames, euGames] = await Promise.all([fetchUSGamesOnSale(), getGamesEurope()]);

  // Store arrays per normalized title (avoid overwriting)
  const usMap = new Map();
  for (const game of usGames) {
    const key = await normalizeTitleUS(game.title);
    if (!usMap.has(key)) usMap.set(key, []);
    const arr = usMap.get(key);
    if (!arr.some(g => g.nsuid === game.nsuid)) arr.push(game); // prevent true duplicates
  }

  const euMap = new Map();
  for (const game of euGames) {
    const key = await normalizeTitleEU(game.title.trim());
    if (!euMap.has(key)) euMap.set(key, []);
    const arr = euMap.get(key);
    const nsuidList = game.nsuid_txt || [];
    if (!arr.some(g => (g.nsuid_txt || []).some(id => nsuidList.includes(id)))) {
      arr.push(game); // prevent true duplicates
    }
  }

  const merged = [];

  const chunk = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));

  const enrichWithPrices = async (games) => {
    const regionSets = {
      US: ['US', 'MX', 'BR', 'CA', 'CO', 'AR', 'PE'],
      EU: ['ZA', 'AU', 'NZ', 'NO', 'PL']
    };

    const matched = games.filter(g => g.nsuid_us && g.nsuid_eu);
    const onlyUS = games.filter(g => g.nsuid_us && !g.nsuid_eu);
    const onlyEU = games.filter(g => !g.nsuid_us && g.nsuid_eu);

    const fetchPrices = async (gamesSubset, nsuidKey, regions) => {
      for (const region of regions) {
        let batchIndex = 0;
        const gameChunks = chunk(gamesSubset, 50);
        for (const batch of gameChunks) {
          batchIndex++;
          console.log(`💸 getPrices for region ${region} – batch ${batchIndex}/${gameChunks.length}`);
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
          await delay(300);
        }
      }
    };

    await fetchPrices(matched, 'nsuid_us', regionSets.US);
    await fetchPrices(matched, 'nsuid_eu', regionSets.EU);
    await fetchPrices(onlyUS, 'nsuid_us', regionSets.US);
    await fetchPrices(onlyEU, 'nsuid_eu', regionSets.EU);
  };

  console.log(`🔄 Matching EU and US games...`);
  for (const [title, euGamesArr] of euMap.entries()) {
    const baseEUGames = euGamesArr.filter(euGame =>
      (euGame.nsuid_txt || []).some(id => id.startsWith("7001"))
    );
    if (baseEUGames.length === 0) continue;

    const usGamesArr = usMap.get(title) || [];

    if (usGamesArr.length > 0) {
      for (const euGame of baseEUGames) {
        for (const usGame of usGamesArr) {
          merged.push({
            title: usGame.title || '',
            nsuid_us: usGame.nsuid || '',
            nsuid_eu: (euGame.nsuid_txt || []).find(id => id.startsWith("7001")),
            url: usGame.url || '',
            releaseDate: usGame.releaseDate || '',
            esrbRating: usGame.dlcType || '',
            numberOfPlayers: usGame.playerCount || '',
            publisher: usGame.softwarePublisher || '',
            image: usGame.productImageSquare
              ? `https://images.weserv.nl/?url=${usGame.productImageSquare}&w=240`
              : usGame.productImage
              ? `https://images.weserv.nl/?url=https://assets.nintendo.com/image/upload/${usGame.productImage}&w=240`
              : '',
            slug: usGame.urlKey || '',
            genre: Array.isArray(usGame.genres) ? usGame.genres.join(', ') : '',
            platform: usGame.platform || 'Nintendo Switch'
          });
        }
      }
      usMap.delete(title);
    } else {
      for (const euGame of baseEUGames) {
        const platform = euGame.system_names_txt?.join(', ') || 'Nintendo Switch';
        const slugSuffix = platform === 'Nintendo Switch 2' ? '-switch-2' : '-switch';
        merged.push({
          title: euGame.title.trim(),
          nsuid_us: '',
          nsuid_eu: (euGame.nsuid_txt || []).find(id => id.startsWith("7001")),
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
          platform
        });
      }
    }
  }

  console.log(`📦 Adding unmatched US games...`);
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

  const outputPath = path.join(__dirname, 'matched_nintendo_games.json');
  fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2));
  await enrichWithPrices(merged);
  fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2));
  console.log(`✅ Saved ${merged.length} entries to`, outputPath);

  const slugCounts = merged.reduce((acc, game) => {
    if (!game.slug) return acc;
    acc[game.slug] = (acc[game.slug] || 0) + 1;
    return acc;
  }, {});

  const duplicates = Object.entries(slugCounts).filter(([slug, count]) => count > 1);
  if (duplicates.length > 0) {
    console.warn('❗ Duplicate slugs found:');
    duplicates.forEach(([slug, count]) => {
      console.warn(`- ${slug} (${count} times)`);
    });
  } else {
    console.log('✅ All slugs are unique.');
  }

  const csvPath = path.join(__dirname, 'matched_nintendo_games.csv');
  const headers = [
    'title', 'slug', 'nsuid_us', 'nsuid_eu', 'url', 'releaseDate', 'esrbRating',
    'numberOfPlayers', 'publisher', 'platform', 'genre', 'image', 'price_regions'
  ];
  const csvRows = [headers.join(',')];

  for (const game of merged) {
    const row = headers.map(key => {
      if (key === 'price_regions') {
        return '"' + JSON.stringify(game.prices || {}).replace(/"/g, '""') + '"';
      }
      const value = game[key] || '';
      return '"' + value.toString().replace(/"/g, '""') + '"';
    });
    csvRows.push(row.join(','));
  }

  fs.writeFileSync(csvPath, '﻿' + csvRows.join('\n'), 'utf8');
  console.log(`📄 CSV file saved to`, csvPath);

  return merged;
}

// Run the merge process
mergeGames().catch(console.error);
