// scripts/generate-static-html.js
// Genere un HTML statique pour chaque route (statique + une par produit),
// a partir du build Vite.
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

// URL de l'API backend (meme variable que le frontend utilise)
const API_URL = process.env.VITE_API_URL || "https://api.sonshop.beauty";

// Routes statiques a pre-rendre pour le SEO
const STATIC_ROUTES = [
  "/",
  "/products",
  "/about",
  "/contact",
  "/cgv",
  "/returns",
];

// Recupere tous les slugs de produits en parcourant la pagination de l'API
async function getAllProductSlugs() {
  const slugs = [];
  let page = 1;
  const limit = 100;

  while (true) {
    const url = `${API_URL}/api/products?page=${page}&limit=${limit}`;
    console.log(`Recuperation des produits : ${url}`);
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Erreur API produits (page ${page}) : ${res.status}`);
      break;
    }
    const json = await res.json();
    const products = json.data || [];

    for (const p of products) {
      if (p.slug) slugs.push(p.slug);
    }

    // Arrete si on a recupere moins que la limite (derniere page)
    if (products.length < limit) break;
    page += 1;
  }

  console.log(`${slugs.length} produits trouves.`);
  return slugs;
}

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

async function renderRoute(browser, route) {
  const page = await browser.newPage();
  const url = `${BASE_URL}${route}`;
  console.log(`Rendu de ${url} ...`);

  try {
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500));

    const html = await page.content();

    const outDir = route === "/" ? distDir : path.join(distDir, route);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "index.html"), html, "utf-8");

    console.log(`Ecrit : ${path.join(outDir, "index.html")}`);
  } catch (err) {
    console.error(`Erreur rendu ${url} :`, err.message);
  } finally {
    await page.close();
  }
}

async function run() {
  console.log("Demarrage du serveur de preview (vite preview)...");
  const server = spawn("npx", ["vite", "preview", "--port", String(PORT), "--strictPort"], {
    stdio: "inherit",
    shell: true,
  });

  await waitForServer(BASE_URL);
  console.log("Serveur pret.");

  // Recupere les slugs produits AVANT de lancer le navigateur
  let productSlugs = [];
  try {
    productSlugs = await getAllProductSlugs();
  } catch (err) {
    console.error("Impossible de recuperer les produits, on continue sans :", err.message);
  }

  const productRoutes = productSlugs.map((slug) => `/products/${slug}`);
  const ALL_ROUTES = [...STATIC_ROUTES, ...productRoutes];

  console.log(`Lancement du navigateur pour ${ALL_ROUTES.length} pages...`);
  const browser = await getBrowser();

  for (const route of ALL_ROUTES) {
    await renderRoute(browser, route);
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
