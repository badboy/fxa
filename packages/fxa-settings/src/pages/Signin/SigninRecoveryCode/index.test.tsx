/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import { usePageViewEvent } from '../../../lib/metrics';
import SigninRecoveryCode from '.';
import { MOCK_SERVICE } from './mocks';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

describe('PageSigninRecoveryCode', () => {
  // TODO: enable l10n tests when they've been updated to handle embedded tags in ftl strings
  // TODO: in FXA-6461
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  it('renders as expected', () => {
    render(<SigninRecoveryCode />);
    // testAllL10n(screen, bundle);

    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent(
      'Enter backup authentication code to continue to account settings'
    );
    screen.getByRole('img', { name: 'Document that contains hidden text.' });
    screen.getByText(
      'Please enter a backup authentication code that was provided to you during two step authentication setup.'
    );
    screen.getByRole('textbox', {
      name: 'Enter 10-digit backup authentication code',
    });

    screen.getByRole('button', { name: 'Confirm' });
    screen.getByRole('link', { name: 'Back' });
    // 'Opens in new window' is sr-only text added by the LinkExternal component
    // This should always be included for accessibility
    screen.getByRole('link', {
      name: 'Are you locked out? Opens in new window',
    });
  });

  it('shows the relying party in the header when a service name is provided', () => {
    render(<SigninRecoveryCode serviceName={MOCK_SERVICE} />);
    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent(
      'Enter backup authentication code to continue to Example Service'
    );
  });

  it('emits a metrics event on render', () => {
    render(<SigninRecoveryCode />);
    expect(usePageViewEvent).toHaveBeenCalledWith(`signin-recovery-code`, {
      entrypoint_variation: 'react',
    });
  });
});
