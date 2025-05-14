import { Controller, Get, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { UserAnswerKuisionerService } from './user-answer-kuisioner/user-answer-kuisioner.service';
import { ResponseApi } from './common/response/responseApi.format';

@Controller()
export class AppController {
  @Get()
  async getHello(): Promise<{ message: string }> {
    const banner = `
  _   _      _ _
 | | | | ___| | | ___
 | |_| |/ _ \\ | |/ _ \\
 |  _  |  __/ | | (_) |
 |_| |_|\\___|_|_|\\___/

  Muhammad Daffa Raihan | Backend Dev | Universitas Islam Indonesia
    `;

    return { message: banner };
  }
}
