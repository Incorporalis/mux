import { getToolCoalesceKind } from "./toolCoalescing";
import type { DisplayedMessage } from "@/common/types/message";

export type OperationalBundleMessage = DisplayedMessage & { type: "reasoning" | "tool" };

export interface OperationalBundleSummary {
  title: string;
  details: string;
}

export interface OperationalBundleEntry {
  message: OperationalBundleMessage;
  originalIndex: number;
}

export interface OperationalBundleInfo {
  key: string;
  position: "head" | "member";
  headIndex: number;
  entries: OperationalBundleEntry[];
  summary: OperationalBundleSummary;
  state: "active" | "settled";
  defaultExpanded: boolean;
}

interface ComputeOperationalBundleInfosOptions {
  isTurnActive: boolean;
}

type OperationalBundleCategory =
  | "edit"
  | "fetch"
  | "question"
  | "read"
  | "reasoning"
  | "search"
  | "shell"
  | "skill"
  | "task"
  | "tool";

const OPERATIONAL_BUNDLE_CATEGORY_COPY: Record<
  OperationalBundleCategory,
  { singletonTitle: string; detailLabel: string }
> = {
  reasoning: { singletonTitle: "Reasoned", detailLabel: "reasoning" },
  read: { singletonTitle: "Read 1 file", detailLabel: "read" },
  search: { singletonTitle: "Searched 1 query", detailLabel: "search" },
  fetch: { singletonTitle: "Fetched 1 page", detailLabel: "fetch" },
  skill: { singletonTitle: "Read 1 skill", detailLabel: "skill read" },
  edit: { singletonTitle: "Edited 1 file", detailLabel: "edit" },
  shell: { singletonTitle: "Ran 1 shell command", detailLabel: "shell command" },
  question: { singletonTitle: "Asked 1 question", detailLabel: "question" },
  task: { singletonTitle: "Ran 1 agent task", detailLabel: "agent task" },
  tool: { singletonTitle: "Ran 1 operation", detailLabel: "operation" },
};

export function computeOperationalBundleInfos(
  messages: DisplayedMessage[],
  options: ComputeOperationalBundleInfosOptions
): Array<OperationalBundleInfo | undefined> {
  const infos = new Array<OperationalBundleInfo | undefined>(messages.length);
  let index = 0;

  while (index < messages.length) {
    const leadingReasoningStart = index;
    const leadingReasoningEntries: OperationalBundleEntry[] = [];
    while (true) {
      const message = messages[index];
      if (message?.type !== "reasoning") {
        break;
      }
      leadingReasoningEntries.push({ message, originalIndex: index });
      index += 1;
    }

    if (leadingReasoningEntries.length > 0 && messages[index]?.type === "assistant") {
      index += 1;
    } else if (leadingReasoningEntries.length > 0) {
      index = leadingReasoningStart;
    }

    if (!isOperationalBundleMessage(messages[index])) {
      index += 1;
      continue;
    }

    const headIndex = index;
    const entries: OperationalBundleEntry[] = [...leadingReasoningEntries];
    while (index < messages.length) {
      const candidate = messages[index];
      if (!isOperationalBundleMessage(candidate)) {
        break;
      }
      entries.push({ message: candidate, originalIndex: index });
      index += 1;
    }

    const first = entries[0].message;

    const state = entries.some((entry) => isActiveOperationalMessage(entry.message))
      ? "active"
      : "settled";
    const hasSubsequentVisibleEvent = hasVisibleEventAfter(messages, index);
    const defaultExpanded =
      state === "active" || (options.isTurnActive && !hasSubsequentVisibleEvent);
    const key = `bundle:${first.id}`;
    const summary = summarizeOperationalBundle(entries.map((entry) => entry.message));

    for (const entry of entries) {
      infos[entry.originalIndex] = {
        key,
        position: entry.originalIndex === headIndex ? "head" : "member",
        headIndex,
        entries,
        summary,
        state,
        defaultExpanded,
      };
    }
  }

  return infos;
}

function hasVisibleEventAfter(messages: DisplayedMessage[], startIndex: number): boolean {
  for (let index = startIndex; index < messages.length; index++) {
    if (!isOperationalBundleMessage(messages[index])) {
      return true;
    }
  }

  return false;
}

export function summarizeOperationalBundle(
  messages: OperationalBundleMessage[]
): OperationalBundleSummary {
  if (messages.length === 0) {
    throw new Error("Cannot summarize an empty operational bundle");
  }

  const allSearchMisses = messages.every(
    (message) =>
      message.type === "tool" && message.toolName === "web_search" && message.status === "failed"
  );
  if (allSearchMisses) {
    return { title: "No results", details: formatDetails(messages) };
  }

  if (messages.length === 1) {
    return { title: singletonTitle(messages[0]), details: formatDetails(messages) };
  }

  return {
    title: `Ran ${messages.length.toLocaleString()} operations`,
    details: formatDetails(messages),
  };
}

function isOperationalBundleMessage(
  message: DisplayedMessage | undefined
): message is OperationalBundleMessage {
  return message?.type === "tool" || message?.type === "reasoning";
}

function isActiveOperationalMessage(message: OperationalBundleMessage): boolean {
  if (message.type === "reasoning") {
    return message.isStreaming;
  }
  return message.status === "pending" || message.status === "executing";
}

function singletonTitle(message: OperationalBundleMessage): string {
  return OPERATIONAL_BUNDLE_CATEGORY_COPY[getOperationalBundleCategory(message)].singletonTitle;
}

function formatDetails(messages: OperationalBundleMessage[]): string {
  const counts = new Map<string, number>();
  for (const message of messages) {
    const label =
      OPERATIONAL_BUNDLE_CATEGORY_COPY[getOperationalBundleCategory(message)].detailLabel;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([label, count]) => `${count.toLocaleString()} ${label}${count === 1 ? "" : "s"}`)
    .join(" · ");
}

function getOperationalBundleCategory(
  message: OperationalBundleMessage
): OperationalBundleCategory {
  if (message.type === "reasoning") {
    return "reasoning";
  }

  const coalesceKind = getToolCoalesceKind(message);
  if (coalesceKind === "file_read") {
    return "read";
  }
  if (coalesceKind === "file_edit") {
    return "edit";
  }
  if (message.toolName === "bash") {
    return "shell";
  }
  if (message.toolName === "web_search") {
    return "search";
  }
  if (message.toolName === "web_fetch") {
    return "fetch";
  }
  if (message.toolName === "agent_skill_read" || message.toolName === "agent_skill_read_file") {
    return "skill";
  }
  if (message.toolName === "ask_user_question") {
    return "question";
  }
  if (message.toolName === "task" || message.toolName === "task_await") {
    return "task";
  }

  return "tool";
}
