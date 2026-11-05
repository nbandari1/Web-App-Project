import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterTasks } from './taskFilters.ts';
const tasks = [{ title: 'Assignment A', status: 'in_progress', priority: 'high' }, { title: 'Assignment B', status: 'completed', priority: 'low' }, { title: 'Legacy task', status: 'todo' }];
test('keyword, status and priority intersect without changing source', () => {
  assert.deepEqual(filterTasks(tasks, '  ASSIGNMENT ', 'in_progress', 'high'), [tasks[0]]);
  assert.equal(tasks.length, 3);
});
test('clear restores all tasks and no match returns empty', () => {
  assert.deepEqual(filterTasks(tasks, '', 'all', 'all'), tasks);
  assert.deepEqual(filterTasks(tasks, 'missing', 'all', 'all'), []);
});
test('legacy priority defaults to medium', () => {
  assert.deepEqual(filterTasks(tasks, '', 'todo', 'medium'), [tasks[2]]);
});
