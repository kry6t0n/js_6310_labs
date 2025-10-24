import { getFromAPI, escapeMarkdown } from '../utils/api.js';

export async function handleConfigCommand(ctx) {
  await ctx.sendChatAction('typing');
  const config = await getFromAPI('/config');
  if (config) {
    const configString = JSON.stringify(config, null, 2);
    await ctx.reply('<code>' + escapeMarkdown(configString) + '</code>', {
      parse_mode: 'HTML'
    });
  } else {
    await ctx.reply('❌ Не удалось получить конфигурацию');
  }
}

export async function handleStatusCommand(ctx) {
  await ctx.sendChatAction('typing');
  const status = await getFromAPI('/status');
  if (status) {
    const statusString = JSON.stringify(status, null, 2);
    await ctx.reply('<code>' + escapeMarkdown(statusString) + '</code>', {
      parse_mode: 'HTML'
    });
  } else {
    await ctx.reply('❌ Не удалось получить статус');
  }
}

export async function handleDevicesCommand(ctx) {
  await ctx.sendChatAction('typing');
  const devices = await getFromAPI('/devices');
  if (devices) {
    const devicesString = JSON.stringify(devices, null, 2);
    await ctx.reply('<code>' + escapeMarkdown(devicesString) + '</code>', {
      parse_mode: 'HTML'
    });
  } else {
    await ctx.reply('❌ Не удалось получить устройства');
  }
}

export async function handleProjectCommand(ctx) {
  const projectId = ctx.message.text.split(' ')[1] || '1';
  await ctx.sendChatAction('typing');
  const project = await getFromAPI(`/projects/${projectId}`);
  if (project) {
    const projectString = JSON.stringify(project, null, 2);
    await ctx.reply(`<code>${escapeMarkdown(projectString)}</code>`, {
      parse_mode: 'HTML'
    });
  } else {
    await ctx.reply(`❌ Не удалось получить проект ${projectId}`);
  }
}