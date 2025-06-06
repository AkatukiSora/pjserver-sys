/* eslint-disable import/no-unresolved, @typescript-eslint/no-explicit-any */
import { jest } from '@jest/globals';
import { mockClient, mockGuild, mockGuildMember, mockChatInputCommandInteraction } from '@shoginn/discordjs-mock';
import { Container } from 'typedi';
import '../../container.js';

const { default: restart } = await import('../restart.js');

describe('restart command', () => {
  it('replies and destroys client', async () => {
    const client = mockClient();
    const guild = mockGuild(client);
    const member = mockGuildMember({ client, guild });
    const interaction = mockChatInputCommandInteraction({ client, name: 'restart', id: '456', member });

    const replySpy = jest.spyOn(interaction, 'reply');
    const destroySpy = jest.spyOn(interaction.client, 'destroy');
    Container.reset();
    Container.set('logger', { info: jest.fn() });

    await restart.execute(interaction as any);

    expect(replySpy).toHaveBeenCalledWith('再起動しています');
    expect(destroySpy).toHaveBeenCalled();
  });
});
