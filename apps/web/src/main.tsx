import React, { FormEvent, KeyboardEvent as ReactKeyboardEvent, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowDown, ArrowUp, CalendarDays, Check, ChevronRight, FileText, GraduationCap, Landmark, LoaderCircle, LogOut, Menu, MessageCircle, MoreHorizontal, Plus, Save, Sparkles, X } from 'lucide-react';
import './styles.css';

type Message = { id: number | string; role: 'assistant' | 'user'; text: string; time: string; status?: 'error' };
const defaultSuggestions = [
  { icon: GraduationCap, text: 'Quais são os cursos disponíveis?' },
  { icon: FileText, text: 'Como participar de um projeto?' },
  { icon: CalendarDays, text: 'Quais são os editais em aberto?' },
  { icon: Landmark, text: 'Como entrar em contato?' },
];
function createIdempotencyKey(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID();
  const bytes = new Uint8Array(16);
  if (typeof globalThis.crypto?.getRandomValues === 'function') globalThis.crypto.getRandomValues(bytes);
  else for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((value) => value.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
const initialMessage: Message = { id: 1, role: 'assistant', text: 'Olá! Eu sou a Néia, a inteligência artificial da FUNEP.\n\nEstou aqui para ajudar você a encontrar informações sobre cursos, projetos, eventos, serviços e muito mais.\n\nComo posso ajudar?', time: 'Agora' };

type AdminIntegration = { id: string; slug: string; label: string; context: string; installationId: string; installationAliases: string[]; allowedOrigins: string[]; enabled: boolean; suggestionsJson: unknown };

function AdminApp() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [integrations, setIntegrations] = useState<AdminIntegration[]>([]);
  const [loading, setLoading] = useState(false); const [message, setMessage] = useState(''); const [authenticated, setAuthenticated] = useState(false);
  const load = async () => {
    const response = await fetch('/api/v1/admin/integrations', { credentials: 'same-origin' });
    if (!response.ok) { setAuthenticated(false); return; }
    const result: { integrations: AdminIntegration[] } = await response.json(); setIntegrations(result.integrations); setAuthenticated(true);
  };
  useEffect(() => { void load(); }, []);
  const login = async (event: FormEvent) => {
    event.preventDefault(); setLoading(true); setMessage('');
    try {
      const response = await fetch('/api/v1/admin/login', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      if (!response.ok) throw new Error('Não foi possível entrar. Confira suas credenciais.');
      setPassword(''); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Falha ao entrar.'); }
    finally { setLoading(false); }
  };
  const save = async (integration: AdminIntegration, form: HTMLFormElement) => {
    const data = new FormData(form);
    const payload = { enabled: data.get('enabled') === 'on', label: String(data.get('label') ?? ''), allowedOrigins: String(data.get('origins') ?? '').split('\n').map((value) => value.trim()).filter(Boolean), suggestions: String(data.get('suggestions') ?? '').split('\n').map((value) => value.trim()).filter(Boolean) };
    setLoading(true); setMessage('');
    try {
      const response = await fetch(`/api/v1/admin/integrations/${integration.id}`, { method: 'PATCH', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error('Não foi possível salvar esta integração. Verifique origens e sugestões.');
      await load(); setMessage(`Configuração de ${integration.label} salva.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Falha ao salvar.'); }
    finally { setLoading(false); }
  };
  const logout = async () => { await fetch('/api/v1/admin/logout', { method: 'POST', credentials: 'same-origin' }); setAuthenticated(false); setIntegrations([]); };
  return <main className="admin-shell">
    <header className="admin-header"><a className="brand" href="/" aria-label="Voltar ao chat da Néia"><img src="/neia-identidade-original.png" alt=""/><span>Néia</span></a><span className="admin-label">Painel administrativo</span></header>
    {!authenticated ? <form className="admin-login" onSubmit={login}><div className="eyebrow"><Sparkles size={15}/> ACESSO RESTRITO</div><h1>Entrar no painel</h1><p>Gerencie integrações e configurações públicas da Néia.</p><label>E-mail<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" required/></label><label>Senha<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required/></label>{message && <div className="admin-notice" role="alert">{message}</div>}<button className="admin-primary" disabled={loading}>{loading ? <LoaderCircle size={17} className="spin"/> : 'Entrar'}</button></form> : <section className="admin-content"><div className="admin-title"><div><div className="eyebrow">CONFIGURAÇÃO</div><h1>Integrações</h1><p>Controle de origens, sugestões e estado de cada contexto.</p></div><button className="admin-logout" onClick={() => void logout()}><LogOut size={16}/> Sair</button></div>{message && <div className="admin-notice" role="status"><Check size={16}/>{message}</div>}<div className="integration-list">{integrations.map((integration) => <form className="integration-card" key={integration.id} onSubmit={(event) => { event.preventDefault(); void save(integration, event.currentTarget); }}><div className="integration-head"><div><span className="integration-slug">{integration.context}</span><h2>{integration.label}</h2></div><label className="toggle-row"><input type="checkbox" name="enabled" defaultChecked={integration.enabled}/><span>Ativa</span></label></div><label>Nome público<input name="label" defaultValue={integration.label} maxLength={120}/></label><label>Origens autorizadas <small>Uma origem por linha, incluindo protocolo e porta.</small><textarea name="origins" rows={3} defaultValue={integration.allowedOrigins.join('\n')} placeholder="https://exemplo.org.br"/></label><label>Sugestões exibidas <small>Uma pergunta por linha.</small><textarea name="suggestions" rows={4} defaultValue={Array.isArray(integration.suggestionsJson) ? integration.suggestionsJson.join('\n') : ''} maxLength={1200}/></label><div className="installation-note"><span>Installation ID público</span><code>{integration.installationId}</code>{integration.installationAliases.length > 0 && <small>IDs anteriores ativos para compatibilidade: {integration.installationAliases.join(", ")}</small>}</div><button className="admin-primary save-button" disabled={loading}><Save size={16}/> Salvar alterações</button></form>)}</div></section>}
  </main>;
}

function App() {
  const embedded = window.parent !== window;
  const query = new URLSearchParams(window.location.search);
  const legacyInstallationId = query.get('installationId') ?? import.meta.env.VITE_INSTALLATION_ID ?? 'dev-institucional-public-installation';
  const installationId = query.get('installationId') ?? import.meta.env.VITE_INSTALLATION_ID ?? 'dev-neia-institucional-public-installation';
  const parentOrigin = embedded && document.referrer ? new URL(document.referrer).origin : window.location.origin;
  const consentKey = `neia-consent:${installationId}:${parentOrigin}`;
  const legacyConsentKey = `nepi-consent:${legacyInstallationId}:${parentOrigin}`;
  const [privacyAccepted, setPrivacyAccepted] = useState(() => { try { return sessionStorage.getItem(consentKey) === 'accepted' || sessionStorage.getItem(legacyConsentKey) === 'accepted'; } catch { return false; } });
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [suggestions, setSuggestions] = useState(defaultSuggestions);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const [apiStatus, setApiStatus] = useState<'consent' | 'loading' | 'ready' | 'offline'>('consent');
  const [minimized, setMinimized] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const tokenRef = useRef('');
  const conversationRef = useRef('');
  const retryRef = useRef<{ content: string; key: string } | null>(null);
  const apiBaseRef = useRef(import.meta.env.VITE_API_BASE_URL ?? window.location.origin);
  const hostOriginRef = useRef(parentOrigin);
  const apiPath = (path: string) => new URL(path, apiBaseRef.current).toString();
  const visitorHeaders = (token: string, json = false): HeadersInit => ({ ...(json ? { 'Content-Type': 'application/json' } : {}), Authorization: `Bearer ${token}`, 'X-Neia-Host-Origin': hostOriginRef.current });
  const bridge = query.get('bridge') === 'neia' ? 'neia' : 'nepi';
  const readSessionValue = (key: string, legacyKey: string) => sessionStorage.getItem(key) ?? sessionStorage.getItem(legacyKey) ?? '';
  const writeSessionValue = (key: string, legacyKey: string, value: string) => { sessionStorage.setItem(key, value); sessionStorage.setItem(legacyKey, value); };
  const removeSessionValue = (key: string, legacyKey: string) => { sessionStorage.removeItem(key); sessionStorage.removeItem(legacyKey); };

  useEffect(() => {
    if (!embedded) return;
    const receiveConfig = (event: MessageEvent<unknown>) => {
      if (event.origin !== parentOrigin || event.source !== window.parent || typeof event.data !== 'object' || event.data === null || !('type' in event.data)) return;
      const data = event.data as { type?: unknown; installationId?: unknown; hostOrigin?: unknown; apiUrl?: unknown; suggestions?: unknown };
      if ((data.type !== 'neia:config' && data.type !== 'nepi:config') || data.installationId !== installationId || data.hostOrigin !== parentOrigin) return;
      if (typeof data.apiUrl === 'string') apiBaseRef.current = data.apiUrl;
      if (Array.isArray(data.suggestions)) {
        const icons = new Map(defaultSuggestions.map((item) => [item.text, item.icon]));
        const next = data.suggestions.filter((item): item is string => typeof item === 'string').map((text, index) => ({ icon: icons.get(text) ?? defaultSuggestions[index % defaultSuggestions.length].icon, text }));
        if (next.length) setSuggestions(next);
      }
    };
    window.addEventListener('message', receiveConfig);
    window.parent.postMessage({ type: `${bridge}:ready` }, parentOrigin);
    return () => window.removeEventListener('message', receiveConfig);
  }, [embedded, installationId, parentOrigin, bridge]);

  useEffect(() => {
    if (!privacyAccepted) { setApiStatus('consent'); return; }
    let cancelled = false;
    const startSession = async () => {
      try {
        setApiStatus('loading');
        let token = '';
        let publicIntegration: { suggestions?: unknown };
        let previousConversations: { id: string }[] = [];
        apiBaseRef.current = import.meta.env.VITE_API_BASE_URL ?? window.location.origin;
        if (embedded) {
          if (!parentOrigin) throw new Error('Não foi possível validar o site hospedeiro.');
          const bootstrap = await new Promise<{ token: string; installationId: string; hostOrigin: string; apiUrl?: string }>((resolve, reject) => {
            const timeout = window.setTimeout(() => { window.removeEventListener('message', receive); reject(new Error('A conexão do widget expirou.')); }, 12_000);
            const receive = (event: MessageEvent<unknown>) => {
              if (event.origin !== parentOrigin || event.source !== window.parent || typeof event.data !== 'object' || event.data === null || !('type' in event.data)) return;
              const data = event.data as { type?: unknown; token?: unknown; installationId?: unknown; hostOrigin?: unknown; apiUrl?: unknown };
              if ((data.type !== 'neia:init' && data.type !== 'nepi:init') || typeof data.token !== 'string' || typeof data.installationId !== 'string' || typeof data.hostOrigin !== 'string') return;
              if (data.hostOrigin !== parentOrigin || data.installationId !== installationId || data.token.length < 40) return;
              window.clearTimeout(timeout); window.removeEventListener('message', receive);
              resolve({ token: data.token, installationId: data.installationId, hostOrigin: data.hostOrigin, apiUrl: typeof data.apiUrl === 'string' ? data.apiUrl : undefined });
            };
            window.addEventListener('message', receive);
            window.parent.postMessage({ type: `${bridge}:consent`, installationId }, parentOrigin);
          });
          token = bootstrap.token; hostOriginRef.current = bootstrap.hostOrigin; apiBaseRef.current = bootstrap.apiUrl ?? window.location.origin;
          publicIntegration = {};
        } else {
          const resolved = await fetch(apiPath('/api/v1/integrations/resolve'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ installationId }) });
          if (!resolved.ok) throw new Error('A instalação não foi autorizada para esta origem.');
          publicIntegration = await resolved.json();
          token = readSessionValue('neia-session', 'nepi-session');
          if (token) {
            const existing = await fetch(apiPath('/api/v1/sessions/me/conversations'), { headers: visitorHeaders(token) });
            if (existing.ok) previousConversations = (await existing.json()).conversations;
            else { removeSessionValue('neia-session', 'nepi-session'); token = ''; }
          }
          if (!token) {
            const created = await fetch(apiPath('/api/v1/sessions'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ installationId }) });
            if (!created.ok) throw new Error('Não foi possível iniciar uma sessão.');
            const payload: { token: string } = await created.json(); token = payload.token; writeSessionValue('neia-session', 'nepi-session', token);
          }
        }
        if (Array.isArray(publicIntegration.suggestions)) {
          const icons = new Map(defaultSuggestions.map((item) => [item.text, item.icon]));
          const next = publicIntegration.suggestions.filter((item): item is string => typeof item === 'string').map((text, index) => ({ icon: icons.get(text) ?? defaultSuggestions[index % defaultSuggestions.length].icon, text }));
          if (next.length) setSuggestions(next);
        }
        let conversationId = readSessionValue('neia-conversation', 'nepi-conversation');
        if (embedded) conversationId = '';
        if (!previousConversations.some((item) => item.id === conversationId)) conversationId = previousConversations[0]?.id ?? '';
        if (!conversationId) {
          const created = await fetch(apiPath('/api/v1/conversations'), { method: 'POST', headers: visitorHeaders(token) });
          if (!created.ok) throw new Error('Não foi possível abrir uma conversa.');
          conversationId = (await created.json()).conversation.id;
        }
        if (!embedded) writeSessionValue('neia-conversation', 'nepi-conversation', conversationId);
        if (cancelled) return;
        tokenRef.current = token; conversationRef.current = conversationId;
        const history = await fetch(apiPath(`/api/v1/conversations/${conversationId}/messages`), { headers: visitorHeaders(token) });
        if (history.ok) {
          const records: { id: string; role: 'assistant' | 'user'; content: string; createdAt: string }[] = (await history.json()).messages;
          if (records.length && !cancelled) setMessages([initialMessage, ...records.map((message) => ({ id: message.id, role: message.role, text: message.content, time: new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(message.createdAt)) }))]);
        }
        if (!cancelled) setApiStatus('ready');
      } catch { if (!cancelled) setApiStatus('offline'); }
    };
    void startSession();
    return () => { cancelled = true; };
  }, [installationId, privacyAccepted, embedded, parentOrigin]);

  useEffect(() => { if (!scrolled) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages, typing, scrolled]);
  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (confirmDelete) setConfirmDelete(false);
      else if (showMenu) setShowMenu(false);
      else if (embedded) window.parent.postMessage({ type: `${bridge}:close` }, hostOriginRef.current);
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [confirmDelete, showMenu, embedded]);
  const send = (value = draft) => {
    const content = value.trim();
    if (!content || typing || apiStatus !== 'ready' || !tokenRef.current || !conversationRef.current) return;
    const now = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date());
    const retry = retryRef.current?.content === content ? retryRef.current : null;
    const idempotencyKey = retry?.key ?? createIdempotencyKey();
    if (!retry) setMessages((items) => [...items, { id: Date.now(), role: 'user', text: content, time: now }]);
    else setMessages((items) => items.filter((item) => item.status !== 'error'));
    setDraft(''); setTyping(true); setScrolled(false);
    void (async () => {
      let assistantId = '';
      try {
        const response = await fetch(apiPath(`/api/v1/conversations/${conversationRef.current}/messages/stream`), { method: 'POST', headers: { ...visitorHeaders(tokenRef.current, true), 'Idempotency-Key': idempotencyKey }, body: JSON.stringify({ content }) });
        if (!response.ok || !response.body) throw new Error('Não foi possível enviar sua mensagem.');
        const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffered = '';
        const readFrame = (frame: string) => {
          const event = frame.split('\n').find((line) => line.startsWith('event:'))?.slice(6).trim();
          const data = frame.split('\n').find((line) => line.startsWith('data:'))?.slice(5).trim();
          if (!event || !data) return;
          const payload = JSON.parse(data) as { content?: string; error?: { message?: string } };
          if (event === 'delta' && payload.content) {
            if (!assistantId) { assistantId = `stream-${Date.now()}`; setMessages((items) => [...items, { id: assistantId, role: 'assistant', text: payload.content ?? '', time: now }]); }
            else setMessages((items) => items.map((item) => item.id === assistantId ? { ...item, text: item.text + (payload.content ?? '') } : item));
          }
          if (event === 'error') throw new Error(payload.error?.message ?? 'A Néia não conseguiu responder agora.');
          if (event === 'complete') retryRef.current = null;
        };
        while (true) {
          const { done, value: chunk } = await reader.read(); buffered += decoder.decode(chunk, { stream: !done });
          const frames = buffered.split('\n\n'); buffered = frames.pop() ?? ''; frames.forEach(readFrame);
          if (done) break;
        }
        if (buffered.trim()) readFrame(buffered);
        if (!assistantId) throw new Error('A resposta não chegou completa.');
      } catch (error) {
        retryRef.current = { content, key: idempotencyKey }; setDraft(content);
        const message = error instanceof Error ? error.message : 'Não consegui conectar à Néia agora. Tente novamente.';
        setMessages((items) => [...items.filter((item) => item.id !== assistantId), { id: Date.now() + 1, role: 'assistant', text: `${message} Sua mensagem foi preservada.`, time: 'Agora', status: 'error' }]);
      } finally { setTyping(false); }
    })();
  };
  const onSubmit = (event: FormEvent) => { event.preventDefault(); send(); };
  const onKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(); } };
  const acceptPrivacy = () => { try { sessionStorage.setItem(consentKey, 'accepted'); sessionStorage.setItem(legacyConsentKey, 'accepted'); } catch { /* A sessão continua válida apenas em memória. */ } setPrivacyAccepted(true); setApiStatus('loading'); };
  const newChat = async () => {
    setShowMenu(false); setDraft(''); retryRef.current = null;
    if (!tokenRef.current) return;
    const response = await fetch(apiPath('/api/v1/conversations'), { method: 'POST', headers: visitorHeaders(tokenRef.current) });
    if (!response.ok) return;
    const payload: { conversation: { id: string } } = await response.json();
    conversationRef.current = payload.conversation.id; if (!embedded) writeSessionValue('neia-conversation', 'nepi-conversation', conversationRef.current);
    setMessages([{ ...initialMessage, id: Date.now() }]);
  };
  const deleteConversation = async () => {
    if (!tokenRef.current || !conversationRef.current) return;
    const response = await fetch(apiPath(`/api/v1/conversations/${conversationRef.current}`), { method: 'DELETE', headers: visitorHeaders(tokenRef.current) });
    if (!response.ok) return;
    setConfirmDelete(false); await newChat();
  };
  const shareChat = async () => { try { await navigator.clipboard.writeText(window.location.href); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { setShowMenu(false); } };

  const closeConversation = () => { if (embedded) window.parent.postMessage({ type: `${bridge}:close` }, hostOriginRef.current); else void newChat(); };
  const minimizeConversation = () => { if (embedded) window.parent.postMessage({ type: `${bridge}:minimize` }, hostOriginRef.current); else setMinimized(!minimized); };
  return <main className={`page-shell ${embedded ? 'embed-mode' : ''}`}>
    <div className="ambient ambient-one"/><div className="ambient ambient-two"/>
    <header className="site-header">
      <a href="#inicio" className="brand" aria-label="Néia, início"><img src="/neia-identidade-original.png" alt=""/><span>Néia</span></a>
      <div className="header-right"><span className="header-label"><span className="status-dot"/> Inteligência Artificial da FUNEP</span><button className="icon-button mobile-menu" aria-label="Abrir opções" onClick={() => setShowMenu(!showMenu)}><Menu size={20}/></button></div>
    </header>
    <section className="experience" id="inicio">
      <div className="intro-copy">
        <div className="eyebrow"><Sparkles size={15}/> CONHEÇA A NÉIA</div>
        <h1>Uma conversa<br/>que aproxima.</h1>
        <p>Encontre um caminho para suas dúvidas sobre a FUNEP. A Néia está aqui para ouvir e ajudar você.</p>
        <div className="intro-note"><div className="note-icon"><MessageCircle size={19}/></div><div><strong>Atendimento em um só lugar</strong><span>Comece uma conversa quando quiser.</span></div></div>
        <div className="trust-note"><span className="trust-mark"/> Uma experiência digital da FUNEP</div>
      </div>

      <section className={`chat-card ${minimized ? 'is-minimized' : ''}`} aria-label="Conversa com a Néia">
        <div className="chat-header">
          <div className="avatar-wrap"><img src="/neia-identidade-original.png" alt="" className="avatar"/><span className="online-dot"/></div>
          <div className="chat-identity"><strong>Néia</strong><span>Inteligência Artificial da FUNEP</span></div>
          <div className="chat-actions">
            <button className="icon-button" aria-label="Nova conversa" title="Nova conversa" onClick={() => void newChat()} disabled={apiStatus !== 'ready'}><Plus size={20}/></button>
            <button className="icon-button menu-trigger" aria-label="Mais opções" title="Mais opções" onClick={() => setShowMenu(!showMenu)}><MoreHorizontal size={21}/></button>
            <button className="icon-button minimize-button" aria-label={minimized ? 'Expandir conversa' : 'Minimizar conversa'} title={minimized ? 'Expandir' : 'Minimizar'} onClick={minimizeConversation}><span className="minus-mark"/></button>
            <button className="icon-button close-button" aria-label={embedded ? 'Fechar conversa' : 'Limpar conversa'} title={embedded ? 'Fechar conversa' : 'Limpar conversa'} onClick={closeConversation}><X size={20}/></button>
          </div>
          {showMenu && <div className="popup-menu"><button onClick={() => void newChat()}>Começar nova conversa</button><button onClick={() => void shareChat()}>{copied ? 'Link copiado!' : 'Copiar link desta página'}</button><button onClick={() => { setShowMenu(false); setConfirmDelete(true); }} disabled={apiStatus !== 'ready'}>Excluir conversa</button></div>}
        </div>
        {!minimized && <>
          <div className="chat-content" role="log" aria-label="Mensagens da conversa" aria-live="polite" aria-relevant="additions text" onScroll={(event) => { const el = event.currentTarget; setScrolled(el.scrollHeight - el.scrollTop - el.clientHeight > 100); }}>
            <div className="date-divider"><span>HOJE</span></div>
            {messages.map((message) => <div className={`message-row ${message.role}`} key={message.id}>
              {message.role === 'assistant' && <img className="message-avatar" src="/neia-identidade-original.png" alt="Néia"/>}
              <div className="message-stack"><div className="bubble">{message.text.split('\n').map((line, index) => line ? <React.Fragment key={index}>{line}<br/></React.Fragment> : <br key={index}/>)}</div><span className="message-time">{message.time}</span></div>
            </div>)}
            {messages.length === 1 && <div className="suggestions" aria-label="Sugestões de perguntas">{suggestions.map(({ icon: Icon, text }) => <button className="suggestion" key={text} onClick={() => send(text)}><span className="suggestion-icon"><Icon size={17}/></span><span>{text}</span><ChevronRight size={17} className="suggestion-arrow"/></button>)}</div>}
            {typing && <div className="message-row assistant"><img className="message-avatar" src="/neia-identidade-original.png" alt=""/><div className="bubble typing" aria-label="Néia está respondendo"><i/><i/><i/></div></div>}
            <div ref={endRef}/>
          </div>
          {scrolled && <button className="jump-bottom" aria-label="Ir para a mensagem mais recente" onClick={() => { setScrolled(false); endRef.current?.scrollIntoView({ behavior: 'smooth' }); }}><ArrowDown size={16}/></button>}
          <div className="composer-area"><form className="composer" onSubmit={onSubmit}><textarea ref={inputRef} value={draft} onChange={(event) => { setDraft(event.target.value); event.target.style.height = 'auto'; event.target.style.height = `${Math.min(event.target.scrollHeight, 112)}px`; }} onKeyDown={onKeyDown} rows={1} placeholder={apiStatus === 'offline' ? 'Conexão indisponível' : 'Digite sua mensagem...'} aria-label="Digite sua mensagem" maxLength={2000} disabled={apiStatus !== 'ready'}/><button className="send-button" aria-label="Enviar mensagem" type="submit" disabled={!draft.trim() || typing || apiStatus !== 'ready'}><ArrowUp size={19}/></button></form><div className="composer-caption"><span><span className="demo-indicator"/> {apiStatus === 'consent' ? 'Aguardando seu consentimento' : apiStatus === 'loading' ? 'Conectando...' : apiStatus === 'offline' ? 'Sem conexão com o servidor' : 'Modo de demonstração'}</span><span>Enter envia · Shift + Enter quebra linha</span></div></div>
          {!privacyAccepted && <div className="privacy-gate" role="dialog" aria-modal="true" aria-labelledby="privacy-title"><div className="privacy-card"><div className="privacy-symbol"><MessageCircle size={19}/></div><div className="eyebrow">ANTES DE COMEÇAR</div><h2 id="privacy-title">Sua conversa, com transparência.</h2><p>Esta versão demonstrativa armazena a conversa por até 30 dias para que você possa retomá-la. Evite compartilhar dados pessoais sensíveis. Ainda não há fontes oficiais conectadas.</p><button className="admin-primary" onClick={acceptPrivacy}>Concordar e começar <ChevronRight size={16}/></button><span className="privacy-footnote">Ao continuar, você aceita o armazenamento temporário desta conversa.</span></div></div>}
          {confirmDelete && <div className="privacy-gate" role="dialog" aria-modal="true" aria-labelledby="delete-title"><div className="privacy-card"><div className="eyebrow">EXCLUSÃO</div><h2 id="delete-title">Excluir esta conversa?</h2><p>As mensagens serão removidas e não poderão ser recuperadas.</p><div className="confirm-actions"><button className="admin-logout" onClick={() => setConfirmDelete(false)}>Cancelar</button><button className="admin-primary" onClick={() => void deleteConversation()}>Excluir conversa</button></div></div></div>}
        </>}
      </section>
    </section>
    <footer className="page-footer"><span>© FUNEP · Fundação de Apoio à Pesquisa, Ensino e Extensão</span><a href="https://www.funep.org.br" target="_blank" rel="noreferrer">Conheça a FUNEP <ChevronRight size={14}/></a></footer>
  </main>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode>{window.location.pathname.startsWith('/admin') ? <AdminApp/> : <App/>}</React.StrictMode>);
