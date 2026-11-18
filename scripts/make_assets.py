#!/usr/bin/env python3
"""生成应用图标、Feature Graphic 与商店截图（纯 PIL，无外部素材）。"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ICON = ROOT / "www" / "assets" / "icons"
SHOT = ROOT / "store" / "screenshots"
STORE = ROOT / "store"
for d in (ICON, SHOT, STORE):
    d.mkdir(parents=True, exist_ok=True)

FONT_PATH = "C:/Windows/Fonts/msyh.ttc"
FONT_BOLD = "C:/Windows/Fonts/msyhbd.ttc"
if not Path(FONT_BOLD).exists():
    FONT_BOLD = FONT_PATH

def F(size, bold=False):
    path = FONT_BOLD if bold else FONT_PATH
    return ImageFont.truetype(path, size)

BG = "#f7f4ef"
PAPER = "#fffdf9"
INK = "#26221e"
MUTED = "#8b8177"
LINE = "#e8e0d4"
ACCENT = "#d9634b"
SOFT = "#fbece6"

def rounded(draw, box, r, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=r, fill=fill, outline=outline, width=width)

def heart(d, cx, cy, r, color):
    d.ellipse((cx - r, cy - r * 0.65, cx, cy + r * 0.3), fill=color)
    d.ellipse((cx, cy - r * 0.65, cx + r, cy + r * 0.3), fill=color)
    d.polygon([(cx - r, cy), (cx + r, cy), (cx, cy + r)], fill=color)

def cross(d, cx, cy, r, color):
    d.line((cx - r, cy - r, cx + r, cy + r), fill=color, width=4)
    d.line((cx + r, cy - r, cx - r, cy + r), fill=color, width=4)

def icon(size, name):
    img = Image.new("RGB", (size, size), BG)
    d = ImageDraw.Draw(img)
    m = int(size * 0.06)
    rounded(d, (m, m, size - m, size - m), int(size * 0.22), INK)
    d.text((size / 2, size * 0.47), "LD", font=F(int(size * 0.30), True),
           fill=PAPER, anchor="mm")
    d.ellipse((size * 0.755, size * 0.225, size * 0.815, size * 0.285), fill=ACCENT)
    d.text((size / 2, size * 0.755), "约会方案", font=F(int(size * 0.085)),
           fill="#cfc5b8", anchor="mm")
    img.save(ICON / name)

def feature():
    w, h = 1024, 500
    img = Image.new("RGB", (w, h), INK)
    d = ImageDraw.Draw(img)
    d.text((70, 145), "LocalDate", font=F(96, True), fill=PAPER)
    d.text((74, 268), "把「去哪」变成能落地的方案", font=F(38), fill="#e9dfd3")
    d.text((76, 340), "15 个可落地提案 · 本地离线 · 越用越准", font=F(25), fill="#b8ab9e")
    for i, (t, c) in enumerate([("去浅山，花一下午，看书喝咖啡", SOFT),
                                 ("位置在大通区九大路188号", "#efe8dc"),
                                 ("回来路上吃一碗牛肉汤", "#f2e6d8")]):
        y = 110 + i * 105
        rounded(d, (620, y, 960, y + 84), 18, c)
        d.text((642, y + 24), t, font=F(22), fill=INK)
    img.save(STORE / "feature-graphic.png")

PHONE_W, PHONE_H = 1170, 2532
PAD = 56

def base(status="9:41"):
    img = Image.new("RGB", (PHONE_W, PHONE_H), BG)
    d = ImageDraw.Draw(img)
    d.text((PAD, 38), status, font=F(28, True), fill=INK)
    d.text((PHONE_W - 130, 38), "▮▮▮", font=F(24), fill=INK)
    rounded(d, (PHONE_W // 2 - 90, 34, PHONE_W // 2 + 90, 62), 14, INK)
    d.text((PHONE_W // 2, 48), "LocalDate", font=F(20, True), fill=PAPER, anchor="mm")
    d.text((PAD, 108), "LD", font=F(34, True), fill=PAPER, anchor="mm")
    rounded(d, (PAD - 20, 90, PAD + 42, 152), 14, INK)
    d.text((PAD + 62, 104), "LocalDate", font=F(38, True), fill=INK)
    d.text((PAD + 62, 152), "把「去哪」变成能落地的方案", font=F(22), fill=MUTED)
    d.rounded_rectangle((PHONE_W - 118, 100, PHONE_W - 64, 156), 16, fill=PAPER, outline=LINE, width=2)
    d.text((PHONE_W - 91, 128), "⚙", font=F(34), fill=INK, anchor="mm")
    return img, d

def card(d, x, y, num, region, title, lines, region_color=ACCENT, h=430):
    rounded(d, (x, y, PHONE_W - PAD, y + h), 26, PAPER, outline=LINE, width=2)
    rounded(d, (x + 26, y + 22, x + 82, y + 58), 8, BG)
    d.text((x + 54, y + 40), num, font=F(22, True), fill=MUTED, anchor="mm")
    rounded(d, (x + 96, y + 22, x + 180, y + 58), 18, fill=BG, outline=LINE, width=2)
    d.text((x + 138, y + 41), region, font=F(20), fill=region_color, anchor="mm")
    d.text((x + 28, y + 82), title, font=F(38, True), fill=INK)
    yy = y + 146
    for i, line in enumerate(lines):
        d.text((x + 28, yy), line[:26], font=F(26 if i == 0 else 24, i == 0), fill=INK if i == 0 else "#4a423a")
        yy += 48
    d.line((x + 28, y + h - 96, PHONE_W - PAD - 28, y + h - 96), fill=LINE, width=2)
    heart(d, x + 42, y + h - 62, 11, MUTED)
    d.text((x + 62, y + h - 76), "想去", font=F(24), fill=MUTED)
    cross(d, x + 264, y + h - 62, 10, MUTED)
    d.text((x + 284, y + h - 76), "不去", font=F(24), fill=MUTED)

def shot1():
    img, d = base()
    d.text((PAD, 210), "淮南 · 第 1 轮 · 已学 0 条偏好", font=F(24), fill=MUTED)
    d.text((PAD, 252), "今天，去哪儿坐坐。", font=F(62, True), fill=INK)
    d.text((PAD, 352), "15 个方案：10 个本地 · 4 个近圈 · 1 个远途。\n点 ♥ 或 × 告诉我口味，下一轮更准。", font=F(25), fill=MUTED)
    rounded(d, (PAD, 470, PHONE_W - PAD, 580), 22, INK)
    d.text((PHONE_W // 2, 525), "生成本轮方案", font=F(34, True), fill=PAPER, anchor="mm")
    card(d, PAD, 660, "01", "本地", "淮南浅山咖啡俱乐部",
         ["去浅山，花一下午，看书喝咖啡，自然侧光。", "位置在大通区九大路188号，¥30上下。", "回来路上在杨家牛肉汤吃一碗。"])
    card(d, PAD, 1160, "02", "近圈", "合肥·逍遥津公园",
         ["去逍遥津，花小半天，看树影，走走停停。", "位置在庐阳区，免费。", "回来买点现成的带过去，边走边吃。"])
    d.rectangle((0, PHONE_H - 20, PHONE_W, PHONE_H), fill="#8b8177")
    img.save(SHOT / "01-生成方案.png")

def shot2():
    img, d = base()
    d.text((PAD, 210), "淮南 · 第 3 轮 · 已学 27 条偏好", font=F(24), fill=MUTED)
    card(d, PAD, 290, "04", "本地", "舜耕山·山南梅园",
         ["去山南梅园，花小半天，看梅，慢慢走一段。", "位置在舜耕山南麓，免费。", "回来在老徐家砂汤吃，只做上午场。", "邀她：天气还行的话，去走走？走累了就找地方坐。"],
         h=560)
    d.text((PAD + 28, 890), "来源：[携程]5.0 · 出发前电话确认", font=F(22), fill=MUTED)
    card(d, PAD, 990, "05", "本地", "春申湖湿地公园",
         ["去春申湖，花一下午，看日落，沿步道走。", "位置在大通区，8km步道，免费。", "回来路上在谢继红牛肉汤吃，人均¥20。"],
         h=490)
    d.rectangle((0, PHONE_H - 20, PHONE_W, PHONE_H), fill="#8b8177")
    img.save(SHOT / "02-方案详情.png")

def shot3():
    img, d = base()
    d.text((PAD, 210), "淮南 · 第 7 轮 · 已学 64 条偏好", font=F(24), fill=MUTED)
    d.text((PAD, 252), "买菜、看书、坐一下午，也算是约会。", font=F(44, True), fill=INK)
    for i, (n, r, t) in enumerate([("01", "本地", "龙湖公园"), ("02", "本地", "淮南市博物馆"),
                                    ("03", "本地", "春申里文旅街区"), ("04", "近圈", "蚌埠·龙子湖"),
                                    ("05", "远途", "黄山·屯溪老街")]):
        y = 360 + i * 420
        card(d, PAD, y, n, r, t,
             ["去那里，花一下午，慢慢看，慢慢走。", "位置在淮南，免费或低价。", "回来路上吃点热的。"], h=370)
    d.rectangle((0, PHONE_H - 20, PHONE_W, PHONE_H), fill="#8b8177")
    img.save(SHOT / "03-十五方案.png")

def shot4():
    img, d = base()
    d.text((PAD, 210), "本机学习记录", font=F(52, True), fill=INK)
    for i, (t, v) in enumerate([("想去", "♥ 12 条"), ("不去", "× 5 条"),
                                 ("特征评分", "已调整 27 次")]):
        y = 330 + i * 150
        rounded(d, (PAD, y, PHONE_W - PAD, y + 116), 20, PAPER, outline=LINE, width=2)
        d.text((PAD + 32, y + 58), t, font=F(30), fill=INK, anchor="lm")
        d.text((PHONE_W - PAD - 32, y + 58), v, font=F(32, True), fill=ACCENT, anchor="rm")
    d.text((PAD, 900), "落选只降权，不永久封杀。\n隔几轮还有机会再出现。", font=F(30), fill=INK)
    rounded(d, (PAD, 1120, PHONE_W - PAD, 1280), 22, INK)
    d.text((PHONE_W // 2, 1200), "提交反馈并换一批", font=F(34, True), fill=PAPER, anchor="mm")
    d.rectangle((0, PHONE_H - 20, PHONE_W, PHONE_H), fill="#8b8177")
    img.save(SHOT / "04-反馈学习.png")

def shot5():
    img, d = base()
    d.text((PAD, 210), "设置与说明", font=F(52, True), fill=INK)
    items = [
        ("这个软件做什么", "把「约会去哪」拆成可执行的方案：地点、时长、做什么、吃什么、怎么开口。全部在本机离线生成，不上传任何数据，也不需要账号。"),
        ("反馈怎么起作用", "每次点 ♥ / × 会调整特征评分。落选只是降权，不会永久封杀；隔几轮还有机会再出现。"),
        ("数据说明", "内置 452 个地点、245 类活动、29 家餐饮、84 条氛围、1140 个时段。来源：公开资料。价格与营业状态可能变动，出发前请核实。"),
    ]
    y = 320
    for title, body in items:
        d.text((PAD, y), title, font=F(30, True), fill=INK)
        y += 54
        # 简单折行
        line, lines = "", []
        for ch in body:
            line += ch
            if len(line) > 27:
                lines.append(line); line = ""
        if line: lines.append(line)
        for l in lines:
            d.text((PAD, y), l, font=F(23), fill="#5b5149")
            y += 40
        y += 44
    d.rectangle((0, PHONE_H - 20, PHONE_W, PHONE_H), fill="#8b8177")
    img.save(SHOT / "05-隐私说明.png")

if __name__ == "__main__":
    icon(192, "icon-192.png")
    icon(512, "icon-512.png")
    icon(1024, "icon-1024.png")
    feature()
    shot1(); shot2(); shot3(); shot4(); shot5()
    print("assets ok:", len(list(SHOT.glob("*.png"))), "screenshots")
