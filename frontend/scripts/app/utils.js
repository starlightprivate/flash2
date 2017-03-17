/* global $, MobileDetect, jQuery, Cookies, UniversalStorage */
const md = new MobileDetect(window.navigator.userAgent);

function customWrapperForIsMobileDevice() { // eslint-disable-line no-unused-vars
  if (md.mobile() || md.phone() || md.tablet()) {
    return true;
  }
  return false;
}

function isJsonObj(obj) {
  return typeof obj === 'object';
}
// check if a string is a valid json data
function isValidJson(str) {
  if (str === '') {
    return false;
  }
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

function getJson(e) { // eslint-disable-line no-unused-vars
  let json = {};
  if (isJsonObj(e)) {
    json = e;
  } else if (isValidJson(e)) {
    json = JSON.parse(e);
  }
  return json;
}

function getUrlParameter(sParam) {
  const sPageURL = decodeURIComponent(window.location.search.substring(1));
  const sURLVariables = sPageURL.split('&');
  let sParameterName;
  let i;

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? true : sParameterName[1];
    }
  }
  return null;
}

function initSessionIfNoCookies(cb) { // eslint-disable-line no-unused-vars
  if (!UniversalStorage.cookiesEnabled) {
    const sessId = getUrlParameter('PHPSESSID');
    jQuery.ajax({
      type: 'GET',
      url: '/robots.txt',
      complete: (request) => {
        if (sessId) {
          UniversalStorage.saveStorageItem('PREVPHPSESSID', sessId);
        } else {
          UniversalStorage.saveStorageItem('PREVPHPSESSID', request.getResponseHeader('phpsessid'));
        }
        UniversalStorage.saveStorageItem('PHPSESSID', request.getResponseHeader('phpsessid'));
        UniversalStorage.saveStorageItem('XSRF-TOKEN', request.getResponseHeader('xsrf-token'));
        if (cb) {
          cb();
        }
      },
    });
  } else if (cb) {
    cb();
  }
}

// call API
function callAPI(endpoint, data, method, callback, err) {
  let params = data;
  let ApiUrl = `/api/v2/${endpoint}/`;
  let headers = {};
  const httpMethod = method || 'POST';
  // if data is an array pass as post,
  // otherwise the string is a simple get and needs to append to the end of the uri
  if (params && params.constructor !== Object) {
    ApiUrl += params;
    params = null;
  }

  if (!UniversalStorage.cookiesEnabled) {
    if (endpoint === 'session' && httpMethod === 'GET') {
      headers = { PHPSESSID: UniversalStorage.getStorageItem('PREVPHPSESSID'),
        //'XSRF-TOKEN': UniversalStorage.getStorageItem('XSRF-TOKEN'),
      };
    } else {
      headers = { PHPSESSID: UniversalStorage.getStorageItem('PHPSESSID'),
        //'XSRF-TOKEN': UniversalStorage.getStorageItem('XSRF-TOKEN'),
      };
    }
  }

  if (['PUT', 'POST', 'PATCH', 'DELETE'].indexOf(httpMethod) !== -1) {
    params._csrf = UniversalStorage.getStorageItem('XSRF-TOKEN'); // eslint-disable-line no-underscore-dangle
  }

  jQuery.ajax({
    method: httpMethod,
    url: ApiUrl,
    headers,
    data: params,
    complete: (request) => {
      const csrfTokenValue = request.getResponseHeader('XSRF-TOKEN');
      if (csrfTokenValue) {
        console.info(endpoint);
        console.info(csrfTokenValue);
        UniversalStorage.saveStorageItem('XSRF-TOKEN', csrfTokenValue);
      }
    },
    beforeSend(xhr) { xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded'); },
  }).done((msg) => {
    if (typeof callback === 'function') {
      callback(msg);
    }
  }).fail((jqXHR, textStatus) => {
    if (typeof err === 'function') {
      err(textStatus);
    }
  });
}

function storeSessionToServer(data, cb) { // eslint-disable-line no-unused-vars
  if (!UniversalStorage.cookiesEnabled) {
    callAPI('session', data, 'POST', (response) => { // eslint-disable-line no-unused-vars
      cb();
    }, () => {});
  } else {
    cb();
  }
}

function wrapLocationChange(route) { // eslint-disable-line no-unused-vars
  if (!UniversalStorage.cookiesEnabled) {
    if (route.indexOf('?') === -1) {
      window.location = `${route}?PHPSESSID=${UniversalStorage.getStorageItem('PHPSESSID')}`;
    } else {
      window.location = `${route}&PHPSESSID=${UniversalStorage.getStorageItem('PHPSESSID')}`;
    }
  } else {
    window.location = route;
  }
}
// load state from zipcode

function loadStateFromZip() { // eslint-disable-line no-unused-vars
  const fZip = $('#zipcode');
  const fZipVal = fZip.safeVal();
  const params = [];
  if (fZipVal.length === 5) {
    fZip.addClass('processed');
    $('.state, #city').prop('disabled', true);
    $('.state + small + i, #city + small + i').show();
    callAPI(`state/${fZipVal}`, params, 'GET', (resp) => {
      const jData = resp.data;
      if (resp.success) {
        if (jData.city !== undefined && jData.city !== '' && jData.city !== null) {
          $('#city').safeVal(jData.city);
        } else {
          $('#city').safeVal('');
        }

        if (jData.state !== undefined && jData.state !== '' && jData.state !== null) {
          $('.state').safeVal(jData.state).trigger('change');
        } else {
          $('.state').safeVal('');
        }
        $('input[name=address1]').focus();
      }
      // remove fa spin icons and do formvalidation
      $('.state, #city').prop('disabled', false);
      let frm;
      if ($('.form-address').length > 0) {
        frm = $('.form-address');
      } else {
        frm = $('#checkoutForm');
      }
      frm.formValidation('revalidateField', 'city');
      frm.formValidation('revalidateField', 'state');
    });
  }
}

function bootstrapModal(content, title) {
  const modal = $('#tm-modal');
  // set content
  modal.find('.modal-body').html(content);
  if (title !== null) {
    modal.find('.modal-title').text(title);
  } else {
    modal.find('.modal-title').text('');
  }
  // open modal
  modal.modal('show');
}
function popPage(pageURL, title) {
  jQuery.ajax({
    method: 'GET',
    url: pageURL,
  }).done((msg) => {
    bootstrapModal(msg, title);
  });
}
// Terms and privacy popups

function termsModal() { // eslint-disable-line no-unused-vars
  popPage('terms.html', 'Terms & Conditions');
}
function partnerModal() { // eslint-disable-line no-unused-vars
  popPage('partner.html', 'Partner');
}
function privacyModal() { // eslint-disable-line no-unused-vars
  popPage('privacy.html', 'Privacy Policy');
}
function custcareModal() { // eslint-disable-line no-unused-vars
  popPage('customercare.html', 'Customer Care');
}
