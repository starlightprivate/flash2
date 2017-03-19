/* global describe, it, browser, element, by, protractor */
import { expect } from './globals';

browser.ignoreSynchronization = false;

describe.skip('Protractor Demo App', () => {
  it('should add one and two', () => {
    browser.get('http://juliemr.github.io/protractor-demo/');

    element(by.model('first')).sendKeys(1);
    element(by.model('second')).sendKeys(2);
    element(by.id('gobutton')).click();

    browser.sleep(3000);

    expect(element(by.binding('latest')).getText()).to.eventually.equal('3');
  });
});
