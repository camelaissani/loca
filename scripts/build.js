/* eslint-disable no-console */
import fs from 'fs-extra';
import {rollup} from 'rollup';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import includePaths from 'rollup-plugin-includepaths';
import path from 'path';
import less from 'less';
import purify from 'purify-css';
import imagemin from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';

// directories
const root_directory = path.join(__dirname, '..');
const frontend_directory = path.join(root_directory, 'frontend');
const backend_directory = path.join(root_directory, 'backend');
const view_directory = path.join(backend_directory, 'pages');
const js_directory = path.join(frontend_directory, 'js');
const less_directory = path.join(frontend_directory, 'less');
const image_directory = path.join(frontend_directory, 'images');
const locale_directory = path.join(frontend_directory, 'locales');
const dist_directory = path.join(root_directory, 'dist');
const dist_css_directory = path.join(dist_directory, 'css');
const dist_images_directory = path.join(dist_directory, 'images');
const dist_js_directory = path.join(dist_directory, 'js');
const dist_locales_directory = path.join(dist_directory, 'locales');

// pattern
const templates_pattern = path.join(view_directory, '/**/*.ejs');
const images_pattern = path.join(image_directory, '/**/*.{jpg,png}');

const buildCss = (opts) => {
    return new Promise(function (resolve, reject) {
        fs.ensureDir(dist_css_directory);
        const code = fs.readFileSync(path.join(less_directory, `${opts.name}.less`), 'utf8');
        less.render(code, {
            paths: [less_directory]
        }).then((output) => {
            const css_file_path = path.join(dist_css_directory, `${opts.name}.css`);
            const cssmin_file_path = path.join(dist_css_directory, `${opts.name}.min.css`);

            fs.writeFileSync(css_file_path, output.css);

            if (process.env.NODE_ENV !== 'production') {
                resolve(output.css);
            } else {
                const content = [opts.bundleOptions.dest, templates_pattern];
                if (opts.extJs) {
                    content.push(...opts.extJs);
                }
                const purified_css = purify(content, [css_file_path], {minify: true});
                if (!purified_css) {
                    throw ('purify exited with an empty css');
                }
                fs.writeFileSync(cssmin_file_path, purified_css);
            }
        }, (error) => {
            reject(error);
        });
    });
};

const buildJs = (opts) => {
    return new Promise((resolve, reject) => {
        fs.ensureDir(dist_js_directory);
        rollup(opts.options).then((bundle) => {
            bundle.write(opts.bundleOptions);
            resolve();
        }).catch((error) => {
            reject(error);
        });
    });
};

const buildImg = () => {
    return new Promise((resolve, reject) => {
        try {
            fs.ensureDir(dist_images_directory);
            imagemin([images_pattern], dist_images_directory, {
                plugins: [
                    imageminMozjpeg(),
                    imageminPngquant({quality: '65-80'})
                ]
            });
            resolve();
        } catch (err) {
            reject(err);
        }
    });
};

const copyLocales= () => {
    return new Promise((resolve, reject) => {
        try {
            fs.copySync(
                locale_directory,
                dist_locales_directory
            );
            resolve();
        } catch (err) {
            reject(err);
        }
    });
};

const copyRobots= () => {
    return new Promise((resolve, reject) => {
        try {
            fs.copySync(
                path.join(frontend_directory, 'robots.txt'),
                path.join(dist_directory, 'robots.txt')
            );
            resolve();
        } catch (err) {
            reject(err);
        }
    });
};

const copySitemap= () => {
    return new Promise((resolve, reject) => {
        try {
            fs.copySync(
                path.join(frontend_directory, 'sitemap.xml'),
                path.join(dist_directory, 'sitemap.xml')
            );
            resolve();
        } catch (err) {
            reject(err);
        }
    });
};

const clean = (directory) => {
    return new Promise((resolve, reject) => {
        try {
            fs.emptydirSync(directory || dist_directory);
            resolve();
        } catch (err) {
            reject(err);
        }
    });
};

const plugins = () => {
    const list = [
        nodeResolve({
            jsnext: true,
            main: true
        }),
        commonjs(),
        babel({
            babelrc: false,
            presets: ['es2015-rollup']
        }),
        includePaths({
            external: [
                'accounting',
                'bootbox',
                'handlebars',
                'historyjs',
                'i18next',
                'jquery',
                'minivents',
                'moment',
                'sugar',
                'frontexpress'
            ]
        })
    ];

    if (process.env.NODE_ENV === 'production') {
        list.push(uglify());
    }

    return list;
};

const bundleOptions = (name) => {
    const suffix = process.env.NODE_ENV === 'production' ? '.min' : '';
    const opts = {
        dest: path.join(dist_js_directory, `${name}${suffix}.js`),
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
            'sugar': 'Sugar',
            'frontexpress': 'frontexpress'
        },
        sourceMap: true
    };
    return opts;
};

const print = {
    name: 'print',
    options: {
        entry: path.join(js_directory, 'print.js'),
        plugins: plugins()
    },
    bundleOptions: bundleOptions('print')
};

const index = {
    name: 'index',
    options: {
        entry: path.join(js_directory, 'index.js'),
        plugins: plugins()
    },
    bundleOptions: bundleOptions('index')
};

if (process.argv.length > 2) {
    // Partial build
    const buildWhat = process.argv[2].toLowerCase();

    switch (buildWhat) {
    case 'js':
        clean(dist_js_directory)
        .then(buildJs(print))
        .then(buildJs(index))
        .then(console.log('js files rebuilt'))
        .catch((reason) => {
            throw reason;
        });
        break;
    case 'css':
        clean(dist_css_directory)
        .then(buildCss(print))
        .then(buildCss(index))
        .then(console.log('less files rebuilt'))
        .catch((reason) => {
            throw reason;
        });
        break;
    case 'img':
        clean(dist_images_directory)
        .then(buildImg())
        .then(console.log('image files rebuilt'))
        .catch((reason) => {
            throw reason;
        });
        break;
    case 'static':
        clean(dist_locales_directory)
        .then(copyLocales())
        .then(copyRobots())
        .then(copySitemap())
        .then(console.log('static files rebuilt'))
        .catch((reason) => {
            throw reason;
        });
        break;
    }
} else {
    // Full build
    clean()
    .then(buildJs(print))
    .then(buildCss(print))
    .then(buildJs(index))
    .then(buildCss(index))
    .then(buildImg())
    .then(copyLocales())
    .then(copyRobots())
    .then(copySitemap())
    .catch((reason) => {
        throw reason;
    });
}
