# Mux Conversation Context

Mux preserves workspace transcripts while controlling which messages are active conversation context for the agent.

## Language

**Context Reset**:
Starts a new active conversation context while preserving earlier transcript history.
_Avoid_: soft clear, compaction, truncate, clear history

**Transcript History**:
The persisted record of messages in a workspace, including messages that are no longer active context.
_Avoid_: context, prompt history

**Active Conversation Context**:
The subset of transcript history eligible to be sent to the agent for the next response.
_Avoid_: chat history, transcript

**Compaction Boundary**:
A context boundary that carries a provider-visible summary of earlier transcript history.
_Avoid_: context reset

**Context Reset Boundary**:
A visible separator in transcript history where the active conversation context starts over; older history may be hidden behind a load-older affordance.
_Avoid_: compaction boundary, summary message

**Agent Carryover State**:
Workspace state outside transcript history that can influence future agent turns.
_Avoid_: hidden context, leftovers

**Context Boundary**:
A transcript marker that divides provider-eligible context windows without deleting transcript history.
_Avoid_: synthetic assistant message, compacted message

**Hard Clear**:
A destructive operation that deletes transcript history for the active workspace.
_Avoid_: context reset, soft clear

**Provider-Eligible Message**:
A transcript message that can contribute content to a future agent request.
_Avoid_: persisted row, visible message

**Transcript Export**:
A shared or copied representation of transcript history, including visible context boundaries.
_Avoid_: active context export

**Transcript Density**:
A presentation preference for how much transcript detail is visible while reading a workspace.
_Avoid_: compaction, context compaction

**Hyper Transcript Density**:
The most aggressive **Transcript Density**, focused on surfacing important conversation progress while reducing low-signal transcript detail.
_Avoid_: hyper compact mode, compaction mode

**Operational Bundle**:
A presentation grouping of adjacent low-signal operational transcript details.
_Avoid_: timeline rail, global operation summary

**Validation Event**:
A first-class transcript event showing that the workspace was checked for correctness.
_Avoid_: generic shell command, operational noise

**Mutation Event**:
A first-class transcript event showing that workspace or external state was changed.
_Avoid_: generic shell command, operational noise

## Relationships

- A **Hard Clear** deletes **Transcript History**.
- A **Context Reset** preserves **Transcript History**.
- A **Context Reset** creates a **Context Reset Boundary**.
- A **Compaction Boundary** is a kind of **Context Boundary**.
- A **Context Reset Boundary** is a kind of **Context Boundary**.
- A **Context Reset Boundary** separates older **Transcript History** from the new **Active Conversation Context**.
- Older **Transcript History** above a **Context Reset Boundary** can be hidden behind load-older history.
- **Active Conversation Context** may be smaller than **Transcript History**.

- A **Context Reset** clears **Agent Carryover State** so previous work does not influence future agent turns.
- A **Context Reset Boundary** is created only when the current context window contains at least one **Provider-Eligible Message**.
- A **Context Reset Boundary** is visible transcript structure, not conversation content for the agent.

- Context usage reflects **Active Conversation Context**, not all loaded **Transcript History**.
- Messages above the latest **Context Boundary** are viewable and exportable but cannot directly mutate the current **Active Conversation Context**.
- A **Transcript Export** can include **Transcript History** from above a **Context Reset Boundary**.

- **Hyper Transcript Density** is a kind of **Transcript Density**.
- **Transcript Density** changes the presentation of **Transcript History**, not what is preserved.
- **Transcript Density** does not change **Active Conversation Context**.

- **Hyper Transcript Density** can present low-signal transcript detail as **Operational Bundles**.
- An **Operational Bundle** preserves local transcript order instead of summarizing unrelated operations across a whole turn.
- Conversation rows bound **Operational Bundles**; they should not swallow the pacing between user prompts and assistant decisions.

- Successful material changes remain first-class transcript events under **Hyper Transcript Density**.
- **Operational Bundles** are for low-signal operational details, not for hiding material changes.

- **Validation Events** remain visible under **Hyper Transcript Density**.
- A successful **Validation Event** may be visually compact, but it is not hidden inside an **Operational Bundle**.

- **Mutation Events** remain visible under **Hyper Transcript Density**.
- A **Mutation Event** may be visually compact, but it is not hidden inside an **Operational Bundle**.

- A single low-signal operation can still be represented as an **Operational Bundle** so **Hyper Transcript Density** reduces detail without making agent work invisible.

- **Operational Bundles** default collapsed under **Hyper Transcript Density**.
- Active low-signal work can remain compact unless it becomes long-running or attention-worthy.

- An expanded **Operational Bundle** reveals the transcript details it grouped.

- An **Operational Bundle** can remain expanded while it contains active low-signal work, then collapse after that work settles and the transcript moves on.

- Low-impact operational misses can remain inside **Operational Bundles**; attention-worthy failures remain first-class transcript events.

## Example dialogue

> **Dev:** "After a **Context Reset**, can the agent answer from messages above the **Context Reset Boundary**, or see a hidden note that the reset happened?"
> **Domain expert:** "No — those messages remain in **Transcript History**, and the boundary is visible transcript structure, but neither is part of the agent's **Active Conversation Context**."

