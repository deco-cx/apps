/**
 * A personalized assistant configuration
 */
export interface AssistantPersonalization {
  /**
   * @title The assistant's name
   */
  nickname?: string;

  /**
   * @title The assistant's personality
   */
  mood?:
    | "Friendly"
    | "Straight to the Point"
    | "Humorous"
    | "Professional"
    | "Enthusiastic"
    | "Informative"
    | "Sarcastic"
    | "Formal"
    | "Energetic"
    | "Curious"
    | "Confident"
    | "Helpful";
}

export interface AssistantIds {
  /**
   * @title The assistant's id
   */
  assistantId?: string;

  /**
   * @title The current thread id
   */
  threadId?: string;
}
