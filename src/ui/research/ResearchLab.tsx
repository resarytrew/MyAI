import { Database, Flask, GitDiff, Play, SlidersHorizontal } from '@phosphor-icons/react';
import { useEffect, useMemo, useState } from 'react';
import { generateWorkshopText, loadWorkshopCheckpoint } from '../../domain/models/modelWorkshop';
import { TINY_STORY_DATASET } from '../../domain/models/modelRuntime';
import { tinyTransformerRuntime } from '../../domain/models/tinyTransformerRuntime';
import type { LabId } from '../../domain/journey/sceneTypes';
import { useI18n } from '../../i18n/useI18n';
import { labDatabase, type SavedModelRecord } from '../../state/labDatabase';
import { useSettingsStore } from '../../state/useSettingsStore';
import view from '../programs/ProgramView.module.css';
import styles from './ResearchLab.module.css';
import { ScenarioAuthoringTool } from './ScenarioAuthoringTool';
import { InteractiveLab } from '../labs/InteractiveLab';

type LabTab = 'workbench' | 'dataset' | 'models' | 'compare' | 'authoring' | 'settings';

const workbenchLabs: Array<{ id: string; lab: LabId; label: string; sceneId?: string }> = [
  { id: 'tokenizer', lab: 'tokenizer', label: 'TOKENIZER' },
  { id: 'attention', lab: 'attention', label: 'ATTENTION' },
  { id: 'block', lab: 'transformer-assembly', label: 'BLOCK' },
  { id: 'architecture', lab: 'model-assembly', label: 'ARCHITECTURE', sceneId: 'research-architecture' },
  { id: 'training', lab: 'training', label: 'TRAINING' },
  { id: 'console', lab: 'model-assembly', label: 'CONSOLE', sceneId: 'research-terminal' },
];

function RuntimeWorkbench() {
  const [toolId, setToolId] = useState('tokenizer');
  const [ready, setReady] = useState(false);
  const tool = workbenchLabs.find(({ id }) => id === toolId) ?? workbenchLabs[0]!;
  return <section className={styles.tool} aria-labelledby="workbench-title">
    <header><Flask aria-hidden="true" size={25} weight="light" /><div><small>PROFESSIONAL INTERFACE</small><h2 id="workbench-title">RUNTIME WORKBENCH</h2></div><strong>{ready ? 'EXPERIMENT VALID' : 'AWAITING INPUT'}</strong></header>
    <div className={styles.labSelector}>{workbenchLabs.map(({ id, label }) => <button key={id} type="button" aria-pressed={toolId === id} onClick={() => { setToolId(id); setReady(false); }}>{label}</button>)}</div>
    <InteractiveLab lab={tool.lab} sceneId={tool.sceneId ?? `research-${tool.id}`} onReadyChange={setReady} />
  </section>;
}

function DatasetLab() {
  const { locale } = useI18n();
  const [text, setText] = useState(TINY_STORY_DATASET.text);
  const [saved, setSaved] = useState(false);
  const words = text.trim().split(/\s+/).filter(Boolean);
  const chars = new Set(text.toLowerCase()).size;
  const validationStart = Math.floor(words.length * .8);
  return <section className={styles.tool}>
    <header><Database aria-hidden="true" size={25} weight="light" /><div><small>DATASET LAB</small><h2>{locale === 'ru' ? 'Подготовка текста' : 'Text preparation'}</h2></div></header>
    <textarea aria-label={locale === 'ru' ? 'Текст датасета' : 'Dataset text'} value={text} onChange={(event) => { setText(event.target.value); setSaved(false); }} />
    <dl className={view.meta}><div><dt>characters</dt><dd>{text.length}</dd></div><div><dt>word samples</dt><dd>{words.length}</dd></div><div><dt>char vocabulary</dt><dd>{chars}</dd></div><div><dt>train / validation</dt><dd>{validationStart} / {words.length - validationStart}</dd></div></dl>
    <button className={view.textButton} type="button" onClick={async () => { await labDatabase.saveDataset({ id: `custom-${Date.now()}`, name: 'Custom text', text }); setSaved(true); }}>{saved ? 'DATASET SAVED' : locale === 'ru' ? 'СОХРАНИТЬ DATASET' : 'SAVE DATASET'}</button>
  </section>;
}

