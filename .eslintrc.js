const path = require('path');

module.exports = {
  extends: ['plugin:patternfly-react/recommended', 'prettier'],
  rules: {
    'import/no-extraneous-dependencies': 'off',
    'no-console': 'off'
  }
};
