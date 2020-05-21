"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
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
var LoadSql = /** @class */ (function () {
    function LoadSql(sqlDir) {
        this.sqlDir = sqlDir.endsWith('/') ? sqlDir : sqlDir + "/";
        this.sqlCache = {};
    }
    LoadSql.prototype.load = function (file, q) {
        return __awaiter(this, void 0, void 0, function () {
            var dbType;
            return __generator(this, function (_a) {
                dbType = q && q.dbType ? ('' + q.dbType).toLowerCase() : 'mysql';
                if (dbType === 'mysql') {
                    return [2 /*return*/, this.loadForMysql(file, q)];
                }
                else if (dbType === 'mssql') {
                    return [2 /*return*/, this.loadForMssql(file, q)];
                }
                else {
                    throw new Error("Unsupported database type: " + dbType);
                }
                return [2 /*return*/];
            });
        });
    };
    LoadSql.prototype.loadForMysql = function (file, q) {
        return __awaiter(this, void 0, void 0, function () {
            var params, orderBy, where, m, page, size, sql, result, result, me, data, sql, result, result;
            return __generator(this, function (_a) {
                params = undefined;
                orderBy = [];
                where = [];
                if (q !== undefined) {
                    if (q.sorting !== undefined) {
                        orderBy = q.sorting.split('@@@').map(function (s) { return _flatten(s); });
                    }
                    if (q.filtering !== undefined) {
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
                    if (q.matching !== undefined) {
                        m = q.matching.split('@@@');
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
                    if (q.matching !== undefined || q.filtering !== undefined) {
                        where = where.map(function (x) {
                            return ' ( ' + x + ' ) ';
                        });
                        where = [where.join(' and ')];
                    }
                    page = void 0;
                    size = void 0;
                    if (q.page !== undefined && q.size !== undefined) {
                        size = parseInt(q.size, 10);
                        page = parseInt(q.page, 10);
                        params = {
                            offset: (page * size),
                            pageSize: size
                        };
                    }
                }
                if (this.sqlCache[file]) {
                    sql = this.sqlCache[file];
                    if (where.length > 0) {
                        sql = 'select * from (' + sql + ') temp where ' + where.join(' and ');
                    }
                    if (orderBy.length > 0) {
                        sql = 'select * from (' + sql + ') temp order by ' + orderBy.join(',') + ' ';
                    }
                    if (params !== undefined) {
                        sql += ' limit ?, ?';
                        result = {
                            sql: sql,
                            params: params
                        };
                        return [2 /*return*/, result];
                    }
                    else {
                        result = {
                            sql: sql
                        };
                        return [2 /*return*/, result];
                    }
                }
                else {
                    me = this;
                    try {
                        data = fs_1.default.readFileSync(this.sqlDir + file + '.sql');
                        sql = '';
                        if (data) {
                            sql = data.toString('utf8');
                        }
                        me.sqlCache[file] = sql;
                        if (where.length > 0) {
                            sql = 'select * from (' + sql + ') temp where ' + where.join(' and ');
                        }
                        if (orderBy.length > 0) {
                            sql = 'select * from (' + sql + ') temp order by ' + orderBy.join(',') + ' ';
                        }
                        if (params) {
                            sql += ' limit ?, ?';
                            result = {
                                sql: sql,
                                params: params
                            };
                            return [2 /*return*/, result];
                        }
                        else {
                            result = {
                                sql: sql
                            };
                            return [2 /*return*/, result];
                        }
                    }
                    catch (err) {
                        console.log(err);
                        throw err;
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    LoadSql.prototype.loadForMssql = function (file, q) {
        return __awaiter(this, void 0, void 0, function () {
            var params, orderBy, where, m, page, size, offset, hasOrder, sql, result, me, data, sql, result;
            return __generator(this, function (_a) {
                params = undefined;
                orderBy = [];
                where = [];
                if (q !== undefined) {
                    if (q.sorting !== undefined) {
                        orderBy = q.sorting.split('@@@').map(function (s) { return _flatten(s); });
                    }
                    if (q.filtering !== undefined) {
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
                    if (q.matching !== undefined) {
                        m = q.matching.split('@@@');
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
                    if (q.matching !== undefined || q.filtering !== undefined) {
                        where = where.map(function (wrapThis) {
                            return ' ( ' + wrapThis + ' ) ';
                        });
                        where = [where.join(' and ')];
                    }
                    page = void 0;
                    size = void 0;
                    if (q.page !== undefined && q.size !== undefined) {
                        size = parseInt(q.size, 10);
                        page = parseInt(q.page, 10);
                        offset = page * size;
                        params = {
                            offset: offset,
                            pageSize: size
                        };
                    }
                }
                hasOrder = /\sorder\s+by/i;
                if (this.sqlCache[file]) {
                    sql = this.sqlCache[file];
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
                    result = {
                        sql: sql,
                        params: params
                    };
                    return [2 /*return*/, result];
                }
                else {
                    me = this;
                    try {
                        data = fs_1.default.readFileSync(this.sqlDir + file + '.sql');
                        sql = '';
                        if (data) {
                            sql = data.toString('utf8');
                        }
                        me.sqlCache[file] = sql;
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
                        result = {
                            sql: sql,
                            params: params
                        };
                        return [2 /*return*/, result];
                    }
                    catch (err) {
                        console.log(err);
                        throw err;
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    return LoadSql;
}());
exports.default = LoadSql;
//# sourceMappingURL=../index.js.map