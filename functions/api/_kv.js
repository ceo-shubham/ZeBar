export async function getKV(env, key, asJson = true) {
  // 1. Try native worker binding (provided directly by Cloudflare Pages)
  try {
    if (env && env.ZEBAR_KV && typeof env.ZEBAR_KV.get === 'function') {
      const val = asJson ? await env.ZEBAR_KV.get(key, { type: 'json' }) : await env.ZEBAR_KV.get(key);
      if (val !== null && val !== undefined) return val;
    }
  } catch (err) {
    console.error('Native KV get error:', err);
  }

  // 2. Fallback to Cloudflare KV REST API if env variables are provided
  const accountId = env?.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = env?.CLOUDFLARE_API_TOKEN;
  const kvId = env?.ZEBAR_KV_ID || '8e44e8402535466aa7cb6a85a8bd1913';

  if (accountId && apiToken) {
    try {
      const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${kvId}/values/${encodeURIComponent(key)}`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${apiToken}` }
      });
      if (res.status === 200) {
        return asJson ? await res.json() : await res.text();
      }
    } catch (err) {
      console.error('REST KV get error:', err);
    }
  }

  return null;
}

export async function putKV(env, key, value) {
  const str = typeof value === 'string' ? value : JSON.stringify(value);

  // 1. Try native worker binding (provided directly by Cloudflare Pages)
  try {
    if (env && env.ZEBAR_KV && typeof env.ZEBAR_KV.put === 'function') {
      await env.ZEBAR_KV.put(key, str);
      return true;
    }
  } catch (err) {
    console.error('Native KV put error:', err);
  }

  // 2. Fallback to Cloudflare KV REST API if env variables are provided
  const accountId = env?.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = env?.CLOUDFLARE_API_TOKEN;
  const kvId = env?.ZEBAR_KV_ID || '8e44e8402535466aa7cb6a85a8bd1913';

  if (accountId && apiToken) {
    try {
      const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${kvId}/values/${encodeURIComponent(key)}`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'text/plain'
        },
        body: str
      });
      const data = await res.json();
      return !!data.success;
    } catch (err) {
      console.error('REST KV put error:', err);
    }
  }

  return false;
}
