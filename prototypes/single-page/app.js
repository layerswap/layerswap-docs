const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const themeMeta = document.querySelector('meta[name="theme-color"]');
const savedTheme = localStorage.getItem('layerswap-prototype-theme');
const preferredTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';

function setTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem('layerswap-prototype-theme', theme);
  themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
  themeMeta.setAttribute('content', theme === 'dark' ? '#0c0a0e' : '#fefcfd');
}

setTheme(savedTheme || preferredTheme);

themeToggle.addEventListener('click', () => {
  setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
});

const codeConfig = {
  react: {
    label: 'Open Widget quickstart',
    href: 'https://docs.layerswap.io/widget/quickstart',
  },
  js: {
    label: 'Open JavaScript guide',
    href: 'https://docs.layerswap.io/widget/vanilla-js',
  },
  api: {
    label: 'Open API quickstart',
    href: 'https://docs.layerswap.io/api/quickstart',
  },
};

const codeTabs = [...document.querySelectorAll('[data-code-tab]')];
const codePanels = [...document.querySelectorAll('[data-code-panel]')];
const codeDocLink = document.querySelector('[data-code-doc-link]');

function selectCodeTab(name) {
  codeTabs.forEach((tab) => {
    const selected = tab.dataset.codeTab === name;
    tab.classList.toggle('is-active', selected);
    tab.setAttribute('aria-selected', String(selected));
  });

  codePanels.forEach((panel) => {
    const selected = panel.dataset.codePanel === name;
    panel.classList.toggle('is-active', selected);
    panel.hidden = !selected;
  });

  codeDocLink.href = codeConfig[name].href;
  codeDocLink.firstChild.textContent = `${codeConfig[name].label} `;
}

codeTabs.forEach((tab) => {
  tab.addEventListener('click', () => selectCodeTab(tab.dataset.codeTab));
});

const toast = document.querySelector('.toast');
let toastTimer;

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('is-visible');
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
}

async function copyText(text, successMessage) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }
  showToast(successMessage);
}

document.querySelectorAll('[data-copy-code]').forEach((button) => {
  button.addEventListener('click', () => {
    const code = button.closest('.code-panel').querySelector('code').textContent.trim();
    copyText(code, 'Code copied');
    button.textContent = 'Copied';
    setTimeout(() => { button.textContent = 'Copy'; }, 1800);
  });
});

const aiDialog = document.querySelector('#ai-context-dialog');
const aiContextTemplate = document.querySelector('#ai-context-template');
const aiOpenButtons = document.querySelectorAll('[data-open-ai-context]');
const aiCloseButton = document.querySelector('[data-close-dialog]');
const aiCopyButton = document.querySelector('[data-copy-ai-context]');

aiOpenButtons.forEach((button) => {
  button.addEventListener('click', () => aiDialog.showModal());
});

aiCloseButton.addEventListener('click', () => aiDialog.close());

aiDialog.addEventListener('click', (event) => {
  const rect = aiDialog.getBoundingClientRect();
  const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  if (outside) aiDialog.close();
});

aiCopyButton.addEventListener('click', async () => {
  const context = aiContextTemplate.content.textContent.trim();
  await copyText(context, 'Complete Layerswap context copied');
  aiCopyButton.firstChild.textContent = 'Context copied ';
  setTimeout(() => { aiCopyButton.firstChild.textContent = 'Copy complete context '; }, 2200);
});
