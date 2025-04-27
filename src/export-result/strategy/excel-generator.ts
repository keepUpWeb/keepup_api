import { UserAnswerSubKuisioner } from '../../user-answer-sub-kuisioner/entities/user-answer-sub-kuisioner.entity';
import { ExcelReportGenerator } from './excel-export.strategy';
import * as ExcelJS from 'exceljs';
import { TakeKuisioner } from '../..//take-kuisioner/entities/take-kuisioner.entity';

export class ClientExportReportGenerator extends ExcelReportGenerator {
  async generate(doc: any, data: TakeKuisioner): Promise<ExcelJS.Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`${data.user.username} Report`);

    // Add user details as standalone rows
    worksheet.addRow(['Nama:', data.user.username]);
    worksheet.mergeCells('B1:D1'); // Merge columns B, C, and D for Name row

    worksheet.addRow(['NIM:', data.user.nim]);
    worksheet.mergeCells('B2:D2'); // Merge columns B, C, and D for NIM row

    worksheet.addRow(['Email:', data.user.email]);
    worksheet.mergeCells('B3:D3'); // Merge columns B, C, and D for Email row

    worksheet.addRow(['Fakultas:', data.user.faculty.name]);
    worksheet.mergeCells('B4:D4'); // Merge columns B, C, and D for Fakultas row

    worksheet.addRow([
      'Semester:',
      (new Date().getFullYear() - data.user.yearEntry) * 2 +
        (new Date().getMonth() >= 3 ? 1 : 0) -
        1,
    ]).alignment = { horizontal: 'left' };
    worksheet.mergeCells('B5:D5'); // Merge columns B, C, and D for Semester row

    worksheet.addRow([]); // Blank row for spacing

    // Add header row
    worksheet.addRow([
      'SubKuisioner',
      'Level',
      'Score',
      'Question',
      'Answer',
      'Answer Score',
    ]).font = { bold: true };

    // Enable text wrapping and alignment
    worksheet.columns = [
      {
        key: 'subKuisioner',
        width: 30,
        alignment: { vertical: 'middle', wrapText: true },
      },
      { key: 'level', width: 25 },
      { key: 'score', width: 10 },
      { key: 'question', width: 50, alignment: { wrapText: true } },
      { key: 'answer', width: 50, alignment: { wrapText: true } },
      { key: 'answerScore', width: 15 },
      { key: 'aiSuggest', width: 40 },
    ];

    worksheet.getColumn('question').alignment = {
      wrapText: true,
      vertical: 'middle',
    };
    worksheet.getColumn('answer').alignment = {
      wrapText: true,
      vertical: 'middle',
    };

    // Populate rows dynamically with SubKuisioner data
    data.userAnswerSubKuisioner.forEach(
      (subKuisioner: UserAnswerSubKuisioner) => {
        const startRow = worksheet.lastRow ? worksheet.lastRow.number + 1 : 1; // Starting row for this SubKuisioner

        // Add rows for each question and answer within the SubKuisioner
        subKuisioner.userAnswerKuisioners.forEach((qa: any) => {
          worksheet.addRow({
            subKuisioner: '',
            level: subKuisioner.level,
            score: subKuisioner.score,
            question: qa.answer.questionId.question,
            answer: qa.answer.answer,
            answerScore: qa.answer.score,
          });
        });

        const endRow = worksheet.lastRow ? worksheet.lastRow.number : startRow; // Ending row for this SubKuisioner

        // Merge cells vertically for the SubKuisioner column
        worksheet.mergeCells(`A${startRow}:A${endRow}`);
        worksheet.getCell(`A${startRow}`).value =
          subKuisioner.subKuisioner.title;
        worksheet.getCell(`A${startRow}`).alignment = {
          vertical: 'middle',
          horizontal: 'center',
        };
        worksheet.getCell(`A${startRow}`).font = { bold: true };

        // Merge cells horizontally for the Level and Score columns
        worksheet.mergeCells(`B${startRow}:B${endRow}`);
        worksheet.getCell(`B${startRow}`).value = `${subKuisioner.level}`;
        worksheet.getCell(`B${startRow}`).alignment = {
          vertical: 'middle',
          horizontal: 'center',
        };
        worksheet.getCell(`B${startRow}`).font = { bold: true };

        worksheet.mergeCells(`C${startRow}:C${endRow}`);
        worksheet.getCell(`C${startRow}`).value = `${subKuisioner.score}`;
        worksheet.getCell(`C${startRow}`).alignment = {
          vertical: 'middle',
          horizontal: 'center',
        };
        worksheet.getCell(`C${startRow}`).font = { bold: true };

        // Apply borders to all rows in this block
        for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
          const row = worksheet.getRow(rowIndex);
          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' },
            };
          });
        }

        // Add a blank row after each SubKuisioner block
        worksheet.addRow([]);
      },
    );

    // Add "AI Suggest" row with styling
    const aiSuggestRowTopic = worksheet.addRow(['AI Suggest']);
    aiSuggestRowTopic.font = { bold: true, size: 16 }; // Bold and larger font

    // Add the "AI Suggest" row
    const mergeStartColumn = 1; // Starting column index (e.g., column A)
    const mergeEndColumn = 7; // Ending column index (e.g., column G)
    const aiSuggestRow = worksheet.addRow([]); // Empty row for AI Suggest
    const aiSuggestRowIndex = aiSuggestRow.number;

    // Merge the specified columns
    worksheet.mergeCells(
      aiSuggestRowIndex,
      mergeStartColumn,
      aiSuggestRowIndex,
      mergeEndColumn,
    );

    // Dynamically insert line breaks to simulate wrapping for `data.report`
    const maxCellWidth = 200; // Define your desired width in characters
    const wrappedReport = wrapText(data.report, maxCellWidth);

    // Set the merged cell content and alignment
    worksheet.getCell(aiSuggestRowIndex, mergeStartColumn).value =
      `${wrappedReport}`;
    worksheet.getCell(aiSuggestRowIndex, mergeStartColumn).alignment = {
      vertical: 'middle',
      horizontal: 'left',
      wrapText: true,
    };
    worksheet.getCell(aiSuggestRowIndex, mergeStartColumn).font = {
      bold: true,
    };

    // Set the height for the "AI Suggest" row
    aiSuggestRow.height = 900; // Adjust this value as needed

    // Utility function to wrap text
    function wrapText(text: string, width: number): string {
      const regex = new RegExp(`(.{1,${width}})(\\s|$)`, 'g');
      return text.match(regex)?.join('\n') || text;
    }

    // Create a buffer from the workbook and return it
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
}

