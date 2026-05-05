import { NextRequest, NextResponse } from 'next/server';
import { generateId, detectSearchType } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    if (!query) return NextResponse.json({ error: 'No query' }, { status: 400 });

    const type = detectSearchType(query);
    const vtApiKey = process.env.VIRUSTOTAL_API_KEY;

    if (!vtApiKey) {
      return NextResponse.json({
        id: generateId(), scan_type: 'search', search_type: type, target: query,
        verdict: 'Clean', risk_score: 0,
        ai_explanation: `Search for "${query}" (detected as ${type}). Connect your VirusTotal API key for live results.`,
        ai_recommendation: 'Add your VirusTotal API key in .env.local for real scanning.',
        top_threats: [], created_at: new Date().toISOString(), demo: true,
      });
    }

    let endpoint = '';
    if (type === 'hash') endpoint = `https://www.virustotal.com/api/v3/files/${query}`;
    else if (type === 'domain') endpoint = `https://www.virustotal.com/api/v3/domains/${query}`;
    else if (type === 'ip') endpoint = `https://www.virustotal.com/api/v3/ip_addresses/${query}`;
    else return NextResponse.json({ error: 'Could not detect input type. Use a hash, domain, or IP.' }, { status: 400 });

    const res = await fetch(endpoint, { headers: { 'x-apikey': vtApiKey } });
    if (res.status === 429) return NextResponse.json({ error: 'Rate limit' }, { status: 429 });
    if (!res.ok) return NextResponse.json({ error: `Not found (${res.status})` }, { status: res.status });

    const data = await res.json();
    const attrs = data?.data?.attributes || {};
    const stats = attrs.last_analysis_stats || {};

    return NextResponse.json({
      id: generateId(), scan_type: 'search', search_type: type, target: query,
      verdict: (stats.malicious || 0) > 0 ? 'Malicious' : 'Clean',
      risk_score: Math.min(100, Math.round(((stats.malicious || 0) / Math.max(Object.keys(attrs.last_analysis_results || {}).length, 1)) * 100)),
      malicious_count: stats.malicious || 0, suspicious_count: stats.suspicious || 0,
      undetected_count: stats.undetected || 0, total_engines: Object.keys(attrs.last_analysis_results || {}).length,
      ai_explanation: `${type} "${query}" analyzed. ${stats.malicious || 0} detections found.`,
      top_threats: [], raw_data: attrs, created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
