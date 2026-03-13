import Lottie from 'lottie-react';
import loadingAnimation from '../../assets/lottie/loading.json';

interface FullScreenLoaderProps {
    isOpen: boolean;
    message?: string;
}

export function FullScreenLoader({ isOpen, message = 'Processing...' }: FullScreenLoaderProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl animate-fade-in">
            <div className="flex flex-col items-center gap-6 p-12 rounded-3xl bg-slate-900 border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.9)]">
                <div className="w-48 h-48 drop-shadow-xl">
                    <Lottie
                        animationData={loadingAnimation}
                        loop={true}
                        autoplay={true}
                    />
                </div>
                <p className="text-xl font-bold text-white tracking-[0.2em] uppercase animate-pulse">
                    {message}
                </p>
            </div>
        </div>
    );
}
