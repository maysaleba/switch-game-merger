"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveShops = void 0;
const getShopsAmerica_1 = require("./getShopsAmerica");
const getShopsAsia_1 = require("./getShopsAsia");
const getShopsEurope_1 = require("./getShopsEurope");
/**
 * Gets all active eShops.
 *
 * @remarks
 * This method will launch several requests at nintendo web services, so don't abuse it.
 *
 * @returns A list of shop objects with country code, name and default currency.
 */
const getActiveShops = async () => {
    try {
        const shopsAmerica = await (0, getShopsAmerica_1.getShopsAmerica)();
        const shopsAsia = await (0, getShopsAsia_1.getShopsAsia)();
        const shopsEurope = await (0, getShopsEurope_1.getShopsEurope)();
        return shopsAmerica.concat(shopsAsia, shopsEurope);
    }
    catch (err) {
        throw err;
    }
};
exports.getActiveShops = getActiveShops;
//# sourceMappingURL=getActiveShops.js.map