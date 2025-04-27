import { IsNotEmpty } from 'class-validator';
import { isNotBlank } from '../../../common/validatorCustom/isNotBlank.validator';

export class CreateFacultyDTO {
  @isNotBlank()
  @IsNotEmpty()
  name: string;
}
