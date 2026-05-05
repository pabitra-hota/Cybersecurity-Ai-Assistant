import { NextResponse } from 'next/server';

export async function GET() {
  // Demo analytics data - in production this would fetch from Supabase
  // and analyze with Claude AI
  return NextResponse.json({
    security_score: 72,
    score_breakdown: { phishing: 85, malware: 68, browsing: 74, awareness: 61 },
    threat_distribution: [
      { threat_type: 'phishing', count: 35, percentage: 35 },
      { threat_type: 'malware', count: 25, percentage: 25 },
      { threat_type: 'scam', count: 20, percentage: 20 },
      { threat_type: 'data_breach', count: 12, percentage: 12 },
      { threat_type: 'other', count: 8, percentage: 8 },
    ],
    top_risks: ['High exposure to phishing attacks', 'Outdated browser detected', 'Weak password patterns'],
    trend: 'improving',
  });
}
