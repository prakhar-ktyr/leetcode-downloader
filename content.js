(async function downloadLeetCodeProblem() {
    const pathParts = window.location.pathname.split('/');
    const problemSlug = pathParts[2];
    if (!problemSlug) {
        console.error("Could not find problem slug in URL");
        return;
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

    try {
        const response = await fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                operationName: 'questionData',
                variables: { titleSlug: problemSlug },
                query: query
            })
        });

        const questionData = await response.json();
        
        // Clean up the stored language preference
        let rawLang = window.localStorage.getItem('global_lang') || '"java"';
        let PREFERRED_LANG = rawLang.replace(/^"|"$/g, '');

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

        const { title, content, codeSnippets } = questionData.data.question;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const plainTextDescription = tempDiv.textContent || tempDiv.innerText || "";

        const comments = commentSyntax[PREFERRED_LANG] || commentSyntax['default'];
        const commentedDescription = `${comments[0]}${title}\n\n${plainTextDescription}${comments[1]}`;

        const snippet = codeSnippets.find(s => s.langSlug === PREFERRED_LANG);
        const codeText = snippet ? snippet.code : `// Code snippet not found for "${PREFERRED_LANG}"`;

        const finalFileContent = commentedDescription + codeText;
        const fileExt = extensionMap[PREFERRED_LANG] || 'txt';
        const filename = `${problemSlug}.${fileExt}`;

        const blob = new Blob([finalFileContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error("Error fetching LeetCode data:", error);
    }
})();