'use strict';

let { relative } = require('path');
let gutil = require('gulp-util');
let through = require('through2');

const PROJECT = process.env.npm_config_project || 'default';
const r = path => relative(path, `./dist/${PROJECT}/xcpackage`);
/* eslint-disable no-useless-escape */
/* eslint-disable func-names */
module.exports = function () {
  const reg = /require\(\'\@xc\//g; // require('@xc/
  return through.obj(function (file, enc, callback) {
    if (file.isNull()) {
      this.push(file);
      return callback();
    }
    if (file.isStream()) {
      this.emit('error', new gutil.PluginError('gulp-xcrepleace', 'Streams are not supported!'));
      return callback();
    }
    const xcpackagePath = r(file.path);
    let contents = file.contents.toString().replace(reg, `require('${xcpackagePath.slice(3)}/`);
    file.contents = Buffer.from(contents);
    this.push(file);
    return callback();
  });
};
