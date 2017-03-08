/** global: MobileDetect */
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

// call API
function callAPI(endpoint, data, method, callback, err) {
  let params = data;
  let ApiUrl = `/api/v2/${endpoint}/`;
  const httpMethod = method || 'POST';
  // if data is an array pass as post,
  // otherwise the string is a simple get and needs to append to the end of the uri
  if (params && params.constructor !== Object) {
    ApiUrl += params;
    params = null;
  }

  // https://starlightgroup.atlassian.net/browse/SG-14
  if (['PUT', 'POST', 'PATCH', 'DELETE'].indexOf(method) !== -1) {
    params._csrf = $.cookie('XSRF-TOKEN'); // eslint-disable-line no-underscore-dangle
  }

  jQuery.ajax({
    method: httpMethod,
    url: ApiUrl,
    data: params,
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
// load state from zipcode

function loadStateFromZip() { // eslint-disable-line no-unused-vars
  const fZip = $('#zipcode');
  const fZipVal = fZip.val();
  const params = [];
  if (fZipVal.length === 5) {
    fZip.addClass('processed');
    $('#state, #city').prop('disabled', true);
    $('#state + small + i, #city + small + i').show();
    callAPI(`state/${fZipVal}`, params, 'GET', (resp) => {
      const jData = resp.data;
      if (resp.success) {
        if (jData.city !== undefined && jData.city !== '' && jData.city !== null) {
          $('#city').val(jData.city);
        } else {
          $('#city').val('');
        }

        if (jData.state !== undefined && jData.state !== '' && jData.state !== null) {
          $('#state').val(jData.state).trigger('change');
        } else {
          $('#state').val('');
        }
        $('input[name=address1]').focus();
      }
      // remove fa spin icons and do formvalidation
      $('#state, #city').prop('disabled', false);
      let frm;
      if ($('#form-address').length > 0) {
        frm = $('#form-address');
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
