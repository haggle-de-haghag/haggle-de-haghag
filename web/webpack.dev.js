const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        port: 3000,
        hot: true,
        //host: '0.0.0.0',
        //public: 'atelier:3000'
    },
    plugins: [
        new webpack.DefinePlugin({
            API_BASE_URL: '"http://localhost:8080/api"',
        }),
        new webpack.HotModuleReplacementPlugin(),
    ]
});