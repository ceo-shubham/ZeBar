import { getKV, putKV } from './_kv.js';

const ADMIN_EMAIL = 'ceo.shubhampathak@gmail.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-user-email',
  'Content-Type': 'application/json'
};

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const callerEmail = (request.headers.get('x-user-email') || url.searchParams.get('caller') || '').toLowerCase().trim();
    const targetEmail = (url.searchParams.get('targetEmail') || '').toLowerCase().trim();
    const all = url.searchParams.get('all') === 'true';

    const isOwner = callerEmail === ADMIN_EMAIL;
    const allQRs = (await getKV(env, 'zebar_qrs', true)) || [];

    if (isOwner && all) {
      return new Response(JSON.stringify({ success: true, qrs: allQRs }), { headers: corsHeaders });
    }

    if (isOwner && targetEmail) {
      const filtered = allQRs.filter(q => (q.userEmail || '').toLowerCase() === targetEmail);
      return new Response(JSON.stringify({ success: true, qrs: filtered }), { headers: corsHeaders });
    }

    if (!callerEmail) {
      return new Response(JSON.stringify({ success: false, error: 'Caller email required' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const userQRs = allQRs.filter(q => (q.userEmail || '').toLowerCase() === callerEmail);
    return new Response(JSON.stringify({ success: true, qrs: userQRs }), { headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();

    const { id, title, content, type, qrDataUrl, userEmail, createdAt } = body;
    if (!id || !userEmail) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required QR fields' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const email = userEmail.toLowerCase().trim();
    const newQR = {
      id,
      title: title || 'Untitled QR',
      content: content || '',
      type: type || 'url',
      qrDataUrl: qrDataUrl || '',
      userEmail: email,
      createdAt: createdAt || new Date().toISOString()
    };

    let allQRs = (await getKV(env, 'zebar_qrs', true)) || [];
    if (!Array.isArray(allQRs)) allQRs = [];

    // Filter out duplicate if existing
    allQRs = allQRs.filter(q => q.id !== id);
    allQRs.unshift(newQR);

    // Limit to latest 2000 QRs to preserve storage limits comfortably
    if (allQRs.length > 2000) allQRs = allQRs.slice(0, 2000);

    await putKV(env, 'zebar_qrs', allQRs);

    // Update user's qrCount in zebar_users
    let users = (await getKV(env, 'zebar_users', true)) || [];
    if (Array.isArray(users)) {
      const userIdx = users.findIndex(u => (u.email || '').toLowerCase() === email);
      if (userIdx >= 0) {
        users[userIdx].qrCount = allQRs.filter(q => (q.userEmail || '').toLowerCase() === email).length;
        await putKV(env, 'zebar_users', users);
      }
    }

    return new Response(JSON.stringify({ success: true, qr: newQR }), { headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

export async function onRequestDelete(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const callerEmail = (request.headers.get('x-user-email') || url.searchParams.get('caller') || '').toLowerCase().trim();

    if (!id || !callerEmail) {
      return new Response(JSON.stringify({ success: false, error: 'Missing id or caller' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const isOwner = callerEmail === ADMIN_EMAIL;
    let allQRs = (await getKV(env, 'zebar_qrs', true)) || [];
    if (!Array.isArray(allQRs)) allQRs = [];

    const targetQR = allQRs.find(q => q.id === id);
    if (!targetQR) {
      return new Response(JSON.stringify({ success: true, message: 'QR not found or already deleted' }), { headers: corsHeaders });
    }

    // Only creator or admin can delete
    if (!isOwner && (targetQR.userEmail || '').toLowerCase() !== callerEmail) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized to delete this QR' }), {
        status: 403,
        headers: corsHeaders
      });
    }

    allQRs = allQRs.filter(q => q.id !== id);
    await putKV(env, 'zebar_qrs', allQRs);

    return new Response(JSON.stringify({ success: true, deletedId: id }), { headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
}
