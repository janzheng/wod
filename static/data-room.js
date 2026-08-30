/**
 * WOD Ask — browser client for one separately hosted smolbox read-only data room.
 * The room owns its manifest, transcripts, and inference. This client has no
 * builder route and keeps its tab-scoped session separate from WOD Builder.
 */
function wodDataRoomBaseUrl(value) {
  var source = String(value || "").trim();
  if (!source) return "";
  try {
    var parsed = new URL(source);
    if (
      (parsed.protocol !== "http:" && parsed.protocol !== "https:") ||
      parsed.username || parsed.password || parsed.pathname !== "/" ||
      parsed.search || parsed.hash
    ) return "";
    return parsed.origin;
  } catch (_error) {
    return "";
  }
}

function wodDataRoomSessionId() {
  var suffix =
    globalThis.crypto && typeof globalThis.crypto.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
  return "wod-ask-" + suffix;
}

function validDataRoomSessionId(value) {
  return typeof value === "string" &&
    /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(value);
}

function dataRoomPanel() {
  return {
    dataRoomOpen: false,
    dataRoomStatus: "idle",
    dataRoomError: "",
    dataRoomManifest: null,
    dataRoomMessages: [],
    dataRoomInput: "",
    dataRoomLoading: false,
    dataRoomSessionId: "",

    initDataRoom() {
      var stored = "";
      try {
        stored = sessionStorage.getItem("wod-data-room-session-id") || "";
      } catch (_error) { /* tab storage is optional */ }
      this.dataRoomSessionId = validDataRoomSessionId(stored)
        ? stored
        : wodDataRoomSessionId();
      this.persistDataRoomSession();

      var configured = String(globalThis.WOD_DATA_ROOM_BASE_URL || "").trim();
      if (!configured) {
        this.dataRoomStatus = "offline";
        this.dataRoomError = "No read-only data room is configured.";
      } else if (!this.getDataRoomBaseUrl()) {
        this.dataRoomStatus = "offline";
        this.dataRoomError =
          "Data room configuration must be an exact http(s) origin.";
      }
    },

    getDataRoomBaseUrl() {
      return wodDataRoomBaseUrl(globalThis.WOD_DATA_ROOM_BASE_URL);
    },

    toggleDataRoom() {
      this.dataRoomOpen = !this.dataRoomOpen;
      if (!this.dataRoomOpen) return;
      this.chatOpen = false;
      if (this.isMobile) this.sidebarOpen = false;
      if (this.dataRoomStatus === "idle") this.checkDataRoom();
      this.focusDataRoomInput();
    },

    async checkDataRoom() {
      if (this.dataRoomLoading || this.dataRoomStatus === "checking") return;
      var configured = String(globalThis.WOD_DATA_ROOM_BASE_URL || "").trim();
      var base = this.getDataRoomBaseUrl();
      if (!base) {
        this.dataRoomStatus = "offline";
        this.dataRoomError = configured
          ? "Data room configuration must be an exact http(s) origin."
          : "No read-only data room is configured.";
        return;
      }

      this.dataRoomStatus = "checking";
      this.dataRoomError = "";
      try {
        var healthResponse = await fetch(base + "/health", {
          cache: "no-store",
        });
        if (!healthResponse.ok) {
          throw new Error("health returned " + healthResponse.status);
        }

        var manifestResponse = await fetch(base + "/api/manifest", {
          cache: "no-store",
        });
        if (!manifestResponse.ok) {
          throw new Error("manifest returned " + manifestResponse.status);
        }
        var manifestPayload = await manifestResponse.json();
        var manifest = manifestPayload && manifestPayload.manifest;
        if (
          !manifest || manifest.kind !== "smolbox-readonly-data-view" ||
          typeof manifest.source !== "string" ||
          typeof manifest.createdAt !== "string"
        ) throw new Error("manifest is invalid");

        var transcriptResponse = await fetch(
          base + "/api/chat/" + encodeURIComponent(this.dataRoomSessionId),
          { cache: "no-store" },
        );
        if (!transcriptResponse.ok) {
          throw new Error("transcript returned " + transcriptResponse.status);
        }
        var transcript = await transcriptResponse.json();
        if (!transcript || !Array.isArray(transcript.messages)) {
          throw new Error("transcript is invalid");
        }

        this.dataRoomManifest = manifest;
        this.dataRoomMessages = transcript.messages.map(function (message) {
          return {
            role: message.role === "user" ? "user" : "assistant",
            content: String(message.text || ""),
            error: message.role === "error",
          };
        });
        this.dataRoomStatus = "online";
        this.scrollDataRoomToBottom();
        this.focusDataRoomInput();
      } catch (_error) {
        this.dataRoomStatus = "offline";
        this.dataRoomError =
          "Read-only data room is offline. The WOD site still works normally.";
      }
    },

    async sendDataRoomMessage() {
      var message = this.dataRoomInput.trim();
      if (
        !message || this.dataRoomLoading || this.dataRoomStatus !== "online"
      ) return;
      var base = this.getDataRoomBaseUrl();
      if (!base) return;

      this.dataRoomMessages.push({ role: "user", content: message });
      this.dataRoomInput = "";
      this.dataRoomLoading = true;
      this.scrollDataRoomToBottom();
      try {
        var response = await fetch(base + "/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session: this.dataRoomSessionId,
            message: message,
          }),
        });
        var payload = await response.json().catch(function () {
          return {};
        });
        if (!response.ok) {
          throw new Error(payload.error || "chat returned " + response.status);
        }
        if (
          payload.session !== this.dataRoomSessionId ||
          typeof payload.reply !== "string"
        ) {
          throw new Error("chat response is invalid");
        }
        this.dataRoomMessages.push({
          role: "assistant",
          content: payload.reply,
        });
      } catch (_error) {
        this.dataRoomStatus = "offline";
        this.dataRoomError =
          "Read-only data room went offline. Refresh it manually to reconnect.";
        this.dataRoomMessages.push({
          role: "assistant",
          content: "The read-only room is offline. No retry was started.",
          error: true,
        });
      } finally {
        this.dataRoomLoading = false;
        this.scrollDataRoomToBottom();
        this.focusDataRoomInput();
      }
    },

    newDataRoomSession() {
      if (this.dataRoomLoading) return;
      this.dataRoomSessionId = wodDataRoomSessionId();
      this.dataRoomMessages = [];
      this.persistDataRoomSession();
      this.focusDataRoomInput();
    },

    persistDataRoomSession() {
      try {
        sessionStorage.setItem(
          "wod-data-room-session-id",
          this.dataRoomSessionId,
        );
      } catch (_error) { /* tab storage is optional */ }
    },

    dataRoomStatusLabel() {
      if (this.dataRoomStatus === "online") return "read only · online";
      if (this.dataRoomStatus === "checking") return "checking";
      return "offline";
    },

    dataRoomSessionLabel() {
      return this.dataRoomSessionId.length > 20
        ? this.dataRoomSessionId.slice(0, 17) + "…"
        : this.dataRoomSessionId;
    },

    dataRoomProjectionLabel() {
      return this.dataRoomManifest &&
          this.dataRoomManifest.projection === "whole-computer"
        ? "whole computer snapshot"
        : "selected folder snapshot";
    },

    dataRoomIncludedLabel() {
      var included = this.dataRoomManifest && this.dataRoomManifest.included;
      if (!included || typeof included.files !== "number") return "";
      return included.files + " files · " + Number(included.directories || 0) +
        " folders";
    },

    scrollDataRoomToBottom() {
      this.$nextTick(function () {
        var container = document.querySelector(".data-room-messages");
        if (container) container.scrollTop = container.scrollHeight;
      });
    },

    focusDataRoomInput() {
      this.$nextTick(function () {
        var input = document.querySelector(".data-room-input-field");
        if (input && !input.disabled) input.focus();
      });
    },
  };
}

globalThis.wodDataRoomBaseUrl = wodDataRoomBaseUrl;
globalThis.wodDataRoomPanel = dataRoomPanel;
