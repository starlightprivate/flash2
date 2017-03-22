/* global $, MobileDetect, jQuery, Cookies, UniversalStorage */

function utils() { // eslint-disable-line no-unused-vars
  function customWrapperForIsMobileDevice() { // eslint-disable-line no-unused-vars
    const md = new MobileDetect(window.navigator.userAgent);
    if (md.mobile() || md.phone() || md.tablet()) {
      return true;
    }
    return false;
  }

  function getJson(e) { // eslint-disable-line no-unused-vars
    let obj;
    if (typeof e === 'object') {
      return e;
    }
    try {
      obj = JSON.parse(e);
    } catch (ex) {
      obj = {};
    }
    return obj;
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
            UniversalStorage.saveStorageItem('PHPSESSID', sessId);
          } else {
            UniversalStorage.saveStorageItem('PHPSESSID', request.getResponseHeader('phpsessid'));
          }
        // UniversalStorage.saveStorageItem('PHPSESSID', request.getResponseHeader('phpsessid'));
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
        headers = { PHPSESSID: UniversalStorage.getStorageItem('PHPSESSID'),
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

    $.ajax({
      method: httpMethod,
      url: ApiUrl,
      headers,
      data: params,
      complete: (request) => {
        if (!UniversalStorage.cookiesEnabled) {
          const csrfTokenValue = request.getResponseHeader('XSRF-TOKEN');
          if (csrfTokenValue) {
            UniversalStorage.saveStorageItem('XSRF-TOKEN', csrfTokenValue);
          }
        }
      },
      beforeSend(xhr) { xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded'); },
    }).done((msg/* , textStatus , request */) => {
      if (typeof callback === 'function') {
        callback(msg);
      }
    }).fail((jqXHR, textStatus/* , request */) => {
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
    $.ajax({
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

  return {
    customWrapperForIsMobileDevice,
    getJson,
    getUrlParameter,
    initSessionIfNoCookies,
    callAPI,
    storeSessionToServer,
    wrapLocationChange,
    bootstrapModal,
    popPage,
    termsModal,
    partnerModal,
    privacyModal,
    custcareModal,
  };
}

