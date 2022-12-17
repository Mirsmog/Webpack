const path = require('path');
const mode = process.env.NODE_ENV || 'development';
const devMode = mode === 'development';
const target = devMode ? 'web' : 'browserslist';
const devtool = devMode ? 'source-map' : undefined;

const optimization = () => {
  const config = {
    minimize: true,
    splitChunks: {
      cacheGroups: {
        vendor: {
          name: 'vendors.[contenthash:5]',
          test: /node_modules/,
          chunks: 'all',
          enforce: true,
        }
      }
    }
  }
  if (devMode) {
    config.minimizer = [
      new OptimizeCssAssetWebpackPlugin(),
      new TerserWebpackPlugin({
        include: /\/vendors/,
      }),
      new ImageMinimizerPlugin({
         minimizer: {
         implementation: ImageMinimizerPlugin.imageminMinify,
           options: {
             plugins: [
               ['gifsicle', { interlaced: true }],
               ['jpegtran', { progressive: true }],
               ['optipng', { optimizationLevel: 5 }],
               ['svgo', { name: 'preset-default' }],
             ],
           },
         },
       }),
    ]
  }
  return config
}

// Plugins
//=============
const OptimizeCssAssetWebpackPlugin = require('css-minimizer-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin')

// Settings
// ============
module.exports = {
  mode,
  target,
  devtool,
  devServer: {
    port: 3000,
    open: false,
    hot: true,
  },

  performance: {
    hints: false
  },

  entry: ['@babel/polyfill', path.resolve(__dirname, 'src', 'index.js')],
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    filename: '[contenthash].bundle.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src', 'index.html'),
      inject: 'body',
    }),
    new MiniCssExtractPlugin({
      filename: 'assets/css/index.[contenthash].css',
    }),
  ],

  optimization: optimization(),

   module: {
    rules: [
      {
        test: /\.html?$/i,
        loader: 'html-loader',
      },

      {
        test: /\.(c|sc|sa)ss$/i,
        use: [
          devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [require('postcss-preset-env')],
              },
            },
          },
          'sass-loader',
        ],
      },

      {
        test: /\.m?js$/i,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },

      {
        test: /\.woff2?$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name][ext]',
        },
      },

      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: () => {
            return devMode
              ? 'assets/img/[name][ext]'
              : 'assets/img/[name].[contenthash][ext]';
          },
        },
      },
    ],
  },
};
