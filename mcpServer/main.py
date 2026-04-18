from fastmcp import FastMCP
from pathlib import Path
import csv
import json
from datetime import datetime
from collections import defaultdict

# RUN in console:
#uv run python main.py

#import json
#uv add fastmcp
mcp = FastMCP(name="MCP Server Copilot metrics")


CSV_PATH = (
    Path.home()
    / "Library"
    / "Application Support"
    / "Code"
    / "User"
    / "globalStorage"
    / "llaryora87.copilot-metrics-local"
    / "copilot-metrics.csv"
)

def safe_int(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return 0

@mcp.resource(
    uri="copilot://metrics/acceptance",
    description="Aggregated Copilot acceptance metrics derived from local CSV usage data",
    mime_type="application/json",
)
def copilot_acceptance_metrics():
    #date,
    if not CSV_PATH.exists():
        return json.dumps({
        "error": "Can not find the file"
    })

    total_ghosts = 0 #totalGhostCompletions
    total_pastes = 0 # totalPastes
    total_chat_generations = 0 #totalChatGenerations
    total_inline_chat = 0 #totalInlineChat
    total_chats_accepted = 0 #totalChatsAccepted
    total_lines_generated = 0 #totalLinesGenerated
    total_chars_generated = 0 #totalCharsGenerated
    file_usage_lines = 0 #fileUsageLines
    file_usage_chars = 0 #fileUsageChars
   
    min_date = None
    max_date = None

    with CSV_PATH.open(newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            date_str = row.get("date")
            if date_str:
                current_date = datetime.fromisoformat(date_str)

                if min_date is None or current_date < min_date:
                    min_date = current_date

                if max_date is None or current_date > max_date:
                    max_date = current_date

            total_ghosts += safe_int(row.get("totalGhostCompletions", 0))
            total_pastes += safe_int(row.get("totalPastes", 0))
            total_chat_generations += safe_int(row.get("totalChatGenerations", 0))
            total_inline_chat += safe_int(row.get("totalInlineChat", 0))
            total_chats_accepted += safe_int(row.get("totalChatsAccepted", 0))
            total_lines_generated += safe_int(row.get("totalLinesGenerated", 0))
            total_chars_generated += safe_int(row.get("totalCharsGenerated", 0))
            file_usage_lines += safe_int(row.get("fileUsageLines", 0))
            file_usage_chars += safe_int(row.get("fileUsageChars", 0))
         

    denominator = total_ghosts + total_pastes
    acceptance_rate = (
        total_ghosts / denominator if denominator > 0 else 0.0
    )

    return json.dumps({
        "acceptance_rate": round(acceptance_rate, 3),
        "ghosts": total_ghosts,
        "pastes": total_pastes,
        "totalChatGenerations": total_chat_generations,
        "totalInlineChat":total_inline_chat,
        "totalChatsAccepted": total_chats_accepted,
        "totalLinesGenerated": total_lines_generated,
        "totalCharsGenerated": total_chars_generated,
        "fileUsageLines": file_usage_lines,
        "fileUsageChars": file_usage_chars,
        "start_date": min_date.isoformat() if min_date else None,
        "end_date": max_date.isoformat() if max_date else None,
        "definition": "totalGhostCompletions / (totalGhostCompletions + totalPastes)"
    })

@mcp.resource(
    uri="copilot://metrics/raw",
    mime_type="application/json",
    description="Raw Copilot metrics CSV as JSON"
)
def copilot_raw_metrics():
    if not CSV_PATH.exists():
        return json.dumps({"error": "CSV not found"})

    rows = []

    with CSV_PATH.open(newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)

        for row in reader:
            rows.append(row)

    return json.dumps(rows)


@mcp.resource(
    uri="copilot://metrics/daily",
    description="Copilot metrics aggregated by day",
    mime_type="application/json",
)
def copilot_daily_metrics():
    if not CSV_PATH.exists():
        return json.dumps({"error": "CSV not found"})

    daily = defaultdict(lambda: {
        "ghosts": 0,
        "pastes": 0,
        "totalLinesGenerated": 0,
        "totalCharsGenerated": 0,
    })

    with CSV_PATH.open(newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)

        for row in reader:
            date_str = row.get("date")
            if not date_str:
                continue

            # 👉 solo YYYY-MM-DD
            day = date_str.split("T")[0]

            daily[day]["ghosts"] += safe_int(row.get("totalGhostCompletions"))
            daily[day]["pastes"] += safe_int(row.get("totalPastes"))
            daily[day]["totalLinesGenerated"] += safe_int(row.get("totalLinesGenerated"))
            daily[day]["totalCharsGenerated"] += safe_int(row.get("totalCharsGenerated"))

    # calcular acceptance por día
    result = []

    for day, data in sorted(daily.items()):
        denominator = data["ghosts"] + data["pastes"]
        acceptance = data["ghosts"] / denominator if denominator > 0 else 0

        result.append({
            "date": day,
            "acceptance_rate": round(acceptance, 3),
            **data
        })

    return json.dumps(result)


    #return {
    #        "acceptance_rate": round(acceptance_rate, 3),
    #        "ghosts": total_ghosts,
    #        "pastes": total_pastes,
    #        "windows": total_windows,
    #        "definition": "totalGhostCompletions / (totalGhostCompletions + totalPastes)"
    #}



def main():
    #with this line only exposes the public  tags, others will be disableds
    #mcp.enable(tags={"public"}, only=True)
    mcp.run()


if __name__ == "__main__":
    main()


#{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"manual-test","version":"1.0"}}}

#{"jsonrpc":"2.0","id":2,"method":"resources/list"}


#-->{"jsonrpc":"2.0","id":2,"result":{"resources":[{"name":"copilot_acceptance_metrics","uri":"copilot://metrics/acceptance","description":"Aggregated Copilot acceptance metrics derived from local CSV usage data","mimeType":"text/plain","_meta":{"fastmcp":{"tags":[]}}}]}}

#{"jsonrpc":"2.0","id":3,"method":"resources/read","params":{"uri":"copilot://metrics/acceptance"}}
#--->{"jsonrpc":"2.0","id":3,"result":{"contents":[{"uri":"copilot://metrics/acceptance","mimeType":"application/json","text":"{\"acceptance_rate\": 0.681, \"ghosts\": 669, \"pastes\": 314, \"windows\": 83, \"definition\": \"totalGhostCompletions / (totalGhostCompletions + totalPastes)\"}"}]}}




#{"jsonrpc":"2.0","id":3,"method":"resources/read","params":{"uri":"copilot://metrics/raw"}}

#{"jsonrpc":"2.0","id":3,"method":"resources/read","params":{"uri":"copilot://metrics/daily"}}


