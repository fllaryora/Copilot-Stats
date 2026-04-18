import * as vscode from "vscode";

export function registerResetGlobalStateCommand(
  context: vscode.ExtensionContext,
) {
  let command = vscode.commands.registerCommand(
    "copilotMetrics.resetGlobalState",
    async () => {
      await context.globalState.update("userEmail", undefined);
      await context.globalState.update("llaryora87-Id", undefined);
      await context.globalState.update("llaryora87-TrackingConsent", undefined);
      vscode.window.showInformationMessage("Global state has been reset.");
    },
  );

  context.subscriptions.push(command);
}
