import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { StatistikKuisioner } from '../common/interfaces/StatistikKuisioner.interface';
import {
  Background,
  PreKuisionerAnswer,
  ReportData,
  SymptomResult,
} from '../take-kuisioner/take-kuisioner.model';

@Injectable()
export class AikeepUpService {
  private openai: OpenAI;
  private openAiModel: string;
  private maxTokens: number;
  private temperature: number;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('openai.apiKey'),
    });
    // Load configuration once in the constructor for better efficiency
    this.openAiModel = this.configService.get<string>('openai.model');
    this.maxTokens = this.configService.get<number>('openai.maxTokens');
    this.temperature = this.configService.get<number>('openai.temperature');
  }

  // Private function for making OpenAI chat completions requests
  private async openAiRequest(
    prompt: string,
    systemMessage: string,
  ): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: this.openAiModel,
        messages: [
          {
            role: 'system',
            content: systemMessage,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      throw new Error(`OpenAI request failed: ${error.message}`);
    }
  }

  async generateSumarize(data: StatistikKuisioner): Promise<string> {
    try {
      console.log(data.UserSymptomStatistics);
      const gptPrompt = `
Berikut adalah hasil kuisioner yang berisi data terkait gejala-gejala Stress, Depresi, Prokrastinasi, Kecemasan, Kecanduan Ponsel, serta kemampuan Regulasi Diri mahasiswa. Mohon berikan ringkasan analisis yang padat dan jelas, ditujukan untuk dibaca oleh dosen atau tenaga ahli psikologi.

Ringkasan ini harus menekankan:

Jumlah total pengisi kuisioner

Gejala dengan tingkat keparahan tinggi yang paling sering muncul di antara responden

Pola umum gejala: apakah ada gejala yang cenderung muncul bersamaan, atau muncul secara merata di seluruh responden

Analisis kemampuan regulasi diri mahasiswa: aspek mana yang tampak lemah atau kurang berkembang (misalnya kontrol emosi, manajemen waktu, kesadaran diri)

Gambaran umum tentang kondisi mahasiswa secara kolektif

Kesimpulan akhir yang dapat membantu pihak kampus merancang dukungan, intervensi, atau tindak lanjut

Harap gunakan bahasa yang profesional, langsung ke inti permasalahan, dan mudah dipahami oleh pemangku kepentingan seperti dosen atau pengelola program bimbingan mahasiswa. Hindari penyebutan nama atau informasi pribadi.

Tujuan dari ringkasan ini adalah untuk memetakan kondisi mental dan regulasi diri mahasiswa, serta memberikan arah atau wawasan yang dapat ditindaklanjuti oleh pihak kampus untuk meningkatkan kesejahteraan dan performa akademik mereka.

    Data Kuisioner:
    ${data.UserSymptomStatistics.map(
      (kuisioner, index) => `
    Responden ${index + 1}:
    - Kuisioner: ${kuisioner.kuisionerName}
    - Gejala yang Teramati:
    ${Object.entries(kuisioner.symptoms)
      .map(
        ([symptom, details]) => `
        -- ${symptom}: 
          --- Tingkat Keparahan: ${details.level}`,
      )
      .join('\n')}`,
    ).join('\n\n')}


    Data Semua Jawaban User:
    ${data.AllAnswerFromUser.map(
      (item) => `
    - Sub Kuisioner: ${item.subKuisionerTitle}
    ${item.questions
      .map(
        (q) => `  - Pertanyaan: ${q.questionText}
    ${q.answers
      .map((a) => `    - Jawaban: ${a.answerText} (Dipilih: ${a.count}x)`)
      .join('\n')}`,
      )
      .join('\n')}
    `,
    ).join('\n')}
    `;

      const gptSystem = `
Anda adalah seorang Psikolog Profesional dengan pengalaman lebih dari 10 tahun, terlatih dalam menganalisis dan merangkum data kuisioner terkait kesehatan mental dan regulasi diri mahasiswa.

Tugas Anda adalah menyusun ringkasan analisis yang singkat, terstruktur, dan profesional berdasarkan hasil kuisioner yang berisi data mengenai:

Gejala-gejala utama yang berkaitan dengan Stress, Depresi, Prokrastinasi, Kecemasan, dan Kecanduan Ponsel. Soroti gejala dengan tingkat keparahan tertinggi dan frekuensi kemunculan tertinggi di antara responden.

Pola gejala yang konsisten atau berulang yang muncul di sebagian besar mahasiswa.

Kemampuan Regulasi Diri, dengan menyoroti dimensi-dimensi seperti self-monitoring, pengaturan emosi, manajemen waktu, dan goal-setting. Jelaskan apakah mahasiswa menunjukkan kesulitan dalam aspek tertentu yang berpotensi mengganggu perkembangan akademik atau psikososialnya.

Kesimpulan umum, berupa gambaran singkat kondisi psikologis mahasiswa secara kolektif dan kemungkinan intervensi atau dukungan lanjutan yang bisa dilakukan oleh pihak kampus.

Gunakan bahasa yang akurat, sopan, dan profesional, tanpa menyebutkan nama individu atau informasi yang bersifat pribadi. Tulis seolah-olah Anda menyampaikan hasil ini kepada seorang dosen atau manajer program yang membutuhkan informasi ini untuk pengambilan keputusan atau penyusunan kebijakan pendampingan mahasiswa.
        `;

      return await this.openAiRequest(gptPrompt, gptSystem);
    } catch (error) {
      console.error('Error generating summary:', error);
      throw new Error('Gagal menghasilkan ringkasan. Mohon coba lagi nanti.');
    }
  }

  async generateReport(data: ReportData): Promise<string> {
    try {
      const gptPrompt = ` 
      Buatkan laporan psikologi hasil asesmen berupa skrining kesehatan mental mahasiswa.  Skrining terdiri dari data stres, depresi, kecemasan dari skala DASS.  Ditambah data skala prokrastinasi akademik, kecanduan ponsel, dan regulasi diri. Selain itu ada data riwayat kesehatan masalah berat, dukungan keluarga, kondisi finansial, masalah dengan dosen/kampus, orangtua, teman, saudara, riwayat apakah pernah alami masalah berat sehingga datang ke psikolog/psikiater. \n
      Buat laporan dengan bahasa yang mudah dipahami orang awam dengan elemen: deskripsi kondisi mahasiswa, dampaknya bagi mahasiswa, rekomendasi singkat apa yang perlu dilakukan mahasiswa tersebut. Hasil analisis harus berupa teks biasa tanpa format khusus, disusun dalam 5 paragraf.  Gunakan kata sapaan “Kamu”. \n
      Paragraf pertama menjelaskan tingkat stres, depresi, kecemasan berdasarkan skor yang diperoleh.  Tanpa perlu menuliskan skor. lengkapi dengan elaborasi gejala atau simptom yang muncul.  elaborasi apa dampak dari tingkat stres, depresi, kecemasan itu pada konteks klien sebagai mahasiswa. \n
      Paragraf kedua menjelaskan tingkat prokrastinasi, kecanduan ponsel, dan regulasi diri berdasarkan skor yang diperoleh.  Lengkapi dengan elaborasi gejala atau simptom yang muncul. Elaborasi apa dampak dari tingkat prokrastinasi, kecanduan ponsel, regulasi diri itu pada konteks klien sebagai mahasiswa. \n
      Paragraf ketiga menjelaskan faktor resiko kesehatan mental berdasarkan data riwayat kesehatan masalah berat, dukungan keluarga, kondisi finansial, masalah dengan dosen/kampus, orangtua, teman, saudara, riwayat apakah pernah alami masalah berat sehingga datang ke psikolog/psikiater.  Elaborasikan kondisi individu itu dikaitkan dengan ada atau tidaknya resiko masalah kesehatan mental atau faktor protektif yang ada pada konteks klien sebagai mahasiswa. \n
      Paragraf keempat menjelaskan Kesimpulan secara keseluruhan dengan mempertimbangkan dan integrasikan semua data dari paragraf 1-3 sebelumnya dengan sistematis logis.  Elaborasi keterkaitan semua data itu.  Berikan Kesimpulan akhir seberapa besar resiko muncul masalah kesehatan mental. Bila ada, Apa dampaknya? Berikan subjudul “Kesimpulan” khusus pada paragraf ini. Kata kesimpulan ditulis terpisah dari paragraf 4.  \n
      Paragraf kelima, menjelaskan rekomendasi yang praktis berdasarkan masalah pada paragraf 1-4 sebelumnya. Tulis dengan panjang kata sekitar 500-600 kata.
    
              \n  ### Data untuk Analisis:
            Latar Belakang:
            ${data.background
              .map(
                (item) => `
              - Kategori: ${item.categoryName}
              ${item.preKuisionerAnswer
                .map(
                  (dataBackground) => `
                - Pertanyaan: ${dataBackground.question}
                - Jawaban: ${dataBackground.answer}`,
                )
                .join('\n')}
              `,
              )
              .join('\n')}
      
            Data:
            ${data.result
              .map(
                (item) => `
              - Nama: ${item.nameSymtomp}
              - Tingkat: ${item.level}
              - Skor: ${item.score}`,
              )
              .join('\n')}`;

      console.log(gptPrompt);

      const gptSystem =
        'You are a highly skilled psychologist specializing in analyzing patient conditions based on questionnaire responses. Your role is to generate detailed, empathetic, and well-structured psychological analysis reports based on the provided data. Your reports should offer in-depth insights into each symptom, its potential effects, and recommendations for intervention, using a formal and empathetic tone suitable for patients and their needs. Please ensure the output is plain text, with no special formatting such as **bold**.';

      // Extract and format the response content, ensuring plain text output
      const generatedReport = await this.openAiRequest(gptPrompt, gptSystem);
      return generatedReport;
    } catch (error) {
      console.error('Error generating report from OpenAI:', error);
      throw new Error(
        `Failed to generate report from OpenAI: ${error.message}`,
      );
    }
  }

  async generateReportTesting(
    data: ReportData,
    gptPromptTesting: string,
    gptSystemTesting: string,
  ): Promise<string> {
    try {
      const gptPrompt =
        gptPromptTesting +
        `       
        \n  ### Data untuk Analisis:
      Latar Belakang:
      ${data.background
        .map(
          (item) => `
        - Kategori: ${item.categoryName}
        ${item.preKuisionerAnswer
          .map(
            (dataBackground) => `
          - Pertanyaan: ${dataBackground.question}
          - Jawaban: ${dataBackground.answer}`,
          )
          .join('\n')}
        `,
        )
        .join('\n')}

      Data:
      ${data.result
        .map(
          (item) => `
        - Nama: ${item.nameSymtomp}
        - Tingkat: ${item.level}
        - Skor: ${item.score}`,
        )
        .join('\n')}`;

      const gptSystem = gptSystemTesting;

      console.log(gptPrompt);
      console.log(gptSystem);
      // Extract and format the response content, ensuring plain text output
      const generatedReport = await this.openAiRequest(gptPrompt, gptSystem);
      return generatedReport;
    } catch (error) {
      console.error('Error generating report from OpenAI:', error);
      throw new Error(
        `Failed to generate report from OpenAI: ${error.message}`,
      );
    }
  }
}
