/**
 * The storage wrapper.
 * @type {Object}
 */
const UniversalStorage = {
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
    if (typeof store !== 'undefined') {
      const defaults = {};
      defaults[UniversalStorage.storageKey] = {};
      store.defaults(defaults);
    }
  },
  /**
   * Save item to storage.
   * @param  {[type]} key   [description]
   * @param  {[type]} value [description]
   */
  saveStorageItem: (key, value) => {
    if (typeof store !== 'undefined') {
      store.set(key, value);
    } else {
      // Fallback to window.localStorage.
      window.localStorage.setItem(key, value);
    }
  },
  /**
   * Retrieve saved item from storage.
   * @param  {[type]} key [description]
   * @return {[type]}     [description]
   */
  getStorageItem: (key) => {
    if (typeof store !== 'undefined') {
      return store.get(key);
    }
    // Fallback to window.localStorage.
    return window.localStorage.getItem(key);
  },
  /**
   * Save checkout details to storage.
   * @param {Object} checkoutDetails The dictionary of checkout details.
   */
  saveCheckoutDetails: (checkoutDetails) => { // eslint-disable-line no-unused-vars
    const value = {};
    Object.keys(checkoutDetails).forEach((field) => {
      if (UniversalStorage.whiteList.indexOf(field) === -1 || typeof checkoutDetails[field] === 'undefined') {
        return;
      }
      value[field] = checkoutDetails[field];
    });

    // Save to storage.
    UniversalStorage.saveStorageItem(UniversalStorage.storageKey, value);
  },
  /**
   * Retrieve checkout details saved to storage.
   * @return {Object}
   */
  getCheckoutDetails: () => { // eslint-disable-line no-unused-vars
    // Retrieve item from storage.
    const value = UniversalStorage.getStorageItem(UniversalStorage.storageKey);

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
    const details = UniversalStorage.getStorageItem(UniversalStorage.storageKey);
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
    const value = UniversalStorage.getStorageItem(UniversalStorage.storageKey);
    return value[UniversalStorage.storageKeyForOrderId];
  },
};

UniversalStorage.initializeStorage();
