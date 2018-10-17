import path from 'path';
import jsonServer from 'json-server';
import { readDirFiles } from './utils';


const apis = readDirFiles(path.resolve(__dirname, './api'));

const routeMap = apis.reduce((a, b) => {
    return {
        ...a,
        ...(b.default ? b.default : b),
    };
}, {});


console.log('routeMap', routeMap);
const server = jsonServer.create();
const middlewares = jsonServer.defaults();
const allowCrossDomain = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');// 自定义中间件，设置跨域需要的响应头。
    next();
};
server.use(jsonServer.bodyParser);
server.use(middlewares);
server.use(allowCrossDomain);
// server.use(router);
Object.keys(routeMap).forEach(url => {
    if (url.includes('POST ')) {
        if (typeof routeMap[url] === 'function') {
            server.post(url.replace('POST ', ''), routeMap[url]);
        } else if (typeof routeMap[url] === 'object') {
            server.post(url.replace('POST ', ''), (req, res) => {
                res.send(routeMap[url]);
            });
        }
    }
    if (url.includes('GET ')) {
        // server.get(url.replace('GET ', ''), routeMap[url]);
        if (typeof routeMap[url] === 'function') {
            server.get(url.replace('GET ', ''), routeMap[url]);
        } else if (typeof routeMap[url] === 'object') {
            server.get(url.replace('GET ', ''), (req, res) => {
                res.send(routeMap[url]);
            });
        }
    }
});
server.listen(3000, () => {
    console.log('JSON Server is running');
});