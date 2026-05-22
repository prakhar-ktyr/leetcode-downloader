# LeetCode Downloader Extension

A lightweight Chrome/Firefox extension that extracts LeetCode problem data and downloads it as a local file, ready for coding. 

Instead of brittle web scraping, this extension intercepts LeetCode's native GraphQL API to reliably pull the problem title, description, constraints, and the exact starter code for your selected language. 

This tool automates the extraction process—perfect for compiling offline Data Structures and Algorithms study notes, practicing locally in your IDE, or staging algorithm content for educational platforms like AlgoJourney.

## Features
* **GraphQL Integration:** Bypasses dynamic DOM rendering to fetch clean, reliable data directly from the LeetCode backend.
* **Auto-Language Detection:** Reads your active browser local storage to automatically download the correct file extension.
* **Smart Commenting:** Wraps the HTML-stripped problem description in the correct comment syntax for your chosen language.

## How to Install Locally
1. Clone this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the cloned directory.