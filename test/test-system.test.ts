'use strict';

import {TMP_PATH} from './config';
import fs from 'fs';
const fsp = fs.promises;
import assert from 'assert';
import Dirty from '../lib/dirty'
import {describe, afterEach, it} from 'vitest'

describe('test-flush', function () {
  const file = `${TMP_PATH}/flush.dirty`;

  afterEach(async function () {
    await fsp.unlink(file);
  });

  it('should fire drain event on write', ()=> new Promise<void>(done=> {
    const db = new Dirty(file);
    db.set('foo', 'bar');
    db.on('drain', () => {
      done();
    });
  }));

  it('should write to disk appropriately', ()=> new Promise<void>(done=> {
    const db = new Dirty(file);
    db.set('foo1', 'bar1');
    db.on('drain', () => {
      const contents = fs.readFileSync(file, 'utf-8');

      assert.strictEqual(
          contents,
          `${JSON.stringify({key: 'foo1', val: 'bar1'})}\n`
      );

      done();
    });
  }));
});

describe('test-for-each', function () {
  const db = new Dirty();

  db.set(1, {test: 'foo'});
  db.set(2, {test: 'bar'});
  db.set(3, {test: 'foobar'});

  it('should return each doc key and contents', async function () {
    let i = 0;
    db.forEach((key, doc) => {
      i++;
      assert.equal(key, i);
      assert.strictEqual(doc, db.get(key));
    });
    assert.equal(i, 3);
  });
});

describe('test-load', function () {
  const file = `${TMP_PATH}/load.dirty`;
  const db = new Dirty(file);

  afterEach(async function () {
    await fsp.unlink(file);
  });

  it('should load after write to disk', ()=> new Promise<void>(done=> {
    db.set(1, 'A');
    db.set(2, 'B');
    db.set(3, 'C');
    db.rm(3);

    db.on('drain', () => {
      const db2 = new Dirty(file);

      db2.on('load', (length) => {
        assert.equal(length, 2);

        assert.strictEqual(db2.get(1), 'A');
        assert.strictEqual(db2.get(2), 'B');
        assert.strictEqual(db2.get(3), undefined);
        assert.strictEqual(db2._data.size, 2);
        assert.ok(!db2._data.has('3'));
        done();
      });
    });
  }))
});


describe('test-size', function () {
  const db = new Dirty();

  db.set(1, {test: 'foo'});
  db.set(2, {test: 'bar'});
  db.set(3, {test: 'foobar'});

  it('should be equal to number of keys set', async function () {
    assert.equal(db.size(), 3);
  });
});

describe('test-chaining-of-constructor', function () {
  const file = `${TMP_PATH}/chain.dirty`;
  fs.existsSync(file) && fs.unlinkSync(file);

  it('should allow .on load to chain to constructor', async function () {
    let db = new Dirty(file);
    await new Promise((resolve) => db.on('load', resolve));
    db.set('x', 'y');
    db.set('p', 'q');
    db.close();

    const size = await new Promise((resolve) => { db = new Dirty(file).on('load', resolve); });
    assert.strictEqual(db.size(), 2);
    assert.strictEqual(size, 2);
  });
});

describe('test-update', function () {
  it('updater receives old value and sets new value', async function () {
    const db = new Dirty();
    db.set('foo', 'bar');
    db.update('foo', (bar) => {
      assert.strictEqual(bar, 'bar');
      return 'baz';
    });
    assert.strictEqual(db.get('foo'), 'baz');
  });
});
