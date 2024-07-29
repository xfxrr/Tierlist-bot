"use strict";

// Dependencies
const { Client, Intents, MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const fs = require("fs");

// Load config
const config = JSON.parse(fs.readFileSync("config.json", "utf-8"));

const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

var usersInQueue = [];
var queue;
var testerID;

// Main
bot.on("ready", async () => {
	console.log("PvP Tierlist is running.");
	const guild = bot.guilds.cache.first();
	if (guild) {
		await guild.commands.set([
			{
				name: "queue",
				description: "Make queue."
			},
			{
				name: "stopqueue",
				description: "Deletes queue."
			},
			{
				name: "remove",
				description: "Removes a user from queue.",
				options: [
					{
						type: "STRING",
						name: "user",
						description: "User to remove in queue.",
						required: true
					}
				]
			},
			{
				name: "rank",
				description: "Set a rank to the specified user.",
				options: [
					{
						type: "STRING",
						name: "user",
						description: "User to give a rank.",
						required: true
					},
					{
						type: "STRING",
						name: "rank",
						description: "The rank to give to the user.",
						required: true
					}
				]
			},
			{
				name: "result",
				description: "Send test result.",
				options: [
					{
						type: "USER",
						name: "user",
						description: "The user who took the test.",
						required: true
					},
					{
						type: "STRING",
						name: "region",
						description: "The region of the user.",
						required: true
					},
					{
						type: "STRING",
						name: "username",
						description: "The username of the user.",
						required: true
					},
					{
						type: "STRING",
						name: "previous_rank",
						description: "The previous rank of the user.",
						required: true
					},
					{
						type: "STRING",
						name: "rank_earned",
						description: "The rank earned by the user.",
						required: true
					}
				]
			}
		]);
	} else {
		console.error("No guilds found for the bot.");
	}

	setInterval(() => {
		if (queue) {
			const button = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId("joinQueue")
						.setLabel("Join Queue")
						.setStyle("PRIMARY"),
				);

			const embed = new MessageEmbed()
				.setTitle("Tester(s) Available!")
				.setDescription(`The queue updates every 10 seconds.

**Queue**:
${usersInQueue.map((user, index) => `${+index + 1}. <@${user}>`).join("\n")}

**Active Testers**:
<@${testerID}>`);

			queue.edit({ embeds: [embed], components: [button] });
		}
	}, 10 * 1000);
});

bot.on("interactionCreate", async (interaction) => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === "queue") {
		if (!interaction.member.roles.cache.some(r => r.id === config.roleID)) {
			return interaction.reply({ content: "You do not have the required role.", ephemeral: true });
		}

		const button = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId("joinQueue")
					.setLabel("Join Queue")
					.setStyle("PRIMARY"),
			);

		const embed = new MessageEmbed()
			.setTitle("Tester(s) Available!")
			.setDescription(`The queue updates every 10 seconds.

**Queue**:

**Active Testers**:
<@${interaction.user.id}>`);

		testerID = interaction.user.id;
		const channel = interaction.guild.channels.cache.get(config.channelID);
		if (!channel) {
			return interaction.reply({ content: "Channel not found.", ephemeral: true });
		}

		queue = await channel.send({ embeds: [embed], components: [button] });
		await interaction.reply({ content: "Queue created successfully.", ephemeral: true });
	} else if (commandName === "stopqueue") {
		if (!interaction.member.permissions.has("ADMINISTRATOR")) {
			return interaction.reply({ content: "You do not have the required permissions.", ephemeral: true });
		}

		if (!queue) {
			return interaction.reply({ content: "No active queue to be deleted.", ephemeral: true });
		}

		usersInQueue = [];
		queue.delete();
		queue = null;

		await interaction.reply({ content: "Queue successfully deleted.", ephemeral: true });
	} else if (commandName === "remove") {
		if (!interaction.member.permissions.has("ADMINISTRATOR")) {
			return interaction.reply({ content: "You do not have the required permissions.", ephemeral: true });
		}

		var user = interaction.options.getString("user", true);

		const userIdMatch = user.match(/\d+/);

		if (userIdMatch) {
			user = userIdMatch[0];

			if (usersInQueue.includes(user)) {
				usersInQueue = usersInQueue.filter(u => u !== user);
				await interaction.reply({ content: "User successfully removed from the queue.", ephemeral: true });
			} else {
				await interaction.reply({ content: "User is not in the queue.", ephemeral: true });
			}
		} else {
			await interaction.reply({ content: "Invalid user ID.", ephemeral: true });
		}
	} else if (commandName === "rank") {
		if (!interaction.member.permissions.has("ADMINISTRATOR")) {
			return interaction.reply({ content: "You do not have the required permissions.", ephemeral: true });
		}

		var user = interaction.options.getString("user", true);
		var rank = interaction.options.getString("rank", true);

		const userIdMatch = user.match(/\d+/);
		const rankIdMatch = rank.match(/\d+/);

		if (userIdMatch && rankIdMatch) {
			user = interaction.guild.members.cache.get(userIdMatch[0]);
			rank = interaction.guild.roles.cache.find(r => r.id === rankIdMatch[0]);

			if (!user || !rank) {
				return interaction.reply({ content: "Please mention a valid user and role.", ephemeral: true });
			}

			user.roles.add(rank);
			await interaction.reply({ content: "Rank assigned successfully.", ephemeral: true });
		} else {
			await interaction.reply({ content: "Invalid user or role ID.", ephemeral: true });
		}
	} else if (commandName === "result") {
		const user = interaction.options.getUser("user");
		const region = interaction.options.getString("region");
		const username = interaction.options.getString("username");
		const previousRank = interaction.options.getString("previous_rank");
		const rankEarned = interaction.options.getString("rank_earned");

		const avatarUrl = `https://minotar.net/avatar/${username}`;

		const embed = new MessageEmbed()
			.setTitle(`${user.username}'s Test Results 🏆`)
			.setThumbnail(avatarUrl)
			.addField("Testers", `<@${interaction.user.id}>`, true)
			.addField("Region", region, true)
			.addField("Username", username, true)
			.addField("Previous Rank", previousRank, true)
			.addField("Rank Earned", rankEarned, true);

		await interaction.reply({ embeds: [embed] });
	}
});

bot.on("interactionCreate", async (interaction) => {
	if (!interaction.isButton()) return;

	if (interaction.customId === "joinQueue") {
		if (usersInQueue.includes(interaction.user.id)) {
			await interaction.reply({ content: "You are already in the queue.", ephemeral: true });
		} else {
			usersInQueue.push(interaction.user.id);
			await interaction.reply({ content: "You have successfully joined the queue.", ephemeral: true });
		}
	}
});

bot.login(config.token);