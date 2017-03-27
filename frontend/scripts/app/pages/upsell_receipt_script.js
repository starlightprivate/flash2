/* global $, DOMPurify, jQuery, utils, UniversalStorage */

const requireLibs = [
  'https://cdn.jsdelivr.net/g/jquery@3.1.1,js-cookie@2.2.0,tether@1.3.7,bootstrap@4.0.0-alpha.5,jquery.mask@1.14.0,mailcheck@1.1,mobile-detect.js@1.3.4',
  '/tacticalsales/assets/js/libs.js',
];

const upsellReceipt = () => {
  const utilsInstance = utils();
  const init = () => {
    let pageType = null;
    if (window.location.pathname.indexOf('receipt') >= 0) {
      pageType = 'receipt';
    } else if (window.location.pathname.indexOf('us_batteryoffer') >= 0 || window.location.pathname.indexOf('us_headlampoffer') >= 0) {
      pageType = 'upsell';
    }
    if (pageType === null) {
      // Not "upsell" or "receipt" page
      return;
    }
    const myOrderID = UniversalStorage.getOrderId();
    // FIXME: Is this the right logic to redirect?
    if (typeof myOrderID === 'undefined') {
      // window.location = GlobalConfig.BasePagePath + "index.html";
      window.location = 'tacticalsales/index.html';
    }
    if (myOrderID === null) {
      // window.location = GlobalConfig.BasePagePath + "checkout.html";
      window.location = 'tacticalsales/checkout.html';
      return;
    }
    /* if (UniversalStorage.getStorageItem(myOrderID)) {
      window.location = 'index.html';
    } else if (!UniversalStorage.cookiesEnabled) {
      utilsInstance.callAPI('/session', );
    } else {
      UniversalStorage.saveStorageItem(myOrderID, true);
    }*/
    function populateThanksPage(orderInfos) {
      let orderInfo = orderInfos;
      if ($.type(orderInfos) === 'array') {
        orderInfo = orderInfos[0];
      }

      const orderId = DOMPurify.sanitize(orderInfo.orderId);
      $('#orderNumber').text(orderId);
      utilsInstance.callAPI(`get-trans/${orderId}`, null, 'GET', (resp) => {
        if (resp.success) {
          if (resp.data) {
            const firstRow = resp.data[0];
            if (firstRow && firstRow.merchant) {
              $('#ccIdentity').text(DOMPurify.sanitize(firstRow.merchant));
            } else {
              $('#ccIdentity').text('Tactical Mastery');
            }
          }
        }
      });
    }
    utilsInstance.callAPI(`get-lead/${DOMPurify.sanitize(myOrderID)}`, null, 'GET', (resp) => {
      if (pageType === 'receipt') {
        if (resp.success) {
          populateThanksPage(resp.data);
        } else if (resp.message) {
          // window.location = GlobalConfig.BasePagePath + "index.html";
          window.location = 'index.html';
        }
      } else if (resp.message && resp.message.data && resp.message.data[0]) {
        if (resp.message.data[0].orderStatus === 'COMPLETE') {
            // the order is complete and they are not on the success page
            // they can be on an upsell page up to an hour after the initial sale
          let doThatPop = true;
          if (pageType === 'upsell') {
            const gmtStr = `${DOMPurify.sanitize(resp.message.data[0].dateUpdated)} GMT-0400`;
            const orderDate = new Date(gmtStr);
            const nowDate = new Date();
            const minutesSince = (nowDate - orderDate) / 1000 / 60;
            doThatPop = minutesSince > 55;
          }
          if (doThatPop) {
            // window.location = GlobalConfig.BasePagePath + "receipt.html";
            utilsInstance.storeSessionToServer(UniversalStorage.getCheckoutDetails(), () => {
              utilsInstance.wrapLocationChange('receipt.html');
            });
          }
        }
      }
    });
  };
  utilsInstance.initSessionIfNoCookies(() => {
    if (!UniversalStorage.cookiesEnabled) {
      utilsInstance.callAPI('session', null, 'GET', (response) => {
        if (response.success) {
          UniversalStorage.saveCheckoutDetails(response.data);
          init();
        }
      });
    } else {
      init();
    }
  });
};

/*eslint-disable */
var loadjs=function(){function n(n,e){n=n.push?n:[n];var t,r,i,o,c=[],s=n.length,h=s;for(t=function(n,t){t.length&&c.push(n),h--,h||e(c)};s--;)r=n[s],i=u[r],i?t(r,i):(o=f[r]=f[r]||[],o.push(t))}function e(n,e){if(n){var t=f[n];if(u[n]=e,t)for(;t.length;)t[0](n,e),t.splice(0,1)}}function t(n,e,r,i){var c,u,f=document,s=r.async,h=(r.numRetries||0)+1,a=r.before||o;i=i||0,/\.css$/.test(n) || /\.css\)$/.test(n) ?(c=!0,u=f.createElement("link"),u.rel="stylesheet",u.href=n):(u=f.createElement("script"),u.src=n,u.async=void 0===s||s),u.onload=u.onerror=u.onbeforeload=function(o){var f=o.type[0];if(c&&"hideFocus"in u)try{u.sheet.cssText.length||(f="e")}catch(n){f="e"}return"e"==f&&(i+=1,i<h)?t(n,e,r,i):void e(n,f,o.defaultPrevented)},a(n,u),f.head.appendChild(u)}function r(n,e,r){n=n.push?n:[n];var i,o,c=n.length,u=c,f=[];for(i=function(n,t,r){if("e"==t&&f.push(n),"b"==t){if(!r)return;f.push(n)}c--,c||e(f)},o=0;o<u;o++)t(n[o],i,r)}function i(n,t,i){var u,f;if(t&&t.trim&&(u=t),f=(u?i:t)||{},u){if(u in c)throw"LoadJS";c[u]=!0}r(n,function(n){n.length?(f.error||o)(n):(f.success||o)(),e(u,n)},f)}var o=function(){},c={},u={},f={};return i.ready=function(e,t){return n(e,function(n){n.length?(t.error||o)(n):(t.success||o)()}),i},i.done=function(n){e(n,[])},i.reset=function(){c={},u={},f={}},i.isDefined=function(n){return n in c},i}();
/*eslint-enable */

loadjs(requireLibs, {
  success: () => upsellReceipt(),
  async: false,
});
