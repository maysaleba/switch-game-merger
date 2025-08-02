"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseNSUID = void 0;
const constants_1 = require("../utils/constants");
/**
 * Extracts NSUID information from the game object.
 *
 * @param game The game object returned from one of the other methods.
 * @param region Region code
 * @returns The 14-digits NSUID
 */
const parseNSUID = (game, region) => {
    switch (region) {
        case 2 /* EUROPE */:
            return game.nsuid_txt ? game.nsuid_txt[0] : null;
        case 3 /* ASIA */:
            const nsuidParse = constants_1.JP_NSUID_REGEX.exec(game.LinkURL);
            return nsuidParse && nsuidParse.length > 0 ? nsuidParse[0] : null;
        default:
        case 1 /* AMERICAS */:
            return game.nsuid;
    }
};
exports.parseNSUID = parseNSUID;
//# sourceMappingURL=parseNSUID.js.map