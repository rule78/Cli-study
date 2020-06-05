const fs = require('fs');
const path = require('path');
const { stat } = fs;

const copyFile = function (srcPath, tarPath, cb) {
    var rs = fs.createReadStream(srcPath);
    rs.on('error', function (err) {
        if (err) {
            console.log('read error', srcPath);
        }
        cb && cb(err)
    })
    var ws = fs.createWriteStream(tarPath);
    ws.on('error', function (err) {
        if (err) {
            console.log('write error', tarPath);
        }
        cb && cb(err);
    })
    ws.on('close', function (ex) {
        cb && cb(ex);
    })
    rs.pipe(ws)
}

const copyFolder = function (srcDir, tarDir, cb) {
    fs.readdir(srcDir, function (err, files) {
        var count = 0;
        var checkEnd = function () {
            ++count == files.length && cb && cb();
        }
        if (err) {
            checkEnd();
            return;
        }
        files.forEach(function (file) {
            var srcPath = path.join(srcDir, file)
            var tarPath = path.join(tarDir, file)

            fs.stat(srcPath, function (err, stats) {
                if (stats.isDirectory()) {
                    fs.mkdir(tarPath, function (err) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        copyFolder(srcPath, tarPath, checkEnd);
                    })
                } else {
                    copyFile(srcPath, tarPath, checkEnd);
                }
            })
        })

        //为空时直接回调
        files.length === 0 && cb && cb();
    })
}

// 在复制目录前需要判断该目录是否存在，不存在需要先创建目录
const exists = (src, dst, replaceRule, cb) => {
    fs.exists(dst, isExists => {
        if (isExists) {
            copy(src, dst, replaceRule);
        } else {
            // 根据path替换文件名
            const { projectName } = replaceRule;
            let dir = dst;
            dir = dir.replace('PROJECTNAME', projectName);
            fs.mkdir(dir, () => {
                copy(src, dir, replaceRule);
            });
        }
    });
};

/*
 * 复制目录中的所有文件包括子目录
 * @param{ String } src 需要复制的目录 proName/tsdx/
 * @param{ String } dst 复制到指定的目录 proName/
 * @param{ Object } rules 替换规则
 */
const copy = (src, dst, rules) => {
    // 读取目录中的所有文件/目录
    fs.readdir(src, (err, files) => {
        if (err) { throw err; }
        files.forEach(path => {
            const targetSrc = `${src}/${path}`;
            let targetDst = `${dst}/${path}`;
            stat(targetSrc, (_err, st) => {
                if (_err) { throw _err; }
                // 判断是否为文件
                if (st.isFile()) {
                    let str = '';
                    fs.readFile(targetSrc, 'utf-8', (error, data) => {
                        if (!error) {
                            const { projectName } = rules;
                            str = data.toString(); // 宏替换
                            str = str.replace('PROJECTNAME', projectName)
                            targetDst = targetDst.replace('PROJECTNAME', projectName);
                            fs.writeFile(targetDst, str, _error => {
                                if (_error) {
                                    console.log(_error);
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
}

module.exports = { exists, copy, copyFolder };