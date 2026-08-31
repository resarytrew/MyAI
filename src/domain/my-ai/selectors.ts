import { CAPABILITY_ORDER } from './capabilityCatalog';
import type { Capability, CapabilityId } from './capabilityTypes';

function isInstalled(capability: Capability): boolean {
  return capability.status === 'installed' || capability.status === 'mastered';
}

export function deriveBuildVersion(
  capabilities: Record<CapabilityId, Capability>,
): string {
  const installed = CAPABILITY_ORDER.filter((id) =>
    isInstalled(capabilities[id]),
  ).length;

  if (installed === CAPABILITY_ORDER.length) return '1.0';
  return `0.${installed}`;
}

export function deriveSystemStatus(
  capabilities: Record<CapabilityId, Capability>,
): 'EMPTY SYSTEM' | 'EXPANDING SYSTEM' | 'INPUT CORE ONLINE' | 'SYSTEM ONLINE' {
  const installed = CAPABILITY_ORDER.filter((id) =>
    isInstalled(capabilities[id]),
  ).length;

  if (installed === 0) return 'EMPTY SYSTEM';
  if (installed >= 5) return 'SYSTEM ONLINE';
  if (installed >= 2) return 'INPUT CORE ONLINE';
  return 'EXPANDING SYSTEM';
}
