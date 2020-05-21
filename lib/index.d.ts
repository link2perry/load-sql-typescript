export interface SqlResult {
    sql?: string;
    params?: {
        offset: number;
        pageSize: number;
    };
}
export interface QueryOptions {
    dbType?: string;
    filtering?: string;
    sorting?: string;
    matching?: string;
    page?: string;
    size?: string;
}
export default class LoadSql {
    sqlDir: string;
    sqlCache: any;
    constructor(sqlDir: string);
    load(file: string, q?: QueryOptions): Promise<SqlResult>;
    loadForMysql(file: string, q?: QueryOptions): Promise<SqlResult>;
    loadForMssql(file: string, q?: QueryOptions): Promise<SqlResult>;
}
//# sourceMappingURL=../index.d.ts.map