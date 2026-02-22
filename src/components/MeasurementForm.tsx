import React, { useState } from 'react';
import { Measurement } from '../types';
import { format } from 'date-fns';

interface Props {
  onSave: (measurement: Omit<Measurement, 'id'>) => void;
  onCancel: () => void;
  initialData?: Measurement;
}

export function MeasurementForm({ onSave, onCancel, initialData }: Props) {
  // Use initialData.date if provided, otherwise default to current date
  const [date, setDate] = useState(() =>
    initialData ? format(new Date(initialData.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  );
  const [weight, setWeight] = useState<number | ''>(initialData?.weight || '');

  // Optional measurements
  const [chest, setChest] = useState<number | ''>(initialData?.chest || '');
  const [waist, setWaist] = useState<number | ''>(initialData?.waist || '');
  const [hips, setHips] = useState<number | ''>(initialData?.hips || '');
  const [leftArm, setLeftArm] = useState<number | ''>(initialData?.leftArm || '');
  const [rightArm, setRightArm] = useState<number | ''>(initialData?.rightArm || '');
  const [leftThigh, setLeftThigh] = useState<number | ''>(initialData?.leftThigh || '');
  const [rightThigh, setRightThigh] = useState<number | ''>(initialData?.rightThigh || '');
  const [calves, setCalves] = useState<number | ''>(initialData?.calves || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (weight && date) {
      // Create date at the current local time to avoid timezone offset issues (e.g. 22/02 becoming 21/02)
      // and to ensure multiple measurements on the same day are sorted correctly
      const [year, month, day] = date.split('-');

      let dateObj: Date;
      if (initialData && date === format(new Date(initialData.date), 'yyyy-MM-dd')) {
        // If editing and date hasn't changed, keep the exact original time
        dateObj = new Date(initialData.date);
      } else {
        const now = new Date();
        dateObj = new Date(
          Number(year),
          Number(month) - 1,
          Number(day),
          now.getHours(),
          now.getMinutes(),
          now.getSeconds()
        );
      }

      onSave({
        date: dateObj.toISOString(),
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
        <h2 className="text-xl font-bold text-gray-900">{initialData ? 'Editar Medida' : 'Nova Medida'}</h2>
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
