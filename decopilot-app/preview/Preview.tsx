import type { JSX } from "preact";
import { PreviewContainer } from "../../utils/preview.tsx";
import { App } from "../mod.ts";
import { type AppRuntime, type BaseContext } from "@deco/deco";

export interface Props {
  publicUrl: string;
}

export const PreviewDecopilot = (
  app: AppRuntime<BaseContext, App["state"]> & {
    markdownContent: () => JSX.Element;
  },
) => {
  return (
    <PreviewContainer
      name="decopilot"
      owner="deco.cx"
      description="This document will help you set up the app and best use the tool. The information is divided into four main sections: General Information, Setting Up, App Definitions, and Using App. Use this guide as reference as needed or visit <documentation link>"
      logo="" //Add deco logo - Or a decopilot logo!
      images={[]} //{[ Add images
      // ]}
      tabs={[
        {
          title: "About",
          content: <app.markdownContent />,
        },
        {
          title: "Setting Up",
          content: <SettingUp />,
        },
        {
          title: "App Definitions",
          content: <AppDefinitions />,
        },
        {
          title: "Using App",
          content: <AppUse />,
        },
      ]}
    />
  );
};

export function SettingUp() {
  return (
    <div>
      <h2>Setting Up the App</h2>
      <p>
        To get started with the app, you'll need to configure the API keys for
        the respective LLM (Large Language Model) providers. These keys are
        required to authenticate and interact with the models.
      </p>

      <h3>Steps to Configure API Keys:</h3>
      <ul>
        <li>
          Navigate to the <strong>Settings</strong> tab within the app.
        </li>
        <li>
          Enter the API keys for the models you wish to use (e.g., OpenAI,
          Anthropic). The keys can be obtained from the provider’s website or
          developer portal.
        </li>
        <li>
          The API keys will be securely stored as secrets and will only be
          accessible by you.
        </li>
        <li>
          After adding the keys, click <strong>Save</strong>{" "}
          to apply the changes.
        </li>
      </ul>

      <h3>What Happens After Setting Up:</h3>
      <p>
        Once your API keys are set up, you'll be able to fully access the app's
        features, such as sending prompts to the LLMs and receiving responses.
      </p>

      <div>Add Credentials image here to visualize the setup process</div>
    </div>
  );
}

