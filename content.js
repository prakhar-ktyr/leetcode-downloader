(() => {
    if (globalThis.__dsaProblemDownloaderInjected) {
        return;
    }

    globalThis.__dsaProblemDownloaderInjected = true;

    const extensionMap = {
        java: 'java',
        java_17: 'java',
        python3: 'py',
        python: 'py',
        py3: 'py',
        py3_10: 'py',
        cpp: 'cpp',
        cpp_11: 'cpp',
        javascript: 'js',
        typescript: 'ts',
        csharp: 'cs',
        c: 'c'
    };

    const commentSyntax = {
        python3: ['"""\n', '\n"""\n\n'],
        python: ['"""\n', '\n"""\n\n'],
        py3: ['"""\n', '\n"""\n\n'],
        py3_10: ['"""\n', '\n"""\n\n'],
        ruby: ['=begin\n', '\n=end\n\n'],
        default: ['/*\n', '\n*/\n\n']
    };

    const genericLanguageAliases = {
        cpp: ['c++', 'c++17', 'cplusplus'],
        python3: ['python', 'py'],
        javascript: ['js', 'node', 'nodejs'],
        typescript: ['ts'],
        csharp: ['c#', 'cs', 'dotnet'],
        golang: ['go']
    };

    const gfgLanguageAliases = {
        java: ['java21'],
        javascript: ['javascriptnodev22']
    };

    const code360LanguageAliases = {
        java_17: ['java17', 'java 17', 'jdk17'],
        py3: ['python3', 'python 3', 'python35', 'python3.5'],
        py3_10: ['python310', 'python 3.10', 'python3.10'],
        cpp_11: ['c++11', 'g++11', 'cpp11']
    };

    const interviewBitFileExtensions = {
        python: 'py',
        python3: 'py',
        c: 'c',
        cpp: 'cpp',
        csharp: 'cs',
        java: 'java',
        javascript: 'js',
        typescript: 'ts',
        golang: 'go',
        ruby: 'rb',
        php: 'php',
        scala: 'scala',
        swift: 'swift',
        objectivec: 'm'
    };

    let cachedInterviewBitProblemData = null;

    let cachedLeetCodeQuestion = null;
    let cachedCode360Problem = null;
    const cachedCode360LanguageCode = new Map();

    function normalizeLanguageToken(value) {
        return String(value || '').toLowerCase().replace(/[^a-z0-9#+]/g, '');
    }

    function htmlToPlainText(html) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = String(html || '')
            .replace(/<sup\b[^>]*>([\s\S]*?)<\/sup>/gi, (_, inner) => `^(${inner.replace(/<[^>]*>/g, '').trim()})`)
            .replace(/<sub\b[^>]*>([\s\S]*?)<\/sub>/gi, (_, inner) => `_(${inner.replace(/<[^>]*>/g, '').trim()})`)
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/(p|div|li|tr|h1|h2|h3|h4|h5|h6)>/gi, '$&\n');

        return (tempDiv.textContent || tempDiv.innerText || '')
            .replace(/\u00a0/g, ' ')
            .replace(/\t/g, '    ')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    function buildCommentedDescription(title, htmlDescription, language) {
        const comments = commentSyntax[language] || commentSyntax.default;
        const plainTextDescription = htmlToPlainText(htmlDescription);
        return `${comments[0]}${title}\n\n${plainTextDescription}${comments[1]}`;
    }

    function isPythonLanguage(language) {
        return ['python', 'python3', 'py3', 'py3_10'].includes(language);
    }

    function normalizeLeadingTabs(line, spacesPerTab) {
        const leadingWhitespace = line.match(/^[\t ]+/)?.[0];

        if (!leadingWhitespace || !leadingWhitespace.includes('\t')) {
            return line;
        }

        const normalizedWhitespace = leadingWhitespace.replace(/\t/g, ' '.repeat(spacesPerTab));
        return `${normalizedWhitespace}${line.slice(leadingWhitespace.length)}`;
    }

    function normalizeCodeIndentation(code, language) {
        if (!isPythonLanguage(language)) {
            return code;
        }

        return String(code || '')
            .replace(/\r\n/g, '\n')
            .split('\n')
            .map((line) => normalizeLeadingTabs(line, 4))
            .join('\n');
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

        if (normalizedHost === 'naukri.com' && window.location.pathname.startsWith('/code360/problems/')) {
            return 'code360';
        }

        if (normalizedHost === 'interviewbit.com' && window.location.pathname.startsWith('/problems/')) {
            return 'interviewbit';
        }

        return null;
    }

    function buildLanguageMap(languages, extraAliases = {}) {
        const languageMap = new Map();

        languages.forEach(({ value, label }) => {
            const aliases = [
                ...(genericLanguageAliases[value] || []),
                ...(extraAliases[value] || [])
            ];

            [value, label, ...aliases].forEach((token) => {
                languageMap.set(normalizeLanguageToken(token), value);
            });
        });

        return languageMap;
    }

    function matchLanguage(value, languageMap) {
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
                    // Ignore malformed JSON-like storage values.
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

    function detectLanguageFromStorage(languageMap, options = {}) {
        const { exactKeys = [], scanAllLanguageKeys = false } = options;
        const storages = [window.localStorage, window.sessionStorage];

        for (const storage of storages) {
            try {
                for (const key of exactKeys) {
                    const value = storage.getItem(key);
                    const candidates = Array.from(extractLanguageCandidates(value));

                    for (const candidate of candidates) {
                        const matchedLanguage = matchLanguage(candidate, languageMap);
                        if (matchedLanguage) {
                            return matchedLanguage;
                        }
                    }
                }

                if (!scanAllLanguageKeys) {
                    continue;
                }

                for (let index = 0; index < storage.length; index += 1) {
                    const key = storage.key(index);
                    if (!key || !/lang|language/i.test(key)) {
                        continue;
                    }

                    const value = storage.getItem(key);
                    const candidates = Array.from(extractLanguageCandidates(value));

                    for (const candidate of candidates) {
                        const matchedLanguage = matchLanguage(candidate, languageMap);
                        if (matchedLanguage) {
                            return matchedLanguage;
                        }
                    }
                }
            } catch (error) {
                console.warn('Unable to inspect browser storage for language selection:', error);
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

    function detectLanguageFromDom(languageMap) {
        const selectElements = Array.from(document.querySelectorAll('select'));
        for (const select of selectElements) {
            const selectedOption = select.options[select.selectedIndex];
            const selectedLanguage = matchLanguage(select.value, languageMap)
                || matchLanguage(selectedOption?.textContent, languageMap);

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
                    const matchedLanguage = matchLanguage(value, languageMap);
                    if (matchedLanguage) {
                        return matchedLanguage;
                    }
                }
            }
        }

        return null;
    }

    function resolveSelectedLanguage(requestedLanguage, detectedLanguage, languages, fallbackLanguage) {
        const availableLanguages = new Set(languages.map((language) => language.value));

        if (requestedLanguage && availableLanguages.has(requestedLanguage)) {
            return requestedLanguage;
        }

        if (detectedLanguage && availableLanguages.has(detectedLanguage)) {
            return detectedLanguage;
        }

        if (fallbackLanguage && availableLanguages.has(fallbackLanguage)) {
            return fallbackLanguage;
        }

        return languages[0]?.value || null;
    }

    function getFileExtension(language) {
        return extensionMap[language] || 'txt';
    }

    function getProblemSlugFromPath(segmentIndex = 1) {
        return window.location.pathname.split('/').filter(Boolean)[segmentIndex] || null;
    }

    async function fetchLeetCodeQuestion() {
        const pathParts = window.location.pathname.split('/');
        const problemSlug = pathParts[2];

        if (!problemSlug) {
            throw new Error('Could not find LeetCode problem slug in URL');
        }

        if (cachedLeetCodeQuestion && cachedLeetCodeQuestion.problemSlug === problemSlug) {
            return cachedLeetCodeQuestion;
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
        const question = questionData?.data?.question;

        if (!question) {
            throw new Error('Could not fetch LeetCode problem details');
        }

        cachedLeetCodeQuestion = { problemSlug, question };
        return cachedLeetCodeQuestion;
    }

    function buildLeetCodeLanguages(codeSnippets) {
        return (codeSnippets || []).map((snippet) => ({
            value: snippet.langSlug,
            label: snippet.lang,
            fileExtension: getFileExtension(snippet.langSlug)
        }));
    }

    function getLeetCodeDetectedLanguage(languages) {
        const languageMap = buildLanguageMap(languages);

        return detectLanguageFromDom(languageMap)
            || detectLanguageFromStorage(languageMap, { exactKeys: ['global_lang'] });
    }

    async function getLeetCodeProblemInfo() {
        const { problemSlug, question } = await fetchLeetCodeQuestion();
        const languages = buildLeetCodeLanguages(question.codeSnippets);
        const detectedLanguage = getLeetCodeDetectedLanguage(languages);
        const selectedLanguage = resolveSelectedLanguage(null, detectedLanguage, languages, languages[0]?.value);

        return {
            provider: 'leetcode',
            title: question.title,
            slug: problemSlug,
            languages,
            detectedLanguage,
            selectedLanguage
        };
    }

    async function buildLeetCodeDownload(requestedLanguage) {
        const { problemSlug, question } = await fetchLeetCodeQuestion();
        const languages = buildLeetCodeLanguages(question.codeSnippets);
        const detectedLanguage = getLeetCodeDetectedLanguage(languages);
        const selectedLanguage = resolveSelectedLanguage(
            requestedLanguage,
            detectedLanguage,
            languages,
            languages[0]?.value
        );

        const snippet = question.codeSnippets.find((item) => item.langSlug === selectedLanguage);
        if (!snippet) {
            throw new Error(`Code snippet not found for LeetCode language "${selectedLanguage}"`);
        }

        return {
            provider: 'leetcode',
            language: selectedLanguage,
            filename: `${problemSlug}.${getFileExtension(selectedLanguage)}`,
            content: buildCommentedDescription(question.title, question.content, selectedLanguage)
                + normalizeCodeIndentation(snippet.code, selectedLanguage)
        };
    }

    function getGfgProblemData() {
        const nextDataElement = document.getElementById('__NEXT_DATA__');
        if (!nextDataElement?.textContent) {
            throw new Error('Could not find GFG page data');
        }

        const nextData = JSON.parse(nextDataElement.textContent);
        const problemData = nextData?.props?.pageProps?.initialState?.problemData?.allData?.probData;

        if (!problemData) {
            throw new Error('Could not find GFG problem details');
        }

        return problemData;
    }

    function buildGfgLanguages(problemLanguages) {
        return Object.entries(problemLanguages || {}).map(([value, label]) => ({
            value,
            label,
            fileExtension: getFileExtension(value)
        }));
    }

    function getGfgDetectedLanguage(languages) {
        const languageMap = buildLanguageMap(languages, gfgLanguageAliases);

        return detectLanguageFromDom(languageMap)
            || detectLanguageFromStorage(languageMap, { scanAllLanguageKeys: true });
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

    function getGfgTemplate(problemData, selectedLanguage, fallbackLanguage) {
        return problemData?.extra?.initial_user_func?.[selectedLanguage]
            || problemData?.extra?.default_code?.[selectedLanguage]
            || problemData?.extra?.initial_user_func?.[fallbackLanguage]
            || problemData?.extra?.default_code?.[fallbackLanguage]
            || null;
    }

    function getGfgProblemInfo() {
        const problemData = getGfgProblemData();
        const languages = buildGfgLanguages(problemData?.extra?.problem_languages || {});
        const fallbackLanguage = problemData.course_default_lang
            || problemData?.extra?.default_lang
            || languages[0]?.value;
        const detectedLanguage = getGfgDetectedLanguage(languages);
        const selectedLanguage = resolveSelectedLanguage(null, detectedLanguage, languages, fallbackLanguage);

        return {
            provider: 'gfg',
            title: problemData.problem_name,
            slug: problemData.slug || getProblemSlugFromPath(),
            languages,
            detectedLanguage,
            selectedLanguage
        };
    }

    function buildGfgDownload(requestedLanguage) {
        const problemData = getGfgProblemData();
        const languages = buildGfgLanguages(problemData?.extra?.problem_languages || {});
        const fallbackLanguage = problemData.course_default_lang
            || problemData?.extra?.default_lang
            || languages[0]?.value;
        const detectedLanguage = getGfgDetectedLanguage(languages);
        const selectedLanguage = resolveSelectedLanguage(
            requestedLanguage,
            detectedLanguage,
            languages,
            fallbackLanguage
        );
        const template = getGfgTemplate(problemData, selectedLanguage, fallbackLanguage);

        if (!template) {
            throw new Error(`Code snippet not found for GFG language "${selectedLanguage}"`);
        }

        return {
            provider: 'gfg',
            language: selectedLanguage,
            filename: `${problemData.slug || getProblemSlugFromPath()}.${getFileExtension(selectedLanguage)}`,
            content: buildCommentedDescription(problemData.problem_name, problemData.problem_question || '', selectedLanguage)
                + normalizeCodeIndentation(buildGfgStarterCode(template), selectedLanguage)
        };
    }

    async function fetchCode360Problem() {
        const problemSlug = getProblemSlugFromPath(2);

        if (!problemSlug) {
            throw new Error('Could not find Code360 problem slug in URL');
        }

        if (cachedCode360Problem && cachedCode360Problem.problemSlug === problemSlug) {
            return cachedCode360Problem;
        }

        const response = await fetch(`https://api.codingninjas.com/api/v3/public_section/problem_detail?slug=${encodeURIComponent(problemSlug)}`);
        const problemResponse = await response.json();
        const problem = problemResponse?.data?.offerable?.problem;

        if (!response.ok || problemResponse?.status !== 200 || !problem) {
            throw new Error('Could not fetch Code360 problem details');
        }

        cachedCode360Problem = { problemSlug, problem };
        return cachedCode360Problem;
    }

    function buildCode360Languages(problemLanguages) {
        return (problemLanguages || []).map((language) => ({
            value: language.language_token,
            label: language.name,
            fileExtension: getFileExtension(language.language_token)
        }));
    }

    function getCode360DetectedLanguage(languages) {
        const languageMap = buildLanguageMap(languages, code360LanguageAliases);

        return detectLanguageFromDom(languageMap)
            || detectLanguageFromStorage(languageMap, { scanAllLanguageKeys: true });
    }

    function buildCode360Description(problemData) {
        return [problemData?.description, problemData?.sample_testcase]
            .filter(Boolean)
            .join('\n\n');
    }

    async function fetchCode360LanguageCode(problemData, selectedLanguage) {
        const cacheKey = `${problemData.id}:${selectedLanguage}`;

        if (cachedCode360LanguageCode.has(cacheKey)) {
            return cachedCode360LanguageCode.get(cacheKey);
        }

        const searchParams = new URLSearchParams({
            offering_id: String(problemData.offering_id),
            problem_id: String(problemData.id),
            language: selectedLanguage
        });
        const response = await fetch(`https://api.codingninjas.com/api/v3/public_section/get_language_code?${searchParams.toString()}`);
        const languageResponse = await response.json();
        const languageData = languageResponse?.data;

        if (!response.ok || languageResponse?.status !== 200 || !languageData) {
            throw new Error(`Could not fetch Code360 starter code for language "${selectedLanguage}"`);
        }

        cachedCode360LanguageCode.set(cacheKey, languageData);
        return languageData;
    }

    function getCode360StarterCode(languageData) {
        return String(
            languageData?.default_scaffold
            || languageData?.saved_scaffold
            || languageData?.runner_scaffold
            || ''
        );
    }

    async function getCode360ProblemInfo() {
        const { problemSlug, problem } = await fetchCode360Problem();
        const languages = buildCode360Languages(problem.languages_allowed);

        if (!languages.length) {
            throw new Error('Could not find Code360 starter code languages');
        }

        const fallbackLanguage = problem.user_default_language
            || problem.default_language
            || languages[0]?.value;
        const detectedLanguage = getCode360DetectedLanguage(languages);
        const selectedLanguage = resolveSelectedLanguage(null, detectedLanguage, languages, fallbackLanguage);

        return {
            provider: 'code360',
            title: problem.name,
            slug: problemSlug,
            languages,
            detectedLanguage,
            selectedLanguage
        };
    }

    async function buildCode360Download(requestedLanguage) {
        const { problemSlug, problem } = await fetchCode360Problem();
        const languages = buildCode360Languages(problem.languages_allowed);

        if (!languages.length) {
            throw new Error('Could not find Code360 starter code languages');
        }

        const fallbackLanguage = problem.user_default_language
            || problem.default_language
            || languages[0]?.value;
        const detectedLanguage = getCode360DetectedLanguage(languages);
        const selectedLanguage = resolveSelectedLanguage(
            requestedLanguage,
            detectedLanguage,
            languages,
            fallbackLanguage
        );
        const languageData = await fetchCode360LanguageCode(problem, selectedLanguage);
        const starterCode = getCode360StarterCode(languageData);

        if (!starterCode) {
            throw new Error(`Code snippet not found for Code360 language "${selectedLanguage}"`);
        }

        return {
            provider: 'code360',
            language: selectedLanguage,
            filename: `${problemSlug}.${getFileExtension(selectedLanguage)}`,
            content: buildCommentedDescription(problem.name, buildCode360Description(problem), selectedLanguage)
                + normalizeCodeIndentation(starterCode, selectedLanguage)
        };
    }

    function parseInterviewBitLanguageType(label) {
        const lower = label.toLowerCase();
        if (/python\s*3/i.test(lower)) return 'python3';
        if (/python/i.test(lower)) return 'python';
        if (/c\+\+|cpp/i.test(lower)) return 'cpp';
        if (/c#/i.test(lower)) return 'csharp';
        if (/^c[\s(]/i.test(lower) || lower === 'c') return 'c';
        if (/javascript/i.test(lower)) return 'javascript';
        if (/typescript/i.test(lower)) return 'typescript';
        if (/\bgo\b/i.test(lower)) return 'golang';
        if (/java/i.test(lower)) return 'java';
        if (/ruby/i.test(lower)) return 'ruby';
        if (/php/i.test(lower)) return 'php';
        if (/scala/i.test(lower)) return 'scala';
        if (/swift/i.test(lower)) return 'swift';
        if (/objective.?c/i.test(lower)) return 'objectivec';
        return 'unknown';
    }

    function extractInterviewBitPageData() {
        return new Promise((resolve, reject) => {
            const listener = (event) => {
                if (event.source !== window) return;
                if (event.data?.type === 'DSA_DOWNLOADER_EXTRACT_SUCCESS') {
                    window.removeEventListener('message', listener);
                    resolve(event.data.data);
                } else if (event.data?.type === 'DSA_DOWNLOADER_EXTRACT_ERROR') {
                    window.removeEventListener('message', listener);
                    reject(new Error(event.data.error));
                }
            };
            window.addEventListener('message', listener);

            const script = document.createElement('script');
            script.src = chrome.runtime.getURL('inject.js');
            script.onload = () => script.remove();
            script.onerror = () => {
                window.removeEventListener('message', listener);
                reject(new Error('Failed to inject script'));
            };
            (document.head || document.documentElement).appendChild(script);

            setTimeout(() => {
                window.removeEventListener('message', listener);
                reject(new Error('Timeout extracting InterviewBit page data'));
            }, 5000);
        });
    }

    async function getInterviewBitProblemData() {
        if (cachedInterviewBitProblemData) {
            return cachedInterviewBitProblemData;
        }

        const pageData = await extractInterviewBitPageData();

        if (!pageData.problemsData) {
            throw new Error('Could not find InterviewBit problem data. Make sure you are logged in.');
        }

        const data = JSON.parse(pageData.problemsData);

        if (!data?.meta) {
            throw new Error('Could not find InterviewBit problem details');
        }

        cachedInterviewBitProblemData = data;
        return data;
    }

    function buildInterviewBitLanguages(languagesMap) {
        return Object.entries(languagesMap || {}).map(([id, label]) => {
            const langType = parseInterviewBitLanguageType(label);
            return {
                value: id,
                label,
                langType,
                fileExtension: interviewBitFileExtensions[langType] || 'txt'
            };
        });
    }

    function getInterviewBitDetectedLanguage(languages) {
        const dropdownValue = document.querySelector('.p-editor-toolbar-dropdown__single-value');
        if (!dropdownValue) return null;

        const dropdownText = dropdownValue.textContent?.trim();
        if (!dropdownText) return null;

        const match = languages.find((lang) => lang.label === dropdownText);
        return match?.value || null;
    }

    function getInterviewBitDescription(problemData) {
        const domDescription = document.querySelector('.p-html-content.p-statement')?.innerHTML;
        return domDescription || problemData.meta?.markdown_content || '';
    }

    async function getInterviewBitProblemInfo() {
        const problemData = await getInterviewBitProblemData();
        const languages = buildInterviewBitLanguages(problemData.meta.languages);

        if (!languages.length) {
            throw new Error('Could not find InterviewBit starter code languages');
        }

        const detectedLanguage = getInterviewBitDetectedLanguage(languages);
        const selectedLanguage = resolveSelectedLanguage(null, detectedLanguage, languages, languages[0]?.value);

        return {
            provider: 'interviewbit',
            title: problemData.meta.statement,
            slug: problemData.slug,
            languages,
            detectedLanguage,
            selectedLanguage
        };
    }

    async function fetchInterviewBitStarterCode(problemSlug, languageId) {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
        const response = await fetch(`/v2/problems/${problemSlug}/codes/?programming_language_id=${languageId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-CSRF-Token': csrfToken || '',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        if (response.ok) {
            const data = await response.json();
            return data.content;
        }
        throw new Error("Failed to fetch InterviewBit starter code");
    }

    async function buildInterviewBitDownload(requestedLanguage) {
        const problemData = await getInterviewBitProblemData();
        const languages = buildInterviewBitLanguages(problemData.meta.languages);

        if (!languages.length) {
            throw new Error('Could not find InterviewBit starter code languages');
        }

        const detectedLanguage = getInterviewBitDetectedLanguage(languages);
        const selectedLanguage = resolveSelectedLanguage(
            requestedLanguage,
            detectedLanguage,
            languages,
            languages[0]?.value
        );

        let editorContent = null;
        if (detectedLanguage && selectedLanguage === detectedLanguage) {
            const pageData = await extractInterviewBitPageData();
            editorContent = pageData.editorContent;
        } else {
            editorContent = await fetchInterviewBitStarterCode(problemData.slug, selectedLanguage);
        }

        if (!editorContent) {
            throw new Error('Could not read the InterviewBit code editor or fetch starter code. Make sure you are logged in.');
        }

        const selectedLang = languages.find((l) => l.value === selectedLanguage) || languages[0];
        const langType = selectedLang?.langType || 'default';
        const description = getInterviewBitDescription(problemData);

        return {
            provider: 'interviewbit',
            language: selectedLanguage,
            filename: problemData.slug + '.' + (selectedLang?.fileExtension || 'txt'),
            content: buildCommentedDescription(problemData.meta.statement, description, langType)
                + normalizeCodeIndentation(editorContent, langType)
        };
    }

    async function getProblemInfo() {
        const provider = getProvider();

        if (provider === 'leetcode') {
            return getLeetCodeProblemInfo();
        }

        if (provider === 'gfg') {
            return getGfgProblemInfo();
        }

        if (provider === 'code360') {
            return getCode360ProblemInfo();
        }

        if (provider === 'interviewbit') {
            return getInterviewBitProblemInfo();
        }

        throw new Error('Unsupported problem page');
    }

    async function downloadProblem(requestedLanguage) {
        const provider = getProvider();

        if (provider === 'leetcode') {
            const downloadData = await buildLeetCodeDownload(requestedLanguage);
            downloadTextFile(downloadData.filename, downloadData.content);
            return downloadData;
        }

        if (provider === 'gfg') {
            const downloadData = buildGfgDownload(requestedLanguage);
            downloadTextFile(downloadData.filename, downloadData.content);
            return downloadData;
        }

        if (provider === 'code360') {
            const downloadData = await buildCode360Download(requestedLanguage);
            downloadTextFile(downloadData.filename, downloadData.content);
            return downloadData;
        }

        if (provider === 'interviewbit') {
            const downloadData = await buildInterviewBitDownload(requestedLanguage);
            downloadTextFile(downloadData.filename, downloadData.content);
            return downloadData;
        }

        throw new Error('Unsupported problem page');
    }

    globalThis.__dsaProblemDownloader = {
        getProblemInfo,
        downloadProblem
    };

    if (typeof chrome !== 'undefined'
        && chrome.runtime?.onMessage
        && !globalThis.__dsaProblemDownloaderListenerRegistered) {
        globalThis.__dsaProblemDownloaderListenerRegistered = true;

        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            const handleMessage = async () => {
                if (message?.type === 'GET_PROBLEM_INFO') {
                    const problem = await getProblemInfo();
                    return { ok: true, problem };
                }

                if (message?.type === 'DOWNLOAD_PROBLEM') {
                    const download = await downloadProblem(message.language);
                    return {
                        ok: true,
                        filename: download.filename,
                        language: download.language,
                        provider: download.provider
                    };
                }

                throw new Error('Unsupported downloader message');
            };

            handleMessage()
                .then(sendResponse)
                .catch((error) => {
                    sendResponse({
                        ok: false,
                        error: error instanceof Error ? error.message : String(error)
                    });
                });

            return true;
        });
    }
})();