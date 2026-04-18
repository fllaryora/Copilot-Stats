import * as vscode from "vscode";

export async function getUserConsent(
  context: vscode.ExtensionContext,
): Promise<{ consent: boolean }> {
  let consent = context.globalState.get<boolean>(
    "llaryora87-TrackingConsent",
    false,
  );
  if (!consent) {
    const selection = await vscode.window.showInformationMessage(
      'The tracking is going to store  find ~/Library/Application\\ Support/Code -name "copilot-metrics.csv"?',
      "Yes",
      "No",
    );
    consent = selection === "Yes";
    await context.globalState.update("llaryora87-TrackingConsent", consent);
  }
  return { consent };
}
