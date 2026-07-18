好的，我直接给你代码。你把这三个文件的内容分别粘贴/保存到对应位置即可。

---

## 1. `_worker.js`（复制全部内容）

```javascript
const API_BASE = 'https://bh7jtb.dpdns.org';
const BACKUP_API_BASE = 'https://60s.7se.cn';
const BACKUP_FEATURES = ['bing_wallpaper', 'bilibili', 'weibo'];

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  const pathname = url.pathname;

  if (pathname === '/' || pathname === '/index.html') {
    return new Response(HTML_INDEX, {
      headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders() },
    });
  }

  if (pathname === '/app.js' || pathname === '/public/app.js') {
    return new Response(APP_JS, {
      headers: { 'Content-Type': 'application/javascript; charset=utf-8', ...corsHeaders() },
    });
  }

  if (pathname.startsWith('/api/')) {
    const feature = pathname.replace('/api/', '');
    let targetPath = resolveTargetPath(feature, url);

    try {
      const useBackup = BACKUP_FEATURES.includes(feature);
      const baseUrl = useBackup ? BACKUP_API_BASE : API_BASE;
      const queryString = url.search.slice(1);
      const fullUrl = `${baseUrl}${targetPath}${queryString ? '?' + queryString : ''}`;

      const proxyResponse = await fetch(fullUrl, { method: request.method, headers: { 'Accept': 'application/json' } });
      const data = await proxyResponse.json();

      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders() },
      });
    } catch (error) {
      return new Response(JSON.stringify({ code: 500, message: 'API 请求失败: ' + error.message, data: null }), {
        status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders() },
      });
    }
  }

  return new Response('Not Found', { status: 404, headers: corsHeaders() });
}

function resolveTargetPath(feature, url) {
  const map = {
    '60s': '/v2/60s', 'ai_news': '/v2/ai-news', 'bing_wallpaper': '/v2/bing',
    'exchange_rate': '/v2/exchange-rate', 'history_today': '/v2/history-today',
    'epic_games': '/v2/epic-free-games', 'it_news': '/v2/ithome',
    'douyin_hot': '/v2/douyin', 'weibo_hot': '/v2/weibo', 'bili_hot': '/v2/bili',
    'zhihu_hot': '/v2/zhihu-hot', 'toutiao_hot': '/v2/toutiao-hot',
    'xiaohongshu_hot': '/v2/xhs-hot', 'duodiang_hot': '/v2/dc-hot',
    'weather': '/v2/weather?query=' + (url.searchParams.get('city') || '深圳'),
    'forecast': '/v2/weather/forecast?query=' + (url.searchParams.get('city') || '深圳'),
    'gold_price': '/v2/gold-price', 'oil_price': '/v2/oil-price',
    'moyu_daily': '/v2/moyu-rizhi',
    'lyrics': '/v2/lyrics?query=' + encodeURIComponent(url.searchParams.get('q') || ''),
    'translate': '/v2/fanyi?query=' + encodeURIComponent(url.searchParams.get('q') || '') + '&source=' + (url.searchParams.get('source') || 'auto') + '&target=' + (url.searchParams.get('target') || 'zh'),
    'ip_address': '/v2/ip-address',
    'qr_code': '/v2/qr-code?url=' + encodeURIComponent(url.searchParams.get('url') || ''),
    'baike': '/v2/baike?query=' + encodeURIComponent(url.searchParams.get('q') || ''),
    'random_quote': '/v2/random-hitokoto', 'random_joke': '/v2/random-joke',
    'fortune': '/v2/random-fortune', 'answer_book': '/v2/random-answer-book',
    'kfc_copywriting': '/v2/kfc-copywriting', 'cold_joke': '/v2/random-cold-joke',
    'health_analysis': '/v2/health-analysis?height=' + (url.searchParams.get('height')||'175') + '&weight=' + (url.searchParams.get('weight')||'70') + '&age=' + (url.searchParams.get('age')||'25') + '&gender=' + (url.searchParams.get('gender')||'male'),
    'password_generator': '/v2/password-generator?length=' + (url.searchParams.get('length') || '12'),
    'color_random': '/v2/color-random',
    'hash_tool': '/v2/hash-tool?input=' + encodeURIComponent(url.searchParams.get('input') || ''),
    'og_info': '/v2/og-info?url=' + encodeURIComponent(url.searchParams.get('url') || ''),
    'whois': '/v2/whois?domain=' + encodeURIComponent(url.searchParams.get('domain') || ''),
    'hackernews': '/v2/hn-best-stories',
    'maoyan_boxoffice': '/v2/maoyan-boxoffice',
    'maoyan_realtime': '/v2/maoyan-realtime-boxoffice',
    'douban_movies': '/v2/douban-movies-weekly',
    'netease_playlist': '/v2/netease-playlist',
    'baidu_tv_rank': '/v2/baidu-tv-rank',
    'baidu_tieba': '/v2/baidu-tieba-topic',
    'quark_hot': '/v2/quark-hot',
    'baidu_hotsearch': '/v2/baidu-hotsearch',
    'cateye_rating': '/v2/cateye-rating',
    'cateshow_netseries': '/v2/cateye-netseries',
    'catetv_show': '/v2/catetv-show',
  };
  return map[feature] || ('/v2/' + feature);
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

const HTML_INDEX = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>60s 信息聚合</title>
<style>
:root {
  --bg: #f5f6fa; --card: #ffffff; --border: #e8e9ef; --text: #1a1a2e;
  --text-dim: #8c8c9e; --accent: #4a7c59; --accent-light: rgba(74,124,89,0.08);
  --shadow: 0 2px 12px rgba(0,0,0,0.06); --radius: 14px;
}
[data-theme="dark"] {
  --bg: #131520; --card: #1c1f2e; --border: #2a2d3e; --text: #e0e0e8;
  --text-dim: #7a7a8e; --accent: #6c9b6e; --accent-light: rgba(108,155,110,0.1);
  --shadow: 0 2px 16px rgba(0,0,0,0.25);
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif;
  background: var(--bg); color: var(--text); min-height: 100vh; transition: background .3s,color .3s;
}
.header {
  background: var(--card); border-bottom: 1px solid var(--border);
  padding: 0 24px; height: 56px; display: flex; align-items: center;
  justify-content: space-between; position: sticky; top: 0; z-index: 100;
  box-shadow: 0 1px 4px rgba(0,0,0,.03);
}
.header-left { display: flex; align-items: center; gap: 8px; }
.logo-text { font-size: 20px; font-weight: 700; color: var(--accent); letter-spacing: -.5px; }
.logo-sub { font-size: 12px; color: var(--text-dim); margin-left: -4px; }
.nav-tabs { display: flex; gap: 4px; margin-left: 32px; }
.nav-tab {
  padding: 8px 18px; border-radius: 8px; font-size: 14px; color: var(--text-dim);
  cursor: pointer; transition: all .2s; user-select: none; border: none; background: none;
}
.nav-tab:hover { color: var(--text); background: var(--accent-light); }
.nav-tab.active { color: var(--accent); background: var(--accent-light); font-weight: 600; }
.header-right { display: flex; align-items: center; gap: 12px; }
.header-icon {
  width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center;
  justify-content: center; cursor: pointer; color: var(--text-dim); transition: all .2s;
  font-size: 18px; background: none; border: none;
}
.header-icon:hover { background: var(--accent-light); color: var(--accent); }
.search-section { max-width: 720px; margin: 24px auto 0; padding: 0 24px; }
.search-bar-wrapper { display: flex; gap: 8px; align-items: stretch; }
.search-input-wrap { flex: 1; position: relative; }
#searchInput {
  width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px;
  font-size: 15px; background: var(--card); color: var(--text); outline: none; transition: border-color .2s;
}
#searchInput:focus { border-color: var(--accent); }
.btn-search {
  padding: 12px 24px; border-radius: 10px; border: none; background: var(--accent);
  color: #fff; font-size: 15px; font-weight: 600; cursor: pointer; transition: opacity .2s; white-space: nowrap;
}
.btn-search:hover { opacity: .85; }
.search-tags { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
.search-tag {
  padding: 5px 14px; border-radius: 20px; font-size: 13px; cursor: pointer;
  background: var(--card); border: 1px solid var(--border); color: var(--text-dim); transition: all .2s;
}
.search-tag:hover { color: var(--accent); border-color: var(--accent); }
.main-content { max-width: 1200px; margin: 24px auto 0; padding: 0 24px; }
.cards-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(340px,1fr)); gap: 20px; }
.feature-card {
  background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
  overflow: hidden; transition: transform .2s,box-shadow .2s;
}
.feature-card:hover { transform: translateY(-2px); box-shadow: var(--shadow); }
.card-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px 12px; border-bottom: 1px solid var(--border);
}
.card-title { display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 600; }
.card-title .icon { font-size: 22px; }
.card-actions { display: flex; gap: 4px; }
.card-btn {
  width: 32px; height: 32px; border-radius: 8px; border: none; background: transparent;
  color: var(--text-dim); cursor: pointer; display: flex; align-items: center; justify-content: center;
  font-size: 16px; transition: all .2s;
}
.card-btn:hover { background: var(--accent-light); color: var(--accent); }
.card-body { padding: 16px 20px; min-height: 80px; max-height: 400px; overflow-y: auto; }
.empty-tip { color: var(--text-dim); font-size: 14px; text-align: center; padding: 20px 0; }
.loading-tip { text-align: center; padding: 20px 0; }
.spinner {
  display: inline-block; width: 24px; height: 24px; border: 3px solid var(--border);
  border-top-color: var(--accent); border-radius: 50%; animation: spin .8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.news-date { font-size: 14px; font-weight: 600; color: var(--accent); margin-bottom: 12px; }
.news-item { display: flex; align-items: baseline; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--border); }
.news-dot { color: var(--accent); font-size: 18px; line-height: 1; }
.news-text { flex: 1; font-size: 14px; line-height: 1.6; }
.news-num { font-size: 12px; color: var(--text-dim); white-space: nowrap; }
.hot-list-item {
  display: flex; align-items: center; gap: 10px; padding: 8px 0;
  border-bottom: 1px solid var(--border); cursor: pointer; transition: background .15s;
}
.hot-list-item:hover { background: var(--accent-light); }
.hot-rank {
  width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center;
  justify-content: center; font-size: 13px; font-weight: 700; color: #fff;
}
.hot-rank.top1 { background: #ff4444; }
.hot-rank.top2 { background: #ff8800; }
.hot-rank.top3 { background: #ffbb33; }
.hot-rank.normal { background: var(--border); color: var(--text-dim); }
.hot-title { flex: 1; font-size: 14px; line-height: 1.5; }
.hot-val { font-size: 12px; color: var(--text-dim); white-space: nowrap; }
.single-line { font-size: 15px; line-height: 1.8; word-break: break-word; }
.info-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(140px,1fr)); gap: 10px; }
.info-cell { padding: 10px; background: var(--accent-light); border-radius: 8px; }
.info-cell-label { font-size: 12px; color: var(--text-dim); margin-bottom: 4px; }
.info-cell-value { font-size: 14px; font-weight: 600; }
.weather-main { display: flex; align-items: center; justify-content: space-around; padding: 12px 0; }
.weather-temp-big { font-size: 48px; font-weight: 700; color: var(--accent); }
.weather-condition { font-size: 16px; color: var(--text-dim); text-align: center; }
.weather-detail-row { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 8px; }
.weather-detail-item { flex: 1; min-width: 120px; padding: 10px; background: var(--accent-light); border-radius: 8px; }
.weather-detail-label { font-size: 12px; color: var(--text-dim); margin-bottom: 4px; }
.weather-detail-value { font-size: 14px; font-weight: 600; }
.bing-cover { text-align: center; }
.bing-cover img { max-width: 100%; max-height: 360px; border-radius: 10px; object-fit: cover; }
.bing-caption { margin-top: 12px; font-size: 13px; color: var(--text-dim); }
.epic-game-item { display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); }
.epic-game-img { width: 80px; height: 100px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
.epic-game-info { flex: 1; }
.epic-game-name { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
.epic-game-desc { font-size: 12px; color: var(--text-dim); line-height: 1.4; }
.epic-game-btn {
  display: inline-block; padding: 4px 12px; border-radius: 6px; font-size: 12px;
  background: var(--accent); color: #fff; margin-top: 6px; cursor: pointer;
}
.it-news-item { padding: 10px 0; border-bottom: 1px solid var(--border); }
.it-news-title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
.it-news-source { font-size: 12px; color: var(--text-dim); }
.exchange-rate-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border); }
.exchange-rate-label { font-size: 14px; }
.exchange-rate-value { font-size: 14px; font-weight: 600; color: var(--accent); }
.history-item { padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 14px; line-height: 1.6; }
.tool-form { display: flex; flex-direction: column; gap: 10px; padding: 12px 0; }
.tool-form input, .tool-form select {
  padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px;
  font-size: 14px; background: var(--bg); color: var(--text); outline: none;
}
.tool-form button {
  padding: 10px; border: none; border-radius: 8px; background: var(--accent);
  color: #fff; font-size: 14px; font-weight: 600; cursor: pointer;
}
.settings-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 200;
  display: flex; align-items: center; justify-content: center; opacity: 0;
  visibility: hidden; transition: opacity .3s,visibility .3s;
}
.settings-overlay.open { opacity: 1; visibility: visible; }
.settings-panel {
  background: var(--card); border-radius: 16px; padding: 28px; width: 90%; max-width: 420px;
  box-shadow: 0 8px 32px rgba(0,0,0,.15); transform: translateY(20px); transition: transform .3s;
}
.settings-overlay.open .settings-panel { transform: translateY(0); }
.settings-title { font-size: 18px; font-weight: 700; margin-bottom: 20px; color: var(--accent); }
.settings-group { margin-bottom: 20px; }
.settings-group-label { font-size: 13px; color: var(--text-dim); margin-bottom: 8px; font-weight: 600; }
.theme-options { display: flex; gap: 8px; }
.theme-opt {
  padding: 8px 16px; border-radius: 8px; border: 2px solid var(--border); cursor: pointer;
  font-size: 13px; transition: all .2s; background: var(--bg); color: var(--text);
}
.theme-opt.active { border-color: var(--accent); background: var(--accent-light); }
.color-swatches { display: flex; gap: 8px; }
.swatch {
  width: 32px; height: 32px; border-radius: 50%; cursor: pointer; border: 3px solid transparent;
  transition: transform .2s,border-color .2s;
}
.swatch.active { border-color: var(--text); transform: scale(1.15); }
.api-url-input {
  width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px;
  font-size: 14px; background: var(--bg); color: var(--text); outline: none;
}
.btn-save {
  padding: 8px 20px; border: none; border-radius: 8px; background: var(--accent);
  color: #fff; font-size: 13px; font-weight: 600; cursor: pointer;
}
.toast {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(80px);
  background: var(--text); color: var(--bg); padding: 10px 24px; border-radius: 10px;
  font-size: 14px; opacity: 0; transition: all .3s; z-index: 300; pointer-events: none;
}
.toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
@media(max-width:768px){
  .cards-grid{grid-template-columns:1fr;}
  .header{padding:0 12px;height:48px;}
  .logo-text{font-size:16px;}
  .nav-tabs{display:none;}
  .main-content{padding:0 12px;margin-top:16px;}
  .search-section{padding:0 12px;margin-top:12px;}
}
</style>
</head>
<body>
<header class="header">
  <div class="header-left">
    <span class="logo-text">60s 信息聚合</span>
    <span class="logo-sub">| Dashboard</span>
  </div>
  <nav id="navTabs" class="nav-tabs">
    <button class="nav-tab active" data-nav="home">首页</button>
    <button class="nav-tab" data-nav="hot">热榜</button>
    <button class="nav-tab" data-nav="news">新闻</button>
    <button class="nav-tab" data-nav="weather">天气</button>
    <button class="nav-tab" data-nav="tools">工具</button>
  </nav>
  <div class="header-right">
    <button class="header-icon" id="btnTheme" title="切换主题">🌓</button>
    <button class="header-icon" id="btnSettings" title="设置">⚙️</button>
  </div>
</header>

<section class="search-section">
  <div class="search-bar-wrapper">
    <div class="search-input-wrap"><input type="text" id="searchInput" placeholder="搜索关键词..."></div>
    <button class="btn-search" id="btnSearch">🔍 搜索</button>
  </div>
  <div id="searchTags" class="search-tags"></div>
</section>

<main class="main-content">
  <div id="mainGrid" class="cards-grid"></div>
</main>

<div class="settings-overlay" id="settingsOverlay">
  <div class="settings-panel">
    <div class="settings-title">⚙️ 设置</div>
    <div class="settings-group">
      <div class="settings-group-label">深色模式</div>
      <div class="theme-options">
        <div class="theme-opt active" data-theme-mode="light">☀️ 浅色</div>
        <div class="theme-opt" data-theme-mode="dark">🌙 深色</div>
      </div>
    </div>
    <div class="settings-group">
      <div class="settings-group-label">主题色</div>
      <div class="color-swatches">
        <div class="swatch active" style="background:#4a7c59" data-accent="#4a7c59"></div>
        <div class="swatch" style="background:#3b82f6" data-accent="#3b82f6"></div>
        <div class="swatch" style="background:#ef4444" data-accent="#ef4444"></div>
        <div class="swatch" style="background:#8b5cf6" data-accent="#8b5cf6"></div>
        <div class="swatch" style="background:#f59e0b" data-accent="#f59e0b"></div>
      </div>
    </div>
    <div class="settings-group">
      <div class="settings-group-label">API 地址</div>
      <input type="text" class="api-url-input" id="apiUrlInput" placeholder="https://bh7jtb.dpdns.org">
      <button class="btn-save" id="btnSaveApi">保存配置</button>
    </div>
  </div>
</div>

<div class="toast" id="toast"></div>

<script src="/app.js"></script>
</body>`;

