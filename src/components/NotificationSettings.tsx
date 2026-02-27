import { Bell, BellOff, BellRing, Check, AlertTriangle } from 'lucide-react';
import { NotificationSettings as NotificationSettingsType } from '../hooks/useNotifications';

const DAYS_OF_WEEK = [
    { value: 0, label: 'Dom' },
    { value: 1, label: 'Seg' },
    { value: 2, label: 'Ter' },
    { value: 3, label: 'Qua' },
    { value: 4, label: 'Qui' },
    { value: 5, label: 'Sex' },
    { value: 6, label: 'Sáb' },
];

interface Props {
    settings: NotificationSettingsType;
    permission: NotificationPermission;
    hasWeightThisWeek: boolean;
    hasMeasurementsInLastTwoWeeks: boolean;
    onUpdateSettings: (settings: NotificationSettingsType) => void;
    onEnable: () => Promise<boolean>;
    onDisable: () => void;
    onTest: () => Promise<boolean>;
}

export function NotificationSettingsPanel({
    settings,
    permission,
    hasWeightThisWeek,
    hasMeasurementsInLastTwoWeeks,
    onUpdateSettings,
    onEnable,
    onDisable,
    onTest,
}: Props) {

    const handleToggle = async () => {
        if (settings.enabled) {
            onDisable();
        } else {
            await onEnable();
        }
    };

    const handleWeightDayChange = (day: number) => {
        onUpdateSettings({ ...settings, weightReminderDay: day });
    };

    const handleMeasurementDayChange = (day: number) => {
        onUpdateSettings({ ...settings, measurementReminderDay: day });
    };

    const isNotificationSupported = 'Notification' in window;

    return (
        <div className="space-y-4">
            {/* Header Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 p-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${settings.enabled ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
                            } transition-all duration-300`}>
                            {settings.enabled ? <BellRing size={22} /> : <BellOff size={22} />}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Lembretes</h3>
                            <p className="text-xs text-gray-500">
                                {settings.enabled ? 'Ativo — você será notificado' : 'Desativado'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleToggle}
                        disabled={!isNotificationSupported}
                        className={`relative w-14 h-8 rounded-full transition-all duration-300 ${settings.enabled
                            ? 'bg-indigo-600 shadow-inner shadow-indigo-700'
                            : 'bg-gray-300'
                            } ${!isNotificationSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <span
                            className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${settings.enabled ? 'left-7' : 'left-1'
                                }`}
                        />
                    </button>
                </div>

                {!isNotificationSupported && (
                    <div className="mt-3 flex items-center gap-2 text-amber-700 bg-amber-50 p-3 rounded-xl text-xs">
                        <AlertTriangle size={16} />
                        <span>Notificações não são suportadas neste navegador.</span>
                    </div>
                )}

                {permission === 'denied' && isNotificationSupported && (
                    <div className="mt-3 flex items-center gap-2 text-red-700 bg-red-50 p-3 rounded-xl text-xs">
                        <AlertTriangle size={16} />
                        <span>Permissão negada. Ative notificações nas configurações do navegador.</span>
                    </div>
                )}

                {settings.enabled && permission === 'granted' && (
                    <button
                        onClick={onTest}
                        className="mt-4 w-full bg-white/50 hover:bg-white text-indigo-600 border border-indigo-200 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <BellRing size={14} />
                        Testar Notificação Agora
                    </button>
                )}
            </div>

            {/* Status do Período */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Status dos Lembretes</h4>
                <div className="grid grid-cols-2 gap-3">
                    <div className={`p-3 rounded-xl border ${hasWeightThisWeek ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                        <div className="flex items-center gap-2 mb-1">
                            {hasWeightThisWeek ? (
                                <Check size={14} className="text-emerald-600" />
                            ) : (
                                <AlertTriangle size={14} className="text-amber-600" />
                            )}
                            <span className="text-xs font-semibold text-gray-700">Peso (Semanal)</span>
                        </div>
                        <p className={`text-lg font-bold ${hasWeightThisWeek ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {hasWeightThisWeek ? 'Feito ✓' : 'Pendente'}
                        </p>
                    </div>

                    <div className={`p-3 rounded-xl border ${hasMeasurementsInLastTwoWeeks ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                        <div className="flex items-center gap-2 mb-1">
                            {hasMeasurementsInLastTwoWeeks ? (
                                <Check size={14} className="text-emerald-600" />
                            ) : (
                                <AlertTriangle size={14} className="text-amber-600" />
                            )}
                            <span className="text-xs font-semibold text-gray-700">Medidas (14d)</span>
                        </div>
                        <p className={`text-lg font-bold ${hasMeasurementsInLastTwoWeeks ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {hasMeasurementsInLastTwoWeeks ? 'Feito ✓' : 'Pendente'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Configuration (shown only when enabled) */}
            {settings.enabled && (
                <>
                    {/* Weight Reminder Config */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Bell size={16} className="text-indigo-600" />
                            <h4 className="text-sm font-bold text-gray-900">Lembrete de Peso</h4>
                            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-semibold">1x/semana</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">Selecione o dia para ser lembrado de pesar (caso não tenha pesado na semana):</p>

                        <div className="flex gap-1.5 mb-3">
                            {DAYS_OF_WEEK.map(day => (
                                <button
                                    key={day.value}
                                    onClick={() => handleWeightDayChange(day.value)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${settings.weightReminderDay === day.value
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Horário</label>
                            <input
                                type="time"
                                value={settings.weightReminderTime}
                                onChange={e => onUpdateSettings({ ...settings, weightReminderTime: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Measurement Reminder Config */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Bell size={16} className="text-violet-600" />
                            <h4 className="text-sm font-bold text-gray-900">Lembrete de Medidas</h4>
                            <span className="text-[10px] bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full font-semibold">1x a cada 2 semanas</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">Selecione o dia para ser lembrado de tirar medidas corporais (caso não tenha medido nos últimos 14 dias):</p>

                        <div className="flex gap-1.5 mb-3">
                            {DAYS_OF_WEEK.map(day => (
                                <button
                                    key={day.value}
                                    onClick={() => handleMeasurementDayChange(day.value)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${settings.measurementReminderDay === day.value
                                        ? 'bg-violet-600 text-white shadow-md shadow-violet-200'
                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Horário</label>
                            <input
                                type="time"
                                value={settings.measurementReminderTime}
                                onChange={e => onUpdateSettings({ ...settings, measurementReminderTime: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
