"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseGameCode = void 0;
const constants_1 = require("../utils/constants");
/**
 * Parses the game code to extract the cross-region portion.
 *
 * @param game The game object returned from one of the other methods.
 * @param region Region code
 * @returns The 4-digit resulting game code
 */
const parseGameCode = (game, region) => {
    let codeParse;
    switch (region) {
        default:
        case 2 /* EUROPE */:
            codeParse = constants_1.EU_GAME_CODE_REGEX.exec(game.product_code_txt[0]);
            break;
        case 3 /* ASIA */:
            codeParse = constants_1.JP_GAME_CODE_REGEX.exec(game.InitialCode);
            break;
    }
    return codeParse && codeParse.length > 1 ? codeParse[1] : null;
};
exports.parseGameCode = parseGameCode;
//# sourceMappingURL=parseGameCode.js.map