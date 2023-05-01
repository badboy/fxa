import { TargetName } from '.';
import { RemoteTarget } from './remote';

const ACCOUNTS_DOMAIN = process.env.ACCOUNTS_DOMAIN || 'accounts.firefox.com';
const ACCOUNTS_API_DOMAIN =
  process.env.ACCOUNTS_API_DOMAIN || 'api.accounts.firefox.com';
const PAYMENTS_DOMAIN =
  process.env.PAYMENTS_DOMAIN || 'subscriptions.firefox.com';
const RELIER_DOMAIN =
  process.env.RELIER_DOMAIN || 'production-123done.herokuapp.com';

export class ProductionTarget extends RemoteTarget {
  static readonly target = 'production';
  readonly name: TargetName = ProductionTarget.target;

  readonly contentServerUrl = `https://${ACCOUNTS_DOMAIN}`;
  readonly paymentsServerUrl = `https://${PAYMENTS_DOMAIN}`;
  readonly relierUrl = `https://${RELIER_DOMAIN}`;

  constructor() {
    super(`https://${ACCOUNTS_API_DOMAIN}`);
  }
}
