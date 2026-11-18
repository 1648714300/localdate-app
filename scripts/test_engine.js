/* 零依赖引擎自测：node scripts/test_engine.js */
const fs = require('fs');
const path = require('path');
global.window = global;
const mem = {};
global.localStorage = {
  getItem: k => (k in mem ? mem[k] : null),
  setItem: (k, v) => { mem[k] = v; },
};
require(path.join(__dirname, '..', 'js', 'engine.js'));
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'app-data.json'), 'utf8'));
const E = global.LocalEngine;
E.init(data);
const p1 = E.generate({ seed: 20261119 });
const counts = p1.reduce((m, p) => (m[p.region] = (m[p.region] || 0) + 1, m), {});
const combos = new Set(p1.map(p => p.tag + '|' + p.poi));
const assert = (cond, msg) => { if (!cond) { console.error('FAIL:', msg); process.exitCode = 1; } else console.log('ok  -', msg); };
assert(p1.length === 15, '每轮 15 个方案');
assert(counts['淮南'] === 10 && counts['近圈'] === 4 && counts['远途'] === 1, '地区分布 10/4/1，实际 ' + JSON.stringify(counts));
assert(combos.size === 15, '本轮组合零重复');
assert(p1.every(p => p.lines.length === 4 && p.lines[0].startsWith('去')), '每个方案 4 行且白描腔开头');
assert(p1.every(p => p.text.includes('邀她：')), '每个方案带邀约话术');
assert(p1.filter(p => p.cautious).length <= 1, '慎用项最多 1 条');
const p2 = E.generate({ seed: 20261119 });
const overlap = p2.filter(p => combos.has(p.tag + '|' + p.poi)).length;
assert(overlap <= 2, '连续两轮重合 ≤2，实际 ' + overlap);
const before = JSON.stringify(E.getState().elo);
E.feedback([p2[0].tag], [p2[1].tag, p2[2].tag]);
assert(JSON.stringify(E.getState().elo) !== before, '反馈写入权重');
assert(E.getState().rounds === 1, '轮次计数 +1');
console.log('\n样例方案：\n' + p1[0].text);
console.log('\n数据：活动 ' + data.activities.length + ' / 场地 ' + data.venues.length + ' / 地点 ' + data.pois.length + ' / 餐饮 ' + data.food.length);
