import { toast as sonnerToast, type ExternalToast } from 'sonner';

/**
 * A wrapper around sonner's toast that intercepts error messages
 * and triggers a global elastic animation on the document body.
 */
export const toast = {
    ...sonnerToast,
    error: (message: string | React.ReactNode, data?: ExternalToast) => {
        // Trigger elastic animation on the entire page
        document.body.classList.remove('animate-elastic-bounce');
        // Force a reflow so the browser restarts the animation if it was already playing
        void document.body.offsetWidth;
        document.body.classList.add('animate-elastic-bounce');

        // Remove the class after the animation duration (300ms) so it can trigger again
        setTimeout(() => {
            document.body.classList.remove('animate-elastic-bounce');
        }, 300);

        return sonnerToast.error(message, data);
    },
};
