// next.config.js
const path = require('path')

module.exports = {
  // top-level turbopack config (Next 16+)
  turbopack: {
    // set root to the folder that contains your package.json for this app
    // '.' means repo root; adjust if your Next app lives in a subfolder, e.g. './apps/web'
    root: path.resolve(__dirname, '.')
  },

  // Keep other Next config here:
  reactStrictMode: true,
  // ...any other existing keys (preserve them)
}
