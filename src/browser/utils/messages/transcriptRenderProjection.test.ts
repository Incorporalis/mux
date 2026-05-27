import { describe, expect, test } from "bun:test";
import type { DisplayedMessage } from "@/common/types/message";
import {
  computeOperationalBundleInfos,
  summarizeOperationalBundle,
} from "./transcriptRenderProjection";

let nextToolId = 0;

function tool(
  overrides: Partial<DisplayedMessage & { type: "tool" }>
): DisplayedMessage & { type: "tool" } {
  const id = overrides.id ?? `tool-${++nextToolId}`;
  return {
    type: "tool",
    id,
    historyId: overrides.historyId ?? `history-${id}`,
    toolCallId: overrides.toolCallId ?? `call-${id}`,
    toolName: overrides.toolName ?? "file_read",
    args: overrides.args ?? {},
    result: overrides.result,
    status: overrides.status ?? "completed",
    isPartial: overrides.isPartial ?? false,
    historySequence: overrides.historySequence ?? 1,
    streamSequence: overrides.streamSequence,
    isLastPartOfMessage: overrides.isLastPartOfMessage,
    timestamp: overrides.timestamp,
    nestedCalls: overrides.nestedCalls,
  };
}

function reasoning(
  overrides: Partial<DisplayedMessage & { type: "reasoning" }> = {}
): DisplayedMessage & { type: "reasoning" } {
  const id = overrides.id ?? "reasoning-1";
  return {
    type: "reasoning",
    id,
    historyId: overrides.historyId ?? `history-${id}`,
    content: overrides.content ?? "Thinking through the plan",
    historySequence: overrides.historySequence ?? 1,
    isStreaming: overrides.isStreaming ?? false,
    isPartial: overrides.isPartial ?? false,
    streamSequence: overrides.streamSequence,
    isLastPartOfMessage: overrides.isLastPartOfMessage,
    timestamp: overrides.timestamp,
  };
}

function user(id: string): DisplayedMessage {
  return {
    type: "user",
    id,
    historyId: `history-${id}`,
    content: "hello",
    historySequence: 1,
  };
}

function assistant(id: string): DisplayedMessage {
  return {
    type: "assistant",
    id,
    historyId: `history-${id}`,
    content: "done",
    historySequence: 1,
    isStreaming: false,
    isPartial: false,
    isCompacted: false,
    isIdleCompacted: false,
  };
}

describe("operational bundle coalescing", () => {
  test("groups consecutive reasoning and tool calls without mutating messages", () => {
    const first = reasoning({ id: "think-1" });
    const second = tool({ id: "read-1", toolName: "file_read" });
    const third = tool({ id: "edit-1", toolName: "file_edit_replace_string" });
    const messages = [user("u1"), first, assistant("a1"), second, third, assistant("a2")];
    const before = JSON.stringify(messages);

    const infos = computeOperationalBundleInfos(messages, { isTurnActive: false });

    expect(JSON.stringify(messages)).toBe(before);
    expect(infos[0]).toBeUndefined();
    expect(infos[1]).toMatchObject({ key: "bundle:think-1", position: "member", headIndex: 3 });
    expect(infos[2]).toBeUndefined();
    expect(infos[3]).toMatchObject({
      key: "bundle:think-1",
      position: "head",
      headIndex: 3,
      state: "settled",
      defaultExpanded: false,
      entries: [
        { message: first, originalIndex: 1 },
        { message: second, originalIndex: 3 },
        { message: third, originalIndex: 4 },
      ],
    });
    expect(infos[4]).toMatchObject({ key: "bundle:think-1", position: "member" });
    expect(infos[5]).toBeUndefined();
  });

  test("conversation rows break bundles", () => {
    const messages = [
      tool({ id: "read-1", toolName: "file_read" }),
      assistant("a1"),
      tool({ id: "edit", toolName: "file_edit_replace_string" }),
      user("u1"),
      tool({ id: "read-2", toolName: "agent_skill_read" }),
    ];

    const infos = computeOperationalBundleInfos(messages, { isTurnActive: false });

    expect(infos[0]).toMatchObject({ position: "head" });
    expect(infos[1]).toBeUndefined();
    expect(infos[2]).toMatchObject({ position: "head" });
    expect(infos[3]).toBeUndefined();
    expect(infos[4]).toMatchObject({ position: "head" });
  });

  test("active and just-settled tail bundles stay expanded until a visible event or turn end", () => {
    const active = computeOperationalBundleInfos(
      [reasoning({ id: "think-1", isStreaming: true })],
      {
        isTurnActive: true,
      }
    );
    expect(active[0]).toMatchObject({
      position: "head",
      state: "active",
      defaultExpanded: true,
    });

    const justSettledTail = computeOperationalBundleInfos(
      [tool({ id: "read-1", status: "completed" })],
      { isTurnActive: true }
    );
    expect(justSettledTail[0]).toMatchObject({
      position: "head",
      state: "settled",
      defaultExpanded: true,
    });

    const afterVisibleEvent = computeOperationalBundleInfos(
      [tool({ id: "read-1", status: "completed" }), assistant("a1")],
      { isTurnActive: true }
    );
    expect(afterVisibleEvent[0]).toMatchObject({
      position: "head",
      state: "settled",
      defaultExpanded: false,
    });
  });

  test("bundle key stays stable while an active bundle grows", () => {
    const one = computeOperationalBundleInfos([tool({ id: "read-1", status: "executing" })], {
      isTurnActive: true,
    });
    const two = computeOperationalBundleInfos(
      [tool({ id: "read-1", status: "executing" }), tool({ id: "search-1" })],
      { isTurnActive: true }
    );

    expect(one[0]?.key).toBe("bundle:read-1");
    expect(two[0]?.key).toBe("bundle:read-1");
    expect(two[1]).toMatchObject({ key: "bundle:read-1", position: "member" });
  });
});

describe("operational bundle summary", () => {
  test("summarizes mixed tools and reasoning", () => {
    const summary = summarizeOperationalBundle([
      reasoning({ id: "think-1" }),
      tool({ id: "edit-1", toolName: "file_edit_replace_string" }),
      tool({ id: "test-1", toolName: "bash", args: { script: "make test" } }),
      tool({ id: "question-1", toolName: "ask_user_question" }),
    ]);

    expect(summary.title).toBe("Ran 4 operations");
    expect(summary.details).toBe("1 reasoning · 1 edit · 1 shell command · 1 question");
  });

  test("all-miss search bundle gets neutral copy", () => {
    const allMiss = summarizeOperationalBundle([
      tool({ id: "search-1", toolName: "web_search", status: "failed" }),
    ]);
    expect(allMiss.title).toBe("No results");
  });
});
