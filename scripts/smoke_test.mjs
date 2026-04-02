import path from "node:path";
import http from "node:http";
import fs from "node:fs/promises";
import { chromium } from "playwright";

const rootDir = process.cwd();
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

const server = http.createServer(async (req, res) => {
  const urlPath = req.url === "/" ? "/index.html" : decodeURIComponent(req.url || "/index.html");
  const filePath = path.join(rootDir, urlPath.replace(/^\/+/, ""));

  try {
    const content = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, {
      "content-type": mimeTypes[ext] || "application/octet-stream",
      "cache-control": "no-store",
    });
    res.end(content);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
});

await new Promise((resolve) => server.listen(4173, "127.0.0.1", resolve));

const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1280 } });
  const pageErrors = [];

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  await page.goto("http://127.0.0.1:4173");
  await page.waitForSelector("#paperOptions .paper-option");
  await page.waitForSelector("#parameterControls input[type='range']");

  const paperCount = await page.locator("#paperOptions .paper-option").count();
  const sliderCount = await page.locator("#parameterControls input[type='range']").count();

  if (paperCount !== 3) {
    throw new Error(`Expected 3 paper options, received ${paperCount}`);
  }

  if (sliderCount !== 4) {
    throw new Error(`Expected 4 parameter sliders, received ${sliderCount}`);
  }

  await page.fill("#nicknameInput", "SmokePilot");
  await page.click("#randomizeBtn");

  const launchPad = page.locator("#launchPad");
  const box = await launchPad.boundingBox();

  if (!box) {
    throw new Error("Launch pad did not render.");
  }

  await page.mouse.move(box.x + box.width / 2, box.y + box.height - 28);
  await page.mouse.down();
  await page.waitForTimeout(620);
  await page.mouse.move(box.x + box.width / 2, box.y + 42, { steps: 12 });
  await page.mouse.up();

  await page.waitForTimeout(2600);

  const resultDistanceText = await page.locator("#resultDistance").textContent();
  const resultDistance = Number.parseFloat(resultDistanceText ?? "0");

  if (!Number.isFinite(resultDistance) || resultDistance <= 0) {
    throw new Error(`Expected a positive result distance, got "${resultDistanceText}"`);
  }

  if (pageErrors.length > 0) {
    throw new Error(`Page errors: ${pageErrors.join(" | ")}`);
  }

  console.log(
    JSON.stringify(
      {
        url: "http://127.0.0.1:4173",
        paperCount,
        sliderCount,
        resultDistance,
      },
      null,
      2
    )
  );
} finally {
  await browser.close();
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
}
