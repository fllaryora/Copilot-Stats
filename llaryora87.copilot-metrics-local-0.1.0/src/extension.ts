import * as vscode from "vscode";
import { copilotMetrics } from "./services/trackers/metrics";
import {
  trackTabKey,
  trackGhostTextCompletion,
} from "./services/trackers/copilotGhostText";
import { trackCopilotChatUsage } from "./services/trackers/copilotChat";
import { trackCopilotInlineChat } from "./services/trackers/copilotInlineChat";
import { registerShowMetricsCommand } from "./commands/show";
import { registerCheckSubscriptionCommand } from "./commands/checkSubscription";
import { registerResetGlobalStateCommand } from "./commands/resetGlobalState";
import { setStatusBarCallback } from "./services/statusBar";
import { getUserIdentifier } from "./services/getUserIdentifiers";
import { getUserConsent } from "./services/getUserConsent";
import { persistDailyCsv } from "./services/sendMetrics";

let statusBarItem: vscode.StatusBarItem;
let metricsTimer: NodeJS.Timeout;

let extensionContext: vscode.ExtensionContext | undefined;
export async function activate(context: vscode.ExtensionContext) {
  if (context === undefined) return;
  console.log("🟢 Copilot Usage Metrics extension is now active! 🟢");

  // Register commands.
  registerShowMetricsCommand(context);
  registerCheckSubscriptionCommand(context);
  registerResetGlobalStateCommand(context);

  let { consent } = await getUserConsent(context);

  if (!consent) return;

  const { email } = await getUserIdentifier(context);
  updateIdentifiers(email);

  // Set up ghost text (inline completions) tracking.
  trackTabKey();
  setStatusBarCallback(updateStatusBarInternal);

  // Set up chat tracking.
  trackCopilotChatUsage();
  trackGhostTextCompletion();
  trackCopilotInlineChat();

  // Initialize the status bar item.
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100,
  );
  context.subscriptions.push(statusBarItem);

  // Map status bar click to the showMetrics command.
  statusBarItem.command = "copilotMetrics.show";
  updateStatusBarInternal();

  // Start periodic metrics sending.
  metricsTimer = setInterval(
    async () => {
      extensionContext = context;
      await persistDailyCsv(context);
    },
    30 * 60 * 1000,
  ); // 30 minutes
}

export function deactivate() {
  if (metricsTimer) {
    clearInterval(metricsTimer);
  }
  if (extensionContext) {
    persistDailyCsv(extensionContext);
  }
}

function updateStatusBarInternal() {
  statusBarItem.text = `🤖 Ghosts: ${copilotMetrics.totalGhostCompletions} | 📋 Pasted: ${copilotMetrics.totalPastes} | 💬 Chat: ${copilotMetrics.totalChatGenerations} | 💬 Inline: ${copilotMetrics.totalInlineChat || 0}`;
  statusBarItem.show();
}

function updateIdentifiers(email: string) {
  copilotMetrics.userEmail = email;
}
