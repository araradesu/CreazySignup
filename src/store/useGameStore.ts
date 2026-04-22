import { create } from 'zustand';

export type Stage = 0 | 1 | 2 | 3 | 4 | 5; // 0: Start, 1: Form, 2: Terms, 3: CAPTCHA, 4: Confirm, 5: Result

export interface UserData {
  email: string;
  nickname: string;
  phone: string;
  age: string;
  gender: string;
  birthMonth: string;
  birthDay: string;
}

interface GameState {
  stage: Stage;
  isPlaying: boolean;
  timerMs: number; // ミリ秒単位で保持
  penaltyState: { amount: number; id: number } | null;
  originalInputData: UserData | null;
  currentDisplayData: UserData | null;
  hasMistakeFlag: boolean;
  hintUsedFlag: boolean;
  
  // Actions
  startGame: () => void;
  setStage: (stage: Stage) => void;
  incrementTimer: (ms: number) => void;
  addPenalty: (seconds: number) => void;
  stopGame: () => void;
  setOriginalData: (data: UserData) => void;
  setCurrentDisplayData: (data: UserData) => void;
  setMistakeFlag: (flag: boolean) => void;
  setHintUsedFlag: (flag: boolean) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  stage: 0,
  isPlaying: false,
  timerMs: 0,
  penaltyState: null,
  originalInputData: null,
  currentDisplayData: null,
  hasMistakeFlag: false,
  hintUsedFlag: false,

  startGame: () => set({ isPlaying: true, timerMs: 0, stage: 1, penaltyState: null, hasMistakeFlag: false, hintUsedFlag: false }),
  setStage: (stage) => set({ stage }),
  incrementTimer: (ms) => set((state) => ({ timerMs: state.timerMs + ms })),
  addPenalty: (seconds) => set((state) => ({ 
    timerMs: state.timerMs + seconds * 1000,
    penaltyState: { amount: seconds, id: Date.now() }
  })),
  stopGame: () => set({ isPlaying: false, stage: 5 }),
  setOriginalData: (data) => set({ originalInputData: data, currentDisplayData: data }),
  setCurrentDisplayData: (data) => set({ currentDisplayData: data }),
  setMistakeFlag: (flag) => set({ hasMistakeFlag: flag }),
  setHintUsedFlag: (flag) => set({ hintUsedFlag: flag }),
  resetGame: () => set({ 
    stage: 0, 
    isPlaying: false, 
    timerMs: 0, 
    penaltyState: null,
    originalInputData: null, 
    currentDisplayData: null, 
    hasMistakeFlag: false, 
    hintUsedFlag: false 
  }),
}));
