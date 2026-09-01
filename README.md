# AI LAB — Build Intelligence from Zero

Интерактивная двуязычная лаборатория на React, TypeScript и Vite. За 10 глав исследователь собирает `MY AI`: от данных и признаков до causal Transformer, реального обучения и генерации текста собственной моделью.

## Что реализовано

- 115 data-driven сцен: ситуация → объяснение → гипотеза → эксперимент → открытие → установка → Field Test.
- 8 cores, 26 modules, 13 capabilities, milestone builds `0.0–1.0`, certifications и Build History.
- 52 записи Knowledge Archive, Concept Map, Deep Dive, Replay Discovery, Research/Failure/Hypothesis Log.
- Реальные вычисления: neuron, loss, gradient descent, XOR, BPE, attention, Transformer и next-token sampling.
- Tiny GPT-подобная модель от 100K параметров, обучение в Web Worker, checkpoints/models/datasets в IndexedDB.
- Research Mode: runtime workbench, Dataset Lab, Model Museum, Compare Builds и Scenario Authoring Tool.
- Content/Pedagogy linter, versioned persistence migrations, RU/EN, responsive и accessibility settings.

## Run locally

```bash
npm install
npm run dev
```

Vite напечатает локальный URL (обычно `http://localhost:5173`).

## Verification

```bash
npm run type-check
npm test
npm run test:e2e
npm run build
```

Visual-regression эталоны лежат рядом с Playwright-тестом в `e2e/visual-regression.spec.ts-snapshots`.
