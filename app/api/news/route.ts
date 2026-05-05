// ============================================================
// CyberShield AI — News API Route
// ============================================================

import { NextResponse } from 'next/server';
import { generateText, isAIConfigured } from '@/lib/ai-client';
import { fetchAllNews } from '@/lib/news-fetcher';
import { generateId } from '@/lib/utils';

// In-memory cache for demo purposes (replace with Supabase in production)
let newsCache: { data: unknown[]; timestamp: number } | null = null;
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

export async function GET() {
  try {
    // Check cache
    if (newsCache && Date.now() - newsCache.timestamp < CACHE_DURATION_MS) {
      return NextResponse.json({ news: newsCache.data, cached: true });
    }

    // Fetch raw news from RSS feeds
    const rawNews = await fetchAllNews(15);

    if (rawNews.length === 0) {
      // Return demo data if feeds are unreachable
      return NextResponse.json({ news: getDemoNews(), cached: false, demo: true });
    }

    // Try to analyze with AI
    if (isAIConfigured()) {
      try {
        const prompt = `You are a cybersecurity threat intelligence analyst. Analyze these news headlines and descriptions. For each one, return a JSON array. Each object must have:
- title: string (rewrite as clear, non-technical headline, max 80 chars)
- summary: string (2-3 sentence plain-English explanation of what happened and why it matters)
- threat_type: one of ['phishing', 'malware', 'ransomware', 'data_breach', 'scam', 'fraud', 'spam', 'zero_day', 'social_engineering', 'other']
- severity: integer 1-5 (1=informational, 5=critical)
- severity_label: one of ['Low', 'Medium', 'High', 'Critical', 'Informational']
- affected_targets: string[] (who is at risk: ['general_public', 'businesses', 'banks', 'healthcare', etc])
- prevention_tips: string[] (exactly 3 actionable tips in plain English)
- source_url: string (original article URL)
- published_at: string (ISO date from RSS)
Return ONLY valid JSON array, no markdown, no explanation.

Here are the articles:
${rawNews.map((n, i) => `${i + 1}. Title: ${n.title}\nDescription: ${n.description}\nURL: ${n.link}\nDate: ${n.pubDate}`).join('\n\n')}`;

        const text = await generateText(prompt, { maxTokens: 4000 });
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);
        const articles = parsed.map((a: Record<string, unknown>) => ({
          id: generateId(),
          ...a,
          ai_analyzed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        }));

        newsCache = { data: articles, timestamp: Date.now() };
        return NextResponse.json({ news: articles, cached: false });
      } catch (aiError) {
        console.error('AI analysis error:', aiError);
      }
    }

    // Fallback: return raw news without AI analysis
    const fallbackArticles = rawNews.map((item) => ({
      id: generateId(),
      title: item.title,
      summary: item.description,
      threat_type: 'other' as const,
      severity: 3,
      severity_label: 'Medium',
      affected_targets: ['general_public'],
      prevention_tips: [
        'Keep your software and antivirus up to date',
        'Be cautious of suspicious links and emails',
        'Enable two-factor authentication on all accounts',
      ],
      source_url: item.link,
      published_at: item.pubDate || new Date().toISOString(),
      ai_analyzed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }));

    newsCache = { data: fallbackArticles, timestamp: Date.now() };
    return NextResponse.json({ news: fallbackArticles, cached: false });
  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json({ news: getDemoNews(), error: 'Using demo data' }, { status: 200 });
  }
}

