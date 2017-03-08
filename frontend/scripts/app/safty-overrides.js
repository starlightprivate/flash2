/* global filterXSS:true jQuery:true*/
/* eslint no-undef: "error"*/

(($) => { // eslint-disable-line no-await-in-loop, require-await
  const originalVal = $.fn.val; // eslint-disable-line no-param-reassign
  $.fn.safe_val = (value) => { // eslint-disable-line no-param-reassign
    if (arguments.length >= 1) {
      return originalVal.call(this, filterXSS(value)); // eslint-disable-line babel/no-invalid-this
    }
    return filterXSS(originalVal.call(this)); // eslint-disable-line babel/no-invalid-this
  };
})(jQuery);
