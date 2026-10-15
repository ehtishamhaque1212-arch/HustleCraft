const form = document.getElementById('listing-form');
const emptyState = document.getElementById('empty-state');
const resultContent = document.getElementById('result-content');
const loadingState = document.getElementById('loading-state');
const modeBadge = document.getElementById('mode-badge');
const OLLAMA_URL = 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = 'llama3.2';

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  data.product = (data.product || '').trim();
  data.details = (data.details || '').trim();
  data.audience = (data.audience || '').trim();
  if (!data.product) { document.getElementById('product').focus(); return; }
  showLoading(true);
  try {
    if (document.getElementById('use-local-ai').checked) {
      renderResult(await generateWithLocalAI(data), 'LOCAL OLLAMA AI');
    } else {
      await new Promise(resolve => setTimeout(resolve, 250));
      renderResult(makeDemoListing(data), 'INSTANT DEMO');
    }
  } catch (error) {
    renderResult(makeDemoListing(data), 'DEMO FALLBACK');
    document.getElementById('app-notice').textContent = `Could not connect to Ollama (${error.message}). Showing demo output instead.`;
  } finally { showLoading(false); }
});

async function generateWithLocalAI(data) {
  const prompt = `You are an ecommerce copywriter for small independent sellers. Write in ${data.language}. Do not invent product facts. Brand voice: ${data.tone}. Platform: ${data.platform}. Ideal customer: ${data.audience || 'general shoppers'}. Product: ${data.product}. Details: ${data.details || 'No extra details supplied'}. Return ONLY valid JSON with keys title (string, max 140 characters), description (string, 2 short paragraphs and a gentle call to action), tags (array of 8 short search keywords).`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);
  try {
    const response = await fetch(OLLAMA_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: OLLAMA_MODEL, prompt, stream: false, format: 'json' }), signal: controller.signal });
    if (!response.ok) throw new Error(`Ollama returned HTTP ${response.status}`);
    const payload = await response.json();
    const parsed = JSON.parse(payload.response);
    if (!parsed.title || !parsed.description || !Array.isArray(parsed.tags)) throw new Error('The model returned an unexpected response');
    return parsed;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('request timed out; check that the model is downloaded and running');
    if (error instanceof TypeError) throw new Error('connection blocked. Check Ollama is running and browser access is enabled');
    throw error;
  } finally { clearTimeout(timeout); }
}

function makeDemoListing(data) {
  const product = data.product.trim(), details = data.details.trim();
  const audience = data.audience.trim() || 'anyone who appreciates thoughtful finds';
  const tone = data.tone || 'Warm & friendly', language = data.language || 'English';
  const voice = tone === 'Premium & elegant' ? 'A considered choice for those who value quality and thoughtful design.' : tone === 'Playful & bold' ? 'Meet your new favourite find — full of character and ready to stand out.' : tone === 'Minimal & clear' ? 'Simple, useful, and made to fit naturally into your everyday routine.' : 'A little something to make everyday moments feel more special.';
  let title = `${product} | Thoughtful Find for Everyday Living`;
  let description = `${voice}\n\n${details ? details + '\n\n' : ''}Created for ${audience}. Explore the details and see if it is the right fit for you.`;
  if (language === 'Hindi') { title = `${product} | Aapke liye khaas`; description = `${product} ko apni everyday life ka hissa banayein.\n\n${details ? details + '\n\n' : ''}${audience} ke liye ek thoughtful choice. Aaj hi details dekhein.`; }
  else if (language === 'Hinglish') { title = `${product} | Everyday ka special find`; description = `${voice}\n\n${details ? details + '\n\n' : ''}${audience} ke liye ek thoughtful choice. Details dekho aur apna favourite choose karo.`; }
  else if (language === 'Spanish') { title = `${product} | Un detalle especial`; description = `${voice}\n\n${details ? details + '\n\n' : ''}Pensado para ${audience}. Descubre los detalles y encuentra si es ideal para ti.`; }
  const words = product.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  return { title: title.slice(0, 140), description, tags: [...new Set([...words, 'small business', 'gift idea', 'thoughtful gift', 'everyday find', (data.platform || 'online shop').toLowerCase()])].slice(0, 8) };
}

function renderResult(result, mode) {
  document.getElementById('out-title').textContent = String(result.title || 'Product listing');
  document.getElementById('out-description').textContent = String(result.description || '');
  const tags = document.getElementById('out-tags'); tags.replaceChildren();
  (Array.isArray(result.tags) ? result.tags : []).slice(0, 10).forEach(tag => { const chip = document.createElement('span'); chip.className = 'tag'; chip.textContent = String(tag).replace(/^#/, ''); tags.appendChild(chip); });
  modeBadge.textContent = mode;
  const isAI = mode.startsWith('LOCAL'); modeBadge.style.color = isAI ? '#258b68' : '#8a6ac2'; modeBadge.style.background = isAI ? '#e7f8f0' : '#f3edff';
  emptyState.classList.add('hidden'); resultContent.classList.remove('hidden');
  if (mode !== 'DEMO FALLBACK') document.getElementById('app-notice').textContent = isAI ? 'Generated locally with Ollama. Your prompt is sent to the Ollama service on this computer.' : 'Instant demo mode uses a built-in template. Turn on Local Ollama AI to generate with your downloaded model.';
}
function showLoading(isLoading) {
  const button = form.querySelector('.generate-btn'); button.disabled = isLoading; button.style.opacity = isLoading ? '.7' : '1';
  button.querySelector('.button-label').textContent = isLoading ? 'Working…' : 'Generate my listing';
  if (isLoading) { emptyState.classList.add('hidden'); resultContent.classList.add('hidden'); loadingState.classList.remove('hidden'); } else loadingState.classList.add('hidden');
}
function getAllOutput() {
  const tags = [...document.querySelectorAll('#out-tags .tag')].map(el => el.textContent).join(', ');
  return `TITLE\n${document.getElementById('out-title').textContent}\n\nDESCRIPTION\n${document.getElementById('out-description').textContent}\n\nTAGS\n${tags}`;
}
async function copyText(text, button) {
  const original = button.textContent;
  try {
    if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
    else { const area = document.createElement('textarea'); area.value = text; area.style.position = 'fixed'; area.style.opacity = '0'; document.body.appendChild(area); area.select(); const copied = document.execCommand('copy'); area.remove(); if (!copied) throw new Error('Copy failed'); }
    button.textContent = 'COPIED ✓';
  } catch { button.textContent = 'SELECT AND COPY'; window.prompt('Copy this text:', text); }
  setTimeout(() => { button.textContent = original; }, 1600);
}
document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', () => {
  const target = document.getElementById(button.dataset.copy);
  copyText(target.id === 'out-tags' ? [...target.querySelectorAll('.tag')].map(tag => tag.textContent).join(', ') : target.textContent, button);
}));
document.getElementById('copy-all').addEventListener('click', event => copyText(getAllOutput(), event.currentTarget));
document.getElementById('start-over').addEventListener('click', () => {
  form.reset(); resultContent.classList.add('hidden'); emptyState.classList.remove('hidden');
  document.getElementById('app-notice').textContent = 'Ready. Demo mode works without an AI installation.';
  modeBadge.textContent = 'INSTANT DEMO'; document.getElementById('product').focus();
});
