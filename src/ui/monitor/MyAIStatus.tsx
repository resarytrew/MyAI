import {
  BracketsCurly,
  ChatCircleDots,
  CirclesFour,
  Database,
  Function,
  GraduationCap,
  ShareNetwork,
  TextT,
} from '@phosphor-icons/react';
import { CORE_ORDER } from '../../domain/my-ai/capabilityCatalog';
import type { CoreId, EntityStatus, MyAIData } from '../../domain/my-ai/capabilityTypes';
import { deriveBuildVersion, deriveCoreStatus, deriveSystemStatus } from '../../domain/my-ai/selectors';
import { useMyAIStore } from '../../state/useMyAIStore';
import styles from './MyAIStatus.module.css';
import reference from './MyAIStatusReference.module.css';

const coreIcons = {
  input: Database,
  decision: Function,
  learning: GraduationCap,
  neural: ShareNetwork,
  language: TextT,
  context: ChatCircleDots,
  transformer: CirclesFour,
  'language-model': BracketsCurly,
} satisfies Record<CoreId, typeof Database>;

const statusLabel: Record<EntityStatus, string> = {
  locked: 'LOCKED',
  discovered: 'FOUND',
  experimenting: 'TESTING',
  installed: 'ONLINE',
  mastered: 'MASTERED',
};

function CoreBlueprint({ referenceMode = false, online = 0 }: { referenceMode?: boolean; online?: number }) {
  return (
    <section className={`${styles.blueprint} ${referenceMode ? reference.blueprint : ''}`} aria-label="AI core blueprint">
      <div className={`${styles.blueprintMeta} ${referenceMode ? reference.blueprintMeta : ''}`}>
        <span>CORE</span><strong>BLUEPRINT</strong><small>ID: AI-CORE-{String(online).padStart(2, '0')}</small>
        <span>MODULES</span><small>{String(online).padStart(2, '0')} / 26 ONLINE</small>
      </div>
      <svg viewBox="0 0 220 132" aria-hidden="true" className={`${styles.coreGlyph} ${referenceMode ? reference.coreGlyph : ''}`} data-online={online > 0}>
        <g className={styles.gridLines}><path d="M0 22H220M0 66H220M0 110H220M44 0V132M110 0V132M176 0V132" /></g>
        <g className={styles.coreLines}>
          <path d="M110 18v96M110 31C83 11 50 35 61 61c-17 20 2 50 27 41 8 12 22 3 22-8M110 31c27-20 60 4 49 30 17 20-2 50-27 41-8 12-22 3-22-8" />
          <path d="M72 49c10-13 27-5 27 8M69 72c13-7 29 3 26 17M148 49c-10-13-27-5-27 8M151 72c-13-7-29 3-26 17" />
          <path d="M82 39l9 9-8 11 11 8-9 11 10 11M138 39l-9 9 8 11-11 8 9 11-10 11" />
          <path d="M62 61h18l8 5M158 61h-18l-8 5M63 82h17l8-8M157 82h-17l-8-8" />
          <circle cx="110" cy="66" r="8" /><circle cx="76" cy="48" r="3" /><circle cx="144" cy="48" r="3" />
          <circle cx="82" cy="91" r="3" /><circle cx="138" cy="91" r="3" /><path d="M18 66h35M167 66h35M110 7v11M110 114v11" />
        </g>
      </svg>
      <span className={styles.blueprintCode}>CH // {String(online).padStart(2, '0')}&nbsp;&nbsp; SIG // {online ? 'LIVE' : 'NULL'}</span>
    </section>
  );
}

export function MyAIStatus({ referenceMode = false }: { referenceMode?: boolean }) {
  const data = useMyAIStore() as MyAIData;
  const build = deriveBuildVersion(data.modules);
  const systemStatus = deriveSystemStatus(data);
  const installedCount = Object.values(data.modules).filter(({ status }) => status === 'installed' || status === 'mastered').length;
  const activeCoreId = CORE_ORDER.find((id) => deriveCoreStatus(data, id) !== 'OFFLINE' && deriveCoreStatus(data, id) !== 'VALIDATED')
    ?? CORE_ORDER.find((id) => deriveCoreStatus(data, id) === 'OFFLINE')
    ?? 'language-model';

  return (
    <aside className={`${styles.status} ${referenceMode ? reference.status : ''}`} aria-labelledby="my-ai-title">
      <div className={`${styles.heading} ${referenceMode ? reference.heading : ''}`}>
        <div><h2 id="my-ai-title">MY AI</h2><p>PROJECT MACHINE // AL-00</p></div>
        <strong>BUILD {build}</strong>
      </div>

      <CoreBlueprint referenceMode={referenceMode} online={installedCount} />

      <dl className={`${styles.capabilities} ${referenceMode ? reference.capabilities : ''}`}>
        {CORE_ORDER.map((id) => {
          const core = data.cores[id];
          const Icon = coreIcons[id];
          const coreStatus = deriveCoreStatus(data, id);
          const installedModules = core.moduleIds.filter((moduleId) => ['installed', 'mastered'].includes(data.modules[moduleId].status));
          const activeModule = core.moduleIds.find((moduleId) => data.modules[moduleId].status !== 'locked');
          return (
            <div key={id} className={`${styles.capability} ${referenceMode ? reference.capability : ''}`} data-status={coreStatus.toLowerCase()}>
              <dt><Icon aria-hidden="true" size={18} weight="light" /><span>{core.label}<small>{activeModule ? data.modules[activeModule].label : `${installedModules.length}/${core.moduleIds.length} MODULES`}</small></span></dt>
              <dd aria-label={`${core.label}: ${coreStatus}`}>{coreStatus === 'ONLINE' || coreStatus === 'VALIDATED' ? '✓' : coreStatus === 'ASSEMBLING' ? '◐' : '—'}</dd>
              {id === activeCoreId && installedModules.length > 0 ? <ul>{installedModules.map((moduleId) => <li key={moduleId}>{data.modules[moduleId].label}<b>{statusLabel[data.modules[moduleId].status]}</b></li>)}</ul> : null}
            </div>
          );
        })}
      </dl>

      <p className={`${styles.systemStatus} ${referenceMode ? reference.systemStatus : ''}`}>
        <span>{referenceMode ? 'STATUS' : 'STATUS // MACHINE STATE'}</span><strong>{systemStatus}</strong>
      </p>
    </aside>
  );
}
