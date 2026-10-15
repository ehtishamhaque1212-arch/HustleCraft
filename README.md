# HustleCraft — Product Listing Studio

Responsive HTML/CSS/JavaScript project for the Side Hustle open-source AI theme.

## Run on Windows
1. Extract the ZIP into a folder.
2. Double-click `start-localhost.bat`.
3. Keep the terminal window open.
4. Visit **http://localhost:8000**.
5. Leave **Use local Ollama AI** unchecked to use instant demo mode. Enter a product and click **Generate my listing**.

If port 8000 is busy, open a terminal in this folder and run `python -m http.server 8001`, then visit http://localhost:8001.

## Optional local AI
Install Ollama from https://ollama.com/, run `ollama pull llama3.2`, and enable **Use local Ollama AI**. Ollama must be running. If browser requests are blocked by Ollama's CORS policy, the app explains the connection issue and falls back to demo output. You may need to configure `OLLAMA_ORIGINS` for the local website origin and restart Ollama.

## Important
Instant demo mode is template-based, not generative AI. Ollama mode uses an open-weight model locally.
