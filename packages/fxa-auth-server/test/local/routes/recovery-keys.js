/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const { assert } = require('chai');
const getRoute = require('../../routes_helpers').getRoute;
const mocks = require('../../mocks');
const errors = require('../../../lib/error');

let log, db, customs, mailer, routes, route, request, response;
const email = 'test@email.com';
const recoveryKeyId = '000000';
const recoveryData = '11111111111';
const recoveryKeyHint = 'super secret location';
const uid = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

let mockAccountEventsManager;

describe('POST /recoveryKey', () => {
  beforeEach(() => {
    mockAccountEventsManager = mocks.mockAccountEventsManager();
  });

  after(() => {
    mocks.unMockAccountEventsManager();
  });

  describe('should create account recovery key', () => {
    let requestOptions;

    beforeEach(() => {
      requestOptions = {
        credentials: { uid, email },
        log,
        payload: { recoveryKeyId, recoveryData, enabled: true },
      };
      return setup({ db: { email } }, {}, '/recoveryKey', requestOptions).then(
        (r) => (response = r)
      );
    });

    it('returned the correct response', () => {
      assert.deepEqual(response, {});
    });

    it('recorded security event', () => {
      sinon.assert.calledWith(
        mockAccountEventsManager.recordSecurityEvent,
        sinon.match.defined,
        sinon.match({
          name: 'account.recovery_key_added',
          ipAddr: '63.245.221.32',
          uid: requestOptions.credentials.uid,
          tokenId: requestOptions.credentials.id,
        })
      );
    });

    it('called log.begin correctly', () => {
      assert.equal(log.begin.callCount, 1);
      const args = log.begin.args[0];
      assert.equal(args.length, 2);
      assert.equal(args[0], 'createRecoveryKey');
      assert.equal(args[1], request);
    });

    it('called db.createRecoveryKey correctly', () => {
      assert.equal(db.createRecoveryKey.callCount, 1);
      const args = db.createRecoveryKey.args[0];
      assert.equal(args.length, 4);
      assert.equal(args[0], uid);
      assert.equal(args[1], recoveryKeyId);
      assert.equal(args[2], recoveryData);
      assert.equal(args[3], true);
    });

    it('called log.info correctly', () => {
      assert.equal(log.info.callCount, 1);
      const args = log.info.args[0];
      assert.equal(args.length, 2);
      assert.equal(args[0], 'account.recoveryKey.created');
    });

    it('called request.emitMetricsEvent correctly', () => {
      assert.equal(
        request.emitMetricsEvent.callCount,
        1,
        'called emitMetricsEvent'
      );
      const args = request.emitMetricsEvent.args[0];
      assert.equal(
        args[0],
        'recoveryKey.created',
        'called emitMetricsEvent with correct event'
      );
      assert.equal(
        args[1]['uid'],
        uid,
        'called emitMetricsEvent with correct event'
      );
    });

    it('called mailer.sendPostAddAccountRecoveryEmail correctly', () => {
      assert.equal(mailer.sendPostAddAccountRecoveryEmail.callCount, 1);
      const args = mailer.sendPostAddAccountRecoveryEmail.args[0];
      assert.equal(args.length, 3);
      assert.equal(args[0][0].email, email);
    });
  });

  describe('should create disabled account recovery key', () => {
    beforeEach(() => {
      const requestOptions = {
        credentials: { uid, email },
        log,
        payload: { recoveryKeyId, recoveryData, enabled: false },
      };
      return setup({ db: { email } }, {}, '/recoveryKey', requestOptions).then(
        (r) => (response = r)
      );
    });

    it('returned the correct response', () => {
      assert.deepEqual(response, {});
    });

    it('called db.createRecoveryKey correctly', () => {
      assert.equal(db.createRecoveryKey.callCount, 1);
      const args = db.createRecoveryKey.args[0];
      assert.equal(args.length, 4);
      assert.equal(args[0], uid);
      assert.equal(args[1], recoveryKeyId);
      assert.equal(args[2], recoveryData);
      assert.equal(args[3], false);
    });
  });

  describe('should verify account recovery key', () => {
    beforeEach(() => {
      mockAccountEventsManager = mocks.mockAccountEventsManager();
      const requestOptions = {
        credentials: { uid, email },
        log,
        payload: { recoveryKeyId, enabled: false },
      };
      return setup(
        { db: { email } },
        {},
        '/recoveryKey/verify',
        requestOptions
      ).then((r) => (response = r));
    });
    after(() => {
      mocks.unMockAccountEventsManager();
    });

    it('returned the correct response', () => {
      assert.deepEqual(response, {});
    });

    it('called customs.checkAuthenticated correctly', () => {
      assert.equal(customs.checkAuthenticated.callCount, 1);
      const args = customs.checkAuthenticated.args[0];
      assert.equal(args.length, 3);
      assert.deepEqual(args[0], request);
      assert.equal(args[1], uid);
      assert.equal(args[2], 'getRecoveryKey');
    });

    it('called db.updateRecoveryKey correctly', () => {
      assert.equal(db.updateRecoveryKey.callCount, 1);
      const args = db.updateRecoveryKey.args[0];
      assert.equal(args.length, 3);
      assert.equal(args[0], uid);
      assert.equal(args[1], recoveryKeyId);
      assert.equal(args[2], true);
    });

    it('called request.emitMetricsEvent correctly', () => {
      assert.equal(
        request.emitMetricsEvent.callCount,
        1,
        'called emitMetricsEvent'
      );
      const args = request.emitMetricsEvent.args[0];
      assert.equal(
        args[0],
        'recoveryKey.created',
        'called emitMetricsEvent with correct event'
      );
      assert.equal(
        args[1]['uid'],
        uid,
        'called emitMetricsEvent with correct event'
      );
    });

    it('called mailer.sendPostAddAccountRecoveryEmail correctly', () => {
      assert.equal(mailer.sendPostAddAccountRecoveryEmail.callCount, 1);
      const args = mailer.sendPostAddAccountRecoveryEmail.args[0];
      assert.equal(args.length, 3);
      assert.equal(args[0][0].email, email);
    });

    it('records security event', () => {
      sinon.assert.calledWith(
        mockAccountEventsManager.recordSecurityEvent,
        sinon.match.defined,
        sinon.match({
          name: 'account.recovery_key_challenge_success',
          ipAddr: '63.245.221.32',
          uid: uid,
          tokenId: undefined,
        })
      );
    });
  });

  describe('should not verify invalid account recovery key', () => {
    let error;

    beforeEach(() => {
      mockAccountEventsManager = mocks.mockAccountEventsManager();
      const requestOptions = {
        credentials: { uid, email, tokenVerificationId: true },
        log,
        payload: { recoveryKeyId: recoveryKeyId, enabled: false },
      };
      return setup(
        { db: { email } },
        {},
        '/recoveryKey/verify',
        requestOptions
      ).catch((e) => {
        error = e;
      });
    });
    after(() => {
      mocks.unMockAccountEventsManager();
    });

    it('records security event', () => {
      assert.isDefined(error);
      sinon.assert.calledWith(
        mockAccountEventsManager.recordSecurityEvent,
        sinon.match.defined,
        sinon.match({
          name: 'account.recovery_key_challenge_failure',
          ipAddr: '63.245.221.32',
          uid: uid,
          tokenId: undefined,
        })
      );
    });
  });

  describe('should fail for unverified session', () => {
    beforeEach(() => {
      mockAccountEventsManager = mocks.mockAccountEventsManager();
    });

    afterEach(() => {
      mocks.unMockAccountEventsManager();
    });

    function makeUnverifiedReq() {
      const requestOptions = {
        credentials: { uid, email, tokenVerificationId: '1232311' },
      };
      return setup({ db: {} }, {}, '/recoveryKey', requestOptions);
    }

    it('returned the correct response', () => {
      makeUnverifiedReq().then(assert.fail, (err) => {
        assert.deepEqual(
          err.errno,
          errors.ERRNO.SESSION_UNVERIFIED,
          'returns unverified session error'
        );
      });
    });

    it('records security event', () => {
      makeUnverifiedReq().then(assert.fail, (err) => {
        sinon.assert.calledWith(
          mockAccountEventsManager.recordSecurityEvent,
          sinon.match.defined,
          sinon.match({
            name: 'account.xxx',
            ipAddr: '63.245.221.32',
            uid: uid,
            tokenId: undefined,
          })
        );
        assert.deepEqual(
          err.errno,
          errors.ERRNO.SESSION_UNVERIFIED,
          'returns unverified session error'
        );
      });
    });
  });
});

