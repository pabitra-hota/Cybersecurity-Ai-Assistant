// ============================================================
// CyberShield AI — VirusTotal API v3 Client
// ============================================================

const VT_BASE_URL = 'https://www.virustotal.com/api/v3';

class RateLimitError extends Error {
  constructor() {
    super('VirusTotal rate limit exceeded. Free tier allows 4 requests/minute.');
    this.name = 'RateLimitError';
  }
}

class InvalidKeyError extends Error {
  constructor() {
    super('Invalid VirusTotal API key.');
    this.name = 'InvalidKeyError';
  }
}

class ScanTimeoutError extends Error {
  constructor() {
    super('Scan analysis timed out after maximum polling attempts.');
    this.name = 'ScanTimeoutError';
  }
}

function getHeaders(): HeadersInit {
  return {
    'x-apikey': process.env.VIRUSTOTAL_API_KEY || '',
    'Accept': 'application/json',
  };
}

async function handleResponse(response: Response) {
  if (response.status === 429) throw new RateLimitError();
  if (response.status === 401 || response.status === 403) throw new InvalidKeyError();
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`VirusTotal API error (${response.status}): ${errorText}`);
  }
  return response.json();
}

async function pollAnalysis(analysisId: string, maxAttempts = 60, delayMs = 3000) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(`${VT_BASE_URL}/analyses/${analysisId}`, {
      headers: getHeaders(),
    });

    const data = await handleResponse(response);
    const status = data?.data?.attributes?.status;

    if (status === 'completed') return data;
    if (status === 'failed') throw new Error('VirusTotal analysis failed');

    // Wait with slight exponential backoff, capped at 10s
    const wait = Math.min(delayMs * Math.pow(1.1, attempt), 10000);
    await new Promise((r) => setTimeout(r, wait));
  }
  throw new ScanTimeoutError();
}

export const virustotal = {
  /**
   * Scan a file — POST /files then poll for result
   */
  async scanFile(fileBuffer: Buffer, fileName: string) {
    const formData = new FormData();
    // Convert Buffer → Uint8Array to satisfy TypeScript's BlobPart type constraint
    const blob = new Blob([new Uint8Array(fileBuffer)]);
    formData.append('file', blob, fileName);

    const uploadRes = await fetch(`${VT_BASE_URL}/files`, {
      method: 'POST',
      headers: { 'x-apikey': process.env.VIRUSTOTAL_API_KEY || '' },
      body: formData,
    });

    const uploadData = await handleResponse(uploadRes);
    const analysisId = uploadData?.data?.id;
    if (!analysisId) throw new Error('No analysis ID returned from VirusTotal');

    // Poll until complete
    const analysis = await pollAnalysis(analysisId);
    const sha256 = analysis?.meta?.file_info?.sha256 || analysis?.data?.attributes?.results?.sha256;

    // Fetch full file report
    if (sha256) {
      const reportRes = await fetch(`${VT_BASE_URL}/files/${sha256}`, {
        headers: getHeaders(),
      });
      return handleResponse(reportRes);
    }

    return analysis;
  },

  /**
   * Scan a URL — POST /urls then poll for result
   */
  async scanUrl(url: string) {
    const formData = new URLSearchParams();
    formData.append('url', url);

    const submitRes = await fetch(`${VT_BASE_URL}/urls`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const submitData = await handleResponse(submitRes);
    const analysisId = submitData?.data?.id;
    if (!analysisId) throw new Error('No analysis ID returned from VirusTotal');

    // Poll until complete
    await pollAnalysis(analysisId);

    // Fetch full URL report
    const urlId = btoa(url).replace(/=/g, '');
    const reportRes = await fetch(`${VT_BASE_URL}/urls/${urlId}`, {
      headers: getHeaders(),
    });
    return handleResponse(reportRes);
  },

  /**
   * Search for a file hash
   */
  async searchHash(hash: string) {
    const res = await fetch(`${VT_BASE_URL}/files/${hash}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  /**
   * Search for a domain
   */
  async searchDomain(domain: string) {
    const res = await fetch(`${VT_BASE_URL}/domains/${domain}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  /**
   * Search for an IP address
   */
  async searchIP(ip: string) {
    const res = await fetch(`${VT_BASE_URL}/ip_addresses/${ip}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};

export { RateLimitError, InvalidKeyError, ScanTimeoutError };
