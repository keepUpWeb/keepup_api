import { IsNotEmpty } from "class-validator";
import { isNotBlank } from "../../common/validatorCustom/isNotBlank.validator";

export class CreateMajorDTO {
  @isNotBlank()
  @IsNotEmpty()
  name: string;

  // @isNotBlank()
  // @IsNotEmpty()
  // facultyId: string;
}
