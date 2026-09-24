(() => {
  'use strict';

  /* ============================================================
     DATA — replace `src` with real audio file URLs when ready,
     and `href` on articles with real article links.
  ============================================================ */
  const EPISODES = [
    { id:1, type:'podcast', title:'قسمت ۱: تبسم بزن، حتی وقتی سخت است', desc:'گفت‌وگویی درباره‌ی معنای امید در روزهای دشوار.', date:'شهریور ۱۴۰۵', duration:'۲۸:۱۰', src:'audio/po9' },
    { id:2, type:'podcast', title:'قسمت ۲: زبان دوم رابطه، سکوت', desc:'چرا گاهی سکوت مهم‌تر از حرف‌زدن است؟', date:'شهریور ۱۴۰۵', duration:'۳۳:۴۵', src:'' },
    { id:3, type:'article', title:'۵ نشانه‌ی اضطراب پنهان در زندگی روزمره', desc:'نشانه‌هایی که معمولاً نادیده گرفته می‌شوند.', date:'مرداد ۱۴۰۵', href:'#' },
    { id:4, type:'podcast', title:'قسمت ۳: خانواده، اولین کلاس درس زندگی', desc:'نقش خانواده در شکل‌گیری الگوهای دلبستگی.', date:'مرداد ۱۴۰۵', duration:'۴۱:۰۲', src:'' },
    { id:5, type:'article', title:'چگونه با نوجوانم گفت‌وگو کنم؟', desc:'چند راهکار ساده برای ارتباطی صمیمانه‌تر.', date:'تیر ۱۴۰۵', href:'#' },
    { id:6, type:'podcast', title:'قسمت ۴: بخشش، برای خودمان', desc:'بخشیدن دیگران، یا رهاکردن بار خودمان؟', date:'تیر ۱۴۰۵', duration:'۲۹:۵۰', src:'' }
  ];

  const ICONS = {
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>',
    read: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20l-8-4V4l8 4 8-4v12l-8 4z"/></svg>'
  };

  const els = {
    header: document.getElementById('siteHeader'),
    navLinks: document.querySelectorAll('.nav-links a, .mobile-drawer nav a'),
    navToggle: document.getElementById('navToggle'),
    navClose: document.getElementById('navClose'),
    drawer: document.getElementById('mobileDrawer'),
    tabs: document.getElementById('tabs'),
    episodeList: document.getElementById('episodeList'),
    approachGrid: document.getElementById('approachGrid'),
    codeChip: document.getElementById('codeChip'),
    toast: document.getElementById('toast'),
    audio: document.getElementById('audioEl'),
    miniPlayer: document.getElementById('miniPlayer'),
    mpToggle: document.getElementById('mpToggle'),
    mpToggleIcon: document.getElementById('mpToggleIcon'),
    mpTitle: document.getElementById('mpTitle'),
    mpTrack: document.getElementById('mpTrack'),
    mpProgress: document.getElementById('mpProgress'),
    mpTime: document.getElementById('mpTime'),
    mpClose: document.getElementById('mpClose')
  };

  /* ---------------- Toast ---------------- */
  let toastTimer = null;
  function showToast(message){
    els.toast.textContent = message;
    els.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove('show'), 2600);
  }

  /* ---------------- Header scroll state ---------------- */
  function onScroll(){
    els.header.classList.toggle('is-scrolled', window.scrollY > 30);
  }
  document.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  /* ---------------- Mobile drawer ---------------- */
  function openDrawer(){
    els.drawer.classList.add('is-open');
    els.navToggle.setAttribute('aria-expanded','true');
  }
  function closeDrawer(){
    els.drawer.classList.remove('is-open');
    els.navToggle.setAttribute('aria-expanded','false');
  }
  els.navToggle.addEventListener('click', openDrawer);
  els.navClose.addEventListener('click', closeDrawer);
  els.drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));

  /* ---------------- Scrollspy ---------------- */
  const sections = ['hero','about','approach','content','credentials','contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        const id = entry.target.id;
        els.navLinks.forEach(a => {
          const match = a.getAttribute('href') === `#${id}`;
          a.classList.toggle('active', match);
        });
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(sec => spyObserver.observe(sec));

  /* ---------------- Reveal on scroll ---------------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));
  if (els.approachGrid) revealObserver.observe(els.approachGrid);

  /* ---------------- Episode list rendering + tab filter ---------------- */
  function episodeRowHTML(ep){
    const isPodcast = ep.type === 'podcast';
    const typeLabel = isPodcast ? 'پادکست' : 'مقاله';
    const metaText = isPodcast ? `${ep.date} · ${ep.duration}` : ep.date;
    const actionButton = isPodcast
      ? `<button class="ep-play" data-id="${ep.id}" aria-label="پخش">${ICONS.play}</button>`
      : `<a class="ep-play article-link" href="${ep.href}" aria-label="مطالعه">${ICONS.read}</a>`;

    return `
      <div class="episode-row" data-type="${ep.type}">
        ${actionButton}
        <div class="ep-info">
          <h3>${ep.title}</h3>
          <p>${ep.desc}</p>
        </div>
        <span class="ep-type">${typeLabel}</span>
        <span class="ep-meta">${metaText}</span>
      </div>`;
  }

  function renderEpisodes(){
    els.episodeList.innerHTML = EPISODES.map(episodeRowHTML).join('');
  }
  renderEpisodes();

  els.tabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    els.tabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    els.episodeList.querySelectorAll('.episode-row').forEach(row => {
      const show = filter === 'all' || row.dataset.type === filter;
      row.classList.toggle('hidden-row', !show);
    });
  });

  /* ---------------- Audio player ---------------- */
  const AudioPlayer = {
    currentId: null,

    formatTime(seconds){
      if (!isFinite(seconds)) return '۰۰:۰۰';
      const m = Math.floor(seconds / 60).toString().padStart(2,'0');
      const s = Math.floor(seconds % 60).toString().padStart(2,'0');
      return this.toFa(`${m}:${s}`);
    },
    toFa(str){
      const map = {0:'۰',1:'۱',2:'۲',3:'۳',4:'۴',5:'۵',6:'۶',7:'۷',8:'۸',9:'۹'};
      return str.replace(/[0-9]/g, d => map[d]);
    },

    play(ep, buttonEl){
      // No audio file attached yet — placeholder state.
      if (!ep.src){
        showToast('فایل صوتی این قسمت هنوز اضافه نشده — لینک را در کد جایگزین کنید.');
        return;
      }
      if (this.currentId !== ep.id){
        els.audio.src = ep.src;
        this.currentId = ep.id;
      }
      els.audio.play();
      this.setActiveButton(buttonEl);
      els.mpTitle.textContent = ep.title;
      els.miniPlayer.classList.add('is-open');
    },

    setActiveButton(activeBtn){
      document.querySelectorAll('.ep-play').forEach(b => b.classList.remove('is-playing'));
      if (activeBtn) activeBtn.classList.add('is-playing');
    },

    togglePlayPause(){
      if (els.audio.paused){
        els.audio.play();
      } else {
        els.audio.pause();
      }
    },

    close(){
      els.audio.pause();
      els.audio.removeAttribute('src');
      els.audio.load();
      this.currentId = null;
      els.miniPlayer.classList.remove('is-open');
      this.setActiveButton(null);
    },

    seekTo(ratio){
      if (!els.audio.duration) return;
      els.audio.currentTime = ratio * els.audio.duration;
    }
  };

  // Delegate clicks on generated play buttons
  els.episodeList.addEventListener('click', (e) => {
    const btn = e.target.closest('.ep-play:not(.article-link)');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const ep = EPISODES.find(item => item.id === id);
    if (!ep) return;

    if (AudioPlayer.currentId === id && !els.audio.paused){
      AudioPlayer.togglePlayPause();
    } else {
      AudioPlayer.play(ep, btn);
    }
  });

  els.mpToggle.addEventListener('click', () => AudioPlayer.togglePlayPause());
  els.mpClose.addEventListener('click', () => AudioPlayer.close());

  els.mpTrack.addEventListener('click', (e) => {
    const rect = els.mpTrack.getBoundingClientRect();
    // RTL-aware: progress fills from the right edge
    const ratio = 1 - ((e.clientX - rect.left) / rect.width);
    AudioPlayer.seekTo(Math.min(Math.max(ratio, 0), 1));
  });

  els.audio.addEventListener('play', () => {
    els.mpToggleIcon.innerHTML = ICONS.pause.match(/<path.*?\/>/)[0];
    document.querySelectorAll('.ep-play.is-playing').forEach(b => b.classList.add('is-playing'));
  });
  els.audio.addEventListener('pause', () => {
    els.mpToggleIcon.innerHTML = ICONS.play.match(/<path.*?\/>/)[0];
  });
  els.audio.addEventListener('timeupdate', () => {
    const pct = els.audio.duration ? (els.audio.currentTime / els.audio.duration) * 100 : 0;
    els.mpProgress.style.width = `${pct}%`;
    els.mpTime.textContent = `${AudioPlayer.formatTime(els.audio.currentTime)} / ${AudioPlayer.formatTime(els.audio.duration || 0)}`;
  });
  els.audio.addEventListener('ended', () => AudioPlayer.close());

  /* ---------------- License code — copy to clipboard ---------------- */
  els.codeChip.addEventListener('click', async () => {
    const text = els.codeChip.textContent.trim();
    try {
      await navigator.clipboard.writeText(text);
      showToast('کد نظام کپی شد.');
    } catch (err) {
      showToast('کپی خودکار پشتیبانی نمی‌شود؛ کد را به‌صورت دستی انتخاب کنید.');
    }
  });

  /* ---------------- Footer year ---------------- */
  document.getElementById('year').textContent = new Date().getFullYear();

})();
