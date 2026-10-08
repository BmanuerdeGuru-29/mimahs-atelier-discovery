// Optional: tiny local server for previewing (node serve.js). The questionnaire also works by double-clicking index.html.
const http = require("http"), fs = require("fs"), path = require("path");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".md": "text/markdown" };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const f = path.join(__dirname, path.normalize(p));
  if (!f.startsWith(__dirname)) { res.writeHead(403); return res.end("Forbidden"); }
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "Content-Type": (types[path.extname(f)] || "application/octet-stream") + "; charset=utf-8" });
    res.end(d);
  });
}).listen(5177, () => console.log("http://localhost:5177"));
