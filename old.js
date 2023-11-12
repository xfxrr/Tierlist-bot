"use strict";

// Dependencies
const { Client, Modal, Intents, TextInputComponent, MessageButton, MessageEmbed } = require("discord.js")

// Variables
const PvPTL = {
    token: ""
}

const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] })

// Main
bot.on("ready", ()=>{
	bot.guilds.cache.forEach((guild)=>{
		guild.commands.set([])
	})

    var commands;

	commands = bot.application?.commands
    commands?.create({
        name: "queue",
        description: "Make a queue."
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
})

bot.on("message", (message)=>{
	if(message.content === ".queue"){
		const button = new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setCustomId("joinQueue")
				.setLabel("Join Waitlist")
				.setStyle("PRIMARY"),
        )

		const embed = new MessageEmbed()
		.setTitle("Tester(s) Available!")
		.setDescription("Test")

		message.guild.channels.cache.get("1001487537820418098").send({ embeds: [embed], components: [button] })
	}
})

bot.on("interactionCreate", async(interaction)=>{
	if(interaction.commandName === "rank"){
		var user = interaction.options.getString("user", true)
		var rank = interaction.options.getString("rank", true)

		console.log(user)
		user = interaction.guild.members.cache.get(user.match(/\d+/)[0])
		rank = interaction.guild.roles.cache.find(r => r.id === rank.match(/\d+/)[0])

		if(!user || !rank) return await interaction.reply({ content: "Please mention a user & role correctly." })

		console.log(user.username)
		console.log(rank.name)
	}else if(interaction.commandName === "queue"){
		const button = new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setCustomId("joinQueue")
				.setLabel("Join Waitlist")
				.setStyle("PRIMARY"),
        )

		const embed = new MessageEmbed()
		.setTitle("Tester(s) Available!")
		.setDescription("Test")

		interaction.guild.channels.cache.get("1001487537820418098").send({ embeds: [embed], components: [button] })
		await interaction.reply({ content: "Success.", ephemeral: true })
	}else if(interaction.customId === "joinQueue"){
		const modal = new Modal()
		.setCustomId("waitList")
		.setTitle("PvP Tierlist Waitlist");

		const regionInput = new TextInputComponent()
		.setCustomId("region")
		.setLabel("What region are you in?")
		.setPlaceholder("EU, NA, AU or AS")
		.setStyle("SHORT")

		const currentRankInput = new TextInputComponent()
		.setCustomId("currentRank")
		.setLabel("What is your current rank, If any?")
		.setPlaceholder("(Leave blank if you are unranked)")
		.setStyle("SHORT")

		const serverIPInput = new TextInputComponent()
		.setCustomId("serverIP")
		.setLabel("What server do you prefer?")
		.setPlaceholder("Server IP")
		.setStyle("SHORT")

		const usernameInput = new TextInputComponent()
		.setCustomId("useranme")
		.setLabel("What is your MC username?")
		.setPlaceholder("Username")
		.setStyle("SHORT")

		const region = new MessageActionRow().addComponents(regionInput)
		const currentRank = new MessageActionRow().addComponents(currentRankInput)
		const serverIP = new MessageActionRow().addComponents(serverIPInput)
		const username = new MessageActionRow().addComponents(usernameInput)
		
		modal.addComponents(region, currentRank, serverIP, username)
		await interaction.showModal(modal)
	}
})

bot.on("interactionCreate", async(interaction)=>{
	if(!interaction.isModalSubmit()) return

	if(interaction.customId === "waitList"){
		try{
			const region = interaction.fields.getTextInputValue("region")
			const currentRank = interaction.fields.getTextInputValue("currentRank")
			const serverIP = interaction.fields.getTextInputValue("serverIP")
			const username = interaction.fields.getTextInputValue("username")

			if(!region || !currentRank || !serverIP || !username) return await interaction.reply({ content: "Something went wrong, please check ur application again.", ephemeral: true })

			await interaction.reply({ content: "You have been added to the queue.", ephemeral: true })
		}catch{
			await interaction.reply({ content: "Something went wrong, please check ur application again.", ephemeral: true })
		}
	}
})

bot.login(PvPTL.token)