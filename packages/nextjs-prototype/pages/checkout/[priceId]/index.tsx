import { useEffect, useState } from 'react';
import SubscriptionTitle from '../../../components/SubscriptionTitle';
import CouponForm from '../../../components/CouponForm';
import PriceDetails, { PriceInfo } from '../../../components/PriceDetails';
import AccountsInfo from '../../../components/AccountsInfo';
import TermsAndConditions from '../../../components/TermsAndConditions';
import PaymentForm from '../../../components/PaymentForm';
import {
  mockHCMSFetch,
  mockInvoicePreviewFetch,
  Plan,
  priceDetailsProps,
} from '../../../data/mock';
import {
  buildAdditionalStyles,
  buildPriceDetails,
  buildTermsPropsFromPriceConfig,
} from '../../../lib/checkout/helpers';

/**
 * ????? Open Questions ?????
 *
 * Question 1. As much as possible, should we aim/try to build the checkout to be SSG over SSR?
 *
 * Question 2. From my understanding, I don't think a total SSG page would be possible. Since the
 *    price and tax data can change depending on the users IP address, SSG won't work in this case.
 *    Do you agree, or did I miss something?
 *
 * Question 3. Assuming agreement on 2., would Incremental Static Regeneration, work in this case?
 *    I had a quick look, and from my understanding it also won't really work. Although, I think we
 *    could do some fun things to maybe make it work.
 *
 * Question 4. So does that make a client side fetch the best option?
 *
 * Question 5. Should we just abandon SSG and go full SSR?
 */

// Generates `/checkout/123` (is the ID set in priceDetailsprops in data/mock)
export async function getStaticPaths() {
  // Add logic to dynamically fetch IDs from hCMS (or for the prototype the mock GraphQL)
  return {
    paths: [{ params: { priceId: priceDetailsProps.priceInfo.id } }],
    fallback: false, // can also be true or 'blocking'
  };
}

export async function getStaticProps() {
  // Add logic here for translations
  // https://soykje.gitlab.io/en/blog/nextjs-i18n/

  // Fetch price config from the hCMS. (Currently mocked out, returning static data)
  const hCmsPriceConfig = await mockHCMSFetch();
  return {
    // Passed to the page component as props
    props: { priceConfig: hCmsPriceConfig },
  };
}

export default function CheckoutPricePage({
  priceConfig,
}: {
  priceConfig: Plan;
}) {
  const [paymentsDisabled, setPaymentsDisabled] = useState(true);
  const [priceInfo, setPriceInfo] = useState<PriceInfo | null>(null);
  const [isLoading, setLoading] = useState(false);

  // Investigate how to only execute this once
  const terms = buildTermsPropsFromPriceConfig(priceConfig);
  const additionalStyles = buildAdditionalStyles(priceConfig);

  // Once we switch to GraphQL also switch to Vercel SWR
  // https://nextjs.org/docs/basic-features/data-fetching/client-side#client-side-data-fetching-with-swr
  useEffect(() => {
    setLoading(true);
    mockInvoicePreviewFetch(true).then((res) => {
      const compiledPriceInfo = buildPriceDetails(priceConfig, res);
      setPriceInfo(compiledPriceInfo);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <SubscriptionTitle screenType="create" />
      <article className="component-card border-t-0 min-h-full mb-6 pt-4 px-4 pb-14 rounded-t-lg text-grey-600 tablet:rounded-t-none desktop:px-12 desktop:pb-12">
        <AccountsInfo signInUrl="" setPaymentsDisabled={setPaymentsDisabled} />
        <PaymentForm disabled={paymentsDisabled} />
        <TermsAndConditions terms={terms} />
      </article>
      <aside className="payment-panel">
        {isLoading || !priceInfo ? (
          <div>Loading</div>
        ) : (
          <PriceDetails
            priceInfo={priceInfo}
            additionalStyles={additionalStyles}
          />
        )}
        <CouponForm />
      </aside>
    </>
  );
}
