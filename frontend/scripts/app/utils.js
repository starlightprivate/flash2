var md = new MobileDetect(window.navigator.userAgent);
function customWrapperForIsMobileDevice() {
  'use strict';
  if (md.mobile() || md.phone() || md.tablet()) {
    return true;
  }
  return false;
}

function isJsonObj(obj) {
  'use strict';
  return typeof obj === 'object';
}
// check if a string is a valid json data
function isValidJson(str) {
  'use strict';
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

function getJson(e) {
  'use strict';
  var json = {};
  if (isJsonObj(e)) {
    json = e;
  } else if (isValidJson(e)) {
    json = JSON.parse(e);
  }
  return json;
}

// call API
function callAPI(endpoint, data, method, callback, err) {

  'use strict';
  var ApiUrl = '/api/v2/' + endpoint + "/";
  method = method || 'POST';
  // if data is an array pass as post, otherwise the string is a simple get and needs to append to the end of the uri
  if (data && data.constructor !== Object) {
    ApiUrl += data;
    data = null;
  }

  //https://starlightgroup.atlassian.net/browse/SG-14
  if (['PUT', 'POST', 'PATCH', 'DELETE'].indexOf(method) !== -1) {
    data._csrf = $.cookie('XSRF-TOKEN');
    console.log ("COOKIE(token): " + data._csrf);
  }else{
    console.log ("COOKIE(token): " + "-");
  }

  jQuery.ajax({
    method: method,
    url: ApiUrl,
    data: data,
    beforeSend: function(xhr){xhr.setRequestHeader( "Content-type","application/x-www-form-urlencoded" );}
  }).done(function (msg) {
    if (typeof callback === 'function') {
      callback(msg);
    }
  }).fail(function (jqXHR, textStatus) {
    if (typeof err === 'function') {
      err(textStatus);
    }
    console.log('error occured on api - ' + endpoint);
    console.log('error11 - ' + textStatus);
  });
}
// load state from zipcode
function loadStateFromZip() {
  'use strict';
  var fZip = $('#zipcode');
  var fZipVal = fZip.val();
  var params = [];
  if (fZipVal.length === 5) {
    fZip.addClass('processed');
    $('#state, #city').prop('disabled', true);
    $('#state + small + i, #city + small + i').show();
    callAPI('state/' + fZipVal, params, 'GET', function (resp) {
      var jData = resp.data;
      if (resp.success) {
        if (jData.city !== undefined && jData.city !== '' && jData.city !== null) {
          $('#city').val(jData.city);
        }else{
          $('#city').val("");
        }

        if (jData.state !== undefined && jData.state !== '' && jData.state !== null) {
          $('#state').val(jData.state).trigger('change');
        }else{
          $('#state').val("");
        }
        $('input[name=address1]').focus();
      }
      //remove fa spin icons and do formvalidation
      $('#state, #city').prop('disabled', false);
      var frm;
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
// Detects safari with Applewebkit only
function isMobileSafari() {
  'use strict';
  return navigator.userAgent.match(/(iPod|iPhone|iPad)/) && navigator.userAgent.match(/AppleWebKit/);
}
function bootstrapModal(content, title) {
  'use strict';
  var modal = $('#tm-modal');
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
  'use strict';
  jQuery.ajax({
    method: 'GET',
    url: pageURL
  }).done(function (msg) {
    bootstrapModal(msg, title);
  });
}
//Terms and privacy popups
function termsModal(e) {
  'use strict';
  popPage('terms.html', 'Terms & Conditions');
}
function partnerModal(e) {
  'use strict';
  popPage('partner.html', 'Partner');
}
function privacyModal(e) {
  'use strict';
  popPage('privacy.html', 'Privacy Policy');
}
function pressModal(e) {
  'use strict';
  popPage('press.html');
}
function custcareModal(e) {
  'use strict';
  popPage('customercare.html', 'Customer Care');
}
function getQueryVariable(variable) {
  'use strict';
  for (var i = 0; i < window.location.search.substring(1).split('&').length; i++) {
    var pair = window.location.search.substring(1).split('&')[i].split('=');
    if (pair[0] === variable) {
      console.log('url check-------->', pair);
      return pair[1];
    }
  }
  return '';
}
function afGet(field, qsField) {
  'use strict';
  qsField = qsField || false;
  var returnThis;
  if (qsField) {
    var qParam = getQueryVariable(qsField);
    if (qParam !== '') {
      returnThis = qParam;
    }
  }
  if (returnThis) {
    return returnThis.replace(/[+]/g, ' ');
  }
  return returnThis;
}
function getOrderData() {
  'use strict';
  var keys = [
    'orderId',
    'firstName',
    'lastName',
    'emailAddress',
    'phoneNumber',
    'address1',
    'city',
    'state',
    'postalCode',
    'cardNumber',
    'cardSecurityCode',
    'cardMonth',
    'cardYear',
    'productId'
  ];
  var obj = {};
  for (var k in keys) {
    if (keys.hasOwnProperty(k)) {
      obj[keys[k]] = getStorageItem(keys[k]) || '';
    }
  }
  return obj;
}
function getStorageItem(k) {
  'use strict';
  return localStorage.getItem(k);
}
function clearStorageItem(k) {
  'use strict';
  localStorage.removeItem(k);
}
function escapeHTML(str) {
     str = str + "";
     var out = "";
     for(var i=0; i<str.length; i++) {
         if(str[i] === '<') {
             out += '&lt;';
         } else if(str[i] === '>') {
             out += '&gt;';
         } else if(str[i] === "'") {
             out += '&#39;'; 
         } else if(str[i] === '"') {
             out += '&quot;';                        
         } else {
             out += str[i];
         }
     }
     return out;                    
}