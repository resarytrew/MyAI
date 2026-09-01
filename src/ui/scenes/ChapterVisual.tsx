import type { ChapterVisual as ChapterVisualId } from '../../domain/journey/sceneTypes';
import { useI18n } from '../../i18n/useI18n';
import styles from './ChapterScene.module.css';

const rows = (items: Array<[string, string]>) => (
  <dl className={styles.readout}>
    {items.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
  </dl>
);

export function ChapterVisual({ visual }: { visual: ChapterVisualId }) {
  const { locale } = useI18n();
  const ru = locale === 'ru';

  switch (visual) {
    case 'power':
      return <div className={styles.bootVisual}><span>AI LAB OS v2.1</span><strong>RESEARCH STATION 07</strong><small>SECURE TERMINAL // STANDBY</small></div>;
    case 'diagnostics':
      return <div className={styles.terminalVisual}>{rows([['PROCESSOR', 'ONLINE'], ['MEMORY', 'ONLINE'], ['STORAGE', 'ONLINE'], ['SENSOR BUS', 'ONLINE'], ['AI CORE', 'NOT FOUND']])}<p>PROJECT FOUND // MY AI // BUILD 0.0</p></div>;
    case 'identity':
      return <div className={styles.badge}><span>AI LAB ACCESS CONTROL</span><strong>NEW RESEARCHER</strong><small>ACCESS LEVEL 01</small></div>;
    case 'project-map':
      return <div className={styles.flow}><strong>INPUT</strong><span>↓</span><b>?</b><span>↓</span><b>?</b><span>↓</span><strong>LANGUAGE MODEL</strong></div>;
    case 'calculation':
      return <div className={styles.calculation}><code>98 347 × 6 132</code><div><span>HUMAN <b>...</b></span><span>CALCULATOR <b>0.002 s</b></span></div></div>;
    case 'cat-reasoning':
      return <div className={styles.compare}><div><span aria-hidden="true" className={styles.cat}>◉ᴥ◉</span><strong>HUMAN: CAT</strong><small>{ru ? 'КНИГА БЫЛА ТЯЖЁЛОЙ' : 'THE BOOK WAS HEAVY'}</small></div><div><code>ERROR</code><strong>CALCULATOR</strong><small>UNKNOWN INPUT</small></div></div>;
    case 'ai-status':
      return <div className={styles.terminalVisual}>{rows([['CAN CALCULATE', 'YES'], ['CAN RECEIVE DATA', '?'], ['CAN LEARN', 'NO'], ['CAN USE LANGUAGE', 'NO']])}</div>;
    case 'apple':
      return <div className={styles.appleVisual}><span aria-hidden="true">●</span><div><strong>{ru ? 'ЧЕЛОВЕК' : 'HUMAN'}</strong><small>APPLE · FRUIT · RED · FOOD</small></div><div><strong>MY AI</strong><small>?</small></div></div>;
    case 'pixel-grid':
      return <div className={styles.pixelVisual}><div>{Array.from({ length: 36 }, (_, index) => <span key={index} style={{ opacity: 0.22 + ((index * 7) % 10) / 14 }} />)}</div><code>PIXEL [3,4] → R:182 G:43 B:31</code></div>;
    case 'input-map':
      return <div className={styles.inputGrid}><span>CAMERA → PIXELS</span><span>MIC → WAVEFORM</span><span>SENSOR → 23.7</span><span>KEYBOARD → ENCODED TEXT</span></div>;
    case 'three-numbers':
      return <div className={styles.bigNumbers}><strong>23</strong><strong>61</strong><strong>104</strong><small>CONTEXT: UNKNOWN</small></div>;
    case 'context-values':
      return <div className={styles.terminalVisual}>{rows([['AIR TEMPERATURE', '23 °C'], ['HEART RATE', '61 bpm'], ['MASS', '104 g']])}</div>;
    case 'data-information':
      return <div className={styles.pipeline}><div><small>DATA</small><strong>38.7 °C</strong></div><span>→</span><div><small>INFORMATION</small><strong>{ru ? 'ТЕМПЕРАТУРА ВЫСОКАЯ' : 'TEMPERATURE IS HIGH'}</strong></div></div>;
    case 'sensor-values':
      return <div className={styles.sensorStrip}>{['23.1', '23.0', '91.7', '23.2'].map((value) => <span key={value} data-alert={value === '91.7'}>{value}</span>)}</div>;
    case 'data-install':
      return <div className={styles.flowHorizontal}><span>WORLD</span><b>→</b><span>INPUT</span><b>→</b><span>DATA</span><b>→</b><span>MY AI</span></div>;
    case 'car-scan':
      return <div className={styles.scan}><span className={styles.car} aria-hidden="true">▰</span>{rows([['WIDTH', '1.84 m'], ['HEIGHT', '1.62 m'], ['COLOR', 'BLACK'], ['OWNER', 'ID-994'], ['FUEL', '62%']])}</div>;
    case 'task-features':
      return <div className={styles.taskGrid}><span>ROLLER COASTER<strong>HEIGHT</strong></span><span>HELMET<strong>HEAD SIZE</strong></span><span>INTERFACE<strong>LANGUAGE</strong></span></div>;
    case 'feature-table':
      return <div className={styles.tableVisual}><span>OBJECT</span><span>TEMP</span><span>TIME</span><span>COLOR</span><b>A</b><b>31</b><b>12</b><b>PINK</b><b>B</b><b>18</b><b>2</b><b>WHITE</b><b>C</b><b>29</b><b>20</b><b>BROWN</b></div>;
    case 'color-encoding':
      return <div className={styles.colorCodes}><span>RED <b>1</b></span><span>GREEN <b>2</b></span><span>BLUE <b>3</b></span><small>3 × RED ≠ BLUE</small></div>;
    case 'boolean-encoding':
      return <div className={styles.binary}><span>YES<strong>1</strong></span><span>NO<strong>0</strong></span></div>;
    case 'image-matrix':
      return <div className={styles.matrix}>{[12,18,20,24,15,21,91,35,11,48,112,42,8,33,86,29].map((value, index) => <span key={`${value}-${index}`}>{value}</span>)}</div>;
    case 'sound-wave':
      return <div className={styles.wave}><svg viewBox="0 0 600 110" role="img" aria-label={ru ? 'Звуковая волна' : 'Sound wave'}><polyline points="0,55 40,48 80,20 120,86 160,36 200,62 240,12 280,95 320,42 360,58 400,25 440,82 480,46 520,54 560,34 600,55" /></svg><code>0.02 · 0.08 · 0.19 · 0.34 · 0.18 · −0.04</code></div>;
    case 'text-lock':
      return <div className={styles.lock}><strong>“HELLO”</strong><span>ENCODING REQUIRED</span><small>TEXT PROCESSING MODULE // LOCKED</small></div>;
    case 'representation':
      return <div className={styles.pipeline}><div><small>HUMAN</small><strong>{ru ? 'КРАСНОЕ ЯБЛОКО' : 'RED APPLE'}</strong></div><span>→</span><div><small>MACHINE</small><strong>[0.82, 0.34, 0.61]</strong></div></div>;
    case 'capsule-mission':
      return <div className={styles.capsules}><span data-safe="true">SAFE 01</span><span data-safe="true">SAFE 02</span><span data-safe="false">DMG 07</span><span data-safe="false">DMG 09</span></div>;
    case 'capsule-examples':
      return <div className={styles.compare}><div><strong>SAFE</strong>{rows([['damage', '0.03'], ['diameter', '50.1'], ['mass', '101']])}</div><div><strong>DAMAGED</strong>{rows([['damage', '0.74'], ['diameter', '48.9'], ['mass', '97']])}</div></div>;
    case 'input-vector':
      return <div className={styles.vector}><span>damage</span><b>0.03</b><span>diameter</span><b>50.10</b><span>mass</span><b>101.20</b><code>[ 0.03, 50.10, 101.20 ]</code></div>;
    case 'new-object':
      return <div className={styles.terminalVisual}>{rows([['damage', '0.68'], ['diameter', '49.20'], ['mass', '96.30'], ['DECISION', '?']])}</div>;
    case 'decision-gap':
      return <div className={styles.flowHorizontal}><span>DATA ✓</span><b>→</b><span>FEATURES ✓</span><b>→</b><span data-alert="true">DECISION ?</span></div>;
    case 'feature-install':
      return <div className={styles.terminalVisual}>{rows([['FEATURE REGISTRY', 'READY'], ['INPUT VECTOR', 'READY'], ['REPRESENTATION LAYER', 'READY']])}</div>;
    case 'chapter-summary':
      return <div className={styles.summaryVisual}><strong>BUILD 0.0 → BUILD 0.3</strong><span>DATA INTERFACE ✓</span><span>FEATURE SYSTEM ✓</span><span>REPRESENTATION LAYER ✓</span><small>RESEARCH ACCESS // LEVEL 01 → LEVEL 02</small></div>;
    case 'teaser':
      return <div className={styles.teaser}><code>[0.68, 49.20, 96.30]</code><span>DATA RECEIVED ✓</span><span>FEATURES EXTRACTED ✓</span><strong>DECISION: ?</strong><small>NEXT PROGRAM // DECISION ENGINE</small></div>;
  }
}
