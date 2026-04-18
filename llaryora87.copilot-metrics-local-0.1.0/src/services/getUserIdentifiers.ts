import * as vscode from "vscode";

/**
 * Retrieves the user's email from global state.
 * If they don't exist, it prompts for the email.
 */
export async function getUserIdentifier(
  context: vscode.ExtensionContext,
): Promise<{
  email: string;
}> {
  let email = context.globalState.get<string>("userEmail", "");

  // If email isn't provided, we can prompt once or simply leave it blank.
  if (!email) {
    email =
      (await vscode.window.showInputBox({
        prompt: "llaryora87: Please enter your email address.",
        placeHolder: "email@example.com",
        ignoreFocusOut: true,
      })) || "";

    await context.globalState.update("userEmail", email);
  }

  return { email };
}
