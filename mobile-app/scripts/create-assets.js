const fs = require("fs");
const path = require("path");

// Minimal valid 1x1 PNG (blue pixel) - Expo will scale splash/icon placeholders
const PNG_1X1_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const assetsDir = path.join(__dirname, "..", "assets");
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

const buffer = Buffer.from(PNG_1X1_BASE64, "base64");
["icon.png", "splash.png", "adaptive-icon.png"].forEach((file) => {
  fs.writeFileSync(path.join(assetsDir, file), buffer);
});

console.log("Created placeholder assets in assets/");
