(function() {
    try {
        var d = {};
        var pd = window.__INTERVIEWBIT__ && window.__INTERVIEWBIT__.problemsData;
        if (pd) { 
            d.problemsData = typeof pd === "string" ? pd : JSON.stringify(pd); 
        }
        
        try {
            var models = window.monaco && window.monaco.editor
                && typeof window.monaco.editor.getModels === "function"
                && window.monaco.editor.getModels();
            if (models && models[0]) {
                d.editorContent = models[0].getValue();
                d.editorLanguage = typeof models[0].getLanguageId === "function"
                    ? models[0].getLanguageId() : "";
            }
        } catch(e) {}
        
        window.postMessage({ type: 'DSA_DOWNLOADER_EXTRACT_SUCCESS', data: d }, '*');
    } catch(e) {
        window.postMessage({ type: 'DSA_DOWNLOADER_EXTRACT_ERROR', error: e.message }, '*');
    }
})();
