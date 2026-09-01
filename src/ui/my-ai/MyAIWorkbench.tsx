import { BracketsCurly, CheckCircle, Function, Scan, Wrench } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import { CORE_ORDER, MODULE_ORDER } from '../../domain/my-ai/capabilityCatalog';
import type { ModuleId } from '../../domain/my-ai/capabilityTypes';
import { deriveBuildVersion, deriveCoreStatus } from '../../domain/my-ai/selectors';
import { useI18n } from '../../i18n/useI18n';
import { useMyAIStore } from '../../state/useMyAIStore';
import view from '../programs/ProgramView.module.css';
import styles from './MyAIWorkbench.module.css';

type XrayMode = 'visual' | 'math' | 'code';

const representation: Record<ModuleId, { math: string; code: string }> = Object.fromEntries(MODULE_ORDER.map((id) => [id, {
  math: id === 'attention-module' ? 'softmax(QKᵀ / √dₖ)V' : id === 'neuron' ? 'y = φ(Wx + b)' : id === 'loss-analyzer' ? 'L = (ŷ - y)²' : id === 'rmsnorm' ? 'x / √(mean(x²)+ε)' : 'state′ = module(state)',
  code: id === 'attention-module' ? 'weights = softmax(q @ k.T / sqrt(dk))\noutput = weights @ v' : id === 'neuron' ? 'output = activation(x @ weight + bias)' : id === 'loss-analyzer' ? 'loss = (prediction - target) ** 2' : `next_state = ${id.replaceAll('-', '_')}(state)`,
}])) as Record<ModuleId, { math: string; code: string }>;

export function MyAIWorkbench() {
  const { locale } = useI18n();
  const data = useMyAIStore();
  const installed = MODULE_ORDER.filter((id) => ['installed', 'mastered'].includes(data.modules[id].status));
  const activeModules = MODULE_ORDER.filter((id) => data.modules[id].status !== 'locked');
  const [selectedModule, setSelectedModule] = useState<ModuleId>();
  const resolvedModule = selectedModule && activeModules.includes(selectedModule) ? selectedModule : activeModules.at(-1);
  const [mode, setMode] = useState<XrayMode>('visual');
  const mathUnlocked = installed.length >= 3;
  const codeUnlocked = installed.length >= 10;
  const build = deriveBuildVersion(data.modules);
  const lastBuilds = useMemo(() => data.buildHistory.slice(-8).reverse(), [data.buildHistory]);

  return <section className={view.view} aria-labelledby="workbench-title">
    <header className={view.header}><div><p>PROGRAM // MY AI SYSTEM</p><h1 id="workbench-title">MY AI // BUILD {build}</h1></div><strong>{installed.length} / {MODULE_ORDER.length} MODULES ONLINE</strong></header>
    <div className={styles.coreGrid}>{CORE_ORDER.map((coreId) => {
      const core = data.cores[coreId];
      const coreStatus = deriveCoreStatus(data, coreId);
      return <section key={coreId} data-status={coreStatus.toLowerCase()}><header><div><span>{String(CORE_ORDER.indexOf(coreId) + 1).padStart(2, '0')}</span><h2>{core.label}</h2></div><strong>{coreStatus}</strong></header><ul>{core.moduleIds.map((moduleId) => {
        const module = data.modules[moduleId];
        return <li key={moduleId} data-status={module.status}><button type="button" disabled={module.status === 'locked'} onClick={() => setSelectedModule(moduleId)} aria-pressed={resolvedModule === moduleId}><Wrench aria-hidden="true" size={13} /><span>{module.label}</span><b>{module.status === 'installed' || module.status === 'mastered' ? '✓' : module.status === 'locked' ? '—' : '◐'}</b></button></li>;
      })}</ul></section>;
    })}</div>

    <div className={view.split}>
      <section className={`${view.panel} ${styles.xray}`}>
        <header><div><small>X-RAY SYSTEM</small><h2>{resolvedModule ? data.modules[resolvedModule].label : 'NO MODULE SELECTED'}</h2></div><Scan aria-hidden="true" size={28} weight="light" /></header>
        <div className={view.toolbar}>{(['visual', 'math', 'code'] as const).map((id) => <button key={id} type="button" aria-pressed={mode === id} disabled={(id === 'math' && !mathUnlocked) || (id === 'code' && !codeUnlocked)} onClick={() => setMode(id)}>{id.toUpperCase()}{(id === 'math' && !mathUnlocked) || (id === 'code' && !codeUnlocked) ? ' // LOCKED' : ''}</button>)}</div>
        {resolvedModule ? <div className={styles.xrayCanvas} data-mode={mode}>
          {mode === 'visual' ? <div className={styles.moduleDiagram}><span>INPUT STATE</span><b>→</b><strong>{data.modules[resolvedModule].label.toUpperCase()}</strong><b>→</b><span>OUTPUT STATE</span></div> : null}
          {mode === 'math' ? <><Function aria-hidden="true" size={28} /><code>{representation[resolvedModule].math}</code></> : null}
          {mode === 'code' ? <><BracketsCurly aria-hidden="true" size={28} /><pre>{representation[resolvedModule].code}</pre></> : null}
        </div> : <p>{locale === 'ru' ? 'Установи первый модуль, чтобы открыть X-Ray.' : 'Install the first module to unlock X-Ray.'}</p>}
      </section>

      <section className={`${view.panel} ${styles.history}`}><h2>{locale === 'ru' ? 'ИСТОРИЯ СБОРКИ' : 'BUILD HISTORY'}</h2>{lastBuilds.length ? <ol>{lastBuilds.map((record) => <li key={`${record.moduleId}-${record.installedAt}`}><span>{record.build}</span><div><strong>{data.modules[record.moduleId].label}</strong><small>{new Date(record.installedAt).toLocaleString(locale)}</small></div><CheckCircle aria-hidden="true" size={16} /></li>)}</ol> : <p>0.0 // EMPTY SYSTEM</p>}</section>
    </div>

    <section className={`${view.panel} ${styles.capabilityList}`}><h2>{locale === 'ru' ? 'СПОСОБНОСТИ МАШИНЫ' : 'MACHINE CAPABILITIES'}</h2><div>{Object.values(data.capabilities).map((capability) => <span key={capability.id} data-online={capability.status === 'installed' || capability.status === 'mastered'}>{capability.status === 'installed' || capability.status === 'mastered' ? '✓' : '—'} {capability.label}</span>)}</div></section>
  </section>;
}
