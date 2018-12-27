const Discord = require("discord.js");
const auth = require("./auth.json");
const config = require("./config.json");

// Initialize Discord Bot
const client = new Discord.Client()
client.login(auth.token)

// Initialize config
const prefix = config.prefix;

// Successful node.js run, output in console
client.on("ready", () => {
	console.log("Bot is ready");
});

//Receive commands and run functions
client.on("message", (message) => {
//Ignore bots || wrong prefix
	if (message.author.bot || message.content.indexOf(prefix) !== 0){
		return;
	}
	const args = message.content.slice(prefix.length).trim().split(/ +/g); //everything after command
	const command = args.shift().toLowerCase(); //first word

/*----------Determine type of command-------------*/
	//Emoji React
	switch(command){
		case "react":
		case "r":
			EmojiReactCore(message, args[0],args[1],args[2]);
			break;
	}
});

function EmojiReactCore(message, word, target, offset){
	const fetchLimit = 20;
//expected syntax !react WORD [@target] [!offset]
//input cleaning
	//word
	if (typeof word === "undefined" || word === "") return;
		word = word.replace(/[^a-zA-Z0-9]/g,"");
		word = word.toLowerCase();
	//No target, Yes offset case:
	if (typeof target !== "undefined" && target.startsWith("!")){
		offset = target;
		target = "0";
	}
	//target
	var hasTarget;
	if (typeof target === "undefined" || target === "" || !target.startsWith("<@")){
		target = 0;
		hasTarget = false;
	} else{	
		target = message.mentions.users.first().id;
		hasTarget = true;
	}
	//offset
	if (typeof offset === "undefined" || offset === "" || !offset.startsWith("!")) {
		offset = 0;
	} else{
		offset = parseInt(offset.substring(1)); //!123 --> 123
		if (isNaN(offset) || offset > fetchLimit) offset = 0;
	}

//Get list of messages
	message.channel.fetchMessages({limit:fetchLimit, before: message.id})
		.then((messages) => {
			if (hasTarget){
				messages = messages.filter(m => m.author.id == target).array();
			} else {
				messages = messages.array();
			}
			var messageID = messages[offset].id;
			//get exact message ID
			message.channel.fetchMessage(messageID)
				.then((targetMessage) => {
					//react either letters or just 1 emoji
					const wordEmoji = client.emojis.find(emoji => emoji.name.toLowerCase() == word);
					if (wordEmoji != null) targetMessage.react(wordEmoji.id);
					AddReactionLetters(targetMessage, word, 0);
				})
				.catch(console.error);
		})
		.catch(console.error);
}

//Reacting out word as letters by recursion
function AddReactionLetters(targetMessage, word, letterIndex){
	//base case: last letter reached
	if (letterIndex >= word.length) return;
	var emojiNumber = word.charCodeAt(letterIndex); //ascii conversion
	if (emojiNumber >= 97 && emojiNumber <= 122) emojiNumber -= 87;
	if (emojiNumber >= 48 && emojiNumber <= 57) emojiNumber -= 48
	targetMessage.react(config.emojis[emojiNumber])
		.then((reactionPromise) => {
			AddReactionLetters(targetMessage, word, letterIndex+1);
		})
		.catch(console.error);
}























