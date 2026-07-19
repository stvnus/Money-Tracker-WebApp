import React, { useContext } from "react";
import { authContext } from "@/library/store/authContext";
import { FcGoogle } from "react-icons/fc";
import { 
  TrendingUp, 
  PieChart, 
  Lock, 
  ArrowUpRight,
  Sparkles,
  Wallet,
  Coins
} from "lucide-react"; 

function SignIn() {
  const { googleLoginHandler } = useContext(authContext);

  return (
    // FIX: Mengubah bg-[#0b0f19] menjadi bg-[#0f1422] agar warnanya sama persis dengan aplikasi utama Anda
    <div className="min-h-screen bg-[#0f1422] flex flex-col justify-between p-4 md:p-8 text-slate-300 font-sans relative overflow-hidden select-none">
      
      {/* ================= BACKGROUND DOODLES ================= */}
      <div className="absolute top-10 left-10 text-emerald-500/10 rotate-12 animate-pulse hidden lg:block">
        <Coins size={120} strokeWidth={1} />
      </div>
      <div className="absolute bottom-16 left-1/3 text-blue-500/10 -rotate-12 hidden lg:block">
        <Wallet size={140} strokeWidth={1} />
      </div>
      <div className="absolute top-24 right-1/4 text-amber-500/10 rotate-45 hidden lg:block">
        <Sparkles size={80} strokeWidth={1} />
      </div>
      <div className="absolute bottom-10 right-10 text-purple-500/10 -rotate-45 hidden lg:block">
        <ArrowUpRight size={160} strokeWidth={1} />
      </div>
      
      {/* Lingkaran Gradasi Lembut di Belakang Card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* ================= CONTAINER UTAMA ================= */}
      <main className="w-full max-w-6xl mx-auto my-auto border border-white/5 bg-[#131929]/40 rounded-[32px] p-8 sm:p-12 md:p-16 lg:p-20 shadow-2xl backdrop-blur-xl grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
        
        {/* BAGIAN KIRI: BRANDING & FITUR */}
        <div className="flex flex-col justify-center space-y-10 lg:col-span-7">
          
          {/* LOGO DENGAN GAMBAR CUSTOM */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center shadow-lg overflow-hidden bg-slate-800">
              <img 
                src="/a1.jpg" 
                alt="YooMoney Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-wider leading-none">YooMoney</h2>
              <span className="text-sm text-emerald-400 font-semibold tracking-wide">Tracker Tool</span>
            </div>
          </div>

          {/* HEADLINE */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.15]">
              Track Smarter. <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500 bg-clip-text text-transparent">
                Grow Faster.
              </span>
            </h1>
            <p className="text-slate-400 text-base md:text-lg max-w-md leading-relaxed">
              Monitor your income, expenses, and goals all in one simple dashboard.
            </p>
          </div>

          {/* LIST FITUR */}
          <div className="space-y-6 pt-2 max-w-lg">
            <div className="flex items-start gap-5 group">
              <div className="p-3.5 bg-slate-800/40 border border-white/5 rounded-2xl text-blue-400 mt-1 shadow-md group-hover:border-blue-500/30 transition-all duration-300">
                <TrendingUp size={22} />
              </div>
              <div>
                <h4 className="text-base font-bold text-white tracking-wide">Smart Tracking</h4>
                <p className="text-sm text-slate-400 mt-1 leading-relaxed">Monitor income and expenses in real-time.</p>
              </div>
            </div>

            <div className="flex items-start gap-5 group">
              <div className="p-3.5 bg-slate-800/40 border border-white/5 rounded-2xl text-emerald-400 mt-1 shadow-md group-hover:border-emerald-500/30 transition-all duration-300">
                <PieChart size={22} />
              </div>
              <div>
                <h4 className="text-base font-bold text-white tracking-wide">Insights & Reports</h4>
                <p className="text-sm text-slate-400 mt-1 leading-relaxed">Visualize your progress with powerful reports.</p>
              </div>
            </div>

          </div>
        </div>

        {/* BAGIAN KANAN: CARD SIGN IN */}
        <div className="w-full lg:col-span-5 bg-[#131929]/90 border border-white/5 rounded-[24px] p-8 sm:p-10 md:p-12 shadow-2xl flex flex-col items-center text-center justify-center relative backdrop-blur-md">
          
          <div className="w-20 h-20 rounded-full bg-slate-800/60 border border-white/5 flex items-center justify-center text-blue-400 shadow-inner mb-8 relative">
            <Lock size={30} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full"></div>
          </div>

          <h3 className="text-2xl font-extrabold text-white tracking-wide">Welcome back!</h3>
          <p className="text-sm text-slate-400 mt-2 mb-10">Please sign in to continue</p>

          <button
            onClick={googleLoginHandler}
            className="w-full flex items-center justify-center gap-4 py-4 px-6 bg-slate-800 hover:bg-slate-700 border border-white/10 hover:border-white/20 rounded-2xl font-bold text-white text-base transition-all shadow-md active:scale-[0.98] hover:shadow-xl hover:shadow-blue-500/5 duration-200"
          >
            <FcGoogle className="text-2xl" /> 
            <span>Continue with Google</span>
          </button>
        </div>
      </main>
      
    </div>
  );
}

export default SignIn;