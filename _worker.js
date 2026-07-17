/**
 * 60s API - Cloudflare Workers Handler
 * 信息聚合 Dashboard 风格前端
 * 部署方式：wrangler.toml + worker.js
 */

const API_BASE = 'https://bh7jtb.dpdns.org';
const BACKUP_API_BASE = 'https://60s.7se.cn';
const BACKUP_FEATURES = ['bing_wallpaper', 'bilibili', 'weibo'];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    const pathname = url.pathname;

    // 主页面
    if (pathname === '/' || pathname === '/index.html') {
      return new Response(HTML_PAGE, {
        headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders() },
      });
    }

    // API 代理转发 — /api/{feature}
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
  },
};

function resolveTargetPath(feature, url) {
  const map = {
    '60s': '/v2/60s',
    'ai_news': '/v2/ai-news',
    'bing_wallpaper': '/v2/bing',
    'exchange_rate': '/v2/exchange-rate',
    'history_today': '/v2/history-today',
    'epic_games': '/v2/epic-free-games',
    'it_news': '/v2/ithome',
    'douyin_hot': '/v2/douyin',
    'weibo_hot': '/v2/weibo',
    'bili_hot': '/v2/bili',
    'zhihu_hot': '/v2/zhihu-hot',
    'toutiao_hot': '/v2/toutiao-hot',
    'xiaohongshu_hot': '/v2/xhs-hot',
    'duodiang_hot': '/v2/dc-hot',
    'weather': '/v2/weather?query=' + (url.searchParams.get('city') || '深圳'),
    'forecast': '/v2/weather/forecast?query=' + (url.searchParams.get('city') || '深圳'),
    'gold_price': '/v2/gold-price',
    'oil_price': '/v2/oil-price',
    'moyu_daily': '/v2/moyu-rizhi',
    'lyrics': '/v2/lyrics?query=' + encodeURIComponent(url.searchParams.get('q') || ''),
    'translate': '/v2/fanyi?query=' + encodeURIComponent(url.searchParams.get('q') || '') + '&source=' + (url.searchParams.get('source') || 'auto') + '&target=' + (url.searchParams.get('target') || 'zh'),
    'ip_address': '/v2/ip-address',
    'qr_code': '/v2/qr-code?url=' + encodeURIComponent(url.searchParams.get('url') || ''),
    'baike': '/v2/baike?query=' + encodeURIComponent(url.searchParams.get('q') || ''),
    'random_quote': '/v2/random-hitokoto',
    'random_joke': '/v2/random-joke',
    'fortune': '/v2/random-fortune',
    'answer_book': '/v2/random-answer-book',
    'kfc_copywriting': '/v2/kfc-copywriting',
    'cold_joke': '/v2/random-cold-joke',
    'health_analysis': '/v2/health-analysis?height=' + (url.searchParams.get('height') || '175') + '&weight=' + (url.searchParams.get('weight') || '70') + '&age=' + (url.searchParams.get('age') || '25') + '&gender=' + (url.searchParams.get('gender') || 'male'),
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

const HTML_PAGE = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>60s 信息聚合</title>
<style>
:root {
  --bg: #f5f6fa;
  --card: #ffffff;
  --border: #e8e9ef;
  --text: #1a1a2e;
  --text-dim: #8c8c9e;
  --accent: #4a7c59;
  --accent-light: rgba(74,124,89,0.08);
  --shadow: 0 2px 12px rgba(0,0,0,0.06);
  --radius: 14px;
}
[data-theme="dark"] {
  --bg: #131520;
  --card: #1c1f2e;
  --border: #2a2d3e;
  --text: #e0e0e8;
  --text-dim: #7a7a8e;
  --accent: #6c9b6e;
  --accent-light: rgba(108,155,110,0.1);
  --shadow: 0 2px 16px rgba(0,0,0,0.25);
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  transition: background 0.3s, color 0.3s;
}

/* ========== HEADER ========== */
.header {
  background: var(--card);
  border-bottom: 1px solid var(--border);
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
}
.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: -0.5px;
}
.logo-sub {
  font-size: 12px;
  color: var(--text-dim);
  margin-left: -4px;
}
.nav-tabs {
  display: flex;
  gap: 4px;
  margin-left: 32px;
}
.nav-tab {
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-dim);
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
  border: none;
  background: none;
}
.nav-tab:hover { color: var(--text); background: var(--accent-light); }
.nav-tab.active { color: var(--accent); background: var(--accent-light); font-weight: 600; }
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.header-icon {
  width: 36px; height: 36px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: var(--text-dim);
  transition: all 0.2s;
  font-size: 18px;
  background: none;
  border: none;
}
.header-icon:hover { background: var(--accent-light); color: var(--accent); }

/* ========== SEARCH BAR ========== */
.search-section {
  max-width: 720px;
  margin: 20px auto 0;
  padding: 0 24px;
}
.search-box {
  display: flex;
  align-items: center;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0 16px;
  box-shadow: var(--shadow);
  transition: border-color 0.2s;
}
.search-box:focus-within { border-color: var(--accent); }
.search-icon { font-size: 18px; color: var(--text-dim); margin-right: 10px; }
.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text);
  font-size: 14px;
  padding: 12px 0;
}
.search-input::placeholder { color: var(--text-dim); }
.search-tags {
  display: flex;
  gap: 6px;
  margin-top: 10px;
  flex-wrap: wrap;
}
.search-tag {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  color: var(--text-dim);
  background: var(--card);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.2s;
}
.search-tag:hover { color: var(--accent); border-color: var(--accent); }

