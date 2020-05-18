import fs from 'fs';

let _flatten = (param?: string) => {
  if(param) {
    return param.split('.').map((str, i) => {
      if(i === 0) {
        return str;
      } else {
        return str.charAt(0).toUpperCase() + str.slice(1);
      }
    }).join('');
  }
  return '';
}

export interface SqlResult {
  sql?: string,
  params?: string[]
}

export class SqlResultImpl {
  sql?: string;
  params?: string[];
}

export interface QueryOptions {
  dbType?: string,
  filtering?: string,
  sorting?: string,
  matching?: string,
  page?: string,
  size?: string
}

export class QueryOptionsImpl implements QueryOptions {}

export default class LoadSql {
  sqlDir: string;
  sqlCache: any;

  constructor(sqlDir: string) {
    this.sqlDir = sqlDir;
    this.sqlCache = {};
  }

  async load(file: string, q?: QueryOptions) {
    let dbType = q && q.dbType ? ('' + q.dbType).toLowerCase() : 'mysql';
    if(dbType === 'mysql') {
      return this.loadForMysql(file, q);
    } else if(dbType === 'mssql') {
      return this.loadForMssql(file, q);
    } else {
      throw new Error(`Unsupported database type: ${dbType}`);
    }
  }

  async loadForMysql (file: string, q?: QueryOptions) {
    let params: any = null;
    let orderBy: string[] = [];
    let where: string[] = [];
    if(q !== undefined) {
      if(q.sorting !== undefined) {
        orderBy = q.sorting.split('@@@').map(s => _flatten(s));
      }
      if(q.filtering !== undefined) {
        where = q.filtering.split('@@@');
        where = where.map(i => {
          let splitForOr = i.split('|||');
          return splitForOr.map(j => {
            let splitForColon =  j.split(':');
            let key = _flatten(splitForColon[0]);
            let value = decodeURIComponent(splitForColon[1]).toLowerCase();
            return 'lower(' + key + ') like \'%' + value.replace(/'/g,"\\'") + '%\'';
          }).join(' or ');
        });
      }    

      if(q.matching !== undefined) {
        let m = q.matching.split('@@@');
        m = m.map((i) => {
          let splitForOr = i.split('|||');
          return splitForOr.map(j => {
            let splitForColon =  j.split(':');
            let key = _flatten(splitForColon[0]);
            let value = decodeURIComponent(splitForColon[1]).toLowerCase();
            return key + '=\'' + value.replace(/'/g,"\\'") + '\'';
          }).join(' or ');
        });
        where.push(...m);
      }

      if(q.matching !== undefined || q.filtering !== undefined) {
        where = where.map(wrapThis => {
          return ' ( ' + wrapThis + ' ) ';
        });
        where = [where.join(' and ')]; 
      }

      let page: number;
      let size: number;
      if(q.page !== undefined && q.size !== undefined) {
        size = parseInt(q.size, 10);
        page = parseInt(q.page, 10);
        params = [(page * size), size];
      }
    }

    if(this.sqlCache[file]) {
      let sql = this.sqlCache[file];
      if(where.length > 0) {
        sql = 'select * from (' + sql  + ') temp where ' + where.join(' and ');
      }

      if(orderBy.length > 0) {
        sql = 'select * from (' + sql  + ') temp order by ' + orderBy.join(',') + ' ';
      }
      if(params) {
        sql += ' limit ?, ?';
        // console.log('sql: ', sql, params);
        const result: SqlResult = {
          sql: sql,
          params: params
        }
        return result;
      } else {
        // console.log('sql: ', sql);
        const result: SqlResult = {
          sql: sql
        }
        return result;
      }
    } else {
      let me = this;
      try {
        let data: Buffer = fs.readFileSync(this.sqlDir + file + '.sql')
        let sql: string = '';
        if(data) {
         sql = data.toString('utf8');
        }
        me.sqlCache[file] = sql;
        if(where.length > 0) {
          sql = 'select * from (' + sql  + ') temp where ' + where.join(' and ');
        }
        if(orderBy.length > 0) {
          sql = 'select * from (' + sql  + ') temp order by ' + orderBy.join(',') + ' ';
        }
        if(params) {
          sql += ' limit ?, ?';
          // console.log("sql: ", sql, params);
          const result: SqlResult = {
            sql: sql,
            params: params
          }
          return result;
        } else {
          // console.log("sql: ",sql)
          const result: SqlResult = {
            sql: sql
          }
          return result;
        }
      } catch (err) {
        console.log(err);
        throw err;
      }
    }
  }

  loadForMssql (file: string, q?: QueryOptions) {
    let params: any = null;
    let orderBy: string[] = [];
    let where: string[] = [];
    if(q !== undefined) {
      if(q.sorting !== undefined) {
        orderBy = q.sorting.split('@@@').map(s => _flatten(s));
      }
      if(q.filtering !== undefined) {
        where = q.filtering.split('@@@');
        where = where.map(i => {
          let splitForOr = i.split('|||');
          return splitForOr.map(j => {
            let splitForColon =  j.split(':');
            let key = _flatten(splitForColon[0]);
            let value = decodeURIComponent(splitForColon[1]).toLowerCase();
            return 'lower(' + key + ') like \'%' + value.replace(/'/g,"\\'") + '%\'';
          }).join(' or ');
        });
      }    

      if(q.matching !== undefined) {
        let m = q.matching.split('@@@');
        m = m.map((i) => {
          let splitForOr = i.split('|||');
          return splitForOr.map(j => {
            let splitForColon =  j.split(':');
            let key = _flatten(splitForColon[0]);
            let value = decodeURIComponent(splitForColon[1]).toLowerCase();
            return key + '=\'' + value.replace(/'/g,"\\'") + '\'';
          }).join(' or ');
        });
        where.push(...m);
      }

      if(q.matching !== undefined || q.filtering !== undefined) {
        where = where.map(wrapThis => {
          return ' ( ' + wrapThis + ' ) ';
        });
        where = [where.join(' and ')]; 
      }

      let page: number;
      let size: number;
      if(q.page !== undefined && q.size !== undefined) {
        size = parseInt(q.size, 10);
        page = parseInt(q.page, 10);
        let offset = page * size;
        params = [
          { _offset: offset }, 
          { _size: size }
        ];
      }
    }
    let hasOrder = /\sorder\s+by/i;
    if(this.sqlCache[file]) {
      let sql = this.sqlCache[file];
      if(where.length > 0) {
        sql = 'select * from (' + sql  + ') temp where ' + where.join(' and ');
      }
      if(orderBy.length > 0) {
        sql = 'select * from (' + sql  + ') temp order by ' + orderBy.join(',') + ' ';
      } else if(params && !hasOrder.test(sql)) {
        sql += ' order by (select null)';
      }
      if(params) {
        sql += ` OFFSET @_offset ROWS FETCH NEXT @_size ROWS ONLY`;
      }
      // console.log('sql: ', sql);
      const result: SqlResult = {
        sql: sql,
        params: params
      }
      return result;
    } else {
      let me = this;
      try {
        let data: Buffer = fs.readFileSync(this.sqlDir + file + '.sql');
        let sql: string = '';
        if(data) {
          sql = data.toString('utf8');
        }
        me.sqlCache[file] = sql;
        if(where.length > 0) {
          sql = 'select * from (' + sql  + ') temp where ' + where.join(' and ');
        }
        if(orderBy.length > 0) {
          sql = 'select * from (' + sql  + ') temp order by ' + orderBy.join(',') + ' ';
        } else if(params && !hasOrder.test(sql)) {
          sql += ' order by (select null)';
        }

        if(params) {
          sql += ` OFFSET @_offset ROWS FETCH NEXT @_size ROWS ONLY`;
        }
        // console.log("sql: ",sql)
        const result: SqlResult = {
          sql: sql,
          params: params
        }
        return result;
      } catch (err) {
        console.log(err);
      }
    }
  }
}