'use strict'
// 操作命令行
const exec = require('child_process').exec;
const co = require('co');
const ora = require('ora');
const qoa = require('qoa');
const rimraf = require('rimraf');
const tip = require('../tip');
const tpls = require('../../templates');
const { copyFolder, delDir } = require('../utils');
const spinner = ora('正在生成...');

const handleErr = (err) => {
  if (err) {
    console.log(err);
    tip.fail('请重新运行!');
    process.exit();
  }
}

// 把模板目录下代码转移至子目录下, 并宏替换
const filesDisplay = (projectName, tplName) => {
  const targetPath = `${projectName}/${tplName}`;
  copyFolder(targetPath, projectName, () => {
    delDir(targetPath);
    tip.suc('初始化完成！');
    spinner.stop();
    process.exit();
  }, {
    projectName,
  });
}

const pipeFile = (projectName, tplName) => {
  // 删除 git 文件
  rimraf('./' + projectName + '/.git', (err) => {
    handleErr(err);
    // 复制代码, 并宏替换
    filesDisplay(projectName, tplName);
  });
}

// 拉取仓库指定目录下的代码
const download = (result) => {
  const { tplName, url, branch, projectName, } = result;
  // 拉取物料仓库子目录,设置git文件过滤规则
  const setSparse = `mkdir ${projectName} && cd ${projectName} && git init && git config core.sparsecheckout true && echo ${tplName}/* >> .git/info/sparse-checkout &&`;
  // git命令，远程拉取项目并自定义项目名
  const cmdStr = `git remote add origin ${url} && git pull origin ${branch}`;
  spinner.start();
  exec(setSparse+cmdStr, (err) => {
    handleErr(err);
    tip.suc('下载成功！开始初始化资源...');
    pipeFile(projectName, tplName);
  });
};

module.exports = () => {
 co(async () => {
    // 选择模板类型、键入项目名称
    const interactive = {
        type: 'interactive',
        query: 'Select templete type:',
        handle: 'tplName',
        symbol: '>',
        menu: Object.keys(tpls.program),
      };
    const { tplName } = await qoa.interactive(interactive);
    const { projectName } = await qoa.input({
      type: 'input',
      query: 'Type your pro name:',
      handle: 'projectName'
    });
    if (!tpls.program[tplName]) {
      tip.fail('模板不存在!');
      process.exit();
    }
    return new Promise((resolve) => {
      resolve({
        tplName,
        projectName,
        ...tpls.program[tplName],
      });
    });
  })
  .then(download);
}