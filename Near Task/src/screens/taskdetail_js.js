import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { speak } from '../utils/voice';

export default function TaskDetailScreen({ route }) {
  const { task } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.locationName}>📍 {task.locationName}</Text>
        <Text style={styles.status}>{task.done ? '✅ Mukammal' : '⏳ Pending'}</Text>
      </View>

      <Text style={styles.sectionTitle}>🛒 Kaam Ki List:</Text>
      {task.items?.map((item, i) => (
        <View key={i} style={styles.itemRow}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.itemText}>{item}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>🗺️ Location:</Text>
      <View style={styles.coordBox}>
        <Text style={styles.coordText}>Lat: {task.latitude}</Text>
        <Text style={styles.coordText}>Lng: {task.longitude}</Text>
        <Text style={styles.coordText}>Radius: {task.radius}m</Text>
      </View>

      <Text style={styles.sectionTitle}>🔊 Voice Message:</Text>
      <View style={styles.voiceBox}>
        <Text style={styles.voiceText}>{task.voiceMessage}</Text>
      </View>

      <TouchableOpacity style={styles.playBtn} onPress={() => speak(task.voiceMessage)}>
        <Text style={styles.playBtnText}>▶ Voice Sun'no</Text>
      </TouchableOpacity>

      <Text style={styles.createdAt}>
        Banaya: {new Date(task.createdAt).toLocaleDateString('ur-PK')}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', padding: 16 },
  card: {
    backgroundColor: '#1a1a2e', borderRadius: 14, padding: 16,
    marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  locationName: { color: '#fff', fontSize: 18, fontWeight: 'bold', flex: 1 },
  status: { color: '#6c63ff', fontWeight: 'bold' },
  sectionTitle: { color: '#6c63ff', fontWeight: 'bold', fontSize: 14, marginTop: 16, marginBottom: 8 },
  itemRow: { flexDirection: 'row', marginBottom: 6, paddingLeft: 8 },
  bullet: { color: '#6c63ff', marginRight: 8, fontSize: 16 },
  itemText: { color: '#ccc', fontSize: 14, flex: 1 },
  coordBox: { backgroundColor: '#1a1a2e', borderRadius: 10, padding: 12 },
  coordText: { color: '#888', fontSize: 13, marginBottom: 4 },
  voiceBox: { backgroundColor: '#16213e', borderRadius: 10, padding: 12, borderLeftWidth: 3, borderLeftColor: '#6c63ff' },
  voiceText: { color: '#ccc', fontSize: 13, lineHeight: 22 },
  playBtn: {
    backgroundColor: '#1a1a2e', borderRadius: 10, padding: 14,
    alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: '#6c63ff',
  },
  playBtnText: { color: '#6c63ff', fontWeight: 'bold' },
  createdAt: { color: '#444', fontSize: 12, textAlign: 'center', marginTop: 24 },
});
