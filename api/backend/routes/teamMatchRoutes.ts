import express from 'express';
import { supabase } from '../supabase.js'; // 請確認這個路徑是否正確指向 supabase.ts

const router = express.Router();

// Helper: 處理資料格式 (將 id 轉為 _id 以相容前端)
const formatMatch = (match: any) => {
  if (!match) return null;
  
  let creator = match.users; 
  if (creator) {
    creator = { ...creator, _id: creator.id };
  }

  return { 
    ...match, 
    _id: match.id, 
    // 重要：將 Supabase 的 created_at 轉回前端習慣的 createdAt
    createdAt: match.created_at, 
    updatedAt: match.updated_at,
    creator 
  };
};

// 1. 獲取所有對戰 (支援篩選)
router.get('/', async (req, res) => {
  try {
    const { category, region, dayOfWeek, search } = req.query;

    let query = supabase
      .from('team_matches')
      .select('*, users:creator_id (id, username, avatar)') // 關聯查詢建立者
      .order('created_at', { ascending: false });

    if (category) query = query.eq('category', category);
    if (region) query = query.eq('region', region);
    // dayOfWeek 處理比較複雜，這裡先省略或需前端配合存特定格式
    if (search) query = query.ilike('title', `%${search}%`);

    const { data, error } = await query;

    if (error) throw error;
    res.json(data.map(formatMatch));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. 獲取單一對戰
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('team_matches')
      .select('*, users:creator_id (id, username, avatar)')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: '找不到該對戰' });
    }
    res.json(formatMatch(data));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. 建立對戰
router.post('/', async (req, res) => {
  try {
    const { 
      title, date, time, location, region, category, 
      format, description, level, max_players, creator_id 
    } = req.body;

    const { data, error } = await supabase
      .from('team_matches')
      .insert([{
        title, date, time, location, region, category, 
        format, description, level, max_players, creator_id
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(formatMatch(data));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 4. 更新對戰
router.put('/:id', async (req, res) => {
  try {
    const updates = { ...req.body, updated_at: new Date().toISOString() };
    delete updates._id; // 移除前端可能傳來的 _id
    delete updates.users; // 移除關聯資料

    const { data, error } = await supabase
      .from('team_matches')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(formatMatch(data));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 5. 刪除對戰
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('team_matches')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: '已刪除' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;