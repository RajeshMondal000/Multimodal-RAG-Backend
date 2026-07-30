import { extractText } from "unpdf";

import {
    DocumentParser,
    ParsedPage,
} from "../../types/parser";

export class PdfParser implements DocumentParser {

    async parse(file: File): Promise<ParsedPage[]> {

        const buffer = await file.arrayBuffer();

        const result = await extractText(
            new Uint8Array(buffer)
        );

        return result.text.map((pageText, index) => ({
            pageNumber: index + 1,
            text: pageText.trim(),
        }));
    }
}