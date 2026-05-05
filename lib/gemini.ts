// ============================================================
// CyberShield AI — Google Gemini Client
// ============================================================

import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';

export const genAI = new GoogleGenerativeAI(apiKey);

// ─── Available Gemini Models ────────────────────────────────
// Change ACTIVE_MODEL below to switch which model the app uses
// ─────────────────────────────────────────────────────────────

export const GEMINI_MODELS = {
  // ── Gemini 2.5 (Latest & Most Capable) ──
  'gemini-2.5-pro':          { name: 'Gemini 2.5 Pro',            tier: 'premium',  description: 'Most capable model, best for complex reasoning & analysis' },
  'gemini-2.5-flash':        { name: 'Gemini 2.5 Flash',          tier: 'free',     description: 'Fast & smart, great balance of speed and quality' },
  'gemini-2.5-flash-lite':   { name: 'Gemini 2.5 Flash Lite',     tier: 'free',     description: 'Lightweight, fastest responses, cost-efficient' },

  // ── Gemini 2.0 ──
  'gemini-2.0-flash':        { name: 'Gemini 2.0 Flash',          tier: 'free',     description: 'Fast multimodal model, good for most tasks' },
  'gemini-2.0-flash-lite':   { name: 'Gemini 2.0 Flash Lite',     tier: 'free',     description: 'Lightweight version, quick responses' },

  // ── Gemini 1.5 ──
  'gemini-1.5-pro':          { name: 'Gemini 1.5 Pro',            tier: 'free',     description: 'Large context window (1M tokens), deep analysis' },
  'gemini-1.5-flash':        { name: 'Gemini 1.5 Flash',          tier: 'free',     description: 'Fast and versatile, good all-rounder' },
  'gemini-1.5-flash-8b':     { name: 'Gemini 1.5 Flash 8B',       tier: 'free',     description: 'Smallest model, ultra-fast, lowest cost' },
} as const;

// ─── Active Model Selection ────────────────────────────────
// Change this to switch models across the entire app
// Uses env variable if set, otherwise defaults to gemini-2.0-flash
// ─────────────────────────────────────────────────────────────
export const ACTIVE_MODEL = (process.env.GEMINI_MODEL || 'gemini-2.0-flash') as keyof typeof GEMINI_MODELS;

export function getModel(modelOverride?: keyof typeof GEMINI_MODELS) {
  const modelId = modelOverride || ACTIVE_MODEL;
  return genAI.getGenerativeModel({ model: modelId });
}

// Helper: get model info
export function getModelInfo(modelId?: keyof typeof GEMINI_MODELS) {
  const id = modelId || ACTIVE_MODEL;
  return { id, ...GEMINI_MODELS[id] };
}

// Helper: list all available models
export function listModels() {
  return Object.entries(GEMINI_MODELS).map(([id, info]) => ({ id, ...info }));
}
