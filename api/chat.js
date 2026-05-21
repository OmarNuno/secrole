// In-memory rate limit store
// Note: resets on each cold start — for production use Vercel KV or Upstash Redis
const rateLimitStore = new Map();

const RATE_LIMIT = {
  maxRequests: 10,      // max requests per IP
  windowMs: 60 * 60 * 1000, // per hour
};

function getRateLimitInfo(ip) {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now - record.windowStart > RATE_LIMIT.windowMs) {
    const newRecord = { count: 1, windowStart: now };
    rateLimitStore.set(ip, newRecord);
    return { allowed: true, remaining: RATE_LIMIT.maxRequests - 1 };
  }

  if (record.count >= RATE_LIMIT.maxRequests) {
    const resetIn = Math.ceil((RATE_LIMIT.windowMs - (now - record.windowStart)) / 60000);
    return { allowed: false, remaining: 0, resetIn };
  }

  record.count += 1;
  return { allowed: true, remaining: RATE_LIMIT.maxRequests - record.count };
}

function getClientIP(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = getClientIP(req);
  const userAgent = req.headers["user-agent"] || "unknown";
  const timestamp = new Date().toISOString();
  const feature = req.body?.messages?.[0]?.content?.length > 500 ? "overlap-analyzer" : "ai-advisor";

  // Rate limiting
  const rateLimit = getRateLimitInfo(ip);

  if (!rateLimit.allowed) {
    console.log(JSON.stringify({
      event: "rate_limited",
      ip,
      feature,
      timestamp,
      resetIn: `${rateLimit.resetIn} minutes`,
    }));
    return res.status(429).json({
      error: "Rate limit exceeded",
      message: `You've reached the limit of ${RATE_LIMIT.maxRequests} requests per hour. Please try again in ${rateLimit.resetIn} minutes.`,
      resetIn: rateLimit.resetIn,
    });
  }

  // Log the request
  console.log(JSON.stringify({
    event: "api_request",
    ip,
    feature,
    timestamp,
    userAgent: userAgent.substring(0, 80),
    remainingRequests: rateLimit.remaining,
  }));

  const apiKey = process.env.VITE_ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.error(JSON.stringify({ event: "error", type: "missing_api_key", timestamp }));
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(JSON.stringify({
        event: "anthropic_error",
        status: response.status,
        error: data?.error?.message || "Unknown error",
        timestamp,
        ip,
      }));
      return res.status(response.status).json(data);
    }

    // Log successful completion with token usage and cost
    const inputTokens = data.usage?.input_tokens || 0;
    const outputTokens = data.usage?.output_tokens || 0;
    const estimatedCost = ((inputTokens / 1000000) * 3) + ((outputTokens / 1000000) * 15);

    console.log(JSON.stringify({
      event: "api_success",
      ip,
      feature,
      timestamp,
      tokens: { input: inputTokens, output: outputTokens },
      estimatedCostUSD: estimatedCost.toFixed(6),
    }));

    return res.status(200).json(data);

  } catch (error) {
    console.error(JSON.stringify({
      event: "proxy_error",
      error: error.message,
      timestamp,
      ip,
    }));
    return res.status(500).json({ error: "Proxy error", details: error.message });
  }
}
