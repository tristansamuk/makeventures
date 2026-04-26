// Project preview template — renders the right-hand preview pane in the CMS
// editor for entries in the 'projects' collection. Class names mirror those
// in preview.css. Field names (title, status, completedDate, heroImage) must
// match the 'projects' collection schema in config.yml.
// Decap globals used: CMS, createClass, h.

(() => {
  const { formatDate } = window.AdminHelpers;

  const ProjectPreview = createClass({
    render: function () {
      const { entry } = this.props;
      const title = entry.getIn(['data', 'title']) || '';
      const status = entry.getIn(['data', 'status']) || '';
      const dateStr = formatDate(entry.getIn(['data', 'completedDate']));
      const heroImage = this.props.widgetFor('heroImage');

      return h(
        'article',
        {},
        heroImage &&
          h(
            'div',
            { className: 'project-hero' },
            heroImage,
            h(
              'div',
              { className: 'hero-overlay' },
              h(
                'div',
                { className: 'hero-inner' },
                h('h1', { className: 'hero-title' }, title),
              ),
            ),
          ),
        !heroImage && h('h1', { className: 'project-title' }, title),
        h(
          'div',
          { className: 'project-meta-bar' },
          status &&
            h(
              'span',
              { className: `status-badge status-${status}` },
              status,
            ),
          dateStr && h('time', { className: 'meta-date' }, dateStr),
        ),
        h('div', {}, this.props.widgetFor('body')),
      );
    },
  });

  CMS.registerPreviewTemplate('projects', ProjectPreview);
})();
