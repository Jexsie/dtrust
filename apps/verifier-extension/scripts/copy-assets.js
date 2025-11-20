/**
 * Copy assets script
 * Copies manifest.json and public files to dist after build
 */

import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from "fs";
import { join, resolve } from "path";

const distDir = resolve(process.cwd(), "dist");
const publicDir = resolve(process.cwd(), "public");
const manifestSrc = resolve(process.cwd(), "manifest.json");

// Copy manifest.json
if (existsSync(manifestSrc)) {
  copyFileSync(manifestSrc, join(distDir, "manifest.json"));
  console.log("✓ Copied manifest.json");
}

// Copy popup.html to dist root
const popupSrc = join(publicDir, "popup.html");
const popupDest = join(distDir, "popup.html");
if (existsSync(popupSrc)) {
  copyFileSync(popupSrc, popupDest);
  console.log("✓ Copied popup.html");
}

// Copy icons directory
const iconsSrc = join(publicDir, "icons");
const iconsDest = join(distDir, "icons");
if (existsSync(iconsSrc)) {
  function copyRecursive(src, dest) {
    if (!existsSync(dest)) {
      mkdirSync(dest, { recursive: true });
    }

    const entries = readdirSync(src);
    for (const entry of entries) {
      const srcPath = join(src, entry);
      const destPath = join(dest, entry);
      const stat = statSync(srcPath);

      if (stat.isDirectory()) {
        copyRecursive(srcPath, destPath);
      } else {
        copyFileSync(srcPath, destPath);
      }
    }
  }

  copyRecursive(iconsSrc, iconsDest);
  console.log("✓ Copied icons");
}

console.log("✓ Assets copied successfully");
