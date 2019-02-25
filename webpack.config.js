require('dotenv').load();
const webpack = require('webpack');

module.exports = {
    entry: [
        './app/client/src/app.js'
    ],
    output: {
        filename: 'main-1.js'
    },
    watch: process.env.NODE_ENV === 'dev',
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules|vue\/src|vue-router\//,
                loader: 'babel'
            },
            {
                test: /\.css$/,
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
        plugins: ['transform-runtime',"transform-async-to-generator"]
    },
    resolve: {
        modulesDirectories: ['node_modules'],
        alias: {
            'vue$': 'vue/dist/vue.common.js'
        }
    },
    plugins: [
        new webpack.DefinePlugin({
            CLIENT_RAVEN_KEY: JSON.stringify(process.env.CLIENT_RAVEN_KEY),
            'process.env.NODE_ENV': JSON.stringify('production')
        })
    ]
};