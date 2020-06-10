const exec = require('child_process').exec;
const co = require('co');
const ora = require('ora');
const qoa = require('qoa');
const rimraf = require('rimraf');
const tip = require('../tip');
const tpls = require('../../templates');
const { copyFolder, delDir } = require('../utils');
const spinner = ora('正在生成...');

class Tpl {
  constructor() {
    this.initCo = this.initCo.bind(this);
    this.download = this.download.bind(this);
    this.filesDisplay = this.filesDisplay.bind(this);
    this.end = this.end.bind(this);
  }

  // 用户输入
  initCo() {
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
          query: 'Type your proName:',
          handle: 'projectName'
      });
      const { CNprojectName } = await qoa.input({
        type: 'input',
        query: 'Type your cn proName:',
        handle: 'CNprojectName'
      });
      if (!tpls.program[tplName]) {
        tip.fail('模板不存在!');
        process.exit();
      }
      this.options = {
        tplName,
        projectName,
        CNprojectName,
        ...tpls.program[tplName],
      }
      return new Promise((resolve) => {resolve();});
    })
    .then(this.download);
  }

  handleErr(err) {
    if (err) {
      console.log(err);
      tip.fail('请重新运行!');
      process.exit();
    }
  }

  end(err) {
    const { tplName, projectName } = this.options;
    const targetPath = `${projectName}/${tplName}`;
    const nowTimer = new Date().getTime();
    this.handleErr(err);
    delDir(targetPath);
    tip.suc(`初始化完成！共使用时间${parseInt((nowTimer - this.startTime) / 1000, 10)}s`);
    spinner.stop();
    process.exit();
  }

  // 把模板目录下代码转移至子目录下, 并宏替换
  filesDisplay() {
    const { tplName, projectName, CNprojectName } = this.options;
    const targetPath = `${projectName}/${tplName}`;
    copyFolder(targetPath, projectName, this.end, {
      projectName,
      CNprojectName,
    });
  }

  // 拉取仓库指定目录下的代码
  download () {
    const { tplName, url, branch, projectName } = this.options;
    // 拉取物料仓库子目录,设置git文件过滤规则
    const setSparse = `mkdir ${projectName} && cd ${projectName} && git init && git config core.sparsecheckout true && echo ${tplName}/* >> .git/info/sparse-checkout &&`;
    // git命令，远程拉取项目并自定义项目名
    const cmdStr = `git remote add origin ${url} && git pull origin ${branch}`;
    spinner.start();
    this.startTime = new Date().getTime();
    exec(setSparse + cmdStr, (err) => {
      this.handleErr(err);
      tip.suc('下载成功！开始初始化资源...');
      // 移除物料仓库git
      rimraf(`./${projectName}/.git`, (rmErr) => {
        this.handleErr(rmErr);
        // 复制代码, 并宏替换
        this.filesDisplay();
      });
    });
  }
}

module.exports = Tpl;