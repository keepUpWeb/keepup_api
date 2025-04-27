import { IsNotEmpty } from 'class-validator';
import { isNotBlank } from '../../common/validatorCustom/isNotBlank.validator';

export class CreateUserAnswerKuisionerDto {
  @IsNotEmpty({ message: 'subKuisionerId is required' })
  @isNotBlank({ message: 'subKuisionerId cannot be blank' })
  answerId: string;
}
