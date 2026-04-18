import * as vscode from "vscode";
import { copilotMetrics } from "./metrics";
import { checkIfPaste } from "../checkIfPaste";
import { isPotentialCopilotChunk, incrementCopilotGhostCount } from "./utils";
import { trackedChatResponses, lastChatResponseTime } from "./copilotChat";
import { updateStatusBar } from "../statusBar";

let lastKeyPressed: string | null = null;

const chatFileIndicators = [
    "copilot-chat",
    "response_",
];

let ghostTextTimer: NodeJS.Timeout | null = null;

export function trackTabKey() {
    vscode.window.onDidChangeTextEditorSelection((event) => {
        if (event.kind === vscode.TextEditorSelectionChangeKind.Keyboard) {
            lastKeyPressed = "Tab";
        }
    });
}

/**
 * Called whenever text changes in an editor.
 * Uses:
 *   1) Clipboard matching to detect pastes.
 *   2) A Tab-based heuristic or fallback (large/multi-line) to count Copilot completions.
 *
 * Only tracks changes in files that belong to the workspace, in the active editor,
 * and not in files that belong to Copilot Chat (as determined by the file name).
 * A debounce timer is used to avoid race conditions.
 */
export async function trackGhostTextCompletion() {
    vscode.workspace.onDidChangeTextDocument(async (event: vscode.TextDocumentChangeEvent) => {
        if (event.contentChanges.length === 0) return;

        // Debounce: clear any pending timer.
        if (ghostTextTimer) {
            clearTimeout(ghostTextTimer);
        }

        ghostTextTimer = setTimeout(async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor || editor.document.uri.scheme !== "file" || editor !== vscode.window.activeTextEditor) return;

            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (workspaceFolders && workspaceFolders.length > 0) {
                const isInWorkspace = workspaceFolders.some(folder =>
                    editor.document.uri.fsPath.startsWith(folder.uri.fsPath)
                );
                if (!isInWorkspace) return;
            }

            const fileName = editor.document.fileName.toLowerCase();
            console.log("📄 File name:", fileName);
            if (chatFileIndicators.some(indicator => fileName.includes(indicator))) return;

            const changes = [...event.contentChanges];
            const insertedText = (changes[0].text).trim();

            if (Date.now() - lastChatResponseTime < 6000) {
                console.log("❌ Chat is getting generated, skipping ghost text count.");
                return;
            }
            let ghostMatchesChat = false;
            trackedChatResponses.forEach((data, responseId) => {
                if (
                    data.versions.some(version => {
                    const trimmedVersion = version.trim();
                    return (
                        trimmedVersion &&
                        (insertedText.startsWith(trimmedVersion) || trimmedVersion.startsWith(insertedText))
                    );
                    })
                ) {
                    ghostMatchesChat = true;
                    if (!data.accepted) {
                        data.accepted = true;
                        copilotMetrics.totalChatsAccepted++;
                        console.log(`✅ Response ${responseId} marked as accepted.`);
                    }
              }
            });
            if (ghostMatchesChat) {
                console.log("❌ Ghost text matches a stored chat response version. Skipping ghost text count.");
                return;
            }
            
            const isPaste = await checkIfPaste(changes);
            if (isPaste) {
                copilotMetrics.totalPastes++;
                console.log("📋 Detected paste (via clipboard match). Ignoring for Copilot stats.");
                lastKeyPressed = null;
                updateStatusBar();
                return;
            }

            const lines = insertedText.split("\n").length;
            const chars = insertedText.length;

            // a) Tab-based heuristic
            if (lastKeyPressed === "Tab" && chars > 2) {
                incrementCopilotGhostCount(editor, insertedText, lines, chars);
                console.log("✏️ Copilot completion detected (Tab-based heuristic):", insertedText);
                lastKeyPressed = null;
                updateStatusBar();
                return;
            }

            // b) Fallback heuristic: if it's a "big chunk" (more than 15 chars or multiple lines)
            if (isPotentialCopilotChunk(insertedText, lines, chars)) {
                incrementCopilotGhostCount(editor, insertedText, lines, chars);
                console.log("✏️ Copilot completion detected (Fallback heuristic):", insertedText);
                updateStatusBar();
            }
            lastKeyPressed = null;
        }, 1000); // 1 second debounce; adjust if necessary
    });
}
