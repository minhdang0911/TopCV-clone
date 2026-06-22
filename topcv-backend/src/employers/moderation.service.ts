import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

// Từ tiếng Việt: match NGUYÊN DẤU (lowercase) — vì strip dấu làm sai nghĩa hoàn toàn
// VD: cặc ≠ các, lồn ≠ lòn, đĩ ≠ đi
const VN_WORDS_EXACT = [
  'đụ', 'đéo', 'đĩ', 'lồn', 'cặc', 'buồi', 'đít', 'địt',
  'óc chó', 'khốn nạn', 'mẹ kiếp', 'đồ chó', 'súc vật',
  'thằng điên', 'con điên', 'thằng ngu', 'con ngu', 'đồ ngu',
];

// Code/tiếng Anh: match sau khi đã strip dấu + lowercase
const ASCII_WORDS = [
  'fuck', 'shit', 'bitch', 'asshole', 'bastard',
  'đmm', 'vcl', 'clm', 'đkm', 'dkm', 'dmm',
];

function buildWordBoundaryRegex(word: string): RegExp {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[\\s,.:;!?])${escaped}([\\s,.:;!?]|$)`, 'i');
}

const VN_REGEXES = VN_WORDS_EXACT.map((w) => ({
  word: w,
  re: buildWordBoundaryRegex(w),
}));

const normalizeAscii = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const ASCII_REGEXES = ASCII_WORDS.map((w) => ({
  word: w,
  re: new RegExp(`(^|\\s)${w}(\\s|$)`, 'i'),
}));

function containsBadWord(text: string): string | null {
  const lower = text.toLowerCase();
  for (const { word, re } of VN_REGEXES) {
    if (re.test(lower)) return word;
  }
  const norm = normalizeAscii(text);
  for (const { word, re } of ASCII_REGEXES) {
    if (re.test(norm)) return word;
  }
  return null;
}

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);
  private openai: OpenAI | null = null;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
  }

  async moderateReview(fields: {
    title?: string;
    liked?: string;
    improvement?: string;
    overtimeReason?: string;
  }): Promise<{ approved: boolean; rejectReason?: string }> {
    const combined = [fields.title, fields.liked, fields.improvement, fields.overtimeReason]
      .filter(Boolean)
      .join(' ');

    const hit = containsBadWord(combined);
    if (hit) {
      this.logger.warn(`Bad word detected: "${hit}"`);
      return { approved: false, rejectReason: 'Nội dung chứa từ ngữ không phù hợp.' };
    }

    if (this.openai) {
      try {
        const result = await this.openai.moderations.create({
          model: 'omni-moderation-latest',
          input: combined,
        });
        const flagged = result.results[0]?.flagged;
        if (flagged) {
          const cats = result.results[0].categories as unknown as Record<string, boolean>;
          const violated = Object.entries(cats)
            .filter(([, v]) => v)
            .map(([k]) => k)
            .join(', ');
          this.logger.warn(`OpenAI flagged: ${violated}`);
          return { approved: false, rejectReason: 'Nội dung vi phạm tiêu chuẩn cộng đồng.' };
        }
      } catch (err) {
        this.logger.error('OpenAI moderation error, auto-approve', err);
      }
    }

    return { approved: true };
  }
}
