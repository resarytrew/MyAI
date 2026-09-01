import { expect, test, type Page } from '@playwright/test';
import { chapterOneJourney } from '../src/domain/journey/chapterOneJourney';
import type { ChapterScene } from '../src/domain/journey/sceneTypes';

function successfulOptionIds(scene: ChapterScene): string[] {
  if (!scene.content.options) return [];
  const validation = scene.content.validation;
  if (!validation || validation.type === 'any') return [scene.content.options[0]!.id];
  return validation.optionIds;
}

async function completeUiScene(page: Page, scene: ChapterScene) {
  await expect(page.getByRole('heading', { name: scene.title.ru, exact: true })).toBeVisible();

  if (scene.content.input) {
    await page.getByRole('textbox', { name: scene.content.input.label.ru }).fill('Алекс');
  }

  for (const id of successfulOptionIds(scene)) {
    const option = scene.content.options!.find((item) => item.id === id)!;
    const role = scene.content.selectionMode === 'multiple' ? 'checkbox' : 'radio';
    await page.getByRole(role, { name: option.label.ru }).check();
  }

  await page.getByRole('button', { name: scene.content.actionLabel.ru }).click();

  if (scene.content.feedback) {
    await expect(page.getByText(scene.content.feedback.ru)).toBeVisible();
    await page.getByRole('button', { name: 'Продолжить' }).click();
  }
}

test('completes CHAPTER 01 and enters DECISION ENGINE with INPUT CORE BUILD 0.3', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('button', { name: 'RU' }).click();

  for (const scene of chapterOneJourney) await completeUiScene(page, scene);

  await expect(page.getByRole('heading', { name: 'CHAPTER 02 // DECISION ENGINE' })).toBeVisible();
  await expect(page.getByText('INPUT CORE').first()).toBeVisible();
  await expect(page.getByText('BUILD 0.3').first()).toBeVisible();

  const stateBeforeReload = await page.evaluate(() => {
    const journey = JSON.parse(localStorage.getItem('ai-lab-journey')!) as { data: { state: { completedSceneIds: unknown[] } } };
    const myAI = JSON.parse(localStorage.getItem('ai-lab-my-ai')!) as { data: { state: { discoveries: unknown[] } } };
    return { completed: journey.data.state.completedSceneIds.length, discoveries: myAI.data.state.discoveries.length };
  });
  expect(stateBeforeReload).toEqual({ completed: 46, discoveries: 4 });

  await page.reload();
  await expect(page.getByRole('heading', { name: 'CHAPTER 02 // DECISION ENGINE' })).toBeVisible();
  await expect(page.getByText('BUILD 0.3').first()).toBeVisible();
  expect(consoleErrors).toEqual([]);

  await page.getByRole('button', { name: 'RESET LAB' }).click();
  await page.getByRole('button', { name: 'CONFIRM RESET' }).click();
  await expect(page.getByRole('heading', { name: 'AI LAB' })).toBeVisible();
  await expect(page.getByText('BUILD 0.0')).toBeVisible();
});

test('English and mobile layouts remain usable with reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('button', { name: 'EN' }).click();

  await expect(page.getByText('The secure terminal is offline. Power on the research station.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'MY AI' })).toBeVisible();

  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(horizontalOverflow).toBe(false);
  const motionState = await page.evaluate(() => ({
    preference: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    transitionDuration: getComputedStyle(document.querySelector('button')!).transitionDuration,
  }));
  expect(motionState.preference).toBe(true);
  expect(['0s', '0.00001s', '1e-05s']).toContain(motionState.transitionDuration);
});
