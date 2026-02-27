/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useAppStore } from './store';
import { ProfileForm } from './components/ProfileForm';
import { Dashboard } from './components/Dashboard';
import { MeasurementForm } from './components/MeasurementForm';
import { History } from './components/History';
import { NotificationSettingsPanel } from './components/NotificationSettings';
import { Plus, History as HistoryIcon, LayoutDashboard, UserCircle, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { APP_VERSION } from './version';
import ReloadPrompt from './components/ReloadPrompt';
import { useNotifications } from './hooks/useNotifications';


type View = 'dashboard' | 'history' | 'profile';
const VIEWS: View[] = ['dashboard', 'history', 'profile'];

export default function App() {
  const { profile, saveProfile, measurements, addMeasurement, updateMeasurement, deleteMeasurement } = useAppStore();
  const [view, setView] = useState<View>('dashboard');
  const [isAddingMeasurement, setIsAddingMeasurement] = useState(false);
  const [direction, setDirection] = useState(0);
  const notifications = useNotifications(measurements);

  const handleSetView = (newView: View) => {
    const currentIndex = VIEWS.indexOf(view);
    const nextIndex = VIEWS.indexOf(newView);
    if (currentIndex !== nextIndex) {
      setDirection(nextIndex > currentIndex ? 1 : -1);
      setView(newView);
    }
  };

  const paginate = (newDirection: number) => {
    const currentIndex = VIEWS.indexOf(view);
    const nextIndex = currentIndex + newDirection;
    if (nextIndex >= 0 && nextIndex < VIEWS.length) {
      setDirection(newDirection);
      setView(VIEWS[nextIndex]);
    }
  };

  // If no profile, force profile setup
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold mx-auto mb-4 shadow-lg">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="10" rx="2" />
                <line x1="6" y1="7" x2="6" y2="11" />
                <line x1="10" y1="7" x2="10" y2="13" />
                <line x1="14" y1="7" x2="14" y2="11" />
                <line x1="18" y1="7" x2="18" y2="13" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Medidas</h1>
            <p className="text-gray-500">Vamos começar configurando seu perfil básico.</p>
          </div>
          <ProfileForm initialProfile={null} onSave={saveProfile} />
        </div>
      </div>
    );
  }

  const latestMeasurement = measurements[0] || null;

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : direction < 0 ? -100 : 0,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : direction > 0 ? -100 : 0,
      opacity: 0,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 overflow-x-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="10" rx="2" />
                <line x1="6" y1="7" x2="6" y2="10" />
                <line x1="10" y1="7" x2="10" y2="12" />
                <line x1="14" y1="7" x2="14" y2="10" />
                <line x1="18" y1="7" x2="18" y2="12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Medidas</h1>
          </div>
          <button
            onClick={() => handleSetView('profile')}
            className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors border border-gray-100"
          >
            <UserCircle size={24} />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6">
        <AnimatePresence mode="popLayout" custom={direction} initial={false}>
          <motion.div
            key={view}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(_e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);
              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
            className="w-full"
          >
            {view === 'dashboard' && (
              <div className="space-y-6">
                <Dashboard profile={profile} latestMeasurement={latestMeasurement} />

                <div className="flex justify-between items-center pt-4">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Últimas Atividades</h3>
                  <button
                    onClick={() => handleSetView('history')}
                    className="text-indigo-600 text-sm font-medium hover:underline"
                  >
                    Ver tudo
                  </button>
                </div>

                <div className="space-y-3">
                  {measurements.slice(0, 3).map(m => (
                    <div key={m.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-900">{m.weight} kg</p>
                        <p className="text-xs text-gray-400">{new Date(m.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="text-gray-300">→</div>
                    </div>
                  ))}
                  {measurements.length === 0 && (
                    <div className="bg-dashed border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
                      <p className="text-gray-400 text-sm">Nenhum registro ainda.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {view === 'history' && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <button onClick={() => handleSetView('dashboard')} className="text-gray-400">←</button>
                  <h2 className="text-2xl font-bold text-gray-900">Histórico</h2>
                </div>
                <History measurements={measurements} onDelete={deleteMeasurement} onUpdate={updateMeasurement} />
              </div>
            )}

            {view === 'profile' && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <button onClick={() => handleSetView('dashboard')} className="text-gray-400">←</button>
                  <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
                </div>
                <ProfileForm initialProfile={profile} onSave={(p) => { saveProfile(p); handleSetView('dashboard'); }} />

                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">Notificações</h3>
                  <NotificationSettingsPanel
                    settings={notifications.settings}
                    permission={notifications.permission}
                    hasWeightThisWeek={notifications.hasWeightThisWeek}
                    hasMeasurementsInLastTwoWeeks={notifications.hasMeasurementsInLastTwoWeeks}
                    onUpdateSettings={notifications.updateSettings}
                    onEnable={notifications.enableNotifications}
                    onDisable={notifications.disableNotifications}
                    onTest={notifications.testNotification}
                  />
                </div>

                <div className="mt-8 p-6 bg-red-50 rounded-2xl border border-red-100">
                  <h3 className="text-red-800 font-semibold mb-2">Zona de Perigo</h3>
                  <p className="text-red-600 text-sm mb-4">Isso apagará todos os seus dados permanentemente.</p>
                  <button
                    onClick={() => {
                      if (window.confirm('Apagar todos os dados?')) {
                        localStorage.clear();
                        window.location.reload();
                      }
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Redefinir Aplicativo
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsAddingMeasurement(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-indigo-700 transition-all hover:scale-110 active:scale-95 z-30"
      >
        <Plus size={28} />
      </button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 z-20">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <button
            onClick={() => handleSetView('dashboard')}
            className={`flex flex-col items-center gap-1 transition-colors ${view === 'dashboard' ? 'text-indigo-600' : 'text-gray-400'}`}
          >
            <LayoutDashboard size={24} />
            <span className="text-[10px] font-medium">Início</span>
          </button>
          <button
            onClick={() => handleSetView('history')}
            className={`flex flex-col items-center gap-1 transition-colors ${view === 'history' ? 'text-indigo-600' : 'text-gray-400'}`}
          >
            <HistoryIcon size={24} />
            <span className="text-[10px] font-medium">Histórico</span>
          </button>
          <button
            onClick={() => handleSetView('profile')}
            className={`flex flex-col items-center gap-1 transition-colors ${view === 'profile' ? 'text-indigo-600' : 'text-gray-400'}`}
          >
            <Settings size={24} />
            <span className="text-[10px] font-medium">Perfil</span>
          </button>
        </div>
      </nav>

      {/* Version Display */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-1 pointer-events-none z-10">
        <span className="text-[8px] text-gray-300 font-mono">v{APP_VERSION}</span>
      </div>

      <ReloadPrompt />


      {/* Modal for adding measurement */}
      <AnimatePresence>
        {isAddingMeasurement && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingMeasurement(false)}
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
                onSave={addMeasurement}
                onCancel={() => setIsAddingMeasurement(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

