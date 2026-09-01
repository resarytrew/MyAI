import { useEffect, useMemo, useState } from 'react';
import { computeLinearNeuron } from '../../domain/experiments';
import { runBpeSteps } from '../../domain/models/tokenizer';
import { buildWorkshopModel, cancelWorkshopTraining, generateWorkshopText, saveWorkshopCheckpoint, setWorkshopDataset, trainWorkshopModel } from '../../domain/models/modelWorkshop';
import { TINY_STORY_DATASET, type Dataset } from '../../domain/models/modelRuntime';
import { tinyTransformerRuntime } from '../../domain/models/tinyTransformerRuntime';
import type { LabId } from '../../domain/journey/sceneTypes';
import { useI18n } from '../../i18n/useI18n';
import { useModelWorkshopStore } from '../../state/useModelWorkshopStore';
import { labDatabase } from '../../state/labDatabase';
import { NumericSlider } from '../common/NumericSlider';
import { TerminalButton } from '../common/TerminalButton';
import { GradientStepView } from '../experiments/GradientStepView';
import styles from './InteractiveLab.module.css';

interface InteractiveLabProps {
  lab: LabId;
  sceneId: string;
  onReadyChange: (ready: boolean) => void;
}

function LinearParameterLab({ onReady }: { onReady: () => void }) {
  const { locale } = useI18n();
  const [weight, setWeight] = useState(0.25);
  const [bias, setBias] = useState(0.1);
  const inputs = [0.68, 0.49, 0.96];
  const result = computeLinearNeuron({ x: inputs[0]!, weight, bias });
  return <div className={styles.labGrid}>
    <div className={styles.formula}><small>DAMAGE SCORE</small><strong>ŷ = {inputs[0]} × {weight.toFixed(2)} + {bias.toFixed(2)}</strong><b>{result.output.toFixed(3)}</b></div>
    <NumericSlider label={locale === 'ru' ? 'Вес damage' : 'Damage weight'} value={weight} min={-1} max={2} step={0.05} onChange={(value) => { setWeight(value); onReady(); }} />
    <NumericSlider label="Bias" value={bias} min={-1} max={1} step={0.05} onChange={(value) => { setBias(value); onReady(); }} />
    <div className={styles.signalBar}><span style={{ transform: `scaleX(${Math.min(1, Math.max(0, result.output))})` }} /><small>RISK SIGNAL // {result.output >= 0.5 ? 'DAMAGED' : 'SAFE'}</small></div>
  </div>;
}

function XorLab({ onReady }: { onReady: () => void }) {
  const { locale } = useI18n();
  const [hidden, setHidden] = useState(false);
  const samples = [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0]];
  return <div className={styles.labGrid}>
    <div className={styles.xorGrid}>{samples.map(([a, b, y]) => <span key={`${a}${b}`} data-correct={hidden || a === 0}><b>{a} XOR {b}</b><strong>{hidden ? y : a}</strong></span>)}</div>
    <div className={styles.network}><span>x₁</span><span>x₂</span><b>→</b>{hidden ? <><strong>HIDDEN × 2</strong><b>→</b></> : null}<strong>OUTPUT</strong></div>
    <p>{hidden ? (locale === 'ru' ? 'ACCURACY 4/4 · нелинейная граница построена.' : 'ACCURACY 4/4 · nonlinear boundary constructed.') : (locale === 'ru' ? 'ACCURACY 2/4 · одна прямая не решает XOR.' : 'ACCURACY 2/4 · one line cannot solve XOR.')}</p>
    {!hidden ? <TerminalButton onClick={() => { setHidden(true); onReady(); }}>{locale === 'ru' ? 'Добавить hidden layer' : 'Add hidden layer'}</TerminalButton> : null}
  </div>;
}

