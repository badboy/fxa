import React, { useState } from 'react';
import { FlowContainer } from '../FlowContainer';
import { ProgressBar } from '../ProgressBar';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useForm } from 'react-hook-form';
import InputText from '../../InputText';
import { useFtlMsgResolver } from '../../../models';
import { logViewEvent, usePageViewEvent } from '../../../lib/metrics';
import { LightbulbImage } from '../../images';

export type FlowRecoveryKeyHintProps = {
  navigateForward: () => void;
  navigateBackward: () => void;
  localizedPageTitle: string;
};

type HintForm = { hint: string };

export const viewName = 'settings.account-recovery.hint';
export const backwardNavigationEventName = 'navigate-forward';
export const forwardNavigationEventName = 'navigate-backward';

export const FlowRecoveryKeyHint = ({
  navigateForward,
  navigateBackward,
  localizedPageTitle,
}: FlowRecoveryKeyHintProps) => {
  /*
   * TODO:
   * logging a page view event for each step of the flow may be excessive --
   * resolve what metrics are needed and adjust accordingly in FXA-7249
   */
  const [hintError, setHintError] = useState<string>();

  const hintForm = useForm<HintForm>({
    mode: 'onTouched',
  });

  const onSubmit = async ({ hint }: HintForm) => {
    if (hint.length > 0) {
      // save the hint.
    }

    // do all the actions in here.
    // save the hint and then navigate out.
    // TODO: change event name, or add logging for another event also
    logViewEvent(viewName, forwardNavigationEventName);
    // TODO: take action to save hint also
    navigateForward();
  };

  usePageViewEvent(viewName);
  const ftlMsgResolver = useFtlMsgResolver();

  const localizedBackButtonTitle = ftlMsgResolver.getMsg(
    'flow-recovery-key-hint-back-button-title',
    'Back to settings'
  );

  return (
    <FlowContainer
      title={localizedPageTitle}
      localizedBackButtonTitle={localizedBackButtonTitle}
      onBackButtonClick={() => {
        logViewEvent(viewName, backwardNavigationEventName);
        navigateBackward();
      }}
    >
      <div className="w-full flex flex-col">
        <ProgressBar currentStep={4} numberOfSteps={4} />
        <LightbulbImage className="mx-auto my-10" />
        <FtlMsg id="flow-recovery-key-hint-header">
          <h2 className="font-bold text-xl mb-4">
            Help yourself find your key later
          </h2>
        </FtlMsg>
        <FtlMsg id="flow-recovery-key-hint-message">
          <p className="text-md mb-4">
            Remember where you saved your key by creating a hint. If you forget
            your password and can't find your key, you might not be able to get
            your data back.
          </p>
        </FtlMsg>
        <form onSubmit={hintForm.handleSubmit(onSubmit)}>
          <FtlMsg
            id="flow-recovery-key-hint-input-placeholder"
            attrs={{ label: true }}
          >
            <InputText
              name="hint"
              label="Enter a hint (optional)"
              prefixDataTestId="hint"
              autoFocus
              onChange={() => {
                setHintError('');
                hintForm.trigger('hint');
              }}
              {...{ errorText: hintError }}
            />
          </FtlMsg>
          <FtlMsg id="flow-recovery-key-hint-cta-text">
            <button
              className="cta-primary cta-xl w-full mt-6 mb-4"
              type="submit"
            >
              Finish
            </button>
          </FtlMsg>
        </form>
      </div>
    </FlowContainer>
  );
};

export default FlowRecoveryKeyHint;
