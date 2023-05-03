import React, { useCallback, useEffect, useState } from 'react';
import { Localized } from '@fluent/react';

import { Plan, Customer, Profile } from '../../../store/types';
import { SelectorReturns } from '../../../store/selectors';

import * as Amplitude from '../../../lib/amplitude';

import { getLocalizedDate, getLocalizedDateString } from '../../../lib/formats';
import { useCallbackOnce } from '../../../lib/hooks';

import { Form, SubmitButton } from '../../../components/fields';
import { useValidatorState } from '../../../lib/validator';

import DialogMessage from '../../../components/DialogMessage';
import PaymentLegalBlurb from '../../../components/PaymentLegalBlurb';
import { TermsAndPrivacy } from '../../../components/TermsAndPrivacy';
import { PaymentProvider } from 'fxa-payments-server/src/lib/PaymentProvider';

import PlanUpgradeDetails from './PlanUpgradeDetails';
import Header from '../../../components/Header';

import './index.scss';

import { ProductProps } from '../index';
import { PaymentConsentCheckbox } from '../../../components/PaymentConsentCheckbox';
import { PaymentProviderDetails } from '../../../components/PaymentProviderDetails';
import { WebSubscription } from 'fxa-shared/subscriptions/types';
import { FirstInvoicePreview } from 'fxa-shared/dto/auth/payments/invoice';

export type SubscriptionUpgradeProps = {
  profile: Profile;
  customer: Customer;
  selectedPlan: Plan;
  upgradeFromPlan: Plan;
  upgradeFromSubscription: WebSubscription;
  invoicePreview: FirstInvoicePreview;
  isMobile?: boolean;
  updateSubscriptionPlanStatus: SelectorReturns['updateSubscriptionPlanStatus'];
  updateSubscriptionPlanAndRefresh: ProductProps['updateSubscriptionPlanAndRefresh'];
  resetUpdateSubscriptionPlan: ProductProps['resetUpdateSubscriptionPlan'];
};

export const SubscriptionUpgrade = ({
  isMobile = false,
  profile,
  customer,
  selectedPlan,
  upgradeFromPlan,
  upgradeFromSubscription,
  invoicePreview,
  updateSubscriptionPlanStatus,
  updateSubscriptionPlanAndRefresh,
  resetUpdateSubscriptionPlan,
}: SubscriptionUpgradeProps) => {
  const ariaLabelledBy = 'error-plan-change-failed-header';
  const ariaDescribedBy = 'error-plan-change-failed-description';
  const validator = useValidatorState();
  const [showTooltip, setShowTooltip] = useState(false);
  const [checkboxSet, setCheckboxSet] = useState(false);

  const inProgress = updateSubscriptionPlanStatus.loading;

  const paymentProvider: PaymentProvider | undefined =
    customer?.payment_provider;

  useEffect(() => {
    const metrics = {
      subscriptionId: upgradeFromSubscription.subscription_id,
      ...selectedPlan,
    };
    Amplitude.updateSubscriptionPlanMounted(metrics);
  }, [selectedPlan, upgradeFromSubscription.subscription_id]);

  const engageOnce = useCallbackOnce(() => {
    const metrics = {
      subscriptionId: upgradeFromSubscription.subscription_id,
      ...selectedPlan,
    };
    Amplitude.updateSubscriptionPlanEngaged(metrics);
  }, [selectedPlan, upgradeFromSubscription.subscription_id]);

  const handleClick = () => {
    engageOnce();
    setShowTooltip(false);
    setCheckboxSet(!checkboxSet);
  };

  const onSubmit = useCallback(
    (ev) => {
      ev.preventDefault();
      if (validator.allValid()) {
        updateSubscriptionPlanAndRefresh(
          upgradeFromSubscription.subscription_id,
          upgradeFromPlan,
          selectedPlan,
          paymentProvider
        );
      }

      if (!checkboxSet) {
        setShowTooltip(true);
      }
    },
    [
      validator,
      updateSubscriptionPlanAndRefresh,
      upgradeFromSubscription,
      upgradeFromPlan,
      selectedPlan,
      paymentProvider,
      checkboxSet,
    ]
  );

  const mobileUpdateHeading = isMobile ? (
    <div className="mobile-subscription-title">
      <div className="subscription-update-heading">
        <Localized id="product-plan-change-heading">
          <h2>Review your change</h2>
        </Localized>
      </div>
    </div>
  ) : null;

  return (
    <>
      {updateSubscriptionPlanStatus.error && (
        <DialogMessage
          className="dialog-error"
          onDismiss={resetUpdateSubscriptionPlan}
          headerId={ariaLabelledBy}
          descId={ariaDescribedBy}
        >
          <Localized id="sub-change-failed">
            <h4 id={ariaLabelledBy} data-testid="error-plan-update-failed">
              Plan change failed
            </h4>
          </Localized>
          <p id={ariaDescribedBy}>
            {updateSubscriptionPlanStatus.error.message}
          </p>
        </DialogMessage>
      )}
      <Header {...{ profile }} />
      <div className="main-content">
        <div
          className="product-payment product-upgrade rounded-lg tablet:rounded-t-none"
          data-testid="subscription-upgrade"
        >
          {!isMobile ? (
            <div
              className="subscription-update-heading"
              data-testid="subscription-update-heading"
            >
              <Localized id="product-plan-change-heading">
                <h2>Review your change</h2>
              </Localized>
              <p className="subheading"></p>
            </div>
          ) : null}
          <div className="payment-details">
            <Localized id="sub-update-payment-title">
              <span className="label-title">Payment information</span>
            </Localized>
            <PaymentProviderDetails customer={customer!} />
          </div>

          <Form
            data-testid="upgrade-form"
            className="payment upgrade"
            {...{ validator, onSubmit }}
          >
            <hr className="my-6" />
            <Localized
              id="sub-update-copy"
              vars={{
                startingDate: getLocalizedDate(
                  upgradeFromSubscription.current_period_end
                ),
              }}
            >
              <p>
                Your plan will change immediately, and you’ll be charged an
                adjusted amount for the rest of your billing cycle. Starting
                {getLocalizedDateString(
                  upgradeFromSubscription.current_period_end
                )}{' '}
                you’ll be charged the full amount.
              </p>
            </Localized>

            <hr className="my-6" />

            <PaymentConsentCheckbox
              plan={selectedPlan}
              onClick={handleClick}
              showTooltip={showTooltip}
            />

            <hr className="my-6" />

            <div className="button-row">
              <SubmitButton
                data-testid="submit"
                className="button"
                name="submit"
                disabled={inProgress}
              >
                {inProgress ? (
                  <span data-testid="spinner-submit" className="spinner">
                    &nbsp;
                  </span>
                ) : (
                  <Localized id="sub-change-submit">
                    <span>Confirm change</span>
                  </Localized>
                )}
              </SubmitButton>
            </div>

            <div className="payment-footer" data-testid="footer">
              <PaymentLegalBlurb provider={paymentProvider} />
              <TermsAndPrivacy plan={selectedPlan} />
            </div>
          </Form>
        </div>
        <PlanUpgradeDetails
          {...{
            profile,
            selectedPlan,
            upgradeFromPlan,
            isMobile,
            showExpandButton: isMobile,
            invoicePreview,
          }}
        />
        {mobileUpdateHeading}
      </div>
    </>
  );
};

export default SubscriptionUpgrade;
