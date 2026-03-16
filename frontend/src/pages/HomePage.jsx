import { Link } from 'react-router-dom';

function HomePage() {
  const pageClass = 'bg-[#020617] text-white';
  const cardClass = 'bg-[#0f172a]/60 border border-slate-800 shadow-2xl backdrop-blur-xl';
  const subtitleClass = 'text-slate-400';
  const primaryClass = 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]';
  const secondaryClass = 'bg-slate-800/50 text-white hover:bg-slate-800 border border-slate-700';

  return (
    <div className={`relative min-h-screen flex items-center justify-center overflow-hidden font-display ${pageClass}`}>
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none"></div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <div className="container relative z-10 mx-auto px-4 flex flex-col items-center">
        {/* Logo/Icon */}
        <div className="mb-8 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-700">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.3)] ring-1 ring-white/20">
                <span className="material-symbols-outlined text-white text-5xl">hexagon</span>
            </div>
            <div className="h-6 w-px bg-gradient-to-b from-blue-500 to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className={`max-w-3xl w-full rounded-[40px] border p-12 text-center relative ${cardClass} animate-in fade-in slide-in-from-bottom-8 duration-1000`}>
          <div className="absolute -top-px left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
          
          <h1 className="text-4xl sm:text-7xl font-black tracking-tighter leading-[1.1] mb-6">
            The Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-blue-500 drop-shadow-sm">Evolution</span> Of Development
          </h1>
          
          <p className={`max-w-xl mx-auto text-lg sm:text-xl font-medium leading-relaxed mb-10 ${subtitleClass}`}>
            Synchronize your workflow with the industry's most powerful AI-driven collaboration engine. Built for the modern engineer.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link 
              to="/login" 
              className={`group relative flex items-center gap-3 rounded-full px-10 py-5 text-lg font-bold transition-all hover:-translate-y-1 active:scale-95 ${primaryClass}`}
            >
              Get Started Now
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
            
            <Link 
              to="/signup" 
              className={`flex items-center gap-2 rounded-full px-10 py-5 text-lg font-bold transition-all hover:bg-slate-800 ${secondaryClass}`}
            >
              Sign Up
            </Link>
          </div>

          {/* Trust Badges / Info */}
          <div className="mt-16 pt-8 border-t border-slate-800/50 flex flex-wrap justify-center gap-8 opacity-40">
            <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all cursor-crosshair">
                <span className="material-symbols-outlined text-xl">security</span>
                <span className="text-xs font-bold uppercase tracking-widest">Enterprise Encrypted</span>
            </div>
            <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all cursor-crosshair">
                <span className="material-symbols-outlined text-xl">vitals</span>
                <span className="text-xs font-bold uppercase tracking-widest">Low Latency Core</span>
            </div>
            <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all cursor-crosshair">
                <span className="material-symbols-outlined text-xl">database</span>
                <span className="text-xs font-bold uppercase tracking-widest">Edge-First Sync</span>
            </div>
          </div>
        </div>

        {/* Footer Attribution */}
        <p className="mt-12 text-[10px] font-bold text-slate-600 uppercase tracking-[0.4em] animate-pulse">
            Terminal Session V2.0.4 // DevSpace Active
        </p>
      </div>
    </div>
  );
}

export default HomePage;
