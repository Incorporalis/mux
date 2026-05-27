/**
 * Backend Telemetry Service — stubbed out.
 * All PostHog calls have been removed; the service is permanently disabled.
 */

import type { PostHog } from "posthog-node";
import type { TelemetryEventPayload } from "@/common/telemetry/payload";

export interface TelemetryEnablementContext {
  env: NodeJS.ProcessEnv;
  isElectron: boolean;
  isPackaged: boolean | null;
}

export function shouldEnableTelemetry(_context: TelemetryEnablementContext): boolean {
  return false;
}

export class TelemetryService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_muxHome?: string) {}

  getPostHogClient(): PostHog | null {
    return null;
  }

  getDistinctId(): string | null {
    return null;
  }

  isEnabled(): boolean {
    return false;
  }

  isExplicitlyDisabled(): boolean {
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setFeatureFlagVariant(_flagKey: string, _variant: string | boolean | null): void {}

  async initialize(): Promise<void> {}

  async getFeatureFlag(_key: string): Promise<boolean | string | undefined> {
    return undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  capture(_payload: TelemetryEventPayload): void {}

  async shutdown(): Promise<void> {}
}
