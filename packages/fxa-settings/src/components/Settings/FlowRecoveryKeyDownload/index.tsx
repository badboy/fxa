/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import FlowContainer from '../FlowContainer';
import ProgressBar from '../ProgressBar';
import DataBlock from '../../DataBlock';
import {
  FolderIconListItem,
  GlobeIconListItem,
  LockIconListItem,
  PrinterIconListItem,
} from '../../IconListItem';
import ButtonDownloadRecoveryKey from '../../ButtonDownloadRecoveryKey';
import { Link, navigate } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import { RecoveryKeyImage } from '../../images';

export type FlowRecoveryKeyDownloadProps = {
  currentStep: number;
  localizedCustomBackButtonTitle: string;
  localizedFlowContainerTitle: string;
  navigateForward: (e: React.MouseEvent<HTMLElement>) => void;
  numberOfSteps: number;
  recoveryKeyValue: string;
  viewName: string;
};

export const FlowRecoveryKeyDownload = ({
  currentStep,
  localizedCustomBackButtonTitle,
  localizedFlowContainerTitle,
  navigateForward,
  numberOfSteps,
  recoveryKeyValue,
  viewName,
}: FlowRecoveryKeyDownloadProps) => {
  // metrics

  return (
    <FlowContainer
      title={localizedFlowContainerTitle}
      onBackButtonClick={() => navigate('/settings')}
      {...{ localizedCustomBackButtonTitle }}
    >
      <div className="w-full flex flex-col gap-4">
        <ProgressBar {...{ currentStep, numberOfSteps }} />
        <RecoveryKeyImage className="my-6 mx-auto" />

        <FtlMsg id="flow-recovery-key-download-heading">
          <h2 className="font-bold text-xl">
            {/* This is an em dash - add space? */}
            Account recovery key generated — store it in a place you’ll remember
          </h2>
        </FtlMsg>
        <FtlMsg id="flow-recovery-key-download-info">
          <p className="text-sm">
            This key will help recover your data if you forget your password.{' '}
          </p>
        </FtlMsg>
        <DataBlock value={recoveryKeyValue} isInline />
        <FtlMsg id="flow-recovery-key-download-storage-ideas-heading">
          <h3 className="font-bold -mb-4">
            Some ideas for storing your recovery key
          </h3>
        </FtlMsg>
        <ul>
          <FolderIconListItem>
            <FtlMsg id="flow-recovery-key-download-storage-ideas-folder">
              <p>Memorable folder in your device</p>
            </FtlMsg>
          </FolderIconListItem>
          <GlobeIconListItem>
            <FtlMsg id="flow-recovery-key-download-storage-ideas-cloud">
              <p>Trusted cloud storage</p>
            </FtlMsg>
          </GlobeIconListItem>
          <PrinterIconListItem>
            <FtlMsg id="flow-recovery-key-download-storage-ideas-print">
              <p>Print and keep a physical copy</p>
            </FtlMsg>
          </PrinterIconListItem>
          <LockIconListItem>
            <FtlMsg id="flow-recovery-key-download-storage-ideas-pwd-manager">
              <p>Password manager</p>
            </FtlMsg>
          </LockIconListItem>
        </ul>
        <ButtonDownloadRecoveryKey {...{ recoveryKeyValue, viewName }} />
        <FtlMsg id="flow-recovery-key-download-next-link">
          <Link
            to=""
            className="text-sm link-blue text-center py-2"
            onClick={navigateForward}
          >
            Next
          </Link>
        </FtlMsg>
      </div>
    </FlowContainer>
  );
};

export default FlowRecoveryKeyDownload;
