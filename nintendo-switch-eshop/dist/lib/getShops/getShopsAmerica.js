"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShopsAmerica = void 0;
const country_data_1 = require("country-data");
const getShopByCountryCode_1 = require("../other/getShopByCountryCode");
const constants_1 = require("../utils/constants");
/**
 * Gets all active eShops on American countries.
 *
 * @remarks
 * This method will launch several requests at nintendo web services, so don't abuse it.
 *
 * @returns A list of shop objects with country code, name and default currency.
 */
const getShopsAmerica = async () => {
    return (0, getShopByCountryCode_1.getShopsByCountryCodes)(country_data_1.regions.southAmerica.countries.concat(country_data_1.regions.centralAfrica.countries, country_data_1.regions.northernAmerica.countries), constants_1.US_GAME_CHECK_CODE, 1 /* AMERICAS */);
};
exports.getShopsAmerica = getShopsAmerica;
//# sourceMappingURL=getShopsAmerica.js.map