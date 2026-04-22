import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { Trophy, TimerReset, Sparkles, Send, List, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RankingEntry {
  name: string;
  time: number;
  date: string;
}

const ResultScreen: React.FC = () => {
  const { timerMs, resetGame } = useGameStore();
  const [nickname, setNickname] = React.useState('');
  const [isRegistered, setIsRegistered] = React.useState(false);
  const [allTimeRankings, setAllTimeRankings] = React.useState<RankingEntry[]>([]);
  const [dailyRankings, setDailyRankings] = React.useState<RankingEntry[]>([]);
  const [tab, setTab] = React.useState<'all' | 'daily'>('all');

  // ランキングの読み込みと日付チェック
  React.useEffect(() => {
    const today = new Date().toLocaleDateString('ja-JP');
    
    // 歴代ランキング
    const savedAllTime = localStorage.getItem('crazy_signup_alltime');
    if (savedAllTime) setAllTimeRankings(JSON.parse(savedAllTime));

    // デイリーランキング
    const savedDaily = localStorage.getItem('crazy_signup_daily');
    const lastDailyDate = localStorage.getItem('crazy_signup_daily_date');

    if (lastDailyDate === today && savedDaily) {
      setDailyRankings(JSON.parse(savedDaily));
    } else {
      // 日付が変わっていたらクリア
      setDailyRankings([]);
      localStorage.setItem('crazy_signup_daily', JSON.stringify([]));
      localStorage.setItem('crazy_signup_daily_date', today);
    }
  }, []);

  const handleRegister = () => {
    if (!nickname.trim()) return;
    const today = new Date().toLocaleDateString('ja-JP');
    const entry = { name: nickname, time: timerMs, date: today };

    // 歴代更新（上位10名）
    const newAllTime = [...allTimeRankings, entry]
      .sort((a, b) => a.time - b.time)
      .slice(0, 10);
    setAllTimeRankings(newAllTime);
    localStorage.setItem('crazy_signup_alltime', JSON.stringify(newAllTime));

    // デイリー更新（全員）
    const newDaily = [...dailyRankings, entry]
      .sort((a, b) => a.time - b.time);
    setDailyRankings(newDaily);
    localStorage.setItem('crazy_signup_daily', JSON.stringify(newDaily));

    setIsRegistered(true);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const milliseconds = ms % 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${Math.floor(milliseconds / 10).toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-8 md:p-12 shadow-xl flex flex-col items-center">
      
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="mb-8"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Trophy className="w-12 h-12 text-white" />
        </div>
      </motion.div>

      <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Registration Complete</h2>

      <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 w-full max-w-sm flex flex-col items-center justify-center mb-8 shadow-sm">
        <span className="text-gray-400 font-bold mb-2 tracking-widest text-sm">CLEAR TIME</span>
        <div className="flex items-center text-4xl md:text-5xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
          <Sparkles className="w-6 h-6 text-cyan-400 mr-2 opacity-50" />
          {formatTime(timerMs)}
          <Sparkles className="w-6 h-6 text-indigo-400 ml-2 opacity-50" />
        </div>
      </div>

      {!isRegistered ? (
        <div className="w-full max-w-sm mb-10 space-y-3">
          <p className="text-sm font-bold text-gray-500 text-center uppercase tracking-tighter">Ranking Registration</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="ニックネームを入力"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button
              onClick={handleRegister}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center"
            >
              <Send className="w-4 h-4 mr-2" />
              登録
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-sm mb-10 p-4 bg-green-50 border border-green-100 rounded-lg text-center">
          <p className="text-green-700 font-bold">ランキングに登録しました！</p>
        </div>
      )}

      {/* Rankings Section */}
      <div className="w-full max-w-sm mb-10 border-t border-gray-100 pt-6">
        <div className="flex gap-4 mb-6 bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setTab('all')}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2 ${tab === 'all' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
          >
            <Trophy className="w-3 h-3" /> 歴代TOP10
          </button>
          <button 
            onClick={() => setTab('daily')}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2 ${tab === 'daily' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
          >
            <Calendar className="w-3 h-3" /> デイリー
          </button>
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
          {(tab === 'all' ? allTimeRankings : dailyRankings).map((rank, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              key={i} 
              className="flex items-center justify-between p-2 rounded bg-gray-50/50 border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold ${
                  i === 0 ? 'bg-yellow-100 text-yellow-700' : 
                  i === 1 ? 'bg-gray-200 text-gray-700' : 
                  i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-400'
                }`}>
                  {i + 1}
                </span>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-700 text-sm truncate max-w-[120px]">{rank.name}</span>
                  {tab === 'all' && <span className="text-[10px] text-gray-400 font-mono">{rank.date}</span>}
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-indigo-500">{formatTime(rank.time)}</span>
            </motion.div>
          ))}
          {(tab === 'all' ? allTimeRankings : dailyRankings).length === 0 && (
            <p className="text-center text-gray-400 text-xs py-8">まだ記録がありません</p>
          )}
        </div>
      </div>

      <button
        onClick={resetGame}
        className="flex items-center px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors border border-gray-200"
      >
        <TimerReset className="mr-2" />
        トップへ戻る
      </button>

    </div>
  );
};

export default ResultScreen;
