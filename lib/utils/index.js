const fs = require('fs');
const path = require('path');

const copyFile = function (srcPath, tarPath, cb, replaceRule) {
    // 根据path替换文件名
    const { projectName } = replaceRule;
    // 异步读取
    fs.readFile(srcPath, 'utf-8', (error, data) => {
        if (!error) {
            let str = data.toString(); // 宏替换
            str = str.replace(new RegExp('PROJECTNAME', 'g'), projectName);
            fs.writeFile(tarPath.replace('PROJECTNAME', projectName), str, _error => {
                cb && cb();
            });
        } else {
            cb && cb(error);
        }
    });
}

/*
 * 复制目录中的所有文件到指定的目录
 * @param{ String } srcDir 需要复制的目录 proName/tsdx/
 * @param{ String } tarDir 复制到指定的目录 proName/
 * @param{ Func } cb 复制到指定的目录 proName/
 * @param{ Object } replaceRule 宏替换规则
 */
const copyFolder = function (srcDir, tarDir, cb, replaceRule) {
    // 根据path替换文件名
    const { projectName } = replaceRule;
    fs.readdir(srcDir, function (err, files) {
        let count = 0;
        let checkEnd = function () {
            ++count == files.length && cb && cb();
        }
        if (err) {
            checkEnd();
            return;
        }
        files.forEach(function (file) {
            let srcPath = path.join(srcDir, file)
            let tarPath = path.join(tarDir, file)

            fs.stat(srcPath, function (err, stats) {
                if (stats.isDirectory()) {
                    tarPath = tarPath.replace('PROJECTNAME', projectName);
                    fs.mkdir(tarPath, function (err) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        copyFolder(srcPath, tarPath, checkEnd, replaceRule);
                    })
                } else {
                    copyFile(srcPath, tarPath, checkEnd, replaceRule);
                }
            })
        })
        //为空时直接回调
        files.length === 0 && cb && cb();
    })
}

// 移除目录下文件
const delDir = (path) => {
    let files = [];
    if(fs.existsSync(path)){
        files = fs.readdirSync(path);
        files.forEach((file) => {
            let curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()){
                delDir(curPath); //递归删除文件夹
            } else {
                fs.unlinkSync(curPath); //删除文件
            }
        });
        fs.rmdirSync(path);
    }
}

module.exports = { copyFolder, delDir };