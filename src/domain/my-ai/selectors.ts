import { CORE_ORDER, MODULE_DEFINITIONS } from './capabilityCatalog';
import type { CoreId, EntityStatus, MyAIData } from './capabilityTypes';

const installed = (status: EntityStatus) => status === 'installed' || status === 'mastered';

export function deriveBuildVersion(modules: MyAIData['modules']): string {
  let build = '0.0';
  for (const definition of MODULE_DEFINITIONS) {
    if (!installed(modules[definition.id].status)) break;
    build = definition.build;
  }
  return build;
}

export function deriveCoreStatus(data: MyAIData, coreId: CoreId): 'OFFLINE' | 'ASSEMBLING' | 'ONLINE' | 'VALIDATED' {
  const core = data.cores[coreId];
  if (core.validatedAt) return 'VALIDATED';
  const installedCount = core.moduleIds.filter((id) => installed(data.modules[id].status)).length;
  if (installedCount === core.moduleIds.length) return 'ONLINE';
  if (installedCount > 0 || core.moduleIds.some((id) => data.modules[id].status !== 'locked')) return 'ASSEMBLING';
  return 'OFFLINE';
}

export function deriveSystemStatus(data: MyAIData): 'EMPTY SYSTEM' | 'EXPANDING SYSTEM' | 'INPUT CORE ONLINE' | 'SYSTEM ONLINE' | 'READY' {
  const build = deriveBuildVersion(data.modules);
  if (build === '0.0') return 'EMPTY SYSTEM';
  if (build === '1.0') return 'READY';
  if (deriveCoreStatus(data, 'input') === 'ONLINE' || deriveCoreStatus(data, 'input') === 'VALIDATED') {
    const onlineCores = CORE_ORDER.filter((id) => ['ONLINE', 'VALIDATED'].includes(deriveCoreStatus(data, id))).length;
    return onlineCores > 1 ? 'SYSTEM ONLINE' : 'INPUT CORE ONLINE';
  }
  return 'EXPANDING SYSTEM';
}

export function installedModuleCount(data: MyAIData): number {
  return MODULE_DEFINITIONS.filter(({ id }) => installed(data.modules[id].status)).length;
}
