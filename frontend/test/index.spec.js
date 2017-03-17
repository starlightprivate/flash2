import { describe, before, expect, it, browser, element, by, EC, config } from './globals';

browser.ignoreSynchronization = true;

describe('Index page', () => {
  const videoContainer = '.video-container';
  
  before(() => {
    browser.get('');
  });

  it('should have title as \'Tactical Mastery Flashlights\'', () => {
    expect(browser.getTitle()).to.eventually.equal('Tactical Mastery Flashlights');
  });

  describe('Contact modal - open', () => {
    const contactPopupEl = element(by.id('modal-contact'));
    const contactPopupCloseEl = contactPopupEl.element(by.css('.close-modal'));

    afterEach(() => {
      contactPopupCloseEl.click();
    });
    
    it('should open contact popup when click on \'Yes! I want 75% Off!\' green button.', () => {
      const buttonClass = '.btn.btn-green';
      const buttonEl = element(by.cssContainingText(buttonClass, 'Yes! I want 75% Off!'));
      browser.wait(EC.visibilityOf(buttonEl));
      buttonEl.click();

      browser.wait(EC.visibilityOf(contactPopupEl));
    });

    if (config.capabilities.browserName === 'phantomjs') {
      // console.warn('It can\'t test video on phantomjs.');
    } else {
      it('should open contact popup when click on \'Click Here\' of hero video', () => {
        const buttonId = 'wistia_22_midrollLink_link';
        const buttonEl = element(by.css(videoContainer)).element(by.id(buttonId));
        browser.wait(EC.visibilityOf(buttonEl), 300000);
        buttonEl.click();

        const popupEl = element(by.id(contactPopupId));
        browser.wait(EC.visibilityOf(popupEl));

        popupEl.element(by.css(contactPopupCloseCss)).click();
      });

      it.skip('should open contact popup when the hero video ends', () => {
        // const videoId = 'wistia_simple_video_24';

        return 'pending';
      });
    }
  });

  describe('Contact modal', () => {
    const buttonYesEl = element(by.cssContainingText('.btn.btn-red', 'YES!'));
    const nameEl = element(by.name('contactModalName'));
    const emailEl = element(by.name('email'));
    const phoneEl = element(by.name('phoneNumber'));

    before(() => {
      const buttonClass = '.btn.btn-green';
      const buttonEl = element(by.cssContainingText(buttonClass, 'Yes! I want 75% Off!'));
      browser.wait(EC.visibilityOf(buttonEl));
      buttonEl.click();

      const popupEl = element(by.id(contactPopupId));
      browser.wait(EC.visibilityOf(popupEl));
    });

    afterEach(() => {
      nameEl.sendKeys('');
      nameEl.sendKeys('');
      nameEl.sendKeys('');
    });

    it('should validate empty name when submit red button \'YES!\'', () => {
      const validator = element(by.cssContainingText('.form-control-feedback', 'Please enter your name.'));
      const invalidNames = ['', ' ', 1];
      invalidNames.forEach((name) => {
        element(by.id('contactModalName')).sendKeys(name);
        buttonYesEl.click();
        browser.sleep(1000);
        browser.wait(EC.visibilityOf(validator));
      });
    });

    it('should validate empty name when submit red button \'YES!\'', () => {
      const validator = element(by.cssContainingText('.form-control-feedback', 'Please enter your name.'));
      const invalidNames = ['', ' ', 1];
      invalidNames.forEach((name) => {
        element(by.id('contactModalName')).sendKeys(name);
        buttonYesEl.click();
        browser.sleep(1000);
        browser.wait(EC.visibilityOf(validator));
      });
    });
  });
});
