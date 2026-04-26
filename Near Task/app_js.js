import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { speak } from './src/utils/voice';
import { getTasks } from './src/utils/storage';

import HomeScreen from './src/screens/HomeScreen';
import AddTaskScreen from './src/screens/AddTaskScreen';
import TaskDetailScreen from './src/screens/TaskDetailScreen';

const Stack = createStackNavigator();
const GEOFENCE_TASK = 'NEARTASK_GEOFENCE';

// Background geofence handler — runs even when app is closed
TaskManager.defineTask(GEOFENCE_TASK, async ({ data: { eventType, region }, error }) => {
  if (error) return;
  if (eventType === Location.GeofencingEventType.Enter) {
    const tasks = await getTasks();
    const matched = tasks.find(t => t.locationId === region.identifier && !t.done);
    if (matched) {
      // Show notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📍 NearTask — Aap yahan hain!',
          body: matched.voiceMessage,
          sound: true,
        },
        trigger: null,
      });
      // Voice speak (works when app is open)
      speak(matched.voiceMessage);
    }
  }
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  useEffect(() => {
    (async () => {
      // Request permissions
      await Notifications.requestPermissionsAsync();
      const { status } = await Location.requestBackgroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Background location permission chahiye geofencing ke liye!');
      }
    })();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#0f0f1a" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#0f0f1a' },
          headerTintColor: '#6c63ff',
          headerTitleStyle: { fontWeight: 'bold', color: '#fff' },
          cardStyle: { backgroundColor: '#0f0f1a' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: '📍 NearTask' }} />
        <Stack.Screen name="AddTask" component={AddTaskScreen} options={{ title: 'Naya Task' }} />
        <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Task Detail' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
