/* global $, DOMPurify, jQuery, utils, UniversalStorage */
// eslint-disable-file babel/no-invalid-this

const requireAssets = [
  'https://cdn.jsdelivr.net/g/jquery@3.1.1,js-cookie@2.2.0,tether@1.3.7,bootstrap@4.0.0-alpha.5,jquery.mask@1.14.0,mailcheck@1.1,mobile-detect.js@1.3.4',
  '/tacticalsales/assets/js/libs.js',
];

const batteryHeadlamp = () => {
  const utilsInstance = utils();
  function init() {
    let upsellID = null;
    if (window.location.pathname.indexOf('us_batteryoffer') >= 0) {
      upsellID = 'battery';
    } else if (window.location.pathname.indexOf('us_headlampoffer') >= 0) {
      upsellID = 'headlamp';
    }
    if (upsellID === null) {
      // Not an upsell page
      return;
    }
    const MediaStorage = UniversalStorage.getCheckoutDetails();
    if (typeof MediaStorage.orderId === 'undefined') {
      window.location = 'index.html';
    }
    // Upsell functions
    function doUpsellYes(sellID, productId) {
      const $loadingBar = $('div.js-div-loading-bar');
      $loadingBar.show();
      const usParams = {};
      let productIdForUserParams = {};
      if (MediaStorage.orderId) {
        usParams.orderId = DOMPurify.sanitize(MediaStorage.orderId);
        usParams.productQty = 1;

        switch (sellID) {
        case 'headlamp':
          productIdForUserParams = productId || '31';
          break;
        case 'battery':
          productIdForUserParams = productId || '11';
          break;
        default:
          break;
        }

        if (productIdForUserParams) {
          usParams.productId = DOMPurify.sanitize(productIdForUserParams);
          let nextPage = `receipt.html?orderId=${DOMPurify.sanitize(MediaStorage.orderId)}`;
          if (sellID === 'battery') {
            nextPage = `us_headlampoffer.html?orderId=${DOMPurify.sanitize(MediaStorage.orderId)}`;
          }
          utilsInstance.callAPI('upsell', usParams, 'POST', (e) => {
            const json = utilsInstance.getJson(e);
            if (json.success) {
              utilsInstance.storeSessionToServer(UniversalStorage.getCheckoutDetails(), () => {
                utilsInstance.wrapLocationChange(nextPage);
              });
            } else if (json.message) {
              let messageOut = '';
              if (typeof json.message === 'string') {
                messageOut = json.message;
                if (messageOut === 'This upsale was already taken.') {
                  utilsInstance.storeSessionToServer(UniversalStorage.getCheckoutDetails(), () => {
                    utilsInstance.wrapLocationChange(nextPage);
                  });
                  return;
                }
              } else {
                const messages = Object.keys(json.message).map(key => `${DOMPurify.sanitize(key)}:${DOMPurify.sanitize(json.message[key])}&lt;br&gt;`);
                messageOut = messages.join('');
              }
              utilsInstance.bootstrapModal(DOMPurify.sanitize(messageOut), 'Problem with your Addon');
            }
            $loadingBar.hide();
          });
        }
      } else {
        utilsInstance.bootstrapModal('There was an error finding your order, please refresh the page and try again.', 'Error');
        $loadingBar.hide();
      }
    }
    function doUpsellNo(sellID) {
      $('div.js-div-loading-bar').show();
      let nextPage = `receipt.html?orderId=${DOMPurify.sanitize(MediaStorage.orderId)}`;
      if (sellID === 'battery') {
        nextPage = `us_headlampoffer.html?orderId=${DOMPurify.sanitize(MediaStorage.orderId)}`;
      }
      utilsInstance.storeSessionToServer(UniversalStorage.getCheckoutDetails(), () => {
        utilsInstance.wrapLocationChange(nextPage);
      });
    }
    $('#upsellNo').click(() => {
      doUpsellNo(upsellID);
    });
    $('.doupsellyes').click(() => {
      doUpsellYes(upsellID, DOMPurify.sanitize($(this).data('productid')));
    });
  }
  utilsInstance.initSessionIfNoCookies(() => {
    if (!UniversalStorage.cookiesEnabled) {
      utilsInstance.callAPI('session', null, 'GET', (response) => {
        if (response.success) {
          UniversalStorage.saveCheckoutDetails(response.data);
        }
        init();
      });
    } else {
      init();
    }
  });
};

/*eslint-disable */
const loadBatteryHeadlampAssets=function(){function n(n,e){n=n.push?n:[n];var t,r,i,o,c=[],s=n.length,h=s;for(t=function(n,t){t.length&&c.push(n),h--,h||e(c)};s--;)r=n[s],i=u[r],i?t(r,i):(o=f[r]=f[r]||[],o.push(t))}function e(n,e){if(n){var t=f[n];if(u[n]=e,t)for(;t.length;)t[0](n,e),t.splice(0,1)}}function t(n,e,r,i){var c,u,f=document,s=r.async,h=(r.numRetries||0)+1,a=r.before||o;i=i||0,/\.css$/.test(n) || /\.css\)$/.test(n) ?(c=!0,u=f.createElement("link"),u.rel="stylesheet",u.href=n):(u=f.createElement("script"),u.src=n,u.async=void 0===s||s),u.onload=u.onerror=u.onbeforeload=function(o){var f=o.type[0];if(c&&"hideFocus"in u)try{u.sheet.cssText.length||(f="e")}catch(n){f="e"}return"e"==f&&(i+=1,i<h)?t(n,e,r,i):void e(n,f,o.defaultPrevented)},a(n,u),f.head.appendChild(u)}function r(n,e,r){n=n.push?n:[n];var i,o,c=n.length,u=c,f=[];for(i=function(n,t,r){if("e"==t&&f.push(n),"b"==t){if(!r)return;f.push(n)}c--,c||e(f)},o=0;o<u;o++)t(n[o],i,r)}function i(n,t,i){var u,f;if(t&&t.trim&&(u=t),f=(u?i:t)||{},u){if(u in c)throw"LoadJS";c[u]=!0}r(n,function(n){n.length?(f.error||o)(n):(f.success||o)(),e(u,n)},f)}var o=function(){},c={},u={},f={};return i.ready=function(e,t){return n(e,function(n){n.length?(t.error||o)(n):(t.success||o)()}),i},i.done=function(n){e(n,[])},i.reset=function(){c={},u={},f={}},i.isDefined=function(n){return n in c},i}();
/*eslint-enable */

loadBatteryHeadlampAssets(requireAssets, {
  success: () => batteryHeadlamp(),
  async: false,
});
