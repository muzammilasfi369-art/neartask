import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_KEY = 'NEARTASK_TASKS';

export const getTasks = async () => {
  try {
    const data = await AsyncStorage.getItem(TASKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};

export const saveTasks = async (tasks) => {
  try {
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (e) { console.error(e); }
};

export const addTask = async (task) => {
  const tasks = await getTasks();
  tasks.push({ ...task, id: Date.now().toString(), done: false, createdAt: new Date().toISOString() });
  await saveTasks(tasks);
};

export const markTaskDone = async (taskId) => {
  const tasks = await getTasks();
  const updated = tasks.map(t => t.id === taskId ? { ...t, done: true } : t);
  await saveTasks(updated);
  return updated;
};

export const deleteTask = async (taskId) => {
  const tasks = await getTasks();
  const updated = tasks.filter(t => t.id !== taskId);
  await saveTasks(updated);
  return updated;
};
