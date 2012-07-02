#!/usr/bin/env node

(function() {
  var file, fs, path;

  fs = require('fs');

  path = require('path');

  process.argv.splice(0, 2);

  file = process.argv.pop();

  if (!(file != null)) {
    console.warn('Specify a file to manipulate.');
    process.exit(1);
  } else {
    file = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
    file = file.replace(/(\n)+/, '\n');
    console.log(file);
  }

}).call(this);