function ModelMuseum({ models, onRefresh }: { models: SavedModelRecord[]; onRefresh: () => void }) {
  const { locale } = useI18n();
  const [output, setOutput] = useState('');
  const run = async (model: SavedModelRecord) => {
    await loadWorkshopCheckpoint(model.checkpointId);
    setOutput(await generateWorkshopText('the ', .72));
  };
  return <section className={styles.tool}>
    <header><Flask aria-hidden="true" size={25} weight="light" /><div><small>MODEL MUSEUM</small><h2>{locale === 'ru' ? 'Мои модели' : 'My models'}</h2></div><button className={view.textButton} type="button" onClick={onRefresh}>{locale === 'ru' ? 'ОБНОВИТЬ' : 'REFRESH'}</button></header>
    {models.length ? <div className={styles.modelGrid}>{models.map((model) => <article key={model.id}><small>{new Date(model.createdAt).toLocaleDateString(locale)}</small><h3>{model.name}</h3><dl><div><dt>parameters</dt><dd>{tinyTransformerRuntime.estimate(model.config, 29).parameters.toLocaleString()}</dd></div><div><dt>loss</dt><dd>{Number.isFinite(model.loss) ? model.loss.toFixed(3) : '—'}</dd></div><div><dt>layers / heads</dt><dd>{model.config.layers} / {model.config.heads}</dd></div></dl><p>{locale === 'ru' ? `Эта модель использует ${model.config.layers} block, ${model.config.heads} attention heads и окно ${model.config.contextLength} tokens.` : `This model uses ${model.config.layers} blocks, ${model.config.heads} attention heads, and a ${model.config.contextLength}-token context.`}</p><button type="button" onClick={() => run(model)}><Play aria-hidden="true" /> RUN</button></article>)}</div> : <div className={view.empty}><p>{locale === 'ru' ? 'Моделей пока нет. Training Console сохранит первую.' : 'No models yet. Training Console will save the first one.'}</p></div>}
    {output ? <pre className={styles.output}>{output}</pre> : null}
  </section>;
}

function CompareModels({ models }: { models: SavedModelRecord[] }) {
  const { locale } = useI18n();
  const [leftId, setLeftId] = useState(models[0]?.id ?? '');
  const [rightId, setRightId] = useState(models[1]?.id ?? models[0]?.id ?? '');
  const left = models.find(({ id }) => id === leftId);
  const right = models.find(({ id }) => id === rightId);
  if (!models.length) return <div className={view.empty}><p>{locale === 'ru' ? 'Сохрани хотя бы одну модель для сравнения.' : 'Save at least one model to compare.'}</p></div>;
  return <section className={styles.tool}>
    <header><GitDiff aria-hidden="true" size={25} weight="light" /><div><small>COMPARE BUILDS</small><h2>{locale === 'ru' ? 'Компромиссы архитектуры' : 'Architecture tradeoffs'}</h2></div></header>
    <div className={styles.compareSelectors}><select aria-label="Build A" value={leftId} onChange={(event) => setLeftId(event.target.value)}>{models.map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}</select><span>VS</span><select aria-label="Build B" value={rightId} onChange={(event) => setRightId(event.target.value)}>{models.map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}</select></div>
    {left && right ? <div className={styles.comparison}>{[['d_model', left.config.dModel, right.config.dModel], ['layers', left.config.layers, right.config.layers], ['heads', left.config.heads, right.config.heads], ['context', left.config.contextLength, right.config.contextLength], ['loss', left.loss, right.loss]].map(([label, a, b]) => <div key={String(label)}><strong>{String(label)}</strong><span>{typeof a === 'number' ? a.toFixed(label === 'loss' ? 3 : 0) : a}</span><span>{typeof b === 'number' ? b.toFixed(label === 'loss' ? 3 : 0) : b}</span></div>)}</div> : null}
  </section>;
}

