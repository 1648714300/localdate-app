#!/usr/bin/env python3
"""把 localdate skill 的 markdown 要素池编译成 App 内置 JSON。零依赖。"""
import json
import re
from pathlib import Path

SRC = Path(r"C:/Users/Administrator/.workbuddy-4/skills/localdate/city-packs/huainan/catalog")
OUT = Path(__file__).resolve().parents[1] / "data" / "app-data.json"


def read(name):
    return (SRC / name).read_text(encoding="utf-8", errors="replace")


def table_rows(text):
    rows = []
    header = None
    prev = None
    for line in text.splitlines():
        line = line.strip()
        if not line.startswith("|"):
            continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        if all(set(c) <= set("-: ") for c in cells):
            if prev:
                header = prev
            continue
        # 分节表头行本身不是数据（多节文件的列结构会变）
        if cells and cells[0] in {"店", "店／街", "条目", "名称", "地点"}:
            prev = cells
            continue
        if header is None or len(cells) != len(header):
            prev = cells
            continue
        rows.append(dict(zip(header, cells)))
        prev = cells
    return rows


def parse_activities(text):
    items = []
    for m in re.finditer(r"(?:^|｜)\s*(\d{1,3})\.\s*([^｜\n]+)", text, re.M):
        name = m.group(2).strip()
        name = re.sub(r"\s+★[123](?:流水)?.*$", "", name).strip()
        if not name or len(name) > 40:
            continue
        chunk = m.group(0)
        stars = 3 if "★3" in chunk else 2 if "★2" in chunk else 1 if "★1" in chunk else 0
        # 身体接触／重仪式类一律不进 App 的可选池
        unsafe = any(k in name for k in ("默认禁", "身体类", "由她发起", "热气球", "蹦极", "潜水"))
        name = re.sub(r"（[^）]*(?:默认禁|慎用|身体类|由她发起)[^）]*）", "", name).strip()
        name = re.sub(r"（[^）]*重仪式[^）]*）", "", name).strip()
        items.append({
            "id": f"A{int(m.group(1)):03d}",
            "name": name,
            "score": stars,
            "flow": "流水" in chunk,
            "caution": "慎用" in chunk or "默认禁" in chunk,
            "unsafe": unsafe,
        })
    # 去重保序
    seen, out = set(), []
    for it in items:
        if it["id"] in seen:
            continue
        seen.add(it["id"])
        out.append(it)
    return out


def parse_numbered(text):
    seen, out = set(), []
    for m in re.finditer(r"^\s*(\d{1,4})\.\s+(.+?)\s*$", text, re.M):
        name = m.group(2).strip()
        if len(name) > 60 or name in seen:
            continue
        seen.add(name)
        out.append({"name": name, "zone": name.split("·")[0] if "·" in name else "淮南"})
    return out


def parse_pois(text, region):
    out = []
    for r in table_rows(text):
        name = r.get("条目") or r.get("店") or r.get("名称")
        if not name or "---" in name:
            continue
        out.append({
            "name": name,
            "region": region,
            "type": r.get("类型", ""),
            "fit": r.get("适配 A", ""),
            "price": r.get("人均") or r.get("价格", ""),
            "slot": r.get("时段", ""),
            "order": r.get("点单", ""),
            "tier": r.get("档", ""),
            "source": r.get("来源", ""),
        })
    return out


def parse_atmosphere(text):
    out = []
    for m in re.finditer(r"^-\s*([^｜\n]+)｜([^｜\n]+)", text, re.M):
        out.append({"dim": m.group(1).strip(), "value": m.group(2).strip()})
    return out


def parse_time(text):
    out = []
    for m in re.finditer(r"^-\s*(\d{2}:\d{2})\s*([^｜\n]*)｜([^｜\n]+)｜([^｜\n]+)", text, re.M):
        out.append({"clock": m.group(1), "label": m.group(2).strip(),
                    "weather": m.group(3).strip(), "season": m.group(4).strip()})
    return out


def main():
    data = {
        "version": "1.0.0",
        "source": "localdate skill city-packs/huainan (合规公开来源，无爬虫数据)",
        "activities": parse_activities(read("catalog_activities.md")),
        "venues": parse_numbered(read("catalog_venues.md")),
        "atmosphere": parse_atmosphere(read("catalog_atmosphere.md")),
        "time": parse_time(read("catalog_time.md")),
        "pois": (
            parse_pois(read("catalog_huainan.md"), "淮南") +
            parse_pois(read("catalog_huainan_nearby.md"), "近圈") +
            parse_pois(read("catalog_anhui.md"), "省内") +
            parse_pois(read("catalog_surrounding_provinces.md"), "远途")
        ),
        "food": parse_pois(read("catalog_food.md"), "淮南餐饮"),
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(json.dumps({k: (len(v) if isinstance(v, list) else v) for k, v in data.items()},
                     ensure_ascii=False))
    print(f"-> {OUT} ({OUT.stat().st_size / 1024:.1f} KB)")


if __name__ == "__main__":
    main()
