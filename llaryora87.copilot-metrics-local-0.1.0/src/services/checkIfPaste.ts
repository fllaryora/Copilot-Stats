
import * as vscode from 'vscode';

/**
 * Checks if the inserted text matches the clipboard after normalization.
 * Handles multi-cursor paste by ensuring each insertion matches the (normalized) clipboard.
 */
export async function checkIfPaste(changes: vscode.TextDocumentContentChangeEvent[]): Promise<boolean> {
    // Get current clipboard text
    const clipboardText = await vscode.env.clipboard.readText();
    if (!clipboardText) {
        return false; // nothing in clipboard => can't match
    }

    // Normalize the clipboard text
    const normalizedClipboard = normalizeSnippet(clipboardText);

    // Gather and normalize all inserted segments
    const insertedSegments = changes.map((change) => normalizeSnippet(change.text));

    // Single change scenario
    if (insertedSegments.length === 1) {
        const segment = insertedSegments[0];
        return segment.length > 0 && segment === normalizedClipboard;
    }

    // Multi-cursor scenario: each insertion typically has the entire snippet
    const allMatch = insertedSegments.every(
        (segment) => segment.length > 0 && segment === normalizedClipboard
    );
    return allMatch;
}

/**
 * Normalizes a code snippet by:
 * 1) Converting CRLF -> LF
 * 2) Splitting into lines
 * 3) Trimming trailing spaces
 * 4) Removing leading/trailing blank lines
 * 5) Removing common leading indentation
 */
function normalizeSnippet(text: string): string {
    // 1) Convert Windows -> Unix line endings
    let output = text.replace(/\r\n/g, "\n");

    // 2) Split into lines
    let lines = output.split("\n");

    // 3) Trim trailing spaces from each line
    lines = lines.map((line) => line.replace(/\s+$/, ""));

    // 4) Remove leading/trailing blank lines
    while (lines.length && lines[0].trim() === "") {
        lines.shift();
    }
    while (lines.length && lines[lines.length - 1].trim() === "") {
        lines.pop();
    }

    // 5) Remove common leading indentation
    lines = stripCommonIndentation(lines);

    // Join back into a single normalized string
    return lines.join("\n");
}

/**
 * Removes the minimum common indentation across all non-empty lines.
 * e.g., if every line has at least 4 leading spaces, remove those 4 spaces.
 */
function stripCommonIndentation(lines: string[]): string[] {
    let minIndent = Infinity;

    for (const line of lines) {
        if (!line.trim()) {
            continue; // skip blank lines
        }
        const match = line.match(/^(\s+)/);
        if (match) {
            minIndent = Math.min(minIndent, match[1].length);
        } else {
            // At least one line starts at col 0, so there's no common indentation
            minIndent = 0;
            break;
        }
    }

    if (minIndent === Infinity || minIndent === 0) {
        // No indentation or none to remove
        return lines;
    }

    // Remove that indentation
    return lines.map((line) => {
        if (!line.trim()) return line; // blank line
        return line.slice(minIndent);
    });
}
