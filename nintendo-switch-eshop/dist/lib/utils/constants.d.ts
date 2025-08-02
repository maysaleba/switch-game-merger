/** Algolia ID for getting US games */
export declare const US_ALGOLIA_ID = "U3B6GR4UA3";
/** Algolia Key for getting US games */
export declare const US_ALGOLIA_KEY = "c4da8be7fd29f0f5bfa42920b0a99dc7";
/** Algolia key for getting US games with a query */
export declare const QUERIED_US_ALGOLIA_KEY = "6efbfb0f8f80defc44895018caf77504";
/** URL for getting US Games */
export declare const US_GET_GAMES_URL: string;
/** URL for getting Queried US Games */
export declare const QUERIED_US_GET_GAMES_URL: string;
/**
 * Sample game code for US store
 * @internal
 */
export declare const US_GAME_CHECK_CODE = "70010000000185";
/**
 * Regex for US game codes
 * @internal
 */
export declare const US_GAME_CODE_REGEX: RegExp;
/** @internal Request headers for US games */
export declare const US_ALGOLIA_HEADERS: {
    'Content-Type': string;
    'X-Algolia-API-Key': string;
    'X-Algolia-Application-Id': string;
};
/**
 * Options used for getting EU games
 * @internal
 */
export declare const EU_GET_GAMES_OPTIONS: {
    fq: string;
    q: string;
    sort: string;
    start: string;
    wt: string;
};
/** URL for getting EU Games */
export declare const EU_GET_GAMES_URL = "http://search.nintendo-europe.com/{locale}/select";
/**
 * Sample game code for EU store
 * @internal
 */
export declare const EU_GAME_CHECK_CODE = "70010000000184";
/**
 * Regex for EU game codes
 * @internal
 */
export declare const EU_GAME_CODE_REGEX: RegExp;
/**
 * Default locale when getting EU games - defaults to `en`
 * @internal
 */
export declare const EU_DEFAULT_LOCALE = "en";
/**
 * Default limit used when getting EU games - defaults to `9999`
 * @internal
 */
export declare const EU_GAME_LIST_LIMIT = 9999;
/** URL for getting JP Games */
export declare const JP_GET_GAMES_URL = "https://www.nintendo.co.jp/data/software/xml/switch.xml";
/**
 * Sample game code for JP store
 * @internal
 */
export declare const JP_GAME_CHECK_CODE = "70010000000039";
/**
 * Regex for JP game codes
 * @internal
 */
export declare const JP_GAME_CODE_REGEX: RegExp;
/**
 * Regex for JP NSUID
 * @internal
 */
export declare const JP_NSUID_REGEX: RegExp;
/** URL for getting game prices */
export declare const PRICE_GET_URL = "https://api.ec.nintendo.com/v1/price";
/**
 * Options for getting Price data
 * @internal
 */
export declare const PRICE_GET_OPTIONS: {
    lang: string;
};
/**
 * Default limit used when getting price data - defaults to `50`
 * @internal
 */
export declare const PRICE_LIST_LIMIT = 50;
/**
 * Predefined options for the unit system
 */
export declare const enum Region {
    AMERICAS = 1,
    EUROPE = 2,
    ASIA = 3
}
//# sourceMappingURL=constants.d.ts.map