function getDemoNews() {
  return [
    {
      id: generateId(),
      title: 'Major Banking Trojan Targets Mobile Users Worldwide',
      summary: 'A sophisticated banking trojan has been discovered targeting mobile users across 30+ countries. The malware steals login credentials and financial data through fake overlay screens that appear over legitimate banking apps.',
      threat_type: 'malware',
      severity: 5,
      severity_label: 'Critical',
      affected_targets: ['general_public', 'banks', 'mobile_users'],
      prevention_tips: [
        'Only download apps from official app stores (Google Play, Apple App Store)',
        'Enable biometric authentication for your banking apps',
        'Report any suspicious overlay screens immediately to your bank',
      ],
      source_url: 'https://thehackernews.com',
      published_at: new Date(Date.now() - 3600000).toISOString(),
      ai_analyzed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: generateId(),
      title: 'New Phishing Campaign Impersonates Government Tax Agencies',
      summary: 'Cybercriminals are sending fake tax refund emails that appear to come from government agencies. The emails contain links to fake websites designed to steal personal and financial information.',
      threat_type: 'phishing',
      severity: 4,
      severity_label: 'High',
      affected_targets: ['general_public', 'taxpayers'],
      prevention_tips: [
        'Government agencies never ask for personal information via email',
        'Verify tax-related communications by visiting the official government website directly',
        'Report suspicious tax-related emails to your local cyber crime reporting center',
      ],
      source_url: 'https://www.bleepingcomputer.com',
      published_at: new Date(Date.now() - 7200000).toISOString(),
      ai_analyzed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: generateId(),
      title: 'Ransomware Attack Shuts Down Hospital Network in Three States',
      summary: 'A ransomware group has disrupted healthcare services across multiple hospitals, forcing them to divert patients and revert to paper records. The attackers are demanding millions in cryptocurrency.',
      threat_type: 'ransomware',
      severity: 5,
      severity_label: 'Critical',
      affected_targets: ['healthcare', 'hospitals', 'patients'],
      prevention_tips: [
        'Healthcare organizations should ensure offline backups of all critical data',
        'Implement network segmentation to limit ransomware spread',
        'Train all staff to recognize and report suspicious emails immediately',
      ],
      source_url: 'https://krebsonsecurity.com',
      published_at: new Date(Date.now() - 10800000).toISOString(),
      ai_analyzed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: generateId(),
      title: 'Social Media Scam Uses Deepfake Celebrity Videos to Steal Money',
      summary: 'Scammers are creating AI-generated deepfake videos of celebrities promoting fake investment schemes. Victims have lost thousands of dollars after being tricked by convincing fake endorsements.',
      threat_type: 'scam',
      severity: 4,
      severity_label: 'High',
      affected_targets: ['general_public', 'social_media_users', 'investors'],
      prevention_tips: [
        'Be skeptical of celebrity investment endorsements, especially on social media',
        'Verify any investment opportunity through official financial regulatory websites',
        'Never send money or crypto based on social media advertisements',
      ],
      source_url: 'https://www.bleepingcomputer.com',
      published_at: new Date(Date.now() - 14400000).toISOString(),
      ai_analyzed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: generateId(),
      title: 'Critical Zero-Day Vulnerability Found in Popular Web Browser',
      summary: 'Security researchers have discovered a zero-day vulnerability being actively exploited in the wild. The flaw allows attackers to execute arbitrary code simply by getting users to visit a malicious website.',
      threat_type: 'zero_day',
      severity: 5,
      severity_label: 'Critical',
      affected_targets: ['general_public', 'businesses', 'web_users'],
      prevention_tips: [
        'Update your web browser immediately to the latest version',
        'Enable automatic updates for all software on your devices',
        'Consider using a separate browser for sensitive activities like banking',
      ],
      source_url: 'https://thehackernews.com',
      published_at: new Date(Date.now() - 18000000).toISOString(),
      ai_analyzed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: generateId(),
      title: 'Major E-commerce Platform Suffers Data Breach Affecting Millions',
      summary: 'A popular online shopping platform has confirmed a data breach exposing customer names, email addresses, and encrypted passwords. The company is urging all users to change their passwords immediately.',
      threat_type: 'data_breach',
      severity: 4,
      severity_label: 'High',
      affected_targets: ['general_public', 'online_shoppers', 'businesses'],
      prevention_tips: [
        'Change your password on the affected platform and any accounts using the same password',
        'Enable two-factor authentication on all your online accounts',
        'Monitor your bank and credit card statements for unauthorized charges',
      ],
      source_url: 'https://www.bleepingcomputer.com',
      published_at: new Date(Date.now() - 21600000).toISOString(),
      ai_analyzed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: generateId(),
      title: 'SMS Fraud Campaign Targets Online Delivery Service Customers',
      summary: 'A widespread SMS phishing campaign is sending fake delivery notifications with malicious links. Clicking these links installs spyware that can access contacts, photos, and banking apps.',
      threat_type: 'fraud',
      severity: 3,
      severity_label: 'Medium',
      affected_targets: ['general_public', 'mobile_users', 'online_shoppers'],
      prevention_tips: [
        'Never click links in unexpected delivery notification texts',
        'Track your packages only through the official carrier website or app',
        'Install a reputable mobile security app that can detect malicious links',
      ],
      source_url: 'https://krebsonsecurity.com',
      published_at: new Date(Date.now() - 25200000).toISOString(),
      ai_analyzed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: generateId(),
      title: 'New Social Engineering Attack Tricks Employees via Fake IT Support',
      summary: 'Attackers are calling employees pretending to be from their IT department, asking them to install remote access software. Once installed, the attackers gain full control of corporate systems.',
      threat_type: 'social_engineering',
      severity: 3,
      severity_label: 'Medium',
      affected_targets: ['businesses', 'employees', 'corporate_networks'],
      prevention_tips: [
        'Verify any IT support requests by calling your IT department directly',
        'Never install software at the request of someone who called you unsolicited',
        'Report any suspicious calls to your company security team immediately',
      ],
      source_url: 'https://thehackernews.com',
      published_at: new Date(Date.now() - 28800000).toISOString(),
      ai_analyzed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
  ];
}
