import { useState, type CSSProperties } from 'react';
import { useSearchParams } from 'react-router';
import { FileText } from 'lucide-react';
import { Login } from './login';
import { Register } from './register';
import { ForgotPassword } from './forgot-password';

export type AuthView = 'login' | 'register' | 'forgot';

function viewFromParam(param: string | null): AuthView {
  if (param === 'register' || param === 'forgot') return param;
  return 'login';
}

const BLUE = '#2563eb';
const DURATION = '0.8s'; // Slightly slower for more premium feel
const EASING = 'cubic-bezier(0.65, 0, 0.35, 1)';

/**
 * Modern Auth Layout with high-quality parallax sliding transition.
 * 
 * Logic:
 * - Two static containers, each 50% width.
 * - Overlay slides on top (0% to 50% left).
 * - Forms inside containers have their own parallax translations.
 */
export function AuthLayout() {
  const [searchParams, setSearchParams] = useSearchParams();
  const viewParam = searchParams.get('view');
  const currentView = viewFromParam(viewParam);

  const isRegister = currentView === 'register';
  const isForgot = currentView === 'forgot';

  const goTo = (view: AuthView) => {
    if (view === 'login') {
      setSearchParams({});
    } else {
      setSearchParams({ view });
    }
  };

  // --- Styles ---
  const wrapperStyle: CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    backgroundColor: '#f8fafc',
    backgroundImage: 'radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.05) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(37, 99, 235, 0.05) 0px, transparent 50%)',
  };

  const cardStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: '60rem',
    height: '720px',
    borderRadius: '2.5rem',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
    overflow: 'hidden',
    backgroundColor: '#fff',
    display: 'flex',
  };

  // Panel wrappers (static halves)
  const leftPanelStyle: CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '50%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    overflow: 'hidden',
  };

  const rightPanelStyle: CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: 0,
    width: '50%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    overflow: 'hidden',
  };

  // Overlay panel
  const overlayStyle: CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '50%',
    height: '100%',
    zIndex: 100,
    transform: `translateX(${isRegister ? '100%' : '0%'})`,
    transition: `all ${DURATION} ${EASING}`,
    background: `linear-gradient(135deg, ${BLUE} 0%, #1d4ed8 50%, #1e40af 100%)`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    color: '#fff',
    overflow: 'hidden',
    borderRadius: isRegister
      ? '10rem 2.5rem 2.5rem 10rem' // Rounded left side when overlay is on the right
      : '2.5rem 10rem 10rem 2.5rem', // Rounded right side when overlay is on the left
  };

  // Field Parallax Styles
  // Register fields (left side) move right-to-left as overlay moves away
  const registerParallax: CSSProperties = {
    width: '100%',
    maxWidth: '24rem',
    padding: '0 1.5rem',
    transition: `all ${DURATION} ${EASING}`,
    transform: isRegister ? 'translateX(0)' : 'translateX(-60px)',
    opacity: isRegister ? 1 : 0,
    pointerEvents: isRegister ? 'auto' : 'none',
    visibility: isRegister ? 'visible' : 'hidden',
  };

  // Login fields (right side) move left-to-right as overlay moves away
  const loginParallax: CSSProperties = {
    width: '100%',
    maxWidth: '24rem',
    padding: '0 1.5rem',
    transition: `all ${DURATION} ${EASING}`,
    transform: isRegister ? 'translateX(60px)' : 'translateX(0)',
    opacity: isRegister ? 0 : 1,
    pointerEvents: isRegister ? 'none' : 'auto',
    visibility: isRegister ? 'hidden' : 'visible',
  };

  const overlayContent = () => {
    return (
      <>
        {/* Branding Row */}
        <div className="flex items-center gap-4 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shadow-inner">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">DocTrack</h2>
        </div>

        {/* Dynamic Heading Section */}
        <div className="space-y-4 mb-14 w-full px-6 flex-shrink-0 animate-in fade-in zoom-in-95 duration-700 delay-200">
          <h3 className="text-4xl font-bold tracking-tight">
            {isRegister ? 'Join Us' : 'Welcome back'}
          </h3>
          <p className="text-white/80 text-lg leading-relaxed max-w-xs mx-auto">
            {isRegister
              ? 'Create an account to start tracking your documents today.'
              : 'Sign in to continue managing your documents and tracking.'}
          </p>
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <br />
          <button
            onClick={() => goTo(isRegister ? 'login' : 'register')}
            className="flex-shrink-0 bg-white hover:bg-slate-50 text-blue-600 rounded-xl font-bold transition-all duration-300 active:scale-95 text-base shadow-xl flex items-center justify-center"
            style={{
              width: '200px',
              height: '50px',
              minHeight: '50px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {isRegister ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </>
    );
  };

  return (
    <div style={wrapperStyle}>
      <div style={cardStyle}>

        {/* Left Side: Register Form (uncovered when overlay is on right) */}
        <div style={leftPanelStyle}>
          <div style={registerParallax}>
            <Register embedded />
          </div>
        </div>

        {/* Right Side: Login Form (uncovered when overlay is on left) */}
        <div style={rightPanelStyle}>
          <div style={loginParallax}>
            {isForgot ? <ForgotPassword embedded /> : <Login embedded />}
          </div>
        </div>

        {/* Overlay Panel */}
        <div style={overlayStyle}>
          {overlayContent()}
        </div>

      </div>
    </div>
  );
}
