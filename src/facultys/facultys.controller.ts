import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FacultysService } from './facultys.service';
import { ResponseApi } from '../common/response/responseApi.format';
import { Faculty } from './entities/faculty.entity';
import { CreateFacultyDTO } from './dto/request/createFaculty.dto';
import { JwtAuthGuard } from '../jwt/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/guards/role.guard';
import { Roles } from '../roles/decorators/role.decorator';
import { ROLES } from '../roles/group/role.enum';
import { UserId } from '../user/decorator/userId.decorator';
import { IsVerificationRequired } from '../jwt/decorator/jwtRoute.decorator';

@Controller({ path: 'faculty', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard) // Apply JWT guard globally for this controller
export class FacultysController {
  constructor(private readonly facultyService: FacultysService) {}

  @Get()
  @IsVerificationRequired(true)
  @Roles(ROLES.USER, ROLES.ADMIN, ROLES.SUPERADMIN)
  async getAllFaculties(): Promise<ResponseApi<Faculty[]>> {
    const faculties = await this.facultyService.getAllFaculties();
    return new ResponseApi(
      HttpStatus.OK,
      'Successfully retrieved all faculties',
      faculties,
    );
  }

  @Post()
  @Roles(ROLES.SUPERADMIN)
  async createFaculty(
    @Body() createFacultyDTO: CreateFacultyDTO,
  ): Promise<ResponseApi<string>> {
    const resultMessage =
      await this.facultyService.createFaculty(createFacultyDTO);
    return new ResponseApi(
      HttpStatus.CREATED,
      'Faculty created successfully',
      resultMessage,
    );
  }
}
