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
  options.fromString = true;
  return _uglifyjs.minify(content, options).code
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

exports.registerPlugin = (cli, options)=>{
  
  cli.utils.extend(_defaultSetting, options);

  cli.registerHook('build:didCompile', (buildConfig, data, content, cb)=>{
    let inputFilePath = data.inputFilePath;
    let outFilePath = data.outputFilePath;
    if(ignore(outFilePath, _defaultSetting.ignore)){
      return cb(null, content)
    }
    try{
      if(/(\.css)$/.test(outFilePath) && _defaultSetting.css){
        content = miniCss(content, _defaultSetting.css)
      }else if(/(\.js)$/.test(outFilePath) && _defaultSetting.js){
        content = miniJS(content, _defaultSetting.js)
      }else if(/(\.html)$/.test(outFilePath) && _defaultSetting.html){
        content = miniHtml(content, _defaultSetting)
      }else{
        return  cb(null, content);
      }
      cli.log.info(`minify ${data.inputFileRelativePath} -> ${data.outputFileRelativePath}`);
    }catch(e){
      cli.log.error(`parse ${data.fileName} error`)
      return cb(e)
    }
    cb(null, content);
  }, 99)

}