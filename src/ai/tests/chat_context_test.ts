import { assertEquals } from "@std/assert";
import "../../../static/chat.js";

type PageContext = {
  kind: string;
  title: string;
  route: string;
  sourcePath: string;
};

const pageContext = (
  globalThis as typeof globalThis & {
    wodAgentPageContext: (
      state: Record<string, unknown>,
      route: string,
    ) => PageContext;
  }
).wodAgentPageContext;

const chatHelpers = globalThis as typeof globalThis & {
  wodAgentSessionLabel: (sessionId: string | null) => string;
  wodAgentTargetLabel: (context: Partial<PageContext> | null) => string;
  wodAgentPreviewUrl: (
    messages: Array<{ role: string; content: string }>,
  ) => string;
};

Deno.test("chat context: maps the visible notes page to its Markdown source", () => {
  assertEquals(
    pageContext({
      currentView: "notes",
      notesTitle: "Baby Interim — Playbook",
      notesPath: "/static/notes-baby-interim.md",
    }, "/notes/baby-interim"),
    {
      kind: "notes",
      title: "Baby Interim — Playbook",
      route: "/notes/baby-interim",
      sourcePath: "static/notes-baby-interim.md",
    },
  );
});

Deno.test("chat context: maps WOD's ordinary data views to canonical sources", () => {
  const cases: Array<[Record<string, unknown>, string, PageContext]> = [
    [
      { currentView: "exercises" },
      "/exercise-library",
      {
        kind: "exercise-library",
        title: "Exercise Library",
        route: "/exercise-library",
        sourcePath: "exercises",
      },
    ],
    [
      {
        currentView: "workout",
        selectedWorkout: { id: "push-a", name: "Push A" },
      },
      "/push-a",
      {
        kind: "workout",
        title: "Push A",
        route: "/push-a",
        sourcePath: "workouts",
      },
    ],
    [
      {
        currentView: "workout",
        selectedProgram: { id: "bulk", name: "Functional Bulk" },
        selectedWeekIdx: null,
      },
      "/program/bulk",
      {
        kind: "program",
        title: "Functional Bulk",
        route: "/program/bulk",
        sourcePath: "programs/bulk.json",
      },
    ],
    [
      {
        currentView: "workout",
        selectedActivity: {
          label: "Zone 2",
          _programId: "bulk",
          _programName: "Functional Bulk",
        },
      },
      "/activity/bulk-d6",
      {
        kind: "activity",
        title: "Zone 2",
        route: "/activity/bulk-d6",
        sourcePath: "programs/bulk.json",
      },
    ],
  ];

  for (const [state, route, expected] of cases) {
    assertEquals(pageContext(state, route), expected);
  }
});

Deno.test("chat ergonomics: makes the active session and target legible", () => {
  assertEquals(chatHelpers.wodAgentSessionLabel(null), "new");
  assertEquals(
    chatHelpers.wodAgentSessionLabel("3177c877-7767-4f28-8206-c642297be09d"),
    "3177c877",
  );
  assertEquals(
    chatHelpers.wodAgentSessionLabel("collab-swim-20260830"),
    "collab-swim-20260830",
  );
  assertEquals(
    chatHelpers.wodAgentTargetLabel({
      title: "Hip & Lower Back Flow",
      route: "/hip-lower-back-flow",
    }),
    "Hip & Lower Back Flow · /hip-lower-back-flow",
  );
});

Deno.test("chat ergonomics: exposes only safe static paths as previews", () => {
  assertEquals(
    chatHelpers.wodAgentPreviewUrl([
      {
        role: "assistant",
        content:
          "Created `/workspace/static/collaboration-proof/swim.svg` and checked it.",
      },
    ]),
    "/static/collaboration-proof/swim.svg",
  );
  assertEquals(
    chatHelpers.wodAgentPreviewUrl([
      {
        role: "assistant",
        content: "Read /workspace/static/../.env",
      },
    ]),
    "",
  );
  assertEquals(
    chatHelpers.wodAgentPreviewUrl([
      { role: "user", content: "/workspace/static/private.txt" },
    ]),
    "",
  );
});