const APP_JS = `(function(){
'use strict';

var apiBaseUrl = '';
var currentNav = 'home';
var themeMode = localStorage.getItem('60s_theme') || 'light';
var accentColor = localStorage.getItem('60s_accent') || '#4a7c59';

var FEATURE_MAP = {
  '60s':{key:'60s',label:'每天60秒读懂世界',icon:'\\ud83d\\udcc0',cat:['home','news'],params:[{name:'date',label:'日期',type:'date',default:todayStr()}]},
  'ai_news':{key:'ai_news',label:'AI 资讯',icon:'\\ud83e\\udd16',cat:['home','news'],params:[]},
  'bing_wallpaper':{key:'bing_wallpaper',label:'必应壁纸',icon:'\\ud83c\\udfd7\\ufe0f',cat:['home'],params:[]},
  'exchange_rate':{key:'exchange_rate',label:'汇率查询',icon:'\\ud83d\\udcb0',cat:['home','tools'],params:[]},
  'history_today':{key:'history_today',label:'历史上的今天',icon:'\\u23f0',cat:['home','tools'],params:[]},
  'epic_games':{key:'epic_games',label:'Epic 免费游戏',icon:'\\ud83c\\udfae',cat:['home','tools'],params:[]},
  'it_news':{key:'it_news',label:'IT之家快讯',icon:'\\ud83d\\udcf0',cat:['home','news'],params:[]},
  'douyin_hot':{key:'douyin_hot',label:'抖音热搜',icon:'\\ud83d\\udd25',cat:['home','hot'],params:[]},
  'weibo_hot':{key:'weibo_hot',label:'微博热搜',icon:'\\ud83d\\udcf1',cat:['home','hot'],params:[]},
  'bili_hot':{key:'bili_hot',label:'B站热搜',icon:'\\ud83d\\udcbb',cat:['home','hot'],params:[]},
  'zhihu_hot':{key:'zhihu_hot',label:'知乎热榜',icon:'\\ud83e\\udde0',cat:['home','hot'],params:[]},
  'toutiao_hot':{key:'toutiao_hot',label:'今日头条',icon:'\\ud83d\\udce2',cat:['home','hot'],params:[]},
  'xiaohongshu_hot':{key:'xiaohongshu_hot',label:'小红书热搜',icon:'\\ud83d\\udcd6',cat:['home','hot'],params:[]},
  'duodiang_hot':{key:'duodiang_hot',label:'多段热榜',icon:'\\ud83d\\udcca',cat:['home','hot'],params:[]},
  'weather':{key:'weather',label:'实时天气',icon:'\\ud83c\\udf24\\ufe0f',cat:['home','weather','tools'],params:[{name:'city',label:'城市',type:'text',default:'深圳'}]},
  'forecast':{key:'forecast',label:'天气预报',icon:'\\ud83c\\udf25\\ufe0f',cat:['weather'],params:[{name:'city',label:'城市',type:'text',default:'深圳'}]},
  'gold_price':{key:'gold_price',label:'黄金价格',icon:'\\ud83e\\udeb5',cat:['tools'],params:[]},
  'oil_price':{key:'oil_price',label:'油价查询',icon:'\\ud83d\\udee2\\ufe0f',cat:['tools'],params:[]},
  'moyu_daily':{key:'moyu_daily',label:'摸鱼日历',icon:'\\ud83d\\ude34',cat:['home','tools'],params:[]},
  'lyrics':{key:'lyrics',label:'歌词查询',icon:'\\ud83c\\udfb5',cat:['tools'],params:[{name:'q',label:'歌名',type:'text',default:''}]},
  'translate':{key:'translate',label:'翻译',icon:'\\ud83d\\udcac',cat:['tools'],params:[{name:'q',label:'文本',type:'text',default:''},{name:'source',label:'源语言',type:'select',options:['auto','zh','en','ja','ko'],'default':'auto'},{name:'target',label:'目标语言',type:'select',options:['zh','en','ja','ko'],'default':'zh'}]},
  'ip_address':{key:'ip_address',label:'IP 查询',icon:'\\ud83c\\udf10',cat:['tools'],params:[]},
  'qr_code':{key:'qr_code',label:'二维码生成',icon:'\\ud83d\\udd0a',cat:['tools'],params:[{name:'url',label:'链接',type:'text',default:''}]},
  'baike':{key:'baike',label:'百度百科',icon:'\\ud83d\\udcda',cat:['tools'],params:[{name:'q',label:'词条',type:'text',default:''}]},
  'random_quote':{key:'random_quote',label:'一言',icon:'\\u2764\\ufe0f',cat:['tools'],params:[]},
  'random_joke':{key:'random_joke',label:'笑话',icon:'\\ud83d\\ude02',cat:['tools'],params:[]},
  'fortune':{key:'fortune',label:'运势',icon:'\\ud83d\\udd2e',cat:['tools'],params:[]},
  'answer_book':{key:'answer_book',label:'答案之书',icon:'\\ud83d\\udcda',cat:['tools'],params:[]},
  'kfc_copywriting':{key:'kfc_copywriting',label:'疯狂星期四',icon:'\\ud83c\\udf57',cat:['tools'],params:[]},
  'cold_joke':{key:'cold_joke',label:'冷笑话',icon:'\\u2744\\ufe0f',cat:['tools'],params:[]},
  'health_analysis':{key:'health_analysis',label:'身体分析',icon:'\\u2764\\ufe0f',cat:['tools'],params:[{name:'height',label:'身高cm',type:'number',default:'175'},{name:'weight',label:'体重kg',type:'number',default:'70'},{name:'age',label:'年龄',type:'number',default:'25'},{name:'gender',label:'性别',type:'select',options:['male','female'],default:'male'}]},
  'password_generator':{key:'password_generator',label:'密码生成器',icon:'\\ud83d\\udd10',cat:['tools'],params:[{name:'length',label:'长度',type:'number',default:'16'}]},
  'color_random':{key:'color_random',label:'随机颜色',icon:'\\ud83c\\udfa8',cat:['tools']}
};

var SEARCH_TAGS = ['60秒','微博','抖音','B站','天气','翻译','壁纸'];

var $ = function(id){ return document.getElementById(id); };
var $$ = function(sel){ return document.querySelectorAll(sel); };

function init() {
  loadConfig();
  applyTheme(themeMode);
  applyAccent(accentColor);
  renderSearchTags();
  renderPage();
  attachEventListeners();
}

function loadConfig() {
  var saved = localStorage.getItem('60s_api_base');
  if (saved) {
    apiBaseUrl = saved;
    $('apiUrlInput').value = saved;
  } else {
    apiBaseUrl = window.location.origin;
    $('apiUrlInput').value = apiBaseUrl;
  }
}

function renderSearchTags() {
  var container = $('searchTags');
  var html = '';
  for (var i = 0; i < SEARCH_TAGS.length; i++) {
    html += '<span class="search-tag" data-search="' + escAttr(SEARCH_TAGS[i]) + '">' + escHtml(SEARCH_TAGS[i]) + '</span>';
  }
  container.innerHTML = html;
}

function applyTheme(mode) {
  document.documentElement.setAttribute('data-theme', mode);
  themeMode = mode;
  $$('.theme-opt').forEach(function(el){ el.classList.toggle('active', el.getAttribute('data-theme-mode') === mode); });
}

function toggleTheme() {
  themeMode = themeMode === 'light' ? 'dark' : 'light';
  applyTheme(themeMode);
  localStorage.setItem('60s_theme', themeMode);
}

function setTheme(mode) {
  themeMode = mode;
  applyTheme(mode);
  localStorage.setItem('60s_theme', mode);
}

function applyAccent(color) {
  document.documentElement.style.setProperty('--accent', color);
  accentColor = color;
  $$('.swatch').forEach(function(s){ s.classList.remove('active'); });
  $$('.swatch').forEach(function(s){ if(s.getAttribute('data-accent')===color) s.classList.add('active'); });
  localStorage.setItem('60s_accent', color);
}

function setAccent(el) {
  var c = el.getAttribute('data-accent');
  applyAccent(c);
}

function switchNav(nav) {
  currentNav = nav;
  $$('.nav-tab').forEach(function(t){ t.classList.toggle('active', t.getAttribute('data-nav')===nav); });
  renderPage();
}

function getVisibleFeatures() {
  var keys = Object.keys(FEATURE_MAP);
  var visible = [];
  for (var i = 0; i < keys.length; i++) {
    if (FEATURE_MAP[keys[i]].cat.indexOf(currentNav) !== -1) {
      visible.push(keys[i]);
    }
  }
  return visible;
}

function renderPage() {
  var keys = getVisibleFeatures();
  var html = '';
  for (var i = 0; i < keys.length; i++) {
    var feat = FEATURE_MAP[keys[i]];
    html += renderCard(feat);
  }
  $('mainGrid').innerHTML = html;
  bindHotListLinks($('mainGrid'));
}

function renderCard(feat) {
  var html = '<div class="feature-card" data-feature="' + escAttr(feat.key) + '">';
  html += '<div class="card-header"><div class="card-title"><span class="icon">' + escHtml(feat.icon) + '</span><span>' + escHtml(feat.label) + '</span></div>';
  html += '<div class="card-actions">';
  html += '<button class="card-btn" data-action="refresh" data-feature="' + escAttr(feat.key) + '" data-target="card_' + escAttr(feat.key) + '" title="刷新">\\ud83d\\udd04</button>';
  if (feat.params && feat.params.length > 0) {
    html += '<button class="card-btn" data-action="query" data-feature="' + escAttr(feat.key) + '" title="查询">\\ud83d\\udd0d</button>';
  }
  html += '</div></div>';
  html += '<div class="card-body" id="card_' + escAttr(feat.key) + '"><div class="empty-tip">点击查询获取数据</div></div></div>';
  return html;
}

function attachEventListeners() {
  // Nav tabs
  $$('#navTabs .nav-tab').forEach(function(tab) {
    tab.addEventListener('click', function() { switchNav(this.getAttribute('data-nav')); });
  });

  // Search tags
  $('searchTags').addEventListener('click', function(e) {
    if (e.target.classList.contains('search-tag')) {
      $('searchInput').value = e.target.getAttribute('data-search');
      filterCards(e.target.getAttribute('data-search'));
    }
  });

  // Search input enter key
  $('searchInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') quickSearch();
  });

  // Search button
  $('btnSearch').addEventListener('click', quickSearch);

  // Settings overlay
  $('btnSettings').addEventListener('click', function() {
    $('settingsOverlay').classList.toggle('open');
  });

  $('settingsOverlay').addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('open');
  });

  // Theme toggle button
  $('btnTheme').addEventListener('click', function() {
    themeMode = themeMode === 'light' ? 'dark' : 'light';
    applyTheme(themeMode);
    localStorage.setItem('60s_theme', themeMode);
  });

  // Theme options in settings
  $$('.theme-opt').forEach(function(el) {
    el.addEventListener('click', function() { setTheme(this.getAttribute('data-theme-mode')); });
  });

  // Accent swatches
  $$('.swatch').forEach(function(el) {
    el.addEventListener('click', function() { setAccent(this); });
  });

  // Save API URL
  $('btnSaveApi').addEventListener('click', function() {
    var val = $('apiUrlInput').value.trim().replace(/\\/$/, '');
    if (!val) { showToast('请输入有效的 API 地址'); return; }
    apiBaseUrl = val;
    localStorage.setItem('60s_api_base', val);
    showToast('\\u2705 API \\u5730\\u5740\\u5df2\\u4fdd\\u5b58');
  });

  // Card body delegation
  $('mainGrid').addEventListener('click', function(e) {
    var btn = e.target.closest('[data-action]');
    if (btn) {
      var action = btn.getAttribute('data-action');
      var feature = btn.getAttribute('data-feature');
      var target = btn.getAttribute('data-target');
      if (action === 'refresh' && feature && target) {
        fetchFeatureData(feature, target);
      } else if (action === 'query' && feature) {
        fetchFeatureData(feature, 'card_' + feature);
      }
      return;
    }
    var hotItem = e.target.closest('.hot-list-item');
    if (hotItem) {
      var link = hotItem.getAttribute('data-link');
      if (link) window.open(link, '_blank');
    }
  });

  // Document-level hot list click
  document.addEventListener('click', function(e) {
    var item = e.target.closest('.hot-list-item');
    if (item) {
      var link = item.getAttribute('data-link');
      if (link) {
        e.preventDefault();
        window.open(link, '_blank');
      }
    }
  });

  // Tool form submit
  document.addEventListener('submit', function(e) {
    if (e.target.classList.contains('tool-form')) {
      executeToolQuery(e, e.target.getAttribute('data-feature'));
    }
  });
}

function openToolModal() {
  var city = prompt('输入城市名称:', '深圳');
  if (city) {
    fetchFeatureDataWithParam('weather', 'card_weather', {city: city});
  }
}

function fetchFeatureData(featureKey, containerId) {
  var container = $(containerId);
  if (!container) return;
  container.innerHTML = '<div class="loading-tip"><span class="spinner"></span> 加载中...</div>';
  try {
    fetch(apiBaseUrl + '/api/' + featureKey).then(function(resp) {
      return resp.json().then(function(data) {
        container.innerHTML = renderResult(data, featureKey);
        bindHotListLinks(container);
      });
    }).catch(function(err) {
      container.innerHTML = '<div class="empty-tip" style="color:#f44336;">\\u274c \\u8bf7\\u6c42\\u5931\\u8d25: ' + escHtml(err.message) + '</div>';
    });
  } catch(err) {
    container.innerHTML = '<div class="empty-tip" style="color:#f44336;">\\u274c ' + escHtml(err.message) + '</div>';
  }
}

function fetchFeatureDataWithParam(featureKey, containerId, extraParams) {
  var container = $(containerId);
  if (!container) return;
  container.innerHTML = '<div class="loading-tip">\\u52a0\\u8f7d\\u4e2d...</div>';
  try {
    var params = new URLSearchParams(extraParams);
    var url = apiBaseUrl + '/api/' + featureKey + (params.toString() ? '?' + params : '');
    fetch(url).then(function(resp) {
      return resp.json().then(function(data) {
        container.innerHTML = renderResult(data, featureKey);
        bindHotListLinks(container);
      });
    }).catch(function(err) {
      container.innerHTML = '<div class="empty-tip" style="color:#f44336;">\\u274c ' + escHtml(err.message) + '</div>';
    });
  } catch(err) {
    container.innerHTML = '<div class="empty-tip" style="color:#f44336;">\\u274c ' + escHtml(err.message) + '</div>';
  }
}

function executeToolQuery(e, featureKey) {
  e.preventDefault();
  var form = e.target;
  var fd = new FormData(form);
  var params = new URLSearchParams();
  for (var entry of fd.entries()) { if(entry[1]) params.append(entry[0],entry[1]); }
  var qs = params.toString();
  var url = apiBaseUrl + '/api/' + featureKey + (qs ? '?' + qs : '');
  var container = form.nextElementSibling;
  container.innerHTML = '<div class="loading-tip">\\u52a0\\u8f7d\\u4e2d...</div>';
  try {
    fetch(url).then(function(resp) {
      return resp.json().then(function(data) {
        container.innerHTML = renderResult(data, featureKey);
        bindHotListLinks(container);
      });
    }).catch(function(err) {
      container.innerHTML = '<div class="empty-tip" style="color:#f44336;">\\u274c ' + escHtml(err.message) + '</div>';
    });
  } catch(err) {
    container.innerHTML = '<div class="empty-tip" style="color:#f44336;">\\u274c ' + escHtml(err.message) + '</div>';
  }
}

function bindHotListLinks(container) {
  if (!container) return;
  var items = container.querySelectorAll('.hot-list-item');
  for (var i = 0; i < items.length; i++) {
    items[i].addEventListener('click', function() {
      var link = this.getAttribute('data-link');
      if (link) window.open(link, '_blank');
    });
  }
}

function renderResult(data, featureKey) {
  if (!data || !data.data) return '<div class="empty-tip">\\u6570\\u636e\\u4e3a\\u7a7a</div>';
  var d = data.data;

  if (featureKey === '60s' && Array.isArray(d.news)) {
    var dateInfo = [d.date,d.day_of_week,d.lunar_date].filter(Boolean).join(' ');
    var html = '<div class="news-date">' + escHtml(dateInfo) + '</div>';
    for (var i = 0; i < d.news.length; i++) {
      html += '<div class="news-item"><span class="news-dot">\\u00b7</span><span class="news-text">' + escHtml(d.news[i]) + '</span><span class="news-num">' + String(i+1).padStart(2,'0') + '</span></div>';
    }
    if (d.cover) html += '<div style="margin-top:12px;text-align:center;"><img src="' + escHtml(d.cover) + '" style="max-width:100%;max-height:200px;border-radius:8px;" onerror="this.style.display=\\'none\\'"></div>';
    return html;
  }

  if (featureKey === 'bing_wallpaper' && d.cover) {
    return '<div style="text-align:center;"><img src="' + escHtml(d.cover) + '" style="max-width:100%;max-height:360px;border-radius:10px;object-fit:cover;" onerror="this.parentElement.innerHTML=\\'\\u56fe\\u7247\\u52a0\\u8f7d\\u5931\\u8d25\\\'"><div style="margin-top:12px;font-size:13px;color:var(--text-dim);">' + escHtml(d.copyright||'') + '</div></div>';
  }

  if ((featureKey === 'weather' || featureKey === 'forecast') && d.location) {
    var w = d.weather || {};
    var aq = d.air_quality || {};
    var loc = d.location;
    var indices = d.life_indices || [];
    var html = '<div style="font-size:14px;font-weight:600;margin-bottom:12px;">\\ud83d\\udccd ' + escHtml(loc.province||'') + ' ' + escHtml(loc.city||'') + ' ' + escHtml(loc.name||'') + '</div>';
    html += '<div class="weather-main"><div><div class="weather-temp-big">' + (w.temperature != null ? w.temperature : '--') + '\\u00b0</div><div class="weather-condition">' + escHtml(w.condition||'') + '</div></div><div style="font-size:40px;">' + (w.weather_icon ? '<img src="'+escHtml(w.weather_icon)+'" style="width:48px;height:48px;" onerror="this.style.display=\\'none\\'">' : '\\ud83c\\udf24\\ufe0f') + '</div></div>';
    html += '<div class="weather-detail-row">';
    html += '<div class="weather-detail-item"><span class="weather-detail-label">\\u6e7f\\u5ea6</span><span class="weather-detail-value">' + (w.humidity != null ? w.humidity : '--') + '%</span></div>';
    html += '<div class="weather-detail-item"><span class="weather-detail-label">\\u98ce\\u5411\\u529b</span><span class="weather-detail-value">' + escHtml(w.wind_direction||'') + ' ' + escHtml(w.wind_power||'') + '</span></div>';
    html += '<div class="weather-detail-item"><span class="weather-detail-label">AQI</span><span class="weather-detail-value">' + escHtml(aq.quality||'--') + ' (' + (aq.aqi != null ? aq.aqi : '--') + ')</span></div>';
    html += '</div>';
    if (indices.length) {
      html += '<div style="font-size:12px;color:var(--text-dim);margin-bottom:8px;font-weight:600;">\\u751f\\u6d3b\\u6307\\u6570</div><div class="info-grid">';
      for (var ii = 0; ii < Math.min(indices.length, 6); ii++) {
        html += '<div class="info-cell"><div class="info-cell-label">' + escHtml(indices[ii].name||'') + '</div><div class="info-cell-value" style="font-size:12px;">' + escHtml(indices[ii].level||'') + '</div></div>';
      }
      html += '</div>';
    }
    return html;
  }

  if (['douyin_hot','weibo_hot','bili_hot','zhihu_hot','toutiao_hot','xiaohongshu_hot','duodiang_hot','baidu_hotsearch','quark_hot','baidu_tieba'].indexOf(featureKey) !== -1 && Array.isArray(d)) {
    var html2 = '';
    for (var hi = 0; hi < Math.min(d.length, 20); hi++) {
      var item = d[hi];
      var rankCls = hi < 3 ? 'top'+(hi+1) : 'normal';
      var title = item.title || item.query || '';
      var hotVal = item.hot_value || item.hot_score || '';
      var link = item.link || '';
      html2 += '<div class="hot-list-item"';
      if (link) html2 += ' data-link="' + escAttr(link) + '"';
      html2 += '>';
      html2 += '<span class="hot-rank ' + rankCls + '">' + (hi+1) + '</span>';
      html2 += '<span class="hot-title">' + escHtml(title) + '</span>';
      if (hotVal) html2 += '<span class="hot-val">' + formatNum(hotVal) + '</span>';
      html2 += '</div>';
    }
    return html2;
  }

  if (typeof d === 'string') return '<div class="single-line">' + escHtml(d) + '</div>';

  if (featureKey === 'qr_code' && (d.url || d.image)) {
    return '<div style="text-align:center;"><img src="' + escHtml(d.url || d.image) + '" style="max-width:240px;border-radius:12px;"></div>';
  }

  if (featureKey === 'translate' && (d.translation || d.result)) {
    return '<div class="single-line" style="font-size:18px;line-height:2;">' + escHtml(d.translation || d.result) + '</div>';
  }

  if (featureKey === 'lyrics' && (d.lyrics || d.lrc)) {
    var info = '';
    if (d.song_name || d.artist) info = '<div style="font-size:12px;color:var(--text-dim);margin-bottom:8px;">' + escHtml(d.song_name||'') + ' - ' + escHtml(d.artist||'') + '</div>';
    return info + '<div class="single-line" style="line-height:2.2;font-size:15px;">' + escHtml((d.lyrics||d.lrc).replace(/\\n/g,'<br>')) + '</div>';
  }

  if (featureKey === 'ip_address' && typeof d === 'object') {
    var htmlIp = '<div class="info-grid">';
    for (var k in d) {
      if (d.hasOwnProperty(k)) {
        htmlIp += '<div class="info-cell"><div class="info-cell-label">' + escHtml(k) + '</div><div class="info-cell-value">' + escHtml(String(d[k])) + '</div></div>';
      }
    }
    htmlIp += '</div>';
    return htmlIp;
  }

  if (featureKey === 'exchange_rate' && d.rates) {
    var htmlRate = '';
    for (var r in d.rates) {
      if (d.rates.hasOwnProperty(r)) {
        htmlRate += '<div class="exchange-rate-item"><span class="exchange-rate-label">' + escHtml(r) + '</span><span class="exchange-rate-value">' + escHtml(String(d.rates[r])) + '</span></div>';
      }
    }
    return htmlRate;
  }

  if (featureKey === 'history_today' && Array.isArray(d)) {
    var htmlHist = '';
    for (var h = 0; h < Math.min(d.length, 10); h++) {
      htmlHist += '<div class="history-item">' + escHtml(d[h]) + '</div>';
    }
    return htmlHist;
  }

  if (featureKey === 'epic_games' && Array.isArray(d)) {
    var htmlEpic = '';
    for (var ep = 0; ep < Math.min(d.length, 5); ep++) {
      var gd = d[ep];
      htmlEpic += '<div class="epic-game-item">';
      if (gd.thumbnail) htmlEpic += '<img class="epic-game-img" src="' + escHtml(gd.thumbnail) + '" onerror="this.style.display=\\'none\\'">';
      htmlEpic += '<div class="epic-game-info"><div class="epic-game-name">' + escHtml(gd.title||'') + '</div>';
      if (gd.description) htmlEpic += '<div class="epic-game-desc">' + escHtml(gd.description.substring(0,100)) + '</div>';
      htmlEpic += '</div></div>';
    }
    return htmlEpic;
  }

  if (featureKey === 'it_news' && Array.isArray(d)) {
    var htmlIt = '';
    for (var n = 0; n < Math.min(d.length, 10); n++) {
      var nd = d[n];
      htmlIt += '<div class="it-news-item"><div class="it-news-title">' + escHtml(nd.title||nd.content||'') + '</div>';
      if (nd.source) htmlIt += '<div class="it-news-source">' + escHtml(nd.source) + '</div>';
      htmlIt += '</div>';
    }
    return htmlIt;
  }

  if (featureKey === 'gold_price' && d.prices) {
    var htmlGold = '';
    for (var g in d.prices) {
      if (d.prices.hasOwnProperty(g)) {
        htmlGold += '<div class="exchange-rate-item"><span class="exchange-rate-label">' + escHtml(g) + '</span><span class="exchange-rate-value">' + escHtml(String(d.prices[g])) + '</span></div>';
      }
    }
    return htmlGold;
  }

  if (featureKey === 'oil_price' && d.prices) {
    var htmlOil = '';
    for (var o in d.prices) {
      if (d.prices.hasOwnProperty(o)) {
        htmlOil += '<div class="exchange-rate-item"><span class="exchange-rate-label">' + escHtml(o) + '</span><span class="exchange-rate-value">' + escHtml(String(d.prices[o])) + '</span></div>';
      }
    }
    return htmlOil;
  }

  if (featureKey === 'moyu_daily' && d.progress != null) {
    var pct = Math.round(d.progress * 100);
    return '<div style="text-align:center;padding:20px 0;"><div style="font-size:48px;margin-bottom:12px;">\\ud83d\\ude34</div>';
  }

  if (featureKey === 'random_quote' && d.hitokoto) {
    return '<div class="single-line" style="font-size:16px;line-height:2;text-align:center;padding:20px 0;">' + escHtml(d.hitokoto) + '</div>';
  }

  if (featureKey === 'random_joke' && d.content) {
    return '<div class="single-line" style="font-size:15px;line-height:1.8;text-align:center;padding:20px 0;">' + escHtml(d.content) + '</div>';
  }

  if (featureKey === 'fortune' && d.fortune) {
    return '<div style="text-align:center;padding:20px 0;"><div style="font-size:48px;margin-bottom:12px;">\\ud83d\\udd2e</div>';
  }

  if (featureKey === 'answer_book' && d.answer) {
    return '<div class="single-line" style="font-size:18px;line-height:2;text-align:center;padding:20px 0;">' + escHtml(d.answer) + '</div>';
  }

  if (featureKey === 'kfc_copywriting' && d.text) {
    return '<div class="single-line" style="font-size:15px;line-height:1.8;text-align:center;padding:20px 0;">' + escHtml(d.text) + '</div>';
  }

  if (featureKey === 'cold_joke' && d.joke) {
    return '<div class="single-line" style="font-size:15px;line-height:1.8;text-align:center;padding:20px 0;">' + escHtml(d.joke) + '</div>';
  }

  if (featureKey === 'health_analysis' && d.analysis) {
    return '<div class="single-line" style="font-size:15px;line-height:1.8;">' + escHtml(typeof d.analysis === 'string' ? d.analysis : JSON.stringify(d.analysis)) + '</div>';
  }

  if (featureKey === 'password_generator' && d.password) {
    return '<div style="text-align:center;padding:20px 0;"><div style="font-size:24px;font-family:monospace;background:var(--accent-light);padding:16px;border-radius:10px;word-break:break-all;">' + escHtml(d.password) + '</div>';
  }

  if (featureKey === 'color_random' && d.hex) {
    return '<div style="text-align:center;padding:20px 0;"><div style="width:120px;height:120px;border-radius:16px;background:' + escHtml(d.hex) + ';margin:0 auto 12px;border:2px solid var(--border);"></div>';
  }

  if (featureKey === 'baike' && d.content) {
    return '<div class="single-line" style="font-size:15px;line-height:1.8;">' + escHtml(typeof d.content === 'string' ? d.content : JSON.stringify(d.content)) + '</div>';
  }

  if (featureKey === 'whois' && d.domain) {
    var htmlWhois = '<div style="font-size:14px;line-height:1.8;">';
    for (var wk in d) {
      if (d.hasOwnProperty(wk) && wk !== 'domain') {
        htmlWhois += '<div style="padding:6px 0;border-bottom:1px solid var(--border);"><strong>' + escHtml(wk) + ':</strong> ' + escHtml(String(d[wk])) + '</div>';
      }
    }
    htmlWhois += '</div>';
    return htmlWhois;
  }

  if (featureKey === 'hackernews' && Array.isArray(d)) {
    var htmlHn = '';
    for (var hn = 0; hn < Math.min(d.length, 10); hn++) {
      var hd = d[hn];
      htmlHn += '<div class="it-news-item"><div class="it-news-title"><a href="' + escAttr(hd.url||'#') + '" target="_blank" rel="noopener">' + escHtml(hd.title||'') + '</a></div>';
      htmlHn += '<div class="it-news-source">' + escHtml(hd.points!=null?hd.points+'\\u70b9\\u8d5e':'') + ' | ' + escHtml(hd.comments!=null?hd.comments+'\\u8bc4\\u8bba':'') + '</div></div>';
    }
    return htmlHn;
  }

  if (featureKey === 'maoyan_boxoffice' && d.movies) {
    var htmlBox = '';
    for (var mb = 0; mb < Math.min(d.movies.length, 10); mb++) {
      var md = d.movies[mb];
      htmlBox += '<div class="exchange-rate-item"><span class="exchange-rate-label">' + escHtml(md.name||'') + '</span><span class="exchange-rate-value">' + escHtml(md.box||'') + '</span></div>';
    }
    return htmlBox;
  }

  if (featureKey === 'maoyan_realtime' && d.list) {
    var htmlReal = '';
    for (var mr = 0; mr < Math.min(d.list.length, 10); mr++) {
      var mrd = d.list[mr];
      htmlReal += '<div class="exchange-rate-item"><span class="exchange-rate-label">' + escHtml(mrd.name||mrd.movieName||'') + '</span><span class="exchange-rate-value">' + escHtml(mrd.box||'') + '</span></div>';
    }
    return htmlReal;
  }

  if (featureKey === 'douban_movies' && d.subjects) {
    var htmlDouban = '';
    for (var dm = 0; dm < Math.min(d.subjects.length, 10); dm++) {
      var sd = d.subjects[dm];
      htmlDouban += '<div class="it-news-item"><div class="it-news-title">' + escHtml(sd.title||'') + '</div>';
      if (sd.rating) htmlDouban += '<div class="it-news-source">\\u661f\\u8bc4: ' + escHtml(sd.rating.average||'') + '</div>';
      htmlDouban += '</div>';
    }
    return htmlDouban;
  }

  if (featureKey === 'netease_playlist' && d.playlists) {
    var htmlMusic = '';
    for (var nm = 0; nm < Math.min(d.playlists.length, 10); nm++) {
      var mpd = d.playlists[nm];
      htmlMusic += '<div class="it-news-item"><div class="it-news-title">' + escHtml(mpd.name||'') + '</div>';
      htmlMusic += '<div class="it-news-source">\\u64ad\\u653e\\u91cf: ' + formatNum(mpd.playCount||0) + '</div></div>';
    }
    return htmlMusic;
  }

  if (featureKey === 'baidu_tv_rank' && d.ranklist) {
    var htmlTv = '';
    for (var tv = 0; tv < Math.min(d.ranklist.length, 10); tv++) {
      var tvd = d.ranklist[tv];
      htmlTv += '<div class="exchange-rate-item"><span class="exchange-rate-label">' + escHtml(tvd.conceptName||tvd.name||'') + '</span><span class="exchange-rate-value">' + escHtml(tvd.score||'') + '</span></div>';
    }
    return htmlTv;
  }

  if (featureKey === 'baidu_tieba' && d.data && d.data.topic_list) {
    var htmlTieba = '';
    for (var tb = 0; tb < Math.min(d.data.topic_list.length, 10); tb++) {
      var tbd = d.data.topic_list[tb];
      htmlTieba += '<div class="it-news-item"><div class="it-news-title">' + escHtml(tbd.topic_name||'') + '</div>';
      htmlTieba += '<div class="it-news-source">\\u8d34\\u6570: ' + formatNum(tbd.thread_num||0) + '</div></div>';
    }
    return htmlTieba;
  }

  // Fallback for unhandled types
  if (typeof d === 'object') {
    var htmlFallback = '<div class="info-grid">';
    var count = 0;
    for (var fk in d) {
      if (d.hasOwnProperty(fk) && count < 12) {
        htmlFallback += '<div class="info-cell"><div class="info-cell-label">' + escHtml(fk) + '</div><div class="info-cell-value">' + escHtml(String(d[fk]).substring(0,50)) + '</div></div>';
        count++;
      }
    }
    htmlFallback += '</div>';
    return htmlFallback;
  }

  return '<div class="single-line">' + escHtml(String(d)) + '</div>';
}

function formatNum(n) {
  n = Number(n);
  if (isNaN(n)) return String(n);
  if (n >= 10000) return (n/10000).toFixed(1) + '\\u4e07';
  if (n >= 1000) return (n/1000).toFixed(1) + '\\u5343';
  return String(n);
}

function todayStr() {
  var d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

function syntaxHighlight(json) {
  if (typeof json !== 'string') json = JSON.stringify(json, null, 2);
  json = json.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  return json.replace(/("(\\\\u[\\\\da-fA-F]{4}|\\\\[^u]|[^\\\\"])*")(:\\s*)/g, function(match) {
    var cls = 'color:#07a';
    if (:match.charAt(2)==='"') cls='color:#b09';
    return '<span style="' + cls + '">' + match + '</span>';
  });
}

function showToast(msg) {
  var toast = $('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(function(){ toast.classList.remove('show'); }, 2000);
}

function setSearch(text) {
  $('searchInput').value = text;
  filterCards(text);
}

function quickSearch() {
  var q = $('searchInput').value.trim().toLowerCase();
  if (!q) { renderPage(); return; }
  var grid = $('mainGrid');
  var cards = grid.querySelectorAll('.feature-card');
  var found = 0;
  for (var i = 0; i < cards.length; i++) {
    var label = cards[i].getAttribute('data-feature');
    var feat = FEATURE_MAP[label];
    if (feat && (feat.label.toLowerCase().indexOf(q) !== -1 || feat.key.toLowerCase().indexOf(q) !== -1)) {
      cards[i].style.display = '';
      found++;
    } else {
      cards[i].style.display = 'none';
    }
  }
  if (found === 0) {
    grid.innerHTML = '<div class="empty-tip" style="grid-column:1/-1;">\\u672a\\u627e\\u5230\\u5339\\u914d\\u7684\\u63a5\\u53e3</div>';
  }
}

function filterCards(q) {
  if (!q) { renderPage(); return; }
  var grid = $('mainGrid');
  var keys = Object.keys(FEATURE_MAP);
  var matched = [];
  for (var fi = 0; fi < keys.length; fi++) {
    var feat = FEATURE_MAP[keys[fi]];
    if (feat.cat.indexOf(currentNav) === -1) continue;
    if (feat.label.toLowerCase().indexOf(q.toLowerCase()) !== -1 || feat.key.toLowerCase().indexOf(q.toLowerCase()) !== -1) {
      matched.push(keys[fi]);
    }
  }
  var html = '';
  for (var mi = 0; mi < matched.length; mi++) {
    html += renderCard(FEATURE_MAP[matched[mi]]);
  }
  if (html) {
   
