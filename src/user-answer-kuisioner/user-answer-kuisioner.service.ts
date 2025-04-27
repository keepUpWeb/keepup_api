import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UpdateUserAnswerKuisionerDto } from './dto/update-user-answer-kuisioner.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAnswerKuisioner } from './entities/user-answer-kuisioner.entity';
import { QueryRunner, Repository } from 'typeorm';
import { AnswersService } from '../answers/answers.service';
import { UserAnswerSubKuisionerService } from '../user-answer-sub-kuisioner/user-answer-sub-kuisioner.service';
import { CreateUserAnswerKuisionerDto } from './dto/create-user-answer-kuisioner.dto';
import { UserAnswerSubKuisioner } from '../user-answer-sub-kuisioner/entities/user-answer-sub-kuisioner.entity';
import { AnswerKuisionerGroupAll } from './dto/group-user-answer-kuisioner';

@Injectable()
export class UserAnswerKuisionerService {
  constructor(
    @InjectRepository(UserAnswerKuisioner)
    private readonly userAnswerKuisionerRepository: Repository<UserAnswerKuisioner>,

    @Inject(AnswersService)
    private readonly answerService: AnswersService,

    @Inject(forwardRef(() => UserAnswerSubKuisionerService))
    private readonly userAnswerSubKuisionerService: UserAnswerSubKuisionerService,
  ) {}

  async create(
    idTakeSubKuisioner: string,
    createUserAnswerKuisionerDto: CreateUserAnswerKuisionerDto[],
    queryRunner: QueryRunner, // Add QueryRunner to ensure transactional consistency
  ) {
    let score = 0;
    const takeSubKuisioner = await queryRunner.manager.findOne(
      UserAnswerSubKuisioner,
      { where: { id: idTakeSubKuisioner } },
    );
    for (const answer of createUserAnswerKuisionerDto) {
      const answerData = await this.answerService.findOne(answer.answerId);

      const saveData = this.userAnswerKuisionerRepository.create({
        userAnswerSubKuisioner: takeSubKuisioner,
        answer: answerData,
      });

      score += answerData.score;

      await queryRunner.manager.save(saveData); // Save using queryRunner
    }

    return { score: score };
  }

  async getMostSelectedAnswersGroupedBySubKuisioner() : Promise<AnswerKuisionerGroupAll[]> {
    const result = await this.userAnswerKuisionerRepository
      .createQueryBuilder('userAnswerKuisioner')
      .leftJoin('userAnswerKuisioner.userAnswerSubKuisioner', 'userSub')
      .leftJoin('userSub.subKuisioner', 'subKuisioner')
      .leftJoin('userSub.takeKuisioner', 'take_kuisioner')
      .leftJoinAndSelect('take_kuisioner.user', 'userEminds')
      .leftJoin('userAnswerKuisioner.answer', 'answer')
      .leftJoin('answer.questionId', 'question')
      .where(
        `take_kuisioner."createdAt" = (
        SELECT MAX(tk."createdAt")
        FROM take_kuisioner tk
        WHERE tk."userId" = take_kuisioner."userId"
    )`,
      )
      .andWhere('take_kuisioner.isFinish = :isFinish', { isFinish: true })
      .select('subKuisioner.title', 'subKuisionerTitle')
      .addSelect('question.question', 'questionText')
      .addSelect('answer.answer', 'answerText')
      .addSelect('COUNT(*)', 'count')
      .groupBy('subKuisioner.title')
      .addGroupBy('question.question')
      .addGroupBy('answer.answer')
      .orderBy('subKuisioner.title', 'ASC')
      .addOrderBy('question.question', 'ASC')
      .addOrderBy('count', 'DESC')
      .getRawMany();

    // Format results into structured object
    const grouped = Object.entries(
      result.reduce(
        (acc, { subKuisionerTitle, questionText, answerText, count }) => {
          if (!acc[subKuisionerTitle]) acc[subKuisionerTitle] = {};
          if (!acc[subKuisionerTitle][questionText])
            acc[subKuisionerTitle][questionText] = [];
          acc[subKuisionerTitle][questionText].push({
            answerText,
            count: Number(count),
          });
          return acc;
        },
        {},
      ),
    ).map(([subTitle, questions]) => ({
      subKuisionerTitle: subTitle,
      questions: Object.entries(questions).map(([questionText, answers]) => ({
        questionText,
        answers,
      })),
    }));

    return grouped;
  }

  findAll() {
    return `This action returns all userAnswerKuisioner`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userAnswerKuisioner`;
  }

  update(id: number) {
    return `This action updates a #${id} userAnswerKuisioner`;
  }

  remove(id: number) {
    return `This action removes a #${id} userAnswerKuisioner`;
  }
}
