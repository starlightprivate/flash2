import chai from 'chai'; // eslint-disable-line import/no-extraneous-dependencies
import chaiAsPromised from 'chai-as-promised'; // eslint-disable-line import/no-extraneous-dependencies
import { config } from '../../protractor.config';

chai.use(chaiAsPromised);
const expect = chai.expect;

export { expect, config };
