import { Type } from "@google/genai";

export const FlashcardSchema = {
  type: Type.OBJECT,
  properties: {
    flashcards: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          answer: { type: Type.STRING },
          difficulty: { 
            type: Type.STRING, 
            enum: ["easy", "medium", "hard"] 
          },
        },
        required: ["question", "answer"],
      },
    },
  },
  required: ["flashcards"],
};

export const QuizSchema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          option_a: { type: Type.STRING },
          option_b: { type: Type.STRING },
          option_c: { type: Type.STRING },
          option_d: { type: Type.STRING },
          correct_option: { 
            type: Type.STRING, 
            enum: ["A", "B", "C", "D"] 
          },
          explanation: { type: Type.STRING },
        },
        required: [
          "question",
          "option_a",
          "option_b",
          "option_c",
          "option_d",
          "correct_option"
        ],
      },
    },
  },
  required: ["questions"],
};

export const SummarySchema = {
  type: Type.OBJECT,
  properties: {
    summary: { 
      type: Type.STRING
    },
  },
  required: ["summary"],
};

export const AssignmentSchema = {
  type: Type.OBJECT,
  properties: {
    assignments: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          instructions: { type: Type.STRING },
          due_date: { type: Type.STRING },
        },
        required: ["title", "instructions"],
      },
    },
  },
  required: ["assignments"],
};

export const AssignmentFeedbackSchema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.NUMBER },
    feedback: { type: Type.STRING },
    suggestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: ["score", "feedback"],
};