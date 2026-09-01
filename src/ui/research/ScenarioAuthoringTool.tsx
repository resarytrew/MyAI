import { useMemo, useState } from 'react';
import { validateCampaignContent } from '../../domain/journey/contentValidation';
import type { ChapterScene, ScenePrimitive } from '../../domain/journey/sceneTypes';
import { useI18n } from '../../i18n/useI18n';
import view from '../programs/ProgramView.module.css';
import { ChapterScene as ChapterSceneView } from '../scenes/ChapterScene';
import styles from './ResearchLab.module.css';

const primitives: ScenePrimitive[] = ['briefing', 'explain', 'prediction', 'manipulate', 'observe', 'discovery', 'install', 'reflection', 'field-test'];

export function ScenarioAuthoringTool() {
  const { locale } = useI18n();
  const [title, setTitle] = useState('NEW RESEARCH SCENE');
  const [body, setBody] = useState('Describe one observable problem and let the researcher act on it.');
  const [prompt, setPrompt] = useState('What do you predict before the run?');
  const [deepDive, setDeepDive] = useState('Optional formal explanation lives here.');
  const [primitive, setPrimitive] = useState<ScenePrimitive>('prediction');
  const draft = useMemo<ChapterScene>(() => ({
    id: 'authoring-preview', type: 'chapter', chapterId: 'authoring', chapterNumber: 0, levelId: 'draft', primitive, program: 'SYSTEM DIAGNOSTICS',
    title: { ru: title, en: title },
    content: {
      body: { ru: body, en: body }, prompt: { ru: prompt, en: prompt }, deepDive: { ru: deepDive, en: deepDive },
      actionLabel: { ru: 'Предпросмотр действия', en: 'Preview action' }, tone: primitive === 'field-test' ? 'challenge' : 'neutral',
      ...(primitive === 'prediction' || primitive === 'field-test' ? { options: [{ id: 'a', label: { ru: 'Гипотеза A', en: 'Hypothesis A' } }, { id: 'b', label: { ru: 'Гипотеза B', en: 'Hypothesis B' } }], selectionMode: 'single' as const, validation: { type: 'any' as const } } : {}),
    },
  }), [body, deepDive, primitive, prompt, title]);
  const issues = validateCampaignContent([draft]);

  return <section className={styles.authoring} aria-labelledby="authoring-title">
    <header><div><small>INTERNAL TOOL // DATA-DRIVEN</small><h2 id="authoring-title">SCENARIO AUTHORING</h2></div><strong>{issues.length ? `${issues.length} LINT` : 'VALID'}</strong></header>
    <div className={styles.authoringGrid}>
      <form onSubmit={(event) => event.preventDefault()}>
        <label><span>PRIMITIVE</span><select value={primitive} onChange={(event) => setPrimitive(event.target.value as ScenePrimitive)}>{primitives.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label><span>TITLE</span><input value={title} onChange={(event) => setTitle(event.target.value)} /></label>
        <label><span>STORY / EXPLANATION</span><textarea value={body} onChange={(event) => setBody(event.target.value)} /></label>
        <label><span>PROMPT / VALIDATION CONTEXT</span><input value={prompt} onChange={(event) => setPrompt(event.target.value)} /></label>
        <label><span>DEEP DIVE / CONCEPT</span><textarea value={deepDive} onChange={(event) => setDeepDive(event.target.value)} /></label>
        <p className={view.eyebrow}>{locale === 'ru' ? 'Предпросмотр обновляется без перезагрузки.' : 'Preview updates without reload.'}</p>
      </form>
      <div className={styles.preview} aria-label="Scene preview"><ChapterSceneView scene={draft} onSubmit={() => undefined} /></div>
    </div>
  </section>;
}