export function AppDefinitions() {
  return (
    <div>
      <h2>Understanding App Concepts</h2>
      <p>
        The app is structured around three primary components:{" "}
        <strong>Prompts</strong>, <strong>Agents</strong>, and{" "}
        <strong>Chains</strong>. Each serves a specific function to enhance how
        you interact with LLMs.
      </p>

      <h3>Prompts</h3>
      <p>
        A <strong>Prompt</strong>{" "}
        is the simplest form of interaction with an LLM. It sends a request to
        the model to generate a response based on the provided input. Prompts
        can be configured with additional parameters such as attachments,
        advanced settings, and even function calls.
      </p>
      <ul>
        <li>
          <strong>Advanced Settings:</strong>{" "}
          Includes additional context, examples, or restrictions to refine the
          output of the LLM.
        </li>
        <li>
          <strong>Attachments:</strong>{" "}
          Local files or text that are passed along with the prompt to provide
          more detailed context or input.
        </li>
        <li>
          <strong>Function Calls:</strong>{" "}
          Available in certain models (like OpenAI's GPT-4), functions allow the
          prompt to invoke external services or tools.
        </li>
      </ul>

      <h3>Agents</h3>
      <p>
        An <strong>Agent</strong>{" "}
        is a more complex block that may contain multiple operations, including
        LLM calls, loaders, and actions. Agents are typically used for more
        sophisticated tasks that require more than just a single LLM call. For
        example, an agent can process user input, search a vector database, and
        then trigger an LLM call based on the results.
      </p>

      <h3>Chains</h3>
      <p>
        A <strong>Chain</strong>{" "}
        is a predefined sequence of Prompts and/or Agents that execute in a
        specific order. Chains allow you to automate workflows by organizing
        multiple steps into a repeatable process. There are two types of Chains:
      </p>
      <ul>
        <li>
          <strong>Simple Chains:</strong>{" "}
          A straightforward, linear flow where each step occurs sequentially.
        </li>
        <li>
          <strong>Complex Chains:</strong>{" "}
          Involve conditional logic, loops, and can include both Prompts and
          Agents. They allow more dynamic workflows and decisions.
        </li>
      </ul>

      <div>
        Add an image to illustrate the interaction between Prompts, Agents, and
        Chains
      </div>
    </div>
  );
}

export function AppUse() {
  return (
    <div>
      <h2>Available Actions</h2>
      <p>
        The app provides two main functions for interacting with LLMs:
        <strong>runPrompt</strong> and <strong>runChain</strong>.
      </p>
      <ul>
        <li>
          <strong>runPrompt</strong>: This function can be used to execute
          prompts. It accepts either prompts defined within the app or inline
          prompts created dynamically as <code>Prompt</code> types.
        </li>
        <li>
          <strong>runChain</strong>: This function runs a predefined sequence of
          prompts and agents, organized as chains.
        </li>
      </ul>

      <h2>Using Actions</h2>
      <p>
        The <strong>runPrompt</strong>{" "}
        function can be invoked using either a saved prompt or a newly defined
        inline prompt.
      </p>

      <h3>Defined Prompt</h3>
      <p>
        To use a saved prompt, you can call <strong>runPrompt</strong>{" "}
        as follows:
      </p>
      <pre>
        <code>
{`await invoke["decopilot-app"].actions.prompt.runPrompt({
  promptName: "<Name of prompt>",
  attachments: [<Attachments>],
});
`}
        </code>
      </pre>

      <h3>Inline Prompt</h3>
      <p>
        You can also define a prompt inline, by manually creating a{" "}
        <code>Prompt</code> object and calling <strong>runPrompt</strong>:
      </p>
      <pre>
        <code>
{`const inlinePrompt = {
  name: "inline_prompt",
  provider: "Anthropic",
  model: "claude-3-haiku-20240307", // Dynamic options available
  prompt: "Tell me a funny joke"
};

await invoke["decopilot-app"].actions.prompt.runPrompt({
  inlinePrompt: inlinePrompt,
  attachments: [{
    call_text: "Brasileiro",
    type: "TextOnly",
  }],
});
`}
        </code>
      </pre>

      <h3>Attachments</h3>
      <p>
        Attachments are the local inputs that are passed when calling your
        prompts. These can be provided by the system or the user, depending on
        the context. Attachments can be used to provide additional details or
        specific content for processing (like a piece of code to edit).
        Attachments can either be files (via URLs) or plain text.
      </p>

      <h3>Tools</h3>
      <p>
        Tools are functions that can be invoked during the flow, either in
        prompts or agents. These tools are triggered using your LLM provider's
        function or tool-calling features (if the provider supports it). For
        example, a tool might allow for additional API calls or data
        transformations during the prompt execution.
      </p>

      <h2>Types</h2>
      <p>
        Below are some of the most important types used when interacting with
        the app.
      </p>

      <h3>Attachment</h3>
      <p>
        Attachments are inputs provided to prompts. They can either be files
        (e.g., CSV, images, JSON) or plain text:
      </p>
      <ul>
        <li>
          <strong>AttachmentExtension</strong>: File extensions supported for
          attachments, including <code>.csv</code>, <code>.jpeg</code>,{" "}
          <code>.png</code>, and <code>.json</code>.
        </li>
        <li>
          <strong>TextOnly</strong>: For text-based attachments, you provide a
          string via the <code>call_text</code> property.
        </li>
        <li>
          <strong>FileURL</strong>: For file-based attachments, you provide a
          URL via <code>fileUrl</code> and specify the file type using{" "}
          <code>AttachmentExtension</code>.
        </li>
      </ul>

      <h3>Prompt</h3>
      <p>
        Prompts are the smallest units of interaction with LLMs. They consist of
        various properties like:
      </p>
      <ul>
        <li>
          <strong>name</strong>: The name of the prompt.
        </li>
        <li>
          <strong>provider</strong>: The provider for the LLM (e.g., Anthropic,
          OpenAI).
        </li>
        <li>
          <strong>model</strong>: The LLM model to use (e.g., Claude-3 or
          GPT-4).
        </li>
        <li>
          <strong>prompt</strong>: The actual content or question being sent to
          the LLM.
        </li>
        <li>
          <strong>advanced</strong>: Optional advanced settings (via{" "}
          <code>PromptDetails</code>) that can include context, examples,
          restrictions, and available functions.
        </li>
      </ul>

      <h3>Chain</h3>
      <p>
        A chain is a sequence of prompts or agents executed in a predefined
        order. Chains can either be:
      </p>
      <ul>
        <li>
          <strong>Simple</strong>: A linear sequence of prompts.
        </li>
        <li>
          <strong>Complex</strong>: Can include both prompts and agents, with
          conditional logic or loops.
        </li>
      </ul>
      <p>
        Chains use the following key types:
      </p>
      <ul>
        <li>
          <strong>ChainType</strong>: Specifies whether the chain is{" "}
          <code>Simple</code> or <code>Complex</code>.
        </li>
        <li>
          <strong>ComponentArray</strong>: Represents the components (Prompts or
          Agents) that make up the chain, using <code>blockNames</code> and{" "}
          <code>blockType</code>.
        </li>
      </ul>

      <h3>LLMResponseType and LLMChainResponseType</h3>
      <p>
        These types represent the structure of the responses returned by the
        LLM. Key fields include:
      </p>
      <ul>
        <li>
          <strong>provider</strong>: The LLM provider (e.g., OpenAI, Anthropic).
        </li>
        <li>
          <strong>model</strong>: The model used (e.g., GPT-4).
        </li>
        <li>
          <strong>llm_response</strong>: An array containing the messages and
          content returned by the LLM.
        </li>
        <li>
          <strong>usage</strong>: Token usage details, including prompt,
          completion, and total tokens.
        </li>
      </ul>
    </div>
  );
}
