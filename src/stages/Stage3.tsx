import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { motion } from 'framer-motion';

type TileData = {
  id: number;
  isAnimal: boolean;
  imgSrc?: string;
};

// 正解（動物）のファイル名リスト
const CORRECT_FILENAMES = [
  'cat.png', 'koumori.png', 'neko.png', 'saru.png', 'tako.png', 'tora.png', 'ushi.png'
];

// 不正解のファイル名リスト
const INCORRECT_FILENAMES = [
  'candy.png', 'eko.png', 'kousai.png', 'kuda.png', 'kyuuri.png', 'saka.png', 'tarai.png'
];

const ALL_ANIMALS: Partial<TileData>[] = CORRECT_FILENAMES.map(filename => ({
  isAnimal: true,
  imgSrc: `/Stage3_question/Correct/${filename}`
}));

const ALL_OTHERS: Partial<TileData>[] = INCORRECT_FILENAMES.map(filename => ({
  isAnimal: false,
  imgSrc: `/Stage3_question/Incorrect/${filename}`
}));

const generateTiles = (): TileData[] => {
  const animalCount = Math.floor(Math.random() * 3) + 2; // 2〜4個の動物
  const otherCount = 6 - animalCount;

  const shuffledAnimals = [...ALL_ANIMALS].sort(() => 0.5 - Math.random()).slice(0, animalCount);
  const shuffledOthers = [...ALL_OTHERS].sort(() => 0.5 - Math.random()).slice(0, otherCount);

  const combined = [...shuffledAnimals, ...shuffledOthers].sort(() => 0.5 - Math.random());
  
  return combined.map((item, index) => ({
    id: index,
    ...item
  }));
};

const Stage3: React.FC = () => {
  const { setStage, addPenalty } = useGameStore();
  const [tiles, setTiles] = useState<TileData[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setTiles(generateTiles());
  }, []);

  const toggleTile = (id: number) => {
    setErrorMsg("");
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleVerify = () => {
    const animalIds = new Set(tiles.filter(t => t.isAnimal).map(t => t.id));
    
    // 過不足なく選択されているか
    let isCorrect = animalIds.size === selectedIds.size;
    if (isCorrect) {
      for (const id of selectedIds) {
        if (!animalIds.has(id)) {
          isCorrect = false;
          break;
        }
      }
    }

    if (isCorrect) {
      setStage(4);
    } else {
      addPenalty(10);
      setErrorMsg("選択が間違っています。もう一度お試しください。");
      setSelectedIds(new Set());
      setTiles(generateTiles());
    }
  };

  return (
    <div className="w-full max-w-[400px] bg-white border border-gray-200 p-2 shadow-lg relative mx-auto font-sans">
      <div className="bg-[#4A90E2] text-white p-6 mb-2 flex items-center gap-4 shadow-sm relative">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-90 mb-1.5 leading-none">すべての</p>
          <h2 className="text-4xl font-bold mb-1.5 tracking-wider leading-none">動物</h2>
          <p className="text-sm font-medium opacity-90 leading-none">の画像を選択してください</p>
        </div>
        <div className="w-28 h-28 bg-white flex items-center justify-center p-1.5 shadow-sm shrink-0">
          <div className="w-full h-full bg-gray-100 flex items-center justify-center border border-gray-200 relative overflow-hidden">
             {/* 例題画像 */}
             <img src="/Stage3_question/Example.png" alt="例題" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-[2px] mb-4 bg-gray-200 border border-gray-200 shadow-sm">
        {tiles.map((tile) => {
          const isSelected = selectedIds.has(tile.id);
          return (
            <motion.div
              key={tile.id}
              whileHover={{ opacity: 0.9 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleTile(tile.id)}
              className="relative aspect-square overflow-hidden cursor-pointer flex items-center justify-center bg-white transition-all"
            >
              <div className={`w-full h-full flex items-center justify-center transition-transform duration-200 ${isSelected ? 'scale-[0.85]' : 'scale-100'}`}>
                {tile.imgSrc && (
                  <img src={tile.imgSrc} alt="tile" className="w-full h-full object-cover" />
                )}
              </div>
              
              {isSelected && (
                <>
                  <div className="absolute inset-0 border-[6px] border-[#4A90E2] pointer-events-none z-10" />
                  <div className="absolute top-1 left-1 bg-[#4A90E2] text-white rounded-full p-0.5 shadow-sm border-2 border-white z-20">
                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      {errorMsg && (
        <p className="text-red-500 font-bold mb-4 text-center animate-pulse">{errorMsg}</p>
      )}

      <div className="flex justify-end border-t border-gray-200 pt-3">
        <button
          onClick={handleVerify}
          className="px-8 py-2.5 bg-[#4A90E2] hover:bg-blue-600 text-white font-bold rounded uppercase tracking-wider text-sm transition-colors"
        >
          確認
        </button>
      </div>
    </div>
  );
};

export default Stage3;
