"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrices = void 0;
const fetch_1 = require("@sapphire/fetch");
const querystring_1 = require("querystring");
const constants_1 = require("../utils/constants");
const utils_1 = require("../utils/utils");
/**
 * Gets pricing information for the requested games. Paginates every 50 games.
 *
 * @param country A two digit country code. (ISO 3166-1 alpha-2 country code)
 * @param gameIds One or more NSUID of the corresponding games.
 * @param offset _(Optional)_ The offset to start at
 * @param prices _(Optional)_ An array of {@link TitleData}
 * @returns A promise containing the pricing information.
 */
const getPrices = async (country, gameIds, offset = 0, prices = []) => {
    try {
        const filteredIds = gameIds.slice(offset, offset + constants_1.PRICE_LIST_LIMIT);
        const response = await (0, fetch_1.fetch)(`${constants_1.PRICE_GET_URL}?${(0, querystring_1.stringify)({
            country,
            ids: filteredIds,
            limit: constants_1.PRICE_LIST_LIMIT,
            ...constants_1.PRICE_GET_OPTIONS
        })}`, "json" /* JSON */);
        // console.log(response);
        if (response.prices && response.prices.length + offset < gameIds.length) {
            const accumulatedPrices = prices.concat(response.prices);
            return await (0, exports.getPrices)(country, gameIds, offset + constants_1.PRICE_LIST_LIMIT, accumulatedPrices);
        }
        else if (response.prices) {
            response.prices = response.prices.concat(prices);
            return response;
        }
        return response;
    }
    catch (err) {
        if (/(?:PRICE_Rate_Limit)/i.test(err.message)) {
            throw new utils_1.EshopError('Looks like you ran into a rate limit while getting price data, please do not spam the Nintendo servers.');
        }
        if (/(?:PRICE_get_request_failed)/i.test(err.message)) {
            throw new utils_1.EshopError('Fetching of eShop prices failed');
        }
        throw err;
    }
};
exports.getPrices = getPrices;
//# sourceMappingURL=getPrices.js.map