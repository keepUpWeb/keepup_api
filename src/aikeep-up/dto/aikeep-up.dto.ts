import { IsString } from "class-validator";

export class AikeepUpDto {
    @IsString()
    gptSystem: string;

    @IsString()
    gptPrompt: string;

    @IsString()
    userId: string;
}