/* ========== MAIN GRID ========== */
.main-grid {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 16px;
}
@media (max-width: 800px) {
  .main-grid { grid-template-columns: 1fr; }
  .nav-tabs { display: none; }
}

/* ========== CARDS ========== */
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}
.card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 12px;
}
.card-title {
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}
.card-title-icon { font-size: 18px; }
.card-more {
  font-size: 12px;
  color: var(--text-dim);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s;
  background: none;
  border: none;
}
.card-more:hover { color: var(--accent); background: var(--accent-light); }
.card-body { padding: 0 20px 16px; }

/* --- 60s News --- */
.news-date {
  font-size: 13px;
  color: var(--text-dim);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border);
}
.news-item {
  display: flex;
  align-items: baseline;
  padding: 7px 0;
  font-size: 14px;
  line-height: 1.6;
  gap: 8px;
  cursor: pointer;
  transition: color 0.15s;
}
.news-item:hover { color: var(--accent); }
.news-dot { color: var(--accent); flex-shrink: 0; }
.news-text { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.news-num {
  font-size: 11px;
  color: var(--text-dim);
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

/* --- Weather --- */
.weather-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.weather-temp-big {
  font-size: 48px;
  font-weight: 300;
  line-height: 1;
  color: var(--text);
}
.weather-condition {
  font-size: 14px;
  color: var(--text-dim);
  margin-top: 4px;
}
.weather-city-select {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: transparent;
  color: var(--text);
  font-size: 13px;
  cursor: pointer;
  transition: border-color 0.2s;
}
.weather-city-select:focus { border-color: var(--accent); outline: none; }
.weather-detail-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border);
}
.weather-detail-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.weather-detail-label { font-size: 11px; color: var(--text-dim); }
.weather-detail-value { font-size: 14px; font-weight: 500; }
.forecast-row {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}
.forecast-card {
  flex-shrink: 0;
  text-align: center;
  padding: 10px 14px;
  background: var(--accent-light);
  border-radius: 10px;
  min-width: 64px;
}
.forecast-day { font-size: 11px; color: var(--text-dim); margin-bottom: 4px; }
.forecast-icon { font-size: 22px; margin: 4px 0; }
.forecast-temps { font-size: 13px; font-weight: 600; }
.forecast-low { color: var(--text-dim); font-weight: 400; }

