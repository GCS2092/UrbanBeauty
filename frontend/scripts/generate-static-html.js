// scripts/generate-static-html.js
// Genere un HTML statique pour chaque route listee, a partir du build Vite.
// Usage : node scripts/generate-static-html.js (a lancer APRES "vite build")

import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "..", "dist");
const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}`;
const isVercel = !!process.env.VERCEL;

// Ajoute ici toutes les routes importantes a pre-rendre pour le SEO
const ROUTES = [
  "/",
  "/produits",
  "/categories",
];

function waitForServer(url, timeout = 15000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = async () => {
      try {
        const res = await fetch(url);
        if (res.ok || res.status < 500) return resolve();
      } catch (e) {}
      if (Date.now() - start > timeout) return reject(new Error("Timeout serveur preview"));
      setTimeout(check, 300);
    };
    check();
  });
}

async function getBrowser() {
  if (isVercel) {
    // Sur Vercel : Chromium special serverless (toutes ses dependances incluses)
    const chromium = (await import("@sparticuz/chromium")).default;
    const puppeteer = await import("puppeteer-core");
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  } else {
    // En local : Chrome standard telecharge par puppeteer
    const puppeteer = await import("puppeteer");
    return puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
}

async function run() {
  console.log("Demarrage du serveur de preview (vite preview)...");
  const server = spawn("npx", ["vite", "preview", "--port", String(PORT), "--strictPort"], {
    stdio: "inherit",
    shell: true,
  });

  await waitForServer(BASE_URL);
  console.log("Serveur pret. Lancement du navigateur...");

  const browser = await getBrowser();

  for (const route of ROUTES) {
    const page = await browser.newPage();
    const url = `${BASE_URL}${route}`;
    console.log(`Rendu de ${url} ...`);

    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500));

    const html = await page.content();

    const outDir = route === "/" ? distDir : path.join(distDir, route);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "index.html"), html, "utf-8");

    console.log(`Ecrit : ${path.join(outDir, "index.html")}`);
    await page.close();
  }

  await browser.close();
  server.kill();
  console.log("Pre-rendu termine.");
  process.exit(0);
}

run().catch((err) => {
  console.error("Erreur pendant le pre-rendu :", err);
  process.exit(1);
});