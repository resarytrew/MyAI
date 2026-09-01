import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useI18n } from '../../i18n/useI18n';
import { MyAIStatus } from './MyAIStatus';
import { ResetLabButton } from '../common/ResetLabButton';
import { useSettingsStore } from '../../state/useSettingsStore';
import styles from './MonitorShell.module.css';
import industrial from './MonitorShellIndustrial.module.css';
import boot from './MonitorShellBoot.module.css';

interface MonitorShellProps {
  activeProgram: string;
  sceneIndex?: number;
  sceneTotal?: number;
  chapterNumber?: number;
  chapterCode?: string;
  levelLabel?: string;
  focusMode?: boolean;
  children: ReactNode;
}

export function MonitorShell({
  activeProgram,
  sceneIndex = 1,
  sceneTotal = 10,
  chapterNumber = 1,
  chapterCode = 'INITIALIZATION',
  levelLabel = 'LEVEL 01',
  focusMode = false,
  children,
}: MonitorShellProps) {
  const { locale, setLocale, t } = useI18n();
  const settings = useSettingsStore();
  const [soundCaption, setSoundCaption] = useState('');
  const captionTimer = useRef<number>();
  const currentLevel = Math.max(1, Number(levelLabel.match(/\d+/)?.[0] ?? 1));
  const isBootSequence = activeProgram === 'BOOTLOADER' && sceneIndex === 1;
  const programLabel = isBootSequence ? 'AI LAB OS / BOOTLOADER' : activeProgram;

  useEffect(() => () => { if (captionTimer.current) window.clearTimeout(captionTimer.current); }, []);

  const playInterfaceCue = () => {
    if (!settings.sound) return;
    setSoundCaption(locale === 'ru' ? 'ЗВУК: подтверждение интерфейса' : 'SOUND: interface confirmation');
    if (captionTimer.current) window.clearTimeout(captionTimer.current);
    captionTimer.current = window.setTimeout(() => setSoundCaption(''), 1_200);
    try {
      const AudioContextClass = window.AudioContext;
      const audio = new AudioContextClass();
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.frequency.value = 620;
      gain.gain.setValueAtTime(.035, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + .06);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start();
      oscillator.stop(audio.currentTime + .06);
      oscillator.addEventListener('ended', () => { void audio.close(); }, { once: true });
    } catch {
      // Audio may be unavailable under browser privacy policies; the caption still conveys the cue.
    }
  };

  return (
    <main id="main-content" className={`${styles.station} ${industrial.station}`} onClickCapture={(event) => { if ((event.target as HTMLElement).closest('button')) playInterfaceCue(); }}>
      <a className={styles.skipLink} href="#workspace-content">{locale === 'ru' ? 'К содержимому' : 'Skip to content'}</a>
      <span className={styles.soundCaption} role="status" aria-live="polite">{soundCaption}</span>
      {settings.ambient ? <div className={`${styles.ambient} ${industrial.ambient}`} aria-hidden="true" /> : null}
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
                  <div
                    className={`${styles.screen} ${industrial.screen} ${isBootSequence ? boot.screen : ''}`}
                    data-boot-sequence={isBootSequence}
                    data-phosphor={settings.phosphor}
                    data-animations={settings.animations}
                    data-font-scale={settings.fontScale}
                    data-focus-mode={focusMode}
                  >
                    <header className={`${styles.screenHeader} ${isBootSequence ? boot.screenHeader : ''}`}>
                      <p>
                        <span className={styles.liveDot} aria-hidden="true" />
                        <span>{t('activeProgram')}</span>
                        <strong>{programLabel}</strong>
                      </p>
                      <div className={`${styles.chapterStatus} ${isBootSequence ? boot.chapterStatus : ''}`}>
                        <span className={`${styles.chapterTrail} ${isBootSequence ? boot.chapterTrail : ''}`}>
                          {isBootSequence
                            ? <>CHAPTER 01&nbsp;&nbsp;/&nbsp;&nbsp;INITIALIZATION&nbsp;&nbsp;/&nbsp;&nbsp;RESTORE INPUT CORE</>
                            : <>CHAPTER {String(chapterNumber).padStart(2, '0')}&nbsp;&nbsp;/&nbsp;&nbsp;{chapterCode}</>}
                        </span>
                        {!isBootSequence ? (
                          <>
                            <span className={styles.levelReadout}>{levelLabel.toUpperCase()}</span>
                            <span className={styles.levelRail} aria-label={`Chapter ${chapterNumber} progress`}>
                              {Array.from({ length: 8 }, (_, index) => (
                                <i key={index} data-state={index + 1 < currentLevel ? 'done' : index + 1 === currentLevel ? 'active' : 'locked'} />
                              ))}
                            </span>
                          </>
                        ) : null}
                      </div>
                      <div className={`${styles.headerTools} ${isBootSequence ? boot.headerTools : ''}`}>
                        <div className={styles.languageSwitch} aria-label={t('languageLabel')}>
                          <button className={isBootSequence ? boot.languageButton : ''} type="button" aria-pressed={locale === 'ru'} onClick={() => setLocale('ru')}>RU</button>
                          <button className={isBootSequence ? boot.languageButton : ''} type="button" aria-pressed={locale === 'en'} onClick={() => setLocale('en')}>EN</button>
                        </div>
                      </div>
                    </header>

                    <div id="workspace-content" tabIndex={-1} className={`${styles.workspace} ${isBootSequence ? boot.workspace : ''}`} data-focus-mode={focusMode}>
                      <div className={`${styles.scene} ${isBootSequence ? boot.scene : ''}`}>{children}</div>
                      <MyAIStatus referenceMode={isBootSequence} />
                    </div>

                    <div className={industrial.glassReflection} aria-hidden="true" />
                    {settings.scanlines ? <div className={styles.crtScanlines} aria-hidden="true" /> : null}
                    {settings.phosphor !== 'off' ? <div className={styles.crtNoise} aria-hidden="true" /> : null}
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
