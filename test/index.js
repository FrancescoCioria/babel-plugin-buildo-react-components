const path   = require('path');
const fs     = require('fs');
const assert = require('assert');
const expect = require('expect.js');
const babel  = require('babel');
const plugin = require('../src/index');


function trim(str) {
  return str.replace(/^\s+|\s+$/, '');
}

function removeEmptyLines(str) {
  return str.replace(/^\s*\n/gm, '');
}

function clean(str) {
  return trim(removeEmptyLines(str));
}

const skipTests = {
  '.DS_Store': 1
};

const options = {
  whitelist: [],
  plugins: [plugin]
};

describe('import transform check', () => { // eslint-disable-line no-undef
  const fixturesDir = path.join(__dirname, 'fixtures');
  fs.readdirSync(fixturesDir).map((caseName) => {
    if ((caseName in skipTests)) {
      return;
    }

    it(`transform ${caseName.split('-').join(' ')}`, () => { // eslint-disable-line no-undef
      const fixtureDir = path.join(fixturesDir, caseName);
      const actual     = babel.transformFileSync(
        path.join(fixtureDir, 'actual.js'),
        options
      ).code;
      const expected = fs.readFileSync(path.join(fixtureDir, 'expected.js')).toString();
      assert.equal(clean(actual), trim(expected));
    });
  });
});

describe('import errors check', () => { // eslint-disable-line no-undef
  const errorsDir = path.join(__dirname, 'errors');
  fs.readdirSync(errorsDir).map((caseName) => {
    if ((caseName in skipTests)) {
      return;
    }

    it(`should throw for ${caseName.split('-').join(' ')}`, () => { // eslint-disable-line no-undef
      const errorDir = path.join(errorsDir, caseName);
      let error;
      try {
        babel.transformFileSync(path.join(errorDir, 'actual.js'), options);
      } catch (e) {
        error = e;
      }
      expect(error.message).to.contain(`the import of whole buildo-react-components is forbidden`);
    });
  });
});
