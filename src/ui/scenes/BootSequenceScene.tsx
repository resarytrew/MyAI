import { useState } from 'react';
import {
  Brain,
  Circuitry,
  Cpu,
  Database,
  Gauge,
  HardDrives,
  Lightning,
  ShieldCheck,
  ThermometerSimple,
} from '@phosphor-icons/react';
import type { ChapterScene as ChapterSceneData, SceneSubmission } from '../../domain/journey/sceneTypes';
import { useI18n } from '../../i18n/useI18n';
import styles from './BootSequenceScene.module.css';

const diagnostics = [
  { icon: Lightning, label: 'POWER CORE', value: '100%' },
  { icon: Brain, label: 'NEURAL INTERFACE', value: 'OK' },
  { icon: Cpu, label: 'CORES DETECTED', value: '12' },
  { icon: HardDrives, label: 'MEMORY MATRIX', value: '100%' },
  { icon: Circuitry, label: 'I/O PROTOCOL', value: 'OK' },
  { icon: ThermometerSimple, label: 'TEMP. STABILITY', value: '31.0°C' },
  { icon: Database, label: 'DATA BUS', value: '100%' },
  { icon: ShieldCheck, label: 'SECURITY LAYER', value: 'OK' },
  { icon: Gauge, label: 'UPTIME', value: '00:00:03' },
] as const;

export function BootSequenceScene({
  scene,
  onSubmit,
}: {
  scene: ChapterSceneData;
  onSubmit: (submission: SceneSubmission) => void;
}) {
  const { locale } = useI18n();
  const [briefOpen, setBriefOpen] = useState(false);
  const ru = locale === 'ru';

  return (
    <article className={styles.bootScene}>
      <header className={styles.hero}>
        <div className={styles.logoTile} aria-hidden="true">
          <span className={styles.logoMark}><i /></span>
          <small>AI LAB OS<br />v0.0.0.1</small>
        </div>
        <div className={styles.heroCopy}>
          <h1 aria-label={scene.title[locale]}>BOOT</h1>
          <p>AI LAB RESEARCH STATION</p>
        </div>
      </header>

      <section className={styles.consolePanel} aria-label={ru ? 'Системная консоль' : 'System console'}>
        <div className={styles.panelHeader}>
          <span>+ SYSTEM CONSOLE // BOOT SEQUENCE</span>
          <span>LOG: BOOT-00.00.1&nbsp;&nbsp;&nbsp;+</span>
        </div>

        <div className={styles.consoleContent}>
          <div className={styles.consoleText}>
            <p className={styles.bootLines}>
              <span>AI LAB OS loaded successfully.</span>
              <span>Research Station online.</span>
              <span>Intelligence module <b className={styles.dots} /> <strong>MISSING</strong></span>
              <span>Internal memory <b className={styles.dots} /> <strong>EMPTY</strong></span>
            </p>

            <p className={styles.narrative}>
              {ru
                ? <>Эта станция может выполнять эксперименты,<br />но разум внутри неё ещё не создан.<br />Инициализируй ядро и построй первый интеллект.</>
                : <>This station can run experiments,<br />but the mind within is not yet born.<br />Initialize the core and build the first intelligence.</>}
            </p>

            <p className={styles.prompt}>
              {ru ? 'Начать последовательность инициализации?' : 'Shall we begin the initialization sequence?'}
              <span>&gt;&nbsp; <i>_</i></span>
            </p>

            <p className={styles.missionLine}>{scene.content.body[locale]}</p>
          </div>

          <aside className={styles.telemetry} aria-hidden="true">
            <svg viewBox="0 0 92 42" className={styles.signalWave}>
              <path d="M2 25h16l5-8 8 17 8-27 10 22 8-12 8 8h25" />
            </svg>
            <span>SIGNAL<br /><b>STABLE</b></span>
            <span className={styles.telemetryItem}><ThermometerSimple size={14} />TEMP.<b>31.0°C</b></span>
            <span className={styles.telemetryItem}><Lightning size={14} />VOLT.<b>12.1V</b></span>
          </aside>
        </div>
      </section>

      <section className={styles.diagnosticsPanel} aria-label={ru ? 'Диагностика системы' : 'System diagnostics'}>
        <div className={styles.diagnosticsHeader}>
          <span>SYSTEM DIAGNOSTICS</span>
          <div className={styles.trace} aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
          <span>STATUS: NOMINAL <i className={styles.statusDot} /></span>
        </div>
        <div className={styles.diagnosticsGrid}>
          {diagnostics.map(({ icon: Icon, label, value }) => (
            <div key={label} className={styles.diagnosticCell}>
              <Icon size={18} weight="light" aria-hidden="true" />
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </section>

      {briefOpen ? (
        <section className={styles.briefPanel} aria-live="polite">
          <span>MISSION BRIEF // 00</span>
          <p>{scene.content.body[locale]}</p>
          <small>{ru ? 'ЦЕЛЬ: восстановить ядро MY AI и последовательно открыть его способности.' : 'OBJECTIVE: restore the MY AI core and unlock its capabilities step by step.'}</small>
        </section>
      ) : null}

      <footer className={styles.actions}>
        <button
          type="button"
          className={styles.primaryAction}
          aria-label={scene.content.actionLabel[locale]}
          onClick={() => onSubmit({ type: 'chapter-activity' })}
        >
          <span aria-hidden="true">›</span>
          {ru ? 'ИНИЦИАЛИЗИРОВАТЬ СИСТЕМУ' : 'INITIALIZE SYSTEM'}
          <span aria-hidden="true">‹</span>
        </button>
        <button
          type="button"
          className={styles.secondaryAction}
          aria-expanded={briefOpen}
          onClick={() => setBriefOpen((open) => !open)}
        >
          <span className={styles.documentIcon} aria-hidden="true" />
          {ru ? 'ОТКРЫТЬ БРИФ' : 'VIEW BRIEF'}
        </button>
      </footer>
    </article>
  );
}
