"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShopsAsia = void 0;
const country_data_1 = require("country-data");
const getShopByCountryCode_1 = require("../other/getShopByCountryCode");
const constants_1 = require("../utils/constants");
/**
 * Gets all active eShops on Asian countries
 *
 * @remarks
 * This method will launch several requests at nintendo web services, so don't abuse it.
 *
 * @returns A list of shop objects with country code, name and default currency.
 */
const getShopsAsia = async () => {
    return (0, getShopByCountryCode_1.getShopsByCountryCodes)(country_data_1.regions.southernAsia.countries.concat(country_data_1.regions.southernAsia.countries, country_data_1.regions.southeastAsia.countries, country_data_1.regions.eastAsia.countries, country_data_1.regions.westernAsia.countries), constants_1.JP_GAME_CHECK_CODE, 3 /* ASIA */);
};
exports.getShopsAsia = getShopsAsia;
//# sourceMappingURL=getShopsAsia.js.map