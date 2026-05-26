# DSA Problem Downloader Extension

A lightweight Chrome/Firefox extension that opens a language selector for LeetCode and GeeksforGeeks problems, then downloads the exact starter file you choose.

Instead of brittle scraping, the extension reads each site's structured problem payload to reliably pull the problem title, description, constraints, and starter code for the language you select in the popup.

This tool automates the extraction process—perfect for compiling offline Data Structures and Algorithms study notes, practicing locally in your IDE, or staging algorithm content for educational platforms like AlgoJourney.

## Features
* **Multi-Platform Support:** Open supported problem pages on LeetCode or GeeksforGeeks and download them from the same extension popup.
* **Exact Language Selector:** Choose from the exact languages exposed by the current problem before downloading, so stale page state does not force the wrong file type.
* **Smart Defaulting:** Preselects the detected page language when available, but always lets you override it manually.
* **Structured Data Extraction:** Uses LeetCode's GraphQL data and GeeksforGeeks' embedded page state instead of relying on brittle selectors.
* **Smart Commenting:** Wraps the HTML-stripped problem description in the correct comment syntax for your chosen language.

## How It Works
1. Open a supported LeetCode or GeeksforGeeks problem page.
2. Click the extension icon to open the popup.
3. Pick the language you want from the selector.
4. Click **Download Starter File**.

## How to Install Locally
1. Clone this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the cloned directory.