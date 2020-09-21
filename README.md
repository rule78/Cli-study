<h1 align="center">Front-end Cli</h1>

### 实现功能
- 拉取远程模板 yangli01-cli init
- 复制页面级别模板(附带宏替换)，在编写Antd4中后台增删查改页面时相当实用
- 使用babylon解析，借助astexplorer.net识别，实现插入代码于配置文件
+ 指令：yangli01-cli pages

### Use bash
```
$ npm i yangli01-cli -g

$ yangli01-cli 
```

### Use Command
```
$ yangli01-cli init
Select your program type:
```

```
$ yangli01-cli p
Type your page relative path:<ParentPageName>/<ActionPageName>
```

### Example logs
```
$ yangli01-cli p
Type your page relative path:list/add
```
```
已写入./src/pages/list/add/index.less
已写入./src/pages/list/components/addSearchForm.js
已写入./src/pages/list/add/index.js
已写入./src/pages/list/models/listadd.js
```
