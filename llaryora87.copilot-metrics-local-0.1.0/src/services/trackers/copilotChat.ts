import * as vscode from "vscode";
import { copilotMetrics } from "./metrics";
import { updateStatusBar } from "../statusBar";

interface ChatResponseData {
    accepted: boolean;
    versions: string[];
}

export const trackedChatResponses = new Map<string, ChatResponseData>();
export let lastChatResponseTime = 0;

export function trackCopilotChatUsage() {
    vscode.window.onDidChangeVisibleTextEditors((editors) => {
        for (const editor of editors) {
            const fileName = editor.document.fileName.toLowerCase();
            console.log("📄 Checking file:", fileName);
            if (fileName.includes("response_")) {
                const match = fileName.match(/(response_[^\\\/]+)/);
                if (match) {
                    lastChatResponseTime = Date.now();
                    const responseId = match[1];
                    const chatText = editor.document.getText().trim();
                    if (!chatText) continue;
                    
                    if (!trackedChatResponses.has(responseId)) {
                        trackedChatResponses.set(responseId, { accepted: false, versions: [chatText] });
                        copilotMetrics.totalChatGenerations++;
                        console.log(`🗨️ New Copilot Chat Response detected: ${responseId}.`);
                    } else {
                        const data = trackedChatResponses.get(responseId)!;
                        if (!data.versions.includes(chatText)) {
                            data.versions.push(chatText);
                            console.log(`➕ Copilot Chat Response updated for ${responseId}: New version added.`);
                        }
                    }
                    updateStatusBar();
                }
            }
        }
    });
}
