import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [
        {
          name: 'prompt-json-api',
          configureServer(server) {
            const root = __dirname;
            const defaultPath = path.resolve(root, 'default_prompt.json');
            const customPath = path.resolve(root, 'custom_prompt.json');

            function readJsonSafe(filePath: string) {
              try {
                if (!fs.existsSync(filePath)) return {};
                const raw = fs.readFileSync(filePath, 'utf-8');
                return raw.trim() ? JSON.parse(raw) : {};
              } catch {
                return {};
              }
            }

            function writeJsonSafe(filePath: string, data: any) {
              try {
                const json = JSON.stringify(data, null, 2);
                fs.writeFileSync(filePath, json, 'utf-8');
                return true;
              } catch {
                return false;
              }
            }

            async function readBody(req: any): Promise<any> {
              return await new Promise((resolve) => {
                let body = '';
                req.on('data', (chunk: any) => (body += chunk));
                req.on('end', () => {
                  try {
                    resolve(body ? JSON.parse(body) : {});
                  } catch {
                    resolve({});
                  }
                });
              });
            }

            // 监听文件变更并通知客户端（HMR 自定义事件）
            try {
              server.watcher.add([defaultPath, customPath]);
              const notify = () => server.ws.send({ type: 'custom', event: 'prompts-changed' });
              server.watcher.on('change', (changedPath) => {
                if (changedPath === defaultPath || changedPath === customPath) {
                  notify();
                }
              });
            } catch {}

            server.middlewares.use(async (req, res, next) => {
              const rawUrl = req.url || '';
              let pathname = rawUrl;
              try {
                const u = new URL(rawUrl, 'http://localhost');
                pathname = u.pathname;
              } catch {}

              if (pathname === '/api/prompts/default' && req.method === 'GET') {
                const data = readJsonSafe(defaultPath);
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Cache-Control', 'no-store');
                res.end(JSON.stringify(data));
                return;
              }

              if (pathname === '/api/prompts/custom' && req.method === 'GET') {
                const data = readJsonSafe(customPath);
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Cache-Control', 'no-store');
                res.end(JSON.stringify(data));
                return;
              }

              if (pathname === '/api/prompts/custom' && req.method === 'POST') {
                const body = await readBody(req);
                const { key, en_name, zh_name, en_prompt, zh_prompt, icon, type } = body || {};
                const data = readJsonSafe(customPath);
                // 生成 key：未提供则使用时间戳
                const k = typeof key === 'string' && key.trim() ? key.trim() : ('custom_' + Date.now());
                const name = typeof en_name === 'string' && en_name.trim() ? en_name.trim() : '';
                const prompt = typeof en_prompt === 'string' && en_prompt.trim() ? en_prompt.trim() : '';
                data[k] = {
                  en_name: name,
                  zh_name: (typeof zh_name === 'string' && zh_name.trim()) ? zh_name.trim() : name,
                  en_prompt: prompt,
                  zh_prompt: (typeof zh_prompt === 'string' && zh_prompt.trim()) ? zh_prompt.trim() : prompt,
                  ...(typeof icon === 'string' && icon.trim() ? { icon: icon.trim() } : {}),
                  ...(typeof type === 'string' && type.trim() ? { type: type.trim() } : {}),
                };
                const ok = writeJsonSafe(customPath, data);
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = ok ? 200 : 500;
                res.end(JSON.stringify({ ok, key: k }));
                try { server.ws.send({ type: 'custom', event: 'prompts-changed' }); } catch {}
                return;
              }

              if (pathname?.startsWith('/api/prompts/custom/') && req.method === 'DELETE') {
                const parts = pathname.split('/');
                const k = decodeURIComponent(parts[parts.length - 1] || '');
                const data = readJsonSafe(customPath);
                if (k && k in data) {
                  delete data[k];
                  const ok = writeJsonSafe(customPath, data);
                  res.setHeader('Content-Type', 'application/json');
                  res.statusCode = ok ? 200 : 500;
                  res.end(JSON.stringify({ ok }));
                  try { server.ws.send({ type: 'custom', event: 'prompts-changed' }); } catch {}
                } else {
                  res.statusCode = 404;
                  res.end(JSON.stringify({ ok: false, error: 'Not found' }));
                }
                return;
              }

              if (pathname === '/api/prompts/custom' && req.method === 'DELETE') {
                const ok = writeJsonSafe(customPath, {});
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = ok ? 200 : 500;
                res.end(JSON.stringify({ ok }));
                try { server.ws.send({ type: 'custom', event: 'prompts-changed' }); } catch {}
                return;
              }

              next();
            });
          },
          // 预览服务器同样提供接口（适用于 vite preview）
          configurePreviewServer(server) {
            const root = __dirname;
            const defaultPath = path.resolve(root, 'default_prompt.json');
            const customPath = path.resolve(root, 'custom_prompt.json');

            function readJsonSafe(filePath: string) {
              try {
                if (!fs.existsSync(filePath)) return {} as any;
                const raw = fs.readFileSync(filePath, 'utf-8');
                return raw.trim() ? JSON.parse(raw) : ({} as any);
              } catch {
                return {} as any;
              }
            }

            server.middlewares.use(async (req: any, res: any, next: any) => {
              const rawUrl = req.url || '';
              let pathname = rawUrl;
              try {
                const u = new URL(rawUrl, 'http://localhost');
                pathname = u.pathname;
              } catch {}
              if (pathname === '/api/prompts/default' && req.method === 'GET') {
                const data = readJsonSafe(defaultPath);
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Cache-Control', 'no-store');
                res.end(JSON.stringify(data));
                return;
              }
              if (pathname === '/api/prompts/custom' && req.method === 'GET') {
                const data = readJsonSafe(customPath);
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Cache-Control', 'no-store');
                res.end(JSON.stringify(data));
                return;
              }
              next();
            });
          }
        },
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
