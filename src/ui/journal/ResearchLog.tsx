import { CheckCircle, Flask, Lightbulb, Warning, Wrench } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import type { ResearchEntryType } from '../../domain/journal/researchLogTypes';
import { useI18n } from '../../i18n/useI18n';
import { useResearchLogStore } from '../../state/useResearchLogStore';
import view from '../programs/ProgramView.module.css';
import styles from './ResearchLog.module.css';

const icons = {
  hypothesis: Lightbulb,
  experiment: Flask,
  observation: Flask,
  discovery: Lightbulb,
  installation: Wrench,
  failure: Warning,
  certification: CheckCircle,
  generation: CheckCircle,
} satisfies Record<ResearchEntryType, typeof Flask>;

export function ResearchLog() {
  const { locale } = useI18n();
  const { entries, researcherName } = useResearchLogStore();
  const [filter, setFilter] = useState<'all' | 'hypothesis' | 'failure'>('all');
  const visible = useMemo(() => entries.filter((entry) => filter === 'all' || entry.type === filter).reverse(), [entries, filter]);
  const failures = entries.filter(({ type }) => type === 'failure').length;
  const hypotheses = entries.filter(({ type }) => type === 'hypothesis').length;

  return <section className={view.view} aria-labelledby="log-title">
    <header className={view.header}><div><p>PROGRAM // RESEARCH LOG</p><h1 id="log-title">{locale === 'ru' ? 'ЖУРНАЛ ИССЛЕДОВАНИЙ' : 'RESEARCH LOG'}</h1></div><strong>{researcherName ? `RESEARCHER // ${researcherName.toUpperCase()}` : 'RESEARCHER // UNASSIGNED'}</strong></header>
    <dl className={`${view.meta} ${styles.summary}`}><div><dt>entries</dt><dd>{entries.length}</dd></div><div><dt>hypotheses</dt><dd>{hypotheses}</dd></div><div><dt>failed experiments</dt><dd>{failures}</dd></div></dl>
    <div className={view.toolbar}>
      {(['all', 'hypothesis', 'failure'] as const).map((id) => <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)}>{id === 'all' ? (locale === 'ru' ? 'ВСЕ ЗАПИСИ' : 'ALL ENTRIES') : id.toUpperCase()}</button>)}
    </div>
    {visible.length ? <ol className={styles.timeline}>{visible.map((entry, index) => {
      const Icon = icons[entry.type];
      return <li key={entry.id} data-type={entry.type}>
        <span className={styles.index}>{String(entries.length - index).padStart(3, '0')}</span>
        <Icon aria-hidden="true" size={18} weight="light" />
        <article><header><small>CH {String(entry.chapterNumber).padStart(2, '0')} // {entry.type.toUpperCase()}</small><time dateTime={new Date(entry.createdAt).toISOString()}>{new Date(entry.createdAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</time></header><h2>{entry.title[locale]}</h2><p>{entry.detail[locale]}</p>{entry.answer ? <blockquote><span>{entry.type === 'hypothesis' ? 'BEFORE RUN' : 'INPUT'}</span>{entry.answer}</blockquote> : null}</article>
      </li>;
    })}</ol> : <div className={view.empty}><p>{locale === 'ru' ? 'Журнал пуст. Гипотезы, эксперименты и открытия будут записываться автоматически.' : 'The log is empty. Hypotheses, experiments, and discoveries are recorded automatically.'}</p></div>}
  </section>;
}
