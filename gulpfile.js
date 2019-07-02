const gulp = require('gulp');
const replace = require('gulp-replace-path');
const rm = require('gulp-rm');
const filter = require('gulp-filter');
const gulpif = require('gulp-if');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const fs = require('fs');
const xcreplace = require('./gulp-repleace.js');

const filefilter = filter(['**', '!gulpfile.js', '!.eslintrc.js', '!apidoc.json'], { restore: true });
const regx = /require\('\.\.\/\.\.\/|require\('\.\/\.\.\/\.\.\//g;

const PROJECT = process.env.npm_config_project || 'default';
const IS_UGLIFY = !!process.env.npm_config_uglify;

if (!fs.existsSync(`@project/${PROJECT}`)) {
  throw new Error('project not exist!');
}

gulp.task('clean', () => gulp.src(`dist/${PROJECT}/**`, { read: false })
  .pipe(rm()));

gulp.task('base', async () => {
  const stream = await gulp.src(['**', '!./node_modules/**', '!./@project/**', '!apidoc/**', '!dist/**'])
    .pipe(filefilter)
    .pipe(gulp.dest(`dist/${PROJECT}`));
  return stream;
});

gulp.task('replace', async () => { 
  await gulp.src([`@project/${PROJECT}/**`])
    .pipe(replace(regx, 'require(\''))
    .pipe(gulp.dest(`dist/${PROJECT}`));
});


gulp.task('uglify', () => gulp.src(`dist/${PROJECT}/**/*.js`)
  .pipe(gulpif(IS_UGLIFY, babel({
    presets: ['@babel/env'],
    plugins: ['@babel/plugin-transform-runtime']
  })))
  .pipe(gulpif(IS_UGLIFY, uglify()))
  .pipe(gulp.dest(`dist/${PROJECT}`)));

// FIXME: 此处的替换不能确定目录层级
gulp.task('xcpackage', async () => {
  const stream = await gulp.src(['./node_modules/@xc/**/**', '!./node_modules/@xc/**/node*'])
    .pipe(gulp.dest(`dist/${PROJECT}/xcpackage/`));
  return stream;
});

gulp.task('xcreplace', async () => { 
  await gulp.src([`dist/${PROJECT}/**/*`])
    .pipe(xcreplace())
    .pipe(gulp.dest(`dist/${PROJECT}`));
});

// 过滤掉package.json里的私有库文件
gulp.task('filterpackage', async () => {
  const regPackageName = /"@xc\/.*/g;
  const stream = await gulp.src([`dist/${PROJECT}/package.json`])
    .pipe(replace(regPackageName, ''))
    .pipe(gulp.dest(`dist/${PROJECT}/`));
  return stream;
});
