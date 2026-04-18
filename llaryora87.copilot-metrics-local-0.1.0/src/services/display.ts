import * as vscode from "vscode";
import { copilotMetrics } from "./trackers/metrics";

export function showMetrics() {

  const message = `
Ghost Completions: ${copilotMetrics.totalGhostCompletions},
Total Chat Generations: ${copilotMetrics.totalChatGenerations},
Total Chats Accepted: ${copilotMetrics.totalChatsAccepted},
Total Pasted: ${copilotMetrics.totalPastes},
Total Lines Generated: ${copilotMetrics.totalLinesGenerated},
Total Chars Generated: ${copilotMetrics.totalCharsGenerated},
Email: ${copilotMetrics.userEmail},
`;

  vscode.window.showInformationMessage(message);
}
