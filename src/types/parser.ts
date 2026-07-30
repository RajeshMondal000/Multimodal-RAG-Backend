export interface ParsedPage {
    pageNumber: number;
    text: string;
}

export interface DocumentParser {
    parse(file: File): Promise<ParsedPage[]>;
}