import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { CreateAnswerDto } from '../../answers/dto/create-answer.dto';
import { isNotBlank } from '../../common/validatorCustom/isNotBlank.validator';
import { SubKuisioner } from '../../sub-kuisioner/entities/sub-kuisioner.entity';

export class CreateQuestionDto {
  @IsNotEmpty({ message: 'question is required' })
  @isNotBlank({ message: 'question cannot be blank' })
  question: string;

  subKuisionerId: SubKuisioner;
}

export class BodyCreateQuestionDto {
  @IsNotEmpty({ message: 'question is required' })
  @isNotBlank({ message: 'question cannot be blank' })
  question: string;

  @ValidateNested({ each: true })
  @Type(() => CreateAnswerDto)
  @IsArray()
  answers: CreateAnswerDto[];
}
