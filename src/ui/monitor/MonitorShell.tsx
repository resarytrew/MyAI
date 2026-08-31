import type { ReactNode } from 'react';
import { useI18n } from '../../i18n/useI18n';
import { MyAIStatus } from './MyAIStatus';
import { ResetLabButton } from '../common/ResetLabButton';
import styles from './MonitorShell.module.css';
import industrial from './MonitorShellIndustrial.module.css';

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
  const isBootSequence = activeProgram === 'BOOTLOADER' && sceneIndex === 1;
  const programLabel = isBootSequence ? 'AI LAB OS / BOOTLOADER' : activeProgram;

  return (
    <main className={`${styles.station} ${industrial.station}`}>
      <div className={`${styles.ambient} ${industrial.ambient}`} aria-hidden="true" />
      <section className={`${styles.monitor} ${industrial.monitor}`} aria-label={t('monitorLabel')}>
        <div className={industrial.outerPatina} aria-hidden="true" />
        <div className={industrial.innerBody} aria-hidden="true" />

        <span className={`${styles.screw} ${industrial.screw} ${styles.screwTopLeft}`} aria-hidden="true" />
        <span className={`${styles.screw} ${industrial.screw} ${styles.screwTopRight}`} aria-hidden="true" />
        <span className={`${styles.screw} ${industrial.screw} ${styles.screwBottomLeft}`} aria-hidden="true" />
        <span className={`${styles.screw} ${industrial.screw} ${styles.screwBottomRight}`} aria-hidden="true" />

        <div className={`${styles.topPlate} ${industrial.topPlate}`} aria-hidden="true">
          <span className={`${styles.brandMark} ${industrial.brandMark}`}><i /></span>
          <div className={industrial.topIdentity}>
            <strong>AI LAB RESEARCH STATION</strong>
            <small>CORE SYSTEMS / RESEARCH DIVISION</small>
          </div>
          <span className={`${styles.topVent} ${industrial.topVent}`} />
          <small className={industrial.modelIdentity}>
            <span>MODEL AL-26 // PHOSPHOR CONSOLE</span>
            <span>SERIAL 26-7A-11</span>
          </small>
          <span className={`${styles.qrMark} ${industrial.qrMark}`} />
        </div>

        <div className={`${styles.leftRail} ${industrial.leftRail}`} aria-hidden="true">
          <span className={`${styles.railPower} ${industrial.railModule}`}><em>POWER</em><i /></span>
          <span className={industrial.railModule}><i /><em>SYS.</em></span>
          <span className={industrial.railModule}><i /><em>I/O</em></span>
          <span className={industrial.railModule}><i /><em>NET.</em></span>
          <b className={industrial.railService}>
            <strong>CRV-17</strong>
            <small>CHANNEL<br />A-17</small>
            <small>TEMP<br />31°</small>
            <small>VOLT<br />12.1</small>
          </b>
        </div>

        <div className={`${styles.rightRail} ${industrial.rightRail}`} aria-hidden="true">
          <div className={industrial.rightVentStack}>
            {Array.from({ length: 10 }, (_, index) => <span key={index} />)}
          </div>
          <div className={industrial.rightServiceMark}>SERVICE<br />ACCESS</div>
          <b className={industrial.rightServiceSlot} />
        </div>

        <div className={industrial.screenAssembly}>
          <div className={industrial.outerBezel}>
            <div className={industrial.innerBezel}>
              <div className={industrial.screenGlass}>
                <div className={`${styles.screenFrame} ${industrial.screenFrame}`}>
                  <div className={`${styles.screen} ${industrial.screen}`} data-boot-sequence={isBootSequence}>
                    <header className={styles.screenHeader}>
                      <p>
                        <span className={styles.liveDot} aria-hidden="true" />
                        <span>{t('activeProgram')}</span>
                        <strong>{programLabel}</strong>
                      </p>
                      <div className={styles.chapterStatus}>
                        <span className={styles.chapterTrail}>
                          {isBootSequence
                            ? <>CHAPTER 01&nbsp;&nbsp;/&nbsp;&nbsp;INITIALIZATION&nbsp;&nbsp;/&nbsp;&nbsp;RESTORE INPUT CORE</>
                            : <>CHAPTER 01&nbsp;&nbsp;/&nbsp;&nbsp;INITIALIZATION</>}
                        </span>
                        {!isBootSequence ? (
                          <>
                            <span className={styles.levelReadout}>LEVEL {String(currentLevel).padStart(2, '0')} / 06</span>
                            <span className={styles.levelRail} aria-label={`Level ${currentLevel} of 6`}>
                              {Array.from({ length: 6 }, (_, index) => (
                                <i key={index} data-state={index + 1 < currentLevel ? 'done' : index + 1 === currentLevel ? 'active' : 'locked'} />
                              ))}
                            </span>
                          </>
                        ) : null}
                      </div>
                      <div className={styles.headerTools}>
                        <div className={styles.languageSwitch} aria-label={t('languageLabel')}>
                          <button type="button" aria-pressed={locale === 'ru'} onClick={() => setLocale('ru')}>RU</button>
                          <button type="button" aria-pressed={locale === 'en'} onClick={() => setLocale('en')}>EN</button>
                        </div>
                      </div>
                    </header>

                    <div className={styles.workspace}>
                      <div className={styles.scene}>{children}</div>
                      <MyAIStatus />
                    </div>

                    <div className={industrial.glassReflection} aria-hidden="true" />
                    <div className={styles.crtScanlines} aria-hidden="true" />
                    <div className={styles.crtNoise} aria-hidden="true" />
                    <div className={styles.crtVignette} aria-hidden="true" />
                    <div className={styles.powerOn} aria-hidden="true"><span /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className={`${styles.hardwareBar} ${industrial.hardwareBar}`}>
          <span className={`${styles.footerBrand} ${industrial.footerBrand}`}>
            <span className={`${styles.brandMark} ${industrial.brandMark}`} aria-hidden="true"><i /></span>
            <span className={styles.footerCopy}><strong>AI LAB</strong><small>RESEARCH STATION</small></span>
          </span>
          <span className={`${styles.modelPlate} ${industrial.modelPlate}`} aria-hidden="true">
            MOD AL-26<br />PHOSPHOR CONSOLE
          </span>
          <span className={`${styles.hardwareDock} ${industrial.hardwareDock}`} aria-label={t('power')}>
            <i aria-hidden="true" /><b aria-hidden="true" /><i aria-hidden="true" />
          </span>
          <small className={industrial.footerMotto}>STAY CURIOUS. BUILD INTELLIGENCE. // REV. 0.0.1</small>
          <div className={industrial.resetZone}><ResetLabButton /></div>
        </footer>
      </section>
    </main>
  );
}
