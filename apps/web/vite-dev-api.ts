import type { Plugin, ViteDevServer } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";

interface HandlerReq {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body: unknown;
}
interface HandlerRes {
  status: (code: number) => HandlerRes;
  json: (body: unknown) => void;
  setHeader: (k: string, v: string) => void;
  end: () => void;
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function wrapRes(res: ServerResponse): HandlerRes {
  let statusCode = 200;
  const api: HandlerRes = {
    status(code) {
      statusCode = code;
      return api;
    },
    json(body) {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.statusCode = statusCode;
      res.end(JSON.stringify(body));
    },
    setHeader(k, v) {
      res.setHeader(k, v);
    },
    end() {
      res.statusCode = statusCode;
      res.end();
    },
  };
  return api;
}

/**
 * Vite plugin: serves the repo-root `api/**` folder as Node functions during
 * `vite dev`, so the same routes that Vercel exposes in prod work locally.
 * URL /api/ai/analyze-food → api/ai/analyze-food.ts default export.
 */
export function devApiPlugin(apiRootAbs: string): Plugin {
  return {
    name: "kaloriya-dev-api",
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? "";
        if (!url.startsWith("/api/") && url !== "/api") return next();

        const pathname = url.split("?")[0]!.replace(/^\/api\//, "");
        const filePath = path.join(apiRootAbs, pathname + ".ts");
        try {
          const modUrl = pathToFileURL(filePath).href + `?t=${Date.now()}`;
          const mod = await server.ssrLoadModule(modUrl);
          const handler = (mod as { default?: (req: HandlerReq, res: HandlerRes) => Promise<void> | void })
            .default;
          if (typeof handler !== "function") {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: { code: "not_found", message: pathname } }));
            return;
          }
          const body = req.method && req.method !== "GET" ? await readJson(req) : {};
          const handlerReq: HandlerReq = {
            method: req.method,
            headers: req.headers as Record<string, string | string[] | undefined>,
            body,
          };
          await handler(handlerReq, wrapRes(res));
        } catch (e) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          const message = e instanceof Error ? e.message : "dev api error";
          res.end(JSON.stringify({ error: { code: "dev_api_failed", message } }));
        }
      });
    },
  };
}
