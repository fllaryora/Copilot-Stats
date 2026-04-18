# Copilot Usage Metrics Extension

## Overview
This VS Code extension tracks and displays usage metrics for GitHub Copilot, including completions and chat generations. It provides insights into how Copilot assists you in coding by counting lines and characters generated, as well as file-based usage statistics.

## Features
- Tracks Copilot-generated completions in the editor.
- Tracks Copilot chat generations.
- Aggregates total lines and characters generated.
- Provides per-file usage statistics.
- Displays collected metrics in a user-friendly format.

## Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/copilot-usage-metrics.git
   cd copilot-usage-metrics
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Compile the extension:
   ```sh
   npm run compile
   ```
4. Launch the extension in VS Code:
   ```sh
   code --extensionDevelopmentPath=.
   ```

## Usage
1. Open VS Code with the extension installed.
2. Start coding with Copilot.
3. Run the command **"Show Copilot Metrics"** in the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS).
4. View the collected metrics in an information message.

## Development
- **Build**: `npm run compile`
- **Watch Mode**: `npm run watch`
- **Test**: Currently, no test cases are implemented.

## Publishing
To publish the extension to the VS Code Marketplace:
```sh
vsce package
```

## License
This project is licensed under the MIT License.

## Contributions
Contributions are welcome! Feel free to submit issues or pull requests.

## Author
[Your Name]  
[Your GitHub Profile]  
[Your Email]

