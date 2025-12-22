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
        max_teams: maxTeams || 2, // 最多隊伍數，預設2隊
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

// ===== 報名相關 API =====

// Helper: 格式化報名資料
const formatRegistration = (reg: any) => {
  if (!reg) return null;
  const user = reg.users || reg.user;
  return {
    ...reg,
    _id: reg.id,
    matchId: reg.match_id,
    userId: reg.user_id,
    teamName: reg.team_name,
    contactInfo: reg.contact_info,
    createdAt: reg.created_at,
    user: user ? {
      _id: user.id,
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone
    } : undefined
  };
};

// 6. 報名加入對戰
router.post('/:id/register', async (req, res) => {
  try {
    const matchId = req.params.id;
    const { userId, teamName, contactInfo, message } = req.body;

    if (!userId || !contactInfo) {
      return res.status(400).json({ error: '缺少必要欄位：userId 和 contactInfo' });
    }

    // 檢查對戰是否存在
    const { data: match, error: matchError } = await supabase
      .from('team_matches')
      .select('*, users:creator_id (id, username, email, phone)')
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      return res.status(404).json({ error: '找不到該對戰' });
    }

    // 檢查是否為建立者（建立者不能報名自己的對戰）
    if (match.creator_id === userId) {
      return res.status(400).json({ error: '您不能報名自己建立的對戰' });
    }

    // 檢查是否已報名
    const { data: existingReg } = await supabase
      .from('match_registrations')
      .select('id')
      .eq('match_id', matchId)
      .eq('user_id', userId)
      .single();

    if (existingReg) {
      return res.status(400).json({ error: '您已經報名過此對戰' });
    }

    // 建立報名記錄
    const { data: registration, error: regError } = await supabase
      .from('match_registrations')
      .insert([{
        match_id: matchId,
        user_id: userId,
        team_name: teamName,
        contact_info: contactInfo,
        message: message,
        status: 'pending'
      }])
      .select('*, users:user_id (id, username, email, phone)')
      .single();

    if (regError) throw regError;

    // 更新對戰的 current_teams
    await supabase
      .from('team_matches')
      .update({ current_teams: (match.current_teams || 1) + 1 })
      .eq('id', matchId);

    // 回傳報名資訊和建立者聯絡資訊
    const creator = match.users;
    res.status(201).json({
      registration: formatRegistration(registration),
      creatorContact: {
        username: creator?.username,
        email: creator?.email,
        phone: creator?.phone
      },
      message: '報名成功！'
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 7. 獲取對戰的報名者清單
router.get('/:id/registrations', async (req, res) => {
  try {
    const matchId = req.params.id;
    const { userId } = req.query;

    // 檢查對戰是否存在並獲取建立者資訊
    const { data: match, error: matchError } = await supabase
      .from('team_matches')
      .select('creator_id')
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      return res.status(404).json({ error: '找不到該對戰' });
    }

    // 獲取報名者清單
    const { data: registrations, error: regError } = await supabase
      .from('match_registrations')
      .select('*, users:user_id (id, username, email, phone)')
      .eq('match_id', matchId)
      .order('created_at', { ascending: false });

    if (regError) throw regError;

    res.json({
      registrations: registrations.map(formatRegistration),
      isCreator: match.creator_id === userId
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 8. 更新報名狀態
router.put('/:id/registrations/:regId', async (req, res) => {
  try {
    const { id: matchId, regId } = req.params;
    const { status } = req.body;

    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: '無效的狀態值' });
    }

    // 獲取原本的報名狀態
    const { data: oldReg, error: oldError } = await supabase
      .from('match_registrations')
      .select('status')
      .eq('id', regId)
      .single();

    if (oldError) throw oldError;
    const oldStatus = oldReg?.status;

    // 更新報名狀態
    const { data, error } = await supabase
      .from('match_registrations')
      .update({ status })
      .eq('id', regId)
      .select('*, users:user_id (id, username, email, phone)')
      .single();

    if (error) throw error;

    // 如果狀態從非拒絕變成拒絕，減少隊伍數量
    if (status === 'rejected' && oldStatus !== 'rejected') {
      const { data: match } = await supabase
        .from('team_matches')
        .select('current_teams')
        .eq('id', matchId)
        .single();

      if (match && match.current_teams > 1) {
        await supabase
          .from('team_matches')
          .update({ current_teams: match.current_teams - 1 })
          .eq('id', matchId);
      }
    }
    // 如果狀態從拒絕變成其他狀態，增加隊伍數量
    else if (oldStatus === 'rejected' && status !== 'rejected') {
      const { data: match } = await supabase
        .from('team_matches')
        .select('current_teams')
        .eq('id', matchId)
        .single();

      if (match) {
        await supabase
          .from('team_matches')
          .update({ current_teams: match.current_teams + 1 })
          .eq('id', matchId);
      }
    }

    res.json(formatRegistration(data));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 9. 檢查用戶是否已報名
router.get('/:id/check-registration', async (req, res) => {
  try {
    const matchId = req.params.id;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: '缺少 userId' });
    }

    const { data, error } = await supabase
      .from('match_registrations')
      .select('*')
      .eq('match_id', matchId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

    res.json({
      isRegistered: !!data,
      registration: data ? formatRegistration(data) : null
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;