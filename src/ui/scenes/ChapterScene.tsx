import { useEffect, useState } from 'react';
import type { ChapterScene as ChapterSceneData, SceneSubmission } from '../../domain/journey/sceneTypes';
import { useI18n } from '../../i18n/useI18n';
import { TerminalButton } from '../common/TerminalButton';
import { InteractiveLab } from '../labs/InteractiveLab';
import { ChapterVisual } from './ChapterVisual';
import { SceneLayout } from './SceneLayout';
import styles from './ChapterScene.module.css';

export function ChapterScene({
  scene,
  onSubmit,
}: {
  scene: ChapterSceneData;
  onSubmit: (submission: SceneSubmission) => void;
}) {
  const { locale } = useI18n();
  const [selected, setSelected] = useState<string[]>([]);
  const [textValue, setTextValue] = useState('');
  const [deepOpen, setDeepOpen] = useState(false);
  const [labReady, setLabReady] = useState(false);

  useEffect(() => {
    setSelected([]);
    setTextValue('');
    setDeepOpen(false);
    setLabReady(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [scene.id]);

  const toggleOption = (id: string) => {
    setSelected((current) => {
      if (scene.content.selectionMode !== 'multiple') return [id];
      return current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    });
  };

  const canSubmit = scene.content.lab
    ? labReady
    : scene.content.input
    ? textValue.trim().length > 0
    : scene.content.options
      ? selected.length > 0
      : true;

  return (
    <SceneLayout
      title={scene.title[locale]}
      program={scene.program}
      tone={scene.content.tone}
      actions={
        <TerminalButton
          disabled={!canSubmit}
          onClick={() => onSubmit({
            type: 'chapter-activity',
            ...(selected.length ? { selectedOptionIds: selected } : {}),
            ...(textValue.trim() ? { textValue: textValue.trim() } : {}),
          })}
        >
          {scene.content.actionLabel[locale]}
        </TerminalButton>
      }
    >
      {scene.content.eyebrow ? <p className={styles.eyebrow}>{scene.content.eyebrow[locale]}</p> : null}
      <p className={styles.body}>{scene.content.body[locale]}</p>

      {scene.content.visual ? <ChapterVisual visual={scene.content.visual} /> : null}

      {scene.content.lab ? <InteractiveLab lab={scene.content.lab} sceneId={scene.id} onReadyChange={setLabReady} /> : null}

      {scene.content.input ? (
        <label className={styles.textInput}>
          <span>{scene.content.input.label[locale]}</span>
          <input
            autoComplete="name"
            maxLength={scene.content.input.maxLength}
            placeholder={scene.content.input.placeholder[locale]}
            value={textValue}
            onChange={(event) => setTextValue(event.target.value)}
          />
        </label>
      ) : null}

      {scene.content.options ? (
        <fieldset className={styles.options}>
          {scene.content.prompt ? <legend>{scene.content.prompt[locale]}</legend> : null}
          {scene.content.options.map((item, index) => {
            const checked = selected.includes(item.id);
            return (
              <label key={item.id} className={styles.option} data-checked={checked}>
                <input
                  type={scene.content.selectionMode === 'multiple' ? 'checkbox' : 'radio'}
                  name={`chapter-${scene.id}`}
                  checked={checked}
                  onChange={() => toggleOption(item.id)}
                />
                <span className={styles.optionIndex} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <span className={styles.optionCopy}>
                  <strong>{item.label[locale]}</strong>
                  {item.detail ? <small>{item.detail[locale]}</small> : null}
                </span>
              </label>
            );
          })}
        </fieldset>
      ) : null}

      {scene.content.deepDive ? (
        <section className={styles.deepDive}>
          <button type="button" aria-expanded={deepOpen} onClick={() => setDeepOpen((open) => !open)}>
            {locale === 'ru' ? '[ РАЗОБРАТЬСЯ ГЛУБЖЕ ]' : '[ GO DEEPER ]'}
          </button>
          {deepOpen ? <p>{scene.content.deepDive[locale]}</p> : null}
        </section>
      ) : null}
    </SceneLayout>
  );
}
