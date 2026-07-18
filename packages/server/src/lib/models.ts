import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import {
  findSupportedChatModel,
  type SupportedChatModel,
  type SupportedChatModelId,
  type SupportedProvider,
} from "@pneuma/shared";
import type { LanguageModel } from "ai";
import type { ProviderOptions } from "@ai-sdk/provider-utils";

type AnthropicModelId = Extract<
  SupportedChatModel,
  { provider: "anthropic" }
>["id"];

type OpenAIModelId = Extract<SupportedChatModel, { provider: "openai" }>["id"];

export type ResolvedModel = {
  model: LanguageModel;
  provider: SupportedProvider;
  modelId: SupportedChatModelId;
  providerOptions?: ProviderOptions;
};

// Keyed by provider name, not model id: the AI SDK hands each provider the
// object under its own key (`providerOptions.anthropic`), and silently ignores
// anything else. These maps are exhaustive over the model ids on purpose — a new
// model must declare its reasoning settings rather than quietly getting none.
const ANTHROPIC_PROVIDER_OPTIONS: Record<AnthropicModelId, ProviderOptions> = {
  "claude-opus-4-8": {
    anthropic: {
      thinking: { type: "enabled", budgetTokens: 10_000 },
    },
  },
  "claude-sonnet-4-6": {
    anthropic: {
      thinking: { type: "enabled", budgetTokens: 10_000 },
    },
  },
  "claude-haiku-4-5": {
    anthropic: {
      thinking: { type: "enabled", budgetTokens: 4_000 },
    },
  },
};

// OpenAI never streams raw chain-of-thought — `reasoningSummary` is the only way
// to get any reasoning text back, so omitting it means no thinking in the UI.
const OPENAI_PROVIDER_OPTIONS: Record<OpenAIModelId, ProviderOptions> = {
  "gpt-5.4-mini": {
    openai: {
      reasoningEffort: "high",
      reasoningSummary: "auto",
    },
  },
  "gpt-5.4-nano": {
    openai: {
      reasoningEffort: "low",
      reasoningSummary: "auto",
    },
  },
};

export function isSupportedChatModel(
  modelId: string,
): modelId is SupportedChatModelId {
  return findSupportedChatModel(modelId) != null;
}

export function resolveChatModel(modelId: string): ResolvedModel {
  const model = findSupportedChatModel(modelId);
  if (!model) {
    throw new Error(`Unsupported model: ${model}`);
  }

  return resolveSupportedChatModel(model);
}

function resolveSupportedChatModel(model: SupportedChatModel): ResolvedModel {
  const provider = model.provider;

  switch (provider) {
    case "anthropic": {
      return resolveAnthropicModel(model.id);
    }

    case "openai": {
      return resolveOpenAIModel(model.id);
    }

    default: {
      return assertUnsupportedProvider(provider);
    }
  }
}

function assertUnsupportedProvider(provider: never): never {
  throw new Error(`Unsupported provider: ${provider}`);
}

function resolveAnthropicModel(modelId: AnthropicModelId): ResolvedModel {
  return {
    model: anthropic(modelId),
    provider: "anthropic",
    modelId,
    providerOptions: ANTHROPIC_PROVIDER_OPTIONS[modelId],
  };
}

function resolveOpenAIModel(modelId: OpenAIModelId): ResolvedModel {
  return {
    model: openai(modelId),
    provider: "openai",
    modelId,
    providerOptions: OPENAI_PROVIDER_OPTIONS[modelId],
  };
}
