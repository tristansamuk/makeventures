// Markdown editor component that adds a "Video" button to the toolbar.
// Produces and parses the {{< video "url" "title" >}} shortcode that
// src/plugins/remark-video.mjs converts into a responsive iframe at build
// time. The toBlock/fromBlock pair must stay in sync with the regex in
// remark-video.mjs.

(() => {
  const { videoEmbedUrl } = window.AdminHelpers;

  CMS.registerEditorComponent({
    id: 'video',
    label: 'Video',
    fields: [
      { name: 'url', label: 'YouTube or Vimeo URL', widget: 'string' },
      {
        name: 'title',
        label: 'Title (optional)',
        widget: 'string',
        required: false,
      },
    ],
    pattern: /{{< video ["“”]([^"“”]+)["“”](?:\s+["“”]([^"“”]*)["“”])? >}}/,
    fromBlock: (match) => ({ url: match[1], title: match[2] || '' }),
    toBlock: (data) =>
      data.title
        ? `{{< video "${data.url}" "${data.title}" >}}`
        : `{{< video "${data.url}" >}}`,
    toPreview: (data) => {
      const src = videoEmbedUrl(data.url || '');
      return `<div style="position:relative;aspect-ratio:16/9"><iframe src="${src}" style="position:absolute;inset:0;width:100%;height:100%;border:none" allowfullscreen></iframe></div>`;
    },
  });
})();
