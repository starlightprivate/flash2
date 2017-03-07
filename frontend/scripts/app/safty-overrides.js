(($) => {
  let originalVal = $.fn.val;
  $.fn.safe_val = function(value) {
    if (arguments.length >= 1) {
      return originalVal.call(this, filterXSS(value));
    }
    return filterXSS(originalVal.call(this))
  };
})(jQuery);
