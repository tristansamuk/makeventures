import { visit } from 'unist-util-visit';

const VIDEO_PATTERN = /{{< video "([^"]+)"(?:\s+"([^"]*)")? >}}/g;

function embedUrl(url) {
	const yt = url.match(
		/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/,
	);
	if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;

	const vm = url.match(/vimeo\.com\/(\d+)/);
	if (vm) return `https://player.vimeo.com/video/${vm[1]}`;

	return url;
}

export function remarkVideo() {
	return (tree) => {
		visit(tree, 'paragraph', (node, index, parent) => {
			const text = node.children
				.filter((c) => c.type === 'text')
				.map((c) => c.value)
				.join('');

			const match = VIDEO_PATTERN.exec(text.trim());
			VIDEO_PATTERN.lastIndex = 0;

			if (!match) return;

			const src = embedUrl(match[1]);
			const title = match[2] || 'Embedded video';

			parent.children[index] = {
				type: 'html',
				value: `<div class="youtube-embed"><iframe src="${src}" title="${title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`,
			};
		});
	};
}
