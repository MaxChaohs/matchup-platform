// api/backend/routes/userRoutes.ts
import express from 'express';
import { supabase } from '../supabase.js';

const router = express.Router();

// Helper to map Supabase 'id' to '_id' for frontend compatibility
const formatUser = (user: any) => {
  if (!user) return null;
  return { ...user, _id: user.id };
};

// Get all users
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data.map(formatUser));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single user
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: '用戶不存在' });
    }
    res.json(formatUser(data));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create user
router.post('/', async (req, res) => {
  try {
    const { username, email, phone, avatar } = req.body;
    
    // Check for existing user (optional, Supabase unique constraints will also catch this)
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)
      .maybeSingle();
    
    if (existing) {
      return res.status(400).json({ error: '用戶名或電子郵件已存在' });
    }

    const { data, error } = await supabase
      .from('users')
      .insert([{ username, email, phone, avatar }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(formatUser(data));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { username, email, phone, avatar } = req.body;
    const updates: any = { updated_at: new Date().toISOString() };
    
    if (username) updates.username = username;
    if (email) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (avatar !== undefined) updates.avatar = avatar;

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(formatUser(data));
  } catch (error: any) {
    // Handle unique constraint violations
    if (error.code === '23505') {
       return res.status(400).json({ error: '用戶名或電子郵件已被使用' });
    }
    res.status(400).json({ error: error.message });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: '用戶已刪除' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
