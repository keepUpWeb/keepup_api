import { IsNotEmpty } from 'class-validator';
import { isNotBlank } from '../../common/validatorCustom/isNotBlank.validator';

export class CreateSymtompDto {
  @IsNotEmpty({ message: 'name confirmation is required' })
  @isNotBlank({ message: 'name confirmation cannot be blank' })
  name: string;
}
