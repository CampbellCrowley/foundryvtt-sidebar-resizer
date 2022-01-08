function _getImportantStr() {
  if (game.modules.get('dnd-ui')?.active || game.modules.get('pathfinder-ui-legacy')?.active)
    return ' !important';
  else
    return '';
}

function _assignResizer(sidebar) {
  let minSize = 300;
  let mouseStart, startSize, newSize;
  let isImportant = _getImportantStr();

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

function _assignVerticalResizer(chatform) {
  let minSize = 100;
  let mouseStart, startSize, newSize;
  let isImportant = '';

  if (game.modules.get('dnd-ui')?.active || game.modules.get('pathfinder-ui-legacy')?.active)
    isImportant = ' !important';

  // Create a resizer handle
  const resizer = document.createElement('div');
  resizer.style.width = '100%';
  resizer.style.height = '4px';
  resizer.style.position = 'relative';
  resizer.style.cursor = 'row-resize';
  chatform.prepend(resizer);

  // Listen for mousedown on resizer
  resizer.addEventListener('mousedown', startResize, false);

  // React to user resizing
  function startResize(e) {
    if (ui.sidebar._collapsed) return;
    mouseStart = e.clientY;
    startSize = chatform.offsetHeight;
    window.addEventListener('mousemove', resize, false);
    window.addEventListener('mouseup', stopResize, false);
  }

  // Perform the resize operation
  function resize(e) {
    newSize = Math.round(startSize + mouseStart - e.clientY);
    if (newSize >= minSize) {
      chatform.setAttribute('style', `flex: 0 0 ${newSize}px${isImportant}`);
    } else {
      chatform.setAttribute('style', `flex: 0 0 ${minSize}px${isImportant}`);
    }
  }

  // On mouseup remove listeners & save final size
  function stopResize(e) {
    window.localStorage.setItem('chatform-resizer-init-size', chatform.offsetHeight);
    window.removeEventListener('mousemove', resize, false);
    window.removeEventListener('mouseup', stopResize, false);
  }
}

Hooks.once('ready', function() {
  // Setup vars
  const sidebar = ui.sidebar.element[0];
  const chatform = $(ui.chat.element[0]).find("#chat-form")[0];
  _assignResizer(sidebar);
  _assignVerticalResizer(chatform);

  // Enable Chat popout Resize
  if (game.modules.get('lib-wrapper')?.active) {
    libWrapper.register('sidebar-resizer', 'ChatLog.defaultOptions', function (wrapped, ...args) {
      let result = wrapped(...args);
      result.resizable = true;
      result.height = parseInt($("#board").css('height')) / 2;
      const lastSidebarSize = window.localStorage.getItem('sidebar-resizer-init-size');
      if (lastSidebarSize && Number.isInteger(+lastSidebarSize)) result.width = parseInt(lastSidebarSize);
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
    sidebar.setAttribute('style', `width: ${lastSidebarSize}px${_getImportantStr()}`);
  }
});

Hooks.once('renderSidebarTab', function() {
  const lastChatformSize = window.localStorage.getItem('chatform-resizer-init-size');
  if (!lastChatformSize) return;
  if (Number.isInteger(+lastChatformSize)) {
    const chatform = document.querySelector('#chat-form');
    chatform.setAttribute('style', `flex: 0 0 ${lastChatformSize}px`);
  }
});

Hooks.on('renderChatLog', function (chat, div) {
  if (chat.popOut) {
    const chatform = div.find("#chat-form")[0];
    _assignVerticalResizer(chatform);
    const lastChatformSize = window.localStorage.getItem('chatform-resizer-init-size');
    if (!lastChatformSize) return;
    if (Number.isInteger(+lastChatformSize)) {
      chatform.setAttribute('style', `flex: 0 0 ${lastChatformSize}px`);
    }
  }
});

Hooks.on('collapseSidebar', function(_, isCollapsing) {
  const lastSidebarSize = window.localStorage.getItem('sidebar-resizer-init-size');
  if (!lastSidebarSize || isCollapsing) return;
  if (Number.isInteger(+lastSidebarSize)) {
    const sidebar = document.querySelector('#sidebar');
    sidebar.setAttribute('style', `width: ${lastSidebarSize}px${_getImportantStr()}`);
  }
});