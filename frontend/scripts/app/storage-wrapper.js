/* global $, MobileDetect, store, Cookies*/
/**
 * The storage wrapper.
 * @type {Object}
 */
const UniversalStorage = {
  cookiesAreEnabled: () => {
    let cookiesEnabled = window.navigator.cookieEnabled;
    if (typeof window.navigator.cookieEnabled === 'undefined' && !cookiesEnabled) {
      document.cookie = 'testcookie';
      cookiesEnabled = document.cookie.indexOf('testcookie') !== -1;
    }
    return cookiesEnabled;
  },

  cookiesEnabled: true,
  /**
   * The key for checkout details on storage.
   * @type {String}
   */
  storageKey: 'checkout',
  /**
   * [storageKeyForOrderId description]
   * @type {String}
   */
  storageKeyForOrderId: 'orderId',
  /**
   * List of fields allowed on checkout form.
   * @type {Array}
   */
  whiteList: [
    'orderId',
    'firstName',
    'lastName',
    'emailAddress',
    'phoneNumber',
    'address1',
    'city',
    'state',
    'postalCode',
  ],
  /**
   * Initialize the storage.
   * @return {[type]} [description]
   */
  initializeStorage: () => {
    UniversalStorage.cookiesEnabled = UniversalStorage.cookiesAreEnabled();
    if (!UniversalStorage.cookiesEnabled && typeof store !== 'undefined') {
      const checkout = store.get(UniversalStorage.storageKey);
      if (!checkout) {
        store.set(UniversalStorage.storageKey, {});
      }
    } else {
      const checkout = Cookies.get(UniversalStorage.storageKey);
      if (!checkout) {
        Cookies.set(UniversalStorage.storageKey, {});
      }
    }
  },
  /**
   * Save item to storage.
   * @param  {[type]} key   [description]
   * @param  {[type]} value [description]
   */
  saveStorageItem: (key, value) => {
    if (UniversalStorage.cookiesEnabled) {
      Cookies.set(key, value);
    } else if (typeof store !== 'undefined') {
      store.set(key, value);
      store.get(key);
    }
  },
  /**
   * Retrieve saved item from storage.
   * @param  {[type]} key [description]
   * @return {[type]}     [description]
   */
  getStorageItem: (key) => {
    if (UniversalStorage.cookiesEnabled) {
      return Cookies.get(key);
    } else if (typeof store !== 'undefined') {
      return store.get(key);
    }
    return null;
  },

  /**
   * Retrieve XSRF Token
   * @return Token
   */
  getToken: () => UniversalStorage.getStorageItem('XSRF-TOKEN'),
  /**
   * Save checkout details to storage.
   * @param {Object} checkoutDetails The dictionary of checkout details.
   */
  saveCheckoutDetails: (checkoutDetails) => { // eslint-disable-line no-unused-vars
    Object.keys(checkoutDetails).forEach((field) => {
      if (UniversalStorage.whiteList.indexOf(field) === -1 || typeof checkoutDetails[field] === 'undefined') {
        return;
      }
      UniversalStorage.saveCheckoutField(field, checkoutDetails[field]);
    });
  },
  /**
   * Wrapper which convert from json to object if cookies are enabled.
   * @return {Object}
   */
  toObjectIfCookies: (obj) => {
    if (UniversalStorage.cookiesEnabled) {
      return JSON.parse(obj);
    }
    return obj;
  },
  /**
   * Retrieve checkout details saved to storage.
   * @return {Object}
   */
  getCheckoutDetails: () => { // eslint-disable-line no-unused-vars
    // Retrieve item from storage.
    const value = UniversalStorage.toObjectIfCookies(
      UniversalStorage.getStorageItem(UniversalStorage.storageKey));
    const details = {};
    UniversalStorage.whiteList.forEach((key) => {
      details[key] = value[key];
    });
    return details;
  },
  /**
   * Save an individual field on checkout form.
   * @param  {String} field
   * @param  {Mixed} value
   */
  saveCheckoutField: (field, value) => {
    if (UniversalStorage.whiteList.indexOf(field) === -1) {
      return;
    }

    // Retrieve item from storage.
    const details = UniversalStorage.toObjectIfCookies(
      UniversalStorage.getStorageItem(UniversalStorage.storageKey));
    details[field] = value;
    // Save to storage.
    UniversalStorage.saveStorageItem(UniversalStorage.storageKey, details);
  },
  /**
   * [saveOrderId description]
   * @param  {[type]} orderId [description]
   */
  saveOrderId: (orderId) => {
    UniversalStorage.saveCheckoutField(UniversalStorage.storageKeyForOrderId, orderId);
  },
  /**
   * Return the current active order ID if available.
   * @return {String}
   */
  getOrderId: () => {
    // Retrieve item from storage.
    const value = UniversalStorage.toObjectIfCookies(
      UniversalStorage.getStorageItem(UniversalStorage.storageKey));
    return value[UniversalStorage.storageKeyForOrderId];
  },
};

UniversalStorage.initializeStorage();
