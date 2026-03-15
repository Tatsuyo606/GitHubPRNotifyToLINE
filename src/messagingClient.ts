import { messagingApi } from "@line/bot-sdk";

export interface IMessagingService {
  sendMessageAsync(message: string): Promise<void>;
}

export class LineMessagingClient implements IMessagingService {
  private lineUserId: string;
  private lineClient: messagingApi.MessagingApiClient;

  constructor(channelAccessToken: string, lineUserId: string) {
    this.lineClient = new messagingApi.MessagingApiClient({
      channelAccessToken,
    });
    this.lineUserId = lineUserId;
  }

  async sendMessageAsync(message: string): Promise<void> {
    const textMessage: messagingApi.TextMessage = {
      type: "text",
      text: message,
    };

    await this.lineClient.pushMessage({
      to: this.lineUserId,
      messages: [textMessage],
    });
  }
}
