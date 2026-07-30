import * as XLSX from "xlsx";

import {
    DocumentParser,
    ParsedPage,
} from "../../types/parser";

import { tableToText } from "../../utils/tableToText";

export class ExcelParser implements DocumentParser {

    async parse(file: File): Promise<ParsedPage[]> {

        const arrayBuffer = await file.arrayBuffer();

        const workbook = XLSX.read(arrayBuffer);

        const pages: ParsedPage[] = [];

        workbook.SheetNames.forEach((sheetName, index) => {

            const worksheet = workbook.Sheets[sheetName];

            const rows = XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
                defval: "",
                raw: false,
                blankrows: false,
            }) as string[][];

            if (rows.length === 0) {
                return;
            }

            const headers = rows[0].map(String);

            const data = rows
                .slice(1)
                .map(row => row.map(value => String(value)));

            pages.push({

                pageNumber: index + 1,

                title: sheetName,

                text: tableToText(
                    headers,
                    data,
                    `Worksheet: ${sheetName}`
                ),

            });

        });

        return pages;

    }

}