import { describe, before, expect, it, browser, element, by, EC } from './globals';

browser.ignoreSynchronization = true;

describe('Home page', () => {
  const videoContainer = '.video-container';
  const contactPopupId = 'modal-contact';

  before(() => {
    browser.get('');
  });

  it('should have title as \'Tactical Mastery Flashlights\'', () => {
    expect(browser.getTitle()).to.eventually.equal('Tactical Mastery Flashlights');
  });

  it('should open contact popup when click on \'Click Here\' of hero video', () => {
    const buttonId = 'wistia_22_midrollLink_link';

    const buttonEl = element(by.css(videoContainer)).element(by.id(buttonId));
    browser.wait(EC.visibilityOf(buttonEl));
    buttonEl.click();

    const popupEl = element(by.id(contactPopupId));
    browser.wait(EC.visibilityOf(popupEl));
  });

  it.skip('should open contact popup when the hero video ends', () => {
    const videoId = 'wistia_simple_video_24';

    const videoEl = element(by.id(videoId));
    browser.wait(EC.visibilityOf(videoEl));
  });
});
