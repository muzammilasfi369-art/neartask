import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getTasks, markTaskDone, deleteTask } from '../utils/storage';
import { startGeofencing } from '../utils/geofence';
import { speak } from '../utils/voice';

export default function HomeScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadTasks = async () => {
    const data = await getTasks();
    setTasks(data);
    await startGeofencing(); // restart geofencing with latest tasks
  };

  useFocusEffect(useCallback(() => { loadTasks(); }, []));

  const handleDone = async (task) => {
    const updated = await markTaskDone(task.id);
    setTasks(updated);
    await startGeofencing();

    // Find next pending task
    const nextTask = updated.find(t => !t.done);
    if (nextTask) {
      speak(`Shabash! Ab aapko ${nextTask.locationName} jaana hai jahan aapka kaam hai.`);
    } else {
      speak('Mubarak ho! Aapnay saaray kaam mukammal kar liye!');
    }
  };

  const handleDelete = (taskId) => {
    Alert.alert('Task Delete Karo', 'Kya aap sure hain?', [
      { text: 'Nahi', style: 'cancel' },
      {
        text: 'Haan Delete Karo', style: 'destructive',
        onPress: async () => {
          const updated = await deleteTask(taskId);
          setTasks(updated);
          await startGeofencing();
        }
      }
    ]);
  };

  const pending = tasks.filter(t => !t.done);
  const done = tasks.filter(t => t.done);

  const renderTask = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, item.done && styles.cardDone]}
      onPress={() => navigation.navigate('TaskDetail', { task: item })}
      onLongPress={() => handleDelete(item.id)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.locationIcon}>📍</Text>
        <Text style={[styles.locationName, item.done && styles.textDone]}>
          {item.locationName}
        </Text>
        {item.done && <Text style={styles.doneTag}>✓ Ho gaya</Text>}
      </View>
      <Text style={[styles.taskText, item.done && styles.textDone]} numberOfLines={2}>
        {item.items?.join(' • ') || item.description}
      </Text>
      {!item.done && (
        <TouchableOpacity style={styles.doneBtn} onPress={() => handleDone(item)}>
          <Text style={styles.doneBtnText}>✓ Mark as Done</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {tasks.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>Koi task nahi hai abhi</Text>
          <Text style={styles.emptySubText}>Neeche + button se task add karo</Text>
        </View>
      ) : (
        <FlatList
          data={[...pending, ...done]}
          keyExtractor={i => i.id}
          renderItem={renderTask}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadTasks} tintColor="#6c63ff" />}
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>
              {pending.length} pending • {done.length} mukammal
            </Text>
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddTask')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', padding: 16 },
  sectionTitle: { color: '#888', fontSize: 13, marginBottom: 12, marginTop: 4 },
  card: {
    backgroundColor: '#1a1a2e', borderRadius: 14, padding: 16,
    marginBottom: 12, borderLeftWidth: 3, borderLeftColor: '#6c63ff',
  },
  cardDone: { borderLeftColor: '#2ecc71', opacity: 0.6 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  locationIcon: { fontSize: 16, marginRight: 6 },
  locationName: { fontSize: 16, fontWeight: 'bold', color: '#fff', flex: 1 },
  textDone: { color: '#888', textDecorationLine: 'line-through' },
  doneTag: { color: '#2ecc71', fontSize: 12, fontWeight: 'bold' },
  taskText: { color: '#ccc', fontSize: 13, lineHeight: 20 },
  doneBtn: {
    marginTop: 12, backgroundColor: '#6c63ff', borderRadius: 8,
    paddingVertical: 8, alignItems: 'center',
  },
  doneBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    backgroundColor: '#6c63ff', width: 58, height: 58,
    borderRadius: 29, justifyContent: 'center', alignItems: 'center',
    elevation: 8,
  },
  fabText: { color: '#fff', fontSize: 30, lineHeight: 34 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  emptySubText: { color: '#888', fontSize: 14, marginTop: 6 },
});
