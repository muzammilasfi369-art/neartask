import * as Location from 'expo-location';
import { getTasks } from './storage';

const GEOFENCE_TASK = 'NEARTASK_GEOFENCE';

export const startGeofencing = async () => {
  const tasks = await getTasks();
  const regions = tasks
    .filter(t => !t.done && t.latitude && t.longitude)
    .map(t => ({
      identifier: t.locationId,
      latitude: t.latitude,
      longitude: t.longitude,
      radius: t.radius || 200, // 200 meters default
      notifyOnEnter: true,
      notifyOnExit: false,
    }));

  if (regions.length === 0) return;

  const isRegistered = await Location.hasStartedGeofencingAsync(GEOFENCE_TASK);
  if (isRegistered) await Location.stopGeofencingAsync(GEOFENCE_TASK);

  await Location.startGeofencingAsync(GEOFENCE_TASK, regions);
};

export const stopGeofencing = async () => {
  const isRegistered = await Location.hasStartedGeofencingAsync(GEOFENCE_TASK);
  if (isRegistered) await Location.stopGeofencingAsync(GEOFENCE_TASK);
};

export const getCurrentLocation = async () => {
  const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  return loc.coords;
};
