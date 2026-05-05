/**
 * Phusion Passenger entry point — cPanel "Setup Node.js App" tarafından
 * çağrılır. Next.js'i custom-server pattern ile programatik olarak başlatır.
 *
 * cPanel/Passenger akışı:
 *   1. Passenger bu dosyayı çalıştırır.
 *   2. Biz Next.js'i hazırlayıp HTTP server.listen(PORT) ile dinlemeye başlarız.
 *   3. Passenger .listen()'i kendisi sarmaladığı için PORT bir Unix socket'e
 *      veya stdio'ya bağlanır; ön planda LiteSpeed/Apache reverse-proxy yapar.
 *
 * Önemli:
 *   - Bu dosya Next compiler/bundler'dan geçmez. Salt CommonJS, ES2020 sözdizimi.
 *   - "next build" cPanel terminalinde manuel çalıştırılır (CI/CD yok).
 *   - NODE_ENV cPanel UI'dan "Production" seçilirse otomatik gelir.
 */

const { createServer } = require("node:http");
const next = require("next");

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";

const app = next({ dev });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => {
      handle(req, res);
    }).listen(port, () => {
      console.log(
        `[next] hazır — port ${port}, NODE_ENV=${process.env.NODE_ENV ?? "development"}`,
      );
    });
  })
  .catch((err) => {
    console.error("[next] başlatma hatası:", err);
    process.exit(1);
  });
