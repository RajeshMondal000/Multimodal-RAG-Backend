import {
    DocumentParser,
    ParsedPage,
} from "../../types/parser";

import { GeminiService } from "../GeminiService";

export class ImageParser implements DocumentParser {

    constructor(
        private gemini: GeminiService
    ) {}

    async parse(file: File): Promise<ParsedPage[]> {

        const text = await this.gemini.analyzeImage(file);

        return [
            {
                pageNumber: 1,
                text,
            },
        ];
    }

}