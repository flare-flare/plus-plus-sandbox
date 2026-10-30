const DEFAULT_URL = 'http://185.9.2.18/chid_205/index.m3u8';
const PLAYLIST_URL = 'https://iptv-org.github.io/iptv/index.m3u';
const MAX_SHOWN = 100;

await customElements.whenDefined('hlsjs-video');

const input = document.getElementById('url-input');
const list = document.getElementById('channels');
const player = document.getElementById('player');

let currentUrl;
let channels = [];
let loading = true;
let active = -1;

input.addEventListener('input', onInput);
input.addEventListener('focus', openList);
input.addEventListener('click', openList);
input.addEventListener('keydown', onKeyDown);
list.addEventListener('mousedown', onPick);
document.addEventListener('mousedown', (e) => {
  if (!e.target.closest('.input')) closeList();
});

input.value = DEFAULT_URL;
loadVideo(input.value);
loadChannels();

async function loadChannels() {
  try {
    const response = await fetch(PLAYLIST_URL);

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    channels = parsePlaylist(await response.text());
  }

  catch (error) {
    console.warn(`Could not load the channel list: ${error.message}`);
  }

  loading = false;

  if (!list.hidden) {
    renderList(input.dataset.filter ?? '');
  }
}

function parsePlaylist(text) {
  const entries = [];
  let info;

  for (const line of text.split(String.fromCharCode(10)).map((l) => l.trim())) {
    if (line.startsWith('#EXTINF:')) {
      info = parseInfo(line);
    }

    else if (line && !line.startsWith('#') && info && isValidUrl(line)) {
      const [base] = info.id.split('@');
      const country = base.includes('.') ? base.split('.').pop() : '';
      const name = info.name || line;

      entries.push({ name, country, url: line, search: `${name} ${info.id} ${line}`.toLowerCase() });
      info = undefined;
    }
  }

  return entries;
}

// The title follows the first comma outside quotes, since attributes such as
// http-user-agent="... (KHTML, like Gecko) ..." can contain commas themselves.
function parseInfo(line) {
  let quoted = false;
  let comma = -1;

  for (let i = 0; i < line.length && comma < 0; i++) {
    if (line[i] === '"') quoted = !quoted;
    else if (line[i] === ',' && !quoted) comma = i;
  }

  return {
    id: line.match(/tvg-id="([^"]*)"/)?.[1] ?? '',
    name: comma < 0 ? '' : line.slice(comma + 1).trim(),
  };
}

function renderList(filter = '') {
  const query = filter.toLowerCase();
  const matches = channels.filter((c) => c.search.includes(query));
  const items = matches.slice(0, MAX_SHOWN).map((channel) => {
    const item = document.createElement('li');
    const country = document.createElement('small');

    country.textContent = channel.country;
    item.role = 'option';
    item.append(channel.name, country);
    item.title = channel.url;
    item.dataset.url = channel.url;
    item.ariaSelected = String(channel.url === currentUrl);
    return item;
  });

  input.dataset.filter = filter;
  list.replaceChildren(...items);

  if (matches.length > MAX_SHOWN) {
    list.append(note(`Showing ${MAX_SHOWN} of ${matches.length.toLocaleString()}. Keep typing to narrow it down.`));
  }

  else if (loading) {
    list.append(note('Loading channels...'));
  }

  else if (matches.length === 0 && channels.length > 0) {
    list.append(note('No channel matches.'));
  }

  setActive(-1);
  return items.length;
}

function note(text) {
  const item = document.createElement('li');

  item.className = 'note';
  item.role = 'presentation';
  item.textContent = text;
  return item;
}

function openList() {
  renderList();
  list.hidden = list.children.length === 0;
}

function closeList() {
  list.hidden = true;
  setActive(-1);
}

function getOptions() {
  return [...list.querySelectorAll('li[role="option"]')];
}

function setActive(index) {
  active = index;

  const options = getOptions();

  options.forEach((item, i) => item.classList.toggle('active', i === index));
  options[index]?.scrollIntoView({ block: 'nearest' });
}

function selectChannel(url) {
  input.value = url;
  closeList();
  loadVideo(url);
}

function onPick(e) {
  const item = e.target.closest('li[role="option"]');

  if (item) {
    // Keep the input focused so clicking it again reopens the list.
    e.preventDefault();
    selectChannel(item.dataset.url);
  }
}

function onKeyDown(e) {
  const count = getOptions().length;

  if (e.key === 'Escape') {
    closeList();
  }

  else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();

    if (list.hidden) {
      openList();
    }

    if (count > 0) {
      const step = e.key === 'ArrowDown' ? 1 : -1;
      setActive((active + step + count) % count);
    }
  }

  else if (e.key === 'Enter' && active >= 0) {
    e.preventDefault();
    selectChannel(getOptions()[active].dataset.url);
  }
}

function loadVideo(url) {
  if (url === currentUrl) {
    return;
  }

  // Playback starts through the `autoplay` attribute once the stream is ready;
  // calling `play()` here would be interrupted by the load `src` kicks off.
  currentUrl = url;
  player.src = url;
}

function onInput(e) {
  const value = e.target.value.trim();

  // Typing narrows the channel list; a pasted stream URL still loads directly.
  renderList(value);
  list.hidden = list.children.length === 0;

  if (isValidUrl(value)) {
    loadVideo(value);
  }
}

function isValidUrl(url) {
  try {
    return ['http:', 'https:'].includes(new URL(url).protocol);
  }

  catch {
    return false;
  }
}
