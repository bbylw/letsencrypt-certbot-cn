(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function setTheme(theme) {
    root.dataset.theme = theme;
    try { localStorage.setItem('certbot-theme', theme); } catch (e) {}
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f4f7f8' : '#0b1219');
    var toggle = document.querySelector('[data-theme-toggle]');
    if (toggle) {
      toggle.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
      toggle.setAttribute('aria-label', theme === 'light' ? '切换到深色主题' : '切换到浅色主题');
    }
  }

  var themeToggle = document.querySelector('[data-theme-toggle]');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      setTheme(root.dataset.theme === 'light' ? 'dark' : 'light');
    });
  }
  setTheme(root.dataset.theme || 'dark');

  var menuToggle = document.querySelector('[data-menu-toggle]');
  var menu = document.getElementById('mobile-menu');
  function closeMenu() {
    if (!menu || !menuToggle) return;
    menu.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', '展开导航菜单');
  }
  if (menuToggle && menu) {
    menuToggle.addEventListener('click', function () {
      var open = menu.hidden;
      menu.hidden = !open;
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuToggle.setAttribute('aria-label', open ? '收起导航菜单' : '展开导航菜单');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  var nav = document.getElementById('site-nav');
  var sentinel = document.querySelector('.nav-sentinel');
  if (nav && sentinel && 'IntersectionObserver' in window) {
    var navIO = new IntersectionObserver(function (entries) {
      nav.classList.toggle('is-stuck', !entries[0].isIntersecting);
    }, { threshold: 0 });
    navIO.observe(sentinel);
  }

  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__links a'));
  var watched = ['top', 'principle', 'quickstart', 'features', 'hosted', 'contribute']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  if (navLinks.length && watched.length && 'IntersectionObserver' in window) {
    var secIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          if (a.getAttribute('href') === '#' + entry.target.id) {
            a.setAttribute('aria-current', 'true');
          } else {
            a.removeAttribute('aria-current');
          }
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    watched.forEach(function (s) { secIO.observe(s); });
  }

  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealIO.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });
    reveals.forEach(function (el) { revealIO.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  var form = document.getElementById('cfg-form');
  if (form) {
    var body = form.parentElement.querySelector('[data-console-body]');
    var codeEl = body.querySelector('[data-code]');
    var errorNote = body.querySelector('[data-state="error"]');
    var domainInput = document.getElementById('domain');
    var domainError = document.getElementById('domain-error');
    var copyBtn = form.parentElement.querySelector('[data-copy]');

    var COMMANDS = {
      apache: 'sudo certbot --apache {flags}',
      nginx: 'sudo certbot --nginx {flags}',
      webroot: 'sudo certbot certonly --webroot -w /var/www/html {flags} --agree-tos -m you@example.com',
      standalone: 'sudo certbot certonly --standalone {flags} --agree-tos -m you@example.com'
    };

    var LABEL = /^(?!-)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.(?!-)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i;
    var current = '';
    var pending = null;
    var copyTimer = null;

    function showState(name) {
      Array.prototype.forEach.call(body.querySelectorAll('[data-state]'), function (el) {
        el.hidden = el.dataset.state !== name;
      });
    }

    function highlight(code) {
      return code
        .replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; })
        .replace(/\b(sudo|certbot)\b/g, '<span class="c-bin">$1</span>')
        .replace(/(-d\s+[\w.-]+|--[a-z-]+|you@example\.com|\/var\/www\/html)/g, '<span class="c-flag">$1</span>');
    }

    function parseDomains(raw) {
      var parts = raw.split(/[\s,]+/).filter(Boolean);
      var valid = parts.filter(function (d) { return d.length <= 253 && LABEL.test(d); });
      return { valid: valid, total: parts.length };
    }

    function fail(message, inline) {
      if (inline && domainError) {
        domainError.textContent = message;
        domainError.hidden = false;
        domainInput.setAttribute('aria-invalid', 'true');
      } else {
        errorNote.textContent = message;
      }
      showState('error');
      if (copyBtn) { copyBtn.disabled = true; copyBtn.textContent = '复制命令'; }
    }

    function fieldError(message) {
      if (domainError) {
        domainError.textContent = message;
        domainError.hidden = false;
      }
      domainInput.setAttribute('aria-invalid', 'true');
      showState('empty');
      if (copyBtn) { copyBtn.disabled = true; copyBtn.textContent = '复制命令'; }
    }

    function build(server) {
      var parsed = parseDomains(domainInput.value.trim());
      if (!parsed.total) {
        fieldError('请先填写域名，例如 example.com。');
        return;
      }
      if (!parsed.valid.length) {
        fieldError('域名写法看起来不对。正确示例：example.com 或 www.example.com。');
        return;
      }
      if (parsed.valid.length < parsed.total) {
        fieldError('域名里有 ' + (parsed.total - parsed.valid.length) + ' 项写法不对，请删掉后重新生成。');
        return;
      }
      if (domainError) { domainError.hidden = true; domainInput.removeAttribute('aria-invalid'); }
      var flags = parsed.valid.map(function (d) { return '-d ' + d; }).join(' ');
      var template = COMMANDS[server];
      if (!template) { fail('暂时没有这台服务器的模板，请换一台再试。', false); return; }
      current = template.replace('{flags}', flags);
      codeEl.innerHTML = highlight(current);
      showState('ready');
      if (copyBtn) { copyBtn.disabled = false; copyBtn.textContent = '复制命令'; }
    }

    function selectedServer() {
      var checked = form.querySelector('input[name="server"]:checked');
      return checked ? checked.value : 'apache';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (pending) clearTimeout(pending);
      showState('loading');
      if (copyBtn) copyBtn.disabled = true;
      pending = setTimeout(function () {
        pending = null;
        build(selectedServer());
      }, 360);
    });

    form.addEventListener('change', function (e) {
      if (e.target.name === 'server' && current) build(e.target.value);
    });

    domainInput.addEventListener('input', function () {
      if (domainInput.getAttribute('aria-invalid') === 'true') {
        domainInput.removeAttribute('aria-invalid');
        domainError.hidden = true;
      }
    });

    if (copyBtn) {
      copyBtn.setAttribute('aria-live', 'polite');
      copyBtn.addEventListener('click', function () {
        if (!current) return;
        if (copyTimer) clearTimeout(copyTimer);
        function done(ok) {
          copyBtn.classList.toggle('is-done', ok);
          copyBtn.classList.toggle('is-error', !ok);
          copyBtn.textContent = ok ? '已复制' : '复制失败，请手动选中';
          copyTimer = setTimeout(function () {
            copyBtn.classList.remove('is-done', 'is-error');
            copyBtn.textContent = '复制命令';
          }, 2400);
        }
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(current).then(function () { done(true); }, function () { done(fallback()); });
        } else {
          done(fallback());
        }
      });
    }

    function fallback() {
      try {
        var ta = document.createElement('textarea');
        ta.value = current;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;';
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        return ok;
      } catch (e) {
        return false;
      }
    }
  }
})();
