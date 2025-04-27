import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from './entities/auth.entity';
import { EmailModule } from '../email/email.module';
import { UserModule } from '../user/user.module';
import { RolesModule } from '../roles/roles.module';
import { JwtKeepUpModule } from '../jwt/jwt.module';
import { ClientPsychologistModule } from '../client_psychologist/client_psychologist.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Auth]),
    JwtKeepUpModule,
    RolesModule,
    EmailModule,
    UserModule,
    ClientPsychologistModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
