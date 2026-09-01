import { campaignJourney } from '../journey/campaignJourney';
import type { LocalizedText } from '../journey/sceneTypes';
import type { CampaignDefinition, ChapterDefinition, ChapterId } from './campaignTypes';

const text = (ru: string, en: string): LocalizedText => ({ ru, en });

const chapterMeta: Array<Omit<ChapterDefinition, 'levels' | 'moduleIds'>> = [
  { id: 'initialization', number: 1, code: 'INITIALIZATION', title: text('Научи машину видеть', 'Teach the machine to see'), mission: text('Представь мир данными и признаками.', 'Represent the world with data and features.'), question: text('Как представить мир внутри компьютера?', 'How can the world be represented inside a computer?'), program: 'DATA BENCH', coreId: 'input', fieldTest: text('Automated capsule inspection', 'Automated capsule inspection') },
  { id: 'decision-engine', number: 2, code: 'DECISION ENGINE', title: text('Научи машину принимать решения', 'Teach the machine to decide'), mission: text('Замени тысячи правил вычисляемым прогнозом.', 'Replace thousands of rules with a computed prediction.'), question: text('Как признаки влияют на решение?', 'How do features influence a decision?'), program: 'DECISION ENGINE', coreId: 'decision', fieldTest: text('Seed quality sorting', 'Seed quality sorting') },
  { id: 'learning-protocol', number: 3, code: 'LEARNING PROTOCOL', title: text('Научи машину исправлять ошибки', 'Teach the machine to correct errors'), mission: text('Преврати ошибку в обновление параметров.', 'Turn error into parameter updates.'), question: text('Как система становится лучше?', 'How does a system improve?'), program: 'ERROR ANALYZER', coreId: 'learning', fieldTest: text('Sensor calibration', 'Sensor calibration') },
  { id: 'neural-core', number: 4, code: 'NEURAL CORE', title: text('Построй нейросеть', 'Build a neural network'), mission: text('Преодолей ограничение линейной модели.', 'Overcome the limit of a linear model.'), question: text('Зачем нужны слои и нелинейность?', 'Why do layers and nonlinearity matter?'), program: 'NEURON FAB', coreId: 'neural', fieldTest: text('XOR classifier', 'XOR classifier') },
  { id: 'text-lab', number: 5, code: 'TEXT LAB', title: text('Научи машину читать', 'Teach the machine to read'), mission: text('Преврати язык в обучаемые vectors.', 'Turn language into trainable vectors.'), question: text('Как представить текст числами?', 'How can text be represented as numbers?'), program: 'TEXT LAB', coreId: 'language', fieldTest: text('Text intake', 'Text intake') },
  { id: 'context', number: 6, code: 'CONTEXT', title: text('Научи слова смотреть друг на друга', 'Teach words to look at one another'), mission: text('Добавь порядок и контекстные связи.', 'Add order and contextual relations.'), question: text('Как слово использует другие слова?', 'How does a word use other words?'), program: 'ATTENTION RIG', coreId: 'context', fieldTest: text('Context resolution', 'Context resolution') },
  { id: 'block-assembly', number: 7, code: 'BLOCK ASSEMBLY', title: text('Собери Transformer', 'Assemble a Transformer'), mission: text('Соедини механизмы в устойчивый block.', 'Connect mechanisms into a stable block.'), question: text('Зачем нужна каждая деталь?', 'Why is each part necessary?'), program: 'BLOCK ASSEMBLY', coreId: 'transformer', fieldTest: text('Block integrity', 'Block integrity') },
  { id: 'language-model', number: 8, code: 'LANGUAGE MODEL', title: text('Преврати Transformer в GPT', 'Turn the Transformer into GPT'), mission: text('Добавь next-token objective и causal mask.', 'Add a next-token objective and causal mask.'), question: text('Как модель предсказывает продолжение?', 'How does the model predict a continuation?'), program: 'LM BENCH', coreId: 'language-model', fieldTest: text('Autoregressive check', 'Autoregressive check') },
  { id: 'training-console', number: 9, code: 'TRAINING CONSOLE', title: text('Обучи модель', 'Train the model'), mission: text('Проведи устойчивый training run.', 'Run stable training.'), question: text('Как weights получают знания из текста?', 'How do weights learn from text?'), program: 'TRAINING CONSOLE', coreId: 'language-model', fieldTest: text('Training certification', 'Training certification') },
  { id: 'my-llm', number: 10, code: 'MY LLM', title: text('Построй свою модель', 'Build your own model'), mission: text('Сконфигурируй, обучи и запусти MY LLM.', 'Configure, train, and run MY LLM.'), question: text('Сможешь ли ты собрать всё без подсказок?', 'Can you assemble everything without guidance?'), program: 'ASSEMBLY BAY', coreId: 'language-model', fieldTest: text('First generated language', 'First generated language') },
];

const modulesByChapter: Record<ChapterId, ChapterDefinition['moduleIds']> = {
  initialization: ['data-interface', 'feature-system', 'representation-layer'],
  'decision-engine': ['rule-engine', 'parameter-unit', 'prediction-head'],
  'learning-protocol': ['loss-analyzer', 'gradient-engine', 'optimizer'],
  'neural-core': ['neuron', 'activation', 'layer-stack', 'backpropagation'],
  'text-lab': ['tokenizer', 'vocabulary', 'embedding-space'],
  context: ['position-encoder', 'attention-module', 'multi-head-attention'],
  'block-assembly': ['rmsnorm', 'residual-stream', 'swiglu', 'transformer-blocks'],
  'language-model': ['causal-mask', 'lm-head', 'sampling-engine'],
  'training-console': [],
  'my-llm': [],
};

export const CHAPTERS: ChapterDefinition[] = chapterMeta.map((chapter) => {
  const chapterScenes = campaignJourney.filter((scene) => (scene.chapterNumber ?? (scene.id.startsWith('p0-') || scene.id.startsWith('l') || scene.id.startsWith('chapter-') ? 1 : 0)) === chapter.number);
  const levelIds = [...new Set(chapterScenes.map((scene) => scene.levelId ?? (chapter.number === 1 ? scene.id.split('-')[0] : scene.id)))];
  return {
    ...chapter,
    moduleIds: modulesByChapter[chapter.id],
    levels: levelIds.map((id) => ({
      id,
      title: text(id.toUpperCase(), id.toUpperCase()),
      sceneIds: chapterScenes.filter((scene) => (scene.levelId ?? scene.id.split('-')[0]) === id).map(({ id: sceneId }) => sceneId),
    })),
  };
});

export const AI_LAB_CAMPAIGN: CampaignDefinition = {
  id: 'build-intelligence',
  title: text('AI LAB // СОБЕРИ ИНТЕЛЛЕКТ С НУЛЯ', 'AI LAB // BUILD INTELLIGENCE FROM ZERO'),
  objective: text('Получай информацию → представляй данные → принимай решения → учись → обрабатывай язык → используй контекст → предсказывай и генерируй текст.', 'Receive information → represent data → decide → learn → process language → use context → predict and generate text.'),
  chapters: CHAPTERS,
};

export function getChapterByScene(sceneId: string): ChapterDefinition {
  return CHAPTERS.find((chapter) => chapter.levels.some((level) => level.sceneIds.includes(sceneId))) ?? CHAPTERS[0]!;
}
