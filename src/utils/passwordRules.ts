export type RuleType = {
  id: string;
  description: string;
  check: (pw: string) => boolean;
};

export const ABSOLUTE_RULES: RuleType[] = [
  {
    id: "abs1",
    description: "半角英数字を含む10文字以上である",
    check: (pw) => pw.length >= 10 && /[a-zA-Z0-9]/.test(pw)
  },
  {
    id: "abs2",
    description: "記号を1つ以上含む",
    check: (pw) => /[!@#$%^&*(),.?":{}|<>\-=_+[\];'~`/\\]/.test(pw)
  }
];

const OPTIONAL_RULE_GENERATORS: (() => RuleType)[] = [
  () => ({
    id: "opt1",
    description: "曜日が含まれる（英語、略称可）",
    check: (pw) => {
      const lowerPW = pw.toLowerCase();
      const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday','mon','tue','wed','thu','fri','sat','sun'];
      return days.some(day => lowerPW.includes(day));
    }
  }),
  () => {
    const x = Math.floor(Math.random() * 3) + 3; // 3, 4, 5
    return {
      id: "opt2",
      description: `同じ文字が合計${x}文字含まれる`,
      check: (pw) => {
        const counts: Record<string, number> = {};
        for (const char of pw) {
          counts[char] = (counts[char] || 0) + 1;
        }
        return Object.values(counts).some(count => count === x);
      }
    };
  },
  () => {
    const x = Math.floor(Math.random() * 7) + 9; // 9 to 15
    return {
      id: "opt3",
      description: `異なる文字が${x}種類含まれる`,
      check: (pw) => new Set(pw).size === x
    };
  },
  () => {
    const x = Math.floor(Math.random() * 3) + 2; // 2, 3, 4
    return {
      id: "opt4",
      description: `大文字のアルファベットが${x}個含まれる`,
      check: (pw) => (pw.match(/[A-Z]/g) || []).length === x
    };
  },
  () => {
    const x = Math.floor(Math.random() * 21) + 10; // 10 to 30
    return {
      id: "opt5",
      description: `含まれている数字をすべて足すと${x}になる`,
      check: (pw) => {
        const digits = pw.match(/\d/g);
        if (!digits) return x === 0;
        return digits.reduce((sum, d) => sum + parseInt(d, 10), 0) === x;
      }
    };
  },
  () => {
    const x = Math.floor(Math.random() * 3) + 2; // 2, 3, 4
    return {
      id: "opt6",
      description: `記号が${x}種類含まれる`,
      check: (pw) => {
        const symbols = pw.match(/[!@#$%^&*(),.?":{}|<>\-=_+[\];'~`/\\]/g) || [];
        return new Set(symbols).size === x;
      }
    };
  },
  () => ({
    id: "opt7",
    description: "最初と最後の文字が同じである",
    check: (pw) => pw.length >= 2 && pw[0] === pw[pw.length - 1]
  }),
  () => ({
    id: "opt8",
    description: "母音（a, i, u, e, o）がすべて含まれる",
    check: (pw) => {
      const lowerPW = pw.toLowerCase();
      return ['a','i','u','e','o'].every(v => lowerPW.includes(v));
    }
  }),
  () => ({
    id: "opt9",
    description: "\"ureshii\" という文字列が含まれる（大文字小文字不問）",
    check: (pw) => pw.toLowerCase().includes("ureshii")
  }),
  () => {
    const isAddition = Math.random() < 0.5;
    let a, b, answer, opSymbol;

    if (isAddition) {
      answer = Math.floor(Math.random() * 90) + 10; // 10 to 99
      a = Math.floor(Math.random() * (answer - 1)) + 1; // 1 to answer - 1
      b = answer - a;
      opSymbol = '+';
    } else {
      // 除算 (÷)で、A ÷ B = answer。Aが最大2桁(99以下)で、answerは2桁(10~99)
      const bCandidates = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      b = bCandidates[Math.floor(Math.random() * bCandidates.length)];
      const maxAnswer = Math.floor(99 / b);
      if (maxAnswer >= 10) {
        answer = Math.floor(Math.random() * (maxAnswer - 9)) + 10; // 10 to maxAnswer
      } else {
        answer = Math.floor(Math.random() * 90) + 10;
        b = 1;
      }
      a = answer * b;
      opSymbol = '÷';
    }

    return {
      id: "opt10",
      description: `次の計算式の答えとなる半角数字が含まれている「${a} ${opSymbol} ${b}」`,
      check: (pw) => pw.includes(answer.toString())
    };
  }
];

export const getRandomOptionalRules = (count: number): RuleType[] => {
  const shuffledGenerators = [...OPTIONAL_RULE_GENERATORS].sort(() => 0.5 - Math.random());
  return shuffledGenerators.slice(0, count).map(generate => generate());
};

export const generateValidRules = (count: number, maxTries: number = 100): { abs: RuleType[], opt: RuleType[] } => {
  for (let attempt = 0; attempt < maxTries; attempt++) {
    const opt = getRandomOptionalRules(count);
    const abs = ABSOLUTE_RULES;
    
    // Heuristic test to ensure passable
    const checks = [...abs, ...opt].map(r => r.check);
    let passed = false;
    
    // Seed pool with parts that satisfy various rules
    const seedParts = ['ureshii', 'monday', 'a', 'i', 'u', 'e', 'o', 'A', '1', '2', '3', '4', '5', '!', '@', '#'];
    
    // Fast brute force
    for(let i = 0; i < 15000; i++) {
        let candidate = "aA1!ureshiiMonday"; // base covering many 
        
        // Add random length between 0 and 20
        const len = Math.floor(Math.random() * 20);
        for(let j = 0; j < len; j++) {
            candidate += seedParts[Math.floor(Math.random() * seedParts.length)];
        }
        
        // Insert random digits (to possibly hit opt10 answers or sum)
        candidate += Math.floor(Math.random() * 100).toString();
        
        if (Math.random() > 0.5 && candidate.length > 2) {
             candidate = candidate + candidate[0]; // make last char same as first
        }
        
        if (checks.every(c => c(candidate))) {
            passed = true;
            break;
        }
    }
    
    if (passed) {
      return { abs, opt };
    }
  }
  
  // Fallback if somehow impossible (almost never happens)
  return { abs: ABSOLUTE_RULES, opt: getRandomOptionalRules(count) };
};
