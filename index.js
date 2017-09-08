const _cleanCss = require('clean-css');
const _uglifyjs = require('uglify-js');
const _htmlMinifier = require('html-minifier')
var _defaultSetting = {
  ignore: ["(\\.min\\.css)$","(\\.min\\.js)$"],
  js:{},
  css:{},
  html:{}
}

function ignore(path, rules){
  rules = rules || [];
  for(let i = 0, length = rules.length; i < length; i++){
    if(new RegExp(rules[i]).test(path)){
      return true
    }
  }
  return false
}
//压缩css文件
function miniCss(content, options){
  if(typeof options == 'boolean'){
    options = {}
  }
  try{
    content = new _cleanCss(options).minify(content).styles;
    return content
  }catch(e){
    console.error(e)
  }
}

//压缩js文件
function miniJS(content, options){
  if(typeof options == 'boolean'){
    options = {}
  }
  try{
    return _uglifyjs.minify(content, options).code
  }catch(e){
    console.error(e)
  }
}

//压缩html内js和css
function miniHtml(content, options){
  let htmlOptions = options.html;
  if(typeof htmlOptions == 'boolean'){
    htmlOptions = {
      minifyJS: true,
      minifyCSS: true,
      removeComments: true,
      collapseWhitespace: true
    }
    return _htmlMinifier.minify(content, htmlOptions)
  }
  let defineOptions = {};
  if(htmlOptions.js){
    defineOptions.minifyJS = true
  }
  if(htmlOptions.html){
    defineOptions.removeComments = true
    defineOptions.collapseWhitespace = true
  }
  if(htmlOptions.css){
    defineOptions.minifyCSS = true
  }
  return _htmlMinifier.minify(content, defineOptions)
}

function getMiniFn(filePath, setting){
  let arr = [
    {reg: /(\.css)$/, params: setting.css, fn: miniCss},
    {reg: /(\.js)$/, params: setting.js, fn: miniJS},
    {reg: /(\.html)$/, params: setting, fn: miniHtml}
  ]
  for(let i = 0; i < arr.length; i++){
    let item = arr[i]
    if(item.reg.test(filePath)){
      return function(content){return item.fn(content, item.params)}
    }
  }
  return null
}

exports.registerPlugin = (cli, options)=>{
  
  cli.utils.extend(_defaultSetting, options);

  cli.registerHook('build:didCompile', (buildConfig, data, content, cb)=>{
    let inputFilePath = data.inputFilePath;
    let outFilePath = data.outputFilePath;
    if(ignore(outFilePath, _defaultSetting.ignore)){
      return cb(null, content)
    }
    let fn = getMiniFn(outFilePath, _defaultSetting)
    if(!fn){
      return cb(null, content)
    }
    try{
      content = fn(content)
      cli.log.info(`minify ${data.inputFileRelativePath} -> ${data.outputFileRelativePath}`);
    }catch(e){
      cli.log.error(`parse ${data.fileName} error`)
      return cb(e)
    }

    cb(null, content);
  }, 99)

}