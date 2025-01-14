/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const rimraf = require('rimraf');
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const distFolder = './lib';
const sourceFolder = './src';
const includes = new RegExp('.+\\.(ts|tsx)$');

function getInputs(dir, result = []) {
  fs.readdirSync(dir).forEach(function (file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);

    if (stat.isDirectory()) {
      getInputs(file, result);
    } else if (stat.isFile() && file.match(includes)) {
      result.push(file);
    }
  });

  return result;
}

const inputs = getInputs(sourceFolder);

rimraf(distFolder, (err) => {
  if (err) console.error(err);

  console.time('Generating ESM output...');
  esbuild.buildSync({
    entryPoints: [...inputs],
    format: 'esm',
    outbase: sourceFolder,
    outdir: distFolder,
    target: 'es6',
    loader: {
      '.json': 'json',
    },
    tsconfig: 'tsconfig.json',
    minify: true,
    splitting: true,
  });
  console.timeEnd('Generating ESM output...');

  console.time('Generating CJS output...');
  esbuild.buildSync({
    entryPoints: [...inputs],
    format: 'cjs',
    outbase: sourceFolder,
    outdir: distFolder + '/cjs',
    target: 'es6',
    loader: {
      '.json': 'json',
    },
    tsconfig: 'tsconfig.json',
    minify: true,
  });
  console.timeEnd('Generating CJS output...');

  fs.copyFileSync(
    path.join('./package.json'),
    path.join(distFolder, 'package.json')
  );
});
