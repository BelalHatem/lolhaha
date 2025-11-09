// /api/profiles.js
import { getAdminClient } from './_supabase.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  const supabase = getAdminClient();

  try {
    if (req.method === 'GET') {
      // list profiles (names only)
      const { data, error } = await supabase
        .from('profiles')
        .select('name')
        .order('created_at', { ascending: true });

      if (error) throw error;

      return res.status(200).json({ profiles: data || [] });
    }

    if (req.method === 'POST') {
      const { name, password } = req.body || {};
      if (!name || !password) {
        return res.status(400).json({ error: 'Name and password required.' });
      }

      // is name unique?
      const { data: existing, error: exErr } = await supabase
        .from('profiles')
        .select('id')
        .eq('name', name)
        .maybeSingle();

      if (exErr) throw exErr;
      if (existing) return res.status(400).json({ error: 'Profile name already exists.' });

      const hash = await bcrypt.hash(password, 10);

      const { error: insErr } = await supabase
        .from('profiles')
        .insert([{ name, password_hash: hash }]);

      if (insErr) throw insErr;

      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      const { name, password } = req.body || {};
      if (!name || !password) {
        return res.status(400).json({ error: 'Name and password required.' });
      }

      const { data: profile, error: getErr } = await supabase
        .from('profiles')
        .select('id, password_hash')
        .eq('name', name)
        .maybeSingle();

      if (getErr) throw getErr;
      if (!profile) return res.status(404).json({ error: 'Profile not found.' });

      const ok = await bcrypt.compare(password, profile.password_hash);
      if (!ok) return res.status(401).json({ error: 'Incorrect password.' });

      // cascade delete will remove diary_entries automatically
      const { error: delErr } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profile.id);

      if (delErr) throw delErr;

      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('profiles API error', err);
    return res.status(500).json({ error: 'A server error occurred.' });
  }
}

export const config = {
  api: {
    bodyParser: true
  }
};
