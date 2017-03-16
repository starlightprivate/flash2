/* global $, DOMPurify, jQuery, callAPI, UniversalStorage */
/* global customWrapperForIsMobileDevice, bootstrapModal, getJson */
// eslint-disable-file babel/no-invalid-this
(() => {
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
        callAPI('upsell', usParams, 'POST', (e) => {
          const json = getJson(e);
          if (json.success) {
            window.location = nextPage;
          } else if (json.message) {
            let messageOut = '';
            if (typeof json.message === 'string') {
              messageOut = json.message;
              if (messageOut === 'This upsale was already taken.') {
                window.location = nextPage;
                return;
              }
            } else {
              const messages = Object.keys(json.message).map(key => `${DOMPurify.sanitize(key)}:${DOMPurify.sanitize(json.message[key])}&lt;br&gt;`);
              messageOut = messages.join('');
            }
            bootstrapModal(DOMPurify.sanitize(messageOut), 'Problem with your Addon');
          }
          $loadingBar.hide();
        });
      }
    } else {
      bootstrapModal('There was an error finding your order, please refresh the page and try again.', 'Error');
      $loadingBar.hide();
    }
  }
  function doUpsellNo(sellID) {
    $('div.js-div-loading-bar').show();
    let nextPage = `receipt.html?orderId=${DOMPurify.sanitize(MediaStorage.orderId)}`;
    if (sellID === 'battery') {
      nextPage = `us_headlampoffer.html?orderId=${DOMPurify.sanitize(MediaStorage.orderId)}`;
    }
    window.location = nextPage;
  }
  $('#upsellNo').click(() => {
    doUpsellNo(upsellID);
  });
  $('.doupsellyes').click(() => {
    doUpsellYes(upsellID, DOMPurify.sanitize($(this).data('productid')));
  });
})();
