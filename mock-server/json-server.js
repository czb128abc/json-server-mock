import path from "path";
import jsonServer from "json-server";
import { readDirFiles } from "./utils";
console.log(".....load json server", process.cwd());
const pathUrl = process.cwd();
// const pathUrl = __dirname;
// const pathUrl = "/Users/czb/Desktop/code/vue_start/sitemonitor_ui/mock";

function mockServerStart(
  thePath = path.resolve(pathUrl, "./mock/api"),
  port = 8001
) {
  console.log("thePath", thePath);
  const apis = readDirFiles(thePath);
  const routeMap = apis.reduce((a, b) => {
    return {
      ...a,
      ...(b.default ? b.default : b)
    };
  }, {});
  console.log("routeMap", routeMap);
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
  Object.keys(routeMap).forEach(url => {
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
  });
  server.listen(port, () => {
    console.log("JSON Server is running");
  });
}

export default mockServerStart;
