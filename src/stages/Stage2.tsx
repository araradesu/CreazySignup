import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { motion, useAnimation } from 'framer-motion';

// リアルな同意項目の文言
const CHECKBOX_LABELS = [
  "本規約の全条項および規定事項を深く理解し、一切の異議なく同意します。",
  "本サービスの利用に伴ういかなる損害についても、運営の一切の責任を免除することに同意します。",
  "個人情報および利用データが、第三者のパートナー企業へ提供されることに承諾します。",
  "将来的に本利用規約が予告・通知なく変更される可能性があることを理解し、受け入れます。",
  "反社会的勢力といかなる関係も有しておらず、将来にわたっても関与しないことを確約します。"
];

const Stage2: React.FC = () => {
  const setStage = useGameStore(state => state.setStage);
  
  // ギミックの乱数生成用
  const [checkboxRule, setCheckboxRule] = useState<{ targetIndices: number[], requireOrder: boolean }>({ targetIndices: [], requireOrder: false });
  const [buttonRule, setButtonRule] = useState<{ type: 'hold', targetMs: number } | { type: 'mash', targetClicks: number }>({ type: 'mash', targetClicks: 5 });
  const [termsText, setTermsText] = useState("");
  
  // チェックボックスの配列とその「押された順番履歴」
  const [checkedItems, setCheckedItems] = useState<boolean[]>([false, false, false, false, false]);
  const [checkPath, setCheckPath] = useState<number[]>([]);

  const [, setClickCount] = useState(0);
  const [, setMashStartTime] = useState<number | null>(null);
  const [holdStart, setHoldStart] = useState<number | null>(null);
  const [, setHoldProgressMs] = useState(0);

  const holdDisplayIntervalRef = useRef<number | null>(null);
  const mashTimerRef = useRef<number | null>(null);
  const buttonControls = useAnimation();

  useEffect(() => {
    // チェックボックスルールの決定
    const mode = Math.floor(Math.random() * 4); // 0, 1, 2, 3
    let targets: number[] = [];
    let requireOrder = false;
    let checkboxInstruction = "";

    const shuffledIndices = [0, 1, 2, 3, 4].sort(() => 0.5 - Math.random());
    
    if (mode === 0) { // a, b, cにチェック
       targets = shuffledIndices.slice(0, 3).sort((a,b)=>a-b);
       const texts = targets.map(i => `${i + 1}番目`).join("と");
       checkboxInstruction = `下部に並ぶ5つの同意項目のうち、${texts}にチェックを入れ`;
    } else if (mode === 1) { // 全てにチェック
       targets = [0, 1, 2, 3, 4];
       checkboxInstruction = `下部に並ぶ5つの同意項目すべてにチェックを入れ`;
    } else if (mode === 2) { // a, b以外にチェック
       const except = shuffledIndices.slice(0, 2).sort((a,b)=>a-b);
       targets = shuffledIndices.slice(2).sort((a,b)=>a-b); // 3 items
       const texts = except.map(i => `${i + 1}番目`).join("と");
       checkboxInstruction = `下部に並ぶ5つの同意項目のうち、${texts}以外にチェックを入れ`;
    } else { // a, b, cの順番にチェック
       targets = shuffledIndices.slice(0, 3);
       requireOrder = true;
       const texts = targets.map(i => `${i + 1}番目`).join("と");
       checkboxInstruction = `下部に並ぶ5つの同意項目のうち、${texts}の順番にチェックを入れ`;
    }

    const cbRule = { targetIndices: targets, requireOrder };
    setCheckboxRule(cbRule);
    
    // ボタンルールの決定
    let btnRule;
    if (Math.random() > 0.5) {
      // 3.0s 〜 5.0s のランダムホールド
      const targetMs = Math.floor(Math.random() * 2000) + 3000;
      btnRule = { type: 'hold', targetMs } as const;
    } else {
      // ランダム回数連打 (5〜10)
      btnRule = { type: 'mash', targetClicks: Math.floor(Math.random() * 6) + 5 } as const;
    }
    setButtonRule(btnRule);

    let buttonInstruction = "";
    if (btnRule.type === 'hold') {
      buttonInstruction = `同意ボタンを${(btnRule.targetMs / 1000).toFixed(2)}秒長押しして`;
    } else {
      buttonInstruction = `同意ボタンを${btnRule.targetClicks}回連打して`;
    }

    const articleBodies = [
      "（適用）本コンテンツは、Ureshii Service（以下「当サービス」）が提供する各種サービスの利用条件を定めるものです。ユーザーは本規約に同意した上で当サービスを利用するものとします。",
      "（ユーザー登録）登録希望者が本サービスの定める方法によって登録を申請し、当サービスがこれを承認することによって登録が完了するものとします。当サービスは登録申請者に以下の事由があると判断した場合、登録の申請を承認しないことがあり、その理由については一切の開示義務を負わないものとします。",
      "（禁止事項）ユーザーは本サービスの利用にあたり、以下の行為をしてはなりません。法令または公序良俗に違反する行為、犯罪行為に関連する行為、当サービスのサーバーまたはネットワークの機能を破壊したり、妨害したりする行為、当サービスのサービスの運営を妨害するおそれのある行為、他のユーザーに関する個人情報等を収集または蓄積する行為。",
      "（サービスの提供の停止等）当サービスは、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。地震、落雷、火災、停電または天災などの不可抗力により本サービスの提供が困難となった場合、コンピュータまたは通信回線等が事故により停止した場合。",
      "（利用制限および登録抹消）当サービスは、ユーザーが本規約のいずれかの条項に違反した場合、事前に通知することなくユーザーに対して本サービスの全部もしくは一部の利用を制限しまたはユーザーとしての登録を抹消することができるものとします。",
      "（退会）ユーザーは、当サービスの定める退会手続により本サービスから退会できるものとします。",
      "（保証の否認および免責事項）当サービスは、本サービスに事実上または法律上の瑕疵がないことを明示的にも黙示的にも保証しておりません。当サービスは、本サービスに起因してユーザーに生じたあらゆる損害について一切の責任を負いません。",
      "（サービス内容の変更等）当サービスは、ユーザーに通知することなく本サービスの内容を変更しまたは本サービスの提供を中止することができるものとしこれによってユーザーに生じた損害について一切の責任を負いません。",
      "（利用規約の変更）当サービスは、必要と判断した場合にはユーザーに通知することなくいつでも本規約を変更することができるものとします。",
      "（個人情報の取扱い）当サービスは、本サービスの利用によって取得する個人情報については、当サービス「プライバシーポリシー」に従い適切に取り扱うものとします。",
      "（通知または連絡）ユーザーと当サービスとの間の通知または連絡は当サービスの定める方法によって行うものとします。",
      "（権利義務の譲渡の禁止）ユーザーは、当サービスの書面による事前の承諾なく利用契約上の地位または本規約に基づく権利もしくは義務を第三者に譲渡しまたは担保に供することはできません。",
      "（準拠法・裁判管轄）本規約の解釈にあたっては日本法を準拠法とします。本サービスに関して紛争が生じた場合には当サービスの本店所在地を管轄する裁判所を専属的合意管轄とします。",
      "（データ保護とセキュリティ）当サービスは提供されたいかなる情報の安全性も完全には保証しませんが、合理的な範囲での努力を行うものとします。しかしながら通信経路上でのデータの漏洩等に関しても一切の責任を免除されるものとします。",
      "（外部サービス連携）本サービスは、他の事業者が提供するサービスまたはコンテンツを含む場合があります。これらに対する責任はこれを提供する事業者が負い、本サービスは一切の責任を負いません。",
      "（ユーザーの責任と義務）ユーザーは自己の責任において本サービスを利用するものとし、本サービスを利用してなされた一切の行為とその結果について一切の責任を負います。",
      `（同意の特別要件）この規約に同意するには、${checkboxInstruction}、${buttonInstruction}ください。`,
      "（免責事項の追記）当サービスは、本サービスの利用によってユーザーに生じたあらゆる損害について一切の責任を負いません。ユーザーはこれを承認し、いかなる場合においても当サービスに対して損害賠償請求を行わないことに同意するものとします。",
      "（知的財産権）本サービスに含まれるテキスト、画像、プログラムその他の全ての情報に関する知的財産権等は当サービスまたは当サービスにライセンスを許諾している者に帰属します。ユーザーはこれらを無断で複製、改変、配布等してはなりません。",
      "（完全合意）本規約はユーザーと当サービスとの間の完全なる合意を構成し、事前の合意や口頭での了解事項に優先します。"
    ];

    const shuffledBodies = articleBodies.sort(() => 0.5 - Math.random());
    const formattedArticles = shuffledBodies.map((body, index) => `第${index + 1}条${body}`);
    const allText = "ここから先は非常に重要な特約事項となります。さらに追加の確認事項として以下の条項に同意していただく必要があります。\n" + formattedArticles.join("\n") + "\n以上で利用規約の全ての条項が終了となります。内容を十分に理解し同意いただける場合のみ、指定された操作を実行してください。";
    setTermsText(allText);
  }, []);

  const isCheckboxValid = () => {
    if (checkboxRule.targetIndices.length === 0) return checkPath.length === 0;
    if (checkboxRule.requireOrder) {
      if (checkPath.length !== checkboxRule.targetIndices.length) return false;
      return checkPath.every((val, index) => val === checkboxRule.targetIndices[index]);
    } else {
      if (checkPath.length !== checkboxRule.targetIndices.length) return false;
      const sortedPath = [...checkPath].sort();
      const sortedTarget = [...checkboxRule.targetIndices].sort();
      return sortedPath.every((val, index) => val === sortedTarget[index]);
    }
  };

  const handleToggle = (index: number) => {
    const newItems = [...checkedItems];
    newItems[index] = !newItems[index];
    setCheckedItems(newItems);
    
    setCheckPath(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const triggerError = () => {
    buttonControls.start({ x: [0, -10, 10, -10, 10, 0], scale: 1, transition: { duration: 0.4 } });
    setHoldStart(null);
  };

  const resetStage2 = () => {
    setCheckedItems([false, false, false, false, false]);
    setCheckPath([]);
    setClickCount(0);
    setMashStartTime(null);
    setHoldStart(null);
    setHoldProgressMs(0);
    buttonControls.set({ scale: 1 });
  };

  const submit = () => {
    if (isCheckboxValid()) {
      setStage(3);
    } else {
      triggerError();
    }
  };

  const handlePointerDown = () => {
    if (buttonRule.type === 'hold') {
      const now = Date.now();
      setHoldStart(now);
      setHoldProgressMs(0);
      
      buttonControls.start({ scale: 0.85, transition: { duration: buttonRule.targetMs / 1000, ease: "linear" }});
      
      holdDisplayIntervalRef.current = window.setInterval(() => {
        setHoldProgressMs(Date.now() - now);
      }, 50);
    } else {
      // Mash logic (0.7s interval check)
      if (mashTimerRef.current !== null) {
        clearTimeout(mashTimerRef.current);
      }
      
      setClickCount((prev: number) => {
        const nextCount = prev + 1;
        setMashStartTime(Date.now()); // Visual effect start
        return nextCount;
      });
      
      mashTimerRef.current = window.setTimeout(() => {
        // 0.7秒経過で回数確定
        setClickCount((currentCount: number) => {
          if (currentCount === buttonRule.targetClicks && isCheckboxValid()) {
            setStage(3);
          } else {
            triggerError();
          }
          return 0;
        });
        setMashStartTime(null);
      }, 700);
    }
  };

  const handlePointerUp = () => {
    if (buttonRule.type === 'hold' && holdStart !== null) {
      if (holdDisplayIntervalRef.current !== null) {
        clearInterval(holdDisplayIntervalRef.current);
        holdDisplayIntervalRef.current = null;
      }
      
      const duration = Date.now() - holdStart;
      setHoldStart(null);
      setHoldProgressMs(0);

      const isDurationValid = Math.abs(duration - buttonRule.targetMs) <= 250;
      if (isDurationValid) {
        buttonControls.start({ scale: 1, transition: { duration: 0.1 }});
        submit();
      } else {
        triggerError();
      }
    }
  };

  const handlePointerLeave = () => {
    if (buttonRule.type === 'hold' && holdStart !== null) {
      if (holdDisplayIntervalRef.current !== null) {
        clearInterval(holdDisplayIntervalRef.current);
        holdDisplayIntervalRef.current = null;
      }
      setHoldStart(null);
      setHoldProgressMs(0);
      buttonControls.start({ scale: 1, transition: { duration: 0.2, ease: "easeOut" }});
      // Cancelled hold intentionally
    }
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-md flex flex-col items-center">
      <h2 className="text-xl font-bold mb-4 text-gray-900">STEP 2: 利用規約の確認</h2>
      
      <div className="bg-gray-50 border border-gray-200 rounded-md p-6 w-full mb-8 text-xs md:text-sm text-gray-600 text-justify leading-relaxed shadow-inner break-words whitespace-pre-wrap">
        {termsText}
      </div>

      <div className="w-full mb-8 flex flex-col space-y-3">
        {checkedItems.map((checked, i) => (
          <label key={i} className="flex items-start space-x-3 cursor-pointer p-2 hover:bg-gray-100 rounded transition-colors w-full">
            <input type="checkbox" className="hidden" checked={checked} onChange={() => handleToggle(i)} />
            <div className={`w-5 h-5 mt-0.5 rounded border ${checked ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'} flex items-center justify-center shrink-0`}>
              {checked && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
            </div>
            <span className="text-gray-700 text-sm leading-snug">{i + 1}. {CHECKBOX_LABELS[i]}</span>
          </label>
        ))}
      </div>

      <div className="w-full flex justify-center relative">
        <div className="flex items-center gap-4">
          <motion.button
            animate={buttonControls}
            whileTap={buttonRule.type === 'mash' ? { scale: 0.92 } : undefined}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerLeave}
            className="relative px-12 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded select-none shadow-md"
          >
            <span className="relative z-10">同意する</span>
          </motion.button>
          
          <button
            onClick={resetStage2}
            className="text-gray-400 hover:text-gray-600 text-sm font-medium transition-colors"
          >
            リセット
          </button>
        </div>
      </div>
    </div>
  );
};

export default Stage2;
