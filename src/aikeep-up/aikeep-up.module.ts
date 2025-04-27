import { Module } from '@nestjs/common';
import { AikeepUpService } from './aikeep-up.service';
import { ConfigModule } from '@nestjs/config';
import aiConfig from '../config/ai.config';
import { validationSchema } from '../config/validation.schema';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TakeKuisioner } from '../take-kuisioner/entities/take-kuisioner.entity';
import { AIkeepUpController } from './aikeep-up.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [aiConfig], // Load only the database config
      validationSchema, // Use the Joi schema for validation
      envFilePath: ['.env'], // Use the environment file
    }),
    TypeOrmModule.forFeature([TakeKuisioner]),
  ],
  providers: [AikeepUpService],
  controllers: [AIkeepUpController],
  exports:[AikeepUpService]
})
export class AikeepUpModule {}
