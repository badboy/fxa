import React from 'react';
import Image from 'next/image';

import FIREFOX_LOGO from '../../public/images/firefox-logo-combined.svg';

export const Header = () => (
  <header
    className="flex justify-between items-center bg-white shadow h-16 fixed left-0 top-0 my-0 mx-auto px-4 py-0 w-full z-10 tablet:h-20"
    role="banner"
  >
    <div data-testid="branding">
      <Image src={FIREFOX_LOGO} alt="Firefox logo" />
    </div>
  </header>
);

export default Header;