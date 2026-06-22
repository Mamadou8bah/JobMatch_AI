import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import type { ResumeParseResult } from '../ai-connection/ai-connection.service';

const SKILL_KEYWORDS = [
  'javascript',
  'typescript',
  'react',
  'nodejs',
  'node.js',
  'python',
  'java',
  'sql',
  'postgresql',
  'mongodb',
  'html',
  'css',
  'git',
  'docker',
  'kubernetes',
  'aws',
  'azure',
  'excel',
  'communication',
  'leadership',
  'project management',
  'agile',
  'marketing',
  'sales',
  'accounting',
  'customer service',
  'nursing',
  'teaching',
  'logistics',
  'driving',
];

export async function parseCvLocally(file: {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}): Promise<ResumeParseResult> {
  const rawText = await extractCvText(file);
  const emailMatch = rawText.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);

  return {
    name: null,
    email: emailMatch?.[0] ?? null,
    skills: extractSkillsFromText(rawText),
    education: [],
    experience: [],
    rawText: rawText || undefined,
    parsedWithAi: false,
  };
}

async function extractCvText(file: { buffer: Buffer; mimetype: string; originalname: string }): Promise<string> {
  const name = file.originalname.toLowerCase();

  if (file.mimetype === 'text/plain' || name.endsWith('.txt')) {
    return file.buffer.toString('utf8');
  }

  if (file.mimetype === 'application/pdf' || name.endsWith('.pdf')) {
    try {
      const parsed = await pdfParse(file.buffer);
      return parsed.text?.trim() ?? '';
    } catch {
      return '';
    }
  }

  if (
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx')
  ) {
    try {
      const parsed = await mammoth.extractRawText({ buffer: file.buffer });
      return parsed.value?.trim() ?? '';
    } catch {
      return '';
    }
  }

  return '';
}

function extractSkillsFromText(text: string): string[] {
  const normalized = text.toLowerCase();
  if (!normalized.trim()) {
    return [];
  }

  const found = SKILL_KEYWORDS.filter((skill) => normalized.includes(skill));
  return Array.from(new Set(found));
}
