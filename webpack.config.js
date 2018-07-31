var webpack = require('webpack')

module.exports = {
    entry: [
        './app/client/src/app.js'
    ],
    output: {
        filename: "main.js"
    },
    watch: true,
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel'
            },
            {
                test: /\.scss$/,
                loaders: ['style', 'css', 'sass']
            },
            {
                test: /\.vue$/,
                loader: 'vue'
            }
        ]
    },
    babel: {
        presets: ['es2015'],
        plugins: ['transform-runtime']
    },
    resolve: {
        modulesDirectories: ['node_modules'],
        alias: {
            'vue$': 'vue/dist/vue.common.js'
        }
    }
}