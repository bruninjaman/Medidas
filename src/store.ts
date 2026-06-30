import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
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

  const exportData = async () => {
    const data = {
      profile,
      measurements,
      version: 1,
      exportedAt: new Date().toISOString()
    };
    const fileName = `medidas-save-${new Date().toISOString().split('T')[0]}.json`;

    if (Capacitor.isNativePlatform()) {
      try {
        await Filesystem.writeFile({
          path: fileName,
          data: JSON.stringify(data, null, 2),
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        });

        const uriResult = await Filesystem.getUri({
          directory: Directory.Cache,
          path: fileName,
        });

        await Share.share({
          title: 'Exportar Medidas',
          text: 'Backup de dados do aplicativo Medidas',
          files: [uriResult.uri],
          dialogTitle: 'Compartilhar backup',
        });
      } catch (err) {
        console.error('Error sharing native file:', err);
        alert('Erro ao compartilhar backup: ' + (err as Error).message);
      }
    } else {
      const jsonString = JSON.stringify(data, null, 2);

      if (navigator.share) {
        try {
          const file = new File([jsonString], fileName, { type: 'application/json' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'Exportar Medidas',
              text: 'Backup de dados do aplicativo Medidas',
            });
            return;
          }
        } catch (shareErr) {
          console.warn('Web share failed, falling back to download', shareErr);
        }
      }

      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    }
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
