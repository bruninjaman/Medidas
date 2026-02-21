import React, { useState } from 'react';
import { Measurement } from '../types';
import { format } from 'date-fns';

interface Props {
  onSave: (measurement: Omit<Measurement, 'id'>) => void;
  onCancel: () => void;
}

export function MeasurementForm({ onSave, onCancel }: Props) {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [weight, setWeight] = useState<number | ''>('');
  
  // Optional measurements
  const [chest, setChest] = useState<number | ''>('');
  const [waist, setWaist] = useState<number | ''>('');
  const [hips, setHips] = useState<number | ''>('');
  const [leftArm, setLeftArm] = useState<number | ''>('');
  const [rightArm, setRightArm] = useState<number | ''>('');
  const [leftThigh, setLeftThigh] = useState<number | ''>('');
  const [rightThigh, setRightThigh] = useState<number | ''>('');
  const [calves, setCalves] = useState<number | ''>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (weight && date) {
      onSave({
        date: new Date(date).toISOString(),
        weight: Number(weight),
        chest: chest ? Number(chest) : undefined,
        waist: waist ? Number(waist) : undefined,
        hips: hips ? Number(hips) : undefined,
        leftArm: leftArm ? Number(leftArm) : undefined,
        rightArm: rightArm ? Number(rightArm) : undefined,
        leftThigh: leftThigh ? Number(leftThigh) : undefined,
        rightThigh: rightThigh ? Number(rightThigh) : undefined,
        calves: calves ? Number(calves) : undefined,
      });
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col max-h-[90vh] sm:max-h-[85vh]">
      <div className="flex justify-between items-center p-6 pb-2 border-b border-gray-50">
        <h2 className="text-xl font-bold text-gray-900">Nova Medida</h2>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-2">
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg) *</label>
            <input
              type="number"
              step="0.1"
              required
              value={weight}
              onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
              placeholder="Ex: 70.5"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-widest">Medidas Opcionais (cm)</h3>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Peito</label>
              <input type="number" step="0.1" value={chest} onChange={(e) => setChest(e.target.value ? Number(e.target.value) : '')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Cintura</label>
              <input type="number" step="0.1" value={waist} onChange={(e) => setWaist(e.target.value ? Number(e.target.value) : '')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Quadril</label>
              <input type="number" step="0.1" value={hips} onChange={(e) => setHips(e.target.value ? Number(e.target.value) : '')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Panturrilhas</label>
              <input type="number" step="0.1" value={calves} onChange={(e) => setCalves(e.target.value ? Number(e.target.value) : '')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Braço Esq.</label>
                <input type="number" step="0.1" value={leftArm} onChange={(e) => setLeftArm(e.target.value ? Number(e.target.value) : '')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Braço Dir.</label>
                <input type="number" step="0.1" value={rightArm} onChange={(e) => setRightArm(e.target.value ? Number(e.target.value) : '')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
            </div>
            
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Coxa Esq.</label>
                <input type="number" step="0.1" value={leftThigh} onChange={(e) => setLeftThigh(e.target.value ? Number(e.target.value) : '')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Coxa Dir.</label>
                <input type="number" step="0.1" value={rightThigh} onChange={(e) => setRightThigh(e.target.value ? Number(e.target.value) : '')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 pt-4 border-t border-gray-100 flex gap-3 bg-gray-50 rounded-b-3xl">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-all text-sm"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-all text-sm shadow-md shadow-indigo-100"
        >
          Salvar
        </button>
      </div>
    </form>
  );
}
