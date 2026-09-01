import type { ModuleId } from '../my-ai/capabilityTypes';
import type { ProgramId } from '../programs/programRegistry';
import { chapterOneJourney } from './chapterOneJourney';
import { createSceneRegistry } from './sceneRegistry';
import type { ChapterScene, LabId, LocalizedText, ScenePrimitive } from './sceneTypes';

const text = (ru: string, en: string): LocalizedText => ({ ru, en });

interface ChapterBlueprint {
  number: number;
  id: string;
  program: ProgramId;
  title: LocalizedText;
  mission: LocalizedText;
  problem: LocalizedText;
  explanation: LocalizedText;
  prediction: LocalizedText;
  observation: LocalizedText;
  formal: LocalizedText;
  transfer: LocalizedText;
  conceptIds: string[];
  modules: ModuleId[];
  lab: LabId;
  fieldTest: LocalizedText;
  certifyCore?: 'decision' | 'learning' | 'neural' | 'language' | 'context' | 'transformer' | 'language-model';
}

function campaignScene(
  blueprint: ChapterBlueprint,
  suffix: string,
  primitive: ScenePrimitive,
  title: LocalizedText,
  body: LocalizedText,
  actionLabel: LocalizedText,
  extras: Partial<ChapterScene['content']> = {},
  rewards?: ChapterScene['rewards'],
): ChapterScene {
  return {
    id: `c${blueprint.number}-${suffix}`,
    type: 'chapter',
    chapterId: blueprint.id,
    chapterNumber: blueprint.number,
    levelId: suffix,
    primitive,
    program: blueprint.program,
    title,
    content: { body, actionLabel, ...extras },
    ...(rewards ? { rewards } : {}),
  };
}

