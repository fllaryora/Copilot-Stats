import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { copilotMetrics } from "./trackers/metrics";

export async function persistDailyCsv(context: vscode.ExtensionContext) {
  const today = new Date().toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
  //const lastSavedDay = context.globalState.get<string>("lastCsvDay");

  //   if (lastSavedDay === today) {
  //     return; // ya guardado hoy
  //   }

  if (
    copilotMetrics.totalGhostCompletions === 0 &&
    copilotMetrics.totalPastes === 0 &&
    copilotMetrics.totalChatGenerations === 0 &&
    copilotMetrics.totalInlineChat === 0 &&
    copilotMetrics.totalChatsAccepted === 0 &&
    copilotMetrics.totalLinesGenerated === 0 &&
    copilotMetrics.totalCharsGenerated === 0
  ) {
    return; // no metrics to save
  }
  const dir = context.globalStorageUri.fsPath;
  const filePath = path.join(dir, "copilot-metrics.csv");

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const header =
    "date,totalGhostCompletions,totalPastes,totalChatGenerations,totalInlineChat,totalChatsAccepted,totalLinesGenerated,totalCharsGenerated,fileUsageLines,fileUsageChars\n";

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, header);
  }

  const row =
    [
      today,
      copilotMetrics.totalGhostCompletions,
      copilotMetrics.totalPastes,
      copilotMetrics.totalChatGenerations,
      copilotMetrics.totalInlineChat ?? 0,
      copilotMetrics.totalChatsAccepted ?? 0,
      copilotMetrics.totalLinesGenerated ?? 0,
      copilotMetrics.totalCharsGenerated ?? 0,
    ].join(",") + "\n";

  fs.appendFileSync(filePath, row);
  resetMetrics();

  //await context.globalState.update("lastCsvDay", today);
}

function resetMetrics() {
  copilotMetrics.totalGhostCompletions = 0;
  copilotMetrics.totalPastes = 0;
  copilotMetrics.totalChatGenerations = 0;
  copilotMetrics.totalInlineChat = 0;
  copilotMetrics.totalChatsAccepted = 0;
  copilotMetrics.totalLinesGenerated = 0;
  copilotMetrics.totalCharsGenerated = 0;
  copilotMetrics.fileUsage = {};
}
