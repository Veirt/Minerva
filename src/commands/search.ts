import { MessageActionRow, MessageSelectMenu } from "discord.js";
import { Anime } from "../entity/Anime";
import { SelectMenuCommand } from "../@types";
import { SlashCommandBuilder } from "@discordjs/builders";
// import { getConnection } from "typeorm";
import { parse } from "node-html-parser";
import axios from "axios";
import { getConnection } from "typeorm";

const command: SelectMenuCommand = {
    data: new SlashCommandBuilder()
        .setName("search")
        .addStringOption(option =>
            option.setName("title").setDescription("Enter the anime title"),
        )
        .setDescription("Search anime on gogoanime"),
    async execute(interaction) {
        const title = interaction.options.getString("title");
        if (!title) await interaction.reply("Title cannot be empty.");

        const res = await axios.get(
            `https://gogoanime.cm/search.html?keyword=${title}`,
        );

        const animeList = parse(res.data).querySelectorAll("ul.items>li");
        const options = animeList.map(anime => {
            const title = anime.querySelector(".name>a")?.innerHTML;
            if (!title) throw new Error("Title is not found.");
            return {
                label: title,
                value: title,
            };
        });

        const animeSelectMenu = new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId("search")
                .setPlaceholder("Nothing selected")
                .setMinValues(1)
                .addOptions(options),
        );

        await interaction.reply({
            content: "test",
            components: [animeSelectMenu],
        });
    },
    async respond(interaction) {
        const animeRepository = getConnection().getRepository(Anime);

        for await (const anime of interaction.values) {
            const newAnime = animeRepository.create({ title: anime });

            try {
                await animeRepository.save(newAnime);
                await interaction.reply(`${anime} anime saved to database.`);
            } catch (err) {
                await interaction.reply({
                    content: `${anime} already exists.`,
                });
                break;
            }
        }
    },
};

export = command;