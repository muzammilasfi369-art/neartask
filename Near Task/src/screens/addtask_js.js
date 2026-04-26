import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { addTask } from '../utils/storage';
import { startGeofencing, getCurrentLocation } from '../utils/geofence';
import { speak } from '../utils/voice';

export default function AddTaskScreen({ navigation }) {
  const [locationName, setLocationName] = useState('');
  const [items, setItems] = useState(['']);
  const [radius, setRadius] = useState('200');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);

  const fetchCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const coords = await getCurrentLocation();
      setLat(coords.latitude.toString());
      setLng(coords.longitude.toString());
      Alert.alert('✅ Location Mil Gayi!', `Lat: ${coords.latitude.toFixed(5)}\nLng: ${coords.longitude.toFixed(5)}`);
    } catch {
      Alert.alert('Error', 'Location nahi mili. Permission check karo.');
    }
    setLoadingLocation(false);
  };

  const addItem = () => setItems([...items, '']);
  const updateItem = (text, idx) => {
    const updated = [...items];
    updated[idx] = text;
    setItems(updated);
  };
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!locationName.trim()) return Alert.alert('Error', 'Location ka naam likhna zaroori hai!');
    if (!lat || !lng) return Alert.alert('Error', 'Location coordinates chahiye! Neeche se detect karo ya manually likho.');
    const cleanItems = items.filter(i => i.trim());
    if (cleanItems.length === 0) return Alert.alert('Error', 'Kam az kam ek kaam likho!');

    const voiceMessage = `Boss, aap abhi ${locationName} mein hain. Aapko yahan say ${cleanItems.join(', ')} lena tha.`;

    await addTask({
      locationName: locationName.trim(),
      locationId: `loc_${Date.now()}`,
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      radius: parseInt(radius) || 200,
      items: cleanItems,
      voiceMessage,
      description: cleanItems.join(', '),
    });

    await startGeofencing();
    speak(`Task save ho gaya. Jab aap ${locationName} pohonchenge, main aapko bataoonga.`);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>📍 Jagah ka Naam</Text>
      <TextInput
        style={styles.input}
        placeholder="Jaise: Imtiaz Super Market, Pari Mall..."
        placeholderTextColor="#555"
        value={locationName}
        onChangeText={setLocationName}
      />

      <Text style={styles.label}>🗺️ Location (Coordinates)</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1, marginRight: 8 }]}
          placeholder="Latitude"
          placeholderTextColor="#555"
          value={lat}
          onChangeText={setLat}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Longitude"
          placeholderTextColor="#555"
          value={lng}
          onChangeText={setLng}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity style={styles.locationBtn} onPress={fetchCurrentLocation}>
        {loadingLocation
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.locationBtnText}>📡 Abhi Ki Location Use Karo</Text>
        }
      </TouchableOpacity>
      <Text style={styles.hint}>Ya Google Maps se location copy karo aur upar paste karo</Text>

      <Text style={styles.label}>📏 Radius (Meters)</Text>
      <TextInput
        style={styles.input}
        placeholder="200 (200 meter range)"
        placeholderTextColor="#555"
        value={radius}
        onChangeText={setRadius}
        keyboardType="numeric"
      />

      <Text style={styles.label}>🛒 Kya Karna Hai Yahan?</Text>
      {items.map((item, idx) => (
        <View key={idx} style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 8 }]}
            placeholder={`Kaam ${idx + 1}: Jaise shoes lena, books lena...`}
            placeholderTextColor="#555"
            value={item}
            onChangeText={t => updateItem(t, idx)}
          />
          {items.length > 1 && (
            <TouchableOpacity onPress={() => removeItem(idx)} style={styles.removeBtn}>
              <Text style={{ color: '#e74c3c', fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      <TouchableOpacity style={styles.addItemBtn} onPress={addItem}>
        <Text style={styles.addItemBtnText}>+ Aur Kaam Add Karo</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>✅ Task Save Karo</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', padding: 16 },
  label: { color: '#6c63ff', fontSize: 14, fontWeight: 'bold', marginTop: 16, marginBottom: 6 },
  input: {
    backgroundColor: '#1a1a2e', color: '#fff', borderRadius: 10,
    padding: 12, fontSize: 14, borderWidth: 1, borderColor: '#2a2a4a', marginBottom: 6,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  locationBtn: {
    backgroundColor: '#16213e', borderRadius: 10, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: '#6c63ff', marginBottom: 6,
  },
  locationBtnText: { color: '#6c63ff', fontWeight: 'bold' },
  hint: { color: '#555', fontSize: 12, marginBottom: 8 },
  removeBtn: { padding: 10 },
  addItemBtn: {
    borderWidth: 1, borderColor: '#6c63ff', borderStyle: 'dashed',
    borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 4,
  },
  addItemBtnText: { color: '#6c63ff' },
  saveBtn: {
    backgroundColor: '#6c63ff', borderRadius: 12, padding: 16,
    alignItems: 'center', marginTop: 24,
  },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
