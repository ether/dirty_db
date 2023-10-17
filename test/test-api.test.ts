'use strict';

import {TMP_PATH} from './config';
import Dirty from '../lib/dirty/dirty'
import events from 'events';
import assert from 'assert';
import {describe, afterEach, it, beforeEach} from 'vitest'
import {unlinkSync} from 'fs'
import {after, before} from "node:test";
import Dirty_db from "../index";

const dirtyAPITests = (file: string) => {
  const mode = (file) ? 'persistent' : 'transient';

  describe(`dirty api (${mode} mode)`, function () {
    const cleanup = async () => {
      try {
        unlinkSync(file);
      } catch (err) { /* intentionally ignored */ }
    };

    before(cleanup);

    it('constructor without new', async function () {
      const db = new Dirty(file); // eslint-disable-line new-cap
      assert(db instanceof Dirty);
      await cleanup();
    });

    describe('dirty constructor', function () {
      let db: Dirty;

      before(async function () { db = new Dirty(file); });
      after(cleanup);

      it('is an event emitter', async function () {
        assert.ok(db instanceof events.EventEmitter);
      });

      it('is a dirty', async function () {
        assert.ok(db instanceof Dirty_db);
      });
    });

    describe('events', function () {
      after(cleanup);

      it('should fire load',  ()=> new Promise<void>(done=> {
        const db = new Dirty(file);
        db.on('load', (length) => {
          assert.strictEqual(length, 0);
          done();
        });
      }));

      it('should fire drain after write', ()=> new Promise<void>(done=> {
        const db = new Dirty(file);
        db.on('load', (length) => {
          assert.strictEqual(length, 0);

          db.set('key', 'value');
          db.on('drain', () => {
            done();
          });
        });
      }));
    });

    describe('accessors', function () {
      afterEach(cleanup);
      let db;

      it('.set should trigger callback',()=> new Promise<void>(done=> {
        db = new Dirty(file);
        db.set('key', 'value', (err) => {
          assert.ok(!err);
          done();
        });
      }));

      it('.get should return value', async function () {
        assert.strictEqual(db.get('key'), 'value');
      });

      it('.path is valid', async function () {
        assert.strictEqual(db.path, file);
      });

      it('.forEach runs for all', async function () {
        const total = 2; let
          count = 0;
        db.set('key1', 'value1');
        db.set('delete', 'me');

        db.rm('delete');

        const keys = ['key', 'key1'];
        const vals = ['value', 'value1'];

        db.forEach((key, val) => {
          assert.strictEqual(key, keys[count]);
          assert.strictEqual(val, vals[count]);

          count++;
        });

        assert.strictEqual(count, total);
      });

      it('.rm removes key/value pair', async function () {
        db.set('test', 'test');
        assert.strictEqual(db.get('test'), 'test');
        db.rm('test');
        assert.strictEqual(db.get('test'), undefined);
      });

      it('.rm of unknown key is a no-op', async function () {
        db.rm('does not exist');
        const got = [];
        db.forEach((k, v) => { got.push([k, v]); });
        assert.deepStrictEqual(got, [['key', 'value'], ['key1', 'value1']]);
      });

      it('will reload file from disk',  ()=> new Promise<void>(done=> {
        if (!file) {
          console.log('N/A in transient mode');
          return done();
        }

        db = new Dirty(file);

        db.set('key', 'value')
        db.set('key1', 'value1')
        db.on('load', (length: number) => {
          assert.strictEqual(length, 0);
          assert.strictEqual(db.get('key'), 'value');
          assert.strictEqual(db.get('key1'), 'value1');
          const got = [];
          db.forEach((k, v) => { got.push([k, v]); });
          assert.deepStrictEqual(got, [['key', 'value'], ['key1', 'value1']]);
          done();
        });
      }));
    });

    describe('db file close', function () {
      afterEach(cleanup);

      it('close', ()=> new Promise<void>(done=> {
        if (!file) {
          console.log('N/A in transient mode');
          return done();
        }
        const db = new Dirty(file);
        db.on('load', (length) => {
          db.set('close', 'close');
          db.on('drain', () => {
            db.close();
          });
        });

        db.on('write_close', () => {
          done();
        });
      }));
    });
  });
};

dirtyAPITests('');
dirtyAPITests(`${TMP_PATH}/apitest.dirty`);
