// /api/diary/[profile].js
import { getAdminClient } from '../_supabase.js';
import bcrypt from 'bcryptjs';

async function getProfileByName(supabase, profileName) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, password_hash')
    .eq('name', profileName)
    .maybeSingle();

  if (error) throw error;
  return data || null;
}

async function verifyPassword(supabase, profileName, password) {
  const profile = await getProfileByName(supabase, profileName);
  if (!profile) return { ok: false, reason: 'not-found' };

  const match = await bcrypt.compare(password, profile.password_hash);
  if (!match) return { ok: false, reason: 'bad-pass' };

  return { ok: true, profile };
}

export default async function handler(req, res) {
  const supabase = getAdminClient();
  const { profile } = req.query; // route param

  try {
    if (req.method === 'GET') {
      const password = req.query.password || '';
      if (!password) return res.status(400).json({ error: 'Password required.' });

      const check = await verifyPassword(supabase, profile, password);
      if (!check.ok) {
        const status = check.reason === 'not-found' ? 404 : 401;
        return res.status(status).json({ error: check.reason === 'not-found' ? 'Profile not found.' : 'Incorrect password.' });
      }

      const { data: entries, error: entErr } = await supabase
        .from('diary_entries')
        .select('id, title, body, date')
        .eq('profile_id', check.profile.id)
        .order('created_at', { ascending: true });

      if (entErr) throw entErr;

      return res.status(200).json({ entries: entries || [] });
    }

    if (req.method === 'POST') {
      const { password, title, date, body } = req.body || {};
      if (!password || !title || !date || !body) {
        return res.status(400).json({ error: 'password, title, date, body are required.' });
      }

      const check = await verifyPassword(supabase, profile, password);
      if (!check.ok) {
        const status = check.reason === 'not-found' ? 404 : 401;
        return res.status(status).json({ error: check.reason === 'not-found' ? 'Profile not found.' : 'Incorrect password.' });
      }

      const { data, error: insErr } = await supabase
        .from('diary_entries')
        .insert([{ profile_id: check.profile.id, title, date, body }])
        .select('id')
        .single();

      if (insErr) throw insErr;

      return res.status(200).json({ ok: true, id: data?.id });
    }

    if (req.method === 'PUT') {
      const { password, id, updates } = req.body || {};
      if (!password || !id || !updates) {
        return res.status(400).json({ error: 'password, id and updates are required.' });
      }

      const check = await verifyPassword(supabase, profile, password);
      if (!check.ok) {
        const status = check.reason === 'not-found' ? 404 : 401;
        return res.status(status).json({ error: check.reason === 'not-found' ? 'Profile not found.' : 'Incorrect password.' });
      }

      const { error: updErr } = await supabase
        .from('diary_entries')
        .update({
          title: updates.title,
          date: updates.date,
          body: updates.body
        })
        .eq('id', id)
        .eq('profile_id', check.profile.id);

      if (updErr) throw updErr;

      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      const { password, id } = req.body || {};
      if (!password || !id) {
        return res.status(400).json({ error: 'password and id are required.' });
      }

      const check = await verifyPassword(supabase, profile, password);
      if (!check.ok) {
        const status = check.reason === 'not-found' ? 404 : 401;
        return res.status(status).json({ error: check.reason === 'not-found' ? 'Profile not found.' : 'Incorrect password.' });
      }

      const { error: delErr } = await supabase
        .from('diary_entries')
        .delete()
        .eq('id', id)
        .eq('profile_id', check.profile.id);

      if (delErr) throw delErr;

      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('diary API error', err);
    return res.status(500).json({ error: 'A server error occurred.' });
  }
}

export const config = {
  api: {
    bodyParser: true
  }
};