function TokenizerLab({ onReady }: { onReady: () => void }) {
  const { locale } = useI18n();
  const [source, setSource] = useState('the researcher researched the station');
  const [steps, setSteps] = useState<ReturnType<typeof runBpeSteps>>([]);
  const final = steps[steps.length - 1]?.sequence ?? [...source];
  return <div className={styles.labGrid}>
    <label className={styles.labInput}><span>{locale === 'ru' ? 'ТЕКСТОВЫЙ ОБРАЗЕЦ' : 'TEXT SAMPLE'}</span><input value={source} onChange={(event) => { setSource(event.target.value); setSteps([]); }} /></label>
    <div className={styles.tokens}>{final.map((token, index) => <span key={`${token}-${index}`}>{token === ' ' ? '␠' : token}</span>)}</div>
    <dl className={styles.metrics}><div><dt>characters</dt><dd>{source.length}</dd></div><div><dt>tokens</dt><dd>{final.length}</dd></div><div><dt>merges</dt><dd>{steps.length}</dd></div></dl>
    <TerminalButton onClick={() => { setSteps(runBpeSteps(source, 8)); onReady(); }}>{locale === 'ru' ? 'Запустить BPE' : 'Run BPE'}</TerminalButton>
  </div>;
}

function AttentionLab({ onReady }: { onReady: () => void }) {
  const { locale } = useI18n();
  const [focus, setFocus] = useState(0.8);
  const scores = [focus, 0.2, 0.45, 0.1];
  const exponentials = scores.map(Math.exp);
  const total = exponentials.reduce((sum, value) => sum + value, 0);
  const weights = exponentials.map((value) => value / total);
  const words = ['animal', 'cross', 'road', 'it'];
  return <div className={styles.labGrid}>
    <div className={styles.attentionMap}>{words.map((word, index) => <span key={word} style={{ opacity: 0.32 + weights[index]! * 1.8 }}><b>{word}</b><i style={{ transform: `scaleY(${weights[index]!})` }} /><small>{weights[index]!.toFixed(2)}</small></span>)}</div>
    <NumericSlider label={locale === 'ru' ? 'Совпадение Query(it) ↔ Key(animal)' : 'Query(it) ↔ Key(animal) match'} value={focus} min={-1} max={2} step={0.05} onChange={(value) => { setFocus(value); onReady(); }} />
    <code>softmax(QKᵀ / √dₖ)V · Σ weights = {weights.reduce((sum, value) => sum + value, 0).toFixed(2)}</code>
  </div>;
}

const transformerOrder = ['RMSNORM', 'ATTENTION', 'RESIDUAL', 'RMSNORM', 'SWIGLU', 'RESIDUAL'];

function TransformerAssemblyLab({ onReady }: { onReady: () => void }) {
  const { locale } = useI18n();
  const [order, setOrder] = useState<string[]>([]);
  const [failed, setFailed] = useState(false);
  const addPart = (part: string) => {
    const next = [...order, part];
    setOrder(next);
    setFailed(false);
    if (next.length === transformerOrder.length) {
      const correct = next.every((value, index) => value === transformerOrder[index]);
      setFailed(!correct);
      if (correct) onReady();
    }
  };
  return <div className={styles.labGrid}>
    <div className={styles.assemblySlots}>{transformerOrder.map((_part, index) => <span key={index} data-filled={Boolean(order[index])}>{order[index] ?? String(index + 1).padStart(2, '0')}</span>)}</div>
    <div className={styles.partTray}>{['RMSNORM', 'ATTENTION', 'RESIDUAL', 'SWIGLU'].map((part) => <button key={part} type="button" disabled={order.length >= transformerOrder.length} onClick={() => addPart(part)}>{part}</button>)}</div>
    {failed ? <p className={styles.failure}>{locale === 'ru' ? 'SIGNAL PATH INVALID. Сбрось сборку и проверь два residual пути.' : 'SIGNAL PATH INVALID. Reset and inspect both residual paths.'}</p> : null}
    {order.length ? <button type="button" className={styles.textButton} onClick={() => { setOrder([]); setFailed(false); }}>{locale === 'ru' ? 'Сбросить сборку' : 'Reset assembly'}</button> : null}
  </div>;
}

