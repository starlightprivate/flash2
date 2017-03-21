/* global describe, before, beforeEach, afterEach, it, browser, element, by, protractor */
import { expect } from './globals';

const EC = protractor.ExpectedConditions;
browser.ignoreSynchronization = true;

describe('Footer', () => {
  let modalOpened = false;
  const modalEl = element(by.id('tm-modal'));
  const modalTitleEl = modalEl.element(by.id('my-modal-label'));
  const modalCloseEl = modalEl.element(by.css('.close.close-modal'));
  const footerContainer = element(by.css('.footer'));
  const linkPrivacy = footerContainer.element(by.partialLinkText('Privacy Policy'.toUpperCase()));
  const linkTerms = footerContainer.element(by.partialLinkText('Terms & Conditions'.toUpperCase()));
  const linkPartners = footerContainer.element(by.partialLinkText('Partners'.toUpperCase()));
  const linkCustomer = footerContainer.element(by.partialLinkText('Customer Care'.toUpperCase()));

  before(() => {
    browser.get('');
  });

  beforeEach(() => {
    if (modalOpened) {
      modalCloseEl.click();
    }
  });

  it('should open Privacy Policy popup when click \'Privacy Policy\'', () => {
    browser.wait(EC.elementToBeClickable(linkPrivacy), 3000);
    linkPrivacy.click();
    browser.sleep(1000);
    expect(modalEl.isDisplayed()).to.eventually.equal(true);
    modalOpened = true;
    expect(modalTitleEl.getText()).to.eventually.equal('Privacy Policy');
  });

  it('should open Terms & Conditions popup when click \'Terms & Conditions\'', () => {
    browser.wait(EC.elementToBeClickable(linkTerms), 3000);
    linkTerms.click();
    browser.sleep(1000);
    expect(modalEl.isDisplayed()).to.eventually.equal(true);
    modalOpened = true;
    expect(modalTitleEl.getText()).to.eventually.equal('Terms & Conditions');
  });

  it('should open Partners popup when click \'Partners\'', () => {
    browser.wait(EC.elementToBeClickable(linkPartners), 3000);
    linkPartners.click();
    browser.sleep(1000);
    expect(modalEl.isDisplayed()).to.eventually.equal(true);
    modalOpened = true;
    expect(modalTitleEl.getText()).to.eventually.equal('Partner');
  });

  it('should open Customer Care popup when click \'Customer Care\'', () => {
    browser.wait(EC.elementToBeClickable(linkCustomer), 3000);
    linkCustomer.click();
    browser.sleep(1000);
    expect(modalEl.isDisplayed()).to.eventually.equal(true);
    modalOpened = true;
    expect(modalTitleEl.getText()).to.eventually.equal('Customer Care');
  });

  it('should close modal when click \'X\' on modal', () => {
    browser.wait(EC.elementToBeClickable(linkPrivacy), 3000);
    linkPrivacy.click();
    browser.sleep(1000);
    expect(modalEl.isDisplayed()).to.eventually.equal(true);
    modalOpened = true;
    modalCloseEl.click();
    browser.sleep(1000);
    expect(modalEl.isDisplayed()).to.eventually.equal(false);
    modalOpened = false;
  });
});
