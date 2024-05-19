
import Knex from 'knex';
import { SchemaInspector } from 'knex-schema-inspector';

console.log(process.env.DATABASE_URL)
const database = Knex({
    client: process.env.DATABASE_ENGINE,
    connection: JSON.parse(process.env.DATABASE_CONN),
});

const inspector = SchemaInspector(database);


export async function logTables() {
    const tables = await inspector.tableInfo();
    const columns = await inspector.columnInfo();
    return tables;
}
