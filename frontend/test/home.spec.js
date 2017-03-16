import chai from 'chai';
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const expect = chai.expect;
const EC = protractor.ExpectedConditions;

// Turn off waiting for Angular.
browser.ignoreSynchronization = true;

describe('Home page', function() {
  before(() => {
    browser.get('');
  });

  it.skip('should have title as \'Tactical Mastery Flashlights\'', function() {
    expect(browser.getTitle()).to.eventually.equal('Tactical Mastery Flashlights');
  });

  it.skip('should open contact popup when click on \'Click Here\' of hero video', function() {
    const videoContainer = '.video-container';
    const buttonId = 'wistia_22_midrollLink_link';
    const contactPopupId = 'modal-contact';

    const buttonEl = element(by.css(videoContainer)).element(by.id(buttonId));
    browser.wait(EC.visibilityOf(buttonEl));
    buttonEl.click();
    
    const popupEl = element(by.id(contactPopupId));
    browser.wait(EC.visibilityOf(popupEl));
  });

  it('should open contact popup when the hero video ends', function() {
    return 'pending';
  });

});