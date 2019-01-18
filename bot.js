//Required files/libraries
const Discord = require("discord.js");
const Auth = require("./auth.json");
const Config = require("./config.json");
const Prefix = Config.prefix;

// Initialize Bot
const Client = new Discord.Client()
Client.login(Auth.token)
Client.on("ready", () => {
	console.log("Bot is ready");
});

//Check for commands in every message
Client.on("message", (triggerMessage) => {
	//Ignore other bots || no prefix
	if (triggerMessage.author.bot || triggerMessage.content.indexOf(Prefix) !== 0){
		return;
	}
	const Args = triggerMessage.content.slice(Prefix.length).trim().split(/ +/g); //arguments: array of everything after command word, each word is an element
	const Command = Args.shift().toLowerCase(); //command: first word
	
	/*-------------------------------------------------------------------Determine type of command-------------------------------------------------------------------*/
	switch(Command){
		//Emoji react
		case "react":
		case "r":
			var optionalParameters = Args[1] + " " + Args[2];
			EmojiReact(triggerMessage, Args[0], optionalParameters);
			break;
	}
});

/*---------------------------------------------------------Command Functions--------------------------------------------------------------*/

//Emoji react
//expected syntax !react WORD [@target] [!offset]
function EmojiReact(commandMessage, word, optionalParameters){
	//input cleaning for word
	if (typeof word === "undefined" || word === ""){
		return;
	}
	word = word.replace(/[^a-zA-Z0-9]/g,"").toLowerCase();
	
	//check for optional parameters
	const MaxOffset = 20;
	var hasTarget, hasOffset;
	var target, offset;
	if (typeof commandMessage.mentions.users.first() === "undefined"){
		hasTarget = false;
	} else{
		hasTarget = true;
		target = commandMessage.mentions.users.first().id;
	}
	if (optionalParameters.indexOf(Prefix) == -1){
		hasOffset = false;
		offset = 0;
	} else{
		hasOffset = true;
		var splitParameters = optionalParameters.split(" ");
		if (splitParameters[0].indexOf(Prefix) != -1){
			offset = splitParameters[0].slice(Prefix.length).trim();
		} else{
			offset = splitParameters[1].slice(Prefix.length).trim();
		}
		offset = Math.min(parseInt(offset), MaxOffset);
	}
	
	//Get list of previous messages
	commandMessage.channel.fetchMessages({limit:MaxOffset, before: commandMessage.id})
		.then((messages) => {
			if (hasTarget){
				messages = messages.filter(m => m.author.id == target).array();
			} else {
				messages = messages.array();
			}
			var messageID = messages[offset].id;
			//get messageID of target message
			commandMessage.channel.fetchMessage(messageID)
				.then((targetMessage) => {
					//check if entire word exists as 1 emoji
					const wordEmoji = Client.emojis.find(emoji => emoji.name.toLowerCase() == word);
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
		characterEmoji = Config.emojis[emojiNumber];
	} else if (usedLetters[emojiNumber] == 1) {
		characterEmoji = Config.emojis2[emojiNumber];
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