function buildChapter(blueprint: ChapterBlueprint): ChapterScene[] {
  const predictionOptions = [
    { id: 'increase', label: text('Увеличится', 'Increase') },
    { id: 'decrease', label: text('Уменьшится', 'Decrease') },
    { id: 'similar', label: text('Почти не изменится', 'Remain similar') },
  ];
  const discoverRewards: NonNullable<ChapterScene['rewards']> = [
    ...blueprint.conceptIds.map((id) => ({ type: 'add-discovery' as const, discovery: { id, sceneId: `c${blueprint.number}-discovery` } })),
    ...blueprint.modules.map((moduleId) => ({ type: 'discover-module' as const, moduleId })),
  ];
  const installRewards: NonNullable<ChapterScene['rewards']> = blueprint.modules.map((moduleId) => ({ type: 'install-module', moduleId }));
  const fieldRewards: NonNullable<ChapterScene['rewards']> = blueprint.certifyCore ? [{ type: 'certify-core', coreId: blueprint.certifyCore }] : [];

  const scenes = [
    campaignScene(blueprint, 'briefing', 'briefing', blueprint.title, blueprint.problem, text('Принять задачу', 'Accept mission'), {
      eyebrow: text(`CHAPTER ${String(blueprint.number).padStart(2, '0')} // FIELD PROBLEM`, `CHAPTER ${String(blueprint.number).padStart(2, '0')} // FIELD PROBLEM`),
      deepDive: blueprint.mission,
      tone: 'challenge',
    }),
    campaignScene(blueprint, 'explain', 'explain', text('ЗАЧЕМ НУЖЕН НОВЫЙ МЕХАНИЗМ', 'WHY A NEW MECHANISM IS NEEDED'), blueprint.explanation, text('Сформулировать гипотезу', 'Form a hypothesis'), {
      deepDive: blueprint.formal,
    }),
    campaignScene(blueprint, 'predict', 'prediction', text('ПРЕДСКАЖИ ДО ЗАПУСКА', 'PREDICT BEFORE RUN'), blueprint.prediction, text('Зафиксировать прогноз', 'Lock prediction'), {
      prompt: text('ОЖИДАЕМЫЙ РЕЗУЛЬТАТ', 'EXPECTED RESULT'),
      options: predictionOptions,
      validation: { type: 'any' },
      selectionMode: 'single',
      feedback: text('ГИПОТЕЗА СОХРАНЕНА. Теперь эксперимент не будет слепым.', 'HYPOTHESIS SAVED. The experiment is no longer blind.'),
      tone: 'challenge',
    }),
    campaignScene(blueprint, 'experiment', 'manipulate', text('ЭКСПЕРИМЕНТ', 'EXPERIMENT'), blueprint.mission, text('Зафиксировать результат', 'Record result'), {
      lab: blueprint.lab,
      tone: 'neutral',
    }),
    campaignScene(blueprint, 'observe', 'observe', text('НАБЛЮДЕНИЕ', 'OBSERVATION'), blueprint.observation, text('Сформулировать открытие', 'Formulate discovery'), {
      deepDive: blueprint.formal,
    }),
    campaignScene(blueprint, 'discovery', 'discovery', text('ОТКРЫТИЕ ЗАПИСАНО', 'DISCOVERY RECORDED'), blueprint.formal, text('Подготовить пакет модулей', 'Prepare module package'), {
      tone: 'success',
    }, discoverRewards),
    campaignScene(blueprint, 'install', 'install', text('MODULE PACKAGE FOUND', 'MODULE PACKAGE FOUND'), text(
      `Компоненты ${blueprint.modules.join(' · ')} готовы к установке в MY AI.`,
      `Components ${blueprint.modules.join(' · ')} are ready to install into MY AI.`,
    ), text('Установить модули', 'Install modules'), {
      tone: 'success',
      feedback: text('ALLOCATING MODULES....... OK\nATTACHING CORE BUS....... OK\nREGISTERING CAPABILITY... OK\nMY AI UPDATED', 'ALLOCATING MODULES....... OK\nATTACHING CORE BUS....... OK\nREGISTERING CAPABILITY... OK\nMY AI UPDATED'),
    }, installRewards),
    campaignScene(blueprint, 'field-test', 'field-test', text('FIELD TEST', 'FIELD TEST'), blueprint.fieldTest, text('Сертифицировать систему', 'Certify system'), {
      prompt: text('ПЕРЕНОС МЕХАНИЗМА В НОВУЮ ЗАДАЧУ', 'TRANSFER THE MECHANISM TO A NEW TASK'),
      options: [
        { id: 'mechanism', label: blueprint.transfer },
        { id: 'memorize', label: text('Запомнить один прошлый ответ', 'Memorize one previous answer') },
        { id: 'random', label: text('Выбрать случайно', 'Choose randomly') },
      ],
      selectionMode: 'single',
      validation: { type: 'exact', optionIds: ['mechanism'] },
      pendingFeedback: text('Испытание проверяет перенос принципа, а не запоминание ответа.', 'The test checks transfer of the principle, not memorization.'),
      feedback: text('FIELD TEST PASSED. Инженерный принцип работает в новой ситуации.', 'FIELD TEST PASSED. The engineering principle works in a new situation.'),
      tone: 'challenge',
    }, fieldRewards),
  ];

  return scenes.map((scene, index) => ({ ...scene, ...(scenes[index + 1] ? { nextSceneId: scenes[index + 1]!.id } : {}) }));
}

