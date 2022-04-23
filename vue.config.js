
const path = require('path');
function resolve (dir) {
    return path.join(__dirname, dir)
}
const Timestamp = new Date().getTime();
module.exports = {
  // publicPath: process.env.NODE_ENV === "production" ? "/vueDataV/" : "/",
  publicPath: './',
  outputDir: 'dist',
  assetsDir: 'static',
  productionSourceMap: true,
  lintOnSave: false,
  devServer: {
    port: 8081,
    proxy: {
      "/api": {
        target: "https://www.fastmock.site/mock/e2c192dbb092225e614b35bc114b4667/bigScreen",
        changeOrigin: true,
        ws: false,
        pathRewrite: {
          "^/api": ""
        }
      }
    }
  },
  chainWebpack: (config)=>{
    //修改文件引入自定义路径
    config.resolve.alias
      .set('modelVanKe', resolve('public/static/modelVanKe'))
  },
  configureWebpack: {
    // 把原本需要写在webpack.config.js中的配置代码 写在这里 会自动合并
    externals: {
     'jquery' : '$',
     'echarts': 'echarts',
     'axios' : 'axios'
    },
    output: {
      // 输出重构  打包编译后的 文件名称  【模块名称.版本号.时间戳】
      filename: `${Timestamp}.js`,
    },
    // resolve:{
    //   alias:{
    //     // 'modelVanKe':path.resolve(__dirname,'public/static/modelVanKe')
    //     'modelVanKe': 'public/static/modelVanKe'
    //   }
    // }
  }
};