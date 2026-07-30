import {
    DocumentParser,
    ParsedPage,
} from "../../types/parser";

export class MarkdownParser implements DocumentParser {

    async parse(file: File): Promise<ParsedPage[]> {

        const markdown = await file.text();

        return [
            {
                pageNumber: 1,
                title: file.name,
                text: `Markdown Document: ${file.name}\n\n${markdown.trim()}`,
            },
        ];

    }

}