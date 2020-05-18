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

  load(file: string, q: QueryOptions = new QueryOptionsImpl(), callback: Function) {

    let dbType = q && q.dbType ? ('' + q.dbType).toLowerCase() : 'mysql';

    if(dbType === 'mysql') {
      if(typeof callback === 'undefined') {
        return new Promise(succeed => {
          this.loadAndCallbackForMysql(file, q, (sql: string, params: any) => {
            succeed({sql, params});
          })
        });
      } else {
        this.loadAndCallbackForMysql(file, q, callback);
      }
    } else if(dbType === 'mssql') {
      if(typeof callback === 'undefined') {
        return new Promise(succeed => {
          this.loadAndCallbackForMssql(file, q, (sql: string, params: any) => {
            succeed({sql, params});
          })
        });
      } else {
        this.loadAndCallbackForMssql(file, q, callback);
      }
    } else {
      throw new Error(`Unsupported database type: ${dbType}`);
    }
  }

  loadAndCallbackForMysql (file: string, q: QueryOptions = new QueryOptionsImpl(), callback: Function) {
    let params: any = null;
    let orderBy: string[] = [];
    let where: string[] = [];
    if(typeof q !== 'undefined') {
      if(typeof q.sorting !== 'undefined') {
        orderBy = q.sorting.split('@@@').map(s => _flatten(s));
      }
      if(typeof q.filtering !== 'undefined') {
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

      if(typeof q.matching !== 'undefined') {
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

      if(typeof q.matching !== 'undefined' || typeof q.filtering !== 'undefined') {
        where = where.map(wrapThis => {
          return ' ( ' + wrapThis + ' ) ';
        });
        where = [where.join(' and ')]; 
      }

      let page: number;
      let size: number;
      if(typeof q.page !== 'undefined' && typeof q.size !== 'undefined') {
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
        callback(sql, params);
      } else {
        // console.log('sql: ', sql);
        callback(sql);
      }
    } else {
      let me = this;
      
      fs.readFile(this.sqlDir + file + '.sql', (err: any, data: Buffer) => {
        let sql: string = data.toString('utf8');
        if (err){
          console.log(err);
        } else {
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
            callback(sql, params);
          } else {
            // console.log("sql: ",sql)
            callback(sql);
          }
        }
      });
    }
  }

  loadAndCallbackForMssql (file: string, q: QueryOptions = new QueryOptionsImpl(), callback: Function) {
    let params: any = null;
    let orderBy: string[] = [];
    let where: string[] = [];
    if(typeof q !== 'undefined') {
      if(typeof q.sorting !== 'undefined') {
        orderBy = q.sorting.split('@@@').map(s => _flatten(s));
      }
      if(typeof q.filtering !== 'undefined') {
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

      if(typeof q.matching !== 'undefined') {
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

      if(typeof q.matching !== 'undefined' || typeof q.filtering !== 'undefined') {
        where = where.map(wrapThis => {
          return ' ( ' + wrapThis + ' ) ';
        });
        where = [where.join(' and ')]; 
      }

      let page: number;
      let size: number;
      if(typeof q.page !== 'undefined' && typeof q.size !== 'undefined') {
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
      callback(sql, params);
    } else {
      let me = this;
      fs.readFile(this.sqlDir + file + '.sql', (err: any, data: Buffer) => {
        let sql: string = data.toString('utf8');
        if (err){
          console.log(err);
        } else {
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
          callback(sql, params);
        }
      });
    }
  }
}