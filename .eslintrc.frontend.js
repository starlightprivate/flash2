//this is eslint config file for frontend.
//Anatolij promise to make it compatible with backend

module.exports = {
  'root': true, //http://eslint.org/docs/user-guide/configuring#using-configuration-files
  'extends': 'airbnb-base',
  'plugins': [
    'import'
  ],
  'rules': {
    'no-undef': 'off',
    'no-console': 1,
    'no-evil-regex-rule': 1,
  },
  rulePaths: ['./eslint-rules'],
  envs: ['browser']
};
