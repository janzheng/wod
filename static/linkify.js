function _linkify(text) {
  if (!text) return '';
  return text.replace(/(https?:\/\/[^\s<]+)/g, function(m) {
    return '<a href="' + m + '" target="_blank" rel="noopener">' + m + '</a>';
  });
}
