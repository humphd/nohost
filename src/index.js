/**
 * Register the nohost service worker, passing `route`
 */
if(!('serviceWorker' in navigator)) {
  /* eslint no-console:0 */
  console.log('[nohost] unable to initialize service worker: not supported.');
} else {
  // TODO: make this something you can pass in via an api, init(route)
  // const route = 'filer';

  navigator.serviceWorker
    //    .register(`./nohost-sw.js?route=${encodeURIComponent(route)}`)
    .register('./nohost-sw.js')
    .catch(err => {
      console.error(`[nohost] unable to register service worker: ${err.message}`);
    });
}
