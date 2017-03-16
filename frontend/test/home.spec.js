/* global describe, browser, element, by, it, before, protractor */

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
const expect = chai.expect;
const EC = protractor.ExpectedConditions;

// Turn off waiting for Angular.
browser.ignoreSynchronization = true;

describe('Home page', () => {
  before(() => {
    browser.get('');
  });

  it('should have title as \'Tactical Mastery Flashlights\'', () => {
    expect(browser.getTitle()).to.eventually.equal('Tactical Mastery Flashlights');
  });

  it('should open contact popup when click on \'Click Here\' of hero video', () => {
    const videoContainer = '.video-container';
    const buttonId = 'wistia_22_midrollLink_link';
    const contactPopupId = 'modal-contact';

    const buttonEl = element(by.css(videoContainer)).element(by.id(buttonId));
    browser.wait(EC.visibilityOf(buttonEl));
    buttonEl.click();

    const popupEl = element(by.id(contactPopupId));
    browser.wait(EC.visibilityOf(popupEl));
  });

  it.skip('should open contact popup when the hero video ends', () => 'pending');
});
