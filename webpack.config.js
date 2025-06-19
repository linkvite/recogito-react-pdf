const path = require('path');
const fs = require('fs');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const APP_DIR = fs.realpathSync(process.cwd());
const resolveAppPath = relativePath => path.resolve(APP_DIR, relativePath);

// get the linkvite version from package.json
// the the file name should be
// recogito.<version>.min.js
const packageJson = fs.readFileSync(resolveAppPath('package.json'));
const packageData = JSON.parse(packageJson);
const version = packageData.linkviteVersion;

module.exports = {
    entry: resolveAppPath('src'),
    output: {
        filename: `recogito-pdf.${version}.min.js`,
        library: 'RecogitoPDF',
        libraryTarget: 'umd',
        umdNamedDefine: true,
    },
    devtool: 'source-map',
    performance: {
        hints: false
    },
    optimization: {
        minimize: true,
    },
    resolve: {
        extensions: ['.js', '.jsx'],
        alias: {
            'react': 'preact/compat',
            'react-dom': 'preact/compat',
            'preact/compat': path.resolve(__dirname, 'node_modules', 'preact', 'compat'),
            'preact/hooks': path.resolve(__dirname, 'node_modules', 'preact', 'hooks'),
        }
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        "presets": [
                            "@babel/preset-env",
                            "@babel/preset-react"
                        ],
                        "plugins": [
                            [
                                "@babel/plugin-proposal-class-properties"
                            ]
                        ]
                    }
                }
            },
            { test: /\.css$/, use: ['style-loader', 'css-loader'] },
            { test: /\.scss$/, use: ['style-loader', 'css-loader', 'sass-loader'] },
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            outputPath: 'images/',
                            name: '[name][hash].[ext]',
                        },
                    },
                ]
            }
        ]
    },
    devtool: 'source-map',
    devServer: {
        compress: true,
        hot: true,
        allowedHosts: "all",
        port: 9090,
        static: {
            directory: resolveAppPath('public'),
            publicPath: '/'
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: 'head',
            template: resolveAppPath('public/index.html')
        })
    ]
};
