import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

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

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    return (
        <div className="fixed bottom-24 left-0 right-0 z-[60] flex justify-center px-4 pointer-events-none">
            {(offlineReady || needRefresh) && (
                <div className="bg-white rounded-2xl shadow-2xl border border-indigo-100 p-4 max-w-md w-full pointer-events-auto flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900">
                            {offlineReady ? 'App pronto para uso offline' : 'Nova versão disponível!'}
                        </span>
                        <span className="text-sm text-gray-500">
                            {offlineReady
                                ? 'Você pode acessar o app sem conexão com a internet.'
                                : 'Clique no botão abaixo para atualizar seu aplicativo.'}
                        </span>
                    </div>
                    <div className="flex gap-2 justify-end">
                        {needRefresh && (
                            <button
                                className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
                                onClick={() => updateServiceWorker(true)}
                            >
                                Atualizar
                            </button>
                        )}
                        <button
                            className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                            onClick={() => close()}
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReloadPrompt;
