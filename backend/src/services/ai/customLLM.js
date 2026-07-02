import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { AIMessage } from "@langchain/core/messages";

// Prompt-based tool call emulation: since the ITI gateway is text-only,
// we inject a system message that teaches the model the JSON tool-call format,
// then parse its response to produce proper AIMessage.tool_calls for createAgent.

function generateId() {
  return `call_${Math.random().toString(36).slice(2, 11)}`;
}

function buildToolsSystemMessage(tools) {
  const list = tools.map((t) => `- ${t.name}: ${t.description}`).join("\n");
  return `You have access to these tools:
${list}

To call a tool, respond with ONLY this JSON (nothing else before or after):
{"tool_call": {"name": "<tool_name>", "args": {<arguments_as_json>}}}

When you have the final answer without needing any tool, respond normally in plain text.`;
}

function parseToolCall(text) {
  try {
    const idx = text.indexOf('"tool_call"');
    if (idx === -1) return null;

    // Walk back to find the opening brace of the outer object
    let start = idx;
    while (start > 0 && text[start] !== "{") start--;
    if (text[start] !== "{") return null;

    // Walk forward to find the matching closing brace
    let depth = 0;
    for (let i = start; i < text.length; i++) {
      if (text[i] === "{") depth++;
      else if (text[i] === "}") {
        depth--;
        if (depth === 0) {
          const parsed = JSON.parse(text.slice(start, i + 1));
          if (parsed.tool_call?.name) {
            return {
              id: generateId(),
              name: parsed.tool_call.name,
              args: parsed.tool_call.args ?? {},
              type: "tool_call",
            };
          }
          break;
        }
      }
    }
  } catch {}
  return null;
}

export class ITIChatModel extends BaseChatModel {
  _boundTools = [];

  _llmType() {
    return "iti-bedrock";
  }

  // createAgent calls bindTools internally; we return a new instance with tools stored.
  bindTools(tools, _options) {
    const m = new ITIChatModel({});
    m._boundTools = [...(tools ?? [])];
    return m;
  }

  _toApiMessages(messages) {
    // The ITI gateway (DeepSeek via Bedrock) does not support system messages.
    // Collect all system content and prepend it to the first user turn instead.
    const systemParts = [];
    if (this._boundTools.length > 0) {
      systemParts.push(buildToolsSystemMessage(this._boundTools));
    }
    for (const m of messages) {
      if (m._getType() === "system") systemParts.push(String(m.content));
    }
    const systemPrefix =
      systemParts.length > 0 ? systemParts.join("\n\n") + "\n\n" : "";

    const result = [];
    let prefixAdded = false;

    for (const m of messages) {
      const type = m._getType();
      if (type === "system") continue;

      if (type === "human") {
        const content = String(m.content);
        result.push({
          role: "user",
          content: prefixAdded ? content : systemPrefix + content,
        });
        prefixAdded = true;
      } else if (type === "ai") {
        if (m.tool_calls?.length > 0) {
          const tc = m.tool_calls[0];
          result.push({
            role: "assistant",
            content: JSON.stringify({
              tool_call: { name: tc.name, args: tc.args },
            }),
          });
        } else {
          result.push({ role: "assistant", content: String(m.content) });
        }
      } else if (type === "tool") {
        result.push({
          role: "user",
          content: `Tool "${m.name}" result: ${String(m.content)}`,
        });
      }
    }

    return result;
  }

  async _generate(messages, _options) {
    const endpoint = `${(process.env.BASE_URL ?? "http://apiaccess.iti.net.eg/api/v1").replace(/\/$/, "")}/student/chat`;
    const apiKey = process.env.API_KEY ?? "";
    const modelId = process.env.MODEL_NAME ?? "deepseek.v3.2";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model_id: modelId,
        messages: this._toApiMessages(messages),
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`ITI API error ${response.status}: ${body}`);
    }

    const data = await response.json();
    console.log(`[LLM] Tokens used: ${data.usage?.total_tokens ?? "?"}`);
    const text = data.output_text ?? "";

    if (this._boundTools.length > 0) {
      const toolCall = parseToolCall(text);
      if (toolCall) {
        console.log(`[LLM] Tool call: ${toolCall.name}`, toolCall.args);
        return {
          generations: [
            {
              text: "",
              message: new AIMessage({ content: "", tool_calls: [toolCall] }),
            },
          ],
        };
      }
    }

    return {
      generations: [{ text, message: new AIMessage(text) }],
    };
  }
}
