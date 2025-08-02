"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShopsEurope = void 0;
const country_data_1 = require("country-data");
const getShopByCountryCode_1 = require("../other/getShopByCountryCode");
const constants_1 = require("../utils/constants");
/**
 * Gets all active eShops on European countries.
 *
 * @remarks
 * This method will launch several requests at nintendo web services, so don't abuse it.
 *
 * @returns A list of shop objects with country code, name and default currency.
 */
const getShopsEurope = async () => {
    return (0, getShopByCountryCode_1.getShopsByCountryCodes)(country_data_1.regions.northernEurope.countries.concat(country_data_1.regions.southernEurope.countries, country_data_1.regions.easternEurope.countries, country_data_1.regions.westernEurope.countries, country_data_1.regions.australia.countries, country_data_1.regions.southernAfrica.countries), constants_1.EU_GAME_CHECK_CODE, 2 /* EUROPE */);
};
exports.getShopsEurope = getShopsEurope;
//# sourceMappingURL=getShopsEurope.js.map