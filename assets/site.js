const POSTS_INDEX = './posts/index.json';

function qs(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}

function isPublished(post) {
  const now = new Date();
  const publishAt = new Date(post.publishAt);
  return !Number.isNaN(publishAt.getTime()) && publishAt <= now;
}

async function loadIndex() {
  const res = await fetch(POSTS_INDEX, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load ${POSTS_INDEX}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

function renderList(targetEl, posts) {
  if (!posts.length) {
    targetEl.innerHTML = '<p class="muted">No published posts yet.</p>';
    return;
  }

  targetEl.innerHTML = posts
    .map(p => {
      const href = `./post.html?id=${encodeURIComponent(p.id)}`;
      const meta = `${formatDate(p.publishAt)}${p.summary ? ' · ' + p.summary : ''}`;
      return `
        <div class="item">
          <p class="item-title"><a href="${href}">${escapeHtml(p.title)}</a></p>
          <p class="item-meta muted">${escapeHtml(meta)}</p>
        </div>
      `;
    })
    .join('');
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function renderLatestPosts({ targetId, limit = 5 }) {
  const el = document.getElementById(targetId);
  if (!el) return;

  try {
    const posts = await loadIndex();
    const published = posts
      .filter(isPublished)
      .sort((a, b) => new Date(b.publishAt) - new Date(a.publishAt))
      .slice(0, limit);
    renderList(el, published);
  } catch (e) {
    el.innerHTML = `<p class="muted">Couldn’t load posts.</p>`;
  }
}

async function renderAllPosts({ targetId }) {
  const el = document.getElementById(targetId);
  if (!el) return;

  try {
    const posts = await loadIndex();
    const published = posts
      .filter(isPublished)
      .sort((a, b) => new Date(b.publishAt) - new Date(a.publishAt));
    renderList(el, published);
  } catch (e) {
    el.innerHTML = `<p class="muted">Couldn’t load posts.</p>`;
  }
}

async function renderPostFromQuery() {
  const id = qs('id');
  const titleEl = document.getElementById('title');
  const metaEl = document.getElementById('meta');
  const contentEl = document.getElementById('content');
  const notPubEl = document.getElementById('not-published');

  if (!id) {
    titleEl.textContent = 'Missing post id';
    return;
  }

  try {
    const posts = await loadIndex();
    const post = posts.find(p => p.id === id);
    if (!post) {
      titleEl.textContent = 'Post not found';
      return;
    }

    const preview = qs('preview') === '1';
    const published = isPublished(post);

    titleEl.textContent = post.title;
    metaEl.textContent = formatDate(post.publishAt);

    if (!published && !preview) {
      notPubEl.hidden = false;
      contentEl.innerHTML = '';
      return;
    }

    const res = await fetch(`./posts/${post.file}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load markdown');
    const md = await res.text();

    // marked is provided via CDN in post.html
    contentEl.innerHTML = window.marked.parse(md);
  } catch (e) {
    titleEl.textContent = 'Couldn’t load post';
  }
}

// Make functions available to non-module scripts
window.renderLatestPosts = renderLatestPosts;
window.renderAllPosts = renderAllPosts;
window.renderPostFromQuery = renderPostFromQuery;
