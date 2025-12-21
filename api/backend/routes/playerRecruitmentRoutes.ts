import express from 'express';
import { supabase } from '../supabase.js';

const router = express.Router();

// Helper: 格式化資料 (Backend snake_case -> Frontend camelCase)
const formatRecruitment = (rec: any) => {
  if (!rec) return null;
  
  // 處理關聯的 creator 資料
  const creator = rec.creator;
  const creatorName = creator?.username || 'Unknown User';

  return {
    ...rec,
    _id: rec.id,          // 前端使用 _id
    createdAt: rec.created_at,
    updatedAt: rec.updated_at,
    // 欄位對應
    dayOfWeek: rec.date,       // 資料庫存為 date，前端用 dayOfWeek
    neededPlayers: rec.needed_players,
    currentPlayers: rec.current_players || 1,
    teamName: rec.team_name,
    creatorId: rec.creator_id,
    creatorName: creatorName, // 確保前端能顯示建立者名稱
  };
};

// 1. 獲取所有招募
router.get('/', async (req, res) => {
  try {
    const { category, region, dayOfWeek, search } = req.query;

    // 關聯查詢 creator:creator_id (取得 username)
    let query = supabase
      .from('player_recruitments')
      .select('*, creator:creator_id(id, username, email)')
      .order('created_at', { ascending: false });

    if (category) query = query.eq('category', category);
    if (region) query = query.eq('region', region);
    // 如果有選星期幾，也加入篩選
    if (dayOfWeek) query = query.eq('date', dayOfWeek); 
    if (search) query = query.ilike('title', `%${search}%`);

    const { data, error } = await query;

    if (error) throw error;
    res.json(data.map(formatRecruitment));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. 獲取單一招募
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('player_recruitments')
      .select('*, creator:creator_id(id, username, email)')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: '招募不存在' });
    }
    res.json(formatRecruitment(data));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. 建立招募
router.post('/', async (req, res) => {
  try {
    const {
      title, category, region, dayOfWeek, time, location,
      description, creatorId, neededPlayers, teamName
    } = req.body;

    const { data, error } = await supabase
      .from('player_recruitments')
      .insert([{
        title,
        category,
        region,
        date: dayOfWeek,      // 將前端 dayOfWeek 存入 date 欄位
        time,
        location,
        description,
        creator_id: creatorId,     // 轉為 snake_case
        needed_players: neededPlayers, // 轉為 snake_case
        team_name: teamName,       // 轉為 snake_case
        current_players: 1         // 預設 1 人
      }])
      .select('*, creator:creator_id(username)')
      .single();

    if (error) throw error;
    res.status(201).json(formatRecruitment(data));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 4. 更新招募
router.put('/:id', async (req, res) => {
  try {
    const {
      title, category, region, dayOfWeek, time, location,
      description, neededPlayers, currentPlayers, teamName
    } = req.body;

    const updates: any = { 
      updated_at: new Date().toISOString() 
    };

    if (title) updates.title = title;
    if (category) updates.category = category;
    if (region) updates.region = region;
    if (dayOfWeek) updates.date = dayOfWeek;
    if (time) updates.time = time;
    if (location) updates.location = location;
    if (description !== undefined) updates.description = description;
    if (neededPlayers) updates.needed_players = neededPlayers;
    if (currentPlayers) updates.current_players = currentPlayers;
    if (teamName !== undefined) updates.team_name = teamName;

    const { data, error } = await supabase
      .from('player_recruitments')
      .update(updates)
      .eq('id', req.params.id)
      .select('*, creator:creator_id(username)')
      .single();

    if (error) throw error;
    res.json(formatRecruitment(data));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 5. 刪除招募
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('player_recruitments')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: '招募已刪除' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;