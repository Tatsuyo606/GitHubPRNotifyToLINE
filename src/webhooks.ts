import { Webhooks } from "@octokit/webhooks";

export type PullRequestHandlers = {
  onOpened?: (payload: any) => void | Promise<void>;
  onClosed?: (payload: any) => void | Promise<void>;
  onSynchronized?: (payload: any) => void | Promise<void>;
  onError?: (error: unknown) => void;
};

export const createWebhooks = (secret: string): Webhooks => {
  // Webhooksインスタンスの作成
  const webhooks = new Webhooks({
    secret,
  });

  return webhooks;
};

export const addPullRequestHandlers = (
  webhooks: Webhooks,
  handlers: PullRequestHandlers,
) => {
  if (handlers.onOpened) {
    webhooks.on("pull_request.opened", async ({ payload }) => {
      await handlers.onOpened!(payload);
    });
  }
  if (handlers.onClosed) {
    webhooks.on("pull_request.closed", async ({ payload }) => {
      await handlers.onClosed!(payload);
    });
  }
  if (handlers.onSynchronized) {
    webhooks.on("pull_request.synchronize", async ({ payload }) => {
      await handlers.onSynchronized!(payload);
    });
  }
  if (handlers.onError) {
    webhooks.onError((error) => {
      handlers.onError!(error);
    });
  }
};
