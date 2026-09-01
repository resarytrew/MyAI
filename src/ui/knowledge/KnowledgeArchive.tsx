import { ArrowCounterClockwise, BracketsCurly, Function, Graph, Lightbulb, Wrench } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import { CHAPTERS } from '../../domain/campaign/campaignCatalog';
import { CONCEPT_CATALOG, CONCEPT_ORDER } from '../../domain/knowledge/conceptCatalog';
import { useI18n } from '../../i18n/useI18n';
import { useMyAIStore } from '../../state/useMyAIStore';
import view from '../programs/ProgramView.module.css';
import styles from './KnowledgeArchive.module.css';

export function KnowledgeArchive({ onReplay }: { onReplay: (sceneId: string) => void }) {
  const { locale } = useI18n();
  const discoveries = useMyAIStore((state) => state.discoveries);
  const discoveredIds = useMemo(() => new Set(discoveries.map(({ id }) => id)), [discoveries]);
  const available = CONCEPT_ORDER.filter((id) => discoveredIds.has(id));
  const [selectedId, setSelectedId] = useState<string>();
  const resolvedId = selectedId && discoveredIds.has(selectedId) ? selectedId : available[0];
  const concept = resolvedId ? CONCEPT_CATALOG[resolvedId] : undefined;

  return <section className={view.view} aria-labelledby="archive-title">
    <header className={view.header}><div><p>PROGRAM // KNOWLEDGE ARCHIVE</p><h1 id="archive-title">{locale === 'ru' ? 'АРХИВ ЗНАНИЙ' : 'KNOWLEDGE ARCHIVE'}</h1></div><strong>DISCOVERIES {discoveries.length} / {CONCEPT_ORDER.length}</strong></header>
    <div className={styles.map} aria-label={locale === 'ru' ? 'Карта понятий' : 'Concept map'}>
      {CHAPTERS.map((chapter) => {
        const concepts = CONCEPT_ORDER.map((id) => CONCEPT_CATALOG[id]).filter((item) => item?.chapterId === chapter.id);
        return <section key={chapter.id}>
          <header><span>{String(chapter.number).padStart(2, '0')}</span><strong>{chapter.code}</strong></header>
          <div>{concepts.slice(0, 8).map((item) => {
            if (!item) return null;
            const unlocked = discoveredIds.has(item.id);
            return <button key={item.id} type="button" disabled={!unlocked} aria-pressed={resolvedId === item.id} onClick={() => setSelectedId(item.id)}>{unlocked ? item.label[locale] : '████████'}</button>;
          })}</div>
        </section>;
      })}
    </div>

    {concept ? <article className={styles.entry}>
      <header><div><small>CONCEPT // {concept.chapterId.toUpperCase()}</small><h2>{concept.label[locale]}</h2></div><Graph aria-hidden="true" size={32} weight="light" /></header>
      <div className={styles.entryGrid}>
        <section><h3><Lightbulb aria-hidden="true" /> WHY</h3><p>{concept.why[locale]}</p></section>
        <section><h3>INTUITION</h3><p>{concept.intuition[locale]}</p></section>
        <section><h3>FORMAL</h3><p>{concept.formal[locale]}</p>{concept.math ? <code>{concept.math}</code> : null}</section>
        <section><h3>EXAMPLE</h3><p>{concept.example[locale]}</p></section>
        <section data-locked={!concept.math}><h3><Function aria-hidden="true" /> MATH</h3>{concept.math ? <code>{concept.math}</code> : <p>LOCKED // CHAPTER 02</p>}</section>
        <section data-locked={!concept.code}><h3><BracketsCurly aria-hidden="true" /> CODE</h3>{concept.code ? <pre>{concept.code}</pre> : <p>LOCKED // CHAPTER 04</p>}</section>
        <section><h3><Wrench aria-hidden="true" /> MY AI</h3><p>{concept.moduleId ? `${concept.moduleId.toUpperCase()} // ${useMyAIStore.getState().modules[concept.moduleId].status.toUpperCase()}` : 'KNOWLEDGE ONLY'}</p></section>
        <section><h3>RELATED</h3><p>{concept.related.filter((id) => CONCEPT_CATALOG[id]).map((id) => CONCEPT_CATALOG[id]!.label[locale]).join(' · ') || '—'}</p></section>
      </div>
      {concept.replaySceneId ? <button type="button" className={view.textButton} onClick={() => onReplay(concept.replaySceneId!)}><ArrowCounterClockwise aria-hidden="true" /> {locale === 'ru' ? 'ПОВТОРИТЬ ЭКСПЕРИМЕНТ' : 'REPLAY EXPERIMENT'}</button> : null}
    </article> : <div className={view.empty}><p>{locale === 'ru' ? 'ARCHIVE CLASSIFIED. Первое открытие появится после диагностики.' : 'ARCHIVE CLASSIFIED. The first discovery appears after diagnostics.'}</p></div>}
  </section>;
}
