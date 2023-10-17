'use strict';

import path from 'path';
import fs from 'fs';
import rimraf from 'rimraf';

export const TMP_PATH = path.join(__dirname, 'tmp');
export const LIB_DIRTY = path.join(__dirname, '../lib/dirty');

try {
  rimraf.sync(TMP_PATH);
  fs.mkdirSync(TMP_PATH);
} catch (error){

}

module.exports = {
  TMP_PATH,
  LIB_DIRTY,
};