describe('GET /recoveryKey/{recoveryKeyId}', () => {
  describe('should get account recovery key', () => {
    beforeEach(() => {
      const requestOptions = {
        credentials: { uid, email },
        params: { recoveryKeyId },
        log,
      };
      return setup(
        { db: { recoveryData, recoveryKeyId } },
        {},
        '/recoveryKey/{recoveryKeyId}',
        requestOptions
      ).then((r) => (response = r));
    });

    it('returned the correct response', () => {
      assert.deepEqual(
        response.recoveryData,
        recoveryData,
        'return recovery data'
      );
    });

    it('called log.begin correctly', () => {
      assert.equal(log.begin.callCount, 1);
      const args = log.begin.args[0];
      assert.equal(args.length, 2);
      assert.equal(args[0], 'getRecoveryKey');
      assert.equal(args[1], request);
    });

    it('called customs.checkAuthenticated correctly', () => {
      assert.equal(customs.checkAuthenticated.callCount, 1);
      const args = customs.checkAuthenticated.args[0];
      assert.equal(args.length, 3);
      assert.deepEqual(args[0], request);
      assert.equal(args[1], uid);
      assert.equal(args[2], 'getRecoveryKey');
    });

    it('called db.getRecoveryKey correctly', () => {
      assert.equal(db.getRecoveryKey.callCount, 1);
      const args = db.getRecoveryKey.args[0];
      assert.equal(args.length, 2);
      assert.equal(args[0], uid);
      assert.equal(args[1], recoveryKeyId);
    });
  });

  describe('fails to return recovery data with recoveryKeyId mismatch', () => {
    beforeEach(() => {
      const requestOptions = {
        credentials: { uid, email },
        params: { recoveryKeyId },
        log,
      };
      return setup(
        { db: { recoveryData, recoveryKeyIdInvalid: true } },
        {},
        '/recoveryKey/{recoveryKeyId}',
        requestOptions
      ).then(assert.fail, (err) => (response = err));
    });

    it('returned the correct response', () => {
      assert.deepEqual(
        response.errno,
        errors.ERRNO.RECOVERY_KEY_INVALID,
        'correct invalid account recovery key errno'
      );
    });
  });
});

