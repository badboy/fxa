/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseAuthModel, Proc } from './base-auth';
import { uuidTransformer, intBoolTransformer } from '../../transformers';
import { convertError } from '../../mysql';

export class RecoveryKey extends BaseAuthModel {
  public static tableName = 'recoveryKeys';
  public static idColumn = 'uid';

  protected $uuidFields = ['uid', 'recoveryKeyIdHash'];
  protected $intBoolFields = ['enabled'];

  // table fields
  uid!: string;
  recoveryKeyIdHash!: string;
  recoveryData!: string;
  createdAt!: number;
  verifiedAt!: number;
  enabled!: boolean;
  recoveryKeyHint!: string | null;

  static async create({
    uid,
    recoveryKeyId,
    recoveryData,
    enabled,
  }: Pick<RecoveryKey, 'uid' | 'recoveryData' | 'enabled'> & {
    recoveryKeyId: string;
  }) {
    try {
      await RecoveryKey.callProcedure(
        Proc.CreateRecoveryKey,
        uuidTransformer.to(uid),
        BaseAuthModel.sha256(recoveryKeyId),
        recoveryData,
        Date.now(),
        !!enabled
      );
    } catch (e) {
      throw convertError(e);
    }
  }

  static async update({
    uid,
    recoveryKeyId,
    enabled,
  }: Pick<RecoveryKey, 'uid' | 'enabled'> & {
    recoveryKeyId: string;
  }) {
    try {
      await RecoveryKey.callProcedure(
        Proc.UpdateRecoveryKey,
        uuidTransformer.to(uid),
        BaseAuthModel.sha256(recoveryKeyId),
        null,
        intBoolTransformer.to(enabled)
      );
    } catch (e) {
      throw convertError(e);
    }
  }

  static async updateRecoveryKeyHint({
    uid,
    recoveryKeyHint,
  }: Pick<RecoveryKey, 'uid' | 'recoveryKeyHint'>) {
    try {
      const uidBuffer = uuidTransformer.to(uid);
      const result = await RecoveryKey.query()
        .where(uid, uidBuffer)
        .update({ recoveryKeyHint: recoveryKeyHint });
      return !!result;
    } catch (e) {
      throw convertError(e);
    }
  }

  static async delete(uid: string) {
    return RecoveryKey.callProcedure(
      Proc.DeleteRecoveryKey,
      uuidTransformer.to(uid)
    );
  }

  static async findByUid(uid: string) {
    const { rows } = await RecoveryKey.callProcedure(
      Proc.RecoveryKey,
      uuidTransformer.to(uid)
    );
    if (!rows.length) {
      return null;
    }
    return RecoveryKey.fromDatabaseJson(rows[0]);
  }

  static async findHintByUid(uid: string) {
    const recoveryKey = await RecoveryKey.query()
      .select('recoveryKeyHint')
      .where('uid', uuidTransformer.to(uid));
    return recoveryKey[0].recoveryKeyHint;
  }

  static async exists(uid: string) {
    const count = await RecoveryKey.query()
      .select('uid')
      .where('uid', uuidTransformer.to(uid))
      .andWhereRaw('enabled = 1')
      .resultSize();
    return count === 1;
  }
}
