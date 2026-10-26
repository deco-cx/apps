// Shared OTel instruments for the AI assistants app. Standard GenAI telemetry
// uses the official @opentelemetry/semantic-conventions (gen_ai.*) constants;
// deco-proprietary dimensions use the deco.assistant.* namespace. The meter is
// reused from the deco framework.
import { meter, ValueType } from "@deco/deco/o11y";
import {
  ATTR_GEN_AI_SYSTEM,
  ATTR_GEN_AI_TOKEN_TYPE,
  METRIC_GEN_AI_CLIENT_OPERATION_DURATION,
  METRIC_GEN_AI_CLIENT_TOKEN_USAGE,
} from "npm:@opentelemetry/semantic-conventions@1.37.0/incubating";

// semconv attribute keys + values
export const GEN_AI_SYSTEM = ATTR_GEN_AI_SYSTEM;
export const GEN_AI_SYSTEM_OPENAI = "openai";
export const GEN_AI_TOKEN_TYPE = ATTR_GEN_AI_TOKEN_TYPE;
export const GEN_AI_TOKEN_TYPE_INPUT = "input";
export const GEN_AI_TOKEN_TYPE_OUTPUT = "output";

// deco-proprietary attributes (no semconv equivalent)
export const ATTR_ASSISTANT_ID = "assistant_id";
export const ATTR_ASSISTANT_PHASE = "deco.assistant.phase";
export const ATTR_ASSISTANT_OPERATION = "deco.assistant.operation";

export const stats = {
  // gen_ai.client.operation.duration — seconds (semconv)
  operationDuration: meter.createHistogram(
    METRIC_GEN_AI_CLIENT_OPERATION_DURATION,
    {
      description: "GenAI assistant operation duration.",
      unit: "s",
      valueType: ValueType.DOUBLE,
    },
  ),
  // gen_ai.client.token.usage — split by gen_ai.token.type (input/output)
  tokenUsage: meter.createHistogram(METRIC_GEN_AI_CLIENT_TOKEN_USAGE, {
    description: "Number of tokens used in GenAI assistant requests.",
    unit: "{token}",
    valueType: ValueType.INT,
  }),
  // deco-proprietary: transcribed audio duration (seconds)
  audioDuration: meter.createHistogram(
    "deco.assistant.transcribe.audio_duration",
    {
      description: "Duration of audio transcribed by the assistant.",
      unit: "s",
      valueType: ValueType.DOUBLE,
    },
  ),
  // deco-proprietary: assistant operation errors, dimensioned by operation
  errors: meter.createCounter("deco.assistant.errors", {
    description: "Assistant operation errors.",
    unit: "1",
    valueType: ValueType.INT,
  }),
};
