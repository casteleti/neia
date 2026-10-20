type WidgetOptions = { baseUrl?: string; apiUrl?: string; installationId?: string; context?: string };
type WidgetInstance = { destroy: () => void; open: () => void; close: () => void };
type PublicIntegration = { id: string; context: string; suggestions: unknown };
type WidgetApi = { init: (options?: WidgetOptions) => WidgetInstance; destroy: () => void };
type WidgetWindow = Window & { NeiaWidget?: WidgetApi; NepiWidget?: WidgetApi };
const hostWindow = window as WidgetWindow;
let activeWidget: WidgetInstance | undefined;

function init(options: WidgetOptions = {}): WidgetInstance {
  activeWidget?.destroy();
  const script = document.currentScript as HTMLScriptElement | null;
  const legacyEntryPoint = Boolean(script?.src.endsWith('/nepi-widget.js'));
  const baseUrl = (options.baseUrl ?? script?.dataset.neiaBase ?? script?.dataset.nepiBase ?? new URL(script?.src ?? window.location.href).origin).replace(/\/$/, '');
  const apiUrl = (options.apiUrl ?? script?.dataset.neiaApi ?? script?.dataset.nepiApi ?? baseUrl).replace(/\/$/, '');
  const installationId = options.installationId ?? script?.dataset.neiaInstallation ?? script?.dataset.nepiInstallation ?? '';
  const context = options.context ?? 'institucional';
  const hostOrigin = window.location.origin;
  const mount = document.createElement('div'); mount.dataset.neiaWidget = 'true';
  mount.style.cssText = 'all:initial!important;position:fixed!important;z-index:2147483000!important;right:24px!important;bottom:24px!important';
  const shadow = mount.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = ':host{font-family:Arial,sans-serif}:host *{box-sizing:border-box}[data-neia-launcher]{display:grid;place-items:center;width:62px;height:62px;padding:4px;border:1px solid #fff;border-radius:50%;background:#fff;box-shadow:0 7px 28px #13382233;cursor:pointer}[data-neia-launcher] img{width:100%;height:100%;object-fit:cover;border-radius:50%}[data-neia-frame]{position:fixed;right:24px;bottom:100px;width:min(440px,calc(100vw - 32px));height:min(720px,calc(100dvh - 124px));border:0;border-radius:27px;background:#fff;box-shadow:0 20px 70px #1338222b}[data-neia-frame][hidden]{display:none}@media(max-width:680px){:host{right:14px!important;bottom:14px!important}[data-neia-frame]{inset:0;width:100vw;height:100dvh;border-radius:0}}';
  const launcher = document.createElement('button'); launcher.type = 'button'; launcher.dataset.neiaLauncher = 'true'; launcher.setAttribute('aria-label', 'Abrir conversa com a Néia');
  const image = document.createElement('img'); image.src = `${baseUrl}/neia-identidade-original.png`; image.alt = ''; launcher.append(image);
  const frame = document.createElement('iframe'); frame.dataset.neiaFrame = 'true'; frame.title = 'Conversa com a Néia'; frame.hidden = true;
  const embedUrl = new URL('/embed', baseUrl); embedUrl.searchParams.set('context', context); if (!legacyEntryPoint) embedUrl.searchParams.set('bridge', 'neia'); if (installationId) embedUrl.searchParams.set('installationId', installationId); frame.src = embedUrl.toString();
  let opening = false; let token = ''; let publicIntegration: PublicIntegration | undefined;
  const resolveIntegration = async () => {
    if (publicIntegration) return;
    if (!installationId) throw new Error('O installationId público não foi configurado no widget Néia.');
    const headers = { 'Content-Type': 'application/json' };
    const resolveResponse = await fetch(`${apiUrl}/api/v1/integrations/resolve`, { method: 'POST', mode: 'cors', headers, body: JSON.stringify({ installationId }) });
    if (!resolveResponse.ok) throw new Error('Instalação ou origem não autorizada pela Néia.');
    publicIntegration = await resolveResponse.json() as PublicIntegration;
  };
  const sendConfig = () => frame.contentWindow?.postMessage({ type: 'neia:config', installationId, hostOrigin, apiUrl, suggestions: publicIntegration?.suggestions }, new URL(baseUrl).origin);
  const sendInit = () => frame.contentWindow?.postMessage({ type: 'neia:init', token, installationId, hostOrigin, apiUrl }, new URL(baseUrl).origin);
  const onMessage = (event: MessageEvent<unknown>) => {
    if (event.origin !== new URL(baseUrl).origin || event.source !== frame.contentWindow || typeof event.data !== 'object' || event.data === null || !('type' in event.data)) return;
    const messageType = (event.data as { type: unknown }).type;
    if (messageType === 'neia:close' || messageType === 'neia:minimize' || messageType === 'nepi:close' || messageType === 'nepi:minimize') { frame.hidden = true; launcher.setAttribute('aria-label', 'Abrir conversa com a Néia'); launcher.focus(); }
    if (messageType === 'neia:ready' || messageType === 'nepi:ready') sendConfig();
    if (messageType === 'neia:consent' || messageType === 'nepi:consent') {
      void resolveIntegration().then(async () => {
        if (!token) {
          const sessionResponse = await fetch(`${apiUrl}/api/v1/sessions`, { method: 'POST', mode: 'cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ installationId }) });
          if (!sessionResponse.ok) throw new Error('Não foi possível iniciar uma sessão com a Néia.');
          token = (await sessionResponse.json() as { token: string }).token;
        }
        sendInit();
      }).catch(() => { launcher.setAttribute('aria-label', 'Não foi possível conectar à Néia. Tente novamente.'); });
    }
  };
  const onLoad = () => { if (publicIntegration) sendConfig(); if (token) sendInit(); };
  const toggle = async () => {
    if (!frame.hidden) { frame.hidden = true; launcher.setAttribute('aria-label', 'Abrir conversa com a Néia'); return; }
    if (opening) return;
    opening = true; launcher.setAttribute('aria-label', 'Conectando à Néia');
    try { await resolveIntegration(); frame.hidden = false; launcher.setAttribute('aria-label', 'Fechar conversa com a Néia'); sendConfig(); }
    catch { launcher.setAttribute('aria-label', 'Não foi possível conectar. Tente novamente.'); }
    finally { opening = false; }
  };
  launcher.addEventListener('click', () => { void toggle(); }); window.addEventListener('message', onMessage); frame.addEventListener('load', onLoad);
  shadow.append(style, launcher, frame); document.body.append(mount);
  const instance: WidgetInstance = { open: () => { if (frame.hidden) void toggle(); }, close: () => { frame.hidden = true; launcher.setAttribute('aria-label', 'Abrir conversa com a Néia'); }, destroy: () => { window.removeEventListener('message', onMessage); frame.removeEventListener('load', onLoad); mount.remove(); if (activeWidget === instance) activeWidget = undefined; } };
  activeWidget = instance;
  return instance;
}

const neiaApi: WidgetApi = { init, destroy: () => activeWidget?.destroy() };
hostWindow.NeiaWidget = neiaApi;
hostWindow.NepiWidget = neiaApi;
if (document.currentScript) init();
