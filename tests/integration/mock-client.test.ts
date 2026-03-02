import { MockNinjaTraderClient } from '../../src/integration/ninjatrader';

describe('MockNinjaTraderClient', () => {
  let client: MockNinjaTraderClient;

  beforeEach(async () => {
    client = new MockNinjaTraderClient();
    await client.connect();
  });

  afterEach(async () => {
    await client.disconnect();
  });

  it('connects and reports connected', () => {
    expect(client.isConnected()).toBe(true);
  });

  it('returns empty positions initially', async () => {
    const positions = await client.getPositions();
    expect(positions).toEqual([]);
  });

  it('sends order and creates position', async () => {
    const result = await client.sendOrder({
      instrument: 'ES 03-25',
      side: 'long',
      quantity: 1,
      orderType: 'market',
    });
    expect(result).not.toBeNull();
    expect(result!.orderId).toBeDefined();
    const positions = await client.getPositions();
    expect(positions.length).toBe(1);
    expect(positions[0].side).toBe('long');
    expect(positions[0].quantity).toBe(1);
  });

  it('getAccountSummary returns mock summary', async () => {
    const summary = await client.getAccountSummary();
    expect(summary).not.toBeNull();
    expect(summary!.balance).toBe(100000);
  });
});
