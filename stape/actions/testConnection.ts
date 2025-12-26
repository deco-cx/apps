import { AppContext } from "../mod.ts";
import { extractRequestInfo, fetchStapeAPI } from "../utils/fetch.ts";

// Request timeout configuration
const REQUEST_TIMEOUT_MS = 5000; // 5 seconds

export interface Props {
  /**
   * @title Event Name
   * @description Name of the test event to send
   * @default "test_event"
   */
  eventName?: string;

  /**
   * @title Additional Test Parameters
   * @description Extra parameters to include in the test event
   */
  testParams?: Record<string, unknown>;
}

// Type definitions
interface TestResult {
  success: boolean;
  message: string;
  testEvent?: Record<string, unknown>;
}

interface TestEventPayload {
  events: Array<{
    name: string;
    params: Record<string, unknown>;
  }>;
  client_id: string;
  timestamp_micros: number;
}

// Utility functions
const createTestEvent = (props: Props): TestEventPayload => ({
  events: [{
    name: props.eventName || "test_event",
    params: {
      event_category: "test",
      event_label: "connection_test",
      test_source: "deco_stape_integration",
      ...props.testParams,
    },
  }],
  client_id: "test-client-" + crypto.randomUUID(),
  timestamp_micros: Date.now() * 1000,
});

const createSuccessResult = (
  props: Props,
  testEvent: Record<string, unknown>,
): TestResult => ({
  success: true,
  message: `Test event sent successfully to Stape container. Event: ${
    props.eventName || "test_event"
  }`,
  testEvent,
});

const createTimeoutResult = (): TestResult => ({
  success: false,
  message: `Test timeout after ${REQUEST_TIMEOUT_MS}ms`,
});

const createErrorResult = (error: unknown): TestResult => ({
  success: false,
  message: `Test failed: ${
    error instanceof Error ? error.message : "Unknown error"
  }`,
});

const isTimeoutError = (error: unknown): boolean =>
  error instanceof Error && error.name === "AbortError";

/**
 * @title Test Stape Connection
 * @description Sends a test event to verify Stape integration is working
 */
export default async function testStapeConnection(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<TestResult> {
  const { containerUrl } = ctx;

  try {
    const testEvent = createTestEvent(props);
    const { userAgent, clientIp } = extractRequestInfo(req);

    console.log(`Testing Stape connection to: ${containerUrl}/gtm`);

    const result = await fetchStapeAPI(
      containerUrl,
      testEvent,
      userAgent,
      clientIp,
      REQUEST_TIMEOUT_MS,
    );

    return result.success
      ? createSuccessResult(
        props,
        testEvent as unknown as Record<string, unknown>,
      )
      : createErrorResult(result.error);
  } catch (error) {
    console.error("Stape connection test failed:", error);

    return isTimeoutError(error)
      ? createTimeoutResult()
      : createErrorResult(error);
  }
}
