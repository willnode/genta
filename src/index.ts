import { logTables } from './db';
import { schemaTable, schemaToQuery } from './schema';
import { runConversation } from './openai';
import { readFileSync } from "fs";
import { join } from "path";
import { serve } from "bun";

const isDevelopment = process.env.NODE_ENV === 'development';

function json(r) {
  return new Response(JSON.stringify(r), {
    headers: {
      'content-type': 'application/json'
    },
    status: 200,
  })
}
// Create the server
serve({
  development: true,
  async fetch(req) {
    const url = new URL(req.url);
    if (req.method === "POST" && url.pathname === "/api/resolve-schema") {
      const body = await req.json();
      const tables = await logTables(body.engine, body.connection);
      return json(tables);
    } else if (req.method === "POST" && url.pathname === "/api/solve-query") {
      try {
        const body = await req.json();
        const schema = schemaTable(body.schema);
        const tree = JSON.parse(await runConversation(schema, body.query) || "");
        const result = schemaToQuery(tree);
        return json({ schema, tree, result });
      } catch (error) {
        console.error(error);
        return json({ error: error.message || error });
      }
    } else if (url.pathname.startsWith('/api/')) {
      return new Response("Not Found", { status: 404 });
    } else {
      return handleStaticFiles(req);
    }
  },
});


async function handleStaticFiles(req) {
  const url = new URL(req.url);

  if (isDevelopment) {
    // Proxy to localhost:5173 in development
    return proxyToDevServer(req);
  } else {
    // Serve static files from /web/dist in production
    const filePath = join(import.meta.dir, 'web', 'dist', url.pathname === '/' ? 'index.html' : url.pathname);

    try {
      const file = readFileSync(filePath);
      const ext = filePath.split('.').pop() || '';
      const mimeTypes = {
        'html': 'text/html',
        'js': 'application/javascript',
        'css': 'text/css',
        'json': 'application/json',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'gif': 'image/gif',
        'svg': 'image/svg+xml',
        'ico': 'image/x-icon',
      };
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      return new Response(file, { status: 200, headers: { "Content-Type": contentType } });
    } catch (error) {
      return new Response("Not Found", { status: 404 });
    }
  }
}

async function proxyToDevServer(req) {
  const devUrl = new URL(req.url);
  devUrl.host = 'localhost:5173';
  devUrl.protocol = 'http';

  const proxyReq = new Request(devUrl, {
    method: req.method,
    headers: req.headers,
    body: req.body,
  });

  return fetch(proxyReq);
}
