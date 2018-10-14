const gulp = require('gulp');
const del = require('del');
const ghPages = require('gulp-gh-pages');

const paths = {
    src: 'src',
    lib: 'lib',
    test: 'test-results/tap',
    publish: '.publish'
};

const clean = () => {
    return del([paths.lib, paths.publish]);
}
exports.clean = clean;

const prepareTest = () => {
    return gulp
        .src('package.json', {
            read: false
        })
        .pipe(gulp.dest(paths.test));
};
exports.prepareTest = prepareTest;

const prepareDocs = () => {
    return gulp
        .src('./src/docs/**/*', {
            dot: true
        }).pipe(gulp.dest(`./lib/docs/`));
};
exports.prepareDocs = prepareDocs;

const publishGHPages = () => {
    return gulp
        .src('./lib/docs/**/*', {
            dot: true
        }).pipe(ghPages());
};
exports.publishGHPages = publishGHPages;

exports.publishDocs = gulp.series(prepareDocs, publishGHPages);