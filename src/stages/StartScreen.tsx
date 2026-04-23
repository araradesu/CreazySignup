import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { Play, AlertTriangle, Trophy, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabase';

interface RankingEntry {
  name: string;
  time: number;
  date: string;
}

const StartScreen: React.FC = () => {
  const startGame = useGameStore(state => state.startGame);
  const [allTimeRankings, setAllTimeRankings] = React.useState<RankingEntry[]>([]);
  const [dailyRankings, setDailyRankings] = React.useState<RankingEntry[]>([]);
  const [tab, setTab] = React.useState<'all' | 'daily'>('all');
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchRankings = React.useCallback(async () => {
    setIsLoading(true);
    const today = new Date().toLocaleDateString('ja-JP');

    // 歴代ランキング取得
    const { data: allData } = await supabase
      .from('rankings')
      .select('name, time, date')
      .order('time', { ascending: true })
      .limit(10);
    
    if (allData) setAllTimeRankings(allData);

    // デイリーランキング取得
    const { data: dailyData } = await supabase
      .from('rankings')
      .select('name, time, date')
      .eq('date', today)
      .order('time', { ascending: true });

    if (dailyData) setDailyRankings(dailyData);
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const milliseconds = ms % 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${Math.floor(milliseconds / 10).toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-xl backdrop-blur-xl">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6 text-center"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500 mb-2 tracking-tight">
          CrazySignUp
        </h1>
        <p className="text-gray-500 text-base md:text-lg">URESHIISERVICE 新規会員登録タイムアタック</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-10">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-yellow-50 border border-yellow-200 p-5 rounded-lg h-full"
        >
          <div className="flex items-start mb-3 text-yellow-700">
            <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
            <h2 className="text-lg font-bold">注意事項</h2>
          </div>
          <ul className="text-yellow-800 text-sm list-disc ml-6 space-y-1 leading-relaxed">
            <li>これは架空の登録サイトを使用したゲームです。</li>
            <li>いかに早く登録を完了できるかを競います。</li>
            <li><strong>実際の個人情報は絶対に入力しないでください</strong>。</li>
            <li>理不尽な仕様が含まれています。</li>
          </ul>
        </motion.div>

        {/* Ranking Display */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-50 border border-gray-200 p-5 rounded-lg flex flex-col h-full"
        >
          <div className="flex gap-2 mb-4 bg-gray-200 p-1 rounded-lg shrink-0">
            <button 
              onClick={() => setTab('all')}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all flex items-center justify-center gap-2 ${tab === 'all' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
            >
              <Trophy className="w-3 h-3" /> 歴代
            </button>
            <button 
              onClick={() => setTab('daily')}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all flex items-center justify-center gap-2 ${tab === 'daily' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
            >
              <Calendar className="w-3 h-3" /> 本日
            </button>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center py-10 gap-2 text-indigo-300 italic text-sm">
              <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              データを取得中...
            </div>
          ) : (
            <>
              {(tab === 'all' ? allTimeRankings : dailyRankings).map((rank, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold ${
                      i === 0 ? 'bg-yellow-500/20 text-yellow-400' : 
                      i === 1 ? 'bg-gray-400/20 text-gray-300' : 
                      i === 2 ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-gray-500'
                    }`}>
                      {i + 1}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-200 text-sm truncate max-w-[150px]">{rank.name}</span>
                      {tab === 'all' && <span className="text-[10px] text-indigo-400/60 font-mono">{rank.date}</span>}
                    </div>
                  </div>
                  <span className="font-mono text-sm font-bold text-indigo-400">{formatTime(rank.time)}</span>
                </div>
              ))}
              {(tab === 'all' ? allTimeRankings : dailyRankings).length === 0 && (
                <p className="text-center text-indigo-300/40 text-xs py-10">まだランキングデータがありません</p>
              )}
            </>
          )}
        </div>
        </motion.div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={startGame}
        className="group relative flex items-center justify-center px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xl rounded-lg overflow-hidden transition-all shadow-md hover:shadow-lg w-full max-w-sm mb-8"
      >
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
        <span className="relative flex items-center">
          <Play className="mr-2 w-6 h-6" />
          ゲームスタート
        </span>
      </motion.button>

      <footer className="w-full text-center text-gray-300 text-xs mt-4">
        ver.1.2
      </footer>
    </div>
  );
};

export default StartScreen;