> **Dev:** "Are **Compaction Boundaries** and **Context Reset Boundaries** separate mechanisms?"
> **Domain expert:** "No — both are **Context Boundaries**. A **Compaction Boundary** summarizes earlier history for the agent; a **Context Reset Boundary** does not."

> **Dev:** "Should `/clear` preserve **Transcript History** now that **Context Reset** exists?"
> **Domain expert:** "No — `/clear` remains a **Hard Clear**. `/clear --soft` performs a **Context Reset**."

> **Dev:** "If there is no **Transcript History**, should a **Context Reset** create a boundary anyway?"
> **Domain expert:** "No — without earlier history, there is nothing for a **Context Reset Boundary** to separate."

> **Dev:** "If the user repeats `/clear --soft` before sending another message, should we append another **Context Reset Boundary**?"
> **Domain expert:** "No — repeated resets with no active-context messages are no-op successes."

> **Dev:** "Should the `/clear --soft` command itself appear as a user message?"
> **Domain expert:** "No — a **Context Reset** is represented by a **Context Reset Boundary**, not by a user prompt."

> **Dev:** "Can a **Context Reset** happen while the agent is still responding?"
> **Domain expert:** "No — context can only be reset once the active turn has stopped and transcript ordering is stable."

> **Dev:** "How should users find **Context Reset** outside slash commands?"
> **Domain expert:** "Expose it as a separate command from **Hard Clear**, named around resetting context while preserving history."

> **Dev:** "What should the visible separator say?"
> **Domain expert:** "Use `Context reset`; avoid labels that imply transcript history was deleted."

> **Dev:** "Should a **Context Reset Boundary** show when it happened?"
> **Domain expert:** "Persist the timestamp for ordering and audit, but keep the visible separator label simple."

> **Dev:** "Can a **Context Reset** happen while user input is queued?"
> **Domain expert:** "No — queued input belongs to the old context and must be sent or cleared before resetting."

> **Dev:** "What happens to pending composer content when a user performs a **Context Reset**?"
> **Domain expert:** "Resetting context starts fresh, so pending composer state should not carry over."

> **Dev:** "Should partial or aborted messages before a **Context Reset Boundary** be cleaned up?"
> **Domain expert:** "No — they remain **Transcript History** above the boundary, but are outside the new **Active Conversation Context**."

> **Dev:** "Does **Hyper Transcript Density** compact the context or alter what the agent will see next?"
> **Domain expert:** "No — it only changes how **Transcript History** is presented to the user. It never changes **Active Conversation Context**."

> **Dev:** "Should **Hyper Transcript Density** merge every successful tool in a turn into one summary?"
> **Domain expert:** "No — group adjacent low-signal details into **Operational Bundles** so the transcript still shows the pacing between inspection, decisions, fixes, failures, and validation."

> **Dev:** "Should a successful file edit be hidden inside an **Operational Bundle** if it happened between reads and shell commands?"
> **Domain expert:** "No — material changes remain visible as first-class transcript events. Bundle the surrounding low-signal operations instead."

> **Dev:** "If `make static-check` passes, can **Hyper Transcript Density** hide it inside an **Operational Bundle**?"
> **Domain expert:** "No — correctness checks are **Validation Events**. They can be compact, but they remain visible."

> **Dev:** "Can a successful command that committed, pushed, installed, generated, or reformatted state be hidden inside an **Operational Bundle**?"
> **Domain expert:** "No — state-changing work is a **Mutation Event**. It can be compact, but it remains visible."

> **Dev:** "If there is only one low-signal operation between conversation rows, should **Hyper Transcript Density** hide it entirely?"
> **Domain expert:** "No — show a compact **Operational Bundle** so the transcript still reveals that work happened."

> **Dev:** "Should **Operational Bundles** auto-expand while the agent streams so users can watch every detail?"
> **Domain expert:** "No — **Hyper Transcript Density** defaults bundles collapsed. Only long-running or attention-worthy active work should break that compact presentation."

> **Dev:** "When an **Operational Bundle** expands, should it show a separate simplified summary instead of the grouped transcript details?"
> **Domain expert:** "No — expansion should reveal the transcript details that were grouped, so compact presentation does not lose inspectability."

> **Dev:** "Must active low-signal work stay outside an **Operational Bundle** until it completes?"
> **Domain expert:** "No — it can be grouped while active, as long as the bundle remains expanded until the work settles and the transcript moves on."

> **Dev:** "Should every failed command escape an **Operational Bundle**?"
> **Domain expert:** "No — low-impact operational misses can stay bundled. Attention-worthy failures, such as correctness or state-changing failures, remain first-class transcript events."

## Flagged ambiguities

- "soft clear" is a user-facing command style, not the domain concept; resolved: use **Context Reset** for the behavior.
- "compaction boundary" implies summarization; resolved: use **Context Reset Boundary** for a reset without summarization.
- "hyper compact mode" sounds like context compaction; resolved: use **Hyper Transcript Density** for the presentation-only behavior.
