import { IMessagingService } from "./messagingClient.js";
import { PullRequestHandlers } from "./webhooks.js";

export class Notifier {
  private messagingService: IMessagingService;

  constructor(messagingService: IMessagingService) {
    this.messagingService = messagingService;
  }

  async notifyOpenedAsync(payload: any): Promise<void> {
    const repo = payload.repository.full_name;
    const title = payload.pull_request.title;
    const url = payload.pull_request.html_url;
    const user = payload.pull_request.user.login;

    await this.messagingService.sendMessageAsync(
      `📣 PR が作成されました\n` +
        `リポジトリ: ${repo}\n` +
        `タイトル: ${title}\n` +
        `作成者: ${user}\n` +
        `${url}`,
    );
  }

  async notifyClosedAsync(payload: any): Promise<void> {
    const repo = payload.repository.full_name;
    const title = payload.pull_request.title;
    const url = payload.pull_request.html_url;
    const merged = payload.pull_request.merged;

    const status = merged
      ? "✅ マージされました"
      : "❌ クローズされました（未マージ）";

    await this.messagingService.sendMessageAsync(
      `📣 PR が${status}\n` +
        `リポジトリ: ${repo}\n` +
        `タイトル: ${title}\n` +
        `${url}`,
    );
  }

  async notifySynchronizedAsync(payload: any): Promise<void> {
    const repo = payload.repository.full_name;
    const title = payload.pull_request.title;
    const url = payload.pull_request.html_url;

    await this.messagingService.sendMessageAsync(
      `🔄 PR が更新されました\n` +
        `リポジトリ: ${repo}\n` +
        `タイトル: ${title}\n` +
        `${url}`,
    );
  }
}

// Notifier から Webhook ハンドラを組み立てるだけの関数
export function createPullRequestHandlers(
  notifier: Notifier,
): PullRequestHandlers {
  return {
    onOpened: (payload: any) => notifier.notifyOpenedAsync(payload),
    onClosed: (payload: any) => notifier.notifyClosedAsync(payload),
    onSynchronized: (payload: any) => notifier.notifySynchronizedAsync(payload),
    onError: (error: unknown) => {
      console.error("Webhook handler error:", error);
    },
  };
}
