"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGamesJapan = void 0;
const fetch_1 = require("@sapphire/fetch");
const fast_xml_parser_1 = require("fast-xml-parser");
const constants_1 = require("../utils/constants");
const utils_1 = require("../utils/utils");
/**
 * Fetches all games on japanese eShops
 *
 * @returns Promise containing all the games
 */
const getGamesJapan = async () => {
    try {
        const gamesJP = (0, fast_xml_parser_1.parse)(await (0, fetch_1.fetch)(constants_1.JP_GET_GAMES_URL, "text" /* Text */));
        const allGamesJP = gamesJP.TitleInfoList.TitleInfo;
        return allGamesJP;
    }
    catch (err) {
        if (/(?:JP_games_request_failed)/i.test(err.message)) {
            throw new utils_1.EshopError('Fetching of JP Games failed');
        }
        throw err;
    }
};
exports.getGamesJapan = getGamesJapan;
//# sourceMappingURL=getGamesJapan.js.map