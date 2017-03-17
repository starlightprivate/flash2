import { describe, before, expect, it, browser } from './globals';

browser.ignoreSynchronization = true;

describe('Terms page', () => {
  before(() => {
    browser.get('terms.html');
  });

  it('should have title as \'Tactical Mastery Flashlights\'', () => {
    expect(browser.getTitle()).to.eventually.equal('Tactical Mastery Flashlights');
  });
});