describe('POST /recoveryKey/exists', () => {
  describe('should check if account recovery key exists using sessionToken', () => {
    beforeEach(() => {
      const requestOptions = {
        credentials: { uid, email },
        log,
      };
      return setup(
        { db: { recoveryData } },
        {},
        '/recoveryKey/exists',
        requestOptions
      ).then((r) => (response = r));
    });

    it('returned the correct response', () => {
      assert.equal(response.exists, true, 'exists ');
    });

    it('called log.begin correctly', () => {
      assert.equal(log.begin.callCount, 1);
      const args = log.begin.args[0];
      assert.equal(args.length, 2);
      assert.equal(args[0], 'recoveryKeyExists');
      assert.equal(args[1], request);
    });

    it('called db.recoveryKeyExists correctly', () => {
      assert.equal(db.recoveryKeyExists.callCount, 1);
      const args = db.recoveryKeyExists.args[0];
      assert.equal(args.length, 1);
      assert.equal(args[0], uid);
    });
  });

  describe('should check if account recovery key exists using email', () => {
    beforeEach(() => {
      const requestOptions = {
        payload: { email },
        log,
      };
      return setup(
        { db: { uid, email, recoveryData } },
        {},
        '/recoveryKey/exists',
        requestOptions
      ).then((r) => (response = r));
    });

    it('returned the correct response', () => {
      assert.deepEqual(response.exists, true, 'exists ');
    });

    it('called log.begin correctly', () => {
      assert.equal(log.begin.callCount, 1);
      const args = log.begin.args[0];
      assert.equal(args.length, 2);
      assert.equal(args[0], 'recoveryKeyExists');
      assert.equal(args[1], request);
    });

    it('called customs.check correctly', () => {
      assert.equal(customs.check.callCount, 1);
      const args = customs.check.args[0];
      assert.equal(args.length, 3);
      assert.equal(args[1], email);
      assert.equal(args[2], 'recoveryKeyExists');
    });

    it('called db.recoveryKeyExists correctly', () => {
      assert.equal(db.recoveryKeyExists.callCount, 1);
      const args = db.recoveryKeyExists.args[0];
      assert.equal(args.length, 1);
      assert.equal(args[0], uid);
    });
  });
});

