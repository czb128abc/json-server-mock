import path from "path";
import chokidar from "chokidar";
import jsonServer from "json-server";
import { readDirFiles } from "./utils";
console.log(".....load json server", process.cwd());
const pathUrl = process.cwd();
// const pathUrl = __dirname;
// const pathUrl = "/Users/czb/Desktop/code/vue_start/sitemonitor_ui/mock";

/**
 * 代码参考  https://github.com/PanJiaChen/vue-element-admin.git
 * vue-element-admin/mock/mock-server.js
 */
function unregisterRoutes() {
  Object.keys(require.cache).forEach(i => {
    if (i.includes("/mock")) {
      delete require.cache[require.resolve(i)];
    }
  });
}

function registerRoutes(server, thePath) {
  const apis = readDirFiles(thePath);
  const routeMap = apis.reduce((a, b) => {
    return {
      ...a,
      ...(b.default ? b.default : b)
    };
  }, {});
  let mockLastIndex = 0;
  const mockRoutesLength = Object.keys(routeMap).length;
  Object.keys(routeMap)
    .filter(url => `${url}`.includes("POST") || `${url}`.includes("GET"))
    .forEach(url => {
      console.info("url", url);
      if (url.includes("POST ")) {
        if (typeof routeMap[url] === "function") {
          server.post(url.replace("POST ", ""), routeMap[url]);
        } else if (typeof routeMap[url] === "object") {
          server.post(url.replace("POST ", ""), (req, res) => {
            res.send(routeMap[url]);
          });
        }
      }
      if (url.includes("GET ")) {
        // server.get(url.replace('GET ', ''), routeMap[url]);
        if (typeof routeMap[url] === "function") {
          server.get(url.replace("GET ", ""), routeMap[url]);
        } else if (typeof routeMap[url] === "object") {
          server.get(url.replace("GET ", ""), (req, res) => {
            res.send(routeMap[url]);
          });
        }
      }
      mockLastIndex = server._router.stack.length;
    });
  return {
    mockRoutesLength: mockRoutesLength,
    mockStartIndex: mockLastIndex - mockRoutesLength
  };
}

function mockServerStart(
  thePath = path.resolve(pathUrl, "./mock/api"),
  port = 8001
) {
  console.log("thePath", thePath);

  const server = jsonServer.create();
  const middlewares = jsonServer.defaults();
  const allowCrossDomain = (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // 自定义中间件，设置跨域需要的响应头。
    next();
  };
  server.use(jsonServer.bodyParser);
  server.use(middlewares);
  server.use(allowCrossDomain);
  // server.use(router);
  let mapRoutes = registerRoutes(server, thePath);
  chokidar
    .watch("./mock_none", {
      persistent: true,
      ignoreInitial: true
    })
    .on("all", (event, path) => {
      console.log("----------------------->all", event);
      if (event === "change" || event === "add") {
        // server._router.stack = [];
        server._router.stack.splice(
          mapRoutes.mockStartIndex,
          mapRoutes.mockRoutesLength
        );
        // clear routes cache
        unregisterRoutes();

        mapRoutes = registerRoutes(server, thePath);

        console.info(`\n > Mock Server hot reload success! changed  ${path}`);
      }
    });
  server.listen(port, () => {
    console.log("======== JSON Server is running ========");
    console.log("======== JSON Server is running ========");
    console.log("======== JSON Server is running ========");
  });
}

export default mockServerStart;
