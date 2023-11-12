"use strict";

// Dependencies
const { Client, Intents, MessageButton, MessageActionRow } = require("discord.js")

// Variables
const PvPTL = {
    token: ""
}

const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] })

var usersInQueue = []
var queue;
var testerID;

// Main
bot.on("ready", ()=>{
	bot.guilds.cache.forEach((guild)=>{
		guild.commands.set([])
	})

    var commands;

	commands = bot.application?.commands
    commands?.create({
        name: "queue",
        description: "Make queue."
    })

	commands?.create({
        name: "stopqueue",
        description: "Deletes queue."
    })

	commands?.create({
        name: "remove",
        description: "Removes a user from queue.",
		options: [
			{
				type: "STRING",
				name: "user",
				description: "User to remove in queue.",
				required: true
			},
		]
    })

	commands?.create({
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
    })

	console.log("PvP Tierlist is running.")

	setInterval(()=>{
		if(queue){
			const button = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId("joinQueue")
					.setLabel("Join Queue")
					.setStyle("PRIMARY"),
			)

			const embed = new MessageEmbed()
			.setTitle("Tester(s) Available!")
			.setDescription(`The queue updates every 10 seconds.

**Queue**:
${usersInQueue.map((user, index)=>`${+index + 1}. <@${user}>`).join("\n")}

**Active Testers**:
<@${testerID}>`)

			queue.edit({ embeds: [embed], components: [button] })
		}
	}, 10 * 1000)
})

bot.on("message", async(message)=>{
	if(message.content === ".queue"){
		if(!message.member.roles.cache.some(r => r.id === "1001487662701613066")) return

		const button = new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setCustomId("joinQueue")
				.setLabel("Join Queue")
				.setStyle("PRIMARY"),
        )

		const embed = new MessageEmbed()
		.setTitle("Tester(s) Available!")
		.setDescription(`The queue updates every 10 seconds.

**Queue**:

**Active Testers**:
<@${message.author.id}>`)

		testerID = message.author.id
		queue = await message.guild.channels.cache.get("1011516528568582194").send({ embeds: [embed], components: [button] })
	}
})

bot.on("interactionCreate", async(interaction)=>{
	if(interaction.commandName === "rank"){
		if(!interaction.member.permissions.has("ADMINISTRATOR")) return

		var user = interaction.options.getString("user", true)
		var rank = interaction.options.getString("rank", true)

		user = interaction.guild.members.cache.get(user.match(/\d+/)[0])
		rank = interaction.guild.roles.cache.find(r => r.id === rank.match(/\d+/)[0])

		if(!user || !rank) return await interaction.reply({ content: "Please mention a user & role correctly." })

		user.roles.add(rank)
		await interaction.reply({ content: "Success.", ephemeral: true })
	}else if(interaction.commandName === "queue"){
		if(!interaction.member.roles.cache.some(r => r.id === "1001487662701613066")) return
		
		const button = new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setCustomId("joinQueue")
				.setLabel("Join Queue")
				.setStyle("PRIMARY"),
        )

		const embed = new MessageEmbed()
		.setTitle("Tester(s) Available!")
		.setDescription(`The queue updates every 10 seconds.

**Queue**:

**Active Testers**:
<@${interaction.user.id}>`)

		testerID = interaction.user.id
		queue = await interaction.guild.channels.cache.get("1011516528568582194").send({ embeds: [embed], components: [button] })
		await interaction.reply({ content: "Success.", ephemeral: true })
	}else if(interaction.commandName === "stopqueue"){
		if(!interaction.member.permissions.has("ADMINISTRATOR")) return
		if(!queue) return await interaction.reply({ content: "No active queue to be deleted.", ephemeral: true })
		
		usersInQueue = []
		queue.delete()
		queue = null

		await interaction.reply({ content: "Queue successfully deleted.", ephemeral: true })
	}else if(interaction.commandName === "remove"){
		if(!interaction.member.permissions.has("ADMINISTRATOR")) return
		var user = interaction.options.getString("user", true)

		if(!user) return await interaction.reply({ content: "Please mention a user.", ephemeral: true })

		user = user.match(/\d+/)[0]
		
		if(usersInQueue.includes(user)){
			delete usersInQueue[usersInQueue.indexOf(user)]
			usersInQueue = usersInQueue.filter((user)=>user)

			await interaction.reply({ content: "User successfully removed.", ephemeral: true })
		}else{
			await interaction.reply({ content: "User is not in queue.", ephemeral: true })
		}
	}else if(interaction.customId === "joinQueue"){
		if(usersInQueue.includes(interaction.user.id)){
			await interaction.reply({ content: "Failed to join, already in queue.", ephemeral: true })
		}else{
			usersInQueue.push(interaction.user.id)

			await interaction.reply({ content: "Successfully join.", ephemeral: true })
		}
	}
})

bot.login(PvPTL.token)