/* eslint-disable import/no-unresolved, @typescript-eslint/no-explicit-any */
import { jest } from '@jest/globals';
import { mockClient, mockGuild, mockGuildMember, mockChatInputCommandInteraction } from '@shoginn/discordjs-mock';
import { Container } from 'typedi';
import '../../container.js';

const { default: testCommand } = await import('../test.js');

describe('test command', () => {
  it('calls welcomeimage and replies with embed', async () => {
    const client = mockClient();
    const guild = mockGuild(client);
    const member = mockGuildMember({ client, guild });
    const interaction = mockChatInputCommandInteraction({ client, name: 'test', id: '789', member });

    const replySpy = jest.spyOn(interaction, 'reply');
    Container.reset();
    const welcomeimage = jest.fn().mockResolvedValue(Buffer.from('img'));
    Container.set('welcomeimage', welcomeimage);

    await testCommand.execute(interaction as any);

    expect(welcomeimage).toHaveBeenCalled();
    expect(replySpy).toHaveBeenCalled();
    const opts = replySpy.mock.calls[0][0] as any;
    expect(opts.embeds[0].data.title).toBe('welcome to プロセカ民営公園');
  });
});
