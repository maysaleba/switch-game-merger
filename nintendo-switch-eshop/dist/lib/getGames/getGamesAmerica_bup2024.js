"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGamesAmerica = void 0;
const fetch_1 = require("@sapphire/fetch");
const querystring_1 = require("querystring");
const constants_1 = require("../utils/constants");
const utils_1 = require("../utils/utils");

/**
 * Fetches all games on American e-shops
 *
 * @remarks
 * Currently ONLY returns all games in the e-shop
 *
 * @returns Promise containing all the games
 */
const getGamesAmerica = async () => {
    const baseParameters = {
        hitsPerPage: US_GAME_LIST_LIMIT,
        page: 0,
        analytics: false,
        facets: US_FACETS,
    };

    const filters = [
        ...US_ESRB_RATINGS_FILTERS,
        ...US_AVAILABILITY_FILTER,
        ...US_COMMON_GAME_FRANCHISES,
        // ...US_PRICE_RANGE,
        ...US_GENRES,
    ];

    // Prepare US requests
    const usRequests = filters.map((rating) => [
        {
            indexName: US_INDEX_TITLE_ASC,
            params: (0, querystring_1.stringify)({
                ...baseParameters,
                facetFilters: `[["${rating}"],["${US_TOPLEVEL_FILTER}"],["${US_SALEPRICE_FILTER}"],["${US_PLATFORM_FILTER}"]]`
            })
        },
        {
            indexName: US_INDEX_TITLE_DESC,
            params: (0, querystring_1.stringify)({
                ...baseParameters,
                facetFilters: `[["${rating}"],["${US_TOPLEVEL_FILTER}"],["${US_SALEPRICE_FILTER}"],["${US_PLATFORM_FILTER}"]]`
            })
        }
    ]).flat();  // Flatten array of arrays

    // Prepare ES_CO requests
    const esCoRequests = filters.map((rating) => [
        {
            indexName: ES_CO_INDEX_TITLE_ASC,
            params: (0, querystring_1.stringify)({
                ...baseParameters,
                facetFilters: `[["${rating}"],["${ES_TOPLEVEL_FILTER}"],["${US_SALEPRICE_FILTER}"],["${US_PLATFORM_FILTER}"]]`
            })
        },
        {
            indexName: ES_CO_INDEX_TITLE_DESC,
            params: (0, querystring_1.stringify)({
                ...baseParameters,
                facetFilters: `[["${rating}"],["${ES_TOPLEVEL_FILTER}"],["${US_SALEPRICE_FILTER}"],["${US_PLATFORM_FILTER}"]]`
            })
        }
    ]).flat();  // Flatten array of arrays

    // Request options for US games
    const usRequestOptions = {
        body: JSON.stringify({ requests: usRequests }),
        method: 'POST',
        headers: constants_1.US_ALGOLIA_HEADERS,
    };

    // Request options for ES_CO games
    const esCoRequestOptions = {
        body: JSON.stringify({ requests: esCoRequests }),
        method: 'POST',
        headers: constants_1.US_ALGOLIA_HEADERS,
    };

    try {
        // Fetch US games
        const usGamesResponse = await (0, fetch_1.fetch)(constants_1.US_GET_GAMES_URL, usRequestOptions, "json");
        let allGames = [];
        for (const results of usGamesResponse.results) {
            allGames = allGames.concat(results.hits);
        }

        // Fetch ES_CO games
        const esCoGamesResponse = await (0, fetch_1.fetch)(constants_1.US_GET_GAMES_URL, esCoRequestOptions, "json");
        for (const results of esCoGamesResponse.results) {
            allGames = allGames.concat(results.hits);
        }

        // Remove duplicates by 'urlKey'
        allGames = (0, utils_1.arrayRemoveDuplicates)(allGames, 'urlKey');
        return allGames;
    } catch (err) {
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
/** @internal Index names for querying all games in the ES_CO region by ascending title */
const ES_CO_INDEX_TITLE_ASC = 'store_game_es_co_title_asc';
/** @internal Index names for querying all games in the ES_CO region by descending title */
const ES_CO_INDEX_TITLE_DESC = 'store_game_es_co_title_des';
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
/** @internal ESRB options for querying all games in one request */
const US_ESRB_RATINGS_FILTERS = ['esrbRating:E', 'esrbRating:E10', 'esrbRating:e10', 'esrbRating:E10-T','esrbRating:E10_T', 'esrbRating:T', 'esrbRating:M',  'esrbRating:-*', '-esrbRating:*'];
/** @internal Availability filters for querying all games in one request */
const US_AVAILABILITY_FILTER = ['availability:Pre-order', 'availability:Coming soon', 'availability:Available now'];
/** @internal Common franchises for querying all games in one request */
const US_COMMON_GAME_FRANCHISES = ['franchises:Mario', 'franchises:Zelda', 'franchises:Pokémon', 'franchises:Kirby'];
// const US_PRICE_RANGE = ['Free to start', '$0 - $4.99', '$5 - $9.99', '$10 - $19.99', '$20 - $39.99', '$40'];
const US_GENRES = ['genres:Action', 'genres:Adventure', 'genres:Arcade', 'genres:Board game', 'genres:Education', 'genres:Fighting', 'genres:First-Person', 'genres:Lifestyle', 'genres:Multiplayer', 'genres:Music', 'genres:Other', 'genres:Party', 'genres:Platformer', 'genres:Practical', 'genres:Puzzle', 'genres:Racing', 'genres:Role-playing', 'genres:Simulation', 'genres:Sports', 'genres:Training', 'genres:Utility', 'genres:Video'];
// const US_GENRES_1 = ['genres:Action', 'genres:Adventure', 'genres:Arcade', 'genres:Board game', 'genres:Education', 'genres:Fighting', 'genres:First-Person', 'genres:Lifestyle'];
// const US_GENRES_2 = ['genres:Multiplayer', 'genres:Music', 'genres:Other', 'genres:Party', 'genres:Platformer', 'genres:Practical', 'genres:Puzzle', 'genres:Racing'];
// const US_GENRES_3 = ['genres:Role-playing', 'genres:Simulation', 'genres:Sports', 'genres:Training', 'genres:Utility', 'genres:Video'];
// const US_GENRES = ['genres:Action', 'genres:Adventure', 'genres:Arcade'];
/** @internal */
const US_TOPLEVEL_FILTER = ['topLevelFilters:Deals'];
const ES_TOPLEVEL_FILTER = ['topLevelFilters:Ofertas'];
const US_SALEPRICE_FILTER = ['salePrice:-null'];
const US_PLATFORM_FILTER = ['corePlatforms:Nintendo Switch'];
