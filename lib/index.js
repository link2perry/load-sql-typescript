import fs from 'fs';
var _flatten = function (param) {
    if (param) {
        return param.split('.').map(function (str, i) {
            if (i === 0) {
                return str;
            }
            else {
                return str.charAt(0).toUpperCase() + str.slice(1);
            }
        }).join('');
    }
    return '';
};
var QueryOptionsImpl = /** @class */ (function () {
    function QueryOptionsImpl() {
    }
    return QueryOptionsImpl;
}());
export { QueryOptionsImpl };
var LoadSql = /** @class */ (function () {
    function LoadSql(sqlDir) {
        this.sqlDir = sqlDir;
        this.sqlCache = {};
    }
    LoadSql.prototype.load = function (file, q, callback) {
        var _this = this;
        if (q === void 0) { q = new QueryOptionsImpl(); }
        var dbType = q && q.dbType ? ('' + q.dbType).toLowerCase() : 'mysql';
        if (dbType === 'mysql') {
            if (typeof callback === 'undefined') {
                return new Promise(function (succeed) {
                    _this.loadAndCallbackForMysql(file, q, function (sql, params) {
                        succeed({ sql: sql, params: params });
                    });
                });
            }
            else {
                this.loadAndCallbackForMysql(file, q, callback);
            }
        }
        else if (dbType === 'mssql') {
            if (typeof callback === 'undefined') {
                return new Promise(function (succeed) {
                    _this.loadAndCallbackForMssql(file, q, function (sql, params) {
                        succeed({ sql: sql, params: params });
                    });
                });
            }
            else {
                this.loadAndCallbackForMssql(file, q, callback);
            }
        }
        else {
            throw new Error("Unsupported database type: " + dbType);
        }
    };
    LoadSql.prototype.loadAndCallbackForMysql = function (file, q, callback) {
        if (q === void 0) { q = new QueryOptionsImpl(); }
        var params = null;
        var orderBy = [];
        var where = [];
        if (typeof q !== 'undefined') {
            if (typeof q.sorting !== 'undefined') {
                orderBy = q.sorting.split('@@@').map(function (s) { return _flatten(s); });
            }
            if (typeof q.filtering !== 'undefined') {
                where = q.filtering.split('@@@');
                where = where.map(function (i) {
                    var splitForOr = i.split('|||');
                    return splitForOr.map(function (j) {
                        var splitForColon = j.split(':');
                        var key = _flatten(splitForColon[0]);
                        var value = decodeURIComponent(splitForColon[1]).toLowerCase();
                        return 'lower(' + key + ') like \'%' + value.replace(/'/g, "\\'") + '%\'';
                    }).join(' or ');
                });
            }
            if (typeof q.matching !== 'undefined') {
                var m = q.matching.split('@@@');
                m = m.map(function (i) {
                    var splitForOr = i.split('|||');
                    return splitForOr.map(function (j) {
                        var splitForColon = j.split(':');
                        var key = _flatten(splitForColon[0]);
                        var value = decodeURIComponent(splitForColon[1]).toLowerCase();
                        return key + '=\'' + value.replace(/'/g, "\\'") + '\'';
                    }).join(' or ');
                });
                where.push.apply(where, m);
            }
            if (typeof q.matching !== 'undefined' || typeof q.filtering !== 'undefined') {
                where = where.map(function (wrapThis) {
                    return ' ( ' + wrapThis + ' ) ';
                });
                where = [where.join(' and ')];
            }
            var page = void 0;
            var size = void 0;
            if (typeof q.page !== 'undefined' && typeof q.size !== 'undefined') {
                size = parseInt(q.size, 10);
                page = parseInt(q.page, 10);
                params = [(page * size), size];
            }
        }
        if (this.sqlCache[file]) {
            var sql = this.sqlCache[file];
            if (where.length > 0) {
                sql = 'select * from (' + sql + ') temp where ' + where.join(' and ');
            }
            if (orderBy.length > 0) {
                sql = 'select * from (' + sql + ') temp order by ' + orderBy.join(',') + ' ';
            }
            if (params) {
                sql += ' limit ?, ?';
                // console.log('sql: ', sql, params);
                callback(sql, params);
            }
            else {
                // console.log('sql: ', sql);
                callback(sql);
            }
        }
        else {
            var me_1 = this;
            fs.readFile(this.sqlDir + file + '.sql', function (err, data) {
                var sql = data.toString('utf8');
                if (err) {
                    console.log(err);
                }
                else {
                    me_1.sqlCache[file] = sql;
                    if (where.length > 0) {
                        sql = 'select * from (' + sql + ') temp where ' + where.join(' and ');
                    }
                    if (orderBy.length > 0) {
                        sql = 'select * from (' + sql + ') temp order by ' + orderBy.join(',') + ' ';
                    }
                    if (params) {
                        sql += ' limit ?, ?';
                        // console.log("sql: ", sql, params);
                        callback(sql, params);
                    }
                    else {
                        // console.log("sql: ",sql)
                        callback(sql);
                    }
                }
            });
        }
    };
    LoadSql.prototype.loadAndCallbackForMssql = function (file, q, callback) {
        if (q === void 0) { q = new QueryOptionsImpl(); }
        var params = null;
        var orderBy = [];
        var where = [];
        if (typeof q !== 'undefined') {
            if (typeof q.sorting !== 'undefined') {
                orderBy = q.sorting.split('@@@').map(function (s) { return _flatten(s); });
            }
            if (typeof q.filtering !== 'undefined') {
                where = q.filtering.split('@@@');
                where = where.map(function (i) {
                    var splitForOr = i.split('|||');
                    return splitForOr.map(function (j) {
                        var splitForColon = j.split(':');
                        var key = _flatten(splitForColon[0]);
                        var value = decodeURIComponent(splitForColon[1]).toLowerCase();
                        return 'lower(' + key + ') like \'%' + value.replace(/'/g, "\\'") + '%\'';
                    }).join(' or ');
                });
            }
            if (typeof q.matching !== 'undefined') {
                var m = q.matching.split('@@@');
                m = m.map(function (i) {
                    var splitForOr = i.split('|||');
                    return splitForOr.map(function (j) {
                        var splitForColon = j.split(':');
                        var key = _flatten(splitForColon[0]);
                        var value = decodeURIComponent(splitForColon[1]).toLowerCase();
                        return key + '=\'' + value.replace(/'/g, "\\'") + '\'';
                    }).join(' or ');
                });
                where.push.apply(where, m);
            }
            if (typeof q.matching !== 'undefined' || typeof q.filtering !== 'undefined') {
                where = where.map(function (wrapThis) {
                    return ' ( ' + wrapThis + ' ) ';
                });
                where = [where.join(' and ')];
            }
            var page = void 0;
            var size = void 0;
            if (typeof q.page !== 'undefined' && typeof q.size !== 'undefined') {
                size = parseInt(q.size, 10);
                page = parseInt(q.page, 10);
                var offset = page * size;
                params = [
                    { _offset: offset },
                    { _size: size }
                ];
            }
        }
        var hasOrder = /\sorder\s+by/i;
        if (this.sqlCache[file]) {
            var sql = this.sqlCache[file];
            if (where.length > 0) {
                sql = 'select * from (' + sql + ') temp where ' + where.join(' and ');
            }
            if (orderBy.length > 0) {
                sql = 'select * from (' + sql + ') temp order by ' + orderBy.join(',') + ' ';
            }
            else if (params && !hasOrder.test(sql)) {
                sql += ' order by (select null)';
            }
            if (params) {
                sql += " OFFSET @_offset ROWS FETCH NEXT @_size ROWS ONLY";
            }
            // console.log('sql: ', sql);
            callback(sql, params);
        }
        else {
            var me_2 = this;
            fs.readFile(this.sqlDir + file + '.sql', function (err, data) {
                var sql = data.toString('utf8');
                if (err) {
                    console.log(err);
                }
                else {
                    me_2.sqlCache[file] = sql;
                    if (where.length > 0) {
                        sql = 'select * from (' + sql + ') temp where ' + where.join(' and ');
                    }
                    if (orderBy.length > 0) {
                        sql = 'select * from (' + sql + ') temp order by ' + orderBy.join(',') + ' ';
                    }
                    else if (params && !hasOrder.test(sql)) {
                        sql += ' order by (select null)';
                    }
                    if (params) {
                        sql += " OFFSET @_offset ROWS FETCH NEXT @_size ROWS ONLY";
                    }
                    // console.log("sql: ",sql)
                    callback(sql, params);
                }
            });
        }
    };
    return LoadSql;
}());
export default LoadSql;
//# sourceMappingURL=../index.js.map