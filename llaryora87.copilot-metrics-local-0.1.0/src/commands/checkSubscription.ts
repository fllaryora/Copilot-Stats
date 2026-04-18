import * as vscode from "vscode";


export function registerCheckSubscriptionCommand(context: vscode.ExtensionContext) {
    let command = vscode.commands.registerCommand("copilotMetrics.checkSubscription", async () => {
        const copilot = vscode.extensions.getExtension("GitHub.copilot");
        if (copilot?.isActive) {
            vscode.window.showInformationMessage("✅ You have an active GitHub Copilot subscription!");
        } else {
            vscode.window.showWarningMessage("❌ GitHub Copilot is not active.");
        }
    });

    context.subscriptions.push(command);
}
