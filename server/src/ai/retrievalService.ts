import fs from 'fs';
import path from 'path';

export interface KnowledgeChunk {
  id: string;
  sourceFile: string;
  title: string;
  content: string;
  keywords: string[];
}

export class RetrievalService {
  private static chunks: KnowledgeChunk[] = [];
  private static isInitialized = false;

  /**
   * Initialize knowledge base by reading all markdown files in /knowledge/
   */
  public static init(): void {
    if (this.isInitialized) return;

    try {
      const candidatePaths = [
        path.resolve(process.cwd(), 'knowledge'),
        path.resolve(__dirname, '../../../knowledge'),
        path.resolve(__dirname, '../../knowledge'),
      ];

      let knowledgeDir = candidatePaths[0];
      for (const p of candidatePaths) {
        if (fs.existsSync(p)) {
          knowledgeDir = p;
          break;
        }
      }

      if (!fs.existsSync(knowledgeDir)) {
        console.warn('[RetrievalService] Knowledge base directory not found at:', knowledgeDir);
        this.isInitialized = true;
        return;
      }

      const files = fs.readdirSync(knowledgeDir).filter((f) => f.endsWith('.md'));
      this.chunks = [];

      for (const file of files) {
        const fullPath = path.join(knowledgeDir, file);
        const rawContent = fs.readFileSync(fullPath, 'utf-8');

        // Split by markdown headers (## or ###)
        const sections = rawContent.split(/\n(?=#{1,3}\s)/g);

        sections.forEach((section, idx) => {
          const trimmed = section.trim();
          if (trimmed.length < 15) return;

          const lines = trimmed.split('\n');
          const titleLine = lines[0].replace(/^#+\s*/, '').trim();
          const body = lines.slice(1).join('\n').trim();

          const words = trimmed
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter((w) => w.length > 2);

          this.chunks.push({
            id: `${file}#${idx}`,
            sourceFile: file,
            title: titleLine || file.replace('.md', ''),
            content: trimmed,
            keywords: Array.from(new Set(words)),
          });
        });
      }

      console.log(`[RetrievalService] Indexed ${this.chunks.length} knowledge chunks from ${files.length} documents.`);
      this.isInitialized = true;
    } catch (err: any) {
      console.warn('[RetrievalService.init] Warning indexing knowledge base:', err.message);
      this.isInitialized = true;
    }
  }

  /**
   * Search knowledge base for the most relevant document chunks
   */
  public static search(query: string, topK: number = 3): KnowledgeChunk[] {
    this.init();
    if (this.chunks.length === 0) return [];

    const queryTokens = query
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);

    if (queryTokens.length === 0) return this.chunks.slice(0, topK);

    const scored = this.chunks.map((chunk) => {
      let score = 0;
      const lowerTitle = chunk.title.toLowerCase();
      const lowerContent = chunk.content.toLowerCase();

      for (const token of queryTokens) {
        // Exact match in title
        if (lowerTitle.includes(token)) score += 5;
        // Exact match in keywords
        if (chunk.keywords.includes(token)) score += 2;
        // Match in body
        const regex = new RegExp(`\\b${token}\\b`, 'gi');
        const matches = lowerContent.match(regex);
        if (matches) score += Math.min(matches.length, 4);
      }

      return { chunk, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.filter((s) => s.score > 0).slice(0, topK).map((s) => s.chunk);
  }
}
