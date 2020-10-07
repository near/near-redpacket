const gulp = require("gulp");
const sass = require('gulp-sass');
const cleancss = require('gulp-clean-css');
const csscomb = require('gulp-csscomb');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
// const nearUtils = require("near-bindgen-as/compiler");

// function build_wasm(done){
//   nearUtils.compile("./assembly/main.ts", "./out/main.wasm", done);
// };

function css() {
  return gulp
    .src('./src/scss/*.scss')
    .pipe(sass({outputStyle: 'compact', precision: 2})
      .on('error', sass.logError)
    )
    .pipe(autoprefixer())
    .pipe(csscomb())
    .pipe(gulp.dest('./src/assets/css'))
    .pipe(cleancss())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./src/assets/css'));
}

function watch() {
  gulp.watch('./**/*.scss', css);
}

const build = gulp.series(css);

exports.default = build;
exports.watch = watch;
exports.css = css;

