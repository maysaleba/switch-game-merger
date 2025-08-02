"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShopsByCountryCodes = void 0;
const country_data_1 = require("country-data");
const getPrices_1 = require("./getPrices");
/**
 * Gets all active eShops given a list of countries.
 *
 * @param countryCodes A list of 2 digit country codes for every country eShop to lookup. (ISO 3166-1 alpha-2 country codes)
 * @param gameCode A 14 digits game NSUID from the desired region.
 * @param region A region id that will be appended in the final shop object for filtering purposes.
 * @returns A list of shop objects with country code, name and default currency.
 */
const getShopsByCountryCodes = async (countryCodes, gameCode, region) => {
    try {
        const countryList = countryCodes.map((code) => country_data_1.countries.all.filter((country) => country.alpha2 === code)[0]);
        const shops = [];
        for (const country of countryList) {
            try {
                const response = await (0, getPrices_1.getPrices)(country.alpha2, gameCode);
                response.country = country;
                shops.push(response);
            }
            catch (err) {
                continue;
            }
        }
        const activeShops = shops.filter((shop) => shop && shop.prices && shop.prices.length && shop.prices[0].regular_price);
        const eShops = activeShops.map((shop) => ({
            code: shop.country.alpha2,
            country: shop.country.name,
            currency: shop.prices[0].regular_price.currency,
            region
        }));
        if (!eShops.length)
            throw new Error('ACTIVE_SHOPS_Rate_Limit');
        return eShops;
    }
    catch (err) {
        if (/(?:ACTIVE_SHOPS_Rate_Limit)/i.test(err.message)) {
            throw new Error('Looks like you ran into a rate limit while getting price data, please do not spam the Nintendo servers.');
        }
        throw err;
    }
};
exports.getShopsByCountryCodes = getShopsByCountryCodes;
//# sourceMappingURL=getShopByCountryCode.js.map