import chai from 'chai';
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Protractor Demo App', function() {
  it('should add one and two', function(done) {
    browser.get('http://juliemr.github.io/protractor-demo/');
    element(by.model('first')).sendKeys(1);
    element(by.model('second')).sendKeys(2);

    element(by.id('gobutton')).click();

    element(by.binding('latest')).getText().then((text) => {
      expect(text).to.equal('3'); // This is wrong!
      done();
    });
  });
});