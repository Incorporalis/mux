import { log } from "@/node/services/log";
import type { UpdateStatus } from "@/common/orpc/types";
import type { UpdateChannel } from "@/common/types/project";
import type { Config } from "@/node/config";

export class UpdateService {
  private currentChannel: UpdateChannel;
  private readonly subscribers = new Set<(status: UpdateStatus) => void>();
  private readonly idleStatus: UpdateStatus = { type: "idle" };

  constructor(private readonly config: Config) {
    this.currentChannel = this.config.getUpdateChannel();
    log.debug("UpdateService: auto-updates disabled in this build");
  }

  async check(_options?: { source?: "auto" | "manual" }): Promise<void> {
    // Updates disabled.
  }

  async download(): Promise<void> {
    // Updates disabled.
  }

  install(): void {
    // Updates disabled.
  }

  getChannel(): UpdateChannel {
    return this.currentChannel;
  }

  async setChannel(channel: UpdateChannel): Promise<void> {
    await this.config.setUpdateChannel(channel);
    this.currentChannel = channel;
  }

  onStatus(callback: (status: UpdateStatus) => void): () => void {
    callback(this.idleStatus);
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }
}
