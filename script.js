/* ============================================
   PANEL SWITCHING
============================================ */
const tabs       = document.querySelectorAll('.tab');
const panels     = document.querySelectorAll('.panel');
const treeItems  = document.querySelectorAll('.tree-item[data-target]');
const mnavItems  = document.querySelectorAll('.mnav-item[data-target]');
const sbPanel    = document.getElementById('sb-panel');

const tabNames = {
  'panel-home':     'about.me',
  'panel-projects': 'projects/',
  'panel-skills':   'skills.json',
  'panel-contact':  'contact.sh',
};

function switchToPanel(targetId, scrollToId = null) {
  if (!targetId) return;

  // Show correct panel
  panels.forEach(p => p.classList.remove('active'));
  const panel = document.getElementById(targetId);
  if (panel) {
    panel.classList.add('active');
    if (scrollToId) {
      const el = document.getElementById(scrollToId);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    } else {
      panel.scrollTop = 0;
    }
  }

  // Sync: title bar tabs
  tabs.forEach(t => t.classList.toggle('active', t.dataset.target === targetId));

  // Sync: sidebar tree
  treeItems.forEach(item => {
    item.classList.toggle('active', item.dataset.target === targetId);
  });

  // Sync: mobile bottom nav
  mnavItems.forEach(item => {
    item.classList.toggle('active', item.dataset.target === targetId);
  });

  // Sync: status bar label
  if (sbPanel) sbPanel.textContent = tabNames[targetId] || targetId;
}

// Title bar tab clicks
tabs.forEach(tab => {
  tab.addEventListener('click', () => switchToPanel(tab.dataset.target));
});

// Sidebar tree item clicks
treeItems.forEach(item => {
  item.addEventListener('click', () => {
    switchToPanel(item.dataset.target, item.dataset.scroll || null);
  });
});

// Mobile bottom nav clicks
mnavItems.forEach(item => {
  item.addEventListener('click', () => switchToPanel(item.dataset.target));
});

// Internal btn-primary clicks that navigate panels
document.querySelectorAll('[data-target]').forEach(el => {
  if (el.classList.contains('tab') || el.classList.contains('tree-item')) return;
  el.addEventListener('click', (e) => {
    e.preventDefault();
    switchToPanel(el.dataset.target);
  });
});

/* ============================================
   SIDEBAR FOLDER TOGGLE
============================================ */
document.querySelectorAll('.tree-folder-row').forEach(folder => {
  folder.addEventListener('click', () => {
    const id = folder.id; // e.g. "folder-proj"
    const childId = id ? id.replace('folder-', 'children-') : null;
    const children = childId ? document.getElementById(childId) : null;
    const arrow = folder.querySelector('.fold-arrow');

    if (children) {
      const isOpen = folder.classList.toggle('open');
      if (arrow) arrow.textContent = isOpen ? '▾' : '▸';
      children.style.display = isOpen ? '' : 'none';
    }
  });
});

/* ============================================
   STATUS BAR — Ln counter per panel
============================================ */
panels.forEach(panel => {
  panel.addEventListener('scroll', () => {
    if (!panel.classList.contains('active')) return;
    const total = panel.scrollHeight - panel.clientHeight;
    const pct = total > 0 ? panel.scrollTop / total : 0;
    const approxLn = Math.round(1 + pct * 300);
    const lnEls = document.querySelectorAll('.sb-chip');
    // find the panel name chip and update dynamically
  }, { passive: true });
});

/* ============================================
   KEYBOARD SHORTCUTS
============================================ */
const shortcuts = {
  '1': 'panel-home',
  '2': 'panel-projects',
  '3': 'panel-skills',
  '4': 'panel-contact',
};

document.addEventListener('keydown', e => {
  // Number keys 1–4 with no modifiers
  if (!e.ctrlKey && !e.metaKey && !e.altKey && shortcuts[e.key]) {
    switchToPanel(shortcuts[e.key]);
    return;
  }

  // Ctrl/Cmd + P → projects
  if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
    e.preventDefault();
    switchToPanel('panel-projects');
    showToast('⌘P  →  projects/');
  }
  // Ctrl/Cmd + K → contact
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    switchToPanel('panel-contact');
    showToast('⌘K  →  contact.sh');
  }
});

/* ============================================
   TOAST NOTIFICATION
============================================ */
function showToast(msg) {
  const existing = document.getElementById('kbd-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'kbd-toast';
  toast.textContent = msg;
  Object.assign(toast.style, {
    position: 'fixed',
    top: '50px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#1d2130',
    border: '1px solid #2e3650',
    color: '#5ba3f5',
    fontFamily: '"Fira Code", monospace',
    fontSize: '12px',
    padding: '7px 18px',
    borderRadius: '4px',
    zIndex: '9999',
    boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
    pointerEvents: 'none',
    animation: 'slideUp 0.2s ease',
  });
  document.body.appendChild(toast);
  setTimeout(() => toast && toast.remove(), 2000);
}

/* ============================================
   SCROLL REVEAL for project cards
============================================ */
function setupReveal(panelId) {
  const panel = document.getElementById(panelId);
  if (!panel) return;

  const items = panel.querySelectorAll('.proj, .skill-block, .contact-row, .stat-item');
  items.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = `opacity 0.5s ease ${i * 0.07}s, transform 0.5s ease ${i * 0.07}s`;
  });

  panel.addEventListener('scroll', () => {
    const rect = panel.getBoundingClientRect();
    items.forEach(el => {
      const elRect = el.getBoundingClientRect();
      if (elRect.top < rect.bottom - 40) {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }
    });
  }, { passive: true });

  // trigger immediately for items already in view
  setTimeout(() => {
    const rect = panel.getBoundingClientRect();
    items.forEach(el => {
      const elRect = el.getBoundingClientRect();
      if (elRect.top < rect.bottom - 40) {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }
    });
  }, 100);
}

['panel-home', 'panel-projects', 'panel-skills', 'panel-contact'].forEach(setupReveal);

// Re-trigger reveals when switching panels
[...tabs, ...mnavItems].forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    if (!targetId) return;
    const panel = document.getElementById(targetId);
    if (!panel) return;
    setTimeout(() => panel.dispatchEvent(new Event('scroll')), 100);
  });
});

treeItems.forEach(item => {
  item.addEventListener('click', () => {
    const panel = document.getElementById(item.dataset.target);
    if (!panel) return;
    setTimeout(() => panel.dispatchEvent(new Event('scroll')), 100);
  });
});

/* ============================================
   PHOTO — apply subtle filter on load
============================================ */
const photo = document.getElementById('profileImg');
if (photo) {
  const applyFilter = () => {
    if (photo.naturalWidth > 0) {
      photo.style.filter = 'saturate(0.8) contrast(1.07) brightness(0.93)';
    }
  };
  photo.addEventListener('load', applyFilter);
  if (photo.complete) applyFilter();
}
