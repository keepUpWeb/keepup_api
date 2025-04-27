import { forwardRef, Module } from '@nestjs/common';
import { StatistikSuperadminService } from './statistik-superadmin.service';
import { StatistikSuperadminController } from './statistik-superadmin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TakeKuisioner } from '../take-kuisioner/entities/take-kuisioner.entity';
import { User } from '../user/entities/user.entity';
import { RolesModule } from '../roles/roles.module';
import { SumaryKuisionerModule } from '../sumary_kuisioner/sumary_kuisioner.module';
import { PreKuisionerUserAnswer } from '../pre-kuisioner-user-answer/entities/pre-kuisioner-user-answer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TakeKuisioner,User,PreKuisionerUserAnswer]), RolesModule,  forwardRef(() => SumaryKuisionerModule)],
  providers: [StatistikSuperadminService],
  controllers: [StatistikSuperadminController],
  exports:[StatistikSuperadminService]
})
export class StatistikSuperadminModule {}
