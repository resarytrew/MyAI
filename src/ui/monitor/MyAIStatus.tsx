import {
  BracketsCurly,
  ChatCircleDots,
  CirclesFour,
  Cube,
  Database,
  GraduationCap,
  ShareNetwork,
  SlidersHorizontal,
  TextT,
} from '@phosphor-icons/react';
import { CAPABILITY_ORDER } from '../../domain/my-ai/capabilityCatalog';
import type { CapabilityId, CapabilityStatus } from '../../domain/my-ai/capabilityTypes';
import { deriveBuildVersion, deriveSystemStatus } from '../../domain/my-ai/selectors';
import { useI18n } from '../../i18n/useI18n';
import { useMyAIStore } from '../../state/useMyAIStore';
import styles from './MyAIStatus.module.css';
import reference from './MyAIStatusReference.module.css';

const symbols: Record<CapabilityStatus, string> = {
  locked: 'INACTIVE',
  discovered: 'FOUND',
  experimenting: 'TESTING',
  installed: 'ACTIVE',
  mastered: 'MASTERED',
};

const capabilityIcons = {
  data: Database,
  features: Cube,
  parameters: SlidersHorizontal,
  'neural-net': ShareNetwork,
  learning: GraduationCap,
  text: TextT,
  context: ChatCircleDots,
  transformer: CirclesFour,
  'language-model': BracketsCurly,
} satisfies Record<CapabilityId, typeof Database>;

function CoreBlueprint({ referenceMode = false }: { referenceMode?: boolean }) {
  return (
    <section className={`${styles.blueprint} ${referenceMode ? reference.blueprint : ''}`} aria-label="AI core blueprint">
      <div className={`${styles.blueprintMeta} ${referenceMode ? reference.blueprintMeta : ''}`}>
        <span>CORE</span>
        <strong>BLUEPRINT</strong>
        <small>ID: AI-CORE-00</small>
        <span>STATUS</span>
        <small>UNINITIALIZED</small>
      </div>
      <svg viewBox="0 0 220 132" aria-hidden="true" className={`${styles.coreGlyph} ${referenceMode ? reference.coreGlyph : ''}`}>
        <g className={styles.gridLines}>
          <path d="M0 22H220M0 66H220M0 110H220M44 0V132M110 0V132M176 0V132" />
        </g>
        <g className={styles.coreLines}>
          <path d="M110 18v96M110 31C83 11 50 35 61 61c-17 20 2 50 27 41 8 12 22 3 22-8M110 31c27-20 60 4 49 30 17 20-2 50-27 41-8 12-22 3-22-8" />
          <path d="M72 49c10-13 27-5 27 8M69 72c13-7 29 3 26 17M148 49c-10-13-27-5-27 8M151 72c-13-7-29 3-26 17" />
          <circle cx="110" cy="66" r="8" />
          <circle cx="76" cy="48" r="3" />
          <circle cx="144" cy="48" r="3" />
          <circle cx="82" cy="91" r="3" />
          <circle cx="138" cy="91" r="3" />
          <path d="M18 66h35M167 66h35M110 7v11M110 114v11" />
        </g>
        <g className={styles.telemetryBars}>
          <path d="M188 28v16M195 22v22M202 34v10M209 18v26" />
          <path d="M11 105h19M11 111h12M11 117h25" />
        </g>
      </svg>
      <span className={styles.blueprintCode}>CH // 00&nbsp;&nbsp; SIG // NULL</span>
    </section>
  );
}

export function MyAIStatus({ referenceMode = false }: { referenceMode?: boolean }) {
  const { t } = useI18n();
  const capabilities = useMyAIStore((state) => state.capabilities);
  const build = deriveBuildVersion(capabilities);
  const systemStatus = deriveSystemStatus(capabilities);

  return (
    <aside className={`${styles.status} ${referenceMode ? reference.status : ''}`} aria-labelledby="my-ai-title">
      <div className={`${styles.heading} ${referenceMode ? reference.heading : ''}`}>
        <div>
          <h2 id="my-ai-title">MY AI</h2>
          <p>CORE CONSTRUCT // AL-00</p>
        </div>
        <strong>BUILD {build}</strong>
      </div>

      <CoreBlueprint referenceMode={referenceMode} />

      <dl className={`${styles.capabilities} ${referenceMode ? reference.capabilities : ''}`}>
        {CAPABILITY_ORDER.map((id) => {
          const capability = capabilities[id];
          const Icon = capabilityIcons[id];
          return (
            <div key={id} className={`${styles.capability} ${referenceMode ? reference.capability : ''}`} data-status={capability.status}>
              <dt><Icon aria-hidden="true" size={19} weight="light" />{capability.label}</dt>
              <dd data-status={capability.status} aria-label={t(`status.${capability.status}`)}>
                {symbols[capability.status]}
              </dd>
            </div>
          );
        })}
      </dl>

      <p className={`${styles.systemStatus} ${referenceMode ? reference.systemStatus : ''}`}>
        <span>STATUS // CORE STATE</span>
        <strong>{systemStatus}</strong>
      </p>
    </aside>
  );
}
