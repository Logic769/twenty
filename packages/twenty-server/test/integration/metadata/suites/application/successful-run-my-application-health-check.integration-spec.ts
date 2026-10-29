import { createHash } from 'crypto';

import { TEST_APPLICATION_PACKAGE_JSON_CHECKSUM } from 'test/integration/metadata/suites/application/constants/test-application-package-json.constant';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { findOneApplication } from 'test/integration/metadata/suites/application/utils/find-one-application.util';
import { myApplicationPreferences } from 'test/integration/metadata/suites/application/utils/my-application-preferences.util';
import { runApplicationHealthCheck } from 'test/integration/metadata/suites/application/utils/run-application-health-check.util';
import { runMyApplicationHealthCheck } from 'test/integration/metadata/suites/application/utils/run-my-application-health-check.util';
import {
  type ApplicationWithUserHealthCheck,
  setupApplicationWithUserHealthCheck,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-user-health-check.util';
import {
  type ApplicationWithVariable,
  setupApplicationWithVariable,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { updateMyUserApplicationVariable } from 'test/integration/metadata/suites/application/utils/update-my-user-application-variable.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { type Manifest } from 'twenty-shared/application';
import { v4 as uuidv4 } from 'uuid';

import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

type HealthCheckSource = {
  universalIdentifier: string;
  name: string;
  source: string;
};

const APPLICATION_UNIVERSAL_IDENTIFIER = uuidv4();
const ROLE_UNIVERSAL_IDENTIFIER = uuidv4();
const LANGUAGE_VARIABLE_UNIVERSAL_IDENTIFIER = uuidv4();
const APPLICATION_NAME = 'Application with a user health check';

const WORKSPACE_HEALTH_CHECK: HealthCheckSource = {
  universalIdentifier: uuidv4(),
  name: 'workspace-health-check',
  source: `export const handler = (_payload, context) => ({
  status: 'INFO',
  title: 'Workspace check run by ' + String(context.userWorkspaceId),
});`,
};

const USER_HEALTH_CHECK: HealthCheckSource = {
  universalIdentifier: uuidv4(),
  name: 'user-health-check',
  source: `export const handler = (_payload, context) => ({
  status: 'WARNING',
  title: 'User check run by ' + context.workspaceMemberId + ' as ' + context.userWorkspaceId,
  description: 'Language: ' + process.env.LANGUAGE,
});`,
};

const HEALTH_CHECKS = [WORKSPACE_HEALTH_CHECK, USER_HEALTH_CHECK];

const buildHealthCheckManifest = ({
  withUserHealthCheck,
}: {
  withUserHealthCheck: boolean;
}): Manifest =>
  buildBaseManifest({
    appId: APPLICATION_UNIVERSAL_IDENTIFIER,
    roleId: ROLE_UNIVERSAL_IDENTIFIER,
    overrides: {
      application: {
        universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        defaultRoleUniversalIdentifier: ROLE_UNIVERSAL_IDENTIFIER,
        displayName: APPLICATION_NAME,
        description: 'App for testing the user health check',
        applicationVariables: {
          LANGUAGE: {
            universalIdentifier: LANGUAGE_VARIABLE_UNIVERSAL_IDENTIFIER,
            scope: 'USER',
            value: 'en',
          },
        },
        healthCheckLogicFunction: {
          universalIdentifier: WORKSPACE_HEALTH_CHECK.universalIdentifier,
        },
        ...(withUserHealthCheck
          ? {
              userHealthCheckLogicFunction: {
                universalIdentifier: USER_HEALTH_CHECK.universalIdentifier,
              },
            }
          : {}),
        packageJsonChecksum: TEST_APPLICATION_PACKAGE_JSON_CHECKSUM,
        yarnLockChecksum: null,
      },
      logicFunctions: HEALTH_CHECKS.map(
        ({ universalIdentifier, name, source }) => ({
          universalIdentifier,
          name,
          handlerName: 'handler',
          sourceHandlerPath: `src/${name}.ts`,
          builtHandlerPath: `dist/${name}.mjs`,
          builtHandlerChecksum: createHash('sha256')
            .update(source)
            .digest('hex'),
          timeoutSeconds: 10,
        }),
      ),
    },
  });

describe('Run my application health check should succeed', () => {
  let applicationId: string;
  let healthCheckOnlyApplication: ApplicationWithUserHealthCheck;
  let applicationWithoutHealthCheck: ApplicationWithVariable;

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      name: APPLICATION_NAME,
      description: 'App for testing the user health check',
      sourcePath: 'user-health-check',
    });
    jest.useRealTimers();

    for (const healthCheck of HEALTH_CHECKS) {
      await uploadApplicationFile({
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        fileFolder: 'BuiltLogicFunction',
        filePath: `dist/${healthCheck.name}.mjs`,
        filename: `${healthCheck.name}.mjs`,
        contentType: 'application/javascript',
        fileBuffer: Buffer.from(healthCheck.source),
        expectToFail: false,
      });
    }

    await syncApplication({
      manifest: buildHealthCheckManifest({ withUserHealthCheck: true }),
      expectToFail: false,
    });
    jest.useRealTimers();

    const { data } = await findOneApplication({
      input: { universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER },
      gqlFields: 'id',
      expectToFail: false,
    });

    applicationId = data.findOneApplication.id;

    healthCheckOnlyApplication = await setupApplicationWithUserHealthCheck({
      name: 'Application with only a user health check',
    });

    applicationWithoutHealthCheck = await setupApplicationWithVariable({
      name: 'Application without a user health check',
      variableKey: 'RECORD_MY_MEETINGS',
      variableScope: 'USER',
    });
    jest.useRealTimers();
  }, 240000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier:
        healthCheckOnlyApplication.universalIdentifier,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier:
        applicationWithoutHealthCheck.universalIdentifier,
    });
  });

  it('should list every application with a USER health check, even one with nothing else for the member to set', async () => {
    const { data } = await myApplicationPreferences({
      input: {},
      gqlFields: 'applicationId hasUserHealthCheck',
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: false,
    });

    expect(data.myApplicationPreferences).toEqual(
      expect.arrayContaining([
        { applicationId, hasUserHealthCheck: true },
        {
          applicationId: healthCheckOnlyApplication.id,
          hasUserHealthCheck: true,
        },
        {
          applicationId: applicationWithoutHealthCheck.id,
          hasUserHealthCheck: false,
        },
      ]),
    );
  });

  it('should run the USER health check as the member who asks, with their own variable values', async () => {
    await updateMyUserApplicationVariable({
      input: {
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        key: 'LANGUAGE',
        value: 'fr',
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: false,
    });
    await updateMyUserApplicationVariable({
      input: {
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        key: 'LANGUAGE',
        value: 'de',
      },
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      expectToFail: false,
    });

    const { data: jonyData } = await runMyApplicationHealthCheck({
      input: { applicationId },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: false,
    });

    expect(jonyData.runMyApplicationHealthCheck).toEqual({
      status: 'WARNING',
      title: `User check run by ${WORKSPACE_MEMBER_DATA_SEED_IDS.JONY} as ${USER_WORKSPACE_DATA_SEED_IDS.JONY}`,
      description: 'Language: fr',
    });

    const { data: janeData } = await runMyApplicationHealthCheck({
      input: { applicationId },
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      expectToFail: false,
    });

    expect(janeData.runMyApplicationHealthCheck).toEqual({
      status: 'WARNING',
      title: `User check run by ${WORKSPACE_MEMBER_DATA_SEED_IDS.JANE} as ${USER_WORKSPACE_DATA_SEED_IDS.JANE}`,
      description: 'Language: de',
    });
  });

  it('should keep running only the WORKSPACE health check, with nobody behind it, for the application page', async () => {
    const { data } = await runApplicationHealthCheck({
      input: { applicationId },
      expectToFail: false,
    });

    expect(data.runApplicationHealthCheck).toEqual({
      status: 'INFO',
      title: 'Workspace check run by null',
    });
  });

  it('should return null for an application without a USER health check', async () => {
    const { data } = await runMyApplicationHealthCheck({
      input: { applicationId: applicationWithoutHealthCheck.id },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: false,
    });

    expect(data.runMyApplicationHealthCheck).toBeNull();
  });

  it('should clear the USER health check when a full sync no longer declares it', async () => {
    await syncApplication({
      manifest: buildHealthCheckManifest({ withUserHealthCheck: false }),
      expectToFail: false,
    });
    jest.useRealTimers();

    const [storedApplication] = await globalThis.testDataSource.query(
      `SELECT "userHealthCheckLogicFunctionId" FROM core."application" WHERE id = $1`,
      [applicationId],
    );

    expect(storedApplication.userHealthCheckLogicFunctionId).toBeNull();

    const { data } = await runMyApplicationHealthCheck({
      input: { applicationId },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: false,
    });

    expect(data.runMyApplicationHealthCheck).toBeNull();
  });
});
