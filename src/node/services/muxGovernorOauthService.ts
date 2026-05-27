/** MuxGovernorOauthService — disabled. All flows return Err immediately. */
import type { Result } from "@/common/types/result";
import { Err } from "@/common/types/result";
import type { Config } from "@/node/config";
import type { PolicyService } from "@/node/services/policyService";
import type { WindowService } from "@/node/services/windowService";

const DISABLED = "Mux Governor is disabled in this build";

export class MuxGovernorOauthService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_config: Config, _windowService?: WindowService, _policyService?: PolicyService) {}

  async startDesktopFlow(_input: {
    governorOrigin: string;
  }): Promise<Result<{ flowId: string; authorizeUrl: string; redirectUri: string }, string>> {
    return Err(DISABLED);
  }

  async waitForDesktopFlow(
    _flowId: string,
    _opts?: { timeoutMs?: number }
  ): Promise<Result<void, string>> {
    return Err(DISABLED);
  }

  async cancelDesktopFlow(_flowId: string): Promise<void> {}

  startServerFlow(_input: {
    governorOrigin: string;
    redirectUri: string;
  }): Result<{ authorizeUrl: string; state: string }, string> {
    return Err(DISABLED);
  }

  async handleServerCallbackAndExchange(_input: {
    state: string | null;
    code: string | null;
    error: string | null;
    errorDescription?: string;
  }): Promise<Result<void, string>> {
    return Err(DISABLED);
  }

  async dispose(): Promise<void> {}
}
