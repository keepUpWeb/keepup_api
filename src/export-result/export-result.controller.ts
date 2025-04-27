import { Controller, ForbiddenException, Get, HttpException, HttpStatus, Inject, Param, ParseUUIDPipe, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ExportResultService } from './export-result.service';
import { ExportType, ReportType } from './strategy/export-strategy.interface';
import { TakeKuisionerService } from '../take-kuisioner/take-kuisioner.service';
import { transformPreKuisionerUserAnswerFromEntity } from '../common/function/helper/preKuisionerUserProses.function';
import { ReportData } from '../take-kuisioner/take-kuisioner.model';
import { transformPreKuisionerUserAnswer, transformUserAnswerSubKuisioner } from '../common/function/helper/exportProses.function';
import { IsVerificationRequired } from '../jwt/decorator/jwtRoute.decorator';
import { Roles } from '../roles/decorators/role.decorator';
import { ROLES } from '../roles/group/role.enum';
import { RoleId } from '../roles/decorators/roleId.decorator';
import { TakeKuisioner } from '../take-kuisioner/entities/take-kuisioner.entity';
import { UserId } from '../user/decorator/userId.decorator';
import { JwtAuthGuard } from '../jwt/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/guards/role.guard';

@Controller({ path: 'export', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExportResultController {
    constructor(
        private readonly exportResultService: ExportResultService,
        @Inject(TakeKuisionerService)
        private readonly takeKuisionerService: TakeKuisionerService
    ) { }

    @Get('generate/pdf/personal/:id_user')
    @IsVerificationRequired(true)
    @Roles(ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.USER)
    async generatePdfResultTestPersonal(
        @Res() res: Response,
        @RoleId() roleId: string,
        @UserId() requestUserId: string,
        @Param('id_user', new ParseUUIDPipe()) userId: string
    ): Promise<void> {
        const findLatestKuisionerUser = await this.takeKuisionerService.findLatest(userId)

        if (roleId == ROLES.ADMIN) {
            // data = await this.takeKuisionerService.findAll()

            console.log(findLatestKuisionerUser.user.userPsycholog)

            if (findLatestKuisionerUser.user.userPsycholog[0].psychologist.id != requestUserId) {

                throw new ForbiddenException("You are not authorize to export this")

            }
        } else if (roleId == ROLES.USER) {

            if (findLatestKuisionerUser.user.id != requestUserId) {

                throw new ForbiddenException("You are not authorize to export this")

            }

        }

        const preKuisionerData = transformPreKuisionerUserAnswerFromEntity(findLatestKuisionerUser.user.preKuisioner)

        const preKuisionerDataFinal = transformPreKuisionerUserAnswer(preKuisionerData.preKuisionerUserAnswer)

        const subKuisionerFinalData = transformUserAnswerSubKuisioner(findLatestKuisionerUser.userAnswerSubKuisioner)

        const dataGenerateAIReport: ReportData = { background: preKuisionerDataFinal, result: subKuisionerFinalData, user: findLatestKuisionerUser.user, report: findLatestKuisionerUser.report }


        try {
            // Generate the PDF buffer using the service with enum-based parameters
            const pdfBuffer = await this.exportResultService.exportResult(
                ExportType.PDF, // Specify PDF export
                dataGenerateAIReport,
                ReportType.PERSONAL_PDF// Specify the type of report
            );

            // Set response headers for the PDF
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(
                'Content-Disposition',
                `attachment; filename=personal_report_${findLatestKuisionerUser.user.username}.pdf`
            );
            res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

            // Send the PDF buffer in the response
            res.end(pdfBuffer);
        } catch (error) {
            console.error('Error generating PDF:', error);
            // Handle any errors that occurred during PDF generation
            throw new HttpException('Error generating Excel', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('generate/excel')
    @Roles(ROLES.ADMIN, ROLES.SUPERADMIN)
    async generateExcelResultKuisionerForGeneral(@Res() res: Response, @RoleId() roleId: string, @UserId() userId: string) {

        let data: TakeKuisioner[]
        if (roleId == ROLES.SUPERADMIN) {
            data = await this.takeKuisionerService.findAll()
        } else {
            data = await this.takeKuisionerService.findAllForPsychologist(userId)
        }

        // console.log(data)
        // const data = await this.takeKuisionerService.findAll()
        try {
            // Generate the Excel buffer using the service with enum-based parameters
            const excelBuffer = await this.exportResultService.exportResult(
                ExportType.EXCEL, // Specify Excel export
                data, // Example parameter
                ReportType.SUPERADMIN_EXCEL
            );


            const datenow = new Date().toISOString().split('T')[0];


            // Set response headers for the Excel file
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader(
                'Content-Disposition',
                `attachment; filename=report_all_kuisioner_${datenow}.xlsx`
            );
            res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
            
            

            // Send the Excel buffer in the response
            res.end(excelBuffer);
        } catch (error) {
            console.error('Error generating Excel:', error);
            // Handle any errors that occurred during Excel generation
            throw new HttpException('Error generating Excel', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('generate/excel/:id_user')
    @Roles(ROLES.ADMIN, ROLES.USER, ROLES.SUPERADMIN)
    async generateExcelResultKuisionerForPersonal(
        @Res() res: Response,
        @RoleId() roleId: string,
        @UserId() psychologistId: string,
        @Param('id_user', new ParseUUIDPipe()) userId: string
    ) {

        const data: TakeKuisioner = await this.takeKuisionerService.findLatest(userId)
        if (roleId == ROLES.ADMIN) {
            if (data.user.userPsycholog[0].psychologist.id != psychologistId) {
                throw new ForbiddenException("You are not authorize to export this")
            }
        }

        // console.log(data)
        try {
            // Generate the Excel buffer using the service with enum-based parameters
            const excelBuffer = await this.exportResultService.exportResult(
                ExportType.EXCEL, // Specify Excel export
                data, // Example parameter
                ReportType.PERSONAL_EXCEL
            );

            // Set response headers for the Excel file
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader(
                'Content-Disposition',
                `attachment; filename=report_${data.user.username}_kuisioner.xlsx`,
            );
            res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

            // Send the Excel buffer in the response
            res.end(excelBuffer);
        } catch (error) {
            console.error('Error generating Excel:', error);
            // Handle any errors that occurred during Excel generation
            throw new HttpException('Error generating Excel', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
