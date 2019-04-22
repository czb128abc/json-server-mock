import fs from 'fs';
import path from 'path';

// 获取随机整数
export function randomNum(start, end) {
    return Math.round(Math.random() * (end - start)) + start;
}

// 从数组中随机去一个元素
export function randomItem(list, itemNum = 1) {
    if (itemNum > 1) {
        const newList = new Set();
        while (newList.size < itemNum) {
            newList.add(list[randomNum(0, list.length - 1)]);
        }
        return Array.from(newList);
    } else {
        return list[randomNum(0, list.length - 1)];
    }
}


export function randomTitle(start, end = start) {
    const length = randomNum(start, end);
    let title = '';
    for (let i = 0; i < length; i++) {
        title += String.fromCharCode(randomNum(19968, 19968 + 500));
    }
    return title;
}

export function randomDate(start = 0, end = Date.now()) {
    return randomNum(start, end);
}

export function randomLetter(start, end = start) {
    const length = randomNum(start, end);
    let title = '';
    for (let i = 0; i < length; i++) {
        title += String.fromCharCode(randomNum(65, 65 + 52));
    }
    return title;
}

export function randomLowerLetter(start, end = start) {
    const length = randomNum(start, end);
    let title = '';
    for (let i = 0; i < length; i++) {
        title += String.fromCharCode(randomNum(97, 122));
    }
    return title;
}

export function randomUpperLetter(start, end = start) {
    const length = randomNum(start, end);
    let title = '';
    for (let i = 0; i < length; i++) {
        title += String.fromCharCode(randomNum(65, 96));
    }
    return title;
}

// 根据条件过滤数据
export function filter(list, query) {
    let data = list;
    for (const [k] of Object.entries(query)) {
        if (!data.length) return data;
        data = data.filter((v) => {
            if (typeof query[k] === 'string') {
                return !query[k] || `${v[k]}`.includes(query[k]);
            } else {
                return true;
            }
        });
    }
    return data;
}

const EToC = {
    SUCCESS: '成功',
    FAILED: '失败',
    UNPROCESSING: '未报送',
    PROCESSING: '报送中',
};
// 根据条件返回分页数据
export function sendList(req, res, dataList, field, isTrans = true) {
    let param = '{}';
    if (req.body) {
        param = req.body.params;
    } else if (req.query) {
        param = req.query;
    }
    const {
        pageNum = 1, currentPage, pageSize = 1000, ...query
    } = JSON.parse(param);
    const list = filter(dataList, query);
    const reslist = list.slice(pageSize * ((currentPage || pageNum) - 1), pageSize * (currentPage || pageNum));
    reslist.forEach((v, i) => {
        if (!Object.prototype.toString.call(v).indexOf('object') + 1) {
            Object.entries(v).forEach(([k, val]) => {
                if (typeof val === 'string' && (Object.keys(EToC).indexOf(val.toUpperCase()) + 1)) {
                    reslist[i][k] = isTrans ? EToC[val.toUpperCase()] : val;
                }
            });
        }
    });
    res.send({
        result: {
            currentPage: currentPage || pageNum,
            pageSize,
            totalCounts: list.length,
            totalPages: Math.ceil(list.length / pageSize),
            [field]: reslist,
            resultCode: 'UNKNOWN_EXCEPTION',
            success: true,
        },
    });
}

export function sendListPage(req, res, dataList, field, filterCallBack) {
    let param = '{}';
    if (req.body) {
        param = req.body.params;
    } else if (req.query) {
        param = req.query;
    }
    const {
        pageNum = 1, currentPage, pageSize = 1000, ...query
    } = JSON.parse(param);
    let list = filter(dataList, query);
    if (typeof (filterCallBack) === 'function') {
        list = dataList.filter(filterCallBack);
    }
    const reslist = list.slice(pageSize * ((currentPage || pageNum) - 1), pageSize * (currentPage || pageNum));
    reslist.forEach((v, i) => {
        if (!Object.prototype.toString.call(v).indexOf('object') + 1) {
            Object.entries(v).forEach(([k, val]) => {
                if (typeof val === 'string' && (Object.keys(EToC).indexOf(val.toUpperCase()) + 1)) {
                    reslist[i][k] = EToC[val.toUpperCase()];
                }
            });
        }
    });
    res.send({
        result: {
            currentPage: currentPage || pageNum,
            pageSize,
            totalCounts: list.length,
            totalPages: Math.ceil(list.length / pageSize),
            [field]: reslist,
            resultCode: 'UNKNOWN_EXCEPTION',
            success: true,
        },
    });
}

// 递归读取文件件，忽略index文件， return []
export function readDirFiles(pwd) {
    const files = fs.readdirSync(pwd);
    return files.reduce((a, b) => {
        if (!/^index/.test(b)) {
            const bPath = path.join(pwd, b);
            if (fs.statSync(bPath).isDirectory()) {
                return [
                    ...a,
                    ...readDirFiles(bPath),
                ];
            } else {
                return [
                    ...a,
                    // eslint-disable-next-line
                    require(path.join(pwd, b)),
                ];
            }
        } else {
            return a;
        }
    }, []);
}

/**
 * gateway 目录下面 对保存,修改等操作结果,返回成功或失败数据
 */
export function gatewayOperatingResult(isSuccess) {
    const successData = {
        result: {
            success: true,
            resultCode: 'EXECUTE_SUCCESS',
            description: '',
        },
    };
    const failData = {
        result: {
            success: false,
            resultCode: 'UNKNOWN_EXCEPTION',
            description: 'mock data 操作失败',
        },
    };
    return isSuccess ? successData : failData;
}

export function getCurUser() {
    const html = `${fs.readFileSync(path.join(__dirname, '../src/index.ejs'))}`.replace(/(\n|\r)/gm, '');
    const AL_GLOBAL = html.replace(/.*window.AL_GLOBAL\s?=\s?(.*})[^}]+/, '$1').replace(/'/g, '"').replace(/[^:{}\s]+(?=:\s*("|\{|\[|false|true))/g, (a) => `"${a}"`).replace(/,\s*(?=(\}|\]))/g, '');
    const bucUser = JSON.parse(/^{/.test(AL_GLOBAL) ? `${AL_GLOBAL}` : '{}').bucUser || {};
    return bucUser;
}

/**
 * @param req
 * @returns cookie map
 */
export function getCookies(req) {
    const { cookie } = req.headers;
    if (!cookie) return {};
    return cookie.split(';').reduce((a, b) => {
        const [k, v] = b.split('=');
        a[k.trim()] = v.trim();  //eslint-disable-line
        return a;
    }, {});
}
