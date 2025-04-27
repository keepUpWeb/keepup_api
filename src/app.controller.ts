import { Controller, Get, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { UserAnswerKuisionerService } from './user-answer-kuisioner/user-answer-kuisioner.service';
import { ResponseApi } from './common/response/responseApi.format';

@Controller()
export class AppController {
  constructor(private readonly appService: UserAnswerKuisionerService) {}

  @Get()
  async getHello(): Promise<ResponseApi<any>> {
    const result =
      await this.appService.getMostSelectedAnswersGroupedBySubKuisioner();
    return new ResponseApi(
      HttpStatus.OK,
      'Successfully Fetched Kuisioner History',
      result,
    );
  }
}
