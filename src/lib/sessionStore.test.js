import test from 'node:test';
import assert from 'node:assert/strict';
import { createSessionStore, endSession } from './sessionStore.js';

function fixture() {
  const values = new Map();
  const events = [];
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
  return { store: createSessionStore(storage, () => events.push('change')), storage, events };
}

test('a cached username without a session does not count as logged in', () => {
  const { store, storage } = fixture();
  storage.setItem('user_logged', 'diego');
  assert.equal(store.getUser(), null);
  store.clear();
  assert.equal(storage.getItem('user_logged'), null);
});

test('logout removes token and username synchronously even with a Supabase thenable', async () => {
  const { store, storage, events } = fixture();
  store.set('token', 'diego');
  let revoked;
  const completion = endSession(store, token => ({ then: resolve => { revoked = token; resolve({ data: null }); } }));
  assert.equal(store.getUser(), null);
  assert.equal(store.getToken(), null);
  assert.equal(storage.getItem('user_logged'), null);
  assert.equal(storage.getItem('pixel_art_session'), null);
  assert.equal(events.length, 2);
  await completion;
  assert.equal(revoked, 'token');
});

test('network failure cannot prevent local logout and late validation cannot clear another login', async () => {
  const { store } = fixture();
  store.set('old', 'diego');
  await endSession(store, () => { throw new Error('offline'); });
  assert.equal(store.getToken(), null);
  store.set('new', 'lexa');
  assert.equal(store.clear('old'), false);
  assert.equal(store.getUser(), 'lexa');
  assert.equal(store.getToken(), 'new');
});
