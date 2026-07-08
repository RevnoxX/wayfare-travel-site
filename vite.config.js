import { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      host: '0.0.0.0',
      port: 3000
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          login: resolve(__dirname, 'login.html'),
          dashboard: resolve(__dirname, 'dashboard.html'),
          explore: resolve(__dirname, 'explore.html'),
          booking: resolve(__dirname, 'booking.html'),
          contact: resolve(__dirname, 'contact.html'),
          payment: resolve(__dirname, 'payment.html'),
          wayfareadmin: resolve(__dirname, 'wayfareadmin/index.html')
        }
      }
    },
    plugins: [
      {
        name: 'html-transform',
        transformIndexHtml(html) {
          return html.replace(
            '<head>',
            `<head>\n  <script>\n    window.ENV = {\n      SUPABASE_URL: ${JSON.stringify(env.VITE_SUPABASE_URL || env.SUPABASE_URL || '')},\n      SUPABASE_ANON_KEY: ${JSON.stringify(env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || '')}\n    };\n  </script>`
          );
        }
      }
    ]
  };
});
