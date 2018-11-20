const gulp = require('gulp');
const del = require('del');
const merge = require('merge2');
const ghPages = require('gulp-gh-pages');
const markdown = require('gulp-markdown');

const paths = {
    src: 'src',
    lib: ['lib', 'lib-esm', '_bundles'],
    test: 'test-results/tap',
    publish: '.publish'
};

const clean = () => {
    return del([...paths.lib, paths.publish]);
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
    const docs = gulp
        .src('./src/docs/**/*', {
            dot: true
        }).pipe(gulp.dest(`./lib/docs/`));
    const notes = gulp.src('./CHANGELOG.md')
        .pipe(markdown())
        .pipe(gulp.dest('./lib/docs/'));
    return merge(docs, notes);
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