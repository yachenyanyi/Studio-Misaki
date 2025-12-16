import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-and-bundle-django-static',
      configureServer(server) {
        const projectRoot = process.cwd();
        const djangoStaticRoot = path.resolve(projectRoot, '..', 'backend', 'static');

        server.middlewares.use(async (req, res, next) => {
          const url = req.url || '';
          if (!url.startsWith('/static/')) return next();

          const cleanPath = url.split('?')[0].split('#')[0];
          const rel = cleanPath.replace(/^\/static\//, '');
          const filePath = path.resolve(djangoStaticRoot, rel);

          if (!filePath.startsWith(djangoStaticRoot)) {
            res.statusCode = 403;
            res.end('Forbidden');
            return;
          }

          try {
            const stat = await fs.promises.stat(filePath);
            if (!stat.isFile()) return next();

            const ext = path.extname(filePath).toLowerCase();
            const contentType =
              ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
              ext === '.png' ? 'image/png' :
              ext === '.gif' ? 'image/gif' :
              ext === '.webp' ? 'image/webp' :
              ext === '.svg' ? 'image/svg+xml' :
              ext === '.ico' ? 'image/x-icon' :
              ext === '.css' ? 'text/css; charset=utf-8' :
              ext === '.js' ? 'text/javascript; charset=utf-8' :
              ext === '.json' ? 'application/json; charset=utf-8' :
              'application/octet-stream';

            res.setHeader('Content-Type', contentType);
            fs.createReadStream(filePath).pipe(res);
          } catch {
            return next();
          }
        });
      },
      async closeBundle() {
        const projectRoot = process.cwd();
        const djangoStaticRoot = path.resolve(projectRoot, '..', 'backend', 'static');
        const distStaticRoot = path.resolve(projectRoot, 'dist', 'static');

        try {
          const stat = await fs.promises.stat(djangoStaticRoot);
          if (!stat.isDirectory()) return;
        } catch {
          return;
        }

        await fs.promises.rm(distStaticRoot, { recursive: true, force: true });
        await fs.promises.mkdir(distStaticRoot, { recursive: true });
        await fs.promises.cp(djangoStaticRoot, distStaticRoot, { recursive: true });
      },
    },
  ],
  server: {
    host: '0.0.0.0', // 允许局域网/公网访问
    allowedHosts: ['frp-cup.com', 'localhost'], // 显式允许的域名列表
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    }
  }
})
