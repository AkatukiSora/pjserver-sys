/* eslint-disable import/no-unresolved, @typescript-eslint/no-explicit-any */
import { jest } from '@jest/globals';
import { mockClient, mockGuild, mockGuildMember, mockChatInputCommandInteraction } from '@shoginn/discordjs-mock';
import processInteraction, { loadCommands } from '../interaction.js';
import ping from '../commands/ping.js';
import { Container } from 'typedi';
import '../container.js';

describe('interaction handlers', () => {
  beforeEach(() => {
    Container.reset();
    Container.set('runMode', () => 'test');
  });
  it('loads commands into client', () => {
    const client = mockClient();
    loadCommands(client as any);
    expect(client.commands.get('ping')).toBe(ping);
  });

  it('processInteraction executes command', async () => {
    const client = mockClient();
    loadCommands(client as any);
    const guild = mockGuild(client);
    const member = mockGuildMember({ client, guild });
    const interaction = mockChatInputCommandInteraction({ client, name: 'ping', id: '1', member });

    const executeSpy = jest.spyOn(ping, 'execute').mockResolvedValue();

    await processInteraction(interaction as any);

    expect(executeSpy).toHaveBeenCalled();
  });

  it('handles unknown command', async () => {
    const client = mockClient();
    loadCommands(client as any);
    const guild = mockGuild(client);
    const member = mockGuildMember({ client, guild });
    const interaction = mockChatInputCommandInteraction({ client, name: 'none', id: '2', member });

    const replySpy = jest.spyOn(interaction, 'reply');

    await processInteraction(interaction as any);

    expect(replySpy).toHaveBeenCalled();
  });
});
