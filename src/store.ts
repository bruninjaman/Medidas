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

  return { profile, saveProfile, measurements, addMeasurement, deleteMeasurement };
}
