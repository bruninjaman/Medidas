import { useState, useEffect } from 'react';
import { UserProfile, Measurement } from './types';

const PROFILE_KEY = 'tmb_profile';
const MEASUREMENTS_KEY = 'tmb_measurements';

export function useAppStore() {
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(PROFILE_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const [measurements, setMeasurements] = useState<Measurement[]>(() => {
    const saved = localStorage.getItem(MEASUREMENTS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const saveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
  };

  const addMeasurement = (measurement: Omit<Measurement, 'id'>) => {
    const newMeasurement = { ...measurement, id: crypto.randomUUID() };
    const newMeasurements = [...measurements, newMeasurement].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setMeasurements(newMeasurements);
    localStorage.setItem(MEASUREMENTS_KEY, JSON.stringify(newMeasurements));
  };

  const deleteMeasurement = (id: string) => {
    const newMeasurements = measurements.filter(m => m.id !== id);
    setMeasurements(newMeasurements);
    localStorage.setItem(MEASUREMENTS_KEY, JSON.stringify(newMeasurements));
  };

  const updateMeasurement = (id: string, measurement: Omit<Measurement, 'id'>) => {
    const newMeasurements = measurements.map(m => m.id === id ? { ...measurement, id } : m);
    newMeasurements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setMeasurements(newMeasurements);
    localStorage.setItem(MEASUREMENTS_KEY, JSON.stringify(newMeasurements));
  };

  const exportData = () => {
    const data = {
      profile,
      measurements,
      version: 1,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medidas-save-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.profile) {
        saveProfile(data.profile);
      }
      if (Array.isArray(data.measurements)) {
        setMeasurements(data.measurements);
        localStorage.setItem(MEASUREMENTS_KEY, JSON.stringify(data.measurements));
      }
      return true;
    } catch (e) {
      console.error('Error importing data:', e);
      return false;
    }
  };

  return { profile, saveProfile, measurements, addMeasurement, updateMeasurement, deleteMeasurement, exportData, importData };
}
