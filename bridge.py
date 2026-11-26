# -*- coding: utf-8 -*-
"""
OCS AI 答题桥接服务 - 分发版（自包含，通用 OpenAI 兼容端点）
双击打包后的 exe 启动；浏览器打开 http://127.0.0.1:38987/ 填 key / 选模型。
配置文件 config.json 自动生成在 exe 同目录，填一次即可。
"""
import json
import os
import re
import ssl
import sys
import threading
import time
import webbrowser
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


def app_dir():
    if getattr(sys, "frozen", False):
        return os.path.dirname(sys.executable)
    return os.path.dirname(os.path.abspath(__file__))


HERE = app_dir()
CFG_FILE = os.path.join(HERE, "config.json")
DEFAULT_CFG = {
    "base_url": "https://api.deepseek.com/v1",
    "api_key": "",
    "model": "deepseek-chat",
    "port": 38987,
    "max_tokens": 800,
}
SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE

PROMPT = """你是网课答题助手。根据题目和选项给出正确答案。
严格只输出一个 JSON 对象，不要输出任何其它文字、不要 markdown 代码块：
{"answer":"<答案>","analysis":"<一句话理由>"}
规则：
- 单选题 answer 为一个选项字母，如 "B"。
- 多选题 answer 为多个字母连写，如 "ABD"。
- 判断题 answer 为 "正确" 或 "错误"。
- 填空题 answer 为要填入的文本本身。
- analysis 不超过 40 字。"""


def load_cfg():
    try:
        d = json.load(open(CFG_FILE, encoding="utf-8"))
        out = dict(DEFAULT_CFG)
        out.update(d)
        return out
    except Exception:
        return dict(DEFAULT_CFG)


def save_cfg(d):
    json.dump(d, open(CFG_FILE, "w", encoding="utf-8"), ensure_ascii=False, indent=2)


def extract_answer(content):
    text = (content or "").strip()
    if not text:
        return "", ""
    m = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.S)
    if m:
        text = m.group(1)
    m = re.search(r"\{[^{}]*\}", text, re.S)
    if m:
        try:
            d = json.loads(m.group(0))
            a = str(d.get("answer", "")).strip()
            if a:
                return a, str(d.get("analysis", "")).strip()
        except Exception:
            pass
    m = re.search(r"(?:答案|answer)\s*[:：]\s*([A-Za-z\u4e00-\u9fa5]{1,12})", text, re.I)
    if m:
        return m.group(1).strip(), ""
    m = re.match(r"^\s*([A-Da-d]{2,6})\s*$", text)
    if m:
        return m.group(1).upper(), ""
    letters = re.findall(r"(?<![A-Za-z])([A-Da-d])(?![A-Za-z])", text)
    if letters:
        return "".join(sorted(set(c.upper() for c in letters))), ""
    return text[:200], ""


def fetch_models(cfg):
    try:
        req = urllib.request.Request(
            cfg["base_url"].rstrip("/") + "/models",
            headers={"Authorization": "Bearer " + (cfg.get("api_key") or "")},
        )
        with urllib.request.urlopen(req, timeout=15, context=SSL_CTX) as r:
            d = json.loads(r.read().decode("utf-8", "replace"))
        return [m.get("id", "") for m in d.get("data", []) if m.get("id")]
    except Exception:
        return []


def do_answer(title, options, qtype, cfg, model=None):
    model = model or cfg.get("model")
    user = "题型：%s\n题目：%s\n选项：\n%s" % (qtype or "自动判断", title, options or "（无）")
    body = json.dumps({
        "model": model,
        "messages": [{"role": "system", "content": PROMPT},
                     {"role": "user", "content": user}],
        "temperature": 0,
        "max_tokens": cfg.get("max_tokens", 800),
    }).encode("utf-8")
    req = urllib.request.Request(
        cfg["base_url"].rstrip("/") + "/chat/completions",
        data=body,
        headers={"Content-Type": "application/json",
                 "Authorization": "Bearer " + (cfg.get("api_key") or "")},
    )
    with urllib.request.urlopen(req, timeout=120, context=SSL_CTX) as r:
        d = json.loads(r.read().decode("utf-8", "replace"))
    content = d.get("choices", [{}])[0].get("message", {}).get("content") or ""
    ans, ana = extract_answer(content)
    return ans, ana, model


