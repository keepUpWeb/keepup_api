import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SummaryKuisionerService } from './summary-kuisioner.service';
import { SummaryKuisioner } from './entity/summary-kuisioner.entity';
import { StatistikPsychologyModule } from '../statistik-psychology/statistik-psychology.module';
import { StatistikSuperadminModule } from '../statistik-superadmin/statistik-superadmin.module';
import { AikeepUpModule } from '../aikeep-up/aikeep-up.module';
import { User } from '../user/entities/user.entity';
import { UserAnswerKuisionerModule } from 'src/user-answer-kuisioner/user-answer-kuisioner.module';

@Module({

    imports: [TypeOrmModule.forFeature([SummaryKuisioner,User]), forwardRef(() => StatistikPsychologyModule), forwardRef(() => StatistikSuperadminModule),AikeepUpModule,UserAnswerKuisionerModule],
    providers: [SummaryKuisionerService],
    exports: [SummaryKuisionerService]

})
export class SumaryKuisionerModule { }
