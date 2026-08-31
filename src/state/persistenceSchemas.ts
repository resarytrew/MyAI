import { CHAPTER_ONE_SCENE_ORDER } from '../domain/journey/sceneRegistry';
import { CAPABILITY_ORDER } from '../domain/my-ai/capabilityCatalog';
import type { CapabilityStatus } from '../domain/my-ai/capabilityTypes';

const sceneIds = new Set<string>(CHAPTER_ONE_SCENE_ORDER);
const statuses = new Set<CapabilityStatus>([
  'locked',
  'discovered',
  'experimenting',
  'installed',
  'mastered',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isPersistedJourneyState(value: unknown): boolean {
  if (!isRecord(value)) return false;
  if (typeof value.currentSceneId !== 'string' || !sceneIds.has(value.currentSceneId)) {
    return false;
  }
  if (
    !Array.isArray(value.completedSceneIds) ||
    !value.completedSceneIds.every(
      (id) => typeof id === 'string' && sceneIds.has(id),
    )
  ) {
    return false;
  }
  if (!isRecord(value.answers)) return false;
  if (value.startedAt !== undefined && typeof value.startedAt !== 'number') return false;
  if (value.completedAt !== undefined && typeof value.completedAt !== 'number') return false;
  return true;
}

export function isPersistedMyAIState(value: unknown): boolean {
  if (!isRecord(value) || !isRecord(value.capabilities)) return false;
  if (!Array.isArray(value.discoveries)) return false;

  for (const id of CAPABILITY_ORDER) {
    const capability = value.capabilities[id];
    if (!isRecord(capability)) return false;
    if (capability.id !== id) return false;
    if (typeof capability.status !== 'string' || !statuses.has(capability.status as CapabilityStatus)) {
      return false;
    }
    if (!Array.isArray(capability.prerequisites)) return false;
  }

  return value.discoveries.every(
    (discovery) =>
      isRecord(discovery) &&
      typeof discovery.id === 'string' &&
      typeof discovery.sceneId === 'string' &&
      typeof discovery.discoveredAt === 'number',
  );
}
