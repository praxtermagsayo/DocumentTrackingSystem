import { useState, useRef, type CSSProperties } from 'react';
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

// ── BACKUP: Previous smooth transition ──────────────────────────────
// const DURATION = '0.8s';
// const EASING = 'cubic-bezier(0.65, 0, 0.35, 1)';
// overlay transition: `all ${DURATION} ${EASING}`
// ─────────────────────────────────────────────────────────────────────

// Elastic animation duration
const ANIM_DURATION = '0.9s';

// Duration/easing for parallax forms (kept smooth so forms don't jitter)
const FORM_DURATION = '0.8s';
const FORM_EASING = 'cubic-bezier(0.65, 0, 0.35, 1)';

// CSS keyframes for elastic stretch & fling
const elasticKeyframes = `
@keyframes elasticSlideRight {
  0% {
    transform: translateX(0%);
    border-radius: 2.5rem 10rem 10rem 2.5rem;
  }
  /* Stretch phase — panel widens toward target direction */
  20% {
    transform: translateX(5%) scaleX(1.25);
    border-radius: 4rem 8rem 8rem 4rem;
  }
  /* Fling — snaps past target, compressed */
  55% {
    transform: translateX(102%) scaleX(0.95);
    border-radius: 10rem 2.5rem 2.5rem 10rem;
  }
  /* Overshoot bounce back */
  75% {
    transform: translateX(98%) scaleX(1.03);
    border-radius: 10rem 2.5rem 2.5rem 10rem;
  }
  /* Settle */
  100% {
    transform: translateX(100%) scaleX(1);
    border-radius: 10rem 2.5rem 2.5rem 10rem;
  }
}

@keyframes elasticSlideLeft {
  0% {
    transform: translateX(100%);
    border-radius: 10rem 2.5rem 2.5rem 10rem;
  }
  /* Stretch phase — panel widens toward target direction */
  20% {
    transform: translateX(95%) scaleX(1.12);
    border-radius: 8rem 4rem 4rem 8rem;
  }
  /* Fling — snaps past target, compressed */
  55% {
    transform: translateX(-2%) scaleX(0.95);
    border-radius: 2.5rem 10rem 10rem 2.5rem;
  }
  /* Overshoot bounce back */
  75% {
    transform: translateX(2%) scaleX(1.03);
    border-radius: 2.5rem 10rem 10rem 2.5rem;
  }
  /* Settle */
  100% {
    transform: translateX(0%) scaleX(1);
    border-radius: 2.5rem 10rem 10rem 2.5rem;
  }
}
`;

import logo from '../assets/doctrack.png';

/**
 * Modern Auth Layout with elastic sliding transition.
 * 
 * The blue overlay stretches like elastic, flings into place, and settles
 * with a subtle wobble for a premium springy feel.
 */
export function AuthLayout() {
  const [searchParams, setSearchParams] = useSearchParams();
  const viewParam = searchParams.get('view');
  const currentView = viewFromParam(viewParam);

  const isRegister = currentView === 'register';
  const isForgot = currentView === 'forgot';

  // Track animation direction
  const [animDirection, setAnimDirection] = useState<'idle' | 'to-register' | 'to-login'>('idle');
  const animKeyRef = useRef(0);

  const goTo = (view: AuthView) => {
    if (view === 'login') {
      setAnimDirection('to-login');
      setSearchParams({});
    } else {
      setAnimDirection('to-register');
      setSearchParams({ view });
    }
    // Force re-trigger animation by bumping key
    animKeyRef.current += 1;
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
    height: '760px',
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
    flexDirection: 'column',
    zIndex: 1,
    overflowY: 'auto',
    paddingTop: '1.5rem',
    paddingBottom: '1.5rem',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  };

  const rightPanelStyle: CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: 0,
    width: '50%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1,
    overflowY: 'auto',
    paddingTop: '1.5rem',
    paddingBottom: '1.5rem',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  };

  // Overlay panel — elastic animation
  const getOverlayAnimation = (): string => {
    if (animDirection === 'to-register') {
      return `elasticSlideRight ${ANIM_DURATION} cubic-bezier(0.22, 1, 0.36, 1) forwards`;
    }
    if (animDirection === 'to-login') {
      return `elasticSlideLeft ${ANIM_DURATION} cubic-bezier(0.22, 1, 0.36, 1) forwards`;
    }
    return 'none';
  };

  const overlayStyle: CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '50%',
    height: '100%',
    zIndex: 100,
    // Static position when idle (no animation yet)
    transform: `translateX(${isRegister ? '100%' : '0%'})`,
    // Apply animation when direction is set
    animation: getOverlayAnimation(),
    background: `linear-gradient(135deg, ${BLUE} 0%, #1d4ed8 50%, #1e40af 100%)`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    color: '#fff',
    overflow: 'hidden',
    borderRadius: isRegister
      ? '10rem 2.5rem 2.5rem 10rem'
      : '2.5rem 10rem 10rem 2.5rem',
    transformOrigin: 'center center',
  };

  // Field Parallax Styles (kept smooth — not elastic)
  const registerParallax: CSSProperties = {
    width: '100%',
    maxWidth: '24rem',
    margin: 'auto', // Center vertically and horizontally inside the flex-column container safely
    padding: '2rem 1.5rem',
    transition: `all ${FORM_DURATION} ${FORM_EASING}`,
    transform: isRegister ? 'translateX(0)' : 'translateX(-60px)',
    opacity: isRegister ? 1 : 0,
    pointerEvents: isRegister ? 'auto' : 'none',
    visibility: isRegister ? 'visible' : 'hidden',
  };

  const loginParallax: CSSProperties = {
    width: '100%',
    maxWidth: '24rem',
    margin: 'auto', // Safely center vertically without top-clipping
    padding: '2rem 1.5rem',
    transition: `all ${FORM_DURATION} ${FORM_EASING}`,
    transform: isRegister ? 'translateX(60px)' : 'translateX(0)',
    opacity: isRegister ? 0 : 1,
    pointerEvents: isRegister ? 'none' : 'auto',
    visibility: isRegister ? 'hidden' : 'visible',
  };

  const overlayContent = () => {
    return (
      <>
        {/* Branding Row */}
        <div className="flex flex-col items-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <img src={logo} alt="DocTrack Logo" className="w-48 h-auto drop-shadow-2xl" />
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
      {/* Inject elastic keyframes */}
      <style>{elasticKeyframes}</style>

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

        {/* Overlay Panel — elastic animation */}
        <div key={animKeyRef.current} style={overlayStyle}>
          {overlayContent()}
        </div>

      </div>
    </div>
  );
}
