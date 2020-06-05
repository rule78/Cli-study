'use strict'
// 操作命令行
const exec = require('child_process').exec;
const co = require('co');
const ora = require('ora');
const qoa = require('qoa');
const rimraf = require('rimraf');
const tip = require('../tip');
const tpls = require('../../templates');
const { copyFolder } = require('../utils');
const spinner = ora('正在生成...');

// 把模板目录下代码转移至子目录下
const filesDisplay = (projectName) => {
  const tplName = 'tsdx';
  copyFolder(`${projectName}/${tplName}`, `${projectName}`, ()=>{
    tip.suc('初始化完成！');
  });
  // exists(`${projectName}/${tplName}`, `${projectName}`, {
  //   projectName
  // }, ()=>{
  //   tip.suc('初始化完成！');
  // });
}

const execRm = (err, projectName) => {
  spinner.stop();

  if (err) {
    console.log(err);
    tip.fail('请重新运行!');
    process.exit();
  }

  filesDisplay(projectName);

  // tip.suc('初始化完成！');
  // tip.info(`cd ${projectName} && npm install`);
  // process.exit();
};

const download = (err, projectName) => {
  if (err) {
    console.log(err);
    tip.fail('请重新运行!');
    process.exit();
  }
  tip.suc('下载成功！开始宏替换代码...');
  // 删除 git 文件
  rimraf('./' + projectName + '/.git', (err) => {
    execRm(err, projectName);
  });
}

const archive = (result) => {
  const { tplName, url, branch, projectName, } = result;
  // 拉取物料仓库子目录
  const setSparse = `mkdir ${projectName} && cd ${projectName} && git init && git config core.sparsecheckout true && echo ${tplName}/* >> .git/info/sparse-checkout &&`;
  // git命令，远程拉取项目并自定义项目名
  const cmdStr = `git remote add origin ${url} && git pull origin ${branch}`;

  spinner.start();
  exec(setSparse+cmdStr, (err) => {
    download(err, projectName);
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

    return new Promise((resolve, reject) => {
      resolve({
        tplName,
        projectName,
        ...tpls.program[tplName],
      });
    });
  })
  .then(archive);
}