const blueprints: ChapterBlueprint[] = [
  {
    number: 2, id: 'decision-engine', program: 'DECISION ENGINE',
    title: text('CHAPTER 02 // DECISION ENGINE', 'CHAPTER 02 // DECISION ENGINE'),
    mission: text('Настрой влияние damage, diameter и mass так, чтобы MY AI выдавала обоснованный прогноз состояния капсулы.', 'Tune the influence of damage, diameter, and mass so MY AI produces a reasoned capsule prediction.'),
    problem: text('MY AI видит вектор капсулы, но не знает, какое решение принять. Тысячи ручных IF-правил быстро противоречат друг другу.', 'MY AI sees the capsule vector but does not know what decision to make. Thousands of manual IF rules quickly contradict each other.'),
    explanation: text('Вместо отдельного правила для каждого случая результат можно вычислять. Параметр weight задаёт силу влияния признака, bias — базовое смещение.', 'Instead of a separate rule for every case, the result can be computed. A weight sets feature influence and a bias sets the baseline shift.'),
    prediction: text('Если увеличить вес признака damage для повреждённой капсулы, как изменится оценка риска?', 'If you increase the damage feature weight for a damaged capsule, how will the risk score change?'),
    observation: text('Одинаковый вход даёт другой прогноз, когда меняются параметры. Формула компактно заменяет множество частных правил.', 'The same input produces a different prediction when parameters change. A formula compactly replaces many special-case rules.'),
    formal: text('PARAMETER · WEIGHT · BIAS · PREDICTION. Линейная модель: y = w₁x₁ + … + wₙxₙ + b.', 'PARAMETER · WEIGHT · BIAS · PREDICTION. Linear model: y = w₁x₁ + … + wₙxₙ + b.'),
    transfer: text('Вычислить оценку из признаков и параметров', 'Compute a score from features and parameters'),
    conceptIds: ['rule', 'parameter', 'weight', 'bias', 'prediction'],
    modules: ['rule-engine', 'parameter-unit', 'prediction-head'], lab: 'linear-parameter',
    fieldTest: text('Автоматическая сортировка семян: построй правило оценки качества из влажности, массы и повреждения.', 'Automated seed sorting: build a quality score from moisture, mass, and damage.'), certifyCore: 'decision',
  },
  {
    number: 3, id: 'learning-protocol', program: 'ERROR ANALYZER',
    title: text('CHAPTER 03 // LEARNING PROTOCOL', 'CHAPTER 03 // LEARNING PROTOCOL'),
    mission: text('Сначала найди лучший weight вручную на loss landscape, затем передай движение Gradient Engine.', 'First find a better weight manually on the loss landscape, then hand movement to the Gradient Engine.'),
    problem: text('Prediction существует, но иногда расходится с target. Машина пока не умеет использовать ошибку, чтобы стать лучше.', 'A prediction exists but sometimes differs from the target. The machine cannot yet use error to improve.'),
    explanation: text('Loss измеряет, насколько плох прогноз. Gradient показывает направление самого быстрого роста; чтобы уменьшить loss, нужно двигаться против него небольшим шагом.', 'Loss measures how bad a prediction is. A gradient points toward fastest increase; to reduce loss, move against it by a small step.'),
    prediction: text('Если gradient положительный, а learning rate мал, что произойдёт после шага w ← w − lr·gradient?', 'If the gradient is positive and the learning rate is small, what happens after w ← w − lr·gradient?'),
    observation: text('После корректного шага параметр меняется, а loss действительно уменьшается. При слишком большом learning rate система перескакивает минимум.', 'After a correct step the parameter changes and loss really falls. With an excessive learning rate the system overshoots the minimum.'),
    formal: text('TARGET · ERROR · LOSS · GRADIENT · LEARNING RATE · GRADIENT DESCENT. wₜ₊₁ = wₜ − η∇L.', 'TARGET · ERROR · LOSS · GRADIENT · LEARNING RATE · GRADIENT DESCENT. wₜ₊₁ = wₜ − η∇L.'),
    transfer: text('Измерить ошибку и обновить параметр против gradient', 'Measure error and update the parameter against the gradient'),
    conceptIds: ['target', 'error', 'loss', 'gradient', 'learning-rate', 'gradient-descent'],
    modules: ['loss-analyzer', 'gradient-engine', 'optimizer'], lab: 'gradient-step',
    fieldTest: text('Калибровка температурного датчика: уменьши среднюю ошибку на новых измерениях, не подглядывая в готовый параметр.', 'Temperature sensor calibration: reduce mean error on new measurements without seeing the solved parameter.'), certifyCore: 'learning',
  },
  {
    number: 4, id: 'neural-core', program: 'NEURON FAB',
    title: text('CHAPTER 04 // NEURAL CORE', 'CHAPTER 04 // NEURAL CORE'),
    mission: text('Собери нейрон, затем добавь hidden layer, когда один линейный элемент не сможет решить XOR.', 'Build a neuron, then add a hidden layer when one linear element cannot solve XOR.'),
    problem: text('Линейная граница не разделяет XOR. Это не ошибка настройки: архитектуре не хватает промежуточного нелинейного представления.', 'A linear boundary cannot separate XOR. This is not a tuning mistake: the architecture lacks an intermediate nonlinear representation.'),
    explanation: text('Нейрон складывает взвешенные входы и bias, затем activation меняет форму ответа. Слой из нескольких нейронов строит новые признаки.', 'A neuron sums weighted inputs and a bias, then an activation changes the response shape. A layer of neurons builds new features.'),
    prediction: text('Сможет ли один линейный нейрон разделить четыре точки XOR?', 'Can one linear neuron separate the four XOR points?'),
    observation: text('Сколько бы ни менялись weights, одна прямая оставляет ошибку. Hidden layer создаёт две границы и решает задачу.', 'No matter how weights change, one line leaves errors. A hidden layer creates two boundaries and solves the task.'),
    formal: text('NEURON · ACTIVATION · LAYER · HIDDEN LAYER · NETWORK · BACKPROPAGATION. h = ReLU(Wx+b).', 'NEURON · ACTIVATION · LAYER · HIDDEN LAYER · NETWORK · BACKPROPAGATION. h = ReLU(Wx+b).'),
    transfer: text('Добавить нелинейный hidden layer', 'Add a nonlinear hidden layer'),
    conceptIds: ['neuron', 'activation', 'layer', 'hidden-layer', 'backpropagation', 'xor'],
    modules: ['neuron', 'activation', 'layer-stack', 'backpropagation'], lab: 'xor-network',
    fieldTest: text('NON-LINEAR CLASSIFIER: классифицируй сигналы, которые нельзя разделить одной прямой.', 'NON-LINEAR CLASSIFIER: classify signals that cannot be separated by one line.'), certifyCore: 'neural',
  },
  {
    number: 5, id: 'text-lab', program: 'TEXT LAB',
    title: text('CHAPTER 05 // TEXT LAB', 'CHAPTER 05 // TEXT LAB'),
    mission: text('Разбей текст на токены, собери vocabulary и замени бессмысленные ID обучаемыми vectors.', 'Split text into tokens, build a vocabulary, and replace meaningless IDs with trainable vectors.'),
    problem: text('Сеть принимает числа, но строка «Hello» не является числовым tensor. Простые ID различают слова, но не кодируют смысл.', 'The network accepts numbers, but “Hello” is not a numeric tensor. Plain IDs distinguish words but do not encode meaning.'),
    explanation: text('Tokenizer преобразует текст в последовательность tokens. Embedding назначает каждому token обучаемый vector, где близость может отражать сходство употребления.', 'A tokenizer converts text into a token sequence. An embedding assigns each token a trainable vector whose proximity can reflect usage similarity.'),
    prediction: text('Что произойдёт с длиной последовательности, если вместо символов использовать частые subwords?', 'What happens to sequence length when frequent subwords replace characters?'),
    observation: text('Subword vocabulary сокращает последовательности, сохраняя возможность представить незнакомые слова. Embeddings меняют расстояния по данным.', 'A subword vocabulary shortens sequences while retaining the ability to represent unfamiliar words. Embeddings change distances from data.'),
    formal: text('TOKEN · VOCABULARY · BPE · TOKENIZER · EMBEDDING. token id → row of embedding matrix E.', 'TOKEN · VOCABULARY · BPE · TOKENIZER · EMBEDDING. token id → row of embedding matrix E.'),
    transfer: text('Токенизировать строку и получить embedding vectors', 'Tokenize the string and retrieve embedding vectors'),
    conceptIds: ['token', 'vocabulary', 'bpe', 'tokenizer', 'embedding'],
    modules: ['tokenizer', 'vocabulary', 'embedding-space'], lab: 'tokenizer',
    fieldTest: text('TEXT INTAKE: представь незнакомое предложение допустимой последовательностью tokens без UNKNOWN для каждого слова.', 'TEXT INTAKE: represent an unfamiliar sentence as valid tokens without one UNKNOWN per word.'), certifyCore: 'language',
  },
  {
    number: 6, id: 'context', program: 'ATTENTION RIG',
    title: text('CHAPTER 06 // CONTEXT', 'CHAPTER 06 // CONTEXT'),
    mission: text('Добавь позицию и настрой Q/K/V так, чтобы местоимение находило связанное слово в контексте.', 'Add position and tune Q/K/V so a pronoun finds its related word in context.'),
    problem: text('Embeddings представляют слова по отдельности, но перестановка слов меняет смысл, а местоимение зависит от далёкого контекста.', 'Embeddings represent words individually, but word order changes meaning and a pronoun depends on distant context.'),
    explanation: text('Position encoding сообщает порядок. Query ищет, Key описывает доступную информацию, Value переносит её. Softmax превращает scores в веса.', 'Position encoding supplies order. A Query searches, a Key describes available information, and a Value carries it. Softmax turns scores into weights.'),
    prediction: text('Если Query слова “it” сильнее совпадает с Key слова “animal”, куда уйдёт больший attention weight?', 'If the Query for “it” matches the Key for “animal” more strongly, where does the larger attention weight go?'),
    observation: text('После softmax веса суммируются в 1. Новый vector слова содержит взвешенную информацию из релевантных позиций.', 'After softmax the weights sum to 1. The new word vector contains weighted information from relevant positions.'),
    formal: text('POSITION · RoPE · QUERY · KEY · VALUE · SOFTMAX · ATTENTION · MULTI-HEAD. softmax(QKᵀ/√dₖ)V.', 'POSITION · RoPE · QUERY · KEY · VALUE · SOFTMAX · ATTENTION · MULTI-HEAD. softmax(QKᵀ/√dₖ)V.'),
    transfer: text('Сопоставить Query с Keys и смешать Values', 'Match a Query to Keys and blend Values'),
    conceptIds: ['position', 'rope', 'query', 'key', 'value', 'softmax', 'attention', 'multi-head-attention'],
    modules: ['position-encoder', 'attention-module', 'multi-head-attention'], lab: 'attention',
    fieldTest: text('CONTEXT RESOLUTION: определи, к чему относится местоимение в новой последовательности.', 'CONTEXT RESOLUTION: determine what a pronoun refers to in a new sequence.'), certifyCore: 'context',
  },
  {
    number: 7, id: 'block-assembly', program: 'BLOCK ASSEMBLY',
    title: text('CHAPTER 07 // BLOCK ASSEMBLY', 'CHAPTER 07 // BLOCK ASSEMBLY'),
    mission: text('Собери рабочий Transformer block из нормализации, attention, residual stream и feed-forward слоя.', 'Assemble a working Transformer block from normalization, attention, a residual stream, and a feed-forward layer.'),
    problem: text('Отдельные детали существуют, но неправильный порядок разрушает scale сигналов или стирает исходную информацию.', 'The parts exist, but the wrong order destroys signal scale or erases original information.'),
    explanation: text('RMSNorm стабилизирует scale, attention смешивает контекст, SwiGLU преобразует каждый token, residual stream сохраняет и накапливает информацию.', 'RMSNorm stabilizes scale, attention mixes context, SwiGLU transforms each token, and the residual stream preserves and accumulates information.'),
    prediction: text('Что случится с информацией о token, если убрать residual connection после attention?', 'What happens to token information if the residual connection after attention is removed?'),
    observation: text('Без residual пути блок вынужден полностью заменять состояние. Корректная сборка добавляет преобразование к существующему представлению.', 'Without a residual path the block must replace the state entirely. Correct assembly adds a transformation to the existing representation.'),
    formal: text('RMSNORM · RESIDUAL · SwiGLU · TRANSFORMER BLOCK. x ← x + Attention(Norm(x)); x ← x + FFN(Norm(x)).', 'RMSNORM · RESIDUAL · SwiGLU · TRANSFORMER BLOCK. x ← x + Attention(Norm(x)); x ← x + FFN(Norm(x)).'),
    transfer: text('Собрать Norm → module → Residual дважды', 'Assemble Norm → module → Residual twice'),
    conceptIds: ['rmsnorm', 'residual', 'swiglu', 'transformer-block'],
    modules: ['rmsnorm', 'residual-stream', 'swiglu', 'transformer-blocks'], lab: 'transformer-assembly',
    fieldTest: text('BLOCK INTEGRITY: восстанови Transformer block по наблюдаемым сбоям scale и потере сигнала.', 'BLOCK INTEGRITY: restore a Transformer block from observed scale failures and signal loss.'), certifyCore: 'transformer',
  },
  {
    number: 8, id: 'language-model', program: 'LM BENCH',
    title: text('CHAPTER 08 // LANGUAGE MODEL', 'CHAPTER 08 // LANGUAGE MODEL'),
    mission: text('Преврати Transformer в autoregressive model, которая видит только прошлое и предсказывает следующий token.', 'Turn the Transformer into an autoregressive model that sees only the past and predicts the next token.'),
    problem: text('Transformer выдаёт contextual states, но ещё не имеет учебной цели и может подсматривать будущие tokens.', 'The Transformer produces contextual states but lacks a learning objective and can peek at future tokens.'),
    explanation: text('Causal mask закрывает будущее. LM head преобразует state в logits по vocabulary, softmax — в probability distribution.', 'A causal mask hides the future. The LM head converts a state into vocabulary logits and softmax into a probability distribution.'),
    prediction: text('Если temperature увеличить, распределение sampling станет более острым или более плоским?', 'If temperature increases, does the sampling distribution become sharper or flatter?'),
    observation: text('Без обучения logits почти случайны. Temperature управляет разнообразием, но не создаёт знания, которых нет в weights.', 'Before training the logits are nearly random. Temperature controls diversity but cannot create knowledge absent from the weights.'),
    formal: text('CAUSAL MASK · NEXT-TOKEN PREDICTION · LOGITS · LM HEAD · SAMPLING. p(token|context)=softmax(logits/T).', 'CAUSAL MASK · NEXT-TOKEN PREDICTION · LOGITS · LM HEAD · SAMPLING. p(token|context)=softmax(logits/T).'),
    transfer: text('Скрыть будущее и получить distribution следующего token', 'Hide the future and produce the next-token distribution'),
    conceptIds: ['causal-mask', 'next-token', 'logits', 'lm-head', 'sampling', 'temperature'],
    modules: ['causal-mask', 'lm-head', 'sampling-engine'], lab: 'next-token',
    fieldTest: text('AUTOREGRESSIVE CHECK: докажи, что prediction позиции не использует tokens справа от неё.', 'AUTOREGRESSIVE CHECK: prove a position prediction does not use tokens to its right.'),
  },
  {
    number: 9, id: 'training-console', program: 'TRAINING CONSOLE',
    title: text('CHAPTER 09 // TRAINING CONSOLE', 'CHAPTER 09 // TRAINING CONSOLE'),
    mission: text('Подготовь dataset, запусти реальное обновление weights, сохрани checkpoint и диагностируй diverging run.', 'Prepare a dataset, run real weight updates, save a checkpoint, and diagnose a diverging run.'),
    problem: text('Необученная модель имеет правильную архитектуру, но выдаёт шум. Ей нужны примеры, objective и устойчивый optimizer.', 'The untrained model has the right architecture but emits noise. It needs examples, an objective, and a stable optimizer.'),
    explanation: text('Dataset делится на train и validation. Batch оценивает gradient, optimizer обновляет weights, checkpoint сохраняет воспроизводимое состояние.', 'A dataset is split into train and validation. A batch estimates the gradient, an optimizer updates weights, and a checkpoint saves reproducible state.'),
    prediction: text('Что произойдёт с loss, если learning rate увеличить до разрушительно большого значения?', 'What happens to loss when the learning rate is raised to a destructively large value?'),
    observation: text('При устойчивом run loss снижается, а samples становятся связнее. Слишком большой шаг вызывает oscillation, рост loss и NaN.', 'In a stable run loss falls and samples become more coherent. An excessive step causes oscillation, rising loss, and NaN.'),
    formal: text('DATASET · TRAIN/VALIDATION · BATCH · STEP · ADAMW · SCHEDULE · CHECKPOINT · OVERFITTING.', 'DATASET · TRAIN/VALIDATION · BATCH · STEP · ADAMW · SCHEDULE · CHECKPOINT · OVERFITTING.'),
    transfer: text('Настроить устойчивый training run и проверить validation', 'Configure a stable training run and inspect validation'),
    conceptIds: ['dataset', 'validation', 'batch', 'optimizer', 'adamw', 'checkpoint', 'overfitting'],
    modules: [], lab: 'training',
    fieldTest: text('TRAINING CERTIFICATION: получи loss ниже baseline, сохрани checkpoint и покажи улучшенный sample.', 'TRAINING CERTIFICATION: beat baseline loss, save a checkpoint, and show an improved sample.'), certifyCore: 'language-model',
  },
];

