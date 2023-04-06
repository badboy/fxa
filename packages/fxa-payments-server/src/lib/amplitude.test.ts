import FlowEvent from '../lib/flow-event';

import * as Amplitude from './amplitude';
jest.mock('../lib/flow-event');

jest.mock('./sentry');

beforeEach(() => {
  (FlowEvent.logAmplitudeEvent as jest.Mock).mockClear();
});

it('should call logAmplitudeEvent with the correct event group and type names', () => {
  const testCases: Array<[keyof typeof Amplitude, ...string[][]]> = [
    ['manageSubscriptionsMounted', ['subManage', 'view']],
    ['manageSubscriptionsEngaged', ['subManage', 'engage']],
    ['createSubscriptionMounted', ['subPaySetup', 'view']],
    ['createSubscriptionEngaged', ['subPaySetup', 'engage']],
    ['updateSubscriptionPlanMounted', ['subPayUpgrade', 'view']],
    ['updateSubscriptionPlanEngaged', ['subPayUpgrade', 'engage']],
    ['updateSubscriptionPlan_PENDING', ['subPayUpgrade', 'submit']],
    ['updateSubscriptionPlan_FULFILLED', ['subPayUpgrade', 'success']],
    ['updateSubscriptionPlan_REJECTED', ['subPayUpgrade', 'fail']],
    ['updatePaymentMounted', ['subPayManage', 'view']],
    ['updatePaymentEngaged', ['subPayManage', 'engage']],
    ['updatePayment_PENDING', ['subPayManage', 'submit']],
    [
      'updatePayment_FULFILLED',
      ['subPayManage', 'success'],
      ['subPayManage', 'complete'],
    ],
    ['updatePayment_REJECTED', ['subPayManage', 'fail']],
    ['cancelSubscriptionMounted', ['subCancel', 'view']],
    ['cancelSubscriptionEngaged', ['subCancel', 'engage']],
    ['cancelSubscription_PENDING', ['subCancel', 'submit']],
    [
      'cancelSubscription_FULFILLED',
      ['subCancel', 'success'],
      ['subCancel', 'complete'],
    ],
    ['cancelSubscription_REJECTED', ['subCancel', 'fail']],
    ['createAccountMounted', ['subPayAccountSetup', 'view']],
    ['createAccountEngaged', ['subPayAccountSetup', 'engage']],
    ['createAccountSignIn', ['subPayAccountSetup', 'other']],
    ['updateDefaultPaymentMethod_PENDING', ['subPayManage', '3ds-submit']],
    [
      'updateDefaultPaymentMethod_FULFILLED',
      ['subPayManage', '3ds-success'],
      ['subPayManage', '3ds-complete'],
    ],
    ['updateDefaultPaymentMethod_REJECTED', ['subPayManage', 'fail']],
    ['createSubscriptionWithPaymentMethod_PENDING', ['subPaySetup', 'submit']],
    [
      'createSubscriptionWithPaymentMethod_FULFILLED',
      ['subPaySetup', '3ds-success'],
      ['subPaySetup', '3ds-complete'],
    ],
    ['createSubscriptionWithPaymentMethod_REJECTED', ['subPaySetup', 'fail']],
    ['couponMounted', ['subCoupon', 'view']],
    ['couponEngaged', ['subCoupon', 'engage']],
    ['coupon_PENDING', ['subCoupon', 'submit']],
    ['coupon_FULFILLED', ['subCoupon', 'success']],
    ['coupon_REJECTED', ['subCoupon', 'fail']],
  ];

  for (const [actionType, ...expectedArgs] of testCases) {
    Amplitude[actionType]({});

    for (const args of expectedArgs) {
      expect(FlowEvent.logAmplitudeEvent).toBeCalledWith(...args, {});
    }

    (FlowEvent.logAmplitudeEvent as jest.Mock).mockClear();
  }
});
