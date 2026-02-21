import React from 'react';
import { UserProfile, Measurement } from '../types';
import { calculateBMR, calculateTDEE } from '../utils';
import { Activity, Flame, Scale, Ruler } from 'lucide-react';

interface Props {
  profile: UserProfile;
  latestMeasurement: Measurement | null;
}

export function Dashboard({ profile, latestMeasurement }: Props) {
  const weight = latestMeasurement?.weight;
  
  const bmr = weight ? calculateBMR(profile, weight) : null;
  const tdee = bmr ? calculateTDEE(bmr, profile.activityLevel) : null;

  return (
    <div className="space-y-6">
      <div className="bg-indigo-600 text-white rounded-3xl p-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        <h2 className="text-xl font-medium mb-1 relative z-10">Resumo Diário</h2>
        <p className="text-indigo-100 text-sm mb-6 relative z-10">Baseado no seu último peso registrado</p>
        
        {weight ? (
          <div className="grid grid-cols-2 gap-4 relative z-10">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
              <div className="flex items-center gap-2 text-indigo-100 mb-2">
                <Flame size={18} />
                <span className="text-sm font-medium">TMB</span>
              </div>
              <div className="text-2xl font-bold">{Math.round(bmr!)} <span className="text-sm font-normal text-indigo-200">kcal</span></div>
              <p className="text-xs text-indigo-200 mt-1">Gasto em repouso</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
              <div className="flex items-center gap-2 text-indigo-100 mb-2">
                <Activity size={18} />
                <span className="text-sm font-medium">TDEE</span>
              </div>
              <div className="text-2xl font-bold">{Math.round(tdee!)} <span className="text-sm font-normal text-indigo-200">kcal</span></div>
              <p className="text-xs text-indigo-200 mt-1">Gasto total diário</p>
            </div>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center relative z-10">
            <p className="text-indigo-100">Adicione seu primeiro peso para calcular a TMB.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
            <Scale size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Peso Atual</p>
            <p className="text-xl font-bold text-gray-900">
              {weight ? `${weight} kg` : '--'}
            </p>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
            <Ruler size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Altura</p>
            <p className="text-xl font-bold text-gray-900">{profile.height} cm</p>
          </div>
        </div>
      </div>
    </div>
  );
}