PAGE = r'''<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>OCS AI 答题 · 配置</title>
<style>
*{box-sizing:border-box}body{margin:0;font:14px/1.6 -apple-system,"Microsoft YaHei",sans-serif;background:#f6f7f9;color:#222}
.wrap{max-width:720px;margin:0 auto;padding:24px 18px 60px}
h1{font-size:20px;margin:0 0 4px}.sub{color:#888;font-size:12px;margin-bottom:20px}
.card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:18px;margin-bottom:16px}
.card h2{font-size:14px;margin:0 0 12px;color:#333}
label{display:block;font-size:12px;color:#666;margin:10px 0 4px}
input[type=text],input[type=password]{width:100%;padding:9px 11px;border:1px solid #d5d8de;border-radius:8px;font-size:13px;outline:none}
input:focus{border-color:#4f7cff}
button{cursor:pointer;border:0;border-radius:8px;padding:9px 14px;font-size:13px}
.btn{background:#4f7cff;color:#fff}.btn:hover{background:#3d68e8}
.btn2{background:#eef2ff;color:#3355cc}.btn2:hover{background:#e0e8ff}
.preset{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.preset button{background:#f1f3f6;color:#444;font-size:12px;padding:6px 11px}
.status{display:inline-block;width:8px;height:8px;border-radius:50%;background:#22c55e;margin-right:6px}
.off{background:#ef4444}
.msg{font-size:12px;margin-top:10px;color:#555;min-height:16px}
.models{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin-top:10px;max-height:320px;overflow:auto}
.model{padding:8px 10px;border:1px solid #e5e7eb;border-radius:8px;background:#fff;text-align:left;font-size:12px;word-break:break-all}
.model.on{border-color:#4f7cff;background:#eef2ff;color:#2b4fd0}
.cur{margin-top:10px;font-size:13px;color:#333}.cur b{color:#4f7cff}
.small{font-size:11px;color:#999}
</style></head><body><div class="wrap">
<h1>OCS AI 答题 · 配置</h1>
<div class="sub"><span class="status" id="dot"></span><span id="svc">服务状态检测中…</span></div>

<div class="card">
<h2>1. 模型接口（只需填一次）</h2>
<label>API 地址（OpenAI 兼容）</label>
<input type="text" id="base" placeholder="https://api.deepseek.com/v1">
<label>API Key</label>
<input type="password" id="key" placeholder="sk-...">
<div class="preset">
<button onclick="preset('https://api.deepseek.com/v1','deepseek-chat')">DeepSeek 官方</button>
<button onclick="preset('http://127.0.0.1:8326/v1','workbuddy-ai/auto')">本机 dsh 网关</button>
</div>
<label>默认模型</label>
<input type="text" id="defmodel" placeholder="deepseek-chat">
<div class="preset"><button class="btn" onclick="saveCfg()">保存配置</button></div>
<div class="msg" id="cfgmsg"></div>
<div class="small">填自己的 DeepSeek key（platform.deepseek.com 申请）即开即用；若本机装了 dsh，点“本机 dsh 网关”可免 key。</div>
</div>

<div class="card">
<h2>2. 选模型（点一下即切换）</h2>
<div class="cur">当前模型：<b id="curmodel">-</b></div>
<label>过滤</label>
<input type="text" id="filter" placeholder="输入 deepseek / hy4 / glm 过滤" oninput="renderModels()">
<div class="models" id="models"></div>
<div class="msg" id="modelmsg"></div>
</div>

<div class="card">
<h2>3. 测试答题</h2>
<label>题目</label>
<input type="text" id="q" value="下列哪个是中国的首都？">
<label>选项</label>
<input type="text" id="o" value="A.上海&#10;B.北京&#10;C.广州">
<button class="btn2" onclick="testAsk()">测试</button>
<div class="msg" id="testmsg"></div>
</div>

</div>
<script>
var ALL=[];
function j(u,o){return fetch(u,o).then(r=>r.json())}
function loadCfg(){j('/config').then(d=>{document.getElementById('base').value=d.base_url||'';document.getElementById('key').value=d.api_key||'';document.getElementById('defmodel').value=d.model||'';loadCur();loadModels();})}
function preset(b,m){document.getElementById('base').value=b;document.getElementById('defmodel').value=m;
  if(b.indexOf('8326')>=0)document.getElementById('key').value='dsh';}
function saveCfg(){var d={base_url:document.getElementById('base').value.trim(),api_key:document.getElementById('key').value.trim(),model:document.getElementById('defmodel').value.trim()};
  j('/config',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)}).then(r=>{document.getElementById('cfgmsg').textContent='已保存，正在刷新模型…';loadModels();});}
function loadCur(){j('/current').then(d=>{document.getElementById('curmodel').textContent=d.model||'-'})}
function loadModels(){document.getElementById('modelmsg').textContent='拉取中…';
  j('/models?refresh=1').then(d=>{ALL=d.models||[];document.getElementById('modelmsg').textContent=ALL.length?('共 '+ALL.length+' 个模型'):'未拉到模型，检查 API 地址和 key';renderModels();}).catch(()=>{document.getElementById('modelmsg').textContent='拉取失败'})}
function renderModels(){var f=(document.getElementById('filter').value||'').toLowerCase();
  var box=document.getElementById('models');box.innerHTML='';
  ALL.filter(x=>x.toLowerCase().indexOf(f)>=0).forEach(m=>{var b=document.createElement('button');b.className='model';b.textContent=m;
    b.onclick=()=>j('/select',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:m})}).then(()=>{loadCur();renderModels();});
    box.appendChild(b);});}
function testAsk(){document.getElementById('testmsg').textContent='答题中…';
  var d={title:document.getElementById('q').value,options:document.getElementById('o').value,type:'single'};
  j('/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)}).then(r=>{
    document.getElementById('testmsg').textContent=r.code===1?('答案：'+r.answer+'　模型：'+r.model+'　理由：'+(r.analysis||'')):('失败：'+(r.msg||'未配置 key'));
  }).catch(e=>document.getElementById('testmsg').textContent='请求失败：'+e)}
j('/health').then(()=>{document.getElementById('svc').textContent='服务运行中 · http://127.0.0.1:38987/'}).catch(()=>{document.getElementById('dot').className='status off';document.getElementById('svc').textContent='服务未响应'});
loadCfg();
</script></body></html>'''


