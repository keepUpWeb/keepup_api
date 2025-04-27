import { forwardRef, Module } from '@nestjs/common';
import { UserAnswerSubKuisionerService } from './user-answer-sub-kuisioner.service';
import { UserAnswerSubKuisionerController } from './user-answer-sub-kuisioner.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAnswerSubKuisioner } from './entities/user-answer-sub-kuisioner.entity';
import { SubKuisionerModule } from '../sub-kuisioner/sub-kuisioner.module';
import { TakeKuisionerModule } from '../take-kuisioner/take-kuisioner.module';
import { UserAnswerKuisionerModule } from '../user-answer-kuisioner/user-answer-kuisioner.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserAnswerSubKuisioner]),

    SubKuisionerModule,
    TakeKuisionerModule,

    forwardRef(() => UserAnswerKuisionerModule),
  ],
  controllers: [UserAnswerSubKuisionerController],
  providers: [UserAnswerSubKuisionerService],
  exports: [UserAnswerSubKuisionerService],
})
export class UserAnswerSubKuisionerModule {}
