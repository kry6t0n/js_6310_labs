import { getFromAPI, escapeMarkdown } from '../utils/api.js';

export async function handleProject1(ctx) {
  await handleProjectCallback(ctx, 1);
}

export async function handleProject2(ctx) {
  await handleProjectCallback(ctx, 2);
}

export async function handleProject3(ctx) {
  await handleProjectCallback(ctx, 3);
}

async function handleProjectCallback(ctx, projectId) {
  const project = await getFromAPI(`/projects/${projectId}`);
  if (project) {
    const projectString = JSON.stringify(project, null, 2);
    await ctx.reply(`📁 Проект ${projectId}:\n<code>${escapeMarkdown(projectString)}</code>`, {
      parse_mode: 'HTML'
    });
  } else {
    await ctx.reply(`❌ Не удалось получить проект ${projectId}`);
  }
  await ctx.answerCbQuery();
}