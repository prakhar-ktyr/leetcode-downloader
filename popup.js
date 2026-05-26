const problemTitle = document.getElementById('problem-title');
const providerLine = document.getElementById('provider-line');
const languageSelect = document.getElementById('language-select');
const detectedLanguage = document.getElementById('detected-language');
const downloadButton = document.getElementById('download-button');
const statusText = document.getElementById('status-text');

let activeTabId = null;
let activeProblem = null;

function setStatus(message, tone = 'neutral') {
    statusText.textContent = message;
    statusText.dataset.tone = tone;
}

function setInteractiveState(isEnabled) {
    const disabled = !isEnabled;
    languageSelect.disabled = disabled;
    downloadButton.disabled = disabled;
}

function getLanguageLabel(problem, languageValue) {
    const language = problem.languages.find((item) => item.value === languageValue);
    return language ? language.label : languageValue;
}

function renderUnsupportedState(message) {
    activeProblem = null;
    problemTitle.textContent = 'Open a supported problem page';
    providerLine.textContent = message;
    detectedLanguage.textContent = 'This popup works on LeetCode and GeeksforGeeks problem pages.';
    languageSelect.innerHTML = '<option>Unsupported page</option>';
    setInteractiveState(false);
}

function populateLanguageSelect(problem) {
    languageSelect.innerHTML = '';

    problem.languages.forEach((language) => {
        const option = document.createElement('option');
        option.value = language.value;
        option.textContent = `${language.label} (.${language.fileExtension})`;
        languageSelect.appendChild(option);
    });

    if (problem.selectedLanguage) {
        languageSelect.value = problem.selectedLanguage;
    }
}

function renderProblem(problem) {
    activeProblem = problem;
    const providerLabel = problem.provider === 'leetcode' ? 'LeetCode' : 'GeeksforGeeks';
    const languageCountLabel = `${problem.languages.length} language${problem.languages.length === 1 ? '' : 's'} available`;

    problemTitle.textContent = problem.title;
    providerLine.textContent = `${providerLabel} • ${languageCountLabel}`;
    populateLanguageSelect(problem);
    setInteractiveState(true);

    if (problem.detectedLanguage) {
        detectedLanguage.textContent = `Detected current page language: ${getLanguageLabel(problem, problem.detectedLanguage)}. Change it here if that detection is stale.`;
    } else {
        detectedLanguage.textContent = 'Select the exact starter code language you want to download.';
    }
}

async function getActiveTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab || null;
}

async function injectContentBridge(tabId) {
    await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js']
    });
}

async function sendPageMessage(tabId, message) {
    const response = await chrome.tabs.sendMessage(tabId, message);

    if (!response?.ok) {
        throw new Error(response?.error || 'Unexpected extension response');
    }

    return response;
}

async function initializePopup() {
    try {
        setStatus('Loading languages from the current problem...', 'neutral');
        setInteractiveState(false);

        const activeTab = await getActiveTab();
        if (!activeTab?.id) {
            throw new Error('No active tab is available.');
        }

        activeTabId = activeTab.id;
        await injectContentBridge(activeTabId);
        const response = await sendPageMessage(activeTabId, { type: 'GET_PROBLEM_INFO' });
        renderProblem(response.problem);
        setStatus('Ready to download.', 'success');
    } catch (error) {
        renderUnsupportedState(error instanceof Error ? error.message : String(error));
        setStatus(error instanceof Error ? error.message : String(error), 'error');
    }
}

downloadButton.addEventListener('click', async () => {
    if (!activeTabId || !activeProblem) {
        return;
    }

    try {
        setInteractiveState(false);
        setStatus('Downloading the selected starter code...', 'neutral');

        const response = await sendPageMessage(activeTabId, {
            type: 'DOWNLOAD_PROBLEM',
            language: languageSelect.value
        });

        setStatus(`Downloaded ${response.filename}.`, 'success');
        setInteractiveState(true);
    } catch (error) {
        setStatus(error instanceof Error ? error.message : String(error), 'error');
        setInteractiveState(true);
    }
});

document.addEventListener('DOMContentLoaded', initializePopup);