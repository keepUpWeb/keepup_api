import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { PyschologyService } from './pyschology.service';
import { UpdatePyschologyDto } from './dto/update-pyschology.dto';
import { JwtAuthGuard } from '../jwt/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/guards/role.guard';
import { IsVerificationRequired } from '../jwt/decorator/jwtRoute.decorator';
import { Roles } from '../roles/decorators/role.decorator';
import { ROLES } from '../roles/group/role.enum';
import { ResponseApi } from '../common/response/responseApi.format';
import { User } from '../user/entities/user.entity';
import { PsikologiStatus } from './group/psikologiStatus.enum';

@Controller({ path: 'psychology', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class PyschologyController {
  constructor(private readonly pyschologyService: PyschologyService) { }


  @Get()
  @IsVerificationRequired(true)
  @Roles(ROLES.SUPERADMIN)
  async findAll(
    @Query('status') status: PsikologiStatus,
  ): Promise<ResponseApi<User[]>> {
    const data = await this.pyschologyService.findAll(status);

    return new ResponseApi(
      HttpStatus.OK,
      'Successfully Get All Psikolog',
      data,
    );
  }


  @Get(':id')
  @IsVerificationRequired(true)
  @Roles(ROLES.SUPERADMIN)
  findOne(@Param('id') id: string) {
    return this.pyschologyService.findOne(id);
  }

  @Patch(':id')
  @IsVerificationRequired(true)
  @Roles(ROLES.SUPERADMIN)
  update(
    @Param('id') id: string,
    @Body() updatePyschologyDto: UpdatePyschologyDto,
  ) {
    return this.pyschologyService.activatePsychologist(
      id,
      updatePyschologyDto.status,
    );
  }




  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.pyschologyService.remove(+id);
  // }
}
