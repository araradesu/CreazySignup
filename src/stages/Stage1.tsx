import React, { useState, useEffect } from 'react';
import { useGameStore, UserData } from '../store/useGameStore';
import { RuleType, ABSOLUTE_RULES, getRandomOptionalRules, generateValidRules } from '../utils/passwordRules';
import { CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Stage1: React.FC = () => {
  const { setStage, setOriginalData } = useGameStore();
  const [formData, setFormData] = useState<UserData & { password: '' }>({
    email: '',
    nickname: '',
    phone: '',
    age: '',
    gender: '',
    birthMonth: '',
    birthDay: '',
    password: ''
  });

  const [activeRules, setActiveRules] = useState<{ abs: RuleType[], opt: RuleType[] }>({ abs: [], opt: [] });

  useEffect(() => {
    // コンポーネントマウント時にランダムなルールを決定
    // コンポーネントマウント時にランダムなルールを決定（整合性テストによるリロード付き）
    setActiveRules(generateValidRules(3));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;
    
    if (name !== 'nickname' && name !== 'password' && name !== 'gender' && name !== 'birthMonth' && name !== 'birthDay') {
      // ニックネーム、パスワード、ラジオ、セレクト以外は半角文字のみ許可
      if (value !== '' && /[^\x20-\x7E]/.test(value)) return;
    }
    
    if (name === 'phone' || name === 'age') {
      // 数値のみ許容
      if (value !== '' && !/^[0-9]+$/.test(value)) return;
      
      // 先頭の0を省く (例: 0010 -> 10, 000 -> 0)
      if (name === 'age' && value !== '') {
        value = parseInt(value, 10).toString();
      }
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const isNicknameValid = formData.nickname.length >= 6;
  const isPhoneValid = formData.phone.length >= 10 && formData.phone.length <= 15;
  const isAgeValid = formData.age !== '' && parseInt(formData.age) > 0;
  const isGenderValid = formData.gender !== '';
  const isBirthValid = formData.birthMonth !== '' && formData.birthDay !== '';

  const passwordValidation = {
    abs: activeRules.abs.map(r => r.check(formData.password)),
    opt: activeRules.opt.map(r => r.check(formData.password))
  };

  const isPasswordValid = passwordValidation.abs.every(v => v) && passwordValidation.opt.every(v => v);

  const isAllValid = isEmailValid && isNicknameValid && isPhoneValid && isAgeValid && isGenderValid && isBirthValid && isPasswordValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAllValid) {
      const { password, ...saveData } = formData;
      setOriginalData(saveData);
      setStage(2);
    }
  };

  const RuleIndicator = ({ isValid, text }: { isValid: boolean, text: string }) => (
    <div className={`flex items-start text-sm mb-1 ${isValid ? 'text-green-600' : 'text-gray-400'}`}>
      {isValid ? <CheckCircle2 className="w-5 h-5 mr-2 shrink-0 text-green-500" /> : <XCircle className="w-5 h-5 mr-2 shrink-0 opacity-50" />}
      <span className={isValid ? 'font-medium' : ''}>{text}</span>
    </div>
  );

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-md relative">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-3">STEP 1: お客様情報の入力</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6 text-gray-700">
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

        <div className="mt-8 border-t border-gray-200 pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">パスワード</label>
          <input 
            type="text" name="password" value={formData.password} onChange={handleChange} placeholder="条件を満たす強力なパスワード" autoComplete="new-password"
            className="w-full bg-white border border-gray-300 text-gray-900 rounded-[4px] p-3 text-lg font-mono focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none mb-4"
          />
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-xs text-indigo-700 mb-3 font-semibold tracking-wider">以下のルールをすべて満たしてください：</p>
            <div className="grid grid-cols-1 gap-1">
              {activeRules.abs.map((r, i) => (
                <RuleIndicator key={r.id} isValid={passwordValidation.abs[i]} text={r.description} />
              ))}
              {activeRules.opt.map((r, i) => (
                <RuleIndicator key={r.id} isValid={passwordValidation.opt[i]} text={r.description} />
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <motion.button
            type="submit"
            disabled={!isAllValid}
            className={`px-8 py-3 rounded-[4px] font-bold text-white transition-colors
              ${isAllValid 
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md cursor-pointer' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            次へ
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default Stage1;
