import * as vscode from "vscode";
import { copilotMetrics } from "./metrics";


function isOnlyWhitespaceOrNewline(text: string): boolean {
    const withoutWhitespace = text.replace(/\s/g, "");
    return withoutWhitespace === "";
}

export function isPotentialCopilotChunk(insertedText: string, lines: number, chars: number): boolean {
    if (isOnlyWhitespaceOrNewline(insertedText)) {
        return false;
    }
    if (chars > 5 || lines > 1) {
        return true;
    }
    return false;
}

export function incrementCopilotGhostCount(
    editor: vscode.TextEditor,
    insertedText: string,
    lines: number,
    chars: number
) {
    copilotMetrics.totalGhostCompletions++;
    copilotMetrics.totalLinesGenerated += lines;
    copilotMetrics.totalCharsGenerated += chars;

    const doc = editor.document;
    const filePath = doc.fileName;
    const language = doc.languageId;
    if (!copilotMetrics.fileUsage[filePath]) {
        copilotMetrics.fileUsage[filePath] = { lines: 0, chars: 0, language };
    }
    copilotMetrics.fileUsage[filePath].lines += lines;
    copilotMetrics.fileUsage[filePath].chars += chars;
}