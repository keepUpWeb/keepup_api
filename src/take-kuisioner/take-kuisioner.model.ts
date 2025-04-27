import { User } from "../user/entities/user.entity";

export interface PreKuisionerAnswer {
    answer:string
    question:string
    // Define this based on the structure of data inside preKuisionerAnswer
}

export interface KuisiorAnswer {
    answer:string
    question:string
    score: number
    // Define this based on the structure of data inside preKuisionerAnswer
}

export interface Background {
    categoryName: string;
    preKuisionerAnswer: PreKuisionerAnswer[];
}

export interface SymptomResult {
    nameSymtomp: string;
    level: string;
    score: number;
    userAnswerKuisioner: KuisiorAnswer[]

}

export interface ReportData {
    background: Background[];
    result: SymptomResult[];
    report?:string
    user:User
}