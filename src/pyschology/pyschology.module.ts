import { Module } from '@nestjs/common';
import { PyschologyService } from './pyschology.service';
import { PyschologyController } from './psychology.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { RolesModule } from '../roles/roles.module';
import { TakeKuisioner } from '../take-kuisioner/entities/take-kuisioner.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, TakeKuisioner]), RolesModule],
  controllers: [PyschologyController],
  providers: [PyschologyService],
  exports: [PyschologyService],
})
export class PyschologyModule { }
