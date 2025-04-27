import { Controller, Get, HttpStatus, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { StatistikSuperadminService } from './statistik-superadmin.service';
import { IsVerificationRequired } from '../jwt/decorator/jwtRoute.decorator';
import { JwtAuthGuard } from '../jwt/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/guards/role.guard';
import { Roles } from '../roles/decorators/role.decorator';
import { ROLES } from '../roles/group/role.enum';
import { ResponseApi } from '../common/response/responseApi.format';
import { UserId } from '../user/decorator/userId.decorator';
import { SummaryKuisionerService } from '../sumary_kuisioner/summary-kuisioner.service';

@Controller({ path: 'statistik/superAdmin', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatistikSuperadminController {
  constructor(
    private readonly statistikSuperAdminService: StatistikSuperadminService,
    private readonly summaryKuisionerService: SummaryKuisionerService
  ) {}

  @Get()
  @IsVerificationRequired(true)
  @Roles(ROLES.SUPERADMIN)
  async getAllStatistikCount() {
    const data =
      await this.statistikSuperAdminService.getAllTakeKuisionerStatistik();

    return new ResponseApi(
      HttpStatus.OK,
      'Successfully Get Statistik Count For Symtomp',
      data,
    );
  }
  @Get('symtomp')
  @IsVerificationRequired(true)
  @Roles(ROLES.SUPERADMIN)
  async getAllStatistikCountSymtomp() {
    const data =
      await this.statistikSuperAdminService.getAllTakeKuisionerStatistikSymtomp();

    return new ResponseApi(
      HttpStatus.OK,
      'Successfully Get Statistik Count For Symtomp',
      data,
    );
  }
  @Get('gender')
  @IsVerificationRequired(true)
  @Roles(ROLES.SUPERADMIN)
  async getAllStatistikGenderUser() {
    const data =
      await this.statistikSuperAdminService.getAllUserGenderStatistik();

    return new ResponseApi(
      HttpStatus.OK,
      'Successfully Get Statistik Gender User',
      data,
    );
  }

  @Get('user')
  @IsVerificationRequired(true)
  @Roles(ROLES.SUPERADMIN)
  async getAllStatistikUserKuisioner() {
    const data =
      await this.statistikSuperAdminService.getAllUserKuisionerStatistik();

    return new ResponseApi(
      HttpStatus.OK,
      'Successfully Get Statistik Gender User',
      data,
    );
  }

  @Get('count')
  @IsVerificationRequired(true)
  @Roles(ROLES.SUPERADMIN)
  async getCountStatistikUserKuisioner() {
    const data =
      await this.statistikSuperAdminService.countAllUserKuisionerStatistik();

    return new ResponseApi(
      HttpStatus.OK,
      'Successfully Get Statistik Gender User',
      data,
    );
  }

  @Get('preKuisioner/count')
  @IsVerificationRequired(true)
  @Roles(ROLES.SUPERADMIN)
  async getCountStatistikUserPreKuisioner() {
    const data =
      await this.statistikSuperAdminService.countAllPreKuisionerUserStatistik();

    return new ResponseApi(
      HttpStatus.OK,
      'Successfully Get Statistik Pre Kuisioner User',
      data,
    );
  }

  @Get('user/:facultyId')
  @IsVerificationRequired(true)
  @Roles(ROLES.SUPERADMIN)
  async getAllStatistikUserByFacultyKuisioner(
    @Param('facultyId', new ParseUUIDPipe() ) facultyId: string,
  ) {
    const data =
      await this.statistikSuperAdminService.countAllUserKuisionerByFacultyStatistik(facultyId);

    return new ResponseApi(
      HttpStatus.OK,
      'Successfully Get Statistik Gender User',
      data,
    );
  }

  


  @Get('sumarize')
  @IsVerificationRequired(true)
  @Roles(ROLES.SUPERADMIN)
  async getSumarizeOfKuisioner(@UserId() userId:string){

    const summary = await this.summaryKuisionerService.getOrUpdateSummaryForUser(userId);

    // Return the summary
    return new ResponseApi (
      HttpStatus.OK,
      'Successfully Get Statistik Gender User',
      summary,
    );
  }
}
