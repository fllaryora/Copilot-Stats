Primero : Instalar el plugin como archivo vx.
El Plugin llaryora87.copilot-metrics-local debera generar un archivo csv en 
/Users/<usuario>/Library/Application Support/Code/User/globalStorage/llaryora87.copilot-metrics-local/copilot-metrics.csv

Si no existe lolamento:

instalas python3 de alguna manera:
instalas uv 
tiras un where a uv y te da el path y lo guardas en tu corazon.
ejemplo: "/Users/<usuario>/.local/bin/uv"


Configurar el Claude 

{
  "mcpServers": {
    "Copilot-Stats": {
      "command": "/Users/<usuario>/.local/bin/uv",
      "args": [
        "--directory",
        "<ruta al server>/Copilot-Stats/mcpServer/",
        "run",
        "main.py"
      ]
    }
  },
  "preferences": {
    "coworkScheduledTasksEnabled": false,
    "ccdScheduledTasksEnabled": false,
    "sidebarMode": "chat",
    "coworkWebSearchEnabled": true,
    "floatingAtollActive": true
  }
}
