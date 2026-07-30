import { convert } from "html-to-text";

import {
    DocumentParser,
    ParsedPage,
} from "../../types/parser";

export class HtmlParser implements DocumentParser {

    async parse(file: File): Promise<ParsedPage[]> {

        const html = await file.text();

        const text = convert(html, {
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
                title: file.name,
                text: `HTML Document: ${file.name}\n\n${text.trim()}`,
            },
        ];

    }

}