/* --- Hot List --- */
.hot-list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0,0,0,0.03);
  cursor: pointer;
  transition: opacity 0.15s;
}
.hot-list-item:last-child { border-bottom: none; }
.hot-list-item:hover { opacity: 0.7; }
.hot-rank {
  width: 22px; height: 22px;
  border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700;
  flex-shrink: 0;
}
.hot-rank.top1 { background: #ff4444; color: white; }
.hot-rank.top2 { background: #ff6633; color: white; }
.hot-rank.top3 { background: #ffaa00; color: white; }
.hot-rank.normal { background: var(--accent-light); color: var(--text-dim); }
.hot-title { flex: 1; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hot-val { font-size: 11px; color: var(--text-dim); flex-shrink: 0; }

/* --- Info Grid --- */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.info-cell {
  background: var(--accent-light);
  border-radius: 10px;
  padding: 12px;
  text-align: center;
}
.info-cell-label { font-size: 11px; color: var(--text-dim); margin-bottom: 4px; }
.info-cell-value { font-size: 16px; font-weight: 600; }

/* --- Single Line Display --- */
.single-line {
  padding: 16px 0;
  font-size: 14px;
  line-height: 1.8;
  word-break: break-word;
}

/* --- Empty / Loading --- */
.loading-tip {
  text-align: center;
  padding: 30px;
  color: var(--text-dim);
  font-size: 13px;
}
.empty-tip {
  text-align: center;
  padding: 30px;
  color: var(--text-dim);
  font-size: 13px;
}

/* --- Footer --- */
.footer {
  text-align: center;
  padding: 30px 24px;
  color: var(--text-dim);
  font-size: 12px;
}
.footer a { color: var(--accent); text-decoration: none; }

/* --- Toast --- */
.toast {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  background: var(--card);
  border: 1px solid var(--border);
  padding: 10px 24px;
  border-radius: 10px;
  font-size: 14px;
  z-index: 9999;
  transition: transform 0.3s ease;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  color: var(--text);
}
.toast.show { transform: translateX(-50%) translateY(0); }

/* --- Settings Panel --- */
.settings-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 200;
  display: none;
  justify-content: flex-end;
}
.settings-overlay.open { display: flex; }
.settings-panel {
  width: 320px;
  max-width: 90vw;
  background: var(--card);
  border-left: 1px solid var(--border);
  padding: 24px 20px;
  overflow-y: auto;
  box-shadow: -4px 0 24px rgba(0,0,0,0.1);
}
.settings-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.settings-group { margin-bottom: 24px; }
.settings-group-label {
  font-size: 12px;
  color: var(--text-dim);
  margin-bottom: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.theme-options { display: flex; gap: 10px; }
.theme-opt {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  border: 2px solid var(--border);
  cursor: pointer;
  text-align: center;
  font-size: 13px;
  transition: all 0.2s;
  background: var(--bg);
  color: var(--text);
}
.theme-opt:hover { border-color: var(--accent); }
.theme-opt.active { border-color: var(--accent); background: var(--accent-light); }
.color-swatches { display: flex; gap: 8px; flex-wrap: wrap; }
.swatch {
  width: 36px; height: 36px;
  border-radius: 50%;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.2s;
}
.swatch:hover { transform: scale(1.1); }
.swatch.active { border-color: var(--text); box-shadow: 0 0 0 2px var(--card), 0 0 0 4px var(--text); }
.bg-options { display: flex; gap: 8px; flex-wrap: wrap; }
.bg-opt {
  width: 56px; height: 40px;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid var(--border);
  transition: all 0.2s;
}
.bg-opt:hover { border-color: var(--accent); }
.bg-opt.active { border-color: var(--accent); }
.api-url-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text);
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}
.api-url-input:focus { border-color: var(--accent); }
.btn-save {
  margin-top: 10px;
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: none;
  background: var(--accent);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-save:hover { opacity: 0.85; }

/* Scrollbar */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
</style>
</head>
<body>

<!-- Header -->
<div class="header">
  <div class="header-left">
    <span class="logo-text">60s</span>
    <span class="logo-sub">信息聚合</span>
  </div>
  <div class="nav-tabs" id="navTabs">
    <button class="nav-tab active" data-nav="home" onclick="switchNav('home')">首页</button>
    <button class="nav-tab" data-nav="hot" onclick="switchNav('hot')">热榜</button>
    <button class="nav-tab" data-nav="news" onclick="switchNav('news')">新闻</button>
    <button class="nav-tab" data-nav="weather" onclick="switchNav('weather')">天气</button>
    <button class="nav-tab" data-nav="tools" onclick="switchNav('tools')">工具</button>
  </div>
  <div class="header-right">
    <button class="header-icon" onclick="toggleSettings()" title="设置">⚙️</button>
    <button class="header-icon" id="themeToggle" onclick="toggleTheme()" title="切换明暗">🌙</button>
  </div>
</div>

<!-- Search Section -->
<div class="search-section" id="searchSection">
  <div class="search-box">
    <span class="search-icon">🔍</span>
    <input type="text" class="search-input" id="searchInput" placeholder="搜索接口、路径或关键词..." oninput="filterCards(this.value)" onkeydown="if(event.key==='Enter')quickSearch()">
  </div>
  <div class="search-tags">
    <span class="search-tag" onclick="setSearch('60秒')">首页</span>
    <span class="search-tag" onclick="setSearch('微博')">微博热搜</span>
    <span class="search-tag" onclick="setSearch('抖音')">抖音热搜</span>
    <span class="search-tag" onclick="setSearch('B站')">B站热搜</span>
    <span class="search-tag" onclick="setSearch('天气')">天气</span>
    <span class="search-tag" onclick="setSearch('翻译')">翻译</span>
    <span class="search-tag" onclick="setSearch('壁纸')">壁纸</span>
  </div>
</div>

<!-- Main Content Grid -->
<div class="main-grid" id="mainGrid"></div>

<!-- Footer -->
<div class="footer">
  Powered by <a href="https://github.com/vikiboss/60s" target="_blank">60s API</a> · Cloudflare Workers Deployment
</div>

<!-- Settings Overlay -->
<div class="settings-overlay" id="settingsOverlay" onclick="if(event.target===this)closeSettings()">
  <div class="settings-panel">
    <div class="settings-title">⚙️ 设置</div>
    
    <div class="settings-group">
      <div class="settings-group-label">明暗</div>
      <div class="theme-options">
        <div class="theme-opt active" data-theme-mode="light" onclick="setTheme('light')">☀️ 浅色</div>
        <div class="theme-opt" data-theme-mode="dark" onclick="setTheme('dark')">🌙 暗色</div>
      </div>
    </div>
    
    <div class="settings-group">
      <div class="settings-group-label">主题色</div>
      <div class="color-swatches">
        <div class="swatch active" style="background:#4a7c59" data-accent="#4a7c59" onclick="setAccent(this)"></div>
        <div class="swatch" style="background:#3b82f6" data-accent="#3b82f6" onclick="setAccent(this)"></div>
        <div class="swatch" style="background:#ef4444" data-accent="#ef4444" onclick="setAccent(this)"></div>
        <div class="swatch" style="background:#8b5cf6" data-accent="#8b5cf6" onclick="setAccent(this)"></div>
        <div class="swatch" style="background:#f59e0b" data-accent="#f59e0b" onclick="setAccent(this)"></div>
      </div>
    </div>
    
    <div class="settings-group">
      <div class="settings-group-label">API 地址</div>
      <input type="text" class="api-url-input" id="apiUrlInput" placeholder="https://bh7jtb.dpdns.org">
      <button class="btn-save" onclick="saveApiUrl()">保存配置</button>
    </div>
  </div>
</div>

<div class="toast" id="toast"></div>

<script>
// ==================== State ====================
let apiBaseUrl = '';
let currentNav = 'home';
let themeMode = localStorage.getItem('60s_theme') || 'light';
let accentColor = localStorage.getItem('60s_accent') || '#4a7c59';

const FEATURE_MAP = {
  '60s': { key: '60s', label: '每天60秒读懂世界', icon: '📰', cat: ['home','news'], params: [{name:'date',label:'日期',type:'date',default:todayStr()}] },
  'ai_news': { key: 'ai_news', label: 'AI资讯快报', icon: '🤖', cat: ['home','news'] },
  'bing_wallpaper': { key: 'bing_wallpaper', label: '必应每日壁纸', icon: '🖼️', cat: ['home'] },
  'exchange_rate': { key: 'exchange_rate', label: '当日货币汇率', icon: '💱', cat: ['home'] },
  'history_today': { key: 'history_today', label: '历史上的今天', icon: '📅', cat: ['home'] },
  'epic_games': { key: 'epic_games', label: 'Epic免费游戏', icon: '🎮', cat: ['home'] },
  'it_news': { key: 'it_news', label: '实时IT资讯', icon: '💻', cat: ['home','news'] },
  'douyin_hot': { key: 'douyin_hot', label: '抖音热搜', icon: '🎵', cat: ['hot'] },
  'weibo_hot': { key: 'weibo_hot', label: '微博热搜', icon: '🔴', cat: ['hot'] },
  'bili_hot': { key: 'bili_hot', label: '哔哩哔哩热搜', icon: '📺', cat: ['hot'] },
  'zhihu_hot': { key: 'zhihu_hot', label: '知乎话题榜', icon: '🟠', cat: ['hot'] },
  'toutiao_hot': { key: 'toutiao_hot', label: '头条热搜榜', icon: '📰', cat: ['hot'] },
  'xiaohongshu_hot': { key: 'xiaohongshu_hot', label: '小红书热点', icon: '📕', cat: ['hot'] },
  'duodiang_hot': { key: 'duodiang_hot', label: '懂车帝热搜', icon: '🚗', cat: ['hot'] },
  'baidu_hotsearch': { key: 'baidu_hotsearch', label: '百度实时热搜', icon: '🐲', cat: ['hot'] },
  'quark_hot': { key: 'quark_hot', label: '夸克热点', icon: '🔵', cat: ['hot'] },
  'hackernews': { key: 'hackernews', label: 'Hacker News', icon: '🟧', cat: ['hot'] },
  'weather': { key: 'weather', label: '实时天气', icon: '🌤️', cat: ['weather'], params: [{name:'city',label:'城市',type:'text',default:'深圳'}] },
  'forecast': { key: 'forecast', label: '天气预报', icon: '🌈', cat: ['weather'] },
  'translate': { key: 'translate', label: '在线翻译', icon: '🌐', cat: ['tools'], params: [{name:'q',label:'内容',type:'textarea',default:''},{name:'source',label:'源语言',type:'select',options:['auto','zh','en','ja','ko','fr','de','es'],default:'auto'},{name:'target',label:'目标语言',type:'select',options:['zh','en','ja','ko','fr','de','es'],default:'en'}] },
  'lyrics': { key: 'lyrics', label: '歌词搜索', icon: '🎤', cat: ['tools'], params: [{name:'q',label:'歌曲名',type:'text',default:'晴天'},{name:'author',label:'歌手',type:'text',default:''}] },
  'qr_code': { key: 'qr_code', label: '生成二维码', icon: '📱', cat: ['tools'], params: [{name:'url',label:'网址',type:'text',default:'https://github.com/vikiboss/60s'}] },
  'baike': { key: 'baike', label: '百度百科', icon: '📖', cat: ['tools'], params: [{name:'q',label:'关键词',type:'text',default:'人工智能'}] },
  'ip_address': { key: 'ip_address', label: '公网IP', icon: '🌐', cat: ['tools'] },
  'whois': { key: 'whois', label: 'Whois查询', icon: '🔍', cat: ['tools'], params: [{name:'domain',label:'域名',type:'text',default:'github.com'}] },
  'gold_price': { key: 'gold_price', label: '黄金价格', icon: '🥇', cat: ['tools'] },
  'oil_price': { key: 'oil_price', label: '汽油价格', icon: '⛽', cat: ['tools'] },
  'moyu_daily': { key: 'moyu_daily', label: '摸鱼日报', icon: '🐟', cat: ['tools'] },
  'random_quote': { key: 'random_quote', label: '随机一言', icon: '💬', cat: ['tools'] },
  'random_joke': { key: 'random_joke', label: '搞笑段子', icon: '😂', cat: ['tools'] },
  'fortune': { key: 'fortune', label: '随机运势', icon: '🎋', cat: ['tools'] },
  'answer_book': { key: 'answer_book', label: '答案之书', icon: '📕', cat: ['tools'] },
  'kfc_copywriting': { key: 'kfc_copywriting', label: 'KFC文案', icon: '🍗', cat: ['tools'] },
  'cold_joke': { key: 'cold_joke', label: '冷笑话', icon: '❄️', cat: ['tools'] },
  'health_analysis': { key: 'health_analysis', label: '身体分析', icon: '❤️', cat: ['tools'], params: [{name:'height',label:'身高cm',type:'number',default:'175'},{name:'weight',label:'体重kg',type:'number',default:'70'},{name:'age',label:'年龄',type:'number',default:'25'},{name:'gender',label:'性别',type:'select',options:['male','female'],default:'male'}] },
  'password_generator': { key: 'password_generator', label: '密码生成器', icon: '🔐', cat: ['tools'], params: [{name:'length',label:'长度',type:'number',default:'16'}] },
  'color_random': { key: 'color_random', label: '随机颜色', icon: '🎨', cat: ['tools'] },
};

// ==================== Init ====================
function init() {
  loadConfig();
  applyTheme(themeMode);
  applyAccent(accentColor);
  renderPage();
}

function loadConfig() {
  const saved = localStorage.getItem('60s_api_base');
  if (saved) {
    apiBaseUrl = saved;
    document.getElementById('apiUrlInput').value = saved;
  } else {
    apiBaseUrl = window.location.origin;
    document.getElementById('apiUrlInput').value = apiBaseUrl;
  }
}

// ==================== Theme ====================
function toggleTheme() {
  themeMode = themeMode === 'light' ? 'dark' : 'light';
  applyTheme(themeMode);
  localStorage.setItem('60s_theme', themeMode);
}

function setTheme(mode) {
  themeMode = mode;
  applyTheme(mode);
  localStorage.setItem('60s_theme', mode);
  document.querySelectorAll('.theme-opt').forEach(el => el.classList.toggle('active', el.dataset.themeMode === mode));
}

function applyTheme(mode) {
  document.documentElement.setAttribute('data-theme', mode);
  const btn = document.getElementById('themeToggle');
  btn.textContent = mode === 'light' ? '🌙' : '☀️';
  btn.title = mode === 'light' ? '切换到暗色' : '切换到浅色';
}

function setAccent(el) {
  accentColor = el.dataset.accent;
  applyAccent(accentColor);
  localStorage.setItem('60s_accent', accentColor);
  document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
}

function applyAccent(color) {
  document.documentElement.style.setProperty('--accent', color);
  document.documentElement.style.setProperty('--accent-light', color + '15');
}

// ==================== Nav ====================
function switchNav(nav) {
  currentNav = nav;
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.toggle('active', t.dataset.nav === nav));
  renderPage();
}

function getVisibleFeatures() {
  return Object.values(FEATURE_MAP).filter(f => f.cat.includes(currentNav));
}

// ==================== Render Page ====================
function renderPage() {
  const grid = document.getElementById('mainGrid');
  const features = getVisibleFeatures();
  
  if (currentNav === 'home') {
    grid.innerHTML = renderHomeLayout(features);
  } else if (currentNav === 'hot') {
    grid.innerHTML = renderHotLayout(features);
  } else if (currentNav === 'news') {
    grid.innerHTML = renderNewsLayout(features);
  } else if (currentNav === 'weather') {
    grid.innerHTML = renderWeatherLayout(features);
  } else if (currentNav === 'tools') {
    grid.innerHTML = renderToolsLayout(features);
  }
  
  // Auto-load home cards
  if (currentNav === 'home') {
    fetchFeatureData('60s', 'card_60s');
    fetchFeatureData('weather', 'card_weather');
    fetchFeatureData('bing_wallpaper', 'card_bing');
    fetchFeatureData('douyin_hot', 'card_douyin');
  }
}

function renderHomeLayout(features) {
  let html = '';
  
  // 今日60秒卡片
  const six0s = features.find(f => f.key === '60s');
  html += '<div class="card" style="grid-column: span 2;"><div class="card-header"><div class="card-title"><span class="card-title-icon">⏰</span>今日 60 秒看世界</div><button class="card-more" onclick="fetchFeatureData(\'60s\',\'card_60s\')">刷新</button></div><div class="card-body" id="card_60s"><div class="loading-tip">加载中...</div></div></div>';
  
  // 天气卡片
  const weather = features.find(f => f.key === 'weather');
  html += '<div class="card"><div class="card-header"><div class="card-title"><span class="card-title-icon">🌤️</span>城市天气</div><button class="card-more" onclick="openToolModal(\'weather\')">选择城市</button></div><div class="card-body" id="card_weather"><div class="loading-tip">加载中...</div></div></div>';
  
  // 必应壁纸
  const bing = features.find(f => f.key === 'bing_wallpaper');
  html += '<div class="card"><div class="card-header"><div class="card-title"><span class="card-title-icon">🖼️</span>必应每日壁纸</div><button class="card-more" onclick="fetchFeatureData(\'bing_wallpaper\',\'card_bing\')">刷新</button></div><div class="card-body" id="card_bing"><div class="loading-tip">加载中...</div></div></div>';
  
  // 热搜卡片（横向排列）
  const hotFeats = ['douyin_hot', 'weibo_hot', 'bili_hot'];
  hotFeats.forEach(key => {
    const feat = features.find(f => f.key === key);
    if (feat) {
      html += '<div class="card"><div class="card-header"><div class="card-title"><span class="card-title-icon">' + feat.icon + '</span>' + feat.label + '</div><button class="card-more" onclick="fetchFeatureData(\'' + key + '\',\'card_' + key.replace(/_/g,'') + '\')">更多 →</button></div><div class="card-body" id="card_' + key.replace(/_/g,'') + '"><div class="loading-tip">加载中...</div></div></div>';
    }
  });
  
  return html;
}

function renderHotLayout(features) {
  let html = '';
  features.forEach(feat => {
    html += '<div class="card"><div class="card-header"><div class="card-title"><span class="card-title-icon">' + feat.icon + '</span>' + feat.label + '</div><button class="card-more" onclick="fetchFeatureData(\'' + feat.key + '\',\'card_' + feat.key + '\')">刷新</button></div><div class="card-body" id="card_' + feat.key + '"><div class="empty-tip">点击「刷新」获取数据</div></div></div>';
  });
  return html;
}

function renderNewsLayout(features) {
  let html = '';
  const newsFeats = features.filter(f => ['60s','ai_news','it_news'].includes(f.key));
  newsFeats.forEach(feat => {
    html += '<div class="card"><div class="card-header"><div class="card-title"><span class="card-title-icon">' + feat.icon + '</span>' + feat.label + '</div><button class="card-more" onclick="fetchFeatureData(\'' + feat.key + '\',\'card_' + feat.key + '\')">刷新</button></div><div class="card-body" id="card_' + feat.key + '"><div class="empty-tip">点击「刷新」获取数据</div></div></div>';
  });
  return html;
}

function renderWeatherLayout(features) {
  let html = '';
  features.forEach(feat => {
    html += '<div class="card"><div class="card-header"><div class="card-title"><span class="card-title-icon">' + feat.icon + '</span>' + feat.label + '</div><button class="card-more" onclick="fetchFeatureData(\'' + feat.key + '\',\'card_' + feat.key + '\')">刷新</button></div><div class="card-body" id="card_' + feat.key + '"><div class="empty-tip">点击「刷新」获取数据</div></div></div>';
  });
  return html;
}

function renderToolsLayout(features) {
  let html = '';
  features.forEach(feat => {
    const hasParams = feat.params && feat.params.length > 0;
    html += '<div class="card"><div class="card-header"><div class="card-title"><span class="card-title-icon">' + feat.icon + '</span>' + feat.label + '</div></div><div class="card-body">' + (hasParams ? renderForm(feat) : '<button class="btn-save" style="margin:0;" onclick=\'fetchFeatureData("' + feat.key + '","card_' + feat.key + '")\'>🚀 查询</button>') + '<div id="card_' + feat.key + '" style="margin-top:12px;"></div></div></div>';
  });
  return html;
}

function renderForm(feat) {
  let html = '<form onsubmit="return executeToolQuery(event,\'' + feat.key + '\')" style="display:flex;flex-direction:column;gap:8px;">';
  if (feat.params) {
    feat.params.forEach(p => {
      if (p.type === 'textarea') {
        html += '<textarea class="api-url-input" name="' + p.name + '" placeholder="' + (p.label||'') + '"></textarea>';
      } else if (p.type === 'select') {
        html += '<select class="api-url-input" name="' + p.name + '">' + (p.options||[]).map(o => '<option value="' + o + '"' + (o===p.default?' selected':'') + '>' + o + '</option>').join('') + '</select>';
      } else {
        html += '<input class="api-url-input" type="' + (p.type||'text') + '" name="' + p.name + '" value="' + (p.default||'') + '" placeholder="' + (p.label||'') + '">';
      }
    });
  }
  html += '<button type="submit" class="btn-save" style="margin-top:4px;">🚀 查询</button></form>';
  return html;
}

// ==================== Data Fetch ====================
async function fetchFeatureData(featureKey, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '<div class="loading-tip"><span class="spinner"></span> 加载中...</div>';
  
  try {
    const resp = await fetch(apiBaseUrl + '/api/' + featureKey);
    const data = await resp.json();
    container.innerHTML = renderResult(data, featureKey);
  } catch (err) {
    container.innerHTML = '<div class="empty-tip" style="color:var(--danger);">❌ 请求失败: ' + escapeHtml(err.message) + '</div>';
  }
}

async function executeToolQuery(e, featureKey) {
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);
  const params = new URLSearchParams();
  for (const [k,v] of fd.entries()) { if(v) params.append(k,v); }
  
  const qs = params.toString();
  const url = apiBaseUrl + '/api/' + featureKey + (qs ? '?' + qs : '');
  
  const container = form.nextElementSibling;
  container.innerHTML = '<div class="loading-tip">加载中...</div>';
  
  try {
    const resp = await fetch(url);
    const data = await resp.json();
    container.innerHTML = renderResult(data, featureKey);
  } catch (err) {
    container.innerHTML = '<div class="empty-tip" style="color:var(--danger);">❌ ' + escapeHtml(err.message) + '</div>';
  }
  return false;
}

// ==================== Result Renderer ====================
function renderResult(data, featureKey) {
  if (!data || !data.data) return '<div class="empty-tip">无数据</div>';
  const d = data.data;
  
  // 60s news
  if (featureKey === '60s' && Array.isArray(d.news)) {
    const dateInfo = [d.date,d.day_of_week,d.lunar_date].filter(Boolean).join(' ');
    let html = '<div class="news-date">' + escapeHtml(dateInfo) + '</div>';
    d.news.forEach((n,i) => {
      html += '<div class="news-item"><span class="news-dot">·</span><span class="news-text">' + escapeHtml(n) + '</span><span class="news-num">' + String(i+1).padStart(2,'0') + '</span></div>';
    });
    if (d.cover) html += '<div style="margin-top:12px;text-align:center;"><img src="' + escapeHtml(d.cover) + '" style="max-width:100%;max-height:200px;border-radius:8px;" onerror="this.style.display=\'none\'"></div>';
    return html;
  }
  
  // Bing wallpaper
  if (featureKey === 'bing_wallpaper' && d.cover) {
    return '<div style="text-align:center;"><img src="' + escapeHtml(d.cover) + '" style="max-width:100%;max-height:360px;border-radius:10px;object-fit:cover;" onerror="this.parentElement.innerHTML=\'图片加载失败\'"><div style="margin-top:12px;font-size:13px;color:var(--text-dim);">' + escapeHtml(d.copyright||'') + '</div></div>';
  }
  
  // Weather
  if ((featureKey === 'weather' || featureKey === 'forecast') && d.location) {
    const w = d.weather || {};
    const aq = d.air_quality || {};
    const loc = d.location;
    const indices = d.life_indices || [];
    
    let html = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">';
    html += '<div><div class="weather-city-select" style="border:none;background:none;padding:0;font-size:14px;font-weight:600;">📍 ' + escapeHtml(loc.province||'') + ' ' + escapeHtml(loc.city||'') + ' ' + escapeHtml(loc.name||'') + '</div></div>';
    html += '</div>';
    html += '<div class="weather-main"><div><div class="weather-temp-big">' + (w.temperature ?? '--') + '°</div><div class="weather-condition">' + escapeHtml(w.condition||'') + '</div></div><div style="font-size:40px;">' + (w.weather_icon ? '<img src="'+escapeHtml(w.weather_icon)+'" style="width:48px;height:48px;" onerror="this.style.display=\'none\'">' : '🌤️') + '</div></div>';
    html += '<div class="weather-detail-row">';
    html += '<div class="weather-detail-item"><span class="weather-detail-label">湿度</span><span class="weather-detail-value">' + (w.humidity??'--') + '%</span></div>';
    html += '<div class="weather-detail-item"><span class="weather-detail-label">风向风力</span><span class="weather-detail-value">' + escapeHtml(w.wind_direction||'') + ' ' + escapeHtml(w.wind_power||'') + '</span></div>';
    html += '<div class="weather-detail-item"><span class="weather-detail-label">AQI</span><span class="weather-detail-value"><span class="tag-' + (aq.level<=2?'green':'orange') + '">' + escapeHtml(aq.quality||'--') + ' (' + (aq.aqi??'--') + ')</span></span></div>';
    html += '</div>';
    
    // Forecast
    if (d.daily_forecast && d.daily_forecast.length) {
      html += '<div style="font-size:12px;color:var(--text-dim);margin-bottom:8px;font-weight:600;">未来预报</div><div class="forecast-row">';
      d.daily_forecast.slice(0,7).forEach(day => {
        html += '<div class="forecast-card"><div class="forecast-day">' + escapeHtml(day.date||day.weekday||'') + '</div><div class="forecast-icon">' + (day.icon||'🌤️') + '</div><div class="forecast-temps">' + (day.high!=null?day.high+'°':'--') + ' <span class="forecast-low">' + (day.low!=null?day.low+'°':'--') + '</span></div></div>';
      });
      html += '</div>';
    }
    
    // Life indices
    if (indices.length) {
      html += '<div style="margin-top:14px;font-size:12px;color:var(--text-dim);font-weight:600;">生活指数</div><div class="info-grid">';
      indices.slice(0,6).forEach(idx => {
        html += '<div class="info-cell"><div class="info-cell-label">' + escapeHtml(idx.name||'') + '</div><div class="info-cell-value" style="font-size:12px;">' + escapeHtml(idx.level||'') + '</div></div>';
      });
      html += '</div>';
    }
    return html;
  }
  
  // Hot lists
  if (['douyin_hot','weibo_hot','bili_hot','zhihu_hot','toutiao_hot','xiaohongshu_hot','duodiang_hot','baidu_hotsearch','quark_hot','baidu_tieba'].includes(featureKey) && Array.isArray(d)) {
    let html = '';
    d.slice(0,20).forEach((item,i) => {
      const rankCls = i<3 ? 'top'+(i+1) : 'normal';
      const title = item.title || item.query || '';
      const hotVal = item.hot_value || item.hot_score || '';
      const link = item.link || '';
      html += '<div class="hot-list-item"' + (link ? 'onclick="window.open(\''+escapeHtml(link)+'\',\'_blank\')"' : '') + '>';
      html += '<span class="hot-rank ' + rankCls + '">' + (i+1) + '</span>';
      html += '<span class="hot-title">' + escapeHtml(title) + '</span>';
      if (hotVal) html += '<span class="hot-val">' + formatNum(hotVal) + '</span>';
      html += '</div>';
    });
    return html;
  }
  
  // Single string result
  if (typeof d === 'string') {
    return '<div class="single-line">' + escapeHtml(d) + '</div>';
  }
  
  // QR Code
  if (featureKey === 'qr_code' && (d.url || d.image)) {
    return '<div style="text-align:center;"><img src="' + escapeHtml(d.url || d.image) + '" style="max-width:240px;border-radius:12px;" onerror="this.parentElement.innerHTML=\'二维码生成失败\'"></div>';
  }
  
  // Translate
  if (featureKey === 'translate' && (d.translation || d.result)) {
    return '<div class="single-line" style="font-size:18px;line-height:2;">' + escapeHtml(d.translation || d.result) + '</div>';
  }
  
  // Lyrics
  if (featureKey === 'lyrics' && (d.lyrics || d.lrc)) {
    let info = '';
    if (d.song_name || d.artist) info = '<div style="font-size:12px;color:var(--text-dim);margin-bottom:8px;">' + escapeHtml(d.song_name||'') + ' - ' + escapeHtml(d.artist||'') + '</div>';
    return info + '<div class="single-line" style="white-space:pre-line;">' + escapeHtml(d.lyrics || d.lrc) + '</div>';
  }
  
  // Gold / Oil price
  if (featureKey === 'gold_price' || featureKey === 'oil_price') {
    if (typeof d === 'object' && !Array.isArray(d)) {
      let html = '<div class="info-grid">';
      for (const [k,v] of Object.entries(d)) {
        html += '<div class="info-cell"><div class="info-cell-label">' + escapeHtml(k) + '</div><div class="info-cell-value">' + escapeHtml(String(v)) + '</div></div>';
      }
      html += '</div>';
      return html;
    }
  }
  
  // General object
  if (typeof d === 'object' && !Array.isArray(d)) {
    let html = '<div class="info-grid">';
    for (const [k,v] of Object.entries(d)) {
      if (v === undefined || v === null) continue;
      const val = typeof v === 'object' ? JSON.stringify(v) : String(v);
      html += '<div class="info-cell"><div class="info-cell-label">' + escapeHtml(k) + '</div><div class="info-cell-value" style="font-size:13px;">' + escapeHtml(val) + '</div></div>';
    }
    html += '</div>';
    return html;
  }
  
  // Fallback: JSON
  return '<div style="font-size:12px;max-height:300px;overflow:auto;background:rgba(0,0,0,0.15);border-radius:8px;padding:12px;">' + syntaxHighlight(JSON.stringify(d,null,2)) + '</div>';
}

// ==================== Utilities ====================
function escapeHtml(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function formatNum(n) {
  n = Number(n);
  if (isNaN(n)) return '';
  if (n >= 10000) return (n/10000).toFixed(1) + '万';
  return n.toLocaleString();
}

function todayStr() {
  const d = new Date();
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}

function syntaxHighlight(json) {
  json = json.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"\\s*:)?|(\\\\b(true|false|null)\\\\b|-?\\d+(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)/g, function(m) {
    let c = '#f78c6c';
    if (/^"/.test(m)) { c = /:$/.test(m) ? '#c792ea' : '#c3e88d'; }
    else if (/true|false/.test(m)) c = '#ff5370';
    else if (/null/.test(m)) c = '#888';
    return '<span style="color:'+c+'">'+m+'</span>';
  });
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function setSearch(q) {
  document.getElementById('searchInput').value = q;
  filterCards(q);
}

function quickSearch() {
  const q = document.getElementById('searchInput').value.trim();
  if (!q) return;
  for (const [key, feat] of Object.entries(FEATURE_MAP)) {
    if (feat.label.toLowerCase().includes(q.toLowerCase()) || key.includes(q.toLowerCase())) {
      currentNav = 'tools';
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.toggle('active', t.dataset.nav === 'tools'));
      renderPage();
      setTimeout(() => fetchFeatureData(key, 'card_'+key), 100);
      return;
    }
  }
  showToast('未找到匹配的接口');
}

function filterCards(q) {
  if (!q) { renderPage(); return; }
  const grid = document.getElementById('mainGrid');
  const features = Object.values(FEATURE_MAP);
  const matched = features.filter(f => 
    f.label.toLowerCase().includes(q.toLowerCase()) || 
    f.key.includes(q.toLowerCase()) ||
    f.icon.includes(q)
  );
  
  if (matched.length === 0) {
    grid.innerHTML = '<div class="empty-tip" style="grid-column:1/-1;padding:60px 20px;">未找到匹配的功能<br><span style="font-size:12px;">试试其他关键词</span></div>';
    return;
  }
  
  let html = '';
  matched.forEach(feat => {
    html += '<div class="card"><div class="card-header"><div class="card-title"><span class="card-title-icon">' + feat.icon + '</span>' + feat.label + '</div></div><div class="card-body" id="card_' + feat.key + '"><div class="empty-tip">点击查询获取数据</div></div></div>';
  });
  grid.innerHTML = html;
}

function saveApiUrl() {
  const val = document.getElementById('apiUrlInput').value.trim().replace(/\/$/, '');
  if (!val) { showToast('请输入有效的 API 地址'); return; }
  apiBaseUrl = val;
  localStorage.setItem('60s_api_base', val);
  showToast('✅ API 地址已保存');
}

function openToolModal(key) {
  const city = prompt('输入城市名称:', '深圳');
  if (city) {
    fetchFeatureDataWithParam(key, 'card_weather', { city: city });
  }
}

async function fetchFeatureDataWithParam(featureKey, containerId, extraParams) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '<div class="loading-tip">加载中...</div>';
  
  try {
    const params = new URLSearchParams(extraParams);
    const url = apiBaseUrl + '/api/' + featureKey + (params.toString() ? '?' + params : '');
    const resp = await fetch(url);
    const data = await resp.json();
    container.innerHTML = renderResult(data, featureKey);
  } catch (err) {
    container.innerHTML = '<div class="empty-tip" style="color:var(--danger);">❌ ' + escapeHtml(err.message) + '</div>';
  }
}

function toggleSettings() {
  document.getElementById('settingsOverlay').classList.toggle('open');
}
function closeSettings() {
  document.getElementById('settingsOverlay').classList.remove('open');
}

// Spinner CSS
const spinnerStyle = document.createElement('style');
spinnerStyle.textContent = '.spinner{display:inline-block;width:16px;height:16px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin 0.8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}';
document.head.appendChild(spinnerStyle);

// Start
document.addEventListener('DOMContentLoaded', init);
</script>

</body>
</html>`;
