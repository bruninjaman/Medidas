import React, { useState } from 'react';
import { Measurement } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trash2, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MeasurementForm } from './MeasurementForm';

interface Props {
  measurements: Measurement[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, measurement: Omit<Measurement, 'id'>) => void;
}

export function History({ measurements, onDelete, onUpdate }: Props) {
  const [editingMeasurement, setEditingMeasurement] = useState<Measurement | null>(null);

  if (measurements.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📊</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma medida salva</h3>
        <p className="text-gray-500">Adicione sua primeira medida para acompanhar seu progresso.</p>
      </div>
    );
  }

  // Sort chronologically for the chart
  const chartData = [...measurements]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((m) => ({
      ...m,
      formattedDate: format(new Date(m.date), 'dd/MM', { locale: ptBR }),
    }));

  return (
    <div className="space-y-8">
      {measurements.length > 1 && (
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-6 uppercase tracking-wider">Evolução do Peso</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis
                  dataKey="id"
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val, i) => chartData.find(d => d.id === val)?.formattedDate || ''}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  dy={10}
                />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip
                  labelFormatter={(label) => chartData.find(d => d.id === label)?.formattedDate || ''}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: '#6b7280', marginBottom: '4px' }}
                />
                <Line type="monotone" dataKey="weight" name="Peso (kg)" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Histórico Detalhado</h3>
        <div className="space-y-3">
          {measurements.map((m) => (
            <div key={m.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-900 text-lg">{m.weight} <span className="text-sm font-normal text-gray-500">kg</span></p>
                  <p className="text-xs text-gray-400">{format(new Date(m.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingMeasurement(m)}
                    className="text-gray-300 hover:text-indigo-500 transition-colors p-2 rounded-full hover:bg-indigo-50"
                    title="Editar medida"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Tem certeza que deseja excluir esta medida?')) {
                        onDelete(m.id);
                      }
                    }}
                    className="text-gray-300 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                    title="Excluir medida"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Optional Measurements Grid */}
              {(m.chest || m.waist || m.hips || m.leftArm || m.rightArm || m.leftThigh || m.rightThigh || m.calves) && (
                <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-gray-50">
                  {m.chest && <div className="text-center"><p className="text-[10px] text-gray-400 uppercase">Peito</p><p className="text-sm font-medium text-gray-700">{m.chest}</p></div>}
                  {m.waist && <div className="text-center"><p className="text-[10px] text-gray-400 uppercase">Cintura</p><p className="text-sm font-medium text-gray-700">{m.waist}</p></div>}
                  {m.hips && <div className="text-center"><p className="text-[10px] text-gray-400 uppercase">Quadril</p><p className="text-sm font-medium text-gray-700">{m.hips}</p></div>}
                  {m.calves && <div className="text-center"><p className="text-[10px] text-gray-400 uppercase">Panturrilha</p><p className="text-sm font-medium text-gray-700">{m.calves}</p></div>}

                  {m.leftArm && <div className="text-center"><p className="text-[10px] text-gray-400 uppercase">Br. Esq</p><p className="text-sm font-medium text-gray-700">{m.leftArm}</p></div>}
                  {m.rightArm && <div className="text-center"><p className="text-[10px] text-gray-400 uppercase">Br. Dir</p><p className="text-sm font-medium text-gray-700">{m.rightArm}</p></div>}
                  {m.leftThigh && <div className="text-center"><p className="text-[10px] text-gray-400 uppercase">Cx. Esq</p><p className="text-sm font-medium text-gray-700">{m.leftThigh}</p></div>}
                  {m.rightThigh && <div className="text-center"><p className="text-[10px] text-gray-400 uppercase">Cx. Dir</p><p className="text-sm font-medium text-gray-700">{m.rightThigh}</p></div>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Modal for editing measurement */}
      <AnimatePresence>
        {editingMeasurement && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingMeasurement(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md pointer-events-auto"
            >
              <MeasurementForm
                initialData={editingMeasurement}
                onSave={(measurement) => {
                  onUpdate(editingMeasurement.id, measurement);
                  setEditingMeasurement(null);
                }}
                onCancel={() => setEditingMeasurement(null)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
