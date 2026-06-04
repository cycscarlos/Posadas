(function() {
  var token = document.querySelector('meta[name="csrf-token"]');
  if (!token) return;
  var csrfToken = token.getAttribute('content');

  document.addEventListener('submit', function(e) {
    var form = e.target;
    if (form.tagName !== 'FORM') return;
    if (form.querySelector('input[name="_csrf"]')) return;
    var input = document.createElement('input');
    input.type = 'hidden';
    input.name = '_csrf';
    input.value = csrfToken;
    form.appendChild(input);
  }, true);

  var origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function() {
    origOpen.apply(this, arguments);
    this.setRequestHeader('X-CSRF-Token', csrfToken);
  };

  var origFetch = window.fetch;
  if (origFetch) {
    window.fetch = function(url, opts) {
      opts = opts || {};
      opts.headers = opts.headers || {};
      if (opts.method && ['POST', 'PUT', 'PATCH', 'DELETE'].indexOf(opts.method.toUpperCase()) !== -1) {
        opts.headers['X-CSRF-Token'] = csrfToken;
      }
      return origFetch.call(window, url, opts);
    };
  }
})();