class H(BaseHTTPRequestHandler):
    def _send(self, code, body, ctype="application/json; charset=utf-8"):
        data = body.encode("utf-8") if isinstance(body, str) else body
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, *a):
        pass

    def do_OPTIONS(self):
        self._send(204, b"")

    def do_GET(self):
        p = self.path.split("?")[0]
        cfg = load_cfg()
        if p == "/" or p == "/index.html":
            return self._send(200, PAGE, "text/html; charset=utf-8")
        if p == "/health":
            return self._send(200, json.dumps({"ok": True, "service": "ocs-ai-bridge"}))
        if p == "/config":
            return self._send(200, json.dumps({"base_url": cfg["base_url"],
                                               "api_key": cfg["api_key"],
                                               "model": cfg["model"]}))
        if p == "/current":
            return self._send(200, json.dumps({"model": cfg["model"]}))
        if p == "/models":
            return self._send(200, json.dumps({"models": fetch_models(cfg)}))
        self._send(404, json.dumps({"ok": False}))

    def do_POST(self):
        p = self.path.split("?")[0]
        n = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(n).decode("utf-8", "replace") if n else "{}"
        cfg = load_cfg()
        try:
            d = json.loads(raw)
        except Exception:
            d = {}
        if p == "/config":
            for k in ("base_url", "api_key", "model", "port", "max_tokens"):
                if k in d:
                    cfg[k] = d[k]
            save_cfg(cfg)
            return self._send(200, json.dumps({"ok": True}))
        if p == "/select":
            m = str(d.get("model", "")).strip()
            if m:
                cfg["model"] = m
                save_cfg(cfg)
            return self._send(200, json.dumps({"ok": True, "model": cfg["model"]}))
        if p == "/search":
            if not cfg.get("api_key") and "8326" not in cfg.get("base_url", ""):
                return self._send(200, json.dumps({"code": 0, "msg": "未配置 API Key，请在网页里填写"}))
            src = d.get("response", d)
            if isinstance(src, str):
                try:
                    src = json.loads(src)
                except Exception:
                    src = {}
            model = src.get("model") or cfg.get("model")
            try:
                ans, ana, used = do_answer(src.get("title", ""), src.get("options", ""),
                                           src.get("type", ""), cfg, model)
                return self._send(200, json.dumps({
                    "code": 1 if ans else 0,
                    "question": src.get("title", ""),
                    "answer": ans,
                    "analysis": ana,
                    "model": used,
                }, ensure_ascii=False))
            except Exception as e:
                return self._send(200, json.dumps({"code": 0, "msg": "%s: %s" % (type(e).__name__, e)},
                                                  ensure_ascii=False))
        self._send(404, json.dumps({"ok": False}))


if __name__ == "__main__":
    cfg = load_cfg()
    if not os.path.exists(CFG_FILE):
        save_cfg(cfg)
    port = int(cfg.get("port", 38987))
    srv = ThreadingHTTPServer(("127.0.0.1", port), H)
    url = "http://127.0.0.1:%d/" % port
    print("OCS AI bridge running: " + url)
    print("Close this window to stop the service.")
    threading.Thread(target=lambda: (time.sleep(1.2), webbrowser.open(url)), daemon=True).start()
    srv.serve_forever()
