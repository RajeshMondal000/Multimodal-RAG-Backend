import {
    DocumentParser,
    ParsedPage,
} from "../../types/parser";

export class TxtParser implements DocumentParser {

    async parse(file: File): Promise<ParsedPage[]> {

        const text = await file.text();

        return [
            {
                pageNumber: 1,
                title: file.name,
                text: text.trim(),
            },
        ];

    }

}