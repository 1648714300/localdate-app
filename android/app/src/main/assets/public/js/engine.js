/* LocalDate 离线方案引擎：A+B+C+D 组合 + Elo 反馈 + 去重黑名单 */
(function (global) {
  'use strict';

  const K = 24;          // Elo 步长
  const LAMBDA = 0.05;   // 每轮时间衰减
  const UCB_C = 40;      // 探索加成
  const HEAT = 0.15;     // 热度权重

  // 万能活动：与任何场地都不违和，作为匹配失败时的兜底
  const UNIVERSAL = [
    { id: 'U01', name: '找个位子坐着，看会儿风景', score: 3, flow: false },
    { id: 'U02', name: '慢慢走走，看什么算什么', score: 3, flow: false },
    { id: 'U03', name: '各自看会儿手机，偶尔聊两句', score: 3, flow: true },
  ];
  // 只取能自然写进白描句的氛围维度；人流/仪式/道具等维度写入会变成"全是老人"这类怪句
  const SAFE_ATMO = new Set(['光线', '声音', '季节', '气味', '温度', '节奏']);

  let D = null;
  let state = null;

  const STORE_KEY = 'localdate.state.v1';

  function defaultState() {
    return { elo: {}, seen: [], kept: [], rejected: [], rounds: 0, city: '淮南' };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return Object.assign(defaultState(), JSON.parse(raw));
    } catch (e) { /* 隐私模式下 localStorage 不可用，降级为内存态 */ }
    return defaultState();
  }

  function saveState() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* 忽略 */ }
  }

  function init(data) {
    D = data;
    state = loadState();
    return state;
  }

  function tagOf(act, poi) {
    return `${act.id}|${poi.type || '通用'}`;
  }

  function expected(a, b) { return 1 / (1 + Math.pow(10, (b - a) / 400)); }

  function rank(tag) {
    return state.elo[tag] || { s: 1000, n: 0 };
  }

  function scoreOf(act, poi, round) {
    const tag = tagOf(act, poi);
    const r = rank(tag);
    const base = (act.score || 1) * 12 + (act.flow ? 4 : 0);
    const explore = UCB_C * Math.sqrt(Math.log(round + 2) / (r.n + 1));
    const heat = HEAT * (poi.region === '淮南' ? 10 : 4);
    const fit = poi.fit && poi.fit.includes(act.name.slice(0, 2)) ? 8 : 0;
    return base + r.s - 1000 + explore + heat + fit;
  }

  function pick(arr, rng) { return arr.length ? arr[Math.floor(rng() * arr.length)] : null; }

  function matchedActs(poi) {
    const fit = (poi.fit || '') + (poi.type || '') + (poi.name || '');
    const all = D.activities.filter(a => !a.caution && !a.unsafe);
    const hit = all.filter(a => {
      const parts = a.name.split(/[\/、,，]/).map(s => s.trim()).filter(s => s.length >= 2);
      return parts.some(k => fit.includes(k) || fit.includes(k.slice(0, 2)));
    });
    return hit.length ? hit : UNIVERSAL;
  }

  function safeAtmosphere() {
    const a = D.atmosphere.filter(x => SAFE_ATMO.has(x.dim));
    return a.length ? a : [{ dim: '节奏', value: '慢慢来' }];
  }

  function shuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function seedFrom(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return function () {
      h += 0x6D2B79F5;
      let t = h;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function recentKeys() {
    return new Set(state.seen.slice(-45));
  }

  const DURATION = ['一个下午', '一个上午', '一晚上', '小半天', '一整天', '两小时'];

  function invite(act, poi) {
    const a = act.name.replace(/\//g, '或');
    if (act.flow) return `周末要不要一起${a}？你不用准备什么，我顺路带你那份。`;
    if (poi.type && /公园|湖|湿地|山/.test(poi.type)) return `天气还行的话，去${poi.name}${'走走'}？走累了就找地方坐。`;
    return `这周找个时间去${poi.name}坐坐，不用赶时间，你挑个方便的时间就行。`;
  }

  function eatLine(food, poi) {
    if (!food) return '门口买点现成的带过去，边走边吃。';
    const price = food.price && /^\d/.test(String(food.price)) ? `，人均¥${food.price}` : '';
    const order = food.order ? `，${food.order}` : '';
    return `回来路上在${food.name}吃${price}${order}。`;
  }

  function makePlan(poi, act, food, atmo, slot, rng, region) {
    const atmoText = atmo ? atmo.value : '慢慢来';
    // 夜间氛围不配"一个下午"，晨间氛围不配"一晚上"
    const night = /夜|霓虹|月光|烛光|星空/.test(atmoText);
    const morning = /晨|早|朝/.test(atmoText);
    const dur = night ? '一晚上' : morning ? '一个上午' : pick(DURATION, rng);
    const cautious = act.caution || act.score <= 1;
    let line1 = `去${poi.name}，花${dur}，${act.name}，${atmoText}。`;
    if (cautious) line1 += '（这条先问她愿不愿意）';
    const loc = poi.type || '实地';
    const price = poi.price ? `，${/^\d/.test(String(poi.price)) ? '¥' + poi.price : poi.price}` : '';
    const line2 = `位置在${poi.region === '淮南' ? '淮南' : poi.region}，${loc}${price}。`;
    const line3 = eatLine(food, poi);
    const line4 = `邀她：${invite(act, poi)}`;
    const src = poi.source ? String(poi.source).slice(0, 80) : '公开景点库，出发前电话确认';
    return {
      title: poi.name.length > 12 ? poi.name.slice(0, 12) : poi.name,
      region,
      lines: [line1, line2, line3, line4],
      text: [line1, line2, line3, line4].join('\n'),
      tag: tagOf(act, poi),
      poi: poi.name,
      act: act.name,
      source: src,
      cautious,
      atmo: atmoText,
      slot: slot ? `${slot.clock} ${slot.label}` : dur,
    };
  }

  function buildPool(region) {
    return D.pois.filter(p => region === '淮南' ? p.region === '淮南' : region === '近圈' ? p.region === '近圈' : p.region !== '淮南' && p.region !== '近圈');
  }

  function generate(opts) {
    opts = opts || {};
    const round = state.rounds + 1;
    const rng = seedFrom((opts.seed || Date.now()) + '|' + round);
    const groups = [
      { region: '淮南', n: 10 },
      { region: '近圈', n: 4 },
      { region: '远途', n: 1 },
    ];
    const recent = recentKeys();
    const usedActs = new Set();
    const plans = [];
    const slots = D.time.filter(t => opts.season ? t.season.includes(opts.season) : true);

    for (const g of groups) {
      let pool = buildPool(g.region).filter(p => p.name);
      // 保持三个来源层的独立，取分数最高的候选（带探索）
      const scored = pool.map(p => {
        const acts = matchedActs(p);
        let best = null, bs = -Infinity;
        for (const a of acts) {
          const s = scoreOf(a, p, round) - (usedActs.has(a.id) ? 6 : 0);
          if (s > bs) { bs = s; best = a; }
        }
        return { p, a: best, s: bs + rng() * 14 };
      }).filter(x => !recent.has(`${x.a.id}|${x.p.type || '通用'}|${x.p.name}`))
        .sort((x, y) => y.s - x.s);

      let chosen = scored.slice(0, g.n);
      if (chosen.length < g.n) {
        chosen = chosen.concat(scored.slice(0, g.n - chosen.length));
      }
      chosen.forEach((x, i) => {
        // 慎用位：每组第一个里替换一条为体力/慎用项（每轮共 1 条）
        let act = x.a;
        if (i === 0 && g.region === '淮南' && !opts.noCaution &&
            /山|湖|湿地|公园|森林|江|河|堤|绿道/.test((x.p.type || '') + (x.p.name || ''))) {
          // 慎用位只放体力敏感型，且只在户外场地出现；身体接触与重仪式类已剔除
          const risky = D.activities.filter(a => !a.unsafe && a.score === 1 &&
            /爬|徒步|骑行|露营|桨板|索道|缆车|夜跑/.test(a.name));
          if (risky.length) act = pick(risky, rng);
        }
        usedActs.add(act.id);
        const food = pick(D.food, rng);
        const atmo = pick(safeAtmosphere(), rng);
        const slot = pick(slots.length ? slots : D.time, rng);
        plans.push(makePlan(x.p, act, food, atmo, slot, rng, g.region));
      });
    }

    // 记录本轮组合进短期记忆（不永久封杀）
    state.seen = state.seen.concat(plans.map(p => `${p.tag}|${p.poi}`)).slice(-90);
    return plans;
  }

  function feedback(keptTags, rejectedTags) {
    const apply = (tag, win) => {
      if (!tag || !state.elo[tag]) state.elo[tag] = { s: 1000, n: 0 };
      const r = state.elo[tag];
      const others = Object.values(state.elo);
      const avg = others.length ? others.reduce((s, x) => s + x.s, 0) / others.length : 1000;
      const exp = expected(r.s, avg);
      r.s = Math.round((r.s + K * ((win ? 1 : 0) - exp)) * 100) / 100;
      r.n += 1;
    };
    (keptTags || []).forEach(t => apply(t, true));
    (rejectedTags || []).forEach(t => apply(t, false));
    // 时间衰减：长期未反馈的条目缓慢回归均值
    Object.values(state.elo).forEach(r => {
      r.s = Math.round((1000 + (r.s - 1000) * (1 - LAMBDA)) * 100) / 100;
    });
    state.kept = state.kept.concat(keptTags || []).slice(-300);
    state.rejected = state.rejected.concat(rejectedTags || []).slice(-300);
    state.rounds += 1;
    saveState();
  }

  function reset() {
    state = defaultState();
    saveState();
  }

  global.LocalEngine = { init, generate, feedback, reset, getState: () => state, save: saveState };
})(window);
