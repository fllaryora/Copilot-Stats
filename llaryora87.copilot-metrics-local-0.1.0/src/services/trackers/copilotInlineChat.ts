import * as vscode from "vscode";
import { copilotMetrics } from "./metrics";

/**
 * Tracks Copilot Inline Chat usage by checking for editors whose filename
 * contains a keyword (e.g. "copilot-inline"). Adjust this pattern as needed.
 */
export function trackCopilotInlineChat() {
    vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (
            editor &&
            editor.document.fileName.toLowerCase().includes("copilot-inline")
        ) {
            // Increment a new metric property. Make sure your CopilotMetrics interface has totalInlineChat.
            copilotMetrics.totalInlineChat = (copilotMetrics.totalInlineChat || 0) + 1;
            console.log(
                `💬 Copilot Inline Chat detected (Total Inline Chat: ${copilotMetrics.totalInlineChat})`
            );
        }
    });
}
