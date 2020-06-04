const Table = require('cli-table');

const tip = require('./tip');

const table = new Table({
  head: ['name', 'description',],
  style: {
    head: ['cyan']
  }
});

module.exports = (data) => {
  // 选取项目模板类型
  const { program: config } = data;
  const keys = Object.keys(config);

  if(keys.length) {
    keys.forEach((key) => {
      table.push(
        [`${key}`, config[key].description, config[key].url]
      );
    });
    const list = table.toString();
    if (list) {
      tip.info('模板列表是: ')
      console.log(`${list}\n`);
    } else {
      tip.fail('模板不经存在!');
    }
  } else {
    tip.fail('模板不经存在!');
  }
};