import { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Test Event Name
   * @description Name of the test event to send
   * @default test_event
   */
  eventName?: string;

  /**
   * @title Test Parameters
   * @description Test parameters to send with the event
   */
  testParams?: Record<string, string>;
}

/**
 * @title Test Stape Connection
 * @description Sends a test event to verify Stape integration is working
 */
export default async function testStapeConnection(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<{ 
  success: boolean; 
  message: string; 
  containerUrl?: string;
  testEvent?: Record<string, unknown>;
}> {
  const { containerUrl } = ctx;

  if (!containerUrl) {
    return {
      success: false,
      message: "Container URL not configured. Please set the containerUrl in the app configuration.",
    };
  }

  try {
    const testEvent = {
      events: [{
        name: props.eventName || "test_event",
        params: {
          test_timestamp: new Date().toISOString(),
          test_source: "deco_stape_integration",
          ...props.testParams,
        },
      }],
      client_id: "test-client-" + crypto.randomUUID(),
      timestamp_micros: Date.now() * 1000,
    };

    const stapeUrl = new URL('/gtm', containerUrl);
    const userAgent = req.headers.get("user-agent") || "Deco-Stape-Test/1.0";

    console.log(`Testing Stape connection to: ${stapeUrl.toString()}`);

    const response = await fetch(stapeUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': userAgent,
      },
      body: JSON.stringify(testEvent),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return {
      success: true,
      message: `Test event sent successfully to Stape container. Event: ${props.eventName || "test_event"}`,
      containerUrl,
      testEvent,
    };
  } catch (error) {
    console.error("Stape connection test failed:", error);
    return {
      success: false,
      message: `Test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      containerUrl,
    };
  }
}