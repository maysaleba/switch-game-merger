"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGamesEuropeSale = void 0;
const fetch_1 = require("@sapphire/fetch");
const querystring_1 = require("querystring");
const constants_1 = require("../utils/constants_s");
const utils_1 = require("../utils/utils");

/**
 * Fetches all games on the European, Australian, or New Zealand eShops.
 *
 * @param {Object} options - Request options
 * @returns {Promise<Array>} A list of all available games.
 */
const getGamesEuropeSale = async (options = { limit: 30000, locale: constants_1.EU_DEFAULT_LOCALE }) => {
    if (!options.limit) options.limit = 30000;
    if (!options.locale) options.locale = constants_1.EU_DEFAULT_LOCALE;

    const allGames = new Map();
    const pageSize = 1000;
    let start = 0;
    let totalResults = 0;

    // Delay function to prevent rate limiting
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    try {
        do {
            // Construct request URL with the correct `start` value
            const requestUrl = `${constants_1.EU_GET_GAMES_URL.replace('{locale}', options.locale)}?${(0, querystring_1.stringify)({
                rows: pageSize,
                start: start, // Ensure start is explicitly set
                ...constants_1.EU_GET_GAMES_OPTIONS,
                _t: Date.now() // Helps prevent caching
            })}`;

            console.log(`Fetching games from: ${requestUrl}`);

            // Fetch data
            const gamesData = await (0, fetch_1.fetch)(requestUrl, "json" /* JSON */);

            if (!gamesData.response || !gamesData.response.docs.length) {
                console.warn(`No more games found at offset ${start}. Stopping.`);
                break;
            }

            // Add unique games
            gamesData.response.docs.forEach(game => allGames.set(game.nsuid_txt, game));

            totalResults = gamesData.response.numFound || allGames.size;
            console.log(`Fetched ${allGames.size} unique games so far (Next Offset: ${start + pageSize}, Estimated Total: ${totalResults})`);

            // Increment the start value for pagination
            start += pageSize;  

            // Add delay to prevent rate limiting
            await delay(1000);
        } while (start < totalResults && allGames.size < options.limit);

        console.log(`Fetching complete. Total unique games fetched: ${allGames.size}`);

        return Array.from(allGames.values()).slice(0, options.limit);
    } catch (err) {
        console.error("Error fetching EU games:", err.message);
        throw new utils_1.EshopError('Fetching of EU Games failed');
    }
};

exports.getGamesEuropeSale = getGamesEuropeSale;
