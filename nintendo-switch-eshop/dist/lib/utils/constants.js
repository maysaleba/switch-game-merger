"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Region = exports.PRICE_LIST_LIMIT = exports.PRICE_GET_OPTIONS = exports.PRICE_GET_URL = exports.JP_NSUID_REGEX = exports.JP_GAME_CODE_REGEX = exports.JP_GAME_CHECK_CODE = exports.JP_GET_GAMES_URL = exports.EU_GAME_LIST_LIMIT = exports.EU_DEFAULT_LOCALE = exports.EU_GAME_CODE_REGEX = exports.EU_GAME_CHECK_CODE = exports.EU_GET_GAMES_URL = exports.EU_GET_GAMES_OPTIONS = exports.US_ALGOLIA_HEADERS = exports.US_GAME_CODE_REGEX = exports.US_GAME_CHECK_CODE = exports.QUERIED_US_GET_GAMES_URL = exports.US_GET_GAMES_URL = exports.QUERIED_US_ALGOLIA_KEY = exports.US_ALGOLIA_KEY = exports.US_ALGOLIA_ID = void 0;
/** Algolia ID for getting US games */
exports.US_ALGOLIA_ID = 'U3B6GR4UA3';
/** Algolia Key for getting US games */
exports.US_ALGOLIA_KEY = 'a29c6927638bfd8cee23993e51e721c9';
/** Algolia key for getting US games with a query */
exports.QUERIED_US_ALGOLIA_KEY = 'a29c6927638bfd8cee23993e51e721c9';
/** URL for getting US Games */
exports.US_GET_GAMES_URL = `https://${exports.US_ALGOLIA_ID}-dsn.algolia.net/1/indexes/*/queries`;
/** URL for getting Queried US Games */
exports.QUERIED_US_GET_GAMES_URL = `https://${exports.US_ALGOLIA_ID}-dsn.algolia.net/1/indexes/store_all_products_en_us/query`;
/**
 * Sample game code for US store
 * @internal
 */
exports.US_GAME_CHECK_CODE = '70010000000185';
/**
 * Regex for US game codes
 * @internal
 */
exports.US_GAME_CODE_REGEX = /HAC\w(\w{4})/;
/** @internal Request headers for US games */
exports.US_ALGOLIA_HEADERS = {
    'Content-Type': 'application/json',
    'X-Algolia-API-Key': exports.US_ALGOLIA_KEY,
    'X-Algolia-Application-Id': exports.US_ALGOLIA_ID
};
/**
 * Options used for getting EU games
 * @internal
 */
exports.EU_GET_GAMES_OPTIONS = {
    // fq: 'type:GAME AND system_type:nintendoswitch* AND product_code_txt:*',
    //fq: '(type:GAME OR type:DLC) AND playable_on_txt:"HAC" AND price_has_discount_b:true AND nsuid_txt:*',    
    fq: '(type:GAME OR type:DLC) AND price_has_discount_b:* AND nsuid_txt:*',
    q: '*',
    sort: 'sorting_title asc',
    wt: 'json'
};
/** URL for getting EU Games */
exports.EU_GET_GAMES_URL = 'http://search.nintendo-europe.com/{locale}/select';
/**
 * Sample game code for EU store
 * @internal
 */
exports.EU_GAME_CHECK_CODE = '70010000000184';
/**
 * Regex for EU game codes
 * @internal
 */
exports.EU_GAME_CODE_REGEX = /HAC\w(\w{4})/;
/**
 * Default locale when getting EU games - defaults to `en`
 * @internal
 */
exports.EU_DEFAULT_LOCALE = 'en';
/**
 * Default limit used when getting EU games - defaults to `9999`
 * @internal
 */
exports.EU_GAME_LIST_LIMIT = 99999;
/** URL for getting JP Games */
exports.JP_GET_GAMES_URL = 'https://www.nintendo.co.jp/data/software/xml/switch.xml';
/**
 * Sample game code for JP store
 * @internal
 */
exports.JP_GAME_CHECK_CODE = '70010000000039';
/**
 * Regex for JP game codes
 * @internal
 */
exports.JP_GAME_CODE_REGEX = /HAC(\w{4})/;
/**
 * Regex for JP NSUID
 * @internal
 */
exports.JP_NSUID_REGEX = /\d{14}/;
/** URL for getting game prices */
exports.PRICE_GET_URL = 'https://api.ec.nintendo.com/v1/price';
/**
 * Options for getting Price data
 * @internal
 */
exports.PRICE_GET_OPTIONS = { lang: 'en' };
/**
 * Default limit used when getting price data - defaults to `50`
 * @internal
 */
exports.PRICE_LIST_LIMIT = 50;
/**
 * Predefined options for the unit system
 */
var Region;
(function (Region) {
    Region[Region["AMERICAS"] = 1] = "AMERICAS";
    Region[Region["EUROPE"] = 2] = "EUROPE";
    Region[Region["ASIA"] = 3] = "ASIA";
})(Region = exports.Region || (exports.Region = {}));
//# sourceMappingURL=constants.js.map