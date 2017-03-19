/* global describe, before, it, browser, protractor */
import { expect } from './globals';

browser.ignoreSynchronization = true;

describe.skip('Terms page', () => {
  before(() => {
    browser.get('terms.html');
  });

  it('should have title as \'Tactical Mastery Flashlights\'', () => {
    expect(browser.getTitle()).to.eventually.equal('Tactical Mastery Flashlights');
  });
});
