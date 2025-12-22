import express from 'express';
import { supabase } from '../supabase.js'; // 請確認這個路徑是否正確指向 supabase.ts

const router = express.Router();

// Helper: 處理資料格式 (將 id 轉為 _id 以相容前端)
const formatMatch = (match: any) => {
  if (!match) return null;
  
  // 處理關聯的 creator 資料
  const creator = match.users || match.creator;
  const creatorName = creator?.username || 'Unknown User';

  return { 
    ...match, 
    _id: match.id,
    id: match.id, // 兼容字段
    // 重要：將 Supabase 的 created_at 轉回前端習慣的 createdAt
    createdAt: match.created_at, 
    updatedAt: match.updated_at,
    // 欄位對應：資料庫使用 date，前端使用 dayOfWeek
    dayOfWeek: match.date,
    // 欄位對應：資料庫使用 snake_case，前端使用 camelCase
    creatorId: match.creator_id,
    creatorName: creatorName,
    teamSize: match.team_size || match.teamSize,
    maxTeams: match.max_teams || match.maxTeams || 2,
    currentTeams: match.current_teams || match.currentTeams || 1,
    teamName: match.team_name || match.teamName,
    // 保持 creator 物件以供前端使用
    creator: creator ? { ...creator, _id: creator.id } : undefined
  };
};

// 1. 獲取所有對戰 (支援篩選)
router.get('/', async (req, res) => {
  try {
    const { category, region, dayOfWeek, search } = req.query;

    let query = supabase
      .from('team_matches')
      .select('*, users:creator_id (id, username, email, avatar)') // 關聯查詢建立者
      .order('created_at', { ascending: false });

    if (category) query = query.eq('category', category);
    if (region) query = query.eq('region', region);
    // dayOfWeek 對應到資料庫的 date 欄位
    if (dayOfWeek) query = query.eq('date', dayOfWeek);
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
      .select('*, users:creator_id (id, username, email, avatar)')
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
      title, category, region, dayOfWeek, time, location,
      description, creatorId, creatorName, teamSize, maxTeams, teamName
    } = req.body;

    // 驗證必要欄位
    if (!title || !category || !region || !dayOfWeek || !time || !location || !creatorId || !teamSize) {
      return res.status(400).json({ error: '缺少必要欄位' });
    }

    const { data, error } = await supabase
      .from('team_matches')
      .insert([{
        title,
        category,
        region,
        date: dayOfWeek,        // 將前端 dayOfWeek 存入 date 欄位
        time,
        location,
        description,
        creator_id: creatorId,  // 轉為 snake_case
        team_size: teamSize,     // 轉為 snake_case
        max_teams: maxTeams || 2, // 轉為 snake_case，預設2隊
        current_teams: 1,        // 預設1隊（建立者）
        team_name: teamName      // 轉為 snake_case
      }])
      .select('*, users:creator_id (id, username, email, avatar)')
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
    const { 
      title, category, region, dayOfWeek, time, location,
      description, teamSize, maxTeams, teamName
    } = req.body;

    const updates: any = { 
      updated_at: new Date().toISOString() 
    };

    if (title) updates.title = title;
    if (category) updates.category = category;
    if (region) updates.region = region;
    if (dayOfWeek) updates.date = dayOfWeek; // 將前端 dayOfWeek 存入 date 欄位
    if (time) updates.time = time;
    if (location) updates.location = location;
    if (description !== undefined) updates.description = description;
    if (teamSize) updates.team_size = teamSize;
    if (maxTeams) updates.max_teams = maxTeams;
    if (teamName !== undefined) updates.team_name = teamName;

    const { data, error } = await supabase
      .from('team_matches')
      .update(updates)
      .eq('id', req.params.id)
      .select('*, users:creator_id (id, username, email, avatar)')
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