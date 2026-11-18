(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  let DATA, plans = [], votes = {};

  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toast.timer); toast.timer = setTimeout(() => t.classList.remove('show'), 1800);
  }

  function renderStats() {
    const s = LocalEngine.getState();
    $('#roundLabel').textContent = `第 ${s.rounds + 1} 轮`;
    $('#learnedLabel').textContent = `已学 ${Object.keys(s.elo).length} 条偏好`;
  }

  function regionName(r) { return r === '淮南' ? '本地' : r === '近圈' ? '近圈' : '远途'; }

  function render() {
    const box = $('#plans');
    box.innerHTML = '';
    plans.forEach((p, i) => {
      const el = document.createElement('article');
      el.className = 'card';
      const regionCls = p.region === '淮南' ? '' : p.region === '近圈' ? 'near' : 'far';
      el.innerHTML = `
        <div class="head"><span class="num">${String(i + 1).padStart(2, '0')}</span>
          <span class="region ${regionCls}">${regionName(p.region)}</span></div>
        <h3 class="title">${p.title}</h3>
        <div class="lines">${p.lines.map(l => `<p>${l}</p>`).join('')}</div>
        <div class="meta"><span>${p.slot}</span><span title="${p.source}">来源：${p.source}</span></div>
        <div class="vote">
          <button data-v="keep" data-i="${i}" class="${votes[i] === 'keep' ? 'on' : ''}">♥ 想去</button>
          <button data-v="drop" data-i="${i}" class="${votes[i] === 'drop' ? 'on' : ''}">× 不去</button>
        </div>`;
      box.appendChild(el);
    });
    $('#actions').classList.toggle('hidden', !plans.length);
  }

  function generate(seed) {
    plans = LocalEngine.generate({ seed });
    votes = {};
    render();
    renderStats();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function copyAll() {
    const text = plans.map((p, i) => `${String(i + 1).padStart(2, '0')}. ${p.text}`).join('\n\n');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => toast('已复制 15 个方案')).catch(() => fallbackCopy(text));
    } else fallbackCopy(text);
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast('已复制'); } catch (e) { toast('复制失败，请长按选择'); }
    ta.remove();
  }

  function submit() {
    const kept = [], rejected = [];
    Object.keys(votes).forEach(i => (votes[i] === 'keep' ? kept : rejected).push(plans[i].tag));
    LocalEngine.feedback(kept, rejected);
    toast(`已记录 ${kept.length} 想去 / ${rejected.length} 不去`);
    generate();
  }

  async function boot() {
    try {
      const res = await fetch('data/app-data.json');
      DATA = await res.json();
      LocalEngine.init(DATA);
      $('#statLine').textContent = `内置 ${DATA.pois.length} 个地点、${DATA.activities.length} 类活动、${DATA.food.length} 家餐饮、${DATA.atmosphere.length} 条氛围、${DATA.time.length} 个时段。`;
      renderStats();
    } catch (e) {
      $('#heroTitle').textContent = '数据载入失败';
      toast('数据载入失败，请重新打开');
    }
  }

  $('#genBtn').addEventListener('click', () => generate());
  $('#copyBtn').addEventListener('click', copyAll);
  $('#submitBtn').addEventListener('click', submit);
  $('#settingsBtn').addEventListener('click', () => $('#sheet').classList.remove('hidden'));
  $('#closeSheet').addEventListener('click', () => $('#sheet').classList.add('hidden'));
  $('#sheet').addEventListener('click', e => { if (e.target.id === 'sheet') $('#sheet').classList.add('hidden'); });
  $('#resetBtn').addEventListener('click', () => {
    if (confirm('清除本机的全部学习记录？此操作不可撤销。')) {
      LocalEngine.reset(); renderStats(); toast('已清除');
    }
  });
  $('#plans').addEventListener('click', e => {
    const b = e.target.closest('button[data-v]');
    if (!b) return;
    const i = +b.dataset.i, v = b.dataset.v;
    votes[i] = votes[i] === v ? null : v;
    document.querySelectorAll(`button[data-i="${i}"]`).forEach(x => x.classList.remove('on'));
    if (votes[i]) b.classList.add('on');
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
  boot();
})();
