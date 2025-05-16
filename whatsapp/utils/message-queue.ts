import type { AppContext } from "../mod.ts";
import { WebhookService } from "../actions/webhook.ts";

interface QueuedMessage {
  text: string;
  req: Request;
  ctx: AppContext;
}

/**
 * MessageQueue class to handle concurrent message processing
 * Ensures messages from the same user are processed sequentially
 */
export class MessageQueue {
  private static instance: MessageQueue;
  private queues: Map<string, Array<QueuedMessage>>;
  private processing: Set<string>;
  private processingPromises: Map<string, Promise<void>>;

  private constructor() {
    this.queues = new Map();
    this.processing = new Set();
    this.processingPromises = new Map();
  }

  /**
   * Get the singleton instance of MessageQueue
   */
  public static getInstance(): MessageQueue {
    if (!MessageQueue.instance) {
      MessageQueue.instance = new MessageQueue();
    }
    return MessageQueue.instance;
  }

  /**
   * Enqueue a message for processing
   * @param userId The user's phone number
   * @param message The message to process
   */
  public async enqueueMessage(
    userId: string,
    message: QueuedMessage,
  ): Promise<void> {
    if (this.processing.has(userId)) {
      // Add to queue if user has active message
      const queue = this.queues.get(userId) || [];
      queue.push(message);
      this.queues.set(userId, queue);
      console.log(
        `Message queued for user ${userId}. Queue length: ${queue.length}`,
      );

      // Wait for current message to finish processing
      const currentPromise = this.processingPromises.get(userId);
      if (currentPromise) {
        await currentPromise;
      }
    } else {
      // Process immediately if no active message
      this.processing.add(userId);
      const processPromise = this.processMessage(userId, message);
      this.processingPromises.set(userId, processPromise);
      await processPromise;
    }
  }

  /**
   * Process a message and handle the queue
   * @param userId The user's phone number
   * @param message The message to process
   */
  private async processMessage(
    userId: string,
    message: QueuedMessage,
  ): Promise<void> {
    try {
      const { text, req, ctx } = message;
      await WebhookService.sendMessage(text, userId, req, ctx);
    } catch (error) {
      console.error(`Error processing message for user ${userId}:`, error);
    } finally {
      this.processing.delete(userId);
      this.processingPromises.delete(userId);
      // Process next message in queue if any
      await this.processNextInQueue(userId);
    }
  }

  /**
   * Process the next message in the queue for a user
   * @param userId The user's phone number
   */
  private async processNextInQueue(userId: string): Promise<void> {
    const queue = this.queues.get(userId);
    if (queue && queue.length > 0) {
      const nextMessage = queue.shift();
      if (nextMessage) {
        console.log(`Processing next message in queue for user ${userId}`);
        this.processing.add(userId);
        const processPromise = this.processMessage(userId, nextMessage);
        this.processingPromises.set(userId, processPromise);
        await processPromise;
      }
    } else {
      // Clean up empty queue
      this.queues.delete(userId);
    }
  }
}