describe('DELETE /recoveryKey', () => {
  beforeEach(() => {
    mockAccountEventsManager = mocks.mockAccountEventsManager();
  });

  afterEach(() => {
    mocks.unMockAccountEventsManager();
  });

  describe('should delete account recovery key', () => {
    beforeEach(() => {
      const requestOptions = {
        method: 'DELETE',
        credentials: { uid, email },
        log,
      };
      return setup(
        { db: { recoveryData, email } },
        {},
        '/recoveryKey',
        requestOptions
      ).then((r) => (response = r));
    });

    it('returned the correct response', () => {
      assert.ok(response, 'empty response ');
    });

    it('called log.begin correctly', () => {
      assert.equal(log.begin.callCount, 1);
      const args = log.begin.args[0];
      assert.equal(args.length, 2);
      assert.equal(args[0], 'recoveryKeyDelete');
      assert.equal(args[1], request);
    });

    it('called db.deleteRecoveryKey correctly', () => {
      assert.equal(db.deleteRecoveryKey.callCount, 1);
      const args = db.deleteRecoveryKey.args[0];
      assert.equal(args.length, 1);
      assert.equal(args[0], uid);
    });

    it('called mailer.sendPostRemoveAccountRecoveryEmail correctly', () => {
      assert.equal(mailer.sendPostRemoveAccountRecoveryEmail.callCount, 1);
      const args = mailer.sendPostRemoveAccountRecoveryEmail.args[0];
      assert.equal(args.length, 3);
      assert.equal(args[0][0].email, email);
    });

    it('recorded security event', () => {
      sinon.assert.calledWith(
        mockAccountEventsManager.recordSecurityEvent,
        sinon.match.defined,
        sinon.match({
          name: 'account.recovery_key_removed',
          ipAddr: '63.245.221.32',
          uid: uid,
          tokenId: undefined,
        })
      );
    });
  });

  describe('should fail for unverified session', () => {
    beforeEach(() => {
      mockAccountEventsManager = mocks.mockAccountEventsManager();
      const requestOptions = {
        method: 'DELETE',
        credentials: { uid, email, tokenVerificationId: 'unverified' },
        log,
      };
      return setup(
        { db: { recoveryData } },
        {},
        '/recoveryKey',
        requestOptions
      ).then(assert.fail, (err) => (response = err));
    });

    after(() => {
      mocks.unMockAccountEventsManager();
    });

    it('returned the correct response', () => {
      assert.equal(
        response.errno,
        errors.ERRNO.SESSION_UNVERIFIED,
        'unverified session'
      );
    });
  });
});

