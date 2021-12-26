function _assignResizer(sidebar) {
  let minSize = 300;
  let mouseStart, startSize, newSize;
  let isImportant = '';

  if (game.modules.get('dnd-ui')?.active)
    isImportant = ' !important';

  // Create a resizer handle
  const resizer = document.createElement('div');
  resizer.style.width = '6px';
  resizer.style.height = '100%';
  resizer.style.position = 'absolute';
  resizer.style.top = '0';
  resizer.style.cursor = 'col-resize';
  sidebar.appendChild(resizer);

  // Listen for mousedown on resizer
  resizer.addEventListener('mousedown', startResize, false);

  // React to user resizing
  function startResize(e) {
    if (ui.sidebar._collapsed) return;
    mouseStart = e.clientX;
    startSize = sidebar.offsetWidth;
    window.addEventListener('mousemove', resize, false);
    window.addEventListener('mouseup', stopResize, false);
  }

  // Perform the resize operation
  function resize(e) {
    newSize = Math.round(startSize + mouseStart - e.clientX);
    if (newSize >= minSize) {
      sidebar.setAttribute('style', `width: ${newSize}px${isImportant}`);
    } else {
      sidebar.setAttribute('style', `width: ${minSize}px${isImportant}`);
    }
  }

  // On mouseup remove listeners & save final size
  function stopResize(e) {
    window.localStorage.setItem('sidebar-resizer-init-size', sidebar.offsetWidth);
    window.removeEventListener('mousemove', resize, false);
    window.removeEventListener('mouseup', stopResize, false);
  }
}

Hooks.once('ready', function() {
  // Setup vars
  const sidebar = ui.sidebar.element[0];
  _assignResizer(sidebar);

  // Enable Chat popout Resize
  if (game.modules.get('lib-wrapper')?.active) {
    libWrapper.register('sidebar-resizer', 'ChatLog.defaultOptions', function (wrapped, ...args) {
      let result = wrapped(...args);
      result.resizable = true;
      result.height = parseInt($("#board").css('height')) / 2;
      const lastSidebarSize = window.localStorage.getItem('sidebar-resizer-init-size');
      if (!lastSidebarSize) return;
      if (Number.isInteger(+lastSidebarSize)) result.width = parseInt(lastSidebarSize);
      return result;
    }, 'WRAPPER');
  } else {
    ui.notifications.warn("Sidebar and Chat Resizer: LibWrapper not enabled")
  }
});

Hooks.once('renderSidebarTab', function() {
  const lastSidebarSize = window.localStorage.getItem('sidebar-resizer-init-size');
  if (!lastSidebarSize) return;
  if (Number.isInteger(+lastSidebarSize)) {
    const sidebar = document.querySelector('#sidebar');
    sidebar.setAttribute('style', `width: ${lastSidebarSize}px`);
  }
});

Hooks.on('collapseSidebar', function(_, isCollapsing) {
  const lastSidebarSize = window.localStorage.getItem('sidebar-resizer-init-size');
  if (!lastSidebarSize || isCollapsing) return;
  if (Number.isInteger(+lastSidebarSize)) {
    const sidebar = document.querySelector('#sidebar');
    sidebar.setAttribute('style', `width: ${lastSidebarSize}px`);
  }
});