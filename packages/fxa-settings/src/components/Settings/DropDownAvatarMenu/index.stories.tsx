/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from '../../../../.storybook/decorators';
import DropDownAvatarMenu from '.';
import { Account, AppContext } from 'fxa-settings/src/models';
import { mockAppContext, MOCK_ACCOUNT } from 'fxa-settings/src/models/mocks';

export default {
  title: 'Components/Settings/DropDownAvatarMenu',
  component: DropDownAvatarMenu,
  decorators: [
    withLocalization,
    (Story) => (
      <div className="w-full flex justify-end">
        <div className="flex pr-10 pt-4">
          <Story />
        </div>
      </div>
    ),
  ],
} as Meta;

const accountWithoutAvatar = {
  avatar: {
    url: null,
    id: null,
  },
  primaryEmail: {
    email: MOCK_ACCOUNT.primaryEmail.email,
  },
} as unknown as Account;

const storyWithContext = (account: Partial<Account>) => {
  const context = { account: account as Account };

  const story = () => (
    <AppContext.Provider value={mockAppContext(context)}>
      <DropDownAvatarMenu />
    </AppContext.Provider>
  );
  return story;
};

export const DefaultNoAvatarOrDisplayName =
  storyWithContext(accountWithoutAvatar);

export const WithAvatarAndDisplayName = () => <DropDownAvatarMenu />;
