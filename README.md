# json-server-mock
# 步骤
## copy ./mock ./mock-server 目录
## npm run mock:babel && install
```
npm install --save-dev @babel/node @babel/preset-env @babel/core  json-server mockjs chokidar

// 
npm install --save-dev babel-node babel-preset-env babel-core  json-server mockjs chokidar
```
## npm run mock && install
```
npm install --save-dev @babel/preset-env @babel/core  json-server mockjs chokidar
```
## npm run mock:supervisor && install
```
npm install --save-dev @babel/preset-env @babel/core  json-server mockjs chokidar supervisor
```
(express 可以动态加载路由吗？)[https://segmentfault.com/q/1010000009694918]

安装 npm i supervisor -g
使用supervisor app.js 启动
后面则会自动检测你的文件变化，一旦变化则会自动重启