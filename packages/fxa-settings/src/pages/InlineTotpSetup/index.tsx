/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import classNames from 'classnames';
import { MozServices } from '../../lib/types';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useFtlMsgResolver } from '../../models';
import { logPageViewEvent } from '../../lib/metrics';
import { ReactComponent as TwoFactorImg } from '../Signin/SigninTotpCode/graphic_two_factor_auth.svg';
import CardHeader from '../../components/CardHeader';
import LinkExternal from 'fxa-react/components/LinkExternal';
import FormVerifyCode from '../../components/FormVerifyCode';

type InlineTotpSetupProps = {
  code: string;
  email: string;
  serviceName?: MozServices;
};

export const InlineTotpSetup = ({
  code,
  email,
  serviceName,
}: InlineTotpSetupProps) => {
  logPageViewEvent('inline-totp-setup', { entrypoint_variation: 'react' });

  /*
   * TODO:
   *  - Write functionality to get TOTP token from account
   *  - get secret and QR code image src from totp token
   *  - add in success and error messages (with Banner component)
   *  - add in actions for `Cancel` `Ready` etc
   *  - fetch code here if that's preferable
   */

  const ftlMsgResolver = useFtlMsgResolver();
  const localizedQRCodeAltText = ftlMsgResolver.getMsg(
    'tfa-qr-code-alt',
    `Use the code ${code} to set up two-step authentication in supported applications.`,
    { code }
  );
  const localizedTwoFactorImgAriaLabel = ftlMsgResolver.getMsg(
    'signin-totp-code-image-label',
    'A device with a hidden 6-digit code.'
  );
  const [secret, setSecret] = useState<string>();
  const [qrCodeSrc, setQRCodeSrc] = useState<string>();
  const [showIntro, setShowIntro] = useState(true);
  const [totpCodeValue, setTotpCodeValue] = useState('');
  const [showQR, setShowQR] = useState(true);
  const [totpErrorMessage, setTotpErrorMessage] = useState('');

  type FormData = {
    confirmationCode: string;
  };

  const { handleSubmit } = useForm<FormData>({
    mode: 'onBlur',
    criteriaMode: 'all',
    defaultValues: {
      confirmationCode: '',
    },
  });

  const onSubmit = () => {
    if (!totpCodeValue) {
      // TODO: Add l10n for this string
      // Holding on l10n pending product decision
      // See FXA-6422, and discussion on PR-14744
      setTotpErrorMessage('Backup authentication code required');
    }
    try {
      // Check security code
      // logViewEvent('flow', inline-totp-setup.submit, {
      //   entrypoint_variation: 'react',
      //  });
    } catch (e) {
      // TODO: error handling, error message confirmation
      //       - use the Banner component
      // const errorInlineTotpSetup = ftlMsgResolver.getMsg(
      //   'inline-totp-setup-error-general',
      //   'Invalid confirmation code'
      // );
    }
  };

  return (
    <>
      {showIntro && (
        <>
          <CardHeader
            headingText="Enable two-step authentication"
            headingWithCustomServiceFtlId="inline-totp-setup-enable-two-step-authentication-custom-header"
            headingWithDefaultServiceFtlId="inline-totp-setup-enable-two-step-authentication-default-header"
            {...{ serviceName }}
          />
          <section className="flex flex-col items-center">
            <TwoFactorImg
              className="w-1/2"
              role="img"
              aria-label={localizedTwoFactorImgAriaLabel}
            />
            <FtlMsg
              id="inline-totp-setup-add-security-link"
              elems={{
                authenticationAppsLink: (
                  <LinkExternal
                    className="link-blue text-sm"
                    href="https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication"
                  >
                    these authentication apps
                  </LinkExternal>
                ),
              }}
            >
              <p className="text-sm">
                Add a layer of security to your account by requiring
                authentication codes from one of{' '}
                <LinkExternal
                  className="link-blue text-sm"
                  href="https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication"
                >
                  these authentication apps
                </LinkExternal>
                .
              </p>
            </FtlMsg>
            <button
              type="submit"
              className="cta-primary cta-xl w-full my-4"
              onClick={() => {
                // TODO: Add in any further functionality here
                setShowIntro(false);
              }}
            >
              <FtlMsg id="inline-totp-setup-continue-button">Continue</FtlMsg>
            </button>
            <button type="button" className="link-blue text-sm">
              <FtlMsg id="inline-totp-setup-cancel-setup-button">
                Cancel setup
              </FtlMsg>
            </button>
          </section>
        </>
      )}
      {!showIntro && (
        <>
          {showQR ? (
            <CardHeader
              headingText="Scan authentication code"
              headingWithCustomServiceFtlId="inline-totp-setup-show-qr-custom-service-header"
              headingWithDefaultServiceFtlId="inline-totp-setup-show-qr-default-service-header"
              {...{ serviceName }}
            />
          ) : (
            <CardHeader
              headingText="Enter code manually"
              headingWithCustomServiceFtlId="inline-totp-setup-no-qr-custom-service-header"
              headingWithDefaultServiceFtlId="inline-totp-setup-no-qr-default-service-header"
              {...{ serviceName }}
            />
          )}
          <section>
            <form noValidate>
              <div id="totp" className="totp-details">
                {showQR ? (
                  <>
                    <FtlMsg
                      id="inline-totp-setup-use-qr-or-enter-key-instructions"
                      elems={{
                        toggleToManualModeButton: (
                          <button
                            type="button"
                            onClick={() => {
                              setShowQR(false);
                            }}
                            className="link-blue inline"
                          >
                            Can’t scan code?
                          </button>
                        ),
                      }}
                    >
                      <p className="text-sm mb-4">
                        Scan the QR code in your authentication app and then
                        enter the authentication code it provides.{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setShowQR(false);
                          }}
                          className="link-blue inline"
                        >
                          Can’t scan code?
                        </button>
                      </p>
                    </FtlMsg>
                    <div>
                      <img
                        className={classNames({
                          hidden: !qrCodeSrc,
                        })}
                        alt={localizedQRCodeAltText}
                        src={qrCodeSrc}
                      />
                    </div>
                    <FtlMsg id="inline-totp-setup-on-completion-description">
                      <p className="text-sm mb-4">
                        Once complete, it will begin generating authentication
                        codes for you to enter.
                      </p>
                    </FtlMsg>
                  </>
                ) : (
                  <>
                    <FtlMsg
                      id="inline-totp-setup-enter-key-or-use-qr-instructions"
                      elems={{
                        toggleToQRButton: (
                          <button
                            onClick={() => {
                              setShowQR(true);
                            }}
                            className="link-blue inline"
                          >
                            Scan QR code instead?
                          </button>
                        ),
                      }}
                    >
                      <p className="text-sm m-2">
                        Type this secret key into your authentication app.{' '}
                        <button
                          onClick={() => {
                            setShowQR(true);
                          }}
                          className="link-blue inline"
                        >
                          Scan QR code instead?
                        </button>
                      </p>
                    </FtlMsg>
                    <div className="qr-code-container">
                      <div className="qr-code-text">{secret}</div>
                    </div>
                    <FtlMsg id="inline-totp-setup-on-completion-description">
                      <p className="text-sm mb-4">
                        Once complete, it will begin generating authentication
                        codes for you to enter.
                      </p>
                    </FtlMsg>
                  </>
                )}
                <FormVerifyCode
                  viewName="inline_totp_setup"
                  email={email}
                  onSubmit={handleSubmit(onSubmit)}
                  formAttributes={{
                    inputLabelText: 'Authentication code',
                    inputFtlId: 'inline-totp-setup-security-code-placeholder',
                    pattern: 'd{6}',
                    maxLength: 6,
                    submitButtonText: 'Ready',
                    submitButtonFtlId: 'inline-totp-setup-ready-button',
                  }}
                  code={totpCodeValue}
                  setCode={setTotpCodeValue}
                  codeErrorMessage={totpErrorMessage}
                  setCodeErrorMessage={setTotpErrorMessage}
                />
                <button className="link-blue text-sm mt-4">
                  <FtlMsg id="inline-totp-setup-cancel-setup-button">
                    Cancel setup
                  </FtlMsg>
                </button>
              </div>
            </form>
          </section>
        </>
      )}
    </>
  );
};

export default InlineTotpSetup;