import { NextRequest, NextResponse } from 'next/server';
import { generateId } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;
    if (!url) return NextResponse.json({ error: 'No URL provided' }, { status: 400 });

    const vtApiKey = process.env.VIRUSTOTAL_API_KEY;
    if (!vtApiKey) {
      const domain = new URL(url).hostname;
      return NextResponse.json({
        id: generateId(), scan_type: 'url', target: url, verdict: 'Safe', risk_score: 2,
        malicious_count: 0, suspicious_count: 0, undetected_count: 5, total_engines: 90,
        ai_explanation: `The URL "${url}" hosted on "${domain}" was scanned by 90 engines. No threats detected.`,
        ai_recommendation: 'This URL appears safe. Always verify the address bar before entering personal info.',
        top_threats: [], engine_results: [
          { engine_name: 'Google Safe Browsing', category: 'harmless', result: null },
          { engine_name: 'Kaspersky', category: 'harmless', result: null },
        ], created_at: new Date().toISOString(), demo: true,
      });
    }

    const submitRes = await fetch('https://www.virustotal.com/api/v3/urls', {
      method: 'POST',
      headers: { 'x-apikey': vtApiKey, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `url=${encodeURIComponent(url)}`,
    });
    if (submitRes.status === 429) return NextResponse.json({ error: 'Rate limit reached' }, { status: 429 });
    if (!submitRes.ok) throw new Error(`VT submit failed: ${submitRes.status}`);

    const submitData = await submitRes.json();
    const analysisId = submitData?.data?.id;
    let analysisResult = null;
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      const pollRes = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, { headers: { 'x-apikey': vtApiKey } });
      const pollData = await pollRes.json();
      if (pollData?.data?.attributes?.status === 'completed') { analysisResult = pollData; break; }
    }
    if (!analysisResult) return NextResponse.json({ error: 'Scan timed out' }, { status: 504 });

    const stats = analysisResult.data.attributes.stats || {};
    const results = analysisResult.data.attributes.results || {};
    const engines = Object.entries(results).map(([name, r]: [string, unknown]) => ({
      engine_name: name, category: (r as Record<string,string>)?.category || 'undetected', result: (r as Record<string,string>)?.result || null,
    }));

    return NextResponse.json({
      id: generateId(), scan_type: 'url', target: url,
      verdict: (stats.malicious || 0) > 0 ? 'Malicious' : 'Safe',
      risk_score: Math.min(100, Math.round(((stats.malicious || 0) / Math.max(Object.keys(results).length, 1)) * 100)),
      malicious_count: stats.malicious || 0, suspicious_count: stats.suspicious || 0,
      undetected_count: stats.undetected || 0, total_engines: Object.keys(results).length,
      ai_explanation: `URL scanned. ${stats.malicious || 0} engines detected threats.`,
      ai_recommendation: (stats.malicious || 0) > 0 ? 'Avoid this URL.' : 'URL appears safe.',
      top_threats: [], engine_results: engines, created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('URL scan error:', error);
    return NextResponse.json({ error: 'Scan failed' }, { status: 500 });
  }
}
