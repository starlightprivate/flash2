/* global filterXSS:true jQuery:true*/
/* eslint no-undef: "error"*/

(($) => { // eslint-disable-line no-await-in-loop, require-await
  const originalVal = $.fn.val; // eslint-disable-line no-param-reassign
  $.fn.safeVal = function (value) { // eslint-disable-line no-param-reassign, func-names
    if (arguments.length >= 1) {
      return originalVal.call(this, filterXSS(value)); // eslint-disable-line babel/no-invalid-this
    }
    return filterXSS(originalVal.call(this)); // eslint-disable-line babel/no-invalid-this
  };
})(jQuery);
