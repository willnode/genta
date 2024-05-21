import { SchemaDescriptor, TableDescriptor } from "./db";

function createSelectQuery(table: TableDescriptor) {
    return {
        "type": "array",
        "description": "Selecting columns for displaying data in table " + table.name,
        "items": {
            "oneOf": [
                {
                    "type": "string",
                    "enum": Object.keys(table.columns),
                    "description": "Direct select based on properties of table " + table.name,
                }
            ]
        }
    }
}

function createWhereQuery(table: TableDescriptor) {
    return {
        "type": "array",
        "description": "Filtering methods for table " + table.name,
        "items": {
            "oneOf": [
                {
                    "type": "object",
                    "description": "Direct filter based on properties of table " + table.name,
                    "properties": {
                        "key": {
                            "type": "string",
                            "enum": Object.keys(table.columns)
                        },
                        "operator": {
                            "$ref": "#/definitions/whereOperators"
                        },
                        "value": {
                            "$ref": "#/definitions/whereValues"
                        }
                    }
                }
            ]
        }
    }
}

function createQuerySchema(table: TableDescriptor) {
    return {
        "type": "object",
        "description": "Starts query for table " + table.name,
        "required": ["select"],
        "properties": {
            "select": createSelectQuery(table),
            "where": createWhereQuery(table),
            "group_by": {},
            "order_by": {},
        }
    }
}

function esc(s) {
    if (typeof s == "string") {
        return `"${s}"`
    } else {
        return `${s}`
    }
}
const whereDialects = {
    "equal": (v) => "= " + esc(v),
    "not_equal": (v) => "<> " + esc(v),
    "greater_than": (v) => "> " + esc(v),
    "greater_or_equal_than": (v) => ">= " + esc(v),
    "less_than": (v) => "< " + esc(v),
    "less_or_equal_than": (v) => "<= " + esc(v),
    "starts_with": (v) => "LIKE " + esc(v + "%"),
    "ends_with": (v) => "LIKE " + esc("%" + v),
    "includes": (v) => "IN " + v.map(x => esc(x)),
    "excludes": (v) => "NOT IN " + v.map(x => esc(x)),
}

export function schemaTable(db: SchemaDescriptor) {
    return {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "$id": "#",
        "definitions": {
            "whereOperators": {
                "type": "string",
                "enum": Object.keys(whereDialects),
            },
            "whereValues": {
                "oneOf": [{
                    "type": "string",
                    "description": "A string value, only valid for operator equal, not_equal, starts_with, ends_with"
                }, {
                    "type": "number",
                    "description": "A number value, only valid for operator equal, not_equal, less_than, less_or_equal_than, greater_than, greater_or_equal_than"
                }, {
                    "type": "array",
                    "description": "An array of values, only valid for operator includes, excludes",
                    "items": {
                        "type": ["string", "number"]
                    }
                }]
            }
        },
        "type": "object",
        "properties": Object.values(db).reduce((r, table) => {
            r[table.name] = createQuerySchema(table);
            return r;
        }, {} as Record<string, any>)
    };
}

export function schemaToQuery(result: any) {
    let r: string[] = [];
    console.log(result);
    for (let [table, query] of Object.entries<any>(result)) {
        if (Array.isArray(query)) {
            query = query[0];
        }
        let sSELECT = 'SELECT ' + query.select.join(', ');
        let sFROM = ' FROM ' + table;
        let sWHERE = '';
        if (query.where && query.where.length > 0) {
            let WHERE: string[] = [];
            for (const i of query.where) {
                WHERE.push(`${i.key} ${whereDialects[i.operator](i.value)}`)
            }
            sWHERE = ' WHERE ' + WHERE.join(' AND ');
        }
        r.push(sSELECT + sFROM + sWHERE);
    }
    r.push('');
    return r.join(';\n');
}