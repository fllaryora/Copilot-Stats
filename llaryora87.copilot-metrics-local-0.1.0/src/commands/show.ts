import * as vscode from "vscode";
import { showMetrics } from "../services/display";


export function registerShowMetricsCommand(context: vscode.ExtensionContext) {
    let command = vscode.commands.registerCommand("copilotMetrics.show", () => {
        showMetrics();
    });

    context.subscriptions.push(command);
}
