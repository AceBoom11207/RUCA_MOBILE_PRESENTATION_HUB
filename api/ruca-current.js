const SOURCE = 'https://raw.githubusercontent.com/AceBoom11207/RUCA_OS/3ce2807b07461270b5e7d85bfabd06c2ddc9fb95/index.html';
const BASE = 'https://cdn.jsdelivr.net/gh/AceBoom11207/RUCA_OS@3ce2807b07461270b5e7d85bfabd06c2ddc9fb95/';

module.exports = async function handler(req, res) {
  try {
    const upstream = await fetch(SOURCE, { headers: { 'User-Agent': 'RUCA-Portfolio-Current-Runtime' } });
    if (!upstream.ok) {
      res.status(upstream.status).send('RUCA OS canonical runtime source unavailable.');
      return;
    }
    let html = await upstream.text();
    html = html.replace(/<head>/i, `<head>\n  <base href="${BASE}">\n  <meta name="ruca-public-runtime-source" content="RUCA_OS@3ce2807b07461270b5e7d85bfabd06c2ddc9fb95">`);
    html = html.replace('</body>', `<script>\nwindow.addEventListener('DOMContentLoaded',()=>{\n  const hash=(location.hash||'#home').slice(1);\n  const btn=document.querySelector('[data-page="'+hash+'"]');\n  if(btn && !btn.classList.contains('active')) btn.click();\n});\n</script></body>`);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
    res.setHeader('X-RUCA-Source-Commit', '3ce2807b07461270b5e7d85bfabd06c2ddc9fb95');
    res.status(200).send(html);
  } catch (error) {
    res.status(500).send('RUCA OS canonical runtime proxy failed.');
  }
};
