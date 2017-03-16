import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
const expect = chai.expect;

const protractor = global.protractor;
const EC = protractor.ExpectedConditions;
const describe = global.describe;
const before = global.before;
const it = global.it;
const browser = global.browser;
const element = global.element;
const by = global.by;

export { describe, before, expect, it, browser, element, by, EC };