// ============================================================
// CyberShield AI — File Scan API Route
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { generateText, isAIConfigured } from '@/lib/ai-client';
import { generateId } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (32MB max)
    const maxSize = (parseInt(process.env.MAX_FILE_SCAN_MB || '32')) * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 32MB limit' }, { status: 400 });
    }

    const vtApiKey = process.env.VIRUSTOTAL_API_KEY;

    if (!vtApiKey) {
      // Return demo result if no API key
      return NextResponse.json(getDemoFileScanResult(file.name, file.size));
    }

    // Upload to VirusTotal
    const vtFormData = new FormData();
    vtFormData.append('file', file);

    const uploadRes = await fetch('https://www.virustotal.com/api/v3/files', {
      method: 'POST',
      headers: { 'x-apikey': vtApiKey },
      body: vtFormData,
    });

    if (uploadRes.status === 429) {
      return NextResponse.json({
        error: 'VirusTotal rate limit reached. Please wait and try again.',
      }, { status: 429 });
    }

    if (!uploadRes.ok) {
      throw new Error(`VirusTotal upload failed: ${uploadRes.status}`);
    }

    const uploadData = await uploadRes.json();
    const analysisId = uploadData?.data?.id;

    // Poll for results
    let analysisResult = null;
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      const pollRes = await fetch(
        `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
        { headers: { 'x-apikey': vtApiKey } }
      );
      const pollData = await pollRes.json();
      if (pollData?.data?.attributes?.status === 'completed') {
        analysisResult = pollData;
        break;
      }
    }

    if (!analysisResult) {
      return NextResponse.json({ error: 'Scan timed out' }, { status: 504 });
    }

    // Extract scan stats
    const stats = analysisResult.data.attributes.stats || {};
    const engineResults = analysisResult.data.attributes.results || {};

    const scanData = {
      malicious: stats.malicious || 0,
      suspicious: stats.suspicious || 0,
      undetected: stats.undetected || 0,
      harmless: stats.harmless || 0,
      total: Object.keys(engineResults).length,
      engines: Object.entries(engineResults).map(([name, result]: [string, unknown]) => ({
        engine_name: name,
        category: (result as Record<string, string>)?.category || 'undetected',
        result: (result as Record<string, string>)?.result || null,
      })),
    };

    // AI Analysis
    let aiAnalysis = {
      verdict: scanData.malicious > 0 ? 'Malicious' : 'Clean',
      risk_score: Math.min(100, Math.round((scanData.malicious / Math.max(scanData.total, 1)) * 100)),
      plain_explanation: 'Analysis completed.',
      top_threats: [] as string[],
      recommendation: 'Review the scan results.',
    };

    if (isAIConfigured()) {
      try {
        const aiPrompt = `You are a malware analyst. A file was scanned by VirusTotal.
${scanData.malicious} engines flagged it as malicious out of ${scanData.total} total engines.
File name: ${file.name}, Size: ${file.size} bytes.

Provide:
1. verdict: 'Clean' | 'Suspicious' | 'Malicious' | 'Unknown'
2. risk_score: 0-100
3. plain_explanation: 2-3 sentences what this file likely is/does
4. top_threats: string[] (names of malware if detected)
5. recommendation: what user should do
Return only JSON, no markdown fences.`;

        const text = await generateText(aiPrompt, { maxTokens: 1000 });
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        aiAnalysis = JSON.parse(cleaned);
      } catch (aiErr) {
        console.error('AI analysis error:', aiErr);
      }
    }

    return NextResponse.json({
      id: generateId(),
      scan_type: 'file',
      target: file.name,
      verdict: aiAnalysis.verdict,
      risk_score: aiAnalysis.risk_score,
      malicious_count: scanData.malicious,
      suspicious_count: scanData.suspicious,
      undetected_count: scanData.undetected,
      total_engines: scanData.total,
      ai_explanation: aiAnalysis.plain_explanation,
      ai_recommendation: aiAnalysis.recommendation,
      top_threats: aiAnalysis.top_threats,
      engine_results: scanData.engines,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('File scan error:', error);
    return NextResponse.json(
      { error: 'Scan failed. Please try again.' },
      { status: 500 }
    );
  }
}

function getDemoFileScanResult(fileName: string, fileSize: number) {
  return {
    id: generateId(),
    scan_type: 'file',
    target: fileName,
    verdict: 'Clean',
    risk_score: 5,
    malicious_count: 0,
    suspicious_count: 0,
    undetected_count: 8,
    total_engines: 72,
    ai_explanation: `The file "${fileName}" (${(fileSize / 1024).toFixed(1)} KB) has been scanned by 72 antivirus engines. No engines detected any threats. This file appears to be safe for use.`,
    ai_recommendation: 'This file appears clean. You can safely open and use it. However, always be cautious with files from unknown sources.',
    top_threats: [],
    engine_results: [
      { engine_name: 'CrowdStrike', category: 'harmless', result: null },
      { engine_name: 'Kaspersky', category: 'undetected', result: null },
      { engine_name: 'Malwarebytes', category: 'harmless', result: null },
      { engine_name: 'Norton', category: 'harmless', result: null },
      { engine_name: 'Bitdefender', category: 'undetected', result: null },
    ],
    created_at: new Date().toISOString(),
    demo: true,
  };
}
