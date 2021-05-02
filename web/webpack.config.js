const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: {
        player: './src/index_player.tsx',
        game_master: './src/index_gm.tsx'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'player.html',
            template: 'public/index.html',
            chunks: ['player']
        }),
        new HtmlWebpackPlugin({
            filename: 'game_master.html',
            template: 'public/index.html',
            chunks: ['game_master']
        }),
    ],
    devServer: {
        port: 3000
    },
};