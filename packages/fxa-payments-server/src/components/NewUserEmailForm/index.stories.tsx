import React, { useState } from 'react';
import { NewUserEmailForm } from './index';
import { Meta } from '@storybook/react';

export default {
  title: 'components/NewUserEmailForm',
  component: NewUserEmailForm,
} as Meta;

const selectedPlan = {
  plan_id: 'planId',
  plan_name: 'Pro level',
  product_id: 'fpnID',
  product_name: 'Firefox Private Network Pro',
  currency: 'usd',
  amount: 935,
  interval: 'month' as const,
  interval_count: 1,
  active: true,
  product_metadata: null,
  plan_metadata: {
    'product:subtitle': 'Really keen product',
    'product:details:1':
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    'product:details:2': 'Sed ut perspiciatis unde omnis iste natus',
    'product:details:3': 'Nemo enim ipsam voluptatem',
    'product:details:4':
      'Ut enim ad minima veniam, quis nostrum exercitationem',
    'product:subtitle:xx-pirate': 'VPN fer yer full-device',
    'product:details:1:xx-pirate': 'Device-level encryption arr',
    'product:details:2:xx-pirate': 'Servers is 30+ countries matey',
    'product:details:3:xx-pirate': "Connects 5 devices wit' one subscription",
    'product:details:4:xx-pirate': "Available fer Windows, iOS an' Android",
  },
};

const WrapNewUserEmailForm = ({
  accountExistsReturnValue,
  invalidDomain,
}: {
  accountExistsReturnValue: boolean;
  invalidDomain: boolean;
}) => {
  const [, setValidEmail] = useState<string>('');
  const [, setAccountExists] = useState(false);
  const [, setInvalidEmailDomain] = useState(false);
  const [, setEmailsMatch] = useState(false);
  return (
    <div className="flex">
      <NewUserEmailForm
        signInURL={
          'https://localhost:3031/subscriptions/products/productId?plan=planId&signin=yes'
        }
        setValidEmail={setValidEmail}
        setAccountExists={setAccountExists}
        setInvalidEmailDomain={setInvalidEmailDomain}
        setEmailsMatch={setEmailsMatch}
        getString={(id: string) => id}
        checkAccountExists={() =>
          Promise.resolve({
            exists: accountExistsReturnValue,
            invalidDomain,
          })
        }
        selectedPlan={selectedPlan}
        onToggleNewsletterCheckbox={() => {}}
      />
    </div>
  );
};

const storyWithContext = (
  accountExistsReturnValue: boolean,
  invalidDomain: boolean,
  storyName?: string
) => {
  const story = () => (
    <WrapNewUserEmailForm
      accountExistsReturnValue={accountExistsReturnValue}
      invalidDomain={invalidDomain}
    />
  );

  if (storyName) story.storyName = storyName;
  return story;
};

export const Default = storyWithContext(false, false, 'default');

export const ExistingAccount = storyWithContext(
  true,
  false,
  'existing account'
);

export const InvalidEmailDomain = storyWithContext(
  false,
  true,
  'invalid email domain'
);
