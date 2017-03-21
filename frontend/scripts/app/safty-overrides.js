/* global DOMPurify:true jQuery:true*/
/* eslint no-undef: "error"*/

(($) => { // eslint-disable-line no-await-in-loop, require-await
  $.fn.unsafeVal = $.fn.val; // eslint-disable-line no-param-reassign
  $.fn.val = function (value) { // eslint-disable-line no-param-reassign, func-names
    if (arguments.length >= 1) {
      return $.fn.unsafeVal
             .call(this, DOMPurify.sanitize(value)); // eslint-disable-line babel/no-invalid-this
    }
    return DOMPurify
            .sanitize($.fn.unsafeVal.call(this)); // eslint-disable-line babel/no-invalid-this
  };
})(jQuery);
