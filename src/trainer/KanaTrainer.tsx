import React, { useReducer, useEffect, type FormEvent } from 'react';
import { shuffle } from './shuffle';
import './KanaTrainer.css';
import VirtualKeyboard from './VirtualKeyboard';
import { KanaReferenceTable, playPronunciation } from './KanaReferenceTable';
import { useTheme } from './useTheme';

// 类型定义
type KanaMapping = [string, string, string];
type Question = [string, string];

interface Config {
  askCount: number;
  askCountPenalty: number;
  askCountMax: number;
  keepQuestionsSize: number;
  randomQuestions: boolean;
  hintAnswerFirstTime: boolean;
  useSeion: boolean;
  useDakuon: boolean;
  useYoon: boolean;
}

type FeedbackType = 'success' | 'error' | 'neutral';

// 默认配置
const DEFAULT_CONFIG: Config = {
  askCount: 3,
  askCountPenalty: 3,
  askCountMax: 5,
  keepQuestionsSize: 10,
  randomQuestions: false,
  hintAnswerFirstTime: true,
  useSeion: true,
  useDakuon: false,
  useYoon: false,
};

// KANA mappings
export const SEION_TO_ROMAJI: KanaMapping[] = [
  ['あ', 'ア', 'a'], ['い', 'イ', 'i'], ['う', 'ウ', 'u'], ['え', 'エ', 'e'], ['お', 'オ', 'o'],
  ['か', 'カ', 'ka'], ['き', 'キ', 'ki'], ['く', 'ク', 'ku'], ['け', 'ケ', 'ke'], ['こ', 'コ', 'ko'],
  ['さ', 'サ', 'sa'], ['し', 'シ', 'shi'], ['す', 'ス', 'su'], ['せ', 'セ', 'se'], ['そ', 'ソ', 'so'],
  ['た', 'タ', 'ta'], ['ち', 'チ', 'chi'], ['つ', 'ツ', 'tsu'], ['て', 'テ', 'te'], ['と', 'ト', 'to'],
  ['な', 'ナ', 'na'], ['に', 'ニ', 'ni'], ['ぬ', 'ヌ', 'nu'], ['ね', 'ネ', 'ne'], ['の', 'ノ', 'no'],
  ['は', 'ハ', 'ha'], ['ひ', 'ヒ', 'hi'], ['ふ', 'フ', 'fu'], ['へ', 'ヘ', 'he'], ['ほ', 'ホ', 'ho'],
  ['ま', 'マ', 'ma'], ['み', 'ミ', 'mi'], ['む', 'ム', 'mu'], ['め', 'メ', 'me'], ['も', 'モ', 'mo'],
  ['や', 'ヤ', 'ya'], ['ゆ', 'ユ', 'yu'], ['よ', 'ヨ', 'yo'],
  ['ら', 'ラ', 'ra'], ['り', 'リ', 'ri'], ['る', 'ル', 'ru'], ['れ', 'レ', 're'], ['ろ', 'ロ', 'ro'],
  ['わ', 'ワ', 'wa'], ['を', 'ヲ', 'wo'], ['ん', 'ン', 'n']
];

export const DAKUON_TO_ROMAJI: KanaMapping[] = [
  ['が', 'ガ', 'ga'], ['ぎ', 'ギ', 'gi'], ['ぐ', 'グ', 'gu'], ['げ', 'ゲ', 'ge'], ['ご', 'ゴ', 'go'],
  ['ざ', 'ザ', 'za'], ['じ', 'ジ', 'ji'], ['ず', 'ズ', 'zu'], ['ぜ', 'ゼ', 'ze'], ['ぞ', 'ゾ', 'zo'],
  ['だ', 'ダ', 'da'], ['ぢ', 'ヂ', 'ji'], ['づ', 'ヅ', 'zu'], ['で', 'デ', 'de'], ['ど', 'ド', 'do'],
  ['ば', 'バ', 'ba'], ['び', 'ビ', 'bi'], ['ぶ', 'ブ', 'bu'], ['べ', 'ベ', 'be'], ['ぼ', 'ボ', 'bo'],
  ['ぱ', 'パ', 'pa'], ['ぴ', 'ピ', 'pi'], ['ぷ', 'プ', 'pu'], ['ぺ', 'ペ', 'pe'], ['ぽ', 'ポ', 'po']
];

