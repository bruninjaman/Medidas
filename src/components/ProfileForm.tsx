import React, { useState } from 'react';
import { UserProfile, Gender, ActivityLevel } from '../types';
import { ACTIVITY_LEVEL_LABELS } from '../utils';

interface Props {
  initialProfile: UserProfile | null;
  onSave: (profile: UserProfile) => void;
}

export function ProfileForm({ initialProfile, onSave }: Props) {
  const [age, setAge] = useState<number | ''>(initialProfile?.age || '');
  const [height, setHeight] = useState<number | ''>(initialProfile?.height || '');
  const [gender, setGender] = useState<Gender>(initialProfile?.gender || 'male');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(initialProfile?.activityLevel || 'sedentary');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (age && height) {
      onSave({
        age: Number(age),
        height: Number(height),
        gender,
        activityLevel
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Seu Perfil</h2>
        <p className="text-sm text-gray-500 mb-6">
          Precisamos desses dados para calcular sua Taxa Metabólica Basal (TMB).
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Idade (anos)</label>
          <input
            type="number"
            required
            min="10"
            max="120"
            value={age}
            onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            placeholder="Ex: 30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Altura (cm)</label>
          <input
            type="number"
            required
            min="100"
            max="250"
            value={height}
            onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : '')}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            placeholder="Ex: 175"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Gênero Biológico</label>
        <div className="flex gap-4">
          <label className="flex-1 cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="male"
              checked={gender === 'male'}
              onChange={(e) => setGender(e.target.value as Gender)}
              className="peer sr-only"
            />
            <div className="text-center px-4 py-3 border border-gray-200 rounded-xl peer-checked:border-indigo-500 peer-checked:bg-indigo-50 peer-checked:text-indigo-700 transition-all">
              Masculino
            </div>
          </label>
          <label className="flex-1 cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="female"
              checked={gender === 'female'}
              onChange={(e) => setGender(e.target.value as Gender)}
              className="peer sr-only"
            />
            <div className="text-center px-4 py-3 border border-gray-200 rounded-xl peer-checked:border-indigo-500 peer-checked:bg-indigo-50 peer-checked:text-indigo-700 transition-all">
              Feminino
            </div>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nível de Atividade</label>
        <select
          value={activityLevel}
          onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
        >
          {Object.entries(ACTIVITY_LEVEL_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="w-full bg-indigo-600 text-white font-medium py-3 px-4 rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all"
      >
        Salvar Perfil
      </button>
    </form>
  );
}
