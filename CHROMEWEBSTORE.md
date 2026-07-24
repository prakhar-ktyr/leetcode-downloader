# Chrome Web Store Listing — DSA Problem Downloader

> Last Updated: 2026-07-24

## Store Listing

**Extension Name** [REQUIRED]
DSA Problem Downloader

**Short Description** [REQUIRED]
Download LeetCode, GeeksforGeeks, and Code360 problems as starter code files in any available language.

**Detailed Description** [REQUIRED]
DSA Problem Downloader lets you download LeetCode, GeeksforGeeks, and Code360 problems as ready-to-code starter files — complete with the problem description as comments and the exact starter code in your chosen language.

FEATURES
• Multi-platform support — works on LeetCode, GeeksforGeeks, and Code360 problem pages
• Exact language selector — choose from every language the problem supports, not just the one shown on the page
• Smart auto-detection — preselects the language currently displayed on the page, with manual override
• Structured data extraction — reads LeetCode's GraphQL API, GeeksforGeeks' embedded page state, and Code360's public problem APIs instead of fragile DOM scraping
• Smart commenting — wraps the problem description in the correct comment syntax for your chosen language
• Clean file naming — saves the starter file with a descriptive filename and correct extension

HOW TO USE
1. Open any problem page on LeetCode, GeeksforGeeks, or Code360
2. Click the DSA Problem Downloader icon in the toolbar
3. Pick the language you want from the dropdown
4. Click "Download Starter File"
5. A file with the problem description and starter code is saved to your Downloads folder

PRIVACY
This extension does not collect, store, or transmit any personal data. Downloaded files are generated locally on your device. No analytics, no cookies, no third-party services.

PERMISSIONS
• "Read and change data on supported problem sites" — needed to read the problem title, description, constraints, and starter code from the page's structured data or first-party problem endpoints. The extension only activates when you click its icon on a supported problem page.
• "activeTab" — grants temporary access to the current tab only when you click the extension icon. No background access.
• "scripting" — used to inject the content script that reads problem data from the page.

SUPPORT
Found a bug? Have a suggestion? Open an issue at https://github.com/prakhar-ktyr/leetcode-downloader/issues

Version 1.3.1 — Fixed exponent/subscript rendering in downloaded problem descriptions.

**Category** [REQUIRED]
Developer Tools

**Single Purpose** [REQUIRED]
Downloads LeetCode, GeeksforGeeks, and Code360 coding problems as starter code files in the user's chosen programming language.

**Primary Language** [REQUIRED]
English


## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | icons/icon-128.png |
| Screenshot 1 [REQUIRED] | 1280×800 or 640×400 | ⬜ Not created | |
| Screenshot 2 [RECOMMENDED] | 1280×800 or 640×400 | ⬜ Not created | |
| Screenshot 3 [RECOMMENDED] | 1280×800 or 640×400 | ⬜ Not created | |
| Small Promo Tile [RECOMMENDED] | 440×280 | ⬜ Not created | |

### Screenshot Notes
- Screenshot 1: Show the popup open on a LeetCode problem page with the language dropdown visible
- Screenshot 2: Show a downloaded file open in VS Code or another editor
- Screenshot 3: Show the popup working on a GeeksforGeeks problem page


## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `activeTab` | permissions | Grants temporary access to the current tab only when the user clicks the extension icon. Used to inject the content script that reads problem data from the active page. No background or persistent access. |
| `scripting` | permissions | Required to inject `content.js` into the active tab, which reads the problem title, description, and starter code from LeetCode's GraphQL response, GeeksforGeeks' embedded page state, or Code360's first-party problem APIs. |
| `https://leetcode.com/*` | host_permissions | The content script reads the structured problem data (title, description, constraints, starter code) from LeetCode problem pages. Access is scoped to leetcode.com only. |
| `https://geeksforgeeks.org/*` | host_permissions | The content script reads problem data from GeeksforGeeks pages at the root domain. |
| `https://www.geeksforgeeks.org/*` | host_permissions | GeeksforGeeks uses the www subdomain; this covers pages served from www.geeksforgeeks.org. |
| `https://practice.geeksforgeeks.org/*` | host_permissions | GeeksforGeeks problem pages are also served from the practice subdomain. |
| `https://www.naukri.com/*` | host_permissions | The content script activates on Code360 problem pages served from the Naukri domain and reads the currently open problem context before requesting the corresponding public starter-code payload. |


## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** No

This extension does not collect, transmit, or store any user data for analytics or tracking. All downloaded files are generated locally in the browser. For supported platforms that expose problem data through first-party APIs, the extension may request the current problem description and starter code directly from that platform's own endpoints.

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes


## Privacy Policy

**Privacy Policy URL** [RECOMMENDED]
<!-- Host at: https://github.com/prakhar-ktyr/leetcode-downloader/blob/main/PRIVACY.md -->
<!-- Or use GitHub Pages: https://prakhar-ktyr.github.io/leetcode-downloader/privacy -->

Privacy Policy for DSA Problem Downloader

Last updated: 2026-06-18

DSA Problem Downloader does not collect, store, or transmit any personal data or
browsing information to the developer or third parties. Downloaded files stay on your device.

This extension does not use cookies, analytics, or third-party services. For supported platforms such as LeetCode and Code360, it may issue first-party requests to retrieve the currently open problem data and starter code.

If you have questions, open an issue at https://github.com/prakhar-ktyr/leetcode-downloader/issues


## Distribution

**Visibility**: Public
**Regions**: All regions
**Pricing**: Free


## Developer Info

**Publisher Name** [REQUIRED]
<!-- Your name or organization name -->

**Contact Email** [REQUIRED]
<!-- This email is displayed publicly on the store listing -->

**Support URL / Email** [RECOMMENDED]
https://github.com/prakhar-ktyr/leetcode-downloader/issues

**Homepage URL** [RECOMMENDED]
https://github.com/prakhar-ktyr/leetcode-downloader


## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.3.1 | 2026-07-24 | Fixed superscript/subscript rendering in problem descriptions | Ready |
| 1.3 | 2026-06-18 | Added Code360 support and normalized Python indentation in downloaded `.py` files | Released |
| 1.2 | 2026-05-30 | Added GeeksforGeeks support, improved language detection | Draft |
| 1.0 | — | Initial release with LeetCode support | — |


## Review Notes

### Known Issues / Limitations
- Extension only works on problem pages (/problems/...), not on contest or editorial pages
- Requires the problem page to be fully loaded before clicking the extension icon
- The `chrome.action.onClicked` listener in background.js will NOT fire because `default_popup` is set in manifest.json (this is expected — the popup handles everything)

### Rejection History
<!-- None yet -->
