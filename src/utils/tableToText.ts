export function tableToText(
    headers: string[],
    rows: string[][],
    title?: string
): string {

    let text = "";

    if (title) {
        text += `${title}\n\n`;
    }

    rows.forEach((row, rowIndex) => {

        text += `Row ${rowIndex + 1}\n\n`;

        headers.forEach((header, columnIndex) => {
            text += `${header}: ${row[columnIndex] ?? ""}\n`;
        });

        text += "\n--------------------\n\n";

    });

    return text.trim();

}