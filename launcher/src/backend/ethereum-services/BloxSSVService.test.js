import { BloxSSVService } from './BloxSSVService.js';
import { networks } from './NodeService.js'
import { ServicePort, servicePortProtocol } from './ServicePort.js'
const log = require('electron-log');

test('BloxSSVService buildConfiguration', () => {
    const ports = [
        new ServicePort(null, 100, 200, servicePortProtocol.tcp),
        new ServicePort(null, 101, 202, servicePortProtocol.udp),
    ];

    jest.mock('./GethService');
    const GethService = require('./GethService');
    const mMock = jest.fn(() => { return "http-endpoint-string" });
    GethService.GethService.mockImplementation(() => {
        return {
            buildExecutionClientHttpEndpointUrl: mMock,
        };
    });

    jest.mock('./LighthouseService');
    const LighthouseService = require('./LighthouseService');
    const mMockLh = jest.fn(() => { return "http-lh-endpoint-string" });
    LighthouseService.LighthouseService.mockImplementation(() => {
        return {
            buildConsensusClientHttpEntpointUrl: mMockLh,
        };
    });

    const bloxService = new BloxSSVService(networks.prater, ports, "/opt/stereum/ssv", [new GethService.GethService()], [new LighthouseService.LighthouseService()]).buildConfiguration();

    log.info("cmd: ", bloxService.command);

    expect(bloxService.env.CONFIG_PATH).toMatch(/\/config.yaml/);
    expect(bloxService.volumes).toHaveLength(1);
    expect(bloxService.volumes).toContain("/opt/stereum/ssv/data:/data");
    expect(bloxService.ports).toHaveLength(2);
    expect(bloxService.id).toHaveLength(36);
    expect(bloxService.user).toMatch(/root/);
    expect(bloxService.image).toMatch(/bloxstaking\/ssv-node/);
});

test('BloxSSVService getServiceConfiguration', () => {
    jest.mock('./GethService');
    const GethService = require('./GethService');
    const mMock = jest.fn(() => { return "http-endpoint-string" });
    GethService.GethService.mockImplementation(() => {
        return {
            buildExecutionClientHttpEndpointUrl: mMock,
        };
    });

    jest.mock('./LighthouseService');
    const LighthouseService = require('./LighthouseService');
    const mMockLh = jest.fn(() => { return "http-lh-endpoint-string" });
    LighthouseService.LighthouseService.mockImplementation(() => {
        return {
            buildConsensusClientHttpEntpointUrl: mMockLh,
        };
    });

    const bloxService = new BloxSSVService(networks.prater, null, "/opt/stereum/ssv", [new GethService.GethService()], [new LighthouseService.LighthouseService()]).getServiceConfiguration();

    expect(bloxService.MetricsAPIPort).toBeDefined();
    expect(bloxService.eth2.Network).toMatch(/prater/);
    expect(bloxService.eth2.BeaconNodeAddr).toMatch(/http-lh-endpoint-string/);
    expect(bloxService.eth1.ETH1Addr).toMatch(/http-endpoint-string/);
    expect(bloxService.eth1.RegistryContractAddr).toHaveLength(42);
    expect(bloxService.OperatorPrivateKey).toBeDefined();
});

test('BloxSSVService getAvailablePorts', () => {
    const ports = new BloxSSVService(networks.prater, null, "/opt/stereum/ssv", [], []).getAvailablePorts();

    expect(ports).toHaveLength(2);
});

// EOF
