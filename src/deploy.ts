import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { clientId, guildId, token } from "./config";
import getCommands from "./utils/getCommands";

const production = process.env.NODE_ENV === "production";
const deploy = process.env.DEPLOY;

const commands: Array<any> = [];
if (deploy)
    getCommands().then(async commandFiles => {
        // loop over command files and import
        for (const file of commandFiles) {
            const command = await import(file);
            commands.push(command.data.toJSON());
        }

        // current Discord API version is 9
        const rest = new REST({ version: "9" }).setToken(token);

        // register application commands
        try {
            if (!production) {
                await rest.put(
                    Routes.applicationGuildCommands(clientId, guildId),
                    {
                        body: commands,
                    },
                );
                console.log(
                    "Successfully registered application guild commands.",
                );
            } else {
                await rest.put(Routes.applicationCommands(clientId), {
                    body: commands,
                });
                console.log("Successfully registered application commands.");
            }

            const commandList = commands.map(command => command.name);
            console.log(commandList);
        } catch (err) {
            console.error(err);
        }
    });
