export type CapabilityStatus =
  | 'locked'
  | 'discovered'
  | 'experimenting'
  | 'installed'
  | 'mastered';

export type CapabilityId =
  | 'data'
  | 'features'
  | 'parameters'
  | 'neural-net'
  | 'learning'
  | 'text'
  | 'context'
  | 'transformer'
  | 'language-model';

export interface Capability {
  id: CapabilityId;
  label: string;
  status: CapabilityStatus;
  prerequisites: CapabilityId[];
  discoveredAt?: number;
  installedAt?: number;
}

export interface Discovery {
  id: string;
  sceneId: string;
  discoveredAt: number;
}

export interface MyAIData {
  capabilities: Record<CapabilityId, Capability>;
  discoveries: Discovery[];
}
