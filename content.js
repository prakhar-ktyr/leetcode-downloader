(async function downloadProblem() {
    const extensionMap = {
        'java': 'java',
        'python3': 'py',
        'python': 'py',
        'cpp': 'cpp',
        'javascript': 'js',
        'typescript': 'ts',
        'csharp': 'cs',
        'c': 'c'
    };

    const commentSyntax = {
        'python3': ['"""\n', '\n"""\n\n'],
        'python': ['"""\n', '\n"""\n\n'],
        'default': ['/*\n', '\n*/\n\n']
    };

    const gfgLanguageAliases = {
        cpp: ['c++', 'c++17', 'cplusplus'],
        java: ['java21'],
        python3: ['python', 'py'],
        csharp: ['c#', 'dotnet'],
        javascript: ['js', 'node', 'nodejs', 'javascriptnodev22']
    };

    function normalizeLanguageToken(value) {
        return String(value || '').toLowerCase().replace(/[^a-z0-9#+]/g, '');
    }

    function htmlToPlainText(html) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = String(html || '')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/(p|div|li|tr|h1|h2|h3|h4|h5|h6)>/gi, '$&\n');

        return (tempDiv.textContent || tempDiv.innerText || '')
            .replace(/\u00a0/g, ' ')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    function buildCommentedDescription(title, htmlDescription, language) {
        const comments = commentSyntax[language] || commentSyntax.default;
        const plainTextDescription = htmlToPlainText(htmlDescription);
        return `${comments[0]}${title}\n\n${plainTextDescription}${comments[1]}`;
    }

    function downloadTextFile(filename, content) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
    }

    function getProvider() {
        const normalizedHost = window.location.hostname.replace(/^www\./, '');

        if (normalizedHost === 'leetcode.com' && window.location.pathname.startsWith('/problems/')) {
            return 'leetcode';
        }

        if (["geeksforgeeks.org", "practice.geeksforgeeks.org"].includes(normalizedHost)
            && window.location.pathname.startsWith('/problems/')) {
            return 'gfg';
        }

        return null;
    }

    function buildGfgLanguageMap(problemLanguages) {
        const languageMap = new Map();

        Object.entries(problemLanguages || {}).forEach(([key, label]) => {
            [key, label, ...(gfgLanguageAliases[key] || [])].forEach((token) => {
                languageMap.set(normalizeLanguageToken(token), key);
            });
        });

        return languageMap;
    }

    function matchGfgLanguage(value, languageMap) {
        const normalizedValue = normalizeLanguageToken(value);
        return languageMap.get(normalizedValue) || null;
    }

    function extractLanguageCandidates(value, candidates = new Set()) {
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (!trimmed) {
                return candidates;
            }

            candidates.add(trimmed);

            const isJsonLike = (trimmed.startsWith('{') && trimmed.endsWith('}'))
                || (trimmed.startsWith('[') && trimmed.endsWith(']'))
                || (trimmed.startsWith('"') && trimmed.endsWith('"'));

            if (isJsonLike) {
                try {
                    extractLanguageCandidates(JSON.parse(trimmed), candidates);
                } catch (error) {
                    // Ignore values that are not valid JSON.
                }
            }

            return candidates;
        }

        if (Array.isArray(value)) {
            value.forEach((item) => extractLanguageCandidates(item, candidates));
            return candidates;
        }

        if (value && typeof value === 'object') {
            Object.values(value).forEach((item) => extractLanguageCandidates(item, candidates));
        }

        return candidates;
    }

    function getPreferredGfgLanguageFromStorage(languageMap) {
        const storages = [window.localStorage, window.sessionStorage];

        for (const storage of storages) {
            try {
                for (let index = 0; index < storage.length; index += 1) {
                    const key = storage.key(index);
                    if (!key || !/lang|language/i.test(key)) {
                        continue;
                    }

                    const value = storage.getItem(key);
                    const candidates = Array.from(extractLanguageCandidates(value));

                    for (const candidate of candidates) {
                        const matchedLanguage = matchGfgLanguage(candidate, languageMap);
                        if (matchedLanguage) {
                            return matchedLanguage;
                        }
                    }
                }
            } catch (error) {
                console.warn('Unable to inspect browser storage for GFG language:', error);
            }
        }

        return null;
    }

    function isVisibleElement(element) {
        if (!element || !(element instanceof Element)) {
            return false;
        }

        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        return rect.width > 0
            && rect.height > 0
            && style.visibility !== 'hidden'
            && style.display !== 'none';
    }

    function getPreferredGfgLanguageFromDom(languageMap) {
        const selectElements = Array.from(document.querySelectorAll('select'));
        for (const select of selectElements) {
            const selectedOption = select.options[select.selectedIndex];
            const selectedLanguage = matchGfgLanguage(select.value, languageMap)
                || matchGfgLanguage(selectedOption?.textContent, languageMap);

            if (selectedLanguage) {
                return selectedLanguage;
            }
        }

        const selectorGroups = [
            '[role="combobox"]',
            '[aria-haspopup="listbox"]',
            '[class*="lang"]',
            '[class*="Lang"]',
            'button',
            '[role="button"]'
        ];

        for (const selector of selectorGroups) {
            const candidates = Array.from(document.querySelectorAll(selector)).slice(0, 200);

            for (const element of candidates) {
                if (!isVisibleElement(element)) {
                    continue;
                }

                const valuesToCheck = [
                    element.getAttribute('value'),
                    element.getAttribute('data-value'),
                    element.getAttribute('aria-label'),
                    element.textContent
                ];

                for (const value of valuesToCheck) {
                    const matchedLanguage = matchGfgLanguage(value, languageMap);
                    if (matchedLanguage) {
                        return matchedLanguage;
                    }
                }
            }
        }

        return null;
    }

    function buildGfgStarterCode(template) {
        const initialCode = String(template?.initial_code || '');
        const userCode = String(template?.user_code || '');

        if (!initialCode) {
            return userCode;
        }

        if (!userCode) {
            return initialCode;
        }

        const placeholderPattern = /^[^\n\r]*Position this line where user code will be pasted\.?[^\n\r]*$/m;

        if (placeholderPattern.test(initialCode)) {
            return initialCode.replace(placeholderPattern, userCode);
        }

        return `${initialCode.trimEnd()}\n\n${userCode.trimStart()}`;
    }

    async function getLeetCodeDownload() {
        const pathParts = window.location.pathname.split('/');
        const problemSlug = pathParts[2];

        if (!problemSlug) {
            throw new Error('Could not find LeetCode problem slug in URL');
        }

        const query = `
            query questionData($titleSlug: String!) {
              question(titleSlug: $titleSlug) {
                title
                content
                codeSnippets {
                  lang
                  langSlug
                  code
                }
              }
            }
        `;

        const response = await fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                operationName: 'questionData',
                variables: { titleSlug: problemSlug },
                query
            })
        });

        const questionData = await response.json();
        const rawLang = window.localStorage.getItem('global_lang') || '"java"';
        const preferredLang = rawLang.replace(/^"|"$/g, '');

        const { title, content, codeSnippets } = questionData.data.question;
        const commentedDescription = buildCommentedDescription(title, content, preferredLang);

        const snippet = codeSnippets.find((item) => item.langSlug === preferredLang);
        const codeText = snippet ? snippet.code : `// Code snippet not found for "${preferredLang}"`;
        const fileExt = extensionMap[preferredLang] || 'txt';

        return {
            filename: `${problemSlug}.${fileExt}`,
            content: commentedDescription + codeText
        };
    }

    function getGfgDownload() {
        const nextDataElement = document.getElementById('__NEXT_DATA__');
        if (!nextDataElement?.textContent) {
            throw new Error('Could not find GFG page data');
        }

        const nextData = JSON.parse(nextDataElement.textContent);
        const problemData = nextData?.props?.pageProps?.initialState?.problemData?.allData?.probData;

        if (!problemData) {
            throw new Error('Could not find GFG problem details');
        }

        const problemLanguages = problemData?.extra?.problem_languages || {};
        const languageMap = buildGfgLanguageMap(problemLanguages);
        const availableLanguages = Object.keys(problemLanguages);
        const fallbackLanguage = problemData.course_default_lang
            || problemData?.extra?.default_lang
            || availableLanguages[0];
        const preferredLang = getPreferredGfgLanguageFromDom(languageMap)
            || getPreferredGfgLanguageFromStorage(languageMap)
            || fallbackLanguage;

        const template = problemData?.extra?.initial_user_func?.[preferredLang]
            || problemData?.extra?.default_code?.[preferredLang]
            || problemData?.extra?.initial_user_func?.[fallbackLanguage]
            || problemData?.extra?.default_code?.[fallbackLanguage];

        if (!template) {
            throw new Error(`Code snippet not found for GFG language "${preferredLang}"`);
        }

        const title = problemData.problem_name;
        const slug = problemData.slug || window.location.pathname.split('/').filter(Boolean)[1];
        const description = problemData.problem_question || '';
        const commentedDescription = buildCommentedDescription(title, description, preferredLang);
        const starterCode = buildGfgStarterCode(template);
        const fileExt = extensionMap[preferredLang] || 'txt';

        return {
            filename: `${slug}.${fileExt}`,
            content: commentedDescription + starterCode
        };
    }

    try {
        const provider = getProvider();

        if (!provider) {
            console.error('Unsupported problem page');
            return;
        }

        const downloadData = provider === 'leetcode'
            ? await getLeetCodeDownload()
            : getGfgDownload();

        downloadTextFile(downloadData.filename, downloadData.content);
    } catch (error) {
        console.error('Error downloading problem:', error);
    }
})();