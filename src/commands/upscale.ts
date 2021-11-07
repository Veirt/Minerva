import instance from "../api/axios";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { ICommand } from "../@types";
import { AxiosResponse } from "axios";

const command: ICommand = {
    data: new SlashCommandBuilder()
        .setName("upscale")
        .setDescription("Upscale an image with Waifu2x API")
        .addStringOption((option) =>
            option.setName("image").setDescription("Enter an image URL"),
        ),
    async execute(interaction: CommandInteraction) {
        const image = interaction.options.getString("image");

        await interaction.reply("Processing...");

        try {
            const res: AxiosResponse<{ id: string; output_url: string }, any> =
                await instance.post("waifu2x", { image });
            await interaction.followUp(res.data.output_url);
        } catch (err) {
            await interaction.followUp("Error processing the image!");
        }
    },
};

export = command;