export const YOON_TO_ROMAJI: KanaMapping[] = [
  ['きゃ', 'キャ', 'kya'], ['きゅ', 'キュ', 'kyu'], ['きょ', 'キョ', 'kyo'],
  ['しゃ', 'シャ', 'sha'], ['しゅ', 'シュ', 'shu'], ['しょ', 'ショ', 'sho'],
  ['ちゃ', 'チャ', 'cha'], ['ちゅ', 'チュ', 'chu'], ['ちょ', 'チョ', 'cho'],
  ['にゃ', 'ニャ', 'nya'], ['にゅ', 'ニュ', 'nyu'], ['にょ', 'ニョ', 'nyo'],
  ['ひゃ', 'ヒャ', 'hya'], ['ひゅ', 'ヒュ', 'hyu'], ['ひょ', 'ヒョ', 'hyo'],
  ['みゃ', 'ミャ', 'mya'], ['みゅ', 'ミュ', 'myu'], ['みょ', 'ミョ', 'myo'],
  ['りゃ', 'リャ', 'rya'], ['りゅ', 'リュ', 'ryu'], ['りょ', 'リョ', 'ryo'],
  ['ぎゃ', 'ギャ', 'gya'], ['ぎゅ', 'ギュ', 'gyu'], ['ぎょ', 'ギョ', 'gyo'],
  ['じゃ', 'ジャ', 'ja'], ['じゅ', 'ジュ', 'ju'], ['じょ', 'ジョ', 'jo'],
  ['びゃ', 'ビャ', 'bya'], ['びゅ', 'ビュ', 'byu'], ['びょ', 'ビョ', 'byo'],
  ['ぴゃ', 'ピャ', 'pya'], ['ぴゅ', 'ピュ', 'pyu'], ['ぴょ', 'ピョ', 'pyo']
];

// State 类型
interface TrainingState {
  questions: Question[];
  currentQuestions: Question[];
  questionToRepeatCount: { [key: string]: number };
  askedCount: number;
  lastQuestion: Question | null;
  currentQuestion: Question | null;
  questionAsked: Set<string>;
  questionfirstAsk: boolean;
  config: Config;
  correctCount: number;
  totalAnswered: number;
  feedback: string;
  feedbackType: FeedbackType;
  input: string;
  showConfig: boolean;
  showReference: boolean;
}

// Action 类型
type Action =
  | { type: 'INITIALIZE'; payload?: TrainingState }
  | { type: 'ANSWER'; payload: string }
  | { type: 'SKIP' }
  | { type: 'RESET' }
  | { type: 'UPDATE_CONFIG'; payload: { key: keyof Config; value: string | boolean } }
  | { type: 'SET_INPUT'; payload: string }
  | { type: 'TOGGLE_CONFIG' }
  | { type: 'TOGGLE_REFERENCE' }
  | { type: 'RESET_CONFIG' };

function savedState(state: TrainingState) {
  localStorage.setItem('kanaTrainerState', JSON.stringify(
    {
      ...state,
      questionAsked: Array.from(state.questionAsked)
    }
  ));
}

