
import Knex from 'knex';
import { SchemaInspector } from 'knex-schema-inspector';


export interface SchemaDescriptor {
    [name: string]: TableDescriptor
}

export interface TableDescriptor {
    name: string,
    columns: { [name: string]: string }
    constraints: { [name: string]: string }
}


export async function logTables(engine: string, connection: Knex.Knex.StaticConnectionConfig): Promise<SchemaDescriptor> {

    const database = Knex({
        client: engine,
        connection: connection,
    });

    const inspector = SchemaInspector(database);

    // Fetch tables info
    const tablesArray = await inspector.tableInfo();
    // Fetch columns info
    const columnsArray = await inspector.columnInfo();

    // Create a map of tables
    const tablesMap = {};

    // Populate the map with table info
    tablesArray.forEach(table => {
        tablesMap[//(table.schema ? table.schema + '.' : '') + 
            table.name] = {
            name: table.name,
            columns: {},
            constraints: {},
        };
    });

    // Populate the columns map for each table
    columnsArray.forEach(column => {
        let table = tablesMap[column.table]
        if (tablesMap[column.table]) {
            table.columns[column.name] = column.data_type + (column.is_nullable ? '?' : '');//(column.name, column);
            if (column.foreign_key_column && column.foreign_key_table) {
                table.constraints[column.name] = column.foreign_key_table + "." + column.foreign_key_column;
            }
        }
    });

    return tablesMap;
}
