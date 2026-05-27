/** MuxGatewayOauthService — disabled. All flows return Err immediately. */
import type { Result } from "@/common/types/result";
import { Err } from "@/common/types/result";
import type { ProviderService } from "@/node/services/providerService";
import type { WindowService } from "@/node/services/windowService";

const DISABLED = "Mux Gateway is disabled in this build";

export class MuxGatewayOauthService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_providerService: ProviderService, _windowService?: WindowService) {}

  async startDesktopFlow(): Promise<
    Result<{ flowId: string; authorizeUrl: string; redirectUri: string }, string>
  > {
    return Err(DISABLED);
  }

  async waitForDesktopFlow(
    _flowId: string,
    _opts?: { timeoutMs?: number }
  ): Promise<Result<void, string>> {
    return Err(DISABLED);
  }

  async cancelDesktopFlow(_flowId: string): Promise<void> {}

  startServerFlow(_input: { redirectUri: string }): { authorizeUrl: string; state: string } {
    throw new Error(DISABLED);
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


