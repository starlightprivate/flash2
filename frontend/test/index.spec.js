/* global describe, before, beforeEach, afterEach, it, browser, element, by, protractor */
import { expect, config } from './globals';

const EC = protractor.ExpectedConditions;
browser.ignoreSynchronization = true;

describe('Index page', () => {
  const videoContainer = '.video-container';
  const greenBtnClass = '.btn.btn-green';
  const contactPopupEl = element(by.id('modal-contact'));
  const contactPopupCloseEl = contactPopupEl.element(by.css('.close-modal'));

  before(() => {
    browser.get('');
  });

  it('should have title as \'Tactical Mastery Flashlights\'', () => {
    expect(browser.getTitle()).to.eventually.equal('Tactical Mastery Flashlights');
  });

  describe('Contact modal - open', () => {
    afterEach(() => {
      contactPopupCloseEl.click();
      browser.wait(EC.invisibilityOf(contactPopupEl), 1000);
    });

    it('should open contact popup when click on \'Yes! I want 75% Off!\' green button.', () => {
      const buttonEl = element(by.cssContainingText(greenBtnClass, 'Yes! I want 75% Off!'));
      browser.wait(EC.visibilityOf(buttonEl));
      buttonEl.click();
      browser.sleep(1000);
      expect(contactPopupEl.isDisplayed()).to.eventually.equal(true);
    });

    if (config.capabilities.browserName === 'phantomjs') {
      // console.warn('It can\'t test video on phantomjs.');
    } else {
      it('should open contact popup when click on \'Click Here\' of hero video', () => {
        const buttonId = 'wistia_22_midrollLink_link';
        const buttonEl = element(by.css(videoContainer)).element(by.id(buttonId));
        browser.wait(EC.visibilityOf(buttonEl), 300000);
        buttonEl.click();
        browser.sleep(1000);
        expect(contactPopupEl.isDisplayed()).to.eventually.equal(true);
      });

      it.skip('should open contact popup when the hero video ends', () => 'pending');
    }
  });

  describe('Contact modal - validate', () => {
    const buttonYesEl = element(by.cssContainingText('.btn.btn-danger', 'YES!'));
    const nameEl = element(by.name('contactModalName'));
    const emailEl = element(by.name('email'));
    const phoneEl = element(by.name('phoneNumber'));
    const nameGroupEl = element(by.css('.form-group-name'));
    const emailGroupEl = element(by.css('.form-group-email'));
    const phoneGroupEl = element(by.css('.form-group-phone'));

    before(() => {
      const buttonEl = element(by.cssContainingText(greenBtnClass, 'Yes! I want 75% Off!'));

      browser.wait(EC.elementToBeClickable(buttonEl), 1000);
      buttonEl.click();

      browser.wait(EC.visibilityOf(contactPopupEl), 1000);
    });

    describe('Name field', () => {
      const emptyValidator = nameGroupEl.element(by.cssContainingText('.form-control-feedback', 'Please enter your name.'));
      const lengthValidator = nameGroupEl.element(by.cssContainingText('.form-control-feedback', 'The name must be more than 1 and less than 100'));
      const rightValidator = nameGroupEl.element(by.cssContainingText('.valid-message.text-success', 'Nice to meet you!'));

      beforeEach(() => {
        nameEl.clear();
      });

      it('should validate name when input \'\'', () => {
        nameEl.sendKeys('');
        buttonYesEl.click();
        browser.sleep(1000);
        expect(emptyValidator.isDisplayed()).to.eventually.equal(true);
      });

      it('should validate name when input long length string greater than 100', () => {
        let longName = '0';
        for (let i = 0, end = 100; i < end; ++i) {
          longName = `0${longName}`;
        }
        nameEl.sendKeys(longName);
        expect(lengthValidator.isDisplayed()).to.eventually.equal(true);
      });

      it('should validate name when input \'OK\'', () => {
        nameEl.sendKeys('OK');
        expect(rightValidator.isDisplayed()).to.eventually.equal(true);
      });
    });

    describe('Email field', () => {
      const emptyValidator = emailGroupEl.element(by.cssContainingText('.form-control-feedback', 'The email address is required.'));
      const formatValidator = emailGroupEl.element(by.cssContainingText('.form-control-feedback', 'The email address is not valid.'));
      const lengthValidator = emailGroupEl.element(by.cssContainingText('.form-control-feedback', 'The email address must be more than 6 and less than 30'));
      const rightValidator = emailGroupEl.element(by.cssContainingText('.valid-message.text-success', 'Great!'));

      beforeEach(() => {
        emailEl.clear();
      });

      it('should validate email when input \'\'', () => {
        emailEl.sendKeys('');
        buttonYesEl.click();
        browser.sleep(1000);
        expect(emptyValidator.isDisplayed()).to.eventually.equal(true);
      });

      it('should validate email when input \'wrong\'', () => {
        emailEl.sendKeys('wrong');
        expect(formatValidator.isDisplayed()).to.eventually.equal(true);
      });

      it.skip('should validate email when input \'wrong@wrong\'', () => {
        emailEl.sendKeys('wrong@wrong');
        expect(formatValidator.isDisplayed()).to.eventually.equal(true);
      });

      it('should validate email when input \'wrong@wrong.\'', () => {
        emailEl.sendKeys('wrong@wrong.');
        expect(formatValidator.isDisplayed()).to.eventually.equal(true);
      });

      it('should validate email when input \'a@b.c\'', () => {
        emailEl.sendKeys('a@b.c');
        expect(lengthValidator.isDisplayed()).to.eventually.equal(true);
      });

      it('should validate email when input long \'aaaaaaaaaa@bbbbbbbbbb.cccccccccc\'', () => {
        emailEl.sendKeys('aaaaaaaaaa@bbbbbbbbbb.cccccccccc');
        expect(lengthValidator.isDisplayed()).to.eventually.equal(true);
      });

      it('should validate email when input \'email@test.ok\'', () => {
        emailEl.sendKeys('email@test.ok');
        expect(rightValidator.isDisplayed()).to.eventually.equal(true);
      });
    });

    describe('Phone field', () => {
      const emptyValidator = phoneGroupEl.element(by.cssContainingText('.form-control-feedback', 'Please supply a phone number'));
      const formatValidator = phoneGroupEl.element(by.cssContainingText('.form-control-feedback', 'Not a valid 10-digit US phone number'));
      const rightValidator = phoneGroupEl.element(by.cssContainingText('.valid-message.text-success', 'Success!'));

      beforeEach(() => {
        phoneEl.clear();
      });

      it('should validate phone number when input \'\'', () => {
        phoneEl.sendKeys('');
        buttonYesEl.click();
        browser.sleep(1000);
        expect(emptyValidator.isDisplayed()).to.eventually.equal(true);
      });

      it('should validate phone number when input single letter \'a\'', () => {
        phoneEl.sendKeys('a');
        expect(emptyValidator.isDisplayed()).to.eventually.equal(true);
      });

      it('should validate phone number when input letters \'test phone number\'', () => {
        phoneEl.sendKeys('test phone number');
        expect(emptyValidator.isDisplayed()).to.eventually.equal(true);
      });

      it('should validate phone number when input short digits \'12345\'', () => {
        phoneEl.sendKeys('12345');
        expect(formatValidator.isDisplayed()).to.eventually.equal(true);
      });

      it('should trim 10 digits and validate phone number when input long digits \'00001111222233334444\'', () => {
        phoneEl.sendKeys('00001111222233334444');
        expect(rightValidator.isDisplayed()).to.eventually.equal(true);
      });

      it('should filter digits and validate phone number when input complex string \'000 a111 222b cc333\'', () => {
        phoneEl.sendKeys('000 a111 222b cc333');
        expect(rightValidator.isDisplayed()).to.eventually.equal(true);
      });
    });
  });
});
