const gulp = require('gulp');
const del = require('del');

const paths = {
    src: 'src',
    lib: 'lib',
    test: 'test-results/tap'
};

const clean = () => {
    return del([paths.lib]);
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