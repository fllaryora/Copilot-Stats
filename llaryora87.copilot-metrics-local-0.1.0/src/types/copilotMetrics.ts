/** Interface describing per-file usage data */
interface FileUsage {
    lines: number;
    chars: number;
    language: string;
}
  
export interface CopilotMetrics {
    totalGhostCompletions: number;
    totalChatGenerations: number;
    totalChatsAccepted: number;
    totalLinesGenerated: number;
    totalCharsGenerated: number;
    totalPastes: number;
    totalInlineChat: number;
    fileUsage: { [key: string]: FileUsage };
    userEmail: string;
}
  