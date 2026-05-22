/* ============================================
   PANEL SWITCHING
============================================ */
const tabs       = document.querySelectorAll('.tab');
const panels     = document.querySelectorAll('.panel');
const treeItems  = document.querySelectorAll('.tree-item[data-target]');
const mnavItems  = document.querySelectorAll('.mnav-item[data-target]');
const sbPanel    = document.getElementById('sb-panel');

const tabNames = {
  'panel-home':         'about.me',
  'panel-projects':     'projects/',
  'panel-publications': 'publications/',
  'panel-skills':       'skills.json',
  'panel-contact':      'contact.sh',
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
  tabs.forEach(t => {
    const isActive = t.dataset.target === targetId;
    t.classList.toggle('active', isActive);
    if (isActive) t.setAttribute('aria-current', 'page');
    else t.removeAttribute('aria-current');
  });

  // Sync: sidebar tree
  treeItems.forEach(item => {
    item.classList.toggle('active', item.dataset.target === targetId);
  });

  // Sync: mobile bottom nav
  mnavItems.forEach(item => {
    const isActive = item.dataset.target === targetId;
    item.classList.toggle('active', isActive);
    if (isActive) item.setAttribute('aria-current', 'page');
    else item.removeAttribute('aria-current');
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
    switchToPanel(el.dataset.target, el.dataset.scroll || null);
  });
  // keyboard activation for role="button" elements
  if (el.getAttribute('role') === 'button') {
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        switchToPanel(el.dataset.target, el.dataset.scroll || null);
      }
    });
  }
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
  '3': 'panel-publications',
  '4': 'panel-skills',
  '5': 'panel-contact',
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

  const items = panel.querySelectorAll('.proj, .skill-block, .contact-row, .stat-item, .pub-annot-entry, .pub-beacon-paper');
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

['panel-home', 'panel-projects', 'panel-publications', 'panel-skills', 'panel-contact'].forEach(setupReveal);

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
   GITHUB SIDEBAR STATS
   Uses the free unauthenticated REST API (60 req/hr).
   Falls back silently to "—" on error or rate limit.
============================================ */
async function fetchGitHubStats() {
  try {
    const [userRes, reposRes] = await Promise.all([
      fetch('https://api.github.com/users/Metameg'),
      fetch('https://api.github.com/users/Metameg/repos?per_page=100&sort=pushed'),
    ]);

    if (!userRes.ok || !reposRes.ok) return;

    const user  = await userRes.json();
    const repos = await reposRes.json();
    if (!Array.isArray(repos)) return;

    renderRecentRepos(repos);
    renderSkillsCards(user, repos);
  } catch (_) {
    // silently leave placeholders
  }
}

function renderRecentRepos(repos) {
  const list = document.getElementById('gh-repos-list');
  if (!list) return;

  const top = repos
    .filter(r => !r.fork)
    .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
    .slice(0, 5);

  if (!top.length) {
    list.innerHTML = '<div class="gh-repo-placeholder">no repos</div>';
    return;
  }

  const icon =
    '<svg class="gh-repo-icon" width="11" height="11" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">' +
    '<path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 010-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"/>' +
    '</svg>';

  list.innerHTML = top.map(r => {
    const stars = r.stargazers_count || 0;
    const meta = stars > 0 ? `★ ${stars}` : '';
    return `<a class="gh-repo-row" href="${r.html_url}" target="_blank" rel="noopener" title="${escapeAttr(r.description || r.name)}">${icon}<span class="gh-repo-name">${escapeHtml(r.name)}</span><span class="gh-repo-meta">${meta}</span></a>`;
  }).join('');
}

function renderSkillsCards(user, repos) {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  set('gs-repos',     user.public_repos ?? '—');
  set('gs-followers', user.followers ?? '—');

  const yearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
  const activeYr = repos.filter(r => !r.fork && new Date(r.pushed_at).getTime() >= yearAgo).length;
  set('gs-active', activeYr);

  const ownRepos = repos.filter(r => !r.fork);
  if (ownRepos.length) {
    const latest = ownRepos.reduce((a, b) =>
      new Date(b.pushed_at) > new Date(a.pushed_at) ? b : a
    );
    set('gs-lastpush', formatRelative(latest.pushed_at));
  }

  if (user.created_at) {
    const d = new Date(user.created_at);
    const yr = d.getFullYear();
    const mo = d.toLocaleString('en', { month: 'short' });
    set('gs-since', `${mo} ${yr}`);
  }

  const langs = {};
  repos.forEach(r => {
    if (r.fork || !r.language) return;
    langs[r.language] = (langs[r.language] || 0) + 1;
  });

  const langContainer = document.getElementById('gs-langs');
  if (!langContainer) return;

  const entries = Object.entries(langs).sort((a, b) => b[1] - a[1]).slice(0, 6);
  if (!entries.length) {
    langContainer.innerHTML = '<div class="gs-lang-placeholder">no language data</div>';
    return;
  }
  const total = entries.reduce((sum, [, n]) => sum + n, 0);

  langContainer.innerHTML = entries.map(([name, count]) => {
    const pct = Math.round((count / total) * 100);
    return `<div class="gs-lang-row"><div class="gs-lang-head"><span class="gs-lang-name">${escapeHtml(name)}</span><span class="gs-lang-pct">${pct}%</span></div><div class="gs-lang-bar"><div class="gs-lang-fill" style="width:${pct}%"></div></div></div>`;
  }).join('');
}

