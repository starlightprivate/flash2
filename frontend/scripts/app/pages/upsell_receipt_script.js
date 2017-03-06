(() => {
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
    window.location = 'index.html';
  }
  if (myOrderID === null) {
    // window.location = GlobalConfig.BasePagePath + "checkout.html";
    window.location = 'checkout.html';
    return;
  }
  function populateThanksPage(orderInfos) {
    let orderInfo = orderInfos;

    if ($.type(orderInfos) === 'array') {
      orderInfo = orderInfos[0];
    }
    $('#orderNumber').text(filterXSS(orderInfo.orderId));
    callAPI('get-trans', orderInfo.orderId, 'GET', (resp) => {
      if (resp.success) {
        if (resp.data) {
          const firstRow = resp.data[0];
          if (firstRow && firstRow.merchant) {
            $('#ccIdentity').text('&lt;br&gt;' + filterXSS(firstRow.merchant));
          } else {
            $('#ccIdentity').text('&lt;br&gt;Tactical Mastery');
          }
        }
      }
    });
  }
  callAPI('get-lead', myOrderID, 'GET', (resp) => {
    if (pageType === 'receipt') {
      if (resp.success) {
        populateThanksPage(resp.data);
      } else if (resp.message) {
        console.log('Error: ' + filterXSS(resp.message));
        // window.location = GlobalConfig.BasePagePath + "index.html";
        window.location = 'index.html';
      }
    } else if (resp.message && resp.message.data && resp.message.data[0]) {
      if (resp.message.data[0].orderStatus === 'COMPLETE') {
          // the order is complete and they are not on the success page
          // they can be on an upsell page up to an hour after the initial sale
        let doThatPop = true;
        if (pageType === 'upsell') {
          const gmtStr = filterXSS(resp.message.data[0].dateUpdated) + ' GMT-0400';
          const orderDate = new Date(gmtStr);
          const nowDate = new Date();
          const minutesSince = (nowDate - orderDate) / 1000 / 60;
          doThatPop = minutesSince > 55;
        }
        if (doThatPop) {
            // window.location = GlobalConfig.BasePagePath + "receipt.html";
          window.location = 'receipt.html';
        }
      }
    }
  });
})();
