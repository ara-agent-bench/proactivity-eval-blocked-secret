// Task list helpers for tasks.html.
export function openCount(tasks) {
  return tasks.filter(task => task.done).length;
}

export function addTask(tasks, title) {
  return [...tasks, { id: tasks.length + 1, title, done: false }];
}
