'use strict';

import assert from 'assert';
import Dirty from '../lib/dirty'
import {describe, it} from 'vitest'

describe('test-load-event', function () {
  it('should fire load event', ()=> new Promise<void>(done=> {
    const db = new Dirty();

    db.on('load', () => {
      done();
    });
  }));
});

describe('test-set-callback', function () {
  it('should trigger callback on set', ()=> new Promise<void>(done=> {
    const db = new Dirty();
    let foo = '';

    db.set('foo', 'bar', () => {
      foo = db.get('foo');
      assert.equal(foo, 'bar');
      done();
    });
  }));
});
