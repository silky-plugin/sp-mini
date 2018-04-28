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
  return new _cleanCss(options).minify(content).styles;
}

//压缩js文件
function miniJS(content, options){
  if(typeof options == 'boolean'){
    options = {}
  }
  return _uglifyjs.minify(content, options).code
}

//压缩html内js和css
function miniHtml(content, options){
  let defineOptions = getHtmlSetting(options)
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

const getHtmlSetting = (options)=>{
  let htmlOptions = Object.assign({},options.html);
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
    delete htmlOptions["js"]
  }
  if(htmlOptions.css){
    defineOptions.minifyCSS = true
    delete htmlOptions["js"]
  }
  Object.assign(defineOptions, htmlOptions)
  return defineOptions
}

exports.registerPlugin = (cli, options)=>{
  
  cli.utils.extend(_defaultSetting, options);

  let htmlSetting = getHtmlSetting(_defaultSetting)

  // cli.registerHook('preview:beforeResponse', (req, data, content, cb)=>{
  //   let pathname = data.realPath;
  //   if(!/(\.html)$/.test(pathname)){
  //     return cb(null,  content)
  //   }
  //   try{
  //     content = _htmlMinifier.minify(content, htmlSetting)
  //     content = content.replace(/\n{2,}/g, "\n")
  //     cb(null, content)
  //   }catch(e){
  //     cb(e)
  //   }
  // }, 99)
  cli.registerHook('build:didCompile', (buildConfig, data, content)=>{
    let inputFilePath = data.inputFilePath;
    let outFilePath = data.outputFilePath;
    if(ignore(outFilePath, _defaultSetting.ignore)){
      return content
    }
    let fn = getMiniFn(outFilePath, _defaultSetting)
    if(!fn){
      return content
    }
    cli.log.info(`minify ${data.inputFileRelativePath} -> ${data.outputFileRelativePath}`);
    return fn(content)
  }, 99)
}