// Reducer 函数
const reducer = (state: TrainingState, action: Action): TrainingState => {
  switch (action.type) {
    case 'INITIALIZE': {
      if (action.payload) return {
        ...action.payload,
        questionAsked: new Set<string>(Object.keys(action.payload.questionAsked)),
        feedbackType: 'neutral'
      };
      const initialQuestions = generateTestQuestions(state.config);
      const newState = {
        ...state,
        questions: initialQuestions,
        config: state.config,
        questionAsked: new Set<string>(),
        showConfig: false,
        showReference: false,
        feedbackType: 'neutral' as FeedbackType,
      };
      return selectNextQuestion(newState);
    }

    case 'RESET_CONFIG': {
      const newState = {
        ...state,
        config: DEFAULT_CONFIG, // Reset to default config
        feedback: '配置已重置',
        feedbackType: 'neutral' as FeedbackType,
      };
      savedState(newState);
      return newState;
    }

    case 'ANSWER': {
      if (!state.currentQuestion) return state;
      const answer = action.payload.trim().toLowerCase();
      if (!answer) return { ...state, feedback: '请输入答案!', feedbackType: 'error' };

      const qKey = state.currentQuestion.join(',');

      if (answer === 'exit') {
        return { ...state, feedback: '已退出训练', feedbackType: 'neutral', input: '' };
      }
      if (answer === 'skip') {
        return handleSkip(state);
      }

      const isCorrect = answer === state.currentQuestion[1];
      const newCount = isCorrect
        ? (state.questionToRepeatCount[qKey] || state.config.askCount) - 1
        : Math.min(
          (state.questionToRepeatCount[qKey] || state.config.askCount) + state.config.askCountPenalty,
          state.config.askCountMax
        );

      const newRepeatCount = { ...state.questionToRepeatCount };
      if (isCorrect && newCount <= 0) {
        delete newRepeatCount[qKey];
      } else {
        newRepeatCount[qKey] = newCount;
      }

      const newState = {
        ...state,
        feedback: (isCorrect ? '回答正确!' : `回答错误!正确答案是:`) + `${state.currentQuestion[0]} - ${state.currentQuestion[1]}`,
        feedbackType: isCorrect ? 'success' as FeedbackType : 'error',
        input: '',
        correctCount: isCorrect ? state.correctCount + 1 : state.correctCount,
        totalAnswered: state.totalAnswered + 1,
        questionToRepeatCount: newRepeatCount,
        questions: isCorrect && newCount <= 0 ? [...state.questions, state.currentQuestion] : state.questions,
        currentQuestions: newCount > 0 ? [...state.currentQuestions, state.currentQuestion] : state.currentQuestions,
      };
      savedState(newState);
      return selectNextQuestion(newState);
    }

    case 'SKIP':
      return handleSkip(state);

    case 'RESET': {
      const initialQuestions = generateTestQuestions(state.config);
      const newState = {
        questions: initialQuestions,
        currentQuestions: [],
        questionToRepeatCount: {},
        askedCount: 0,
        lastQuestion: null,
        currentQuestion: null,
        questionAsked: new Set<string>(),
        config: state.config,
        correctCount: 0,
        totalAnswered: 0,
        feedback: '训练已重置',
        feedbackType: 'neutral' as FeedbackType,
        input: '',
        showConfig: false,
        showReference: false,
        questionfirstAsk: false,
      };
      return selectNextQuestion(newState);
    }

    case 'UPDATE_CONFIG': {
      const newState = {
        ...state,
        config: {
          ...state.config,
          [action.payload.key]:
            typeof action.payload.value === 'string'
              ? parseInt(action.payload.value) || '' // state.config[action.payload.key]
              : action.payload.value,
        },
      };
      savedState(newState);
      return newState;
    }

    case 'SET_INPUT':
      return { ...state, feedback: ' ', feedbackType: 'neutral', input: action.payload };

    case 'TOGGLE_CONFIG':
      return { ...state, showConfig: !state.showConfig, showReference: false };

    case 'TOGGLE_REFERENCE':
      return { ...state, showReference: !state.showReference, showConfig: false };

    default:
      return state;
  }
};

// Helper functions
const generateTestQuestions = (config: Config): Question[] => {
  const questions: Question[] = [];
  const sources: KanaMapping[][] = [];

  if (config.useSeion) sources.push(SEION_TO_ROMAJI);
  if (config.useDakuon) sources.push(DAKUON_TO_ROMAJI);
  if (config.useYoon) sources.push(YOON_TO_ROMAJI);

  if (sources.length === 0) {
    sources.push(SEION_TO_ROMAJI, DAKUON_TO_ROMAJI, YOON_TO_ROMAJI);
  }

  sources.forEach(source => {
    source.forEach(([hiragana, katakana, romaji]) => {
      questions.push([hiragana, romaji]);
      questions.push([katakana, romaji]);
    });
  });

  return config.randomQuestions ? shuffle(questions) : questions;
};

const selectNextQuestion = (state: TrainingState): TrainingState => {
  let newCurrent = [...state.currentQuestions];
  const newQuestions = [...state.questions];

  while (newCurrent.length < state.config.keepQuestionsSize && newQuestions.length > 0) {
    const q = newQuestions.shift() as Question;
    newCurrent.push(q);
  }

  if (newCurrent.length === 0) {
    return { ...state, feedback: '所有题目已完成!', feedbackType: 'success', currentQuestion: null };
  }

  if (state.askedCount % state.config.keepQuestionsSize === 0 /* && state.config.randomQuestions */) {
    newCurrent = shuffle(newCurrent);
  }

  let q = newCurrent.shift() as Question;
  if (state.lastQuestion && state.lastQuestion.join(',') === q.join(',')) {
    const temp = q;
    q = newCurrent.shift() as Question;
    newCurrent.push(temp);
  }

  const questionfirstAsk = state.askedCount === 0 || !state.questionAsked.has(q.join(','));

  const newQuestionAsked = new Set(state.questionAsked).add(q.join(','));
  return {
    ...state,
    currentQuestions: newCurrent,
    questions: newQuestions,
    currentQuestion: q,
    lastQuestion: q,
    askedCount: state.askedCount + 1,
    questionAsked: newQuestionAsked,
    questionfirstAsk: questionfirstAsk,
  };
};

