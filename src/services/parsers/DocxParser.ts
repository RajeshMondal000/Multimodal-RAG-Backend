import mammoth from "mammoth";
import { convert } from "html-to-text";

import {
    DocumentParser,
    ParsedPage,
} from "../../types/parser";

export class DocxParser implements DocumentParser {

    async parse(file: File): Promise<ParsedPage[]> {

        const buffer = await file.arrayBuffer();

        const result = await mammoth.convertToHtml({
            arrayBuffer: buffer,
        });

        const text = convert(result.value, {
            wordwrap: false,

            selectors: [
                {
                    selector: "a",
                    options: {
                        ignoreHref: true,
                    },
                },
            ],
        });

        return [
            {
                pageNumber: 1,
                text: text.trim(),
            },
        ];
    }

}