function NextTokenLab({ onReady }: { onReady: () => void }) {
  const { locale } = useI18n();
  const [temperature, setTemperature] = useState(1);
  const tokens = ['station', 'model', 'quiet', 'data'];
  const logits = [2.4, 1.8, 0.9, 1.2];
  const probabilities = useMemo(() => {
    const values = logits.map((value) => Math.exp(value / temperature));
    const sum = values.reduce((total, value) => total + value, 0);
    return values.map((value) => value / sum);
  }, [temperature]);
  return <div className={styles.labGrid}>
    <p className={styles.promptLine}>the researcher entered the <b>_</b></p>
    <div className={styles.distribution}>{tokens.map((token, index) => <span key={token}><b>{token}</b><i style={{ transform: `scaleX(${probabilities[index]!})` }} /><small>{(probabilities[index]! * 100).toFixed(1)}%</small></span>)}</div>
    <NumericSlider label={locale === 'ru' ? 'Temperature генерации' : 'Generation temperature'} value={temperature} min={0.25} max={2} step={0.05} onChange={(value) => { setTemperature(value); onReady(); }} />
  </div>;
}

function TrainingLab({ onReady }: { onReady: () => void }) {
  const { locale } = useI18n();
  const status = useModelWorkshopStore((state) => state.status);
  const metrics = useModelWorkshopStore((state) => state.metrics);
  const [error, setError] = useState('');
  const run = async () => {
    setError('');
    try {
      await trainWorkshopModel(192);
      await saveWorkshopCheckpoint('my_llm_checkpoint');
      onReady();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Training failed');
    }
  };
  const latest = metrics[metrics.length - 1];
  return <div className={styles.labGrid}>
    <dl className={styles.metrics}><div><dt>step</dt><dd>{latest?.step ?? 0}</dd></div><div><dt>loss</dt><dd>{latest ? latest.loss.toFixed(3) : '—'}</dd></div><div><dt>tok/s</dt><dd>{latest ? latest.tokensPerSecond.toFixed(0) : '—'}</dd></div><div><dt>memory</dt><dd>{latest ? `${(latest.memoryBytes / 1_048_576).toFixed(2)} MB` : '—'}</dd></div><div><dt>checkpoint</dt><dd>{status === 'checkpointed' ? 'SAVED' : '—'}</dd></div></dl>
    <div className={styles.lossGraph} aria-label="Training loss graph">{metrics.map((metric) => <i key={metric.step} style={{ height: `${Math.max(8, Math.min(100, metric.loss * 22))}%` }} title={`step ${metric.step}: ${metric.loss.toFixed(3)}`} />)}</div>
    {latest ? <blockquote><small>STEP {latest.step}</small>{latest.sample}</blockquote> : <p>{locale === 'ru' ? 'Weights ещё не обновлялись.' : 'Weights have not been updated yet.'}</p>}
    {error ? <p className={styles.failure}>{error}</p> : null}
    {status !== 'training' && status !== 'checkpointed' ? <TerminalButton onClick={run}>{locale === 'ru' ? 'Запустить 192 шага' : 'Run 192 steps'}</TerminalButton> : null}
    {status === 'training' ? <div><p className={styles.running} role="status">TRAINING // WORKER ACTIVE // WEIGHTS UPDATING…</p><TerminalButton onClick={cancelWorkshopTraining}>{locale === 'ru' ? 'Остановить обучение' : 'Cancel training'}</TerminalButton></div> : null}
  </div>;
}

function ModelAssemblyLab({ sceneId, onReady }: { sceneId: string; onReady: () => void }) {
  const { locale } = useI18n();
  const config = useModelWorkshopStore((state) => state.config);
  const updateConfig = useModelWorkshopStore((state) => state.updateConfig);
  const status = useModelWorkshopStore((state) => state.status);
  const sample = useModelWorkshopStore((state) => state.latestSample);
  const [prompt, setPrompt] = useState('the researcher ');
  const [busy, setBusy] = useState(false);
  const [datasets, setDatasets] = useState<Dataset[]>([TINY_STORY_DATASET]);
  const [datasetId, setDatasetId] = useState(TINY_STORY_DATASET.id);
  useEffect(() => { void labDatabase.listDatasets().then((saved) => setDatasets([TINY_STORY_DATASET, ...saved.filter(({ id }) => id !== TINY_STORY_DATASET.id)])); }, []);
  const estimate = tinyTransformerRuntime.estimate(config, 29);
  const terminalMode = sceneId.includes('terminal');
  const execute = async () => {
    setBusy(true);
    if (terminalMode) await generateWorkshopText(prompt, 0.72);
    else await buildWorkshopModel();
    setBusy(false);
    onReady();
  };
  if (terminalMode) return <div className={styles.terminalLab}>
    <p>MODEL LOADED // {status.toUpperCase()}</p>
    <label><span>&gt;</span><input aria-label={locale === 'ru' ? 'Начало текста' : 'Text prompt'} value={prompt} onChange={(event) => setPrompt(event.target.value)} /></label>
    <TerminalButton onClick={execute} disabled={busy}>{busy ? 'GENERATING…' : 'RUN MODEL'}</TerminalButton>
    {sample ? <pre>{sample}</pre> : null}
  </div>;
  return <div className={styles.labGrid}>
    <div className={styles.configSelectors}>
      <label><span>TOKENIZER</span><select value={config.tokenizer ?? 'character'} onChange={(event) => updateConfig({ tokenizer: event.target.value as 'character' | 'bpe' })}><option value="character">CHARACTER</option><option value="bpe">BPE SUBWORD</option></select></label>
      <label><span>DATASET</span><select value={datasetId} onChange={(event) => { const nextId = event.target.value; setDatasetId(nextId); const dataset = datasets.find(({ id }) => id === nextId); if (dataset) setWorkshopDataset(dataset); }}>{datasets.map((dataset) => <option key={dataset.id} value={dataset.id}>{dataset.name}</option>)}</select></label>
    </div>
    <div className={styles.configGrid}>
      <NumericSlider label="CONTEXT" value={config.contextLength} min={16} max={128} step={16} onChange={(value) => updateConfig({ contextLength: value })} />
      <NumericSlider label="D_MODEL" value={config.dModel} min={16} max={128} step={16} onChange={(value) => updateConfig({ dModel: value, heads: value % config.heads === 0 ? config.heads : 4 })} />
      <NumericSlider label="HEADS" value={config.heads} min={1} max={4} step={1} onChange={(value) => { if (config.dModel % value === 0) updateConfig({ heads: value }); }} />
      <NumericSlider label="LAYERS" value={config.layers} min={1} max={4} step={1} onChange={(value) => updateConfig({ layers: value })} />
      <NumericSlider label="LEARNING RATE" value={config.learningRate} min={0.002} max={0.05} step={0.001} onChange={(value) => updateConfig({ learningRate: value })} />
    </div>
    <dl className={styles.metrics}><div><dt>parameters</dt><dd>{estimate.parameters.toLocaleString()}</dd></div><div><dt>memory</dt><dd>{(estimate.memoryBytes / 1_048_576).toFixed(2)} MB</dd></div><div><dt>seed</dt><dd>{config.seed}</dd></div></dl>
    <TerminalButton onClick={execute} disabled={busy}>{busy ? 'ALLOCATING…' : locale === 'ru' ? 'Собрать архитектуру' : 'Build architecture'}</TerminalButton>
  </div>;
}

export function InteractiveLab({ lab, sceneId, onReadyChange }: InteractiveLabProps) {
  useEffect(() => onReadyChange(false), [lab, sceneId, onReadyChange]);
  const ready = () => onReadyChange(true);
  switch (lab) {
    case 'linear-parameter': return <LinearParameterLab onReady={ready} />;
    case 'loss-landscape':
    case 'gradient-step': return <GradientStepView onStep={ready} />;
    case 'xor-network': return <XorLab onReady={ready} />;
    case 'tokenizer': return <TokenizerLab onReady={ready} />;
    case 'embedding': return <TokenizerLab onReady={ready} />;
    case 'attention': return <AttentionLab onReady={ready} />;
    case 'transformer-assembly': return <TransformerAssemblyLab onReady={ready} />;
    case 'next-token': return <NextTokenLab onReady={ready} />;
    case 'training': return <TrainingLab onReady={ready} />;
    case 'model-assembly': return <ModelAssemblyLab sceneId={sceneId} onReady={ready} />;
  }
}
