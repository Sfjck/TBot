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
	//input cleaning: word
	if (typeof word === "undefined" || word === "") return;
		word = word.replace(/[^a-zA-Z0-9]/g,"");
		word = word.toLowerCase();
	//No target, yes offset case:
	if (typeof target !== "undefined" && target.startsWith("!")){
		offset = target;
		target = "0";
	}
	//input cleaning: target
	var hasTarget;
	if (typeof target === "undefined" || target === "" || !target.startsWith("<@")){
		target = 0;
		hasTarget = false;
	} else{	
		target = message.mentions.users.first().id;
		hasTarget = true;
	}
	//input cleaning: offset
	if (typeof offset === "undefined" || offset === "" || !offset.startsWith("!")) {
		offset = 0;
	} else{
		offset = parseInt(offset.substring(1)); //!123 --> 123
		if (isNaN(offset) || offset > fetchLimit) offset = 0;
	}

	//Get list of previous messages
	message.channel.fetchMessages({limit:fetchLimit, before: message.id})
		.then((messages) => {
			if (hasTarget){
				messages = messages.filter(m => m.author.id == target).array();
			} else {
				messages = messages.array();
			}
			var messageID = messages[offset].id;
			//get messageID of target message
			message.channel.fetchMessage(messageID)
				.then((targetMessage) => {
					//check if entire word exists as 1 emoji
					const wordEmoji = client.emojis.find(emoji => emoji.name.toLowerCase() == word);
					//for duplicate letters
					var usedLetters = new Array(36);
					usedLetters.fill(0);
					
					//react with either letters or 1 emoji + letters
					if (wordEmoji != null || word == "pray") {
						//special case for "pray"
						if (word == "pray"){
							var wordEmojiID = "🙏";
						} else{
							var wordEmojiID = wordEmoji.id;
						}
						targetMessage.react(wordEmojiID)
							.then((wordEmojiPromise) => {
								AddReactionLetters(targetMessage, word, usedLetters, 0);
							})
							.catch(console.error);
					} else {
						AddReactionLetters(targetMessage, word, usedLetters, 0);
					}
				})
				.catch(console.error);
		})
		.catch(console.error);
}

//Reacting out word as letters by recursion
function AddReactionLetters(targetMessage, word, usedLetters, letterIndex){
	//base case: last letter reached
	if (letterIndex >= word.length) return;
	
	var emojiNumber = word.charCodeAt(letterIndex); //ascii conversion
	if (emojiNumber >= 97 && emojiNumber <= 122) emojiNumber -= 87; //letters a-z
	if (emojiNumber >= 48 && emojiNumber <= 57) emojiNumber -= 48; //numbers 0-9
	
	var characterEmoji = "";
	//first vs second instance of letter
	if (usedLetters[emojiNumber] == 0) {
		characterEmoji = config.emojis[emojiNumber];
	} else if (usedLetters[emojiNumber] == 1) {
		characterEmoji = config.emojis2[emojiNumber];
	}
	usedLetters[emojiNumber]++;
	
	//add reaction, then recursion to next letter
	if (characterEmoji == ""){
		AddReactionLetters(targetMessage, word, usedLetters, letterIndex+1);
	} else {
		targetMessage.react(characterEmoji)
			.then((reactionPromise) => {
				AddReactionLetters(targetMessage, word, usedLetters, letterIndex+1);
			})
			.catch(console.error);
	}
}























