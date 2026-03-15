import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { createWebhooks, addPullRequestHandlers } from "./src/webhooks.js";
import { Notifier, createPullRequestHandlers } from "./src/notifier.js";
import { LineMessagingClient } from "./src/messagingClient.js";


export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`環境変数 ${name} が設定されていません`);
    throw new Error(`Missing env var: ${name}`);
  }
  return value;
}

let cachedWebhooks: ReturnType<typeof createWebhooks> | null = null;

function getInitializedWebhooks() {
  if (cachedWebhooks) {
    return cachedWebhooks;
  }

  const webhooks = createWebhooks(getRequiredEnv("WEBHOOK_SECRET"));

  // 通知先の差し替えができるようにしておく
  const messagingService = new LineMessagingClient(
    getRequiredEnv("LINE_CHANNEL_ACCESS_TOKEN"),
    getRequiredEnv("LINE_USER_ID")
  );
  const notifier = new Notifier(messagingService);
  const handlers = createPullRequestHandlers(notifier);

  addPullRequestHandlers(webhooks, handlers);

  cachedWebhooks = webhooks;
  return webhooks;
}

export const handler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  const headers = event.headers || {};
  const lower: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (value != null) {
      lower[key.toLowerCase()] = value;
    }
  }
  const id = lower["x-github-delivery"];
  const name = lower["x-github-event"] as any; // 例: "pull_request"
  const signature = lower["x-hub-signature-256"];

  if (!id || !name || !signature) {
    console.warn("Missing GitHub webhook headers", { id, name, hasSignature: Boolean(signature) });
    return {
      statusCode: 400,
      body: "Missing GitHub webhook headers",
    };
  }

  const rawBody =
    event.body == null
      ? ""
      : event.isBase64Encoded
      ? Buffer.from(event.body, "base64").toString("utf8")
      : event.body;

  try {
    const webhooks = getInitializedWebhooks();
    await webhooks.verifyAndReceive({
      id,
      name,
      payload: rawBody,
      signature,
    });

    return {
      statusCode: 200,
      body: "OK",
    };
  } catch (error) {
    console.error("Webhook handling error", error);
    return {
      statusCode: 500,
      body: "Internal Server Error",
    };
  }
};