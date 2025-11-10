function getCookie(name) {
   const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
   return match ? match[2] : null;
}

const originalFetch = window.fetch;
window.fetch = async (...args) => {
   let [url, options = {}] = args;
   const userId = getCookie('userId');

   options.headers = options.headers || {};
   if (userId) {
   options.headers['x-user-id'] = userId;
   }

   return originalFetch(url, options);
};