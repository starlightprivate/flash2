/* global $, DOMPurify, jQuery, utils, UniversalStorage */
(() => {
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
      utilsInstance.callAPI('get-trans', orderId, 'GET', (resp) => {
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
    utilsInstance.callAPI('get-lead', DOMPurify.sanitize(myOrderID), 'GET', (resp) => {
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
})();
