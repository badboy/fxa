/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useState } from 'react';
import FlowContainer from '../FlowContainer';
import ProgressBar from '../ProgressBar';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useAccount, useAlertBar, useFtlMsgResolver } from '../../../models';
import { useForm } from 'react-hook-form';
import base32Encode from 'base32-encode';
import { logViewEvent } from '../../../lib/metrics';
import {
  AuthUiErrorNos,
  AuthUiErrors,
  composeAuthUiErrorTranslationId,
} from '../../../lib/auth-errors/auth-errors';
import InputPassword from '../../InputPassword';
import { LockImage } from '../../images';

type FormData = {
  password: string;
};

export type FlowRecoveryKeyConfirmPwdProps = {
  currentStep: number;
  localizedCustomBackButtonTitle: string;
  localizedFlowContainerTitle: string;
  navigateBack: () => void;
  navigateForward: () => void;
  numberOfSteps: number;
  setFormattedRecoveryKey: React.Dispatch<React.SetStateAction<string>>;
  viewName: string;
};

export const FlowRecoveryKeyConfirmPwd = ({
  currentStep,
  localizedCustomBackButtonTitle,
  localizedFlowContainerTitle,
  navigateBack,
  navigateForward,
  numberOfSteps,
  setFormattedRecoveryKey,
  viewName,
}: FlowRecoveryKeyConfirmPwdProps) => {
  // metrics

  const account = useAccount();
  const alertBar = useAlertBar();
  const ftlMsgResolver = useFtlMsgResolver();

  const [errorText, setErrorText] = useState<string>();

  const { formState, getValues, handleSubmit, register } = useForm<FormData>({
    mode: 'all',
    defaultValues: {
      password: '',
    },
  });

  const createRecoveryKey = useCallback(async () => {
    const password = getValues('password');
    try {
      const recoveryKey = await account.createRecoveryKey(password);
      setFormattedRecoveryKey(
        base32Encode(recoveryKey.buffer, 'Crockford').match(/.{4}/g)!.join(' ')
      );
      logViewEvent(
        'flow.settings.account-recovery',
        'confirm-password.success'
      );
      navigateForward();
    } catch (e) {
      console.log(e);

      // TODO: review error handling

      let localizedError;

      if (e.errno === AuthUiErrors.THROTTLED.errno) {
        localizedError = ftlMsgResolver.getMsg(
          composeAuthUiErrorTranslationId(e),
          AuthUiErrorNos[e.errno].message,
          { retryAfter: e.retryAfterLocalized }
        );
      } else {
        localizedError = ftlMsgResolver.getMsg(
          composeAuthUiErrorTranslationId(e),
          e.message
        );
      }

      if (e.errno === AuthUiErrors.INCORRECT_PASSWORD.errno) {
        setErrorText(localizedError);
      } else {
        alertBar.error(localizedError);
        logViewEvent('flow.settings.account-recovery', 'confirm-password.fail');
      }
    }
  }, [
    account,
    alertBar,
    ftlMsgResolver,
    getValues,
    navigateForward,
    setErrorText,
    setFormattedRecoveryKey,
  ]);

  return (
    <FlowContainer
      title={localizedFlowContainerTitle}
      onBackButtonClick={navigateBack}
      {...{ localizedCustomBackButtonTitle }}
    >
      <div className="w-full flex flex-col gap-4">
        <ProgressBar {...{ currentStep, numberOfSteps }} />
        <LockImage className="mx-auto my-4" />

        <FtlMsg id="flow-recovery-key-confirm-pwd-heading">
          <h2 className="font-bold text-xl">
            Enter your password again to get started
          </h2>
        </FtlMsg>

        <form
          onSubmit={handleSubmit(({ password }) => {
            createRecoveryKey();
            logViewEvent(
              'flow.settings.account-recovery',
              'confirm-password.submit'
            );
          })}
        >
          <FtlMsg
            id="flow-recovery-key-confirm-pwd-input-label"
            attrs={{ label: true }}
          >
            <InputPassword
              name="password"
              label="Enter your password"
              onChange={() => {
                if (errorText) {
                  setErrorText(undefined);
                }
              }}
              inputRef={register({
                required: true,
              })}
              {...{ errorText }}
            />
          </FtlMsg>
          <button
            className="cta-primary cta-xl w-full mt-4"
            type="submit"
            disabled={!formState.isDirty || !!formState.errors.password}
          >
            Create recovery key
          </button>
        </form>
      </div>
    </FlowContainer>
  );
};

export default FlowRecoveryKeyConfirmPwd;
