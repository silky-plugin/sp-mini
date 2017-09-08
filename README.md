## 压缩css, js, html内js，css

配置如下：
```
 {
    "ignore": [
      "(\\.min\\.js)$",
      "(\\.min\\.css)$"
    ],
    "js": {},
    "css": {},
    "html": {
      "js": true,
      "css": true
    }
}
```
## ignore 忽略文件

符合正则表达式的string数组。


## js

default: `{}`, 压缩选项，参考: [https://github.com/mishoo/UglifyJS2](https://github.com/mishoo/UglifyJS2)

如果不要压缩请设置为false

## css

default: `{}`, 压缩选项， 参考：[https://github.com/jakubpawlowicz/clean-css](https://github.com/jakubpawlowicz/clean-css)

如果不要压缩请设置为false

兼容配置:

```
{"compatibility": "ie7"} 兼容 "#fff\9"的写法
```

## html

default: `{js: true, css: true}`.  如果 需要压缩html内js 设置为true， 压缩选项 共用 上面js的设置。 如果不需要压缩js,则设置为false。 html内css同上。

禁用两者，设置值为false，`{html: false}`