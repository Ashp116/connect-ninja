const botSettings = require("./botSettings.json");
const discord = require("discord.js");
const fs = require("fs");
const ServerData = require("./ServerData.json");
const bot = new discord.Client({disableEveryone: true});
const prefix = botSettings.prefix
const Permissions = botSettings.Permissions
var JoinRole = null
var BotRole = null
var WelcomechannelId = null
var BotRole = null

// sends a mesg to the console if the bot is ready
bot.on("ready", async () => {
  console.log(`Bot is ready! ${bot.user.username}`);

  try {
    let link = await bot.generateInvite(Permissions);
    console.log(link);
  } catch (e) {
    console.log(e.stack);
  }


});

// instialize Server Data when the bot joins
bot.on("guildCreate", (guild) => {
  let channel = bot.channels.get(guild.systemChannelID || WelcomechannelId);
  //channel.send("Joined")
  ServerData  [guild.name] = {
    WelcomechannelId:  null,
    JoinRole: null,
    BotRole: null
  }
  fs.writeFile("./ServerData.json", JSON.stringify(ServerData, null, 4), err => {
    if (err) throw err;

  });
});

// Setting Bot role
bot.on("message", async message => {
  if (message.member.hasPermission("ADMINISTRATOR")) {
    let messageArray = message.content.split(" ");
    let command = messageArray[0];
    if (command === `${prefix}setBotRole`) {
      if (message.mentions.roles.first()) {
        BotRole = message.mentions.roles.first().id
        ServerData[message.guild.name].BotRole = `${BotRole}`;
        fs.writeFile("./ServerData.json", JSON.stringify(ServerData, null, 4), err => {
          if (err) throw err;

        });
        message.channel.send(`Bot role is set to <@&${BotRole}>`);
    }
    else {
      message.channel.send(`Role not found`);
    }
  }
}
else {
  message.channel.send(`You do not have permission to set Join Role ${message.author}`);
}
});

// Setting join role
bot.on("message", async message => {
  let member = message.mentions.members.first() || message.member
  if (message.member.hasPermission("ADMINISTRATOR")) {
    let messageArray = message.content.split(" ");
    let command = messageArray[0];
    if (command === `${prefix}setJoinRole`) {
      if (message.mentions.roles.first()) {
        JoinRole = message.mentions.roles.first().id
        ServerData[message.guild.name].JoinRole = `${JoinRole}`;
        fs.writeFile("./ServerData.json", JSON.stringify(ServerData, null, 4), err => {
          if (err) throw err;

        });
        message.channel.send(`Join role is set to <@&${JoinRole}>`);
    }
    else {
      message.channel.send(`Role not found`);
    }
  }

}
else {
  message.channel.send(`You do not have permission to set Join Role ${message.author}`);
}
});

// Setting Welcome Channel Id
bot.on("message", async message => {
  let member = message.mentions.members.first() || message.member
  if (message.member.hasPermission("ADMINISTRATOR")) {
    let messageArray = message.content.split(" ");
    let command = messageArray[0];
    let channel = bot.channels.get(message.guild.systemChannelID || WelcomechannelId);
    if (command === `${prefix}setWelcomeChannelid`) {

      WelcomechannelId = messageArray[1]
      message.channel.send(`Your welcome channel is set to ${"`"+message.guild.channels.get(WelcomechannelId).name+"`"}`);
      ServerData[message.guild.name].WelcomechannelId = WelcomechannelId

      fs.writeFile("./ServerData.json", JSON.stringify(ServerData, null, 4), err => {
        if (err) throw err;

      });

  }
}
else {
  message.channel.send(`You do not have permission to set Join Role ${message.author}`);
}
});

// Welcome msg
bot.on("guildMemberAdd", member => {
  WelcomechannelId = ServerData[member.guild.name].WelcomechannelId
    let channel = bot.channels.get(member.guild.systemChannelID || WelcomechannelId);
    JoinRole = ServerData[member.guild.name].JoinRole
    BotRole = ServerData[member.guild.name].BotRole
    var joinRole = member.guild.roles.find("id",JoinRole)
    var botRole = member.guild.roles.find("id",BotRole)

    if (WelcomechannelId === null) {
        channel.send(`👋Welcome ${member}👋, hope you have great time in 🎉${member.guild.name}🎉`);
        member.addRole(joinRole);
    }
    else {
    member.guild.channels.get(WelcomechannelId).send(`👋Welcome ${member}, hope you have great time in 🎉${member.guild.name}🎉`);
      if (member.user.bot) {
        member.addRole(joinRole);
        member.addRole(botRole);
      }
    else {
      member.addRole(joinRole);
  }

  }
})

//Userinfo cmd, Kick Cmd
bot.on("message", async message => {
    if(message.author.bot) return;
    if(message.channel.type === "dm") return;
    let messageArray = message.content.split(" ");
    let command = messageArray[0];
    let args = messageArray.slice(1);

    if(!command.startsWith(prefix)) return;
    if(command === `${prefix}info`) {
       if (message.mentions.members.first()){
         let member = message.mentions.members.first() || message.member
           let embed = new discord.RichEmbed()
              .setAuthor(message.mentions.users.first().username, message.mentions.users.first().avatarURL)
              .setTitle("Info")
              .addField('Highest Role', member.highestRole.name)
              .addField('Current Nickname',member.nickname)
              .addField('User Tag', message.mentions.users.first().tag)
              .setColor("#EDF4B6")
              .setThumbnail(message.mentions.users.first().avatarURL);
            message.channel.sendEmbed(embed)
            return;
         }
         else if (message.content === `${prefix}info`) {
         let embed = new discord.RichEmbed()
            .setAuthor(message.author.username, message.author.avatarURL)
            .setTitle("Info")
            .addField('Highest Role', message.member.highestRole.name)
            .addField('Current Nickname', message.member.nickname)
            .addField('User Tag', message.author.tag)
            .setColor("#EDF4B6")
            .setThumbnail(message.author.avatarURL);
          message.channel.sendEmbed(embed)
          return;
        }
        else {

             message.channel.send(`Error, try mentioning a member. ${message.author}`);

        }

        }
        //kick command
        if(command === `${prefix}kick`) {
          let member = message.mentions.members.first() || message.member
          if  (message.member.hasPermission("KICK_MEMBERS")) {
           if (message.mentions.members.first()){

              if (member.displayName === bot.user.username) {
                message.channel.send(`You cant Kick me BOI!!!`);
              }
              else {
                member.kick();
                message.channel.send(`${member.displayName} is kicked`);
              }
           }
           else {
             message.channel.send(`Error, try mentioning a member. ${message.author}`);
           }


        }
        else {
          message.channel.send(`you dont hav perm ${message.author}`);
        }
      }


        if(command === `${prefix}ban`) {
          let member = message.mentions.members.first() || message.member
          if  (message.member.hasPermission("BAN_MEMBERS")) {
           if (message.mentions.members.first()){

              if (member.displayName === bot.user.username) {
                message.channel.send(`You cant Ban me BOI!!!`);
              }
              else {
                member.ban(7);
                message.channel.send(`${member.displayName} is Banned`);
              }
           }
           else {
             message.channel.send(`Error, try mentioning a member. ${message.author}`);
           }


        }
        else {
          message.channel.send(`you dont hav perm ${message.author}`);
        }
      }
});



bot.login(process.env.botSettings.token);
