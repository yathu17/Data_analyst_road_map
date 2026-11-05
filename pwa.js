(() => {
  'use strict';
  let installPrompt = null;
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  let offlineReady = false;
  let sheet = null;

  function dismissSheet() { if (sheet) { sheet.remove(); sheet = null; } }
  function showHelp() {
    dismissSheet();
    const previousFocus = document.activeElement;
    sheet = document.createElement('div');
    sheet.className = 'modal-shade';
    sheet.innerHTML = `<section class="modal" role="dialog" aria-modal="true" aria-labelledby="install-title"><h2 id="install-title">Daily Data, on your home screen</h2><p>${isIOS
      ? 'Open this site in Safari. Tap Share, then Add to Home Screen. If asked, keep Open as Web App enabled, then tap Add.'
      : 'In Chrome or Edge, open the browser menu and choose Install app or Add to Home screen. If you are inside another app’s browser, open this link in your regular browser first.'}</p><p>The Daily Data logo will appear on your phone. ${offlineReady ? 'Your lessons are ready to read offline.' : 'Visit once online and let the lessons finish saving for offline reading.'} Progress stays on this device. Export a backup in Progress before switching browsers or installing if you want to keep existing progress.</p><button class="primary" id="close-install">Got it</button></section>`;
    document.body.append(sheet);
    const close = sheet.querySelector('#close-install');
    close.focus();
    function finish() { dismissSheet(); previousFocus?.focus(); }
    close.addEventListener('click', finish);
    sheet.addEventListener('click', e => { if (e.target === sheet) finish(); });
    sheet.addEventListener('keydown', e => {
      if (e.key === 'Escape') finish();
      if (e.key === 'Tab') { e.preventDefault(); close.focus(); }
    });
  }

  async function install() {
    if (!installPrompt) { showHelp(); return; }
    const prompt = installPrompt;
    installPrompt = null;
    try { await prompt.prompt(); await prompt.userChoice; }
    catch { showHelp(); }
    updateControls();
  }

  function updateControls() {
    document.querySelectorAll('[data-install-app]').forEach(button => {
      button.hidden = standalone();
      button.textContent = installPrompt ? 'Install Daily Data' : 'Add to home screen';
    });
    document.querySelectorAll('[data-offline-status]').forEach(el => {
      el.textContent = offlineReady ? 'Lessons ready for offline reading.' : 'Keep this page open online while lessons save for offline reading.';
    });
  }

  function addControls() {
    const main = document.querySelector('#app > main');
    if (!main || !main.querySelector('.settings') || main.querySelector('[data-install-app]')) return;
    const section = document.createElement('div');
    section.className = 'pwa-install';
    section.innerHTML = '<h3>Take your learning with you</h3><p data-offline-status></p><button class="secondary" data-install-app>Add to home screen</button>';
    section.querySelector('button').addEventListener('click', install);
    main.querySelector('.settings').prepend(section);
    updateControls();
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault(); installPrompt = event; updateControls();
  });
  window.addEventListener('appinstalled', () => { installPrompt = null; updateControls(); });
  matchMedia('(display-mode: standalone)').addEventListener('change', updateControls);
  new MutationObserver(addControls).observe(document.getElementById('app'), {childList:true});
  addControls();

  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('./sw.js').then(async registration => {
      await navigator.serviceWorker.ready;
      offlineReady = true;
      updateControls();
      // Let an update wait until existing windows close: no surprise reloads or lost notes.
      registration.update().catch(() => {});
    }).catch(() => {
      document.querySelectorAll('[data-offline-status]').forEach(el => {
        el.textContent = 'Offline saving is unavailable right now. You can still read online.';
      });
    });
  }
})();
