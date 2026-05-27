/** CodexOauthService — disabled. All flows return Err immediately. */
import type { Result } from "@/common/types/result";
import { Err } from "@/common/types/result";
import type { Config } from "@/node/config";
import type { ProviderService } from "@/node/services/providerService";
import type { WindowService } from "@/node/services/windowService";
import type { CodexOauthAuth } from "@/node/utils/codexOauthAuth";

const DISABLED = "Codex OAuth is disabled in this build";

export type { CodexOauthAuth };

export class CodexOauthService {
  constructor(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _config: Config,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _providerService: ProviderService,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _windowService?: WindowService
  ) {}

  async disconnect(): Promise<Result<void, string>> {
    return Err(DISABLED);
  }

  async startDesktopFlow(): Promise<Result<{ flowId: string; authorizeUrl: string }, string>> {
    return Err(DISABLED);
  }

  async waitForDesktopFlow(
    _flowId: string,
    _opts?: { timeoutMs?: number }
  ): Promise<Result<void, string>> {
    return Err(DISABLED);
  }

  async cancelDesktopFlow(_flowId: string): Promise<void> {}

  async startDeviceFlow(): Promise<
    Result<
      { flowId: string; userCode: string; verifyUrl: string; intervalSeconds: number },
      string
    >
  > {
    return Err(DISABLED);
  }

  async waitForDeviceFlow(
    _flowId: string,
    _opts?: { timeoutMs?: number }
  ): Promise<Result<void, string>> {
    return Err(DISABLED);
  }

  async cancelDeviceFlow(_flowId: string): Promise<void> {}

  async getValidAuth(): Promise<Result<CodexOauthAuth, string>> {
    return Err(DISABLED);
  }

  async dispose(): Promise<void> {}
}
