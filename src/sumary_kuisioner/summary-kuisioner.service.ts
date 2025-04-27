import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SummaryKuisioner } from './entity/summary-kuisioner.entity';
import { User } from '../user/entities/user.entity';
import { ROLES } from '../roles/group/role.enum';
import { StatistikSuperadminService } from '../statistik-superadmin/statistik-superadmin.service';
import { StatistikPsychologyService } from '../statistik-psychology/statistik-psychology.service';
import { AikeepUpService } from '../aikeep-up/aikeep-up.service';
import { UserAnswerKuisionerService } from 'src/user-answer-kuisioner/user-answer-kuisioner.service';

@Injectable()
export class SummaryKuisionerService {
    constructor(
        @InjectRepository(SummaryKuisioner)
        private readonly sumarizeRepository: Repository<SummaryKuisioner>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @Inject(StatistikSuperadminService)
        private readonly statistikSuperadminService: StatistikSuperadminService,

        @Inject(UserAnswerKuisionerService)
        private readonly userAnswerKuisionerService: UserAnswerKuisionerService,

        @Inject(StatistikPsychologyService)
        private readonly statistikPsychologyService: StatistikPsychologyService,

        @Inject(AikeepUpService)
        private readonly aiKeepUpService: AikeepUpService
    ) { }

    async getOrUpdateSummaryForUser(userId: string): Promise<SummaryKuisioner> {
        // Check if the user exists
        const user = await this.userRepository.findOne({ where: { id: userId }, relations:["role"] });
        if (!user) {
            throw new Error('User not found');
        }


        // let allAnswerUser = await this.userAnswerKuisionerService.getMostSelectedAnswersGroupedBySubKuisioner();

        // console.log(JSON.stringify(allAnswerUser, null, 2));

        // Check if a summary already exists for the user
        let summary = await this.sumarizeRepository.findOne({
            where: { user: { id: userId } },
        });

        // If no summary exists, create a new one with basic values
        if (!summary) {
            summary = this.sumarizeRepository.create({
                user,
                sumarize: '',
                kuisionerFinished: 0,
            });
            summary = await this.sumarizeRepository.save(summary);
        }

        // Fetch the current kuisioner finished count based on user role
        const currentKuisionerFinished =
            user.role.id === ROLES.SUPERADMIN
                ? (await this.statistikSuperadminService.countAllUserKuisionerStatistik()).userDoneKuisioner
                : (await this.statistikPsychologyService.countAllUserKuisionerStatistikPsychology(userId)).userDoneKuisioner;

        // If the current count is different from the saved one, update the summary
        if (summary.kuisionerFinished !== currentKuisionerFinished) {
            summary.kuisionerFinished = currentKuisionerFinished;

            const dataStatistikKuisioner =
                user.role.id === ROLES.SUPERADMIN
                    ? (await this.statistikSuperadminService.getAllUserKuisionerStatistik())
                    : (await this.statistikPsychologyService.findClientsUserStatistikForPsychologist(userId));

            dataStatistikKuisioner.AllAnswerFromUser = await this.userAnswerKuisionerService.getMostSelectedAnswersGroupedBySubKuisioner();
            summary.sumarize = await this.aiKeepUpService.generateSumarize(dataStatistikKuisioner); // Generate new summary text
            await this.sumarizeRepository.save(summary);
        }

        return summary;
    }
}
