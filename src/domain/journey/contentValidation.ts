import { CONCEPT_CATALOG } from '../knowledge/conceptCatalog';
import type { ModuleId } from '../my-ai/capabilityTypes';
import type { ChapterScene } from './sceneTypes';

export type ContentIssueSeverity = 'error' | 'warning';

export interface ContentIssue {
  severity: ContentIssueSeverity;
  code: 'BROKEN_LINK' | 'UNKNOWN_CONCEPT' | 'INSTALL_BEFORE_DISCOVERY' | 'MISSING_EXPLANATION' | 'STALE_MY_AI' | 'FIELD_TEST_REVEALS_SOLUTION';
  sceneId: string;
  message: string;
}

const conceptIds = new Set(Object.keys(CONCEPT_CATALOG));

export function validateCampaignContent(scenes: readonly ChapterScene[]): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const sceneIds = new Set(scenes.map(({ id }) => id));
  const discoveredModules = new Set<ModuleId>();
  const explainedChapters = new Set<string>();
  let scenesSinceSystemChange = 0;

  for (const scene of scenes) {
    const chapterKey = scene.chapterId ?? `chapter-${scene.chapterNumber ?? 0}`;
    if (scene.primitive === 'explain' || scene.content.deepDive) explainedChapters.add(chapterKey);

    if (scene.nextSceneId && !sceneIds.has(scene.nextSceneId)) {
      issues.push({ severity: 'error', code: 'BROKEN_LINK', sceneId: scene.id, message: `Next scene "${scene.nextSceneId}" does not exist.` });
    }

    const rewards = scene.rewards ?? [];
    const changesSystem = rewards.some(({ type }) => ['add-discovery', 'discover-module', 'start-module-experiment', 'install-module', 'master-module', 'certify-core', 'grant-capability'].includes(type));
    scenesSinceSystemChange = changesSystem ? 0 : scenesSinceSystemChange + 1;
    if (scenesSinceSystemChange > 17) {
      issues.push({ severity: 'warning', code: 'STALE_MY_AI', sceneId: scene.id, message: 'More than 17 scenes passed without a visible MY AI change.' });
      scenesSinceSystemChange = 0;
    }

    for (const reward of rewards) {
      if (reward.type === 'add-discovery') {
        if (!conceptIds.has(reward.discovery.id)) {
          issues.push({ severity: 'error', code: 'UNKNOWN_CONCEPT', sceneId: scene.id, message: `Discovery "${reward.discovery.id}" has no Knowledge Concept.` });
        }
        if (!explainedChapters.has(chapterKey)) {
          issues.push({ severity: 'error', code: 'MISSING_EXPLANATION', sceneId: scene.id, message: `Concept "${reward.discovery.id}" is introduced without explanation or deep dive.` });
        }
      }
      if (reward.type === 'discover-module') discoveredModules.add(reward.moduleId);
      if (reward.type === 'install-module' && !discoveredModules.has(reward.moduleId)) {
        issues.push({ severity: 'error', code: 'INSTALL_BEFORE_DISCOVERY', sceneId: scene.id, message: `Module "${reward.moduleId}" is installed before discovery.` });
      }
    }

    if (scene.primitive === 'field-test' && scene.content.validation?.type === 'exact') {
      const correctLabels = (scene.content.options ?? [])
        .filter(({ id }) => scene.content.validation?.type === 'exact' && scene.content.validation.optionIds.includes(id))
        .flatMap(({ label }) => [label.ru.toLowerCase(), label.en.toLowerCase()]);
      const body = `${scene.content.body.ru} ${scene.content.body.en}`.toLowerCase();
      if (correctLabels.some((label) => label.length > 12 && body.includes(label))) {
        issues.push({ severity: 'warning', code: 'FIELD_TEST_REVEALS_SOLUTION', sceneId: scene.id, message: 'Field Test body appears to reveal the exact validated answer.' });
      }
    }
  }
  return issues;
}

export function getPedagogyCoverage(scenes: readonly ChapterScene[]) {
  const byChapter = new Map<string, Set<string>>();
  for (const scene of scenes) {
    const chapter = scene.chapterId ?? `chapter-${scene.chapterNumber ?? 0}`;
    const coverage = byChapter.get(chapter) ?? new Set<string>();
    coverage.add(scene.primitive ?? 'narrative');
    if (scene.content.lab) coverage.add('activity');
    byChapter.set(chapter, coverage);
  }
  return [...byChapter].map(([chapterId, coverage]) => ({
    chapterId,
    context: coverage.has('briefing') || coverage.has('narrative'),
    explanation: coverage.has('explain'),
    activity: coverage.has('activity') || coverage.has('manipulate'),
    discovery: coverage.has('discovery'),
    fieldTest: coverage.has('field-test'),
  }));
}
