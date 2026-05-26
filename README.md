# DSA Problem Downloader Extension

A lightweight Chrome/Firefox extension that extracts problem data from LeetCode and GeeksforGeeks and downloads it as a local file, ready for coding.

Instead of brittle scraping, the extension reads each site's structured problem payload to reliably pull the problem title, description, constraints, and starter code for your selected language.

This tool automates the extraction process—perfect for compiling offline Data Structures and Algorithms study notes, practicing locally in your IDE, or staging algorithm content for educational platforms like AlgoJourney.

## Features
* **Multi-Platform Support:** Download supported problem pages from LeetCode and GeeksforGeeks with the same click.
* **Structured Data Extraction:** Uses LeetCode's GraphQL data and GeeksforGeeks' embedded page state instead of relying on brittle selectors.
* **Auto-Language Detection:** Uses the active language selection when available and falls back to the site's default starter template.
* **Smart Commenting:** Wraps the HTML-stripped problem description in the correct comment syntax for your chosen language.

## How to Install Locally
1. Clone this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the cloned directory.