const generatedChapters = blueprints.flatMap(buildChapter);

const finalBlueprint: ChapterBlueprint = {
  number: 10, id: 'my-llm', program: 'ASSEMBLY BAY',
  title: text('CHAPTER 10 // MY LLM', 'CHAPTER 10 // MY LLM'), mission: text('', ''), problem: text('', ''), explanation: text('', ''), prediction: text('', ''), observation: text('', ''), formal: text('', ''), transfer: text('', ''), conceptIds: [], modules: [], lab: 'model-assembly', fieldTest: text('', ''),
};

const finalChapter: ChapterScene[] = [
  campaignScene(finalBlueprint, 'briefing', 'briefing', text('CHAPTER 10 // MY LLM', 'CHAPTER 10 // MY LLM'), text('Подсказки сняты. Выбери tokenizer, context, embedding, heads, layers, learning rate и dataset. Система заранее покажет parameters и memory.', 'Guidance is withdrawn. Choose a tokenizer, context, embedding, heads, layers, learning rate, and dataset. The system will estimate parameters and memory.'), text('Войти в сборочный отсек', 'Enter assembly bay'), { tone: 'challenge' }),
  campaignScene(finalBlueprint, 'assembly', 'build', text('ASSEMBLY BAY', 'ASSEMBLY BAY'), text('Сконфигурируй небольшую GPT-подобную модель в пределах браузерного runtime.', 'Configure a small GPT-like model within the browser runtime.'), text('Собрать модель', 'Build model'), { lab: 'model-assembly' }),
  campaignScene(finalBlueprint, 'train', 'train', text('TRAIN MY LLM', 'TRAIN MY LLM'), text('Запусти обучение выбранной модели. Timeline покажет loss и реальные samples по мере обновления weights.', 'Train the selected model. The timeline shows loss and real samples as weights update.'), text('Сохранить checkpoint', 'Save checkpoint'), { lab: 'training' }),
  campaignScene(finalBlueprint, 'terminal', 'generate', text('MY LLM TERMINAL', 'MY LLM TERMINAL'), text('MODEL LOADED. Введи начало текста и впервые запусти собственную модель.', 'MODEL LOADED. Enter a text prefix and run your own model for the first time.'), text('Зафиксировать генерацию', 'Record generation'), { lab: 'model-assembly', tone: 'success' }),
  campaignScene(finalBlueprint, 'complete', 'reflection', text('YOU BUILT A LANGUAGE MODEL.', 'YOU BUILT A LANGUAGE MODEL.'), text('PROJECT MY AI: COMPLETE. RESEARCH MODE: UNLOCKED. Машина получает информацию, учится на примерах, использует контекст, предсказывает tokens и генерирует язык.', 'PROJECT MY AI: COMPLETE. RESEARCH MODE: UNLOCKED. The machine receives information, learns from examples, uses context, predicts tokens, and generates language.'), text('Открыть Research Mode', 'Open Research Mode'), { tone: 'success', deepDive: text('Теперь можно менять архитектуру, сравнивать builds, исследовать attention, datasets и checkpoints.', 'You can now change architecture, compare builds, and inspect attention, datasets, and checkpoints.') }, [
    { type: 'add-discovery', discovery: { id: 'language-model', sceneId: 'c10-complete' } },
  ]),
];

const allWithoutLinks = [...chapterOneJourney, ...generatedChapters, ...finalChapter];

export const campaignJourney: ChapterScene[] = allWithoutLinks.map((scene, index) => {
  const next = allWithoutLinks[index + 1];
  return next ? { ...scene, nextSceneId: next.id } : scene;
});

export const campaignSceneRegistry = createSceneRegistry(campaignJourney);
export const CAMPAIGN_SCENE_ORDER = campaignJourney.map(({ id }) => id);
