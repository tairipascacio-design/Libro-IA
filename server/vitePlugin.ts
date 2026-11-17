import type { Plugin, ViteDevServer } from "vite";
import {
  handleOrganizeDictation,
  handleRefineChapter,
  handleContinuationPrompts,
  handleDownloadAndroidScript,
} from "./apiRouter";

export function bookApiPlugin(): Plugin {
  return {
    name: "book-api-middleware",
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith("/api/")) {
          return next();
        }

        // Helper to parse JSON body
        const parseJsonBody = (): Promise<any> => {
          return new Promise((resolve) => {
            let body = "";
            req.on("data", (chunk) => {
              body += chunk;
            });
            req.on("end", () => {
              try {
                resolve(body ? JSON.parse(body) : {});
              } catch {
                resolve({});
              }
            });
          });
        };

        const jsonReq: any = req;
        const jsonRes: any = res;

        // Add standard Express-like json and status helpers if not present
        if (!jsonRes.json) {
          jsonRes.json = (data: any) => {
            jsonRes.setHeader("Content-Type", "application/json");
            jsonRes.end(JSON.stringify(data));
          };
        }
        if (!jsonRes.status) {
          jsonRes.status = (code: number) => {
            jsonRes.statusCode = code;
            return jsonRes;
          };
        }

        if (req.method === "POST") {
          jsonReq.body = await parseJsonBody();
        }

        const url = req.url.split("?")[0];

        if (url === "/api/organize-dictation" && req.method === "POST") {
          return handleOrganizeDictation(jsonReq, jsonRes);
        } else if (url === "/api/refine-chapter" && req.method === "POST") {
          return handleRefineChapter(jsonReq, jsonRes);
        } else if (url === "/api/continuation-prompts" && req.method === "POST") {
          return handleContinuationPrompts(jsonReq, jsonRes);
        } else if (url === "/api/download-android-script" && req.method === "GET") {
          return handleDownloadAndroidScript(jsonReq, jsonRes);
        }

        next();
      });
    },
  };
}