const handleSkip = (state: TrainingState): TrainingState => {
  if (!state.currentQuestion) return state;
  const newState = {
    ...state,
    questions: [...state.questions, state.currentQuestion],
    feedback: '已跳过',
    feedbackType: 'neutral' as FeedbackType,
  };
  return selectNextQuestion(newState);
};

// Main Component
const KanaTrainer: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [state, dispatch] = useReducer(reducer, {
    questions: [],
    currentQuestions: [],
    questionToRepeatCount: {},
    askedCount: 0,
    lastQuestion: null,
    currentQuestion: null,
    questionAsked: new Set<string>(),
    config: DEFAULT_CONFIG,
    correctCount: 0,
    totalAnswered: 0,
    feedback: ' ',
    feedbackType: 'neutral' as FeedbackType,
    input: '',
    showConfig: false,
    showReference: false,
    questionfirstAsk: false,
  });

  const shallLoadState = true;

  useEffect(() => {
    const savedState = localStorage.getItem('kanaTrainerState');
    if (shallLoadState && savedState) {
      dispatch({ type: 'INITIALIZE', payload: JSON.parse(savedState) });
    } else {
      dispatch({ type: 'INITIALIZE' });
    }
  }, []);

  // useEffect(() => {
  //   console.log("save", state);
  //   localStorage.setItem('kanaTrainerState', JSON.stringify({
  //     ...state,
  //     questionAsked: Array.from(state.questionAsked)
  //   }));
  // }, [state]);

  const handleAnswer = (e: FormEvent) => {
    e.preventDefault();
    if (state.currentQuestion) playPronunciation(state.currentQuestion[0]);
    dispatch({ type: 'ANSWER', payload: state.input });
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInput = e.target.value;

    if (newInput.length === state.currentQuestion?.[1].length) {
      if (state.currentQuestion) playPronunciation(state.currentQuestion[0]);
      dispatch({ type: 'ANSWER', payload: newInput });
      return;
    }
    dispatch({ type: 'SET_INPUT', payload: newInput });
  }

  const handleVirtualKeyPress = (key: string) => {
    let newInput = state.input;

    switch (key) {
      case 'Backspace':
        newInput = newInput.slice(0, -1);
        break;
      case 'Enter':
        if (newInput) {
          if (state.currentQuestion) playPronunciation(state.currentQuestion[0]);
          dispatch({ type: 'ANSWER', payload: newInput });
          return;
        }
        break;
      case 'Space':
        newInput += ' ';
        break;
      default:
        newInput += key;
        if (newInput.length === state.currentQuestion?.[1].length) {
          if (state.currentQuestion) playPronunciation(state.currentQuestion[0]);
          dispatch({ type: 'ANSWER', payload: newInput });
          return;
        }
        break;
    }
    dispatch({ type: 'SET_INPUT', payload: newInput });
  };

  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.innerWidth <= 768;
  };

  return (
    <div className="trainer">
      <header className="trainer-header">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={theme === 'dark' ? '切换亮色主题' : '切换暗色主题'}
          aria-label="切换主题"
        >
          {theme === 'dark' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
        <h1 className="trainer-title">五十音</h1>
        <p className="trainer-subtitle">日语假名训练</p>
      </header>
      <div className="config-toggle">
        {state.showReference || <button
          onClick={() => dispatch({ type: 'TOGGLE_CONFIG' })}
          className="toggle-button"
        >
          {state.showConfig ? '隐藏设置' : '显示设置'}
        </button>}
        {state.showConfig || <button
          onClick={() => dispatch({ type: 'TOGGLE_REFERENCE' })}
          className="toggle-button"
        >
          {state.showReference ? '隐藏对照表' : '显示对照表'}
        </button>}
      </div>

      {state.showReference && <KanaReferenceTable />}

      {state.showConfig && (
        <div className="config-section">
          <h2>设置</h2>
          <div className="config-grid">
          <label>
            包括清音：
            <input
              type="checkbox"
              checked={state.config.useSeion}
              onChange={(e) => dispatch({ type: 'UPDATE_CONFIG', payload: { key: 'useSeion', value: e.target.checked } })}
            />
          </label>
          <label>
            包括浊音:
            <input
              type="checkbox"
              checked={state.config.useDakuon}
              onChange={(e) => dispatch({ type: 'UPDATE_CONFIG', payload: { key: 'useDakuon', value: e.target.checked } })}
            />
          </label>
          <label>
            包括拗音:
            <input
              type="checkbox"
              checked={state.config.useYoon}
              onChange={(e) => dispatch({ type: 'UPDATE_CONFIG', payload: { key: 'useYoon', value: e.target.checked } })}
            />
          </label>
          <label>
            打乱题目顺序:
            <input
              type="checkbox"
              checked={state.config.randomQuestions}
              onChange={(e) => dispatch({ type: 'UPDATE_CONFIG', payload: { key: 'randomQuestions', value: e.target.checked } })}
            />
          </label>
          <label>
            首次提示答案:
            <input
              type="checkbox"
              checked={state.config.hintAnswerFirstTime}
              onChange={(e) => dispatch({ type: 'UPDATE_CONFIG', payload: { key: 'hintAnswerFirstTime', value: e.target.checked } })}
            />
          </label>
          <label>
            题目滑动窗口:
            <input
              type="number"
              value={state.config.keepQuestionsSize}
              onChange={(e) => dispatch({ type: 'UPDATE_CONFIG', payload: { key: 'keepQuestionsSize', value: e.target.value } })}
              min="1"
            />
          </label>
          <label>
            问题提问次数:
            <input
              type="number"
              value={state.config.askCount}
              onChange={(e) => dispatch({ type: 'UPDATE_CONFIG', payload: { key: 'askCount', value: e.target.value } })}
              min="1"
            />
          </label>
          <label>
            错误惩罚次数:
            <input
              type="number"
              value={state.config.askCountPenalty}
              onChange={(e) => dispatch({ type: 'UPDATE_CONFIG', payload: { key: 'askCountPenalty', value: e.target.value } })}
              min="1"
            />
          </label>
          <label>
            最大重复次数:
            <input
              type="number"
              value={state.config.askCountMax}
              onChange={(e) => dispatch({ type: 'UPDATE_CONFIG', payload: { key: 'askCountMax', value: e.target.value } })}
              min="1"
            />
          </label>

          </div>
          <div className="config-actions">
            <button
              type="button"
              onClick={() => dispatch({ type: 'RESET_CONFIG' })}
              className="reset-config-button"
            >
              重置配置
            </button>
          </div>

        </div>
      )}

      <div className="progress">
        <div className="progress-stats">
          <div className="stat-item">
            <span className="stat-label">正确率</span>
            <span className="stat-value">{((state.correctCount / state.totalAnswered) * 100 || 0).toFixed(1)}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">回答</span>
            <span className="stat-value">{state.correctCount} / {state.totalAnswered}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">进度</span>
            <span className="stat-value">{state.questionAsked.size} / {state.currentQuestions.length + state.questions.length}</span>
          </div>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${Math.min((state.questionAsked.size / Math.max(state.currentQuestions.length + state.questions.length, 1)) * 100, 100)}%`
            }}
          />
        </div>
      </div>


      <div className="question-section">
        {state.currentQuestion && <div>
          <div className="question-display">
            <div className="question-counter">第 {state.askedCount} 题</div>
            <div>
              <span className='question-text'>{state.currentQuestion[0]}</span>{' '}
              {state.config.hintAnswerFirstTime && state.questionfirstAsk && (
                <span className="hint">({state.currentQuestion[1]})</span>
              )}
            </div>
          </div>

          <form onSubmit={handleAnswer} className="answer-form">
            <input
              type="text"
              value={state.input}
              onChange={(e) => onInputChange(e)}
              placeholder="输入罗马音"
              autoFocus={!isMobile()} // Only autofocus on desktop
              disabled={isMobile()} // Disable input on mobile
              className={isMobile() ? 'mobile-input' : ''}
            />

            <div className="feedback-wrapper">
              <p className={`feedback ${state.feedbackType}`}>
                {state.feedback}
              </p>
            </div>

            {/* <div className="button-group"> */}
            {/* <button type="submit">提交</button> */}
            {/* </div> */}
          </form>
          <VirtualKeyboard
            onKeyPress={handleVirtualKeyPress}
            disabled={!state.currentQuestion}
          />
        </div>}
        <div className="button-group">
          <button type="button" className="reset-btn" onClick={() => dispatch({ type: 'RESET' })}>重置</button>
          <button type="button" className="skip-btn" onClick={() => dispatch({ type: 'SKIP' })}>跳过</button>
          <button type="button" className="speak-btn" onClick={() => state.currentQuestion && playPronunciation(state.currentQuestion[0])}>朗读</button>
          <button type="submit" onClick={handleAnswer}>确定</button>
        </div>
      </div>
    </div>
  );
};

export default KanaTrainer;