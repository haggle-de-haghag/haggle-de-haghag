const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        player: './src/index_player.tsx',
        game_master: './src/index_gm.tsx',
        lobby: './src/index_lobby.tsx',
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
        alias: {
            env: path.join(__dirname, 'src', 'env', process.env.NODE_ENV)
        }
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
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'public/index.html',
            chunks: ['lobby']
        }),
    ],
};