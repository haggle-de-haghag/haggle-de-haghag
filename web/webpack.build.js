const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

module.exports = merge(common, {
    mode: 'production',
    plugins: [
        new webpack.DefinePlugin({
            API_BASE_URL: '"https://haggle-de-haghag.herokuapp.com/api"',
            BUILD_ENV: `"${process.env.BUILD_ENV}"`,
        })
    ]
});