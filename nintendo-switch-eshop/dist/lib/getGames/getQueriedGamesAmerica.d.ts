import type { QueriedGamesAmericaOptions, QueriedGameUS } from '../utils/interfaces';
/**
 * Fetches a subset of games from the American e-shops as based on a given query
 * @param query The query to search for
 * @param __namedParameters Additional options for the [[getQueriedGamesAmerica]] call. Defaults to `{ hitsPerPage: 200, page: 0 }`
 * @returns Promise containing the first `hitsPerPage` games that match your query
 * @license Apache-2.0 Favna & Antonio Román
 * @copyright 2019
 */
export declare const getQueriedGamesAmerica: (query: string, { hitsPerPage, page }?: QueriedGamesAmericaOptions) => Promise<QueriedGameUS[]>;
//# sourceMappingURL=getQueriedGamesAmerica.d.ts.map