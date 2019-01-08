/* eslint no-console:0 */

/**
 * Register the nohost service worker, passing `route`
 */
if(!('serviceWorker' in navigator)) {
  console.log('[nohost] unable to initialize service worker: not supported.');
} else {
  navigator.serviceWorker
    .register('./nohost-sw.js')
    .catch(err => {
      console.error(`[nohost] unable to register service worker: ${err.message}`);
    });
}
