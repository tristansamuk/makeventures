// Blog preview template — renders the right-hand preview pane in the CMS
// editor for entries in the 'blog' collection. Class names mirror those in
// preview.css. Field names (title, description, author, pubDate, tags,
// heroImage) must match the 'blog' collection schema in config.yml.
// Decap globals used: CMS, createClass, h.

(() => {
  const { formatDate } = window.AdminHelpers;

  const BlogPreview = createClass({
    render: function () {
      const { entry } = this.props;
      const title = entry.getIn(['data', 'title']) || '';
      const description = entry.getIn(['data', 'description']) || '';
      const author = entry.getIn(['data', 'author']) || '';
      const dateStr = formatDate(entry.getIn(['data', 'pubDate']));
      const tags = entry.getIn(['data', 'tags']);
      const heroImage = this.props.widgetFor('heroImage');
      const tagNodes =
        tags && tags.size > 0
          ? tags
              .map((tag) =>
                h('span', { key: tag, className: 'tag' }, `#${tag}`),
              )
              .toArray()
          : null;

      return h(
        'article',
        {},
        heroImage && h('div', { className: 'hero-image' }, heroImage),
        h(
          'div',
          { className: 'post-meta' },
          dateStr && h('time', { className: 'post-date' }, dateStr),
          author && h('span', { className: 'post-author' }, `by ${author}`),
        ),
        h('h1', { className: 'post-title' }, title),
        description &&
          h('p', { className: 'post-description' }, description),
        tagNodes && h('div', { className: 'post-tags' }, tagNodes),
        h('hr'),
        h('div', {}, this.props.widgetFor('body')),
      );
    },
  });

  CMS.registerPreviewTemplate('blog', BlogPreview);
})();
