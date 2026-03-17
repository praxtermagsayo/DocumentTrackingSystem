import Lottie from 'lottie-react';
import loadingAnimation from '../../assets/lottie/loading.json';

interface FullScreenLoaderProps {
    isOpen: boolean;
    message?: string;
}

export function FullScreenLoader({ isOpen, message = 'Processing...' }: FullScreenLoaderProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-md animate-fade-in">
            <div className="flex flex-col items-center gap-6 p-12 rounded-3xl bg-white border border-slate-200 shadow-xl">
                <div className="w-48 h-48">
                    <Lottie
                        animationData={loadingAnimation}
                        loop={true}
                        autoplay={true}
                    />
                </div>
                <p className="text-xl font-bold text-slate-900 tracking-[0.2em] uppercase animate-pulse">
                    {message}
                </p>
            </div>
        </div>
    );
}
