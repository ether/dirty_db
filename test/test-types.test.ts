'use strict';

import {TMP_PATH} from './config';
import assert from 'assert';
import {describe, it, beforeEach} from 'vitest'
import Dirty from "../lib/dirty";

describe.skip('test-types', function () {
  let db;

  beforeEach(async function () { db = new Dirty(`${TMP_PATH}/test-types.dirty`); });

  describe('keys', function () {
    it('should prevent storage of an undefined key', async function () {
      db.set(undefined, 'value');
    });

    it('should not return an undefined key', async function () {
      assert(!db.get(undefined));
    });
  });
});
