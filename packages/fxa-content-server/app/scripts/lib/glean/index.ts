/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Glean from '@mozilla/glean/web';

import { accountsEvents } from './pings';
import * as registration from './registration';
import * as login from './login';

export type GleanMetricsConfig = {
  enabled: boolean;
  applicationId: string;
  uploadEnabled: boolean;
  appDisplayVersion: string;
  channel: string;
  serverEndpoint: string;
  logPings: boolean;
  debugViewTag: string;
};

export type GleanMetricsContext = {
  metrics: any;
  relier: any;
  user: any;
  userAgent: any;
};

let gleanEnabled = false;
let gleanMetricsContext;

const populateProperties = () => {
  const flowEventMetadata = gleanMetricsContext.metrics.getFlowEventMetadata();

  const extras = {
    // TODO when sending metrics for authenticated accounts
    userIdSha256: ''
    relyingPartyOauthClientId: gleanMetricsContext.relier.get('clientId') || '',
    relyingPartyService: gleanMetricsContext.relier.get('service') || '',

    sessionDeviceType: gleanMetricsContext.userAgent.genericDeviceType() || '',
    sessionEntrypoint: flowEventMetadata.entrypoint || '',
    sessionFlowId: flowEventMetadata.flowId || '',

    utmCampaign: flowEventMetadata.utmCampaign || '',
    utmContent: flowEventMetadata.utmContent || '',
    utmMedium: flowEventMetadata.utmMedium || '',
    utmSource: flowEventMetadata.utmSource || '',
    utmTerm: flowEventMetadata.utmTerm || '',

  };
  return extras;
};

const createEventFn = (event) => () => {
  if (!gleanEnabled) {
    return;
  }

  const extras = populateProperties();
  event.record(extras);
  accountsEvents.submit();
};

export const GleanMetrics = {
  initialize: (config: GleanMetricsConfig, context: GleanMetricsContext) => {
    if (config.enabled) {
      Glean.initialize(config.applicationId, config.uploadEnabled, {
        appDisplayVersion: config.appDisplayVersion,
        channel: config.channel,
        serverEndpoint: config.serverEndpoint,
        // Glean does not offer direct control over when metrics are uploaded;
        // this ensures that events are uploaded.
        maxEvents: 1,
      });
      Glean.setLogPings(config.logPings);
      if (config.debugViewTag) {
        Glean.setDebugViewTag(config.debugViewTag);
      }

      gleanMetricsContext = context;
    }
    GleanMetrics.setEnabled(config.enabled);
  },

  setEnabled: (enabled) => {
    gleanEnabled = enabled;
    Glean.setUploadEnabled(gleanEnabled);
  },

  registration: {
    view: createEventFn(registration.view),
    submit: createEventFn(registration.submit),
    success: createEventFn(registration.submitSuccess),
  },

  login: {
    view: createEventFn(login.view),
    submit: createEventFn(login.submit),
    success: createEventFn(login.submitSuccess),
  },
};

export default GleanMetrics;
