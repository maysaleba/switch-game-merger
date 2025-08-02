"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQueriedGamesAmerica = void 0;
const fetch_1 = require("@sapphire/fetch");
const querystring_1 = require("querystring");
const constants_1 = require("../utils/constants");
const utils_1 = require("../utils/utils");
/**
 * Fetches a subset of games from the American e-shops as based on a given query
 * @param query The query to search for
 * @param __namedParameters Additional options for the [[getQueriedGamesAmerica]] call. Defaults to `{ hitsPerPage: 200, page: 0 }`
 * @returns Promise containing the first `hitsPerPage` games that match your query
 * @license Apache-2.0 Favna & Antonio Román
 * @copyright 2019
 */
const getQueriedGamesAmerica = async (query, { hitsPerPage = 200, page = 0 } = { hitsPerPage: 200, page: 0 }) => {
    const { hits } = await (0, fetch_1.fetch)(constants_1.QUERIED_US_GET_GAMES_URL, {
        method: 'POST',
        headers: {
            ...constants_1.US_ALGOLIA_HEADERS,
            'X-Algolia-API-Key': constants_1.QUERIED_US_ALGOLIA_KEY
        },
        body: JSON.stringify({
            params: (0, querystring_1.stringify)({
                hitsPerPage,
                page,
                query
            })
        })
    }, "json" /* JSON */);
    if (!hits.length)
        throw new utils_1.EshopError(`No game results for the query "${query}"`);
    return hits;
};
exports.getQueriedGamesAmerica = getQueriedGamesAmerica;
//# sourceMappingURL=getQueriedGamesAmerica.js.map