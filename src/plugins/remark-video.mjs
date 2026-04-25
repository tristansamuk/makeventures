import { visit } from 'unist-util-visit';

// Accept straight (") and curly (“ / ”) quotes — Astro's default
// markdown.smartypants rewrites straight quotes before this plugin runs.
const VIDEO_PATTERN =
	/{{< video ["“”]([^"“”]+)["“”](?:\s+["“”]([^"“”]*)["“”])? >}}/;

function escapeAttr(str) {
	return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function embedUrl(url) {
	const yt = url.match(
		/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/,
	);
	if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;

	const vm = url.match(/vimeo\.com\/(\d+)/);
	if (vm) return `https://player.vimeo.com/video/${vm[1]}`;

	return null;
}

// Recursively collect text from a node tree. Needed because GFM autolinks
// bare URLs into `link` nodes, splitting the shortcode across siblings.
function collectText(node) {
	if (node.type === 'text') return node.value;
	if (node.children) return node.children.map(collectText).join('');
	return '';
}

export function remarkVideo() {
	return (tree) => {
		visit(tree, 'paragraph', (node, index, parent) => {
			const text = node.children.map(collectText).join('');

			const match = VIDEO_PATTERN.exec(text.trim());
			if (!match) return;

			const src = embedUrl(match[1]);
			if (!src) return;

			const title = escapeAttr(match[2] || 'Embedded video');

			parent.children[index] = {
				type: 'html',
				value: `<div class="video-embed"><iframe src="${src}" title="${title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`,
			};
		});
	};
}
