/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// TODO: Figure out how to port Vat. Here's a simplistic implementation for POC.

import { isEmailValid } from 'fxa-shared/email/helpers';
import { Constants } from '../constants';

/**
 * Dedicated error class for validation errors that occur when using the @bind decorator.
 */
export class ModelValidationError extends Error {
  constructor(
    public readonly key: string,
    public readonly value: any,
    public readonly message: string
  ) {
    super(message);
  }

  toString() {
    return `[key=${this.key}] [value=${this.value}] - ${this.message} `;
  }
}

export class ModelValidationErrors extends Error {
  constructor(
    public readonly message: string,
    public readonly errors: ModelValidationError[]
  ) {
    super(message);
  }
}

/** Validations */
export const ModelValidation = {
  isRequired: (k: string, v: any) => {
    if (v == null) {
      throw new ModelValidationError(k, v, 'Must exist!');
    }
    return v;
  },
  isString: (k: string, v: any) => {
    if (v == null) {
      return v;
    }
    if (typeof v !== 'string') {
      throw new ModelValidationError(k, v, 'Is not string');
    }
    return v;
  },
  isHex: (k: string, v: any) => {
    if (v == null) {
      return v;
    }
    if (typeof v !== 'string' || !/^(?:[a-fA-F0-9]{2})+$/.test(v)) {
      throw new ModelValidationError(k, v, 'Is not a hex string');
    }
    return v;
  },
  isBoolean: (k: string, v: any) => {
    if (v == null) {
      return v;
    }

    if (typeof v === 'boolean') {
      return v;
    }
    if (typeof v === 'string') {
      v = v.toLocaleLowerCase().trim();
    }
    if (v === 'true') {
      return true;
    }
    if (v === 'false') {
      return false;
    }
    throw new ModelValidationError(k, v, 'Is not boolean');
  },
  isNumber: (k: string, v: any) => {
    if (v == null) {
      return v;
    }

    const n = parseFloat(v);
    if (isNaN(n)) {
      throw new ModelValidationError(k, v, 'Is not a number');
    }
    return n;
  },

  isClientId: (k: string, v: any) => {
    // TODO: Add validation
    return ModelValidation.isString(k, v);
  },

  isAccessType: (k: string, v: any) => {
    // TODO: Add validation
    return ModelValidation.isString(k, v);
  },

  isCodeChallenge: (k: string, v: any) => {
    // TODO: Add validation
    return ModelValidation.isString(k, v);
  },

  isCodeChallengeMethod: (k: string, v: any) => {
    // TODO: Add validation
    return ModelValidation.isString(k, v);
  },

  isPrompt: (k: string, v: any) => {
    // TODO: Add validation
    return ModelValidation.isString(k, v);
  },

  isUrl: (k: string, v: any) => {
    // TODO: Add validation
    return ModelValidation.isString(k, v);
  },

  isUri: (k: string, v: any) => {
    // TODO: Add validation
    return ModelValidation.isString(k, v);
  },

  isNonEmptyString: (k: string, v: any) => {
    v = ModelValidation.isString(k, v);
    if ((v || '').length === 0) {
      throw new ModelValidationError(k, v, 'Cannot be an empty string');
    }
    return v;
  },

  isVerificationCode: (k: string, v: any) => {
    // TODO: Add validation
    return ModelValidation.isString(k, v);
  },

  isAction: (k: string, v: any) => {
    // TODO: Add validation
    return ModelValidation.isString(k, v);
  },

  isKeysJwk: (k: string, v: any) => {
    // TODO: Add validation
    return ModelValidation.isString(k, v);
  },

  isIdToken: (k: string, v: any) => {
    // TODO: Add validation
    return ModelValidation.isString(k, v);
  },

  isEmail: (k: string, v: any) => {
    // TODO: Add validation
    v = ModelValidation.isString(k, v);
    if (!isEmailValid(v)) {
      throw new ModelValidationError(k, v, 'Is not a valid email');
    }
    return v;
  },

  isGreaterThanZero: (k: string, v: any) => {
    // TODO: Add validation
    v = ModelValidation.isNumber(k, v);
    if (v < 0) {
      throw new ModelValidationError(k, v, 'Is not a positive number');
    }
    return v;
  },

  isPairingAuthorityRedirectUri: (k: string, v: any) => {
    if ((v || '') !== Constants.DEVICE_PAIRING_AUTHORITY_REDIRECT_URI) {
      throw new ModelValidationError(
        k,
        v,
        'Is not a DEVICE_PAIRING_AUTHORITY_REDIRECT_URI'
      );
    }
    return v;
  },

  isChannelId: (k: string, v: any) => {
    // TODO: Add validation
    return ModelValidation.isString(k, v);
  },

  isChannelKey: (k: string, v: any) => {
    // TODO: Add validation
    return ModelValidation.isString(k, v);
  },

  isValidCountry: (k: string, v: any) => {
    // TODO: Add validation
    return ModelValidation.isString(k, v);
  },
};
