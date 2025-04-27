import { AnswerKuisionerGroupAll } from "src/user-answer-kuisioner/dto/group-user-answer-kuisioner";
import { Level } from "../../user-answer-sub-kuisioner/group/level.enum";

export interface SymptomScore {
    score: number; // Calculated score for the symptom
    level: Level | null; // Level of the symptom (e.g., SUPERHIGH, HIGH, etc.)
}


export interface UserSymptomStatistic {
    takeKuisionerId: string;   // ID of the questionnaire attempt
    userId: string;            // ID of the user
    kuisionerId: string;       // ID of the questionnaire
    kuisionerName: string;     // Name of the questionnaire
    userName: string;     
    symptoms: Record<string, SymptomScore>; // Updated type     // Name of the user
    contact: string;           // Contact information of the user
}

export interface StatistikKuisioner {
    UserSymptomStatistics: UserSymptomStatistic[];
    AllAnswerFromUser?:AnswerKuisionerGroupAll[]; // All answers from users grouped by questionnaire
}
