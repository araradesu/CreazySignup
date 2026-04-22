import { useEffect } from 'react';
import { useGameStore } from './store/useGameStore';
import StartScreen from './stages/StartScreen';
import Stage1 from './stages/Stage1';
import Stage2 from './stages/Stage2';
import Stage3 from './stages/Stage3';
import Stage4 from './stages/Stage4';
import ResultScreen from './stages/ResultScreen';
import { Timer, Search, Menu, Bell, User } from 'lucide-react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

function App() {
  const { stage, isPlaying, timerMs, incrementTimer, penaltyState } = useGameStore();
  const headerControls = useAnimation();

  useEffect(() => {
    let interval: number;
    let lastTime = performance.now();
    if (isPlaying) {
      // 10msごとにタイマー更新（タブ非アクティブ時の遅延対応）
      interval = window.setInterval(() => {
        const now = performance.now();
        incrementTimer(Math.floor(now - lastTime));
        lastTime = now;
      }, 10);
    }
    return () => clearInterval(interval);
  }, [isPlaying, incrementTimer]);

  useEffect(() => {
    if (!isPlaying) return;
    
    if (penaltyState) {
      headerControls.start({
        y: 0,
        opacity: 1,
        backgroundColor: ["rgba(254, 226, 226, 0.95)", "rgba(255, 255, 255, 0.95)"],
        boxShadow: ["0 0 30px rgba(239, 68, 68, 0.4)", "0 1px 3px 0 rgba(0, 0, 0, 0.1)"],
        transition: { duration: 0.6, ease: "easeOut" }
      });
    } else {
      headerControls.start({
        y: 0,
        opacity: 1,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        transition: { duration: 0.3 }
      });
    }
  }, [penaltyState, headerControls, isPlaying]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const milliseconds = ms % 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${Math.floor(milliseconds / 10).toString().padStart(2, '0')}`;
  };

  const renderStage = () => {
    switch (stage) {
      case 0: return <StartScreen />;
      case 1: return <Stage1 />;
      case 2: return <Stage2 />;
      case 3: return <Stage3 />;
      case 4: return <Stage4 />;
      case 5: return <ResultScreen />;
      default: return <StartScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center relative overflow-hidden font-sans text-gray-800">
      
      {/* 偽のヘッダー：本物のサイトっぽくする */}
      <header className="w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shrink-0 z-50 fixed top-0 left-0 right-0 shadow-sm">
        <div className="flex items-center space-x-8">
          <div className="text-2xl font-black text-indigo-600 tracking-tighter cursor-pointer">
            URESHII<span className="text-gray-900">SERVICE</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <span className="text-sm font-bold text-gray-900 cursor-pointer hover:text-indigo-600 transition-colors">HOME</span>
            <span className="text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-900 transition-colors">SERVICES</span>
            <span className="text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-900 transition-colors">PLANS</span>
            <span className="text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-900 transition-colors">ABOUT US</span>
            <span className="text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-900 transition-colors">SUPPORT</span>
          </nav>
        </div>
        <div className="flex items-center space-x-4 md:space-x-6 text-gray-500">
          <Search className="w-5 h-5 cursor-pointer hover:text-gray-900 transition-colors" />
          <Bell className="w-5 h-5 cursor-pointer hover:text-gray-900 transition-colors hidden sm:block" />
          <User className="w-5 h-5 cursor-pointer hover:text-gray-900 transition-colors hidden sm:block" />
          <Menu className="w-6 h-6 cursor-pointer md:hidden hover:text-gray-900" />
        </div>
      </header>

      {/* 常に表示されるタイマーとプログレスヘッダー */}
      {isPlaying && (
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={headerControls}
          className="fixed top-16 left-0 right-0 backdrop-blur-md border-b border-gray-200 z-40 py-2 flex flex-col items-center justify-center shadow-sm"
        >
          <div className="flex items-center relative font-mono text-xl md:text-2xl font-bold text-indigo-600">
            <Timer className="mr-3 w-6 h-6 md:w-8 md:h-8" />
            <span>{formatTime(timerMs)}</span>
            
            <AnimatePresence>
              {penaltyState && (
                <motion.div
                  key={penaltyState.id}
                  initial={{ opacity: 0, scale: 0.9, y: 5 }}
                  animate={{ opacity: [0, 1, 1, 0], scale: [0.9, 1.1, 1, 0.95], y: [5, -5, -10, -20] }}
                  transition={{ duration: 0.8, times: [0, 0.2, 0.8, 1], ease: "easeInOut" }}
                  className="absolute left-[calc(100%+1rem)] text-red-500 font-bold text-base md:text-lg whitespace-nowrap drop-shadow-sm pointer-events-none tracking-wide"
                >
                  +{penaltyState.amount}s
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* HPバー風プログレス */}
          {stage >= 1 && stage <= 4 && (
            <div className="w-full max-w-sm h-3 mt-3 bg-gray-200 rounded-full border border-gray-300 overflow-hidden relative shadow-inner">
              <motion.div 
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500"
                initial={{ width: 0 }}
                animate={{ width: `${(stage / 4) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              <div className="absolute inset-0 flex pointer-events-none">
                <div className="w-1/4 h-full border-r border-white/60" />
                <div className="w-1/4 h-full border-r border-white/60" />
                <div className="w-1/4 h-full border-r border-white/60" />
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* メインコンテンツエリア（偽ヘッダー分の余白 pt-20 と タイマー分の余白 pt-16 を調整） */}
      <main className={`flex-1 w-full flex flex-col items-center justify-center p-4 pt-24 ${isPlaying ? 'md:pt-36 pt-32' : ''}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl"
          >
            {renderStage()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
