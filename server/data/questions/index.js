/**
 * Master Question Bank Aggregator & Validator
 * Aggregates all modular subject question collections, validates schema compliance and slug uniqueness.
 */

const javaOop = require('./javaOop');
const dbmsSql = require('./dbmsSql');
const operatingSystems = require('./operatingSystems');
const computerNetworks = require('./computerNetworks');
const dsa = require('./dsa');
const quantitativeAptitude = require('./quantitativeAptitude');
const logicalReasoning = require('./logicalReasoning');
const verbalAbility = require('./verbalAbility');
const webDevJs = require('./webDevJs');

const allDatasets = [
  ...javaOop,
  ...dbmsSql,
  ...operatingSystems,
  ...computerNetworks,
  ...dsa,
  ...quantitativeAptitude,
  ...logicalReasoning,
  ...verbalAbility,
  ...webDevJs,
];

// Validation & Integrity Verification
const validateQuestionBank = (questions) => {
  const seenSlugs = new Set();
  const seenTitles = new Map();
  const errors = [];

  questions.forEach((q, index) => {
    // 1. Slug checks
    if (!q.slug || typeof q.slug !== 'string') {
      errors.push(`Question #${index} is missing a valid 'slug' string.`);
    } else if (seenSlugs.has(q.slug)) {
      errors.push(`Duplicate slug detected: "${q.slug}" at question #${index}`);
    } else {
      seenSlugs.add(q.slug);
    }

    // 2. Title & category checks
    if (!q.title || !q.category || !q.difficulty || !q.description) {
      errors.push(`Question "${q.slug || index}" is missing basic required fields.`);
    }

    // 3. Duplicate title checks within same category
    const titleKey = `${q.category}:::${q.title.toLowerCase().trim()}`;
    if (seenTitles.has(titleKey)) {
      errors.push(
        `Duplicate question title in category "${q.category}": "${q.title}" (indexes ${seenTitles.get(titleKey)} and ${index})`
      );
    } else {
      seenTitles.set(titleKey, index);
    }

    // 4. MCQ checks
    if (q.type === 'mcq') {
      if (!Array.isArray(q.options) || q.options.length < 2) {
        errors.push(`MCQ "${q.slug}" must have at least 2 options.`);
      }
      if (
        typeof q.correctAnswerIndex !== 'number' ||
        q.correctAnswerIndex < 0 ||
        (q.options && q.correctAnswerIndex >= q.options.length)
      ) {
        errors.push(
          `MCQ "${q.slug}" has invalid correctAnswerIndex: ${q.correctAnswerIndex} (options length: ${q.options ? q.options.length : 0})`
        );
      }
    }
  });

  if (errors.length > 0) {
    throw new Error(`Question bank validation failed with ${errors.length} error(s):\n${errors.join('\n')}`);
  }

  return true;
};

validateQuestionBank(allDatasets);

// Compute verified category counts
const categoryBreakdown = {};
allDatasets.forEach((q) => {
  categoryBreakdown[q.category] = (categoryBreakdown[q.category] || 0) + 1;
});

module.exports = {
  allQuestions: allDatasets,
  categoryBreakdown,
  validateQuestionBank,
};
