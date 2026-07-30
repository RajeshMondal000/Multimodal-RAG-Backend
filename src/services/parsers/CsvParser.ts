import { parse } from "csv-parse/sync";

import {
    DocumentParser,
    ParsedPage,
} from "../../types/parser";

import { tableToText } from "../../utils/tableToText";

export class CsvParser implements DocumentParser {

    async parse(file: File): Promise<ParsedPage[]> {

        const csv = await file.text();

        const records = parse(csv, {
            skip_empty_lines: true,
            trim: true,
        });

        if (!records.length) {
            return [];
        }

        const headers = records[0].map(String);

        const rows = records
            .slice(1)
            .map((row: unknown[]) => row.map(value => String(value ?? "")));

        const title = `CSV File: ${file.name}`;

        const text = tableToText(
            headers,
            rows,
            title
        );

        return [
            {
                pageNumber: 1,
                title: file.name,
                text,
            },
        ];

    }

}