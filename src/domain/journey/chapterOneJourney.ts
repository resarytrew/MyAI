import { createSceneRegistry } from './sceneRegistry';
import type {
  ChapterOption,
  ChapterProgram,
  ChapterScene,
  LocalizedText,
  SceneId,
} from './sceneTypes';

const text = (ru: string, en: string): LocalizedText => ({ ru, en });
const option = (id: string, ru: string, en: string, detailRu?: string, detailEn?: string): ChapterOption => ({
  id,
  label: text(ru, en),
  ...(detailRu && detailEn ? { detail: text(detailRu, detailEn) } : {}),
});

function scene(
  id: SceneId,
  program: ChapterProgram,
  titleRu: string,
  titleEn: string,
  content: ChapterScene['content'],
  rewards?: ChapterScene['rewards'],
): ChapterScene {
  return { id, type: 'chapter', program, title: text(titleRu, titleEn), content, ...(rewards ? { rewards } : {}) };
}

const draft: ChapterScene[] = [
  scene('p0-power', 'BOOTLOADER', 'AI LAB', 'AI LAB', {
    eyebrow: text('RESEARCH STATION 07', 'RESEARCH STATION 07'),
    body: text('Защищённый терминал отключён. Включи исследовательскую станцию.', 'The secure terminal is offline. Power on the research station.'),
    actionLabel: text('● ПИТАНИЕ', '● POWER'),
    visual: 'power', tone: 'boot',
  }),
  scene('p0-system-check', 'BOOTLOADER', 'ПРОВЕРКА СИСТЕМЫ', 'SYSTEM CHECK', {
    body: text('Базовые системы работают. Ядро искусственного интеллекта не найдено. В архиве обнаружен незавершённый проект MY AI.', 'Base systems are online. No artificial intelligence core was found. An incomplete MY AI project exists in the archive.'),
    actionLabel: text('Открыть архив', 'Open archive'),
    visual: 'diagnostics', tone: 'boot',
  }),
  scene('p0-identity', 'BOOTLOADER', 'НОВЫЙ ИССЛЕДОВАТЕЛЬ', 'NEW RESEARCHER', {
    body: text('Система назначила тебе роль младшего исследователя. Имя будет сохранено в исследовательском журнале.', 'The system assigned you the role of junior researcher. Your name will be saved in the research log.'),
    input: { label: text('ИМЯ ИССЛЕДОВАТЕЛЯ', 'RESEARCHER NAME'), placeholder: text('Введите имя', 'Enter a name'), maxLength: 24 },
    feedback: text('ДОСТУП УРОВНЯ 01 ПРЕДОСТАВЛЕН.', 'ACCESS LEVEL 01 GRANTED.'),
    actionLabel: text('Получить доступ', 'Request access'),
    visual: 'identity',
  }),
  scene('p0-brief', 'BOOTLOADER', 'PROJECT: MY AI', 'PROJECT: MY AI', {
    body: text('Предыдущая команда пыталась построить систему, способную работать с человеческим языком. Проект не был завершён. Твоя задача — продолжить разработку.', 'The previous team attempted to build a system capable of working with human language. The project was never completed. Your objective is to continue development.'),
    deepDive: text('Конечная цель: получать информацию, учиться на примерах, обрабатывать язык, понимать контекст и генерировать текст.', 'Final objective: receive information, learn from examples, process language, understand context, and generate text.'),
    actionLabel: text('Открыть диагностику', 'Open diagnostics'),
    visual: 'project-map',
  }),

  scene('l1-machine-test', 'SYSTEM DIAGNOSTICS', 'ЧТО ЗНАЧИТ «УМНАЯ»?', 'WHAT DOES “INTELLIGENT” MEAN?', {
    eyebrow: text('LEVEL 01 // TEST 01', 'LEVEL 01 // TEST 01'),
    body: text('Кто быстрее вычислит 98 347 × 6 132?', 'Who will calculate 98,347 × 6,132 faster?'),
    prompt: text('ВЫБЕРИ СИСТЕМУ', 'SELECT A SYSTEM'),
    options: [option('human', 'ЧЕЛОВЕК', 'HUMAN'), option('calculator', 'КАЛЬКУЛЯТОР', 'CALCULATOR')],
    validation: { type: 'any' }, selectionMode: 'single',
    feedback: text('КАЛЬКУЛЯТОР: 603 033 804 · ВРЕМЯ: 0.002 СЕК. Человек ещё считает.', 'CALCULATOR: 603,033,804 · TIME: 0.002 SEC. The human is still calculating.'),
    actionLabel: text('Запустить тест', 'Run test'), visual: 'calculation', tone: 'challenge',
  }),
  scene('l1-provocation', 'SYSTEM DIAGNOSTICS', 'КАЛЬКУЛЯТОР ПОБЕДИЛ', 'CALCULATOR WON', {
    body: text('Следует ли из победы в вычислении, что калькулятор интеллектуальнее человека? Это гипотеза — наказания за ответ нет.', 'Does winning a calculation mean the calculator is more intelligent than a human? This is a hypothesis; there is no penalty.'),
    prompt: text('ТВОЙ ВЫВОД', 'YOUR CONCLUSION'),
    options: [option('yes', 'ДА', 'YES'), option('no', 'НЕТ', 'NO'), option('unsure', 'НЕ УВЕРЕН', 'NOT SURE')],
    validation: { type: 'any' }, selectionMode: 'single',
    feedback: text('ГИПОТЕЗА СОХРАНЕНА. Нужен второй тест.', 'HYPOTHESIS SAVED. A second test is required.'),
    actionLabel: text('Сохранить гипотезу', 'Save hypothesis'), tone: 'challenge',
  }),
  scene('l1-second-test', 'SYSTEM DIAGNOSTICS', 'ВТОРОЙ ТЕСТ', 'SECOND TEST', {
    body: text('Человек узнаёт кошку и понимает, что в предложении тяжёлой была книга. Обычный калькулятор отвечает: UNKNOWN INPUT.', 'A human recognizes the cat and understands that the book was heavy in the sentence. A basic calculator returns UNKNOWN INPUT.'),
    actionLabel: text('Сравнить способности', 'Compare abilities'), visual: 'cat-reasoning',
  }),
  scene('l1-note', 'SYSTEM DIAGNOSTICS', 'СКОРОСТЬ ≠ ИНТЕЛЛЕКТ', 'SPEED ≠ INTELLIGENCE', {
    body: text('Калькулятор выполняет вычисления значительно быстрее человека. Но скорость сама по себе не означает способность понимать ситуацию, использовать опыт или решать новые задачи.', 'A calculator performs arithmetic much faster than a human. But speed alone does not mean it can understand a situation, use experience, or solve new problems.'),
    deepDive: text('Система может быть очень мощной, оставаясь узким инструментом для фиксированных команд.', 'A system may be very powerful while remaining a narrow tool for fixed commands.'),
    actionLabel: text('Зафиксировать наблюдение', 'Record observation'), tone: 'success',
  }),
  scene('l1-abilities', 'SYSTEM DIAGNOSTICS', 'СОБЕРИ СПОСОБНОСТИ', 'ASSEMBLE ABILITIES', {
    body: text('Какие способности могли бы сделать поведение машины интеллектуальным? Выбери свою гипотезу.', 'Which abilities could make a machine behave intelligently? Select your hypothesis.'),
    options: [
      option('calculate', 'Вычислять', 'Calculate'), option('learn', 'Учиться', 'Learn'),
      option('experience', 'Использовать опыт', 'Use experience'), option('understand', 'Понимать вход', 'Understand input'),
      option('plan', 'Планировать', 'Plan'), option('commands', 'Следовать фиксированным командам', 'Follow fixed commands'),
      option('novel', 'Справляться с новыми ситуациями', 'Handle new situations'),
    ],
    validation: { type: 'any' }, selectionMode: 'multiple',
    feedback: text('ГИПОТЕЗА СОХРАНЕНА. Интеллект проявляется как сочетание способностей, а не одна функция.', 'HYPOTHESIS SAVED. Intelligence appears as a combination of abilities, not one function.'),
    actionLabel: text('Сохранить гипотезу', 'Save hypothesis'),
  }),
  scene('l1-discovery', 'SYSTEM DIAGNOSTICS', 'ОТКРЫТИЕ 001', 'DISCOVERY 001', {
    body: text('Интеллект — не одна способность. Мы называем систему интеллектуальной, когда она использует информацию для решения задач и меняет поведение в разных ситуациях.', 'Intelligence is not a single ability. We call a system intelligent when it uses information to solve tasks and changes its behavior across situations.'),
    actionLabel: text('Записать открытие', 'Record discovery'), tone: 'success',
  }, [{ type: 'add-discovery', discovery: { id: 'intelligence-not-computation', sceneId: 'l1-discovery' } }]),
  scene('l1-status', 'SYSTEM DIAGNOSTICS', 'ПЕРВАЯ ПРОБЛЕМА', 'FIRST PROBLEM', {
    body: text('MY AI умеет вычислять, но не может интерпретировать окружающий мир. Прежде чем учиться, система должна получить что-то на вход.', 'MY AI can calculate, but it cannot interpret the world. Before it can learn, the system must receive something as input.'),
    actionLabel: text('Исследовать вход', 'Investigate input'), visual: 'ai-status', tone: 'challenge',
  }),

  scene('l2-apple', 'SYSTEM DIAGNOSTICS', 'ЧТО ВИДИШЬ ТЫ?', 'WHAT DO YOU SEE?', {
    eyebrow: text('LEVEL 02 // MACHINE VISION', 'LEVEL 02 // MACHINE VISION'),
    body: text('Перед тобой один объект. Человек может интерпретировать его несколькими способами.', 'One object is in front of you. A human can interpret it in several ways.'),
    options: [option('apple', 'Яблоко', 'Apple'), option('fruit', 'Фрукт', 'Fruit'), option('red', 'Красный объект', 'Red object'), option('food', 'Еда', 'Food')],
    validation: { type: 'any' }, selectionMode: 'multiple',
    feedback: text('ЧЕЛОВЕЧЕСКАЯ ИНТЕРПРЕТАЦИЯ СОХРАНЕНА. А что получает MY AI?', 'HUMAN INTERPRETATION SAVED. What does MY AI receive?'),
    actionLabel: text('Описать объект', 'Describe object'), visual: 'apple',
  }),
  scene('l2-machine-view', 'SYSTEM DIAGNOSTICS', 'ЧТО ВИДИТ МАШИНА?', 'WHAT DOES THE MACHINE SEE?', {
    body: text('Машина не получает слово «яблоко». Цифровое изображение поступает как сетка значений, описывающих цвет элементов изображения.', 'The machine does not receive the word “apple.” A digital image arrives as a grid of values describing the color of image elements.'),
    actionLabel: text('Исследовать пиксели', 'Inspect pixels'), visual: 'pixel-grid',
  }),
  scene('l2-input', 'SYSTEM DIAGNOSTICS', 'НОВЫЙ ТЕРМИН: ВХОД', 'NEW TERM: INPUT', {
    body: text('Вход — то, что система получает для обработки. Камера даёт изображение, микрофон — звук, датчик — измерение, клавиатура — текст.', 'Input is what a system receives for processing. A camera provides an image, a microphone sound, a sensor a measurement, and a keyboard text.'),
    deepDive: text('Внутри вычислительной системы каждый вход должен иметь форму, с которой можно выполнять операции.', 'Inside a computing system, every input must have a form that operations can work with.'),
    actionLabel: text('Проверить разные входы', 'Check different inputs'), tone: 'success',
  }),
  scene('l2-inputs', 'SYSTEM DIAGNOSTICS', 'РАЗНЫЕ ВХОДЫ', 'DIFFERENT INPUTS', {
    body: text('Сопоставь источники с тем, что фактически получает компьютер.', 'Match each source to what the computer actually receives.'),
    options: [
      option('temperature', 'Датчик температуры → 23.7', 'Temperature sensor → 23.7'),
      option('microphone', 'Микрофон → значения волны', 'Microphone → waveform values'),
      option('image', 'Изображение → значения пикселей', 'Image → pixel values'),
      option('text', 'Текст → кодированные символы', 'Text → encoded symbols'),
    ],
    validation: { type: 'exact', optionIds: ['temperature', 'microphone', 'image', 'text'] }, selectionMode: 'multiple',
    pendingFeedback: text('Выбери все четыре корректных преобразования входа.', 'Select all four correct input transformations.'),
    feedback: text('Все источники преобразуются в значения, доступные вычислительной системе. Обработка текста пока заблокирована.', 'Every source is transformed into values a computing system can access. Text processing remains locked.'),
    actionLabel: text('Соединить входы', 'Connect inputs'), visual: 'input-map',
  }),
  scene('l2-meaning', 'SYSTEM DIAGNOSTICS', 'ОТКУДА БЕРЁТСЯ СМЫСЛ?', 'WHERE DOES MEANING COME FROM?', {
    body: text('Если компьютер получает значения, как он узнаёт, что они означают «яблоко»?', 'If a computer receives values, how does it know they mean “apple”?'),
    options: [option('knows', 'Он просто знает', 'It just knows'), option('meaning', 'Кто-то должен задать смысл', 'Someone must give them meaning'), option('unsure', 'Не уверен', 'Not sure')],
    validation: { type: 'any' }, selectionMode: 'single',
    feedback: text('КОРРЕКТНЫЙ ВОПРОС ОБНАРУЖЕН. Значения требуют контекста и интерпретации.', 'CORRECT QUESTION DETECTED. Values require context and interpretation.'),
    actionLabel: text('Проверить гипотезу', 'Check hypothesis'), tone: 'challenge',
  }),
  scene('l2-data-bench', 'DATA BENCH', 'DATA BENCH v1.0', 'DATA BENCH v1.0', {
    body: text('Системная диагностика открыла новую лабораторную программу. Исследуем, чем значения отличаются от их смысла.', 'System diagnostics unlocked a new laboratory program. We will investigate how values differ from their meaning.'),
    actionLabel: text('Запустить DATA BENCH', 'Launch DATA BENCH'), tone: 'boot',
  }),

  scene('l3-numbers', 'DATA BENCH', 'ТРИ ЧИСЛА', 'THREE NUMBERS', {
    eyebrow: text('LEVEL 03 // DATA ≠ MEANING', 'LEVEL 03 // DATA ≠ MEANING'),
    body: text('23 · 61 · 104. Что означают эти числа без подписей и единиц измерения?', '23 · 61 · 104. What do these numbers mean without labels or units?'),
    options: [option('known', 'Значение очевидно', 'The meaning is obvious'), option('context', 'Нужен контекст', 'Context is required'), option('random', 'Это просто случайные числа', 'They are just random numbers')],
    validation: { type: 'any' }, selectionMode: 'single',
    feedback: text('БЕЗ КОНТЕКСТА: UNKNOWN.', 'WITHOUT CONTEXT: UNKNOWN.'),
    actionLabel: text('Ответить', 'Answer'), visual: 'three-numbers',
  }),
  scene('l3-context', 'DATA BENCH', 'ДОБАВЛЯЕМ КОНТЕКСТ', 'ADD CONTEXT', {
    body: text('Те же значения становятся осмысленными после подписей: температура воздуха 23 °C, пульс 61 уд/мин, масса 104 г.', 'The same values become meaningful with labels: air temperature 23°C, heart rate 61 bpm, mass 104 g.'),
    actionLabel: text('Сравнить', 'Compare'), visual: 'context-values',
  }),
  scene('l3-data', 'DATA BENCH', 'ОТКРЫТИЕ 002: ДАННЫЕ', 'DISCOVERY 002: DATA', {
    body: text('Данные — это зафиксированные значения или наблюдения, которые система может получить, хранить и обрабатывать. Само число почти ничего не говорит без контекста.', 'Data are recorded values or observations that a system can receive, store, and process. A number by itself says very little without context.'),
    deepDive: text('Данные не равны пониманию. Они становятся полезными, когда связаны с источником, единицами и задачей.', 'Data are not understanding. They become useful when connected to a source, units, and a task.'),
    actionLabel: text('Записать открытие', 'Record discovery'), tone: 'success',
  }, [
    { type: 'discover-capability', capabilityId: 'data' },
    { type: 'add-discovery', discovery: { id: 'data', sceneId: 'l3-data' } },
  ]),
  scene('l3-information', 'DATA BENCH', 'ДАННЫЕ И ИНФОРМАЦИЯ', 'DATA AND INFORMATION', {
    body: text('ДАННЫЕ: 38.7 °C. ИНФОРМАЦИЯ: температура необычно высокая. Информация появляется, когда мы понимаем значение данных для конкретной задачи.', 'DATA: 38.7°C. INFORMATION: the temperature is unusually high. Information appears when we understand what data mean for a specific task.'),
    actionLabel: text('Зафиксировать различие', 'Record the distinction'), visual: 'data-information',
  }),
  scene('l3-quality', 'DATA BENCH', 'ОШИБКА ДАТЧИКА', 'SENSOR ERROR', {
    body: text('Датчик передал четыре измерения. Какое значение выглядит подозрительно?', 'A sensor transmitted four measurements. Which value looks suspicious?'),
    options: [option('23.1', '23.1', '23.1'), option('23.0', '23.0', '23.0'), option('91.7', '91.7', '91.7'), option('23.2', '23.2', '23.2')],
    validation: { type: 'exact', optionIds: ['91.7'] }, selectionMode: 'single',
    pendingFeedback: text('Сравни измерение с соседними значениями.', 'Compare the measurement with its neighbors.'),
    feedback: text('91.7 — вероятный выброс. Ошибочный датчик, пропуск или неверная запись могут привести к неверному решению.', '91.7 is a likely outlier. A faulty sensor, missing value, or bad record can lead to a wrong decision.'),
    actionLabel: text('Проверить данные', 'Check data'), visual: 'sensor-values', tone: 'challenge',
  }),
  scene('l3-install-data', 'DATA BENCH', 'МОДУЛЬ: DATA INTERFACE', 'MODULE: DATA INTERFACE', {
    body: text('Цепочка WORLD → INPUT → DATA → MY AI готова. Установи первый системный модуль.', 'The WORLD → INPUT → DATA → MY AI chain is ready. Install the first system module.'),
    feedback: text('DATA BUS · INPUT BUFFER · DATA STORAGE — ONLINE. MY AI обновлён до BUILD 0.1.', 'DATA BUS · INPUT BUFFER · DATA STORAGE — ONLINE. MY AI updated to BUILD 0.1.'),
    actionLabel: text('Установить DATA INTERFACE', 'Install DATA INTERFACE'), visual: 'data-install', tone: 'success',
  }, [{ type: 'install-capability', capabilityId: 'data' }]),

  scene('l4-scan', 'DATA BENCH', 'ЧТО ДЕЙСТВИТЕЛЬНО ВАЖНО?', 'WHAT ACTUALLY MATTERS?', {
    eyebrow: text('LEVEL 04 // OBJECT SCAN', 'LEVEL 04 // OBJECT SCAN'),
    body: text('Для автомобиля доступны десятки измерений. Задача: определить, пройдёт ли он через ворота шириной и высотой 2.0 м. Нужны ли все данные?', 'Dozens of measurements are available for a car. The task is to decide whether it fits through a 2.0 m wide and tall gate. Do we need all data?'),
    actionLabel: text('Открыть скан', 'Open scan'), visual: 'car-scan',
  }),
  scene('l4-select', 'DATA BENCH', 'ВЫБЕРИ НУЖНОЕ', 'SELECT WHAT MATTERS', {
    body: text('Выбери свойства автомобиля, необходимые именно для этой задачи.', 'Select the car properties needed for this specific task.'),
    options: [option('width', 'Ширина', 'Width'), option('height', 'Высота', 'Height'), option('color', 'Цвет', 'Color'), option('owner', 'Владелец', 'Owner'), option('fuel', 'Топливо', 'Fuel level'), option('scratches', 'Царапины', 'Scratches')],
    validation: { type: 'exact', optionIds: ['width', 'height'] }, selectionMode: 'multiple',
    pendingFeedback: text('Для прохода через ворота важны только размеры, ограничивающие проём.', 'Only dimensions constrained by the gate matter.'),
    feedback: text('USEFUL FOR THIS TASK: WIDTH, HEIGHT.', 'USEFUL FOR THIS TASK: WIDTH, HEIGHT.'),
    actionLabel: text('Проверить выбор', 'Check selection'),
  }),
  scene('l4-feature', 'DATA BENCH', 'ОТКРЫТИЕ 003: ПРИЗНАК', 'DISCOVERY 003: FEATURE', {
    body: text('Признак — свойство объекта, которое мы используем для решения конкретной задачи. Наличие данных ещё не означает, что они полезны.', 'A feature is a property of an object that we use to solve a specific task. Available data are not automatically useful.'),
    deepDive: text('Для разных задач один и тот же объект описывается разными наборами признаков.', 'The same object is described by different feature sets for different tasks.'),
    actionLabel: text('Записать открытие', 'Record discovery'), tone: 'success',
  }, [
    { type: 'discover-capability', capabilityId: 'features' },
    { type: 'add-discovery', discovery: { id: 'feature', sceneId: 'l4-feature' } },
  ]),
  scene('l4-task-relative', 'DATA BENCH', 'ОДИН ОБЪЕКТ — РАЗНЫЕ ЗАДАЧИ', 'ONE OBJECT — DIFFERENT TASKS', {
    body: text('Для допуска на аттракцион важен рост. Для размера шлема — окружность головы. Для языка интерфейса — язык пользователя. Правильный набор признаков зависит от задачи.', 'Height matters for a ride admission. Head circumference matters for helmet size. User language matters for interface language. The right feature set depends on the task.'),
    actionLabel: text('Сравнить задачи', 'Compare tasks'), visual: 'task-features',
  }),
  scene('l4-relevance', 'DATA BENCH', 'ПОЛЕЗНЫЙ ПРИЗНАК', 'USEFUL FEATURE', {
    body: text('Задача: предсказать, растает ли мороженое. Выбери два наиболее полезных свойства.', 'Task: predict whether ice cream will melt. Select the two most useful properties.'),
    options: [option('temperature', 'Температура воздуха', 'Air temperature'), option('color', 'Цвет мороженого', 'Ice cream color'), option('time', 'Время вне морозилки', 'Time outside freezer'), option('price', 'Цена', 'Price')],
    validation: { type: 'exact', optionIds: ['temperature', 'time'] }, selectionMode: 'multiple',
    pendingFeedback: text('Доступность свойства не гарантирует его связь с таянием.', 'A property being available does not guarantee relevance to melting.'),
    feedback: text('Температура и время связаны с процессом таяния. Цвет и цена доступны, но имеют низкую полезность для этой задачи.', 'Temperature and time relate to melting. Color and price are available but have low utility for this task.'),
    actionLabel: text('Проверить полезность', 'Check utility'), tone: 'challenge',
  }),
  scene('l4-table', 'DATA BENCH', 'ТАБЛИЦА ПРИЗНАКОВ', 'FEATURE TABLE', {
    body: text('Мы превратили объекты в описываемые свойства. Теперь несколько объектов можно сравнивать по одинаковым колонкам.', 'We transformed objects into describable properties. Multiple objects can now be compared using the same columns.'),
    actionLabel: text('Открыть численное представление', 'Open numeric representation'), visual: 'feature-table',
  }),

  scene('l5-numeric', 'DATA BENCH', 'МИР СТАНОВИТСЯ ЧИСЛАМИ', 'THE WORLD BECOMES NUMBERS', {
    eyebrow: text('LEVEL 05 // REPRESENTATION', 'LEVEL 05 // REPRESENTATION'),
    body: text('TEMPERATURE = 24.5 — численный признак уже готов для вычислений.', 'TEMPERATURE = 24.5 is a numeric feature already ready for computation.'),
    actionLabel: text('Продолжить', 'Continue'), tone: 'success',
  }),
  scene('l5-color', 'DATA BENCH', 'А ЧТО С ЦВЕТОМ?', 'WHAT ABOUT COLOR?', {
    body: text('Цвет RED нельзя напрямую использовать в арифметике. Можно присвоить цветам коды, но код 3 не означает, что синий «в три раза больше» красного.', 'The color RED cannot be used directly in arithmetic. We can assign codes to colors, but code 3 does not mean blue is “three times” red.'),
    options: [option('ordinal', 'RED=1, GREEN=2, BLUE=3', 'RED=1, GREEN=2, BLUE=3'), option('raw', 'Оставить только слова', 'Keep words only'), option('ignore', 'Удалить цвет всегда', 'Always remove color')],
    validation: { type: 'exact', optionIds: ['ordinal'] }, selectionMode: 'single',
    pendingFeedback: text('Нужна численная запись, но её смысл следует интерпретировать осторожно.', 'A numeric record is needed, but its meaning must be interpreted carefully.'),
    feedback: text('КОДИРОВАНИЕ ПРИНЯТО. Числа могут быть метками категорий, а не измеряемой величиной.', 'ENCODING ACCEPTED. Numbers may be category labels rather than measured quantities.'),
    actionLabel: text('Кодировать цвет', 'Encode color'), visual: 'color-encoding',
  }),
  scene('l5-boolean', 'DATA BENCH', 'ДА / НЕТ', 'YES / NO', {
    body: text('Как компактно представить признак «идёт дождь»?', 'How can we compactly represent the feature “is raining” ?'),
    options: [option('binary', 'YES → 1, NO → 0', 'YES → 1, NO → 0'), option('random', 'YES → 42, NO → −9', 'YES → 42, NO → −9')],
    validation: { type: 'exact', optionIds: ['binary'] }, selectionMode: 'single',
    pendingFeedback: text('Найди простую бинарную запись двух состояний.', 'Find a simple binary encoding for two states.'),
    feedback: text('BOOLEAN ENCODING ACCEPTED.', 'BOOLEAN ENCODING ACCEPTED.'),
    actionLabel: text('Применить код', 'Apply encoding'), visual: 'boolean-encoding',
  }),
  scene('l5-image', 'DATA BENCH', 'ИЗОБРАЖЕНИЕ', 'IMAGE', {
    body: text('Даже изображение можно представить набором числовых значений, описывающих его элементы. Матрица — не сама сцена, а её машинная запись.', 'Even an image can be represented by numeric values describing its elements. The matrix is not the scene itself; it is a machine-readable record.'),
    actionLabel: text('Прочитать матрицу', 'Read matrix'), visual: 'image-matrix',
  }),
  scene('l5-sound', 'DATA BENCH', 'ЗВУК', 'SOUND', {
    body: text('Звук тоже можно измерить как последовательность чисел. Каждое значение описывает состояние сигнала в определённый момент.', 'Sound can also be measured as a sequence of numbers. Each value describes the signal at a particular moment.'),
    actionLabel: text('Исследовать сигнал', 'Inspect signal'), visual: 'sound-wave',
  }),
  scene('l5-text', 'DATA BENCH', 'ТЕКСТ: ЗАБЛОКИРОВАНО', 'TEXT: LOCKED', {
    body: text('«HELLO» не является числом. Для текста потребуется отдельный способ кодирования, но модуль обработки текста откроется в одной из будущих глав.', '“HELLO” is not a number. Text will require its own encoding method, but the text processing module will unlock in a future chapter.'),
    actionLabel: text('Оставить вопрос открытым', 'Leave question open'), visual: 'text-lock', tone: 'challenge',
  }),
  scene('l5-representation', 'DATA BENCH', 'ОТКРЫТИЕ 004: ПРЕДСТАВЛЕНИЕ', 'DISCOVERY 004: REPRESENTATION', {
    body: text('Представление — способ записать объект или явление в форме, с которой может работать система. Это не сам объект, а выбранное для задачи описание.', 'A representation is a way to record an object or phenomenon in a form a system can work with. It is not the object itself, but a task-specific description.'),
    deepDive: text('Одно яблоко можно представить изображением, измерениями цвета и массы или набором признаков. Полезность представления определяется задачей.', 'One apple can be represented as an image, color and mass measurements, or a feature set. The task determines whether a representation is useful.'),
    actionLabel: text('Записать открытие', 'Record discovery'), visual: 'representation', tone: 'success',
  }, [{ type: 'add-discovery', discovery: { id: 'representation', sceneId: 'l5-representation' } }]),

  scene('l6-brief', 'DATA BENCH', 'BOSS // ДАЙ МАШИНЕ ГЛАЗА', 'BOSS // GIVE THE MACHINE EYES', {
    eyebrow: text('LEVEL 06 // LAB INCIDENT', 'LEVEL 06 // LAB INCIDENT'),
    body: text('Автоматический сортировщик повреждён. Подготовь MY AI к различению безопасных и повреждённых капсул. Пока не принимай решение — построй правильное представление задачи.', 'The automatic sorting unit has failed. Prepare MY AI to distinguish safe and damaged capsules. Do not make the decision yet; build the right representation of the task.'),
    actionLabel: text('Принять миссию', 'Accept mission'), visual: 'capsule-mission', tone: 'challenge',
  }),
  scene('l6-examples', 'DATA BENCH', 'ИССЛЕДУЙ ПРИМЕРЫ', 'INSPECT EXAMPLES', {
    body: text('Безопасные капсулы обычно имеют мало повреждений и стабильные размеры. Повреждённые отличаются более высоким уровнем дефектов и отклонениями массы или диаметра.', 'Safe capsules usually have little surface damage and stable dimensions. Damaged capsules show higher defect levels and deviations in mass or diameter.'),
    actionLabel: text('Сравнить образцы', 'Compare samples'), visual: 'capsule-examples',
  }),
  scene('l6-select', 'DATA BENCH', 'ВЫБЕРИ ПРИЗНАКИ', 'SELECT FEATURES', {
    body: text('Выбери от двух до четырёх полезных признаков. Проверка оценивает связь каждого свойства с повреждением.', 'Select two to four useful features. The check evaluates how each property relates to damage.'),
    options: [option('damage', 'Повреждение поверхности', 'Surface damage'), option('diameter', 'Диаметр', 'Diameter'), option('mass', 'Масса', 'Mass'), option('temperature', 'Температура', 'Temperature'), option('serial', 'Серийный номер', 'Serial number'), option('scan-time', 'Время сканирования', 'Scan time')],
    validation: { type: 'includes-all', optionIds: ['damage', 'diameter', 'mass'], min: 3, max: 4 }, selectionMode: 'multiple',
    pendingFeedback: text('FEATURE CHECK: серийный номер и время сканирования меняются, но не описывают повреждение. Сравни damage, diameter и mass.', 'FEATURE CHECK: serial number and scan time change but do not describe damage. Compare damage, diameter, and mass.'),
    feedback: text('UTILITY: HIGH. SURFACE DAMAGE, DIAMETER и MASS описывают состояние капсулы и образуют устойчивый набор признаков.', 'UTILITY: HIGH. SURFACE DAMAGE, DIAMETER, and MASS describe capsule condition and form a stable feature set.'),
    actionLabel: text('Проверить признаки', 'Check features'), tone: 'challenge',
  }),
  scene('l6-vector', 'DATA BENCH', 'ПОСТРОЙ ПРЕДСТАВЛЕНИЕ', 'BUILD A REPRESENTATION', {
    body: text('Помести выбранные признаки во входной вектор MY AI. Порядок фиксируется, чтобы каждое значение всегда означало одно и то же свойство.', 'Place the selected features into the MY AI input vector. The order is fixed so each value always means the same property.'),
    options: [option('damage', 'damage = 0.03', 'damage = 0.03'), option('diameter', 'diameter = 50.10', 'diameter = 50.10'), option('mass', 'mass = 101.20', 'mass = 101.20')],
    validation: { type: 'exact', optionIds: ['damage', 'diameter', 'mass'] }, selectionMode: 'multiple',
    feedback: text('REPRESENTATION: [0.03, 50.10, 101.20]. INPUT VECTOR READY.', 'REPRESENTATION: [0.03, 50.10, 101.20]. INPUT VECTOR READY.'),
    pendingFeedback: text('Вектор должен содержать три выбранных признака.', 'The vector must contain all three selected features.'),
    actionLabel: text('Собрать вектор', 'Build vector'), visual: 'input-vector',
  }),
  scene('l6-new-object', 'DATA BENCH', 'НОВЫЙ ОБЪЕКТ', 'NEW OBJECT', {
    body: text('Неизвестная капсула представлена как [0.68, 49.20, 96.30]. MY AI теперь может получить и прочитать её признаки. Но поле решения остаётся пустым.', 'An unknown capsule is represented as [0.68, 49.20, 96.30]. MY AI can now receive and read its features. But the decision field remains empty.'),
    actionLabel: text('Запросить решение', 'Request decision'), visual: 'new-object', tone: 'challenge',
  }),
  scene('l6-dialog', 'DATA BENCH', 'ПОЧЕМУ СИСТЕМА НЕ РЕШАЕТ?', 'WHY CAN’T THE SYSTEM DECIDE?', {
    body: text('INPUT RECEIVED. FEATURES AVAILABLE. DECISION: UNKNOWN.', 'INPUT RECEIVED. FEATURES AVAILABLE. DECISION: UNKNOWN.'),
    options: [option('power', 'Нужно больше вычислительной мощности', 'It needs more computing power'), option('rule', 'Есть данные, но система не знает, как их использовать', 'It has data but does not know how to use them'), option('wrong', 'Числа неверны', 'The numbers are wrong')],
    validation: { type: 'exact', optionIds: ['rule'] }, selectionMode: 'single',
    pendingFeedback: text('Данные корректны и уже доступны. Чего не хватает между входом и решением?', 'The data are correct and available. What is missing between input and decision?'),
    feedback: text('Верно. Представление показывает задачу, но ещё не задаёт правило принятия решения.', 'Correct. A representation exposes the task but does not yet define a decision rule.'),
    actionLabel: text('Проверить вывод', 'Check conclusion'), visual: 'decision-gap',
  }),
  scene('l6-explanation', 'DATA BENCH', 'ДАННЫЕ ПОЗВОЛЯЮТ ВИДЕТЬ', 'DATA MAKES THE TASK VISIBLE', {
    body: text('Данные позволяют машине видеть задачу. Но сами данные ещё не говорят машине, какое решение принять. DATA: AVAILABLE. FEATURES: AVAILABLE. DECISION RULE: MISSING.', 'Data allow a machine to see the task. But data alone do not tell it which decision to make. DATA: AVAILABLE. FEATURES: AVAILABLE. DECISION RULE: MISSING.'),
    actionLabel: text('Подготовить модуль', 'Prepare module'), tone: 'success',
  }),
  scene('l6-install-features', 'DATA BENCH', 'МОДУЛЬ: FEATURE SYSTEM', 'MODULE: FEATURE SYSTEM', {
    body: text('Реестр признаков, входной вектор и слой представления готовы к установке.', 'The feature registry, input vector, and representation layer are ready to install.'),
    feedback: text('FEATURE REGISTRY · INPUT VECTOR · REPRESENTATION LAYER — ONLINE. MY AI обновлён до BUILD 0.2.', 'FEATURE REGISTRY · INPUT VECTOR · REPRESENTATION LAYER — ONLINE. MY AI updated to BUILD 0.2.'),
    actionLabel: text('Установить FEATURE SYSTEM', 'Install FEATURE SYSTEM'), visual: 'feature-install', tone: 'success',
  }, [{ type: 'install-capability', capabilityId: 'features' }]),

  scene('chapter-complete', 'CHAPTER COMPLETE', 'CHAPTER 01 COMPLETE', 'CHAPTER 01 COMPLETE', {
    body: text('INITIALIZATION // «НАУЧИ МАШИНУ ВИДЕТЬ». DATA INTERFACE и FEATURE SYSTEM установлены. MY AI получает входы, хранит данные, описывает объекты признаками и создаёт машинные представления.', 'INITIALIZATION // “TEACH THE MACHINE TO SEE.” DATA INTERFACE and FEATURE SYSTEM are installed. MY AI receives inputs, stores data, describes objects with features, and creates machine-readable representations.'),
    deepDive: text('Открытия: 001 INTELLIGENCE ≠ COMPUTATION · 002 DATA · 003 FEATURE · 004 REPRESENTATION. MY AI всё ещё не умеет принимать решения или учиться на примерах.', 'Discoveries: 001 INTELLIGENCE ≠ COMPUTATION · 002 DATA · 003 FEATURE · 004 REPRESENTATION. MY AI still cannot make decisions or learn from examples.'),
    actionLabel: text('Открыть исследовательский журнал', 'Open research log'), visual: 'chapter-summary', tone: 'success',
  }),
  scene('chapter-teaser', 'CHAPTER COMPLETE', 'ОТКРЫТЫЙ ВОПРОС', 'OPEN QUESTION', {
    body: text('Новая капсула распознана как [0.68, 49.20, 96.30]. Данные получены. Признаки извлечены. РЕШЕНИЕ: ?', 'A new capsule is represented as [0.68, 49.20, 96.30]. Data received. Features extracted. DECISION: ?'),
    deepDive: text('Как эти значения должны влиять на решение?', 'How should these values affect the decision?'),
    actionLabel: text('Завершить главу', 'Complete chapter'), visual: 'teaser', tone: 'challenge',
  }),
];

export const chapterOneJourney: ChapterScene[] = draft.map((item, index) => {
  const next = draft[index + 1];
  return next ? { ...item, nextSceneId: next.id } : item;
});

export const chapterOneSceneRegistry = createSceneRegistry(chapterOneJourney);
