export interface SqlResult {
    sql?: string;
    params?: string[];
}
export declare class SqlResultImpl {
    sql?: string;
    params?: string[];
}
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
    load(file: string, q?: QueryOptions): Promise<SqlResult | undefined>;
    loadForMysql(file: string, q?: QueryOptions): Promise<SqlResult>;
    loadForMssql(file: string, q?: QueryOptions): SqlResult | undefined;
}
//# sourceMappingURL=../index.d.ts.map