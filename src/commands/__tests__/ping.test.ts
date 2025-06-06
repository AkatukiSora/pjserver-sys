/* eslint-disable import/no-unresolved, @typescript-eslint/no-explicit-any */
import { jest } from '@jest/globals';
import { mockClient, mockGuild, mockGuildMember, mockChatInputCommandInteraction } from '@shoginn/discordjs-mock';
import { Container } from 'typedi';
import '../../container.js';

const { default: ping } = await import('../ping.js');

describe('ping command', () => {
  it('replies with ping embed and edits after fetch', async () => {
    const client = mockClient();
    const guild = mockGuild(client);
    const member = mockGuildMember({ client, guild });
    const interaction = mockChatInputCommandInteraction({ client, name: 'ping', id: '123', member });

    const replySpy = jest.spyOn(interaction, 'reply');
    const fetchSpy = jest.spyOn(interaction, 'fetchReply');
    const editSpy = jest.spyOn(interaction, 'editReply');

    Container.reset();
    Container.set('runMode', () => '開発環境');

    await ping.execute(interaction as any);

    expect(replySpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledTimes(2); // editReply triggers fetchReply
    expect(editSpy).toHaveBeenCalledTimes(1);

    const firstCall = replySpy.mock.calls[0][0] as any;
    expect(firstCall.embeds[0].title).toBe('ping');
    expect(firstCall.embeds[0].description).toContain('開発環境');
  });
});
