import { getKV, putKV } from './_kv.js';

const ADMIN_EMAIL = 'ceo.shubhampathak@gmail.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

    // STRICT OWNER CHECK: Only authorized email can inspect full user directory
    if (callerEmail !== ADMIN_EMAIL) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 403,
        headers: corsHeaders
      });
    }

    const users = (await getKV(env, 'zebar_users', true)) || [];
    const qrs = (await getKV(env, 'zebar_qrs', true)) || [];

    // Ensure qrCount is accurately synchronized
    const usersWithCounts = users.map(u => {
      const userQRs = qrs.filter(q => (q.userEmail || '').toLowerCase() === u.email.toLowerCase());
      return {
        ...u,
        qrCount: Math.max(u.qrCount || 0, userQRs.length)
      };
    });

    return new Response(JSON.stringify({
      success: true,
      users: usersWithCounts,
      totalUsers: usersWithCounts.length,
      totalQRs: qrs.length
    }), {
      headers: corsHeaders
    });
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

    const rawEmail = body.email;
    if (!rawEmail || typeof rawEmail !== 'string') {
      return new Response(JSON.stringify({ success: false, error: 'Valid email is required' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const email = rawEmail.toLowerCase().trim();
    const name = (body.name || email.split('@')[0]).trim();
    const picture = body.picture || '';
    const isOwner = email === ADMIN_EMAIL;

    let users = (await getKV(env, 'zebar_users', true)) || [];
    if (!Array.isArray(users)) users = [];

    const existingIndex = users.findIndex(u => (u.email || '').toLowerCase() === email);
    let userRecord;

    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      userRecord = {
        ...users[existingIndex],
        name: name || users[existingIndex].name,
        picture: picture || users[existingIndex].picture,
        lastLoginAt: now,
        role: isOwner ? 'ADMIN' : 'USER'
      };
      users[existingIndex] = userRecord;
    } else {
      userRecord = {
        email: email,
        name: name,
        picture: picture,
        firstLoginAt: now,
        lastLoginAt: now,
        qrCount: 0,
        role: isOwner ? 'ADMIN' : 'USER'
      };
      users.unshift(userRecord);
    }

    await putKV(env, 'zebar_users', users);
    await putKV(env, `user:${email}`, userRecord);

    return new Response(JSON.stringify({
      success: true,
      user: userRecord,
      totalUsers: users.length
    }), {
      headers: corsHeaders
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
}
