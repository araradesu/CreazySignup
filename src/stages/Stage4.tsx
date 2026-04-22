import React, { useState, useEffect } from 'react';
import { useGameStore, UserData } from '../store/useGameStore';
import { AlertCircle, HelpCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const mutateData = (data: UserData): UserData => {
  const mutated = { ...data };
  const target = Math.floor(Math.random() * 5); // 0: nick, 1: phone, 2: age, 3: gender, 4: birth
  
  if (target === 0 && mutated.nickname.length > 0) {
    const idx = Math.floor(Math.random() * mutated.nickname.length);
    const chars = "abcdefghijklmnopqrstuvwxyz1234567890あいうえお";
    const replace = chars[Math.floor(Math.random() * chars.length)];
    mutated.nickname = mutated.nickname.substring(0, idx) + replace + mutated.nickname.substring(idx + 1);
  } else if (target === 1 && mutated.phone.length > 0) {
    const idx = Math.floor(Math.random() * mutated.phone.length);
    const digit = (parseInt(mutated.phone[idx]) + 1) % 10;
    mutated.phone = mutated.phone.substring(0, idx) + digit + mutated.phone.substring(idx + 1);
  } else if (target === 2 && mutated.age !== '') {
    const age = parseInt(mutated.age);
    mutated.age = (age + (Math.random() > 0.5 ? 1 : -1)).toString();
  } else if (target === 3) {
    const genders = ['男', '女', 'その他'];
    let remaining = genders.filter(g => g !== mutated.gender);
    if(remaining.length === 0) remaining = ['その他'];
    mutated.gender = remaining[Math.floor(Math.random() * remaining.length)];
  } else {
    // birth
    if (Math.random() > 0.5) {
      // month
      let m = parseInt(mutated.birthMonth);
      m = m === 12 ? 1 : m + 1;
      mutated.birthMonth = m.toString();
    } else {
      // day
      let d = parseInt(mutated.birthDay);
      d = d === 31 ? 1 : d + 1;
      mutated.birthDay = d.toString();
    }
  }
  return mutated;
};

const Stage4: React.FC = () => {
  const { originalInputData, currentDisplayData, setCurrentDisplayData, hasMistakeFlag, setMistakeFlag, stopGame, addPenalty, hintUsedFlag, setHintUsedFlag } = useGameStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserData | null>(null);
  const [isPenaltyState, setIsPenaltyState] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);

  useEffect(() => {
    // 初回マウント時のみ、55%の確率で改変
    if (currentDisplayData && originalInputData && JSON.stringify(currentDisplayData) === JSON.stringify(originalInputData)) {
      if (Math.random() < 0.55 && !hasMistakeFlag) {
        setCurrentDisplayData(mutateData(originalInputData));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleYes = () => {
    if (JSON.stringify(currentDisplayData) === JSON.stringify(originalInputData)) {
      // 一致していればクリア
      stopGame(); // Stage 5 へ
    } else {
      // 不一致ペナルティ
      setIsPenaltyState(true);
      setMistakeFlag(true);
      addPenalty(30);
    }
  };

  const handleNo = () => {
    // 編集画面へ
    setIsPenaltyState(false);
    setFormData({ ...(currentDisplayData as UserData) });
    setIsEditing(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData && isAllValid) {
      setCurrentDisplayData(formData);
      setIsEditing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!formData) return;
    let { name, value } = e.target;
    
    if (name !== 'nickname' && name !== 'gender' && name !== 'birthMonth' && name !== 'birthDay') {
      if (value !== '' && /[^\x20-\x7E]/.test(value)) return;
    }
    
    if (name === 'phone' || name === 'age') {
      if (value !== '' && !/^[0-9]+$/.test(value)) return;
      if (name === 'age' && value !== '') {
        value = parseInt(value, 10).toString();
      }
    }
    setFormData(prev => prev ? ({ ...prev, [name]: value }) : null);
  };

  const isEmailValid = formData ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) : false;
  const isNicknameValid = formData ? formData.nickname.length >= 6 : false;
  const isPhoneValid = formData ? formData.phone.length >= 10 && formData.phone.length <= 15 : false;
  const isAgeValid = formData ? formData.age !== '' && parseInt(formData.age) > 0 : false;
  const isGenderValid = formData ? formData.gender !== '' : false;
  const isBirthValid = formData ? formData.birthMonth !== '' && formData.birthDay !== '' : false;
  const isAllValid = isEmailValid && isNicknameValid && isPhoneValid && isAgeValid && isGenderValid && isBirthValid;

  const handleHintUse = () => {
    if (!hintUsedFlag) {
      addPenalty(30);
      setHintUsedFlag(true);
    }
    setShowHintModal(true);
  };

  if (!currentDisplayData || !originalInputData) return <div className="text-white">Data Missing Error</div>;

  if (isEditing && formData) {
    return (
      <div className="w-full bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-3">登録内容の修正</h2>
        
        <form onSubmit={handleSaveEdit} className="space-y-6 text-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
              <input 
                type="email" name="email" value={formData.email} onChange={handleChange} autoComplete="new-password"
                className={`w-full bg-white border ${isEmailValid || formData.email === '' ? 'border-gray-300 focus:border-indigo-500' : 'border-red-500 focus:border-red-500'} text-gray-900 rounded-[4px] p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none`}
              />
              {formData.email !== '' && !isEmailValid && <p className="text-xs text-red-500 font-bold mt-1">正しいメールアドレス形式で入力してください</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">ニックネーム (6文字以上)</label>
              <input 
                type="text" name="nickname" value={formData.nickname} onChange={handleChange} autoComplete="new-password"
                className={`w-full bg-white border ${isNicknameValid || formData.nickname === '' ? 'border-gray-300 focus:border-indigo-500' : 'border-red-500 focus:border-red-500'} text-gray-900 rounded-[4px] p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none`}
              />
              {formData.nickname !== '' && !isNicknameValid && <p className="text-xs text-red-500 font-bold mt-1">6文字以上で入力してください</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">電話番号 (ハイフンなし)</label>
              <input 
                type="tel" name="phone" value={formData.phone} onChange={handleChange} autoComplete="new-password"
                className={`w-full bg-white border ${isPhoneValid || formData.phone === '' ? 'border-gray-300 focus:border-indigo-500' : 'border-red-500 focus:border-red-500'} text-gray-900 rounded-[4px] p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none`}
              />
              {formData.phone !== '' && !isPhoneValid && <p className="text-xs text-red-500 font-bold mt-1">10〜15桁の数字で入力してください</p>}
            </div>

            <div className="flex gap-4">
              <div className="space-y-2 flex-1">
                <label className="block text-sm font-medium text-gray-700">年齢</label>
                <input 
                  type="text" name="age" value={formData.age} onChange={handleChange} autoComplete="off"
                  className={`w-full bg-white border ${isAgeValid || formData.age === '' ? 'border-gray-300 focus:border-indigo-500' : 'border-red-500 focus:border-red-500'} text-gray-900 rounded-[4px] p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none`}
                />
                {formData.age !== '' && !isAgeValid && <p className="text-xs text-red-500 font-bold mt-1">正しい年齢を入力してください</p>}
              </div>
              
              <div className="space-y-2 flex-1">
                <label className="block text-sm font-medium text-gray-700">性別</label>
                <div className="flex border border-gray-300 rounded-[4px] overflow-hidden bg-gray-50 h-[42px]">
                  {['男', '女', 'その他'].map(g => (
                    <label key={g} className={`flex-1 flex items-center justify-center cursor-pointer text-sm border-r border-gray-300 last:border-0 ${formData.gender === g ? 'bg-indigo-600 text-white font-medium' : 'hover:bg-gray-100 text-gray-700'}`}>
                      <input type="radio" name="gender" value={g} checked={formData.gender === g} onChange={handleChange} className="hidden" />
                      {g}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">誕生日</label>
              <div className="flex gap-2">
                <select name="birthMonth" value={formData.birthMonth} onChange={handleChange} className="flex-1 bg-white border border-gray-300 text-gray-900 rounded-[4px] p-2 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none">
                  <option value="">月</option>
                  {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>{m}月</option>
                  ))}
                </select>
                <select name="birthDay" value={formData.birthDay} onChange={handleChange} className="flex-1 bg-white border border-gray-300 text-gray-900 rounded-[4px] p-2 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none">
                  <option value="">日</option>
                  {Array.from({length: 31}, (_, i) => i + 1).map(d => (
                    <option key={d} value={d}>{d}日</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <motion.button 
              type="submit" 
              disabled={!isAllValid}
              className={`px-8 py-3 rounded-[4px] font-bold text-white transition-colors ${
                isAllValid ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md cursor-pointer' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              修正を確定する
            </motion.button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-md relative overflow-hidden">
      
      <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-3 flex items-center">
        STEP 4: 最終確認
      </h2>

      <p className="text-lg text-gray-800 font-bold mb-6 text-center">最初に入力した内容と<br className="md:hidden"/>お間違えありませんか？</p>
      
      <div className="bg-gray-50 border border-gray-200 rounded-md p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-gray-800">
        <div><span className="text-gray-500 text-sm block">メールアドレス</span><span className="font-mono text-lg">{currentDisplayData.email}</span></div>
        <div><span className="text-gray-500 text-sm block">ニックネーム</span><span className="text-lg">{currentDisplayData.nickname}</span></div>
        <div><span className="text-gray-500 text-sm block">電話番号</span><span className="font-mono text-lg">{currentDisplayData.phone}</span></div>
        <div><span className="text-gray-500 text-sm block">年齢</span><span className="text-lg">{currentDisplayData.age} 歳</span></div>
        <div><span className="text-gray-500 text-sm block">性別</span><span className="text-lg">{currentDisplayData.gender}</span></div>
        <div><span className="text-gray-500 text-sm block">生年月日</span><span className="text-lg">{currentDisplayData.birthMonth}月 {currentDisplayData.birthDay}日</span></div>
      </div>

      <div className="relative flex flex-col items-center w-full">
        <AnimatePresence>
          {isPenaltyState && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute -top-12 bg-white text-red-600 font-bold px-6 py-2 rounded-full shadow-md border border-red-200 z-10 pointer-events-none whitespace-nowrap"
            >
              <AlertCircle className="w-5 h-5 inline mr-2 align-text-bottom" />
              間違いがあります
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
          <button onClick={handleYes} className="flex-1 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded text-lg shadow-md hover:shadow-lg transition-colors">はい</button>
          <button onClick={handleNo} className="flex-1 px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded text-lg shadow-sm border border-gray-300 transition-colors">いいえ</button>
        </div>
      </div>

      {hasMistakeFlag && !isPenaltyState && !showHintModal && (
        <div className="w-full mt-6 flex justify-center">
          <button 
            onClick={handleHintUse}
            className="flex items-center text-sm px-4 py-2 bg-yellow-600/10 text-yellow-600 border border-yellow-600/30 rounded-full hover:bg-yellow-600/20 transition-colors shadow-sm"
          >
            <HelpCircle className="w-4 h-4 mr-2" /> {hintUsedFlag ? 'ヒントを確認する' : 'ヒント (+30秒加算)'}
          </button>
        </div>
      )}

      {/* Hint Modal Overlay inside the container */}
      {showHintModal && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur flex flex-col items-center justify-center p-6 z-40">
          <h3 className="text-xl font-bold text-yellow-600 mb-6 flex items-center">
            <HelpCircle className="mr-2" /> オリジナルデータ {hintUsedFlag ? '' : '(+30秒加算済)'}
          </h3>
          <div className="bg-gray-50 border border-gray-200 rounded p-4 w-full max-w-sm text-sm space-y-2 mb-6 text-gray-800">
            <p><span className="text-gray-500 inline-block w-24">メール:</span> {originalInputData.email}</p>
            <p><span className="text-gray-500 inline-block w-24">ニックネーム:</span> {originalInputData.nickname}</p>
            <p><span className="text-gray-500 inline-block w-24">電話番号:</span> {originalInputData.phone}</p>
            <p><span className="text-gray-500 inline-block w-24">年齢:</span> {originalInputData.age}</p>
            <p><span className="text-gray-500 inline-block w-24">性別:</span> {originalInputData.gender}</p>
            <p><span className="text-gray-500 inline-block w-24">誕生日:</span> {originalInputData.birthMonth}月 {originalInputData.birthDay}日</p>
          </div>
          <button 
            onClick={() => setShowHintModal(false)}
            className="px-6 py-2 bg-gray-200 text-gray-800 font-bold rounded hover:bg-gray-300"
          >
            閉じる
          </button>
        </div>
      )}
    </div>
  );
};

export default Stage4;
