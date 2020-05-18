export interface QueryOptions {
    dbType?: string;
    filtering?: string;
    sorting?: string;
    matching?: string;
    page?: string;
    size?: string;
}
export declare class QueryOptionsImpl implements QueryOptions {
}
export default class LoadSql {
    sqlDir: string;
    sqlCache: any;
    constructor(sqlDir: string);
    load(file: string, q: QueryOptions | undefined, callback: Function): Promise<unknown> | undefined;
    loadAndCallbackForMysql(file: string, q: QueryOptions | undefined, callback: Function): void;
    loadAndCallbackForMssql(file: string, q: QueryOptions | undefined, callback: Function): void;
}
//# sourceMappingURL=../index.d.ts.map