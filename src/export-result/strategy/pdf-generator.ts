import { Background, PreKuisionerAnswer, ReportData } from "../../take-kuisioner/take-kuisioner.model";
import { PDFReportGenerator } from "./pdf-export.strategy";

export class PersonalPDFReportGenerator extends PDFReportGenerator {
    generate(doc: PDFKit.PDFDocument, data: ReportData): void {
        // Blue header bar
        doc
            .rect(0, 0, doc.page.width, 50)
            .fill('#004b93')
            .fillColor('#ffffff')
            .fontSize(20)
            .text('Laporan Assesment Kesehatan Mental', 50, 15, { align: 'center' })
            .fillColor('#000000') // Reset fill color
            .moveDown(2);

        // Personal Information Section
        doc
            .fontSize(14)
            .font('Helvetica-Bold')
            .text(`Nama: ${data.user.username}`)
            .text(`NIM: ${data.user.nim}`)
            .text(`Semester: ${(((new Date().getFullYear() - data.user.yearEntry) * 2) + (new Date().getMonth() >= 6 ? 1 : 0))}`)
            .text(`Fakultas: ${data.user.faculty.name||"test"}`)
            .moveDown(2); // Increase spacing after personal info

        // Background

        doc
            .fontSize(16)
            .fillColor('#004b93') // Blue color for section headers
            .text('Informasi Latar Belakang', { underline: true })
            .moveDown(1) // Add more space before content
            .fillColor('#000000') // Reset to black for content
            .font('Helvetica');

        // Background Information Content
        const background = data.background;
        background.forEach((category: Background) => {
            // Render the category header
            doc
                .font('Helvetica-Bold') // Bold font for category header
                .fontSize(14)
                .text(`${category.categoryName}:`, { indent: 20 })
                .moveDown(0.5);

            // Reset font for questions and answers
            doc.font('Helvetica').fontSize(12);

            category.preKuisionerAnswer.forEach((answer: PreKuisionerAnswer) => {
                // Render question
                doc
                    .text(`• ${answer.question}`, 80, doc.y,) // Add a bullet point for better readability
                    .moveDown(0.2);

                // Render answer
                doc
                    .font('Helvetica-Bold') // Bold font for answer
                    .text(`  ${answer.answer}`, 50, doc.y, { indent: 50 }) // Indent answer slightly more than the question
                    .font('Helvetica') // Reset font for next question
                    .moveDown(0.5);
            });
            // Extra spacing after each category
            doc.moveDown(1);
        });


        // Results Section Header
        doc
            .fontSize(16)
            .fillColor('#004b93')
            .text('Hasil Assessment', { underline: true })
            .moveDown(1)
            .fillColor('#000000')
            .font('Helvetica');

        // Results Table
        const results = data.result;
        const tableX = 50;
        let tableY = doc.y;

        // Table Header
        doc
            .fontSize(12)
            .rect(tableX, tableY, doc.page.width - 100, 25)
            .fill('#004b93')
            .fillColor("#ffffff")
            .text('Kondisi', tableX + 10, tableY + 5, { width: 150 })
            .text('Level', tableX + 180, tableY + 5, { width: 100 })
            .text('Skor', tableX + 300, tableY + 5, { width: 100 })
            .fillColor('#000000');

        // Table Rows
        tableY += 25; // Adjust position for rows
        const levelColors: { [key: string]: string } = {
            "very low": "#d4edda",
            "low": "#cce5ff",
            "intermediate": "#fff3cd",
            "high": "#f8d7da",
            "very high": "#f5c6cb"
        };
        
        const levelTranslate: { [key: string]: string } = {
            "very low": "Sangat Rendah",
            "low": "Rendah",
            "intermediate": "Sedang",
            "high": "Tinggi",
            "very high": "Sangat Tinggi"
        };
        
        // Saat menampilkan teks level
        results.forEach((result) => {
            const levelLower = result.level.toLowerCase();
            const bgColor = levelColors[levelLower] || "#ffffff"; // Tetap pakai warna level
            const translatedLevel = levelTranslate[levelLower] || result.level; // Gunakan terjemahan jika tersedia
        
            doc
                .save()
                .rect(tableX, tableY, doc.page.width - 100, 20)
                .fill(bgColor)
                .restore();
        
            doc.fillColor("#000000");
        
            doc
                .text(result.nameSymtomp, tableX + 10, tableY + 5, { width: 150 })
                .text(translatedLevel, tableX + 180, tableY + 5, { width: 100 }) // Ubah ke bahasa Indonesia
                .text(result.score.toString(), tableX + 300, tableY + 5, { width: 100 });
        
            tableY += 20;
        });      


        // Report Section
        doc
            .moveDown(2)
            .fontSize(16)
            .fillColor('#004b93') // Blue color for section headers
            .text('Hasil Analisis', 50, doc.y, { underline: true })
            .moveDown(1) // Add more space before content
            .fillColor('#000000') // Reset to black for content
            .font('Helvetica');

        doc
            .fontSize(12)
            .text(data.report, 50, doc.y, {
                align: 'justify',
            })
            .moveDown(1);

        // Final Note (if any)
        doc
            .moveDown(1)
            .fontSize(12)
            .text('Note: This report is confidential and intended for the recipient only.', { align: 'center' });
    }
}


export class PsychologistPDFReportGenerator extends PDFReportGenerator {
    generate(doc: any, data: any): void {
        doc
            .fontSize(14)
            .text(`Psychologist Report for: ${data.name}`)
            .moveDown()
            .text(`Session Date: ${data.sessionDate || 'Not specified.'}`)
            .moveDown()
            .text(`Notes: ${data.notes || 'No notes available.'}`);
    }
}

export class AnotherPDFReportGenerator extends PDFReportGenerator {
    generate(doc: any, data: any): void {
        doc
            .fontSize(14)
            .text(`Another Report for: ${data.name}`)
            .moveDown()
            .text(`Data: ${data.data || 'No data available.'}`);
    }
}
