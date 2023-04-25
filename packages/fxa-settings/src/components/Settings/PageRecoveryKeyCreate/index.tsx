/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import { RouteComponentProps, useNavigate } from '@reach/router';
import { usePageViewEvent } from '../../../lib/metrics';
import VerifiedSessionGuard from '../VerifiedSessionGuard';
import { HomePath } from '../../../constants';
import { useAccount, useFtlMsgResolver } from '../../../models';
import FlowRecoveryKeyDownload from '../FlowRecoveryKeyDownload';
import FlowRecoveryKeyConfirmPwd from '../FlowRecoveryKeyConfirmPwd';

const viewName = 'settings.account-recovery';

export const PageRecoveryKeyCreate = (props: RouteComponentProps) => {
  usePageViewEvent('settings.account-recovery');

  const account = useAccount();
  const ftlMsgResolver = useFtlMsgResolver();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formattedRecoveryKey, setFormattedRecoveryKey] = useState<string>('');

  const goHome = () => navigate(HomePath + '#recovery-key', { replace: true });

  const numberOfSteps = 4;

  const localizedFlowContainerTitle = ftlMsgResolver.getMsg(
    'recovery-key-create-flow-title',
    'Account Recovery Key'
  );

  const localizedCustomBackButtonTitle = ftlMsgResolver.getMsg(
    'recovery-key-create-back-button-title',
    'Back to settings'
  );

  const navigateBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/settings');
    }
  };

  const navigateForward = (e?: React.MouseEvent<HTMLElement>) => {
    e?.preventDefault();
    if (currentStep + 1 <= numberOfSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/settings');
    }
  };

  // Redirects to settings if a recovery key is already set
  // TODO change to redirect to 'PageRecoveryKeyChange' once created
  useEffect(() => {
    if (account.recoveryKey && !formattedRecoveryKey) {
      navigate(HomePath, { replace: true });
    }
  }, [account, formattedRecoveryKey, navigate]);

  // TODO prevent page refresh? currently refreshing breaks user from flow

  return (
    <>
      <VerifiedSessionGuard onDismiss={goHome} onError={goHome} />
      {/* Switch through the account recovery key steps based on step number */}
      {/* Flow start */}
      {currentStep === 1 && (
        <>
          <p>first step</p>
          <button
            className="cta-primary cta-base-p mx-2 flex-1"
            type="button"
            onClick={navigateForward}
          >
            click to move to next view
          </button>
        </>
      )}

      {/* Confirm password and generate recovery key */}
      {currentStep === 2 && (
        <>
          <FlowRecoveryKeyConfirmPwd
            {...{
              currentStep,
              localizedCustomBackButtonTitle,
              localizedFlowContainerTitle,
              navigateBack,
              navigateForward,
              numberOfSteps,
              setFormattedRecoveryKey,
              viewName,
            }}
          />
        </>
      )}

      {/* Download recovery key */}
      {currentStep === 3 && formattedRecoveryKey && (
        <FlowRecoveryKeyDownload
          recoveryKeyValue={formattedRecoveryKey}
          {...{
            currentStep,
            localizedCustomBackButtonTitle,
            localizedFlowContainerTitle,
            navigateForward,
            numberOfSteps,
            viewName,
          }}
        />
      )}
      {currentStep === 3 &&
        !formattedRecoveryKey &&
        // TODO verify behaviour if currentStep is 3 but no formattedRecoveryKey
        goHome()}

      {/* Set a storage hint if the a recovery key exists */}
      {currentStep === 4 && account.recoveryKey && (
        <>
          <p>Fourth step</p>
          <button
            className="cta-primary cta-base-p mx-2 flex-1"
            type="button"
            onClick={navigateForward}
          >
            click to move to next view
          </button>
        </>
      )}
      {currentStep === 4 &&
        !account.recoveryKey &&
        // TODO verify behaviour - can't set a hint if no recoveryKey set
        goHome()}
    </>
  );
};

export default PageRecoveryKeyCreate;
