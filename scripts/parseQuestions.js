#!/usr/bin/env node
/**
 * data/source/questions.txt -> src/data/questions.json (+ data/parser-errors.json)
 *
 * Формат джерела (визначено за реальним файлом):
 *   ТЕМА N. Назва теми (може переноситись на наступний рядок)
 *   N.Текст питання (може займати кілька рядків)
 *   *правильна відповідь (рядок може переноситись; кілька рядків з * = кілька правильних)
 * Хибних варіантів у джерелі НЕМАЄ - вони не вигадуються.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'data/source/questions.txt');
const OUT = path.join(ROOT, 'src/data/questions.json');
const ERR = path.join(ROOT, 'data/parser-errors.json');

const raw = fs.readFileSync(SRC, 'utf8').replace(/^﻿/, '').replace(/\r\n?/g, '\n');
const lines = raw.split('\n');

const TOPIC_RE = /^\s*тема\s*(\d+)\s*\.?\s*(.*)$/i;
const Q_RE = /^\s*(\d{1,4})\s*\.\s*(\S.*)$/;
const JUNK_RE = /^\s*(ff|\f)?\s*$/i;

const topics = [];
const errors = [];
let topic = null;
let q = null; // поточне питання
let lastNum = 0;
let inTopicTitle = false;
let sourceCount = 0;

const clean = (s) => s.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '').replace(/\s+/g, ' ').trim();

function closeQuestion() {
  if (!q) return;
  q.question = clean(q.qLines.join(' '));
  q.answers = q.aLines.map((a) => clean(a.join(' '))).filter(Boolean);
  const problems = [];
  if (!q.question) problems.push('Empty question text');
  if (q.answers.length === 0) problems.push('Could not determine correct answer');
  if (problems.length) {
    errors.push({
      sourceQuestion: `${q.topicId} #${q.num}: ${q.question} ${q.aLines.map((a) => '*' + a.join(' ')).join(' ')}`.trim(),
      topic: q.topicName,
      number: q.num,
      line: q.line,
      reason: problems.join('; '),
    });
  } else {
    q.topic.questions.push({
      id: `${q.topicId}-${String(q.topic.questions.length + 1).padStart(3, '0')}`,
      sourceNumber: q.num,
      question: q.question,
      options: null,
      correctAnswer: null,
      answers: q.answers,
      explanation: null,
    });
  }
  q = null;
}

function startQuestion(num, text, lineNo) {
  closeQuestion();
  sourceCount++;
  q = { num, line: lineNo, topic, topicId: topic.id, topicName: topic.name, qLines: [text], aLines: [] };
  lastNum = num;
}

lines.forEach((line, i) => {
  const lineNo = i + 1;
  const t = TOPIC_RE.exec(line);
  if (t && !line.trim().startsWith('*')) {
    closeQuestion();
    topic = { id: `topic-${t[1]}`, name: clean(t[2]), questions: [] };
    topics.push(topic);
    lastNum = 0;
    inTopicTitle = true;
    return;
  }
  if (!topic) return; // заголовок файлу до першої теми

  if (JUNK_RE.test(line)) {
    inTopicTitle = false; // порожній рядок завершує назву теми; у питаннях ігнорується
    return;
  }

  if (line.trim().startsWith('*')) {
    inTopicTitle = false;
    if (!q) {
      errors.push({ sourceQuestion: line.trim(), topic: topic.name, line: lineNo, reason: 'Answer line without a question' });
      return;
    }
    let body = line.trim().slice(1);
    // Склейка: "*відповідь164.Наступне питання" - розділяємо лише якщо номер = попередній + 1
    const glued =
      /^(.*?)\x02\s*(\d{1,4})\s*\.\s*(\S.*)$/.exec(body) ||
      new RegExp(`^(.*?\\S)(${lastNum + 1})\\s*\\.\\s*(\\S.*)$`).exec(body);
    if (glued) {
      q.aLines.push([glued[1]]);
      startQuestion(Number(glued[2]), glued[3], lineNo);
      errors.push({ sourceQuestion: line.trim(), topic: topic.name, line: lineNo, number: Number(glued[2]), severity: 'warning', reason: 'Answer glued to next question number; split automatically - verify' });
      return;
    }
    q.aLines.push([body]);
    return;
  }

  const m = Q_RE.exec(line);
  if (inTopicTitle && m && Number(m[1]) <= 2) inTopicTitle = false; // перше питання теми
  // Нове питання: номер має бути «розумним» (поруч з попереднім), щоб не плутати з рядками типу "2. Назва" всередині тексту
  if (m && !inTopicTitle) {
    const n = Number(m[1]);
    const plausible = !q || q.aLines.length > 0; // нове питання починається лише після відповіді
    if (plausible && n >= 1) {
      startQuestion(n, m[2], lineNo);
      return;
    }
  }

  if (inTopicTitle) {
    topic.name = clean(topic.name + ' ' + line);
    return;
  }
  if (!q) return;
  // продовження: або тексту питання, або останньої відповіді
  if (q.aLines.length) q.aLines[q.aLines.length - 1].push(line);
  else q.qLines.push(line);
});
closeQuestion();

// Перевірка послідовності нумерації (повідомляємо, нічого не видаляємо)
topics.forEach((tp) => {
  let prev = 0;
  tp.questions.forEach((x) => {
    if (x.sourceNumber !== prev + 1) {
      errors.push({
        sourceQuestion: `${tp.name} #${x.sourceNumber}: ${x.question}`,
        topic: tp.name,
        id: x.id,
        severity: 'warning',
        reason: `Numbering gap/duplicate: expected ${prev + 1}, got ${x.sourceNumber}`,
      });
    }
    prev = x.sourceNumber;
  });
});

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ topics }, null, 2), 'utf8');
fs.writeFileSync(ERR, JSON.stringify(errors, null, 2), 'utf8');

const parsed = topics.reduce((s, x) => s + x.questions.length, 0);
const failed = errors.filter((e) => e.severity !== 'warning').length;
const warnings = errors.filter((e) => e.severity === 'warning').length;
const multi = topics.reduce((s, x) => s + x.questions.filter((y) => y.answers.length > 1).length, 0);

console.log(`Total source questions: ${sourceCount}`);
console.log(`Successfully parsed:    ${parsed}`);
console.log(`Failed (errors):        ${failed}`);
console.log(`Warnings (to verify):   ${warnings}`);
console.log(`With several correct answers: ${multi}`);
console.log('\nTopics:');
topics.forEach((x) => console.log(`- ${x.name}: ${x.questions.length}`));
console.log(`\nErrors/warnings written to ${path.relative(ROOT, ERR)}`);