export class SuperAdminExportReportGenerator extends ExcelReportGenerator {
  async generate(doc: any, data: TakeKuisioner[]): Promise<ExcelJS.Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Kuisioner Report');

    // Group questions under subKuisioner titles
    const subBabMap = new Map<string, string[]>(); // title => [questions]
    data.forEach((userData) => {
      userData.userAnswerSubKuisioner.forEach((sub) => {
        if (!subBabMap.has(sub.subKuisioner.title)) {
          subBabMap.set(sub.subKuisioner.title, []);
        }
        sub.userAnswerKuisioners.forEach((qa) => {
          const question = qa.answer.questionId.question;
          const questions = subBabMap.get(sub.subKuisioner.title)!;
          if (!questions.includes(question)) {
            questions.push(question);
          }
        });
      });
    });

    // Prepare base headers
    const baseHeaders = ['Name', 'NIM', 'Email', 'Faculty', 'Semester'];

    // First header row: subKuisioner titles (with merged cells)
    const firstHeaderRow = [...baseHeaders];
    const secondHeaderRow = Array(baseHeaders.length).fill(''); // second row placeholders

    subBabMap.forEach((questions, subTitle) => {
      firstHeaderRow.push(subTitle, ...Array(questions.length - 1).fill(''));
      secondHeaderRow.push(...questions);
    });

    // Add header rows
    worksheet.addRow(firstHeaderRow);
    worksheet.addRow(secondHeaderRow);

    // Merge cells for subKuisioner titles in the first row
    let colIndex = baseHeaders.length + 1;
    subBabMap.forEach((questions, subTitle) => {
      const startCol = colIndex;
      const endCol = colIndex + questions.length - 1;
      worksheet.mergeCells(1, startCol, 1, endCol);

      // Center the merged cell for the subKuisioner title
      worksheet.getCell(1, startCol).alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
      };

      colIndex += questions.length;
    });

    // Merge base headers vertically
    for (let i = 1; i <= baseHeaders.length; i++) {
      worksheet.mergeCells(1, i, 2, i);
    }

    // Add bold styling to header rows
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(2).font = { bold: true };

    // Add user data rows
    data.forEach((userData) => {
      const { user } = userData;
      const semester =
        (new Date().getFullYear() - user.yearEntry) * 2 +
        (new Date().getMonth() >= 3 ? 1 : 0) -
        1;

      const userRow: (string | number)[] = [
        user.username,
        user.nim,
        user.email,
        user.faculty.name,
        semester,
      ];

      // Map question => score for current user
      const userScores = new Map<string, number>();
      userData.userAnswerSubKuisioner.forEach((sub) => {
        sub.userAnswerKuisioners.forEach((qa) => {
          const question = qa.answer.questionId.question;
          userScores.set(question, qa.answer.score);
        });
      });

      // Fill the user's score for each question
      subBabMap.forEach((questions) => {
        questions.forEach((q) => {
          userRow.push(userScores.get(q) || 0);
        });
      });

      worksheet.addRow(userRow);
    });

    // Formatting
    worksheet.columns.forEach((col) => {
      col.width = 20;
      col.alignment = { vertical: 'middle', wrapText: true };
    });

    // Return Excel file buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
}
