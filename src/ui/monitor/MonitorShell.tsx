import type { ReactNode } from 'react';
import { useI18n } from '../../i18n/useI18n';
import { MyAIStatus } from './MyAIStatus';
import { ResetLabButton } from '../common/ResetLabButton';
import styles from './MonitorShell.module.css';

interface MonitorShellProps {
  activeProgram: string;
  sceneIndex?: number;
  sceneTotal?: number;
  children: ReactNode;
}

export function MonitorShell({
  activeProgram,
  sceneIndex = 1,
  sceneTotal = 10,
  children,
}: MonitorShellProps) {
  const { locale, setLocale, t } = useI18n();
  const currentLevel = Math.min(6, Math.max(1, Math.ceil((sceneIndex / sceneTotal) * 6)));

  return (
    <main className={styles.station}>
      <div className={styles.ambient} aria-hidden="true" />
      <section className={styles.monitor} aria-label={t('monitorLabel')}>
        <span className={`${styles.screw} ${styles.screwTopLeft}`} aria-hidden="true" />
        <span className={`${styles.screw} ${styles.screwTopRight}`} aria-hidden="true" />
        <span className={`${styles.screw} ${styles.screwBottomLeft}`} aria-hidden="true" />
        <span className={`${styles.screw} ${styles.screwBottomRight}`} aria-hidden="true" />

        <div className={styles.topPlate} aria-hidden="true">
          <span className={styles.brandMark}><i /></span>
          <strong>AI LAB RESEARCH STATION</strong>
          <span className={styles.topVent} />
          <small><span>MODEL AL-26 // PHOSPHOR CONSOLE</span><span>SERIAL 26-7A-11</span></small>
          <span className={styles.qrMark} />
        </div>

        <div className={styles.leftRail} aria-hidden="true">
          <span className={styles.railPower}>POWER<i /></span>
          <span><i />SYS.</span>
          <span><i />I/O</span>
          <span><i />NET.</span>
          <b>
            <strong>CRV-17</strong>
            <small>CHANNEL<br />A-17</small>
            <small>TEMP<br />31°</small>
            <small>VOLT<br />12.1</small>
          </b>
        </div>
        <div className={styles.rightRail} aria-hidden="true">
          {Array.from({ length: 9 }, (_, index) => <span key={index} />)}
          <b />
        </div>

        <div className={styles.screenFrame}>
          <div className={styles.screen}>
            <header className={styles.screenHeader}>
              <p>
                <span className={styles.liveDot} aria-hidden="true" />
                <span>{t('activeProgram')}</span>
                <strong>{activeProgram}</strong>
              </p>
              <div className={styles.chapterStatus}>
                <span className={styles.chapterTrail}>CHAPTER 01&nbsp;&nbsp;/&nbsp;&nbsp;INITIALIZATION</span>
                <span className={styles.levelReadout}>LEVEL {String(currentLevel).padStart(2, '0')} / 06</span>
                <span className={styles.levelRail} aria-label={`Level ${currentLevel} of 6`}>
                  {Array.from({ length: 6 }, (_, index) => (
                    <i key={index} data-state={index + 1 < currentLevel ? 'done' : index + 1 === currentLevel ? 'active' : 'locked'} />
                  ))}
                </span>
              </div>
              <div className={styles.headerTools}>
                <div className={styles.languageSwitch} aria-label={t('languageLabel')}>
                  <button
                    type="button"
                    aria-pressed={locale === 'ru'}
                    onClick={() => setLocale('ru')}
                  >
                    RU
                  </button>
                  <button
                    type="button"
                    aria-pressed={locale === 'en'}
                    onClick={() => setLocale('en')}
                  >
                    EN
                  </button>
                </div>
              </div>
            </header>

            <div className={styles.workspace}>
              <div className={styles.scene}>{children}</div>
              <MyAIStatus />
            </div>

            <div className={styles.crtScanlines} aria-hidden="true" />
            <div className={styles.crtNoise} aria-hidden="true" />
            <div className={styles.crtVignette} aria-hidden="true" />
            <div className={styles.powerOn} aria-hidden="true">
              <span />
            </div>
          </div>
        </div>

        <footer className={styles.hardwareBar}>
          <span className={styles.footerBrand}>
            <span className={styles.brandMark} aria-hidden="true"><i /></span>
            <span className={styles.footerCopy}><strong>AI LAB</strong><small>RESEARCH STATION</small></span>
          </span>
          <span className={styles.modelPlate} aria-hidden="true">
            MOD AL-26<br />PHOSPHOR CONSOLE
          </span>
          <span className={styles.hardwareDock} aria-label={t('power')}>
            <i aria-hidden="true" />
            <b aria-hidden="true" />
            <i aria-hidden="true" />
          </span>
          <small>STAY CURIOUS. BUILD INTELLIGENCE. // REV. 0.0.1</small>
          <ResetLabButton />
        </footer>
      </section>
    </main>
  );
}
