require("@babel/register")({
  presets: ["@babel/preset-env"]
});
const mockServerStart = require("./json-server.js").default;

module.exports = mockServerStart;
