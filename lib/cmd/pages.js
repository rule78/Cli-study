const co = require('co');
const prompt = require('co-prompt');
const fs = require('fs');
const { stat } = fs;

const tpls = require('../../templates');

/**
 * 首字母转换成小写
 * @param { String } str 目标字符串
 * @return { String } strTemp
 */
const toLowerStr = (str) => {
    let strTemp = '';
    for (let i = 0; i < str.length; i += 1) {
        if (i === 0) {
            strTemp += str[i].toLowerCase();
        } else {
            strTemp += str[i];
        }
    }
    return strTemp;
}

// 在复制目录前需要判断该目录是否存在，不存在需要先创建目录
const exists = (src, dst, callback, replaceRule) => {
    fs.exists(dst, isExists => {
        if (isExists) {
            callback(src, dst, replaceRule);
        } else {
            // 根据path替换文件名
            const { fatherName, pageName } = replaceRule;
            let dir = dst;
            dir = dir.replace('FATHERNAME', fatherName).replace('PAGENAME', pageName);
            fs.mkdir(dir, () => {
                callback(src, dir, replaceRule);
            });
        }
    });
};

/*
 * 复制目录中的所有文件包括子目录
 * @param{ String } src 需要复制的目录
 * @param{ String } dst 复制到指定的目录
 * @param{ Object } rules 替换规则
 */
const copy = (src, dst, rules) => {
    // 读取目录中的所有文件/目录
    fs.readdir(src, (err, paths) => {
        if (err) {
            throw err;
        }
        paths.forEach(path => {
            const targetSrc = `${src}/${path}`;
            let targetDst = `${dst}/${path}`;
            stat(targetSrc, (_err, st) => {
                if (_err) {
                    throw _err;
                }
                // 判断是否为文件
                if (st.isFile()) {
                    let str = '';
                    fs.readFile(targetSrc, 'utf-8', (error, data) => {
                        if (!error) {
                            const { regName, BlockName, regModalName, modalName, regPageName, pageName } = rules;
                            // 宏替换
                            str = data.toString();
                            str = str
                                .replace(regName, BlockName)
                                .replace(regModalName, modalName)
                                .replace(regPageName, pageName);
                            targetDst = targetDst.replace(regModalName, modalName).replace(regPageName, pageName);
                            fs.writeFile(targetDst, str, _error => {
                                if (!_error) {
                                    console.log(`已写入${targetDst}`);
                                }
                            });
                        }
                    });
                }
                // 如果是目录则递归调用自身
                else if (st.isDirectory()) {
                    exists(targetSrc, targetDst, copy, rules);
                }
            });
        });
    });
};

// main主函数
const main = i => {
    const path = i.targetPath;
    const initialPath = i.path;
    const tplPath = i.tplPath;
    if (initialPath.includes('/')) {
        const fatherName = initialPath.split('/')[0];
        const pageName = initialPath.split('/')[1];
        const replaceRule = {
            regName: new RegExp('CNNAME', 'g'),
            BlockName: i.blockName || '',
            regModalName: new RegExp('MODALNAME', 'g'),
            modalName: toLowerStr(fatherName + pageName),
            regPageName: new RegExp('PAGENAME', 'g'),
            pageName,
            fatherName,
        };
        exists(tplPath, path, copy, replaceRule);
    } else {
        console.log('path参数需添加二级路由');
    }
};

module.exports = () => {
    co(function* () {
        const path = yield prompt('Type your page tpl path:');
        return new Promise((resolve, reject) => {
            resolve({
                path,
                targetPath: tpls.pages.resolvePath,
                tplPath: tpls.pages.tplPath
            });
        });
    }).then(main);
}