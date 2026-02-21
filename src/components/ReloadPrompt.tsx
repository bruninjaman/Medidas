import React, { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, RefreshCw, X } from 'lucide-react';

function ReloadPrompt() {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });

    const { isInstallable, handleInstallClick, isStandalone } = usePWAInstall();
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);

    useEffect(() => {
        // Show install prompt 2 seconds after load if it's installable and not already standalone
        if (isInstallable && !isStandalone) {
            const timer = setTimeout(() => setShowInstallPrompt(true), 2000);
            return () => clearTimeout(timer);
        }
    }, [isInstallable, isStandalone]);

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
        setShowInstallPrompt(false);
    };

    const isVisible = offlineReady || needRefresh || showInstallPrompt;

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-24 left-0 right-0 z-[60] flex justify-center px-4 pointer-events-none">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4 max-w-md w-full pointer-events-auto flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-6 duration-500 shadow-indigo-500/10">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${needRefresh ? 'bg-amber-100 text-amber-600' :
                                showInstallPrompt ? 'bg-indigo-100 text-indigo-600' :
                                    'bg-emerald-100 text-emerald-600'
                            }`}>
                            {needRefresh ? <RefreshCw className="animate-spin-slow" /> :
                                showInstallPrompt ? <Download /> :
                                    <Download className="rotate-180" />}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-900 text-lg">
                                {needRefresh ? 'Nova versão disponível!' :
                                    showInstallPrompt ? 'Instalar Aplicativo?' :
                                        'App pronto para uso offline!'}
                            </span>
                            <span className="text-sm text-gray-500 leading-relaxed">
                                {needRefresh ? 'Há uma atualização disponível para melhorar sua experiência.' :
                                    showInstallPrompt ? 'Instale o Medidas na sua tela de início para acesso rápido e offline.' :
                                        'Agora você pode usar o app mesmo sem internet. Os dados serão sincronizados depois.'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={close}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex gap-2">
                    {needRefresh && (
                        <button
                            className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95 flex items-center justify-center gap-2"
                            onClick={() => updateServiceWorker(true)}
                        >
                            <RefreshCw size={18} />
                            Atualizar Agora
                        </button>
                    )}
                    {showInstallPrompt && (
                        <button
                            className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95 flex items-center justify-center gap-2"
                            onClick={handleInstallClick}
                        >
                            <Download size={18} />
                            Instalar Grátis
                        </button>
                    )}
                    {!needRefresh && !showInstallPrompt && (
                        <button
                            className="flex-1 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all active:scale-95"
                            onClick={close}
                        >
                            Entendido
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ReloadPrompt;

