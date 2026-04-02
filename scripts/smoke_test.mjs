import path from "node:path";
import http from "node:http";
import fs from "node:fs/promises";
import { chromium } from "playwright";

const rootDir = process.cwd();
const targetUrl = process.env.TARGET_URL?.trim() || "";
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

const server = targetUrl
  ? null
  : http.createServer(async (req, res) => {
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

if (server) {
  await new Promise((resolve) => server.listen(4173, "127.0.0.1", resolve));
}

const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1280 } });
  const pageErrors = [];

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  const url = targetUrl || "http://127.0.0.1:4173";
  await page.goto(url);
  await page.click("#startGameBtn");
  await page.waitForSelector("#paperOptions .paper-option");
  await page.waitForSelector("#parameterControls input[type='range']");

  const paperCount = await page.locator("#paperOptions .paper-option").count();
  const sliderCount = await page.locator("#parameterControls input[type='range']").count();

  if (paperCount !== 3) {
    throw new Error(`Expected 3 paper options, received ${paperCount}`);
  }

  if (sliderCount !== 3) {
    throw new Error(`Expected 3 parameter sliders, received ${sliderCount}`);
  }

  await page.fill("#nicknameInput", "SmokePilot");
  await page.click("#goLaunchBtn");
  await page.waitForSelector("#launchPad");

  const launchPad = page.locator("#launchPad");
  const box = await launchPad.boundingBox();

  if (!box) {
    throw new Error("Launch pad did not render.");
  }

  await page.mouse.move(box.x + box.width / 2, box.y + box.height - 28);
  await page.mouse.down();
  await page.waitForTimeout(620);
  await page.mouse.move(box.x + box.width / 2, box.y + 42, { steps: 10 });
  const maxAngleText = await page.locator("#angleReadout").textContent();
  await page.mouse.move(box.x + box.width * 0.72, box.y + 60, { steps: 10 });
  const angleText = await page.locator("#angleReadout").textContent();
  await page.mouse.up();
  await page.waitForFunction(() => {
    const text = document.querySelector("#resultDistance")?.textContent ?? "";
    return text !== "0.0 m";
  }, null, { timeout: 25000 });

  const resultDistanceText = await page.locator("#resultDistance").textContent();
  const resultDistance = Number.parseFloat(resultDistanceText ?? "0");

  if (!Number.isFinite(resultDistance) || resultDistance <= 0) {
    throw new Error(`Expected a positive result distance, got "${resultDistanceText}"`);
  }

  if (!angleText || angleText === "28°") {
    throw new Error(`Expected throw angle to change during drag, got "${angleText}"`);
  }

  if (!maxAngleText || Number.parseFloat(maxAngleText) < 89) {
    throw new Error(`Expected throw angle to reach near 90 degrees, got "${maxAngleText}"`);
  }

  if (pageErrors.length > 0) {
    throw new Error(`Page errors: ${pageErrors.join(" | ")}`);
  }

  console.log(
    JSON.stringify(
      {
        url,
        paperCount,
        sliderCount,
        maxAngleText,
        angleText,
        resultDistance,
      },
      null,
      2
    )
  );
} finally {
  await browser.close();
  if (server) {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
}
