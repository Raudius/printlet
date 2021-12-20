// vue.config.js
module.exports = {
    runtimeCompiler: true,
    configureWebpack: {
        resolve: {
            alias: {
                'balm-ui-plus': 'balm-ui/dist/balm-ui-plus.js',
                'balm-ui-css': 'balm-ui/dist/balm-ui.css'
            }
        }
    }
};

console.log('test');