describe('GET /recoveryKey/recoveryKeyHint', () => {
  describe('should fail for unknown recovery key', () => {
    beforeEach(() => {
      const requestOptions = {
        method: 'GET',
        credentials: { uid, email },
        log,
      };
      return setup(
        { db: {} },
        {},
        '/recoveryKey/recoveryKeyHint',
        requestOptions
      ).then(assert.fail, (err) => (response = err));
    });

    it('returned the correct response', () => {
      assert.equal(
        response.errno,
        errors.ERRNO.RECOVERY_KEY_NOT_FOUND,
        'Account recovery key not found'
      );
    });
  });

  describe('should retrieve the recovery key hint', () => {
    beforeEach(async () => {
      const requestOptions = {
        method: 'GET',
        credentials: { uid, email },
        log,
      };
      response = await setup(
        { db: { recoveryData, recoveryKeyHint } },
        {},
        '/recoveryKey/recoveryKeyHint',
        requestOptions
      );
    });

    it('returned the correct response', () => {
      assert.deepEqual(response, recoveryKeyHint);
      sinon.assert.calledOnceWithExactly(db.getRecoveryKeyHint, uid);
    });
  });
});

describe('POST /recoveryKey/recoveryKeyHint', () => {
  describe('should fail for unverified session', () => {
    beforeEach(() => {
      const requestOptions = {
        method: 'POST',
        credentials: { uid, email, tokenVerificationId: 'unverified' },
        log,
      };
      return setup(
        { db: {} },
        {},
        '/recoveryKey/recoveryKeyHint',
        requestOptions
      ).then(assert.fail, (err) => (response = err));
    });

    it('returned the correct response', () => {
      assert.equal(
        response.errno,
        errors.ERRNO.SESSION_UNVERIFIED,
        'unverified session'
      );
    });
  });

  describe('should fail for unknown recovery key', () => {
    beforeEach(() => {
      const requestOptions = {
        method: 'POST',
        credentials: { uid, email },
        log,
      };
      return setup(
        { db: {} },
        {},
        '/recoveryKey/recoveryKeyHint',
        requestOptions
      ).then(assert.fail, (err) => (response = err));
    });

    it('returned the correct response', () => {
      assert.equal(
        response.errno,
        errors.ERRNO.RECOVERY_KEY_NOT_FOUND,
        'Account recovery key not found'
      );
    });
  });

  describe('should update the recovery key hint', () => {
    beforeEach(async () => {
      const requestOptions = {
        method: 'POST',
        credentials: { uid, email },
        payload: { recoveryKeyHint: recoveryKeyHint },
        log,
      };
      response = await setup(
        { db: { recoveryData } },
        {},
        '/recoveryKey/recoveryKeyHint',
        requestOptions
      );
    });

    it('returned the correct response', () => {
      assert.deepEqual(response, {});
      sinon.assert.calledOnceWithExactly(
        db.updateRecoveryKeyHint,
        uid,
        recoveryKeyHint
      );
    });
  });
});

function setup(results, errors, path, requestOptions) {
  results = results || {};
  errors = errors || {};

  log = mocks.mockLog();
  db = mocks.mockDB(results.db, errors.db);
  customs = mocks.mockCustoms(errors.customs);
  mailer = mocks.mockMailer();
  routes = makeRoutes({ log, db, customs, mailer });
  route = getRoute(routes, path, requestOptions.method);
  request = mocks.mockRequest(requestOptions);
  request.emitMetricsEvent = sinon.spy(() => Promise.resolve({}));
  return runTest(route, request);
}

function makeRoutes(options = {}) {
  const log = options.log || mocks.mockLog();
  const db = options.db || mocks.mockDB();
  const customs = options.customs || mocks.mockCustoms();
  const config = options.config || { signinConfirmation: {} };
  const Password = require('../../../lib/crypto/password')(log, config);
  const mailer = options.mailer || mocks.mockMailer();
  return require('../../../lib/routes/recovery-key')(
    log,
    db,
    Password,
    config.verifierVersion,
    customs,
    mailer
  );
}

function runTest(route, request) {
  return route.handler(request);
}