function formatRelative(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const day = 24 * 60 * 60 * 1000;
  const days = Math.floor(diff / day);
  if (days <= 0) return 'today';
  if (days === 1) return '1d ago';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function escapeAttr(s) { return escapeHtml(s); }

fetchGitHubStats();

/* ============================================
   CONTACT FORM
============================================ */
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const phoneEl  = form.querySelector('#cf-phone');
  const msgEl    = form.querySelector('#cf-message');
  const countEl  = form.querySelector('#cf-msg-count');
  const statusEl = form.querySelector('#cf-status');
  const submitEl = form.querySelector('.cf-submit');

  // Auto-format phone to xxx-xxx-xxxx as user types
  if (phoneEl) {
    phoneEl.addEventListener('input', () => {
      const digits = phoneEl.value.replace(/\D/g, '').slice(0, 10);
      let out;
      if (digits.length <= 3)      out = digits;
      else if (digits.length <= 6) out = digits.slice(0, 3) + '-' + digits.slice(3);
      else                          out = digits.slice(0, 3) + '-' + digits.slice(3, 6) + '-' + digits.slice(6);
      phoneEl.value = out;
    });
  }

  // Live message character count
  const updateCount = () => {
    if (countEl && msgEl) countEl.textContent = String(msgEl.value.trim().length);
  };
  if (msgEl) msgEl.addEventListener('input', updateCount);
  updateCount();

  const setError = (name, text) => {
    const el  = form.querySelector(`[name="${name}"]`);
    const err = form.querySelector(`.cf-err[data-field="${name}"]`);
    if (el)  el.classList.toggle('cf-invalid', !!text);
    if (err) err.textContent = text || '';
  };
  const clearErrors = () => {
    form.querySelectorAll('.cf-err').forEach(e => (e.textContent = ''));
    form.querySelectorAll('.cf-invalid').forEach(e => e.classList.remove('cf-invalid'));
  };

  // Clear an individual error as the user types
  form.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', () => { if (el.name) setError(el.name, ''); });
  });

  const setStatus = (text, cls) => {
    statusEl.textContent = text;
    statusEl.className = 'cf-status' + (cls ? ' ' + cls : '');
  };

  const validate = () => {
    clearErrors();
    let ok = true;
    const data = new FormData(form);
    const first = (data.get('first_name') || '').toString().trim();
    const last  = (data.get('last_name')  || '').toString().trim();
    const email = (data.get('email')      || '').toString().trim();
    const phone = (data.get('phone')      || '').toString().trim();
    const msg   = (data.get('message')    || '').toString().trim();

    if (!first) { setError('first_name', 'Required'); ok = false; }
    if (!last)  { setError('last_name',  'Required'); ok = false; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('email', 'Enter a valid email'); ok = false;
    }
    if (phone && !/^\d{3}-\d{3}-\d{4}$/.test(phone)) {
      setError('phone', 'Use format 555-555-5555'); ok = false;
    }
    if (msg.length < 10) {
      setError('message', `At least 10 characters (currently ${msg.length})`); ok = false;
    }
    return ok;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) {
      setStatus('> fix the highlighted fields', 'cf-status-err');
      return;
    }

    setStatus('> sending…', 'cf-status-pending');
    submitEl.disabled = true;

    try {
      const res = await fetch('contact.php', { method: 'POST', body: new FormData(form) });
      let json = {};
      try { json = await res.json(); } catch (_) {}

      if (json.ok) {
        setStatus('> message sent — check your inbox for confirmation ✓', 'cf-status-ok');
        form.reset();
        updateCount();
      } else {
        if (json.errors && typeof json.errors === 'object') {
          Object.entries(json.errors).forEach(([k, v]) => setError(k, String(v)));
        }
        setStatus('> ' + (json.error || 'something went wrong, please try again'), 'cf-status-err');
      }
    } catch (_) {
      setStatus('> network error — please try again', 'cf-status-err');
    } finally {
      submitEl.disabled = false;
    }
  });
})();

/* ============================================
   PHOTO — apply subtle filter on load, fall back to placeholder on error
============================================ */
const photo = document.getElementById('profileImg');
const photoPH = document.getElementById('photoPH');
if (photo) {
  const applyFilter = () => {
    if (photo.naturalWidth > 0) {
      photo.style.filter = 'saturate(0.8) contrast(1.07) brightness(0.93)';
    }
  };
  photo.addEventListener('load', applyFilter);
  photo.addEventListener('error', () => {
    photo.style.display = 'none';
    if (photoPH) photoPH.style.display = 'flex';
  });
  if (photo.complete) applyFilter();
}
