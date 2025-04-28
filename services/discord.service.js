const { Client, GatewayIntentBits, WebhookClient } = require('discord.js');

class DiscordService {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.webhook = new WebhookClient({
      url: process.env.DISCORD_WEBHOOK_URL,
    });

    this.client.on('ready', () => {
      console.log(`Logged in as ${this.client.user.tag}`);
    });

    this.setupCommands();
  }

  async initialize() {
    await this.client.login(process.env.DISCORD_BOT_TOKEN);
  }

  async setupCommands() {
    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isCommand()) return;

      switch (interaction.commandName) {
        case 'status':
          await this.handleStatusCommand(interaction);
          break;
        case 'link':
          await this.handleLinkCommand(interaction);
          break;
        case 'analyze':
          await this.handleAnalyzeCommand(interaction);
          break;
      }
    });
  }

  async handleStatusCommand(interaction) {
    await interaction.reply({
      content: 'CodeFusion is running normally! 🚀',
      ephemeral: true,
    });
  }

  async handleLinkCommand(interaction) {
    const userId = interaction.user.id;
    // Link Discord user with CodeFusion account
    // Implementation depends on your user management system
    await interaction.reply({
      content: 'Please visit: ' + process.env.NEXT_PUBLIC_APP_URL + '/link-discord',
      ephemeral: true,
    });
  }

  async handleAnalyzeCommand(interaction) {
    await interaction.deferReply();
    // Implement code analysis logic here
    await interaction.editReply({
      content: 'Analysis complete! Check the results at: ' + process.env.NEXT_PUBLIC_APP_URL + '/analysis',
    });
  }

  async sendNotification(type, data) {
    const embedData = this.createEmbed(type, data);
    await this.webhook.send({
      embeds: [embedData],
    });
  }

  createEmbed(type, data) {
    switch (type) {
      case 'repository_created':
        return {
          title: '🎉 New Repository Created',
          description: `Repository "${data.name}" has been created`,
          color: 0x00ff00,
          fields: [
            { name: 'Owner', value: data.owner, inline: true },
            { name: 'Type', value: data.private ? 'Private' : 'Public', inline: true },
          ],
          timestamp: new Date(),
        };
      case 'code_analysis':
        return {
          title: '🔍 Code Analysis Complete',
          description: data.summary,
          color: 0x0099ff,
          fields: [
            { name: 'Repository', value: data.repository, inline: true },
            { name: 'Score', value: data.score.toString(), inline: true },
          ],
          timestamp: new Date(),
        };
      default:
        return {
          title: 'Notification',
          description: JSON.stringify(data),
          color: 0x808080,
          timestamp: new Date(),
        };
    }
  }
}

module.exports = new DiscordService(); 