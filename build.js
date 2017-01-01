/* eslint-disable no-console */
import fs from 'fs-extra';
import {rollup} from 'rollup';
import path from 'path';
import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';
import less from 'less';
import uglify from 'rollup-plugin-uglify';
import purify from 'purify-css';
import cssnano from 'cssnano';
import imagemin from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';

const buildCss = (opts) => {
    return new Promise(function (resolve, reject) {
        const code = fs.readFileSync(path.join(views_directory, 'less', `index_${opts.name}.less`), 'utf8');
        less.render(code, {
            paths: [path.join(views_directory, 'less')]
        }).then((output) => {

            fs.writeFileSync(path.join(css_directory, `${opts.name}.css`), output.css);

            if (process.env.NODE_ENV !== 'production') {
                resolve(output.css);
            }

            const content = [opts.bundleOptions.dest, 'server/views/**/*.ejs'];
            if (opts.extJs) {
                content.push(...opts.extJs);
            }
            const css = [path.join(css_directory, `${opts.name}.css`)];

            const purified_css = purify(content, css);
            if (!purified_css) {
                throw ('purify exited with an empty css');
            }
            cssnano.process(purified_css).then((result) => {
                fs.writeFileSync(path.join(css_directory, `${opts.name}.min.css`), result.css);
                resolve(result.css);
            }).catch((error) => {
                reject(error);
            });

        }, (error) => {
            reject(error);
        });
    });
};

const buildJs = (opts) => {
    return new Promise((resolve, reject) => {
        rollup(opts.options).then((bundle) => {
            bundle.write(opts.bundleOptions);
            resolve();
        }).catch((error) => {
            reject(error);
        });
    });
};

const buildImg = () => {
    return Promise.resolve({
        then(resolve){
            imagemin(['server/views/images/**/*.{jpg,png}'], images_directory, {
                plugins: [
                    imageminMozjpeg(),
                    imageminPngquant({quality: '65-80'})
                ]
            });
            resolve();
        }
    });
};

const clean = () => {
    return Promise.resolve({
        then(resolve){
            [css_directory, js_directory, images_directory].map((directory) => {
                fs.emptydirSync(directory);
            });
            resolve();
        }
    });
};

// Build struct
const views_directory = path.join(__dirname, 'server', 'views');
const css_directory = path.join(__dirname, 'public', 'css');
const images_directory = path.join(__dirname, 'public', 'images');
const js_directory = path.join(__dirname, 'public', 'js');

const plugins = () => {
    const list = [
        babel(babelrc({
            addExternalHelpersPlugin: false
        }))
    ];

    if (process.env.NODE_ENV === 'production') {
        list.push(uglify());
    }

    return list;
};

const bundleOptions = (name) => {
    const suffix = process.env.NODE_ENV === 'production' ? '.min' : '';
    const opts = {
        dest: path.join(js_directory, `${name}${suffix}.js`),
        format: 'umd',
        globals: {
            'accounting': 'accounting',
            'bootbox': 'bootbox',
            'handlebars': 'Handlebars',
            'historyjs': 'History',
            'i18next': 'i18next',
            'jquery': '$',
            'minivents': 'Events',
            'moment': 'moment',
            'sugar': 'Sugar'
        },
        sourceMap: true
    };
    return opts;
};

const print = {
    name: 'print',
    options: {
        entry: path.join(views_directory, 'index_print.js'),
        plugins: plugins()
    },
    bundleOptions: bundleOptions('print')
};

const ppublic = {
    name: 'public',
    options: {
        entry: path.join(views_directory, 'index_public.js'),
        plugins: plugins()
    },
    bundleOptions: bundleOptions('public')
};

const restricted = {
    name: 'restricted',
    extJs: [path.join(__dirname, 'node_modules', 'bootbox', 'bootbox.js')],
    options: {
        entry: path.join(views_directory, 'index_restricted.js'),
        plugins: plugins('restricted')
    },
    bundleOptions: bundleOptions('restricted')
};

// Build
clean()
.then(buildJs(print))
.then(buildCss(print))
.then(buildJs(ppublic))
.then(buildJs(restricted))
.then(buildCss(ppublic))
.then(buildCss(restricted))
.then(buildImg())
.catch((reason) => {
    throw reason;
});
