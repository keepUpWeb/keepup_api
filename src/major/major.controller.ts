import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ResponseApi } from '../common/response/responseApi.format';
import { JwtAuthGuard } from '../jwt/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/guards/role.guard';
import { Roles } from '../roles/decorators/role.decorator';
import { ROLES } from '../roles/group/role.enum';
import { UserId } from '../user/decorator/userId.decorator';
import { IsVerificationRequired } from '../jwt/decorator/jwtRoute.decorator';
import { MajorService } from './major.service';
import { Major } from './entities/major.entity';
import { CreateMajorDTO } from './dto/create-major';

@Controller({ path: 'major', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard) // Apply JWT guard globally for this controller
export class MajorController {
  constructor(private readonly majorService: MajorService) { }

  @Get(":id_faculty")
  @IsVerificationRequired(true)
  @Roles(ROLES.USER, ROLES.ADMIN, ROLES.SUPERADMIN)
  async getAllMajors(
    @Param('id_faculty', new ParseUUIDPipe()) facultyId: string,
  ): Promise<ResponseApi<Major[]>> {
    const faculties = await this.majorService.getAllMajors(facultyId);
    return new ResponseApi(
      HttpStatus.OK,
      'Successfully retrieved all Majors',
      faculties,
    );
  }

  @Post(":id_faculty")
  @Roles(ROLES.SUPERADMIN)
  async createMajor(
    @Param('id_faculty', new ParseUUIDPipe()) facultyId: string,
    @Body() createMajorDTO: CreateMajorDTO,
  ): Promise<ResponseApi<string>> {
    const resultMessage =
      await this.majorService.createMajor(createMajorDTO,facultyId);
    return new ResponseApi(
      HttpStatus.CREATED,
      'Major created successfully',
      resultMessage,
    );
  }
}