function SettingsPanel() {
  const { locale } = useI18n();
  const settings = useSettingsStore();
  return <section className={styles.tool}><header><SlidersHorizontal aria-hidden="true" size={25} weight="light" /><div><small>TERMINAL SETTINGS</small><h2>{locale === 'ru' ? 'Атмосфера и доступность' : 'Atmosphere and accessibility'}</h2></div></header><div className={styles.settings}>
    <label><span>PHOSPHOR EFFECT</span><select value={settings.phosphor} onChange={(event) => settings.updateSetting('phosphor', event.target.value as typeof settings.phosphor)}><option value="normal">NORMAL</option><option value="low">LOW</option><option value="off">OFF</option></select></label>
    <label><span>SCANLINES</span><input type="checkbox" checked={settings.scanlines} onChange={(event) => settings.updateSetting('scanlines', event.target.checked)} /></label>
    <label><span>ANIMATIONS</span><select value={settings.animations} onChange={(event) => settings.updateSetting('animations', event.target.value as typeof settings.animations)}><option value="full">FULL</option><option value="reduced">REDUCED</option></select></label>
    <label><span>FONT SIZE</span><select value={settings.fontScale} onChange={(event) => settings.updateSetting('fontScale', event.target.value as typeof settings.fontScale)}><option value="normal">NORMAL</option><option value="large">LARGE</option></select></label>
    <label><span>SOUND</span><input type="checkbox" checked={settings.sound} onChange={(event) => settings.updateSetting('sound', event.target.checked)} /></label>
    <label><span>AMBIENT</span><input type="checkbox" checked={settings.ambient} onChange={(event) => settings.updateSetting('ambient', event.target.checked)} /></label>
  </div></section>;
}

export function ResearchLab({ initialTab = 'workbench' }: { initialTab?: LabTab }) {
  const { locale } = useI18n();
  const [tab, setTab] = useState<LabTab>(initialTab);
  const [models, setModels] = useState<SavedModelRecord[]>([]);
  const refresh = () => { void labDatabase.listModels().then((values) => setModels(values.sort((a, b) => b.createdAt - a.createdAt))); };
  useEffect(refresh, []);
  useEffect(() => setTab(initialTab), [initialTab]);
  const tabs = useMemo(() => [
    ['workbench', 'WORKBENCH'], ['dataset', 'DATASET'], ['models', locale === 'ru' ? 'МОДЕЛИ' : 'MODELS'], ['compare', locale === 'ru' ? 'СРАВНЕНИЕ' : 'COMPARE'], ['authoring', 'AUTHORING'], ['settings', locale === 'ru' ? 'НАСТР.' : 'SETTINGS'],
  ] as const, [locale]);
  return <section className={view.view} aria-labelledby="research-title"><header className={view.header}><div><p>PROGRAM // RESEARCH LAB</p><h1 id="research-title">{locale === 'ru' ? 'СВОБОДНАЯ ЛАБОРАТОРИЯ' : 'RESEARCH MODE'}</h1></div><strong>WORKER RUNTIME // INDEXEDDB ONLINE</strong></header><div className={view.toolbar}>{tabs.map(([id, label]) => <button key={id} type="button" aria-pressed={tab === id} onClick={() => setTab(id)}>{label}</button>)}</div>{tab === 'workbench' ? <RuntimeWorkbench /> : tab === 'dataset' ? <DatasetLab /> : tab === 'models' ? <ModelMuseum models={models} onRefresh={refresh} /> : tab === 'compare' ? <CompareModels models={models} /> : tab === 'authoring' ? <ScenarioAuthoringTool /> : <SettingsPanel />}</section>;
}
