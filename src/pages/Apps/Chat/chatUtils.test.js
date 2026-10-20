import test from 'node:test';
import assert from 'node:assert/strict';
import { canViewChat, formatMessageDate, messageDayKey, mergeMessages, parseChatUsers } from './chatUtils.js';

test('legacy room member formats use exact names, not substring matches', () => {
  for (const value of ['diego,lexa', '["diego","lexa"]', '[diego, lexa]', '{diego,lexa}', ['diego', 'lexa']]) {
    assert.deepEqual(parseChatUsers(value), ['diego', 'lexa']);
    assert.equal(canViewChat({ users: value }, 'diego'), true);
    assert.equal(canViewChat({ users: value }, 'die'), false);
  }
  assert.equal(canViewChat({ users: 'sally' }, 'diego'), false);
  assert.equal(canViewChat({ users: 'all' }, 'diego'), true);
  assert.equal(canViewChat({ users: 'all' }, null), false);
  assert.equal(canViewChat({ users: null }, 'diego'), false);
});

test('history, realtime and send responses merge without duplicate messages', () => {
  const first = { message_id: 1, text: 'First', created_at: '2026-10-19T10:00:00Z' };
  const second = { message_id: 2, text: 'Second', created_at: '2026-10-19T10:00:01Z' };
  assert.deepEqual(mergeMessages([second], [first, second]), [first, second]);
  assert.deepEqual(mergeMessages([first], [{ ...first, text: 'Updated' }]), [{ ...first, text: 'Updated' }]);
  assert.equal(mergeMessages([first], [{ ...second, message_id: '1' }]).length, 1);
});

test('date separators use local calendar days and reject missing or invalid dates', () => {
  const beforeMidnight = new Date(2026, 9, 19, 23, 59).toISOString();
  const sameDay = new Date(2026, 9, 19, 0, 1).toISOString();
  const afterMidnight = new Date(2026, 9, 20, 0, 1).toISOString();
  assert.equal(messageDayKey(beforeMidnight), messageDayKey(sameDay));
  assert.notEqual(messageDayKey(beforeMidnight), messageDayKey(afterMidnight));
  assert.equal(formatMessageDate(beforeMidnight), '19/10/2026');
  assert.equal(messageDayKey(null), '');
  assert.equal(messageDayKey('invalid'), '');
  assert.equal(formatMessageDate(undefined), '');
});
