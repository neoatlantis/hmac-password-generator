const fs = require("fs");
const path = require('path');

const DefinePlugin = require("webpack").DefinePlugin;
const CopyPlugin = require("copy-webpack-plugin");
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require("html-webpack-plugin");

const package_json = JSON.parse(fs.readFileSync("./package.json"));





module.exports = (env)=>{
    const VERSION = package_json.version;


    const is_dev = (env.production === undefined);

    const output_path = __dirname;

    const generic_rules = [
        {
            test: /\.vue$/,
            loader: 'vue-loader'
        },
        {
            test: /\.(vue|js)$/,
            loader: 'ifdef-loader',
            exclude: /node_modules/,
            options: {
                DEV: is_dev,
            }
        },
        {
            test: /\.css$/,
            use: [
                'vue-style-loader',
                {
                    loader: 'css-loader',
                    options: {
                        // enable CSS Modules
                        modules: true,
                    }
                }
            ],
        }

    ];

    const generic_plugins = [
        new DefinePlugin({
            VERSION: JSON.stringify(VERSION),
            DEV: JSON.stringify(is_dev),
        }),
    ];


    let ret = [];

    let web_srcpath = path.join(__dirname, "src");
    let web_dstpath = path.join(
        __dirname,
        (is_dev?"dev":"dist")
    );


    function web_template(scriptname, pagename){ return {
        entry: path.resolve(__dirname, "src", scriptname),
        mode: is_dev?'development':'production',
        watch: true,
        output: {
            filename: scriptname,
            path: web_dstpath,
        },
        resolve: {
            alias: {
                app: web_srcpath,
                sfc: path.resolve(web_srcpath, "vue"),
            },
        },
        module: {
            rules: generic_rules, 
        },
        plugins: [
            new VueLoaderPlugin(),
            new HtmlWebpackPlugin({
                template: path.join(web_srcpath, pagename),
                filename: path.join(web_dstpath, pagename),
                scriptLoading: "module",
            }),
            new CopyPlugin({
                patterns: [
                    {
                        from: path.join(web_srcpath, "static"),
                        to:   path.join(web_dstpath, "static"),
                    }
                ]
            }),
        ].concat(generic_plugins),

    } }

    ret.push(web_template("page.index.js", "index.html"));

    return ret;
};
