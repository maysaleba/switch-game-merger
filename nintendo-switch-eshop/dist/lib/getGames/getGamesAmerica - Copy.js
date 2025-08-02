"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGamesAmerica = void 0;
const fetch_1 = require("@sapphire/fetch");
const querystring_1 = require("querystring");
const constants_1 = require("../utils/constants");
const utils_1 = require("../utils/utils");
/**
 * Fetches all games on american e-shops
 *
 * @remarks
 * Currently ONLY returns all games in the e-shop
 *
 * @returns Promise containing all the games
 */
const getGamesAmerica = async () => {
    const page = 0;
    const baseParameters = {
        hitsPerPage: US_GAME_LIST_LIMIT,
        page,
        analytics: false,
        facets: US_FACETS,
    };
    const requests = [];

 
  //   requests.push({
  // indexName:"store_game_en_us", 
  // params: "hitsPerPage=500&facetFilters=%5B%22topLevelFilters%3ADeals%22%5D"
  //   });

    


  // //       for (const rating of US_TOPLEVEL_FILTER) {
  // //       requests.push({
  // //           indexName: US_INDEX_TITLE_ASC,
  // //           params: (0, querystring_1.stringify)({ ...baseParameters, facetFilters: `[["${rating}"],["${US_PLATFORM_FACET_FILTER}"]]` })
  // //       }, {
  // //           indexName: US_INDEX_TITLE_DESC,
  // //           params: (0, querystring_1.stringify)({ ...baseParameters, facetFilters: `[["${rating}"],["${US_PLATFORM_FACET_FILTER}"]]` })
  // //       });
  // //   }

    for (const rating of US_ESRB_RATINGS_FILTERS) {
        requests.push({
            indexName: US_INDEX_TITLE_ASC,
            params: (0, querystring_1.stringify)({ ...baseParameters, facetFilters: `[["${rating}"],["${US_TOPLEVEL_FILTER}"],["${US_SALEPRICE_FILTER}"],["${US_PLATFORM_FILTER}"]]` })
        }, {
            indexName: US_INDEX_TITLE_DESC,
            params: (0, querystring_1.stringify)({ ...baseParameters, facetFilters: `[["${rating}"],["${US_TOPLEVEL_FILTER}"],["${US_SALEPRICE_FILTER}"],["${US_PLATFORM_FILTER}"]]` })
        });
    }
    for (const rating of US_AVAILABILITY_FILTER) {
        requests.push({
            indexName: US_INDEX_TITLE_ASC,
            params: (0, querystring_1.stringify)({ ...baseParameters, facetFilters: `[["${rating}"],["${US_TOPLEVEL_FILTER}"],["${US_SALEPRICE_FILTER}"],["${US_PLATFORM_FILTER}"]]` })
        }, {
            indexName: US_INDEX_TITLE_DESC,
            params: (0, querystring_1.stringify)({ ...baseParameters, facetFilters: `[["${rating}"],["${US_TOPLEVEL_FILTER}"],["${US_SALEPRICE_FILTER}"],["${US_PLATFORM_FILTER}"]]` })
        });
    }
    for (const rating of US_COMMON_GAME_FRANCHISES) {
        requests.push({
            indexName: US_INDEX_TITLE_ASC,
            params: (0, querystring_1.stringify)({ ...baseParameters, facetFilters: `[["${rating}"],["${US_TOPLEVEL_FILTER}"],["${US_SALEPRICE_FILTER}"],["${US_PLATFORM_FILTER}"]]` })
        }, {
            indexName: US_INDEX_TITLE_DESC,
            params: (0, querystring_1.stringify)({ ...baseParameters, facetFilters: `[["${rating}"],["${US_TOPLEVEL_FILTER}"],["${US_SALEPRICE_FILTER}"],["${US_PLATFORM_FILTER}"]]` })
        });
    }

  //AM   console.log(requests);


    const requestOptions = {
        body: JSON.stringify({
            requests
        }),
        method: 'POST',
        headers: constants_1.US_ALGOLIA_HEADERS
    };

  //AM  console.log(requestOptions);
    try {
        const gamesResponse = await (0, fetch_1.fetch)(constants_1.US_GET_GAMES_URL, requestOptions, "json" /* JSON */);
        let allGames = [];
        for (const results of gamesResponse.results) {
            // console.log(results)
            allGames = allGames.concat(results.hits);
        }
        allGames = (0, utils_1.arrayRemoveDuplicates)(allGames, 'urlKey');
        return allGames;
    }
    catch (err) {
        if (/(?:US_games_request_failed)/i.test(err.message)) {
            throw new utils_1.EshopError('Fetching of US Games failed');
        }
        throw err;
    }
};
exports.getGamesAmerica = getGamesAmerica;
/** @internal The maximum number of entries that Nintendo lets us get in 1 request for US games */
const US_GAME_LIST_LIMIT = 1000;
/** @internal Index names for querying all games by ascending title */
const US_INDEX_TITLE_ASC = 'store_game_en_us_title_asc';
/** @internal Index names for querying all games by descending title */
const US_INDEX_TITLE_DESC = 'store_game_en_us_title_des';
/** @internal Static query parameters for facets/filters in US Algolia calls */
const US_FACETS = JSON.stringify([
    'generalFilters',
    'platform',
    'availability',
    'genres',
    'howToShop',
    'virtualConsole',
    'franchises',
    'priceRange',
    'esrbRating',
    'playerFilters',
    'dlcType',
]);
/** @internal */
const US_PLATFORM_FACET_FILTER = 'platformCode:Nintendo Switch';
/** @internal ESRB options for querying all games in one request */
const US_ESRB_RATINGS_FILTERS = ['esrbRating:E', 'esrbRating:E10', 'esrbRating:E10-T','esrbRating:E10_T', 'esrbRating:T', 'esrbRating:M'];
/** @internal Availability filters for querying all games in one request */
const US_AVAILABILITY_FILTER = ['availability:Pre-order', 'availability:Coming soon', 'availability:Available now'];
/** @internal Common franchises for querying all games in one request */
const US_COMMON_GAME_FRANCHISES = ['franchises:Mario', 'franchises:Zelda', 'franchises:Pokémon', 'franchises:Kirby'];
/** @internal */
const US_TOPLEVEL_FILTER = ['topLevelFilters:Deals'];
const US_SALEPRICE_FILTER = ['salePrice:-null'];
const US_PLATFORM_FILTER = ['corePlatforms:Nintendo Switch']
//# sourceMappingURL=getGamesAmerica.js.map