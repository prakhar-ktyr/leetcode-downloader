# Changelog

All notable changes to this project are documented in this file.

## [1.4.0] - 2026-08-11

- Added InterviewBit problem support for `www.interviewbit.com/problems/...` pages.
- Added CSP-safe `inject.js` for extracting Monaco editor content and page data via `postMessage`, avoiding Manifest V3 inline script restrictions.
- Added internal API integration (`/v2/problems/.../codes/`) to fetch starter code for any language without manually switching the InterviewBit editor dropdown.
- Added `web_accessible_resources` entry for `inject.js` on InterviewBit domains.
- Updated extension metadata, privacy policy, and Chrome Web Store notes for the new provider and API usage.

## [1.3.1] - 2026-07-24

- Fixed superscript/subscript rendering in downloaded problem descriptions. HTML `<sup>` and `<sub>` tags (e.g., `2<sup>31</sup>`) are now converted to readable `^(...)` and `_(...)` notation instead of being silently dropped.

## [1.3.0] - 2026-06-18

- Added Code360 problem support for `www.naukri.com/code360/problems/...` pages.
- Added Code360 language discovery and starter-code downloads through Code360's first-party public problem APIs.
- Normalized Python download indentation to 4-space leading indentation to avoid mixed tab/space issues in `.py` files.
- Updated extension metadata, privacy copy, and Chrome Web Store notes for the new provider and first-party API usage.

## [1.2.0] - 2026-05-30

- Added GeeksforGeeks problem support.
- Improved language detection for supported problem pages.

## [1.0.0]

- Initial release with LeetCode support.