import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import { UserAnswerSubKuisionerService } from './user-answer-sub-kuisioner.service';
import { JwtAuthGuard } from '../jwt/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/guards/role.guard';
import { IsVerificationRequired } from '../jwt/decorator/jwtRoute.decorator';
import { Roles } from '../roles/decorators/role.decorator';
import { ROLES } from '../roles/group/role.enum';
import { UserId } from '../user/decorator/userId.decorator';
import { CreateUserAnswerSubKuisionerDTO } from './dto/request/create-user-answer-sub-kuisioner.dto';
import { ResponseApi } from '../common/response/responseApi.format';

@Controller({ path: 'take/subKuisioner', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserAnswerSubKuisionerController {
  constructor(
    private readonly userAnswerSubKuisionerService: UserAnswerSubKuisionerService,
  ) {}

  @Post(':takeKuisionerId')
  @IsVerificationRequired(true)
  @Roles(ROLES.USER)
  async create(
    @Param('takeKuisionerId', new ParseUUIDPipe()) takeKuisionerId: string,
    @UserId() userId: string,
    @Body() createUserAnswerSubKuisionerDto: CreateUserAnswerSubKuisionerDTO,
  ): Promise<ResponseApi<any>> {
    const data = await this.userAnswerSubKuisionerService.create(
      takeKuisionerId,
      createUserAnswerSubKuisionerDto,
      userId,
    );

    return new ResponseApi(
      HttpStatus.CREATED,
      'Successfully take sub Kuisioner and save Answer',
      data,
    );
  }
}
