#!/bin/bash
# package-extension.sh — Creates a clean ZIP for Chrome Web Store submission
#
# Usage: ./package-extension.sh
# Output: dsa-problem-downloader-v{VERSION}.zip

set -euo pipefail

EXTENSION_NAME="dsa-problem-downloader"
VERSION=$(python3 -c "import json; print(json.load(open('manifest.json'))['version'])")
OUTPUT="${EXTENSION_NAME}-v${VERSION}.zip"

# Remove old package if it exists
rm -f "$OUTPUT"

# Create ZIP excluding dev/meta files
zip -r "$OUTPUT" . \
  -x ".git/*" \
  -x "node_modules/*" \
  -x ".env" \
  -x "*.map" \
  -x "tests/*" \
  -x "__tests__/*" \
  -x "*.test.*" \
  -x "*.spec.*" \
  -x ".eslintrc*" \
  -x ".prettierrc*" \
  -x "tsconfig.json" \
  -x "package.json" \
  -x "package-lock.json" \
  -x "CHROMEWEBSTORE.md" \
  -x "PRIVACY.md" \
  -x "README.md" \
  -x "CHANGELOG.md" \
  -x "LICENSE" \
  -x ".gitignore" \
  -x ".DS_Store" \
  -x "Thumbs.db" \
  -x "*.sh" \
  -x "store-assets/*" \
  -x ".github/*"

echo ""
echo "✅ Packaged: $OUTPUT ($(du -h "$OUTPUT" | cut -f1))"
echo "   Version:  $VERSION"
echo ""
echo "Upload this ZIP at: https://chrome.google.com/webstore/devconsole"
