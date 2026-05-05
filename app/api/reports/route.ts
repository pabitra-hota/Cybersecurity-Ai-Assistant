import { NextResponse } from 'next/server';

export async function POST() {
  // In production, this would save to Supabase and trigger AI analysis
  return NextResponse.json({
    success: true,
    message: 'Report submitted successfully. Our AI will analyze it shortly.',
    id: crypto.randomUUID(),
  });
}

export async function GET() {
  // Demo reports data
  return NextResponse.json({
    reports: [
      { id: '1', report_type: 'phishing_email', target: 'fake-bank@scam.com', severity: 'high', status: 'reviewed', created_at: new Date().toISOString() },
      { id: '2', report_type: 'suspicious_link', target: 'http://suspicious-site.xyz', severity: 'medium', status: 'pending', created_at: new Date().toISOString() },
    ],
  });
}
