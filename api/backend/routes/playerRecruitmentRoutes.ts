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

// ===== 報名相關 API =====

// Helper: 格式化報名資料
const formatApplication = (app: any) => {
  if (!app) return null;
  const user = app.users || app.user;
  return {
    ...app,
    _id: app.id,
    recruitmentId: app.recruitment_id,
    userId: app.user_id,
    contactInfo: app.contact_info,
    createdAt: app.created_at,
    user: user ? {
      _id: user.id,
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone
    } : undefined
  };
};

// 6. 報名找隊員
router.post('/:id/apply', async (req, res) => {
  try {
    const recruitmentId = req.params.id;
    const { userId, contactInfo, message } = req.body;

    if (!userId || !contactInfo) {
      return res.status(400).json({ error: '缺少必要欄位：userId 和 contactInfo' });
    }

    // 檢查招募是否存在
    const { data: recruitment, error: recError } = await supabase
      .from('player_recruitments')
      .select('*, creator:creator_id (id, username, email, phone)')
      .eq('id', recruitmentId)
      .single();

    if (recError || !recruitment) {
      return res.status(404).json({ error: '找不到該招募' });
    }

    // 檢查是否為建立者（建立者不能報名自己的招募）
    if (recruitment.creator_id === userId) {
      return res.status(400).json({ error: '您不能報名自己建立的招募' });
    }

    // 檢查是否已報名
    const { data: existingApp } = await supabase
      .from('recruitment_applications')
      .select('id')
      .eq('recruitment_id', recruitmentId)
      .eq('user_id', userId)
      .single();

    if (existingApp) {
      return res.status(400).json({ error: '您已經報名過此招募' });
    }

    // 建立報名記錄
    const { data: application, error: appError } = await supabase
      .from('recruitment_applications')
      .insert([{
        recruitment_id: recruitmentId,
        user_id: userId,
        contact_info: contactInfo,
        message: message,
        status: 'pending'
      }])
      .select('*, users:user_id (id, username, email, phone)')
      .single();

    if (appError) throw appError;

    // 更新招募的 current_players
    await supabase
      .from('player_recruitments')
      .update({ current_players: (recruitment.current_players || 1) + 1 })
      .eq('id', recruitmentId);

    // 回傳報名資訊和建立者聯絡資訊
    const creator = recruitment.creator;
    res.status(201).json({
      application: formatApplication(application),
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

// 7. 獲取招募的報名者清單
router.get('/:id/applications', async (req, res) => {
  try {
    const recruitmentId = req.params.id;
    const { userId } = req.query;

    // 檢查招募是否存在並獲取建立者資訊
    const { data: recruitment, error: recError } = await supabase
      .from('player_recruitments')
      .select('creator_id')
      .eq('id', recruitmentId)
      .single();

    if (recError || !recruitment) {
      return res.status(404).json({ error: '找不到該招募' });
    }

    // 獲取報名者清單
    const { data: applications, error: appError } = await supabase
      .from('recruitment_applications')
      .select('*, users:user_id (id, username, email, phone)')
      .eq('recruitment_id', recruitmentId)
      .order('created_at', { ascending: false });

    if (appError) throw appError;

    res.json({
      applications: applications.map(formatApplication),
      isCreator: recruitment.creator_id === userId
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 8. 更新報名狀態
router.put('/:id/applications/:appId', async (req, res) => {
  try {
    const { id: recruitmentId, appId } = req.params;
    const { status } = req.body;

    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: '無效的狀態值' });
    }

    // 獲取原本的報名狀態
    const { data: oldApp, error: oldError } = await supabase
      .from('recruitment_applications')
      .select('status')
      .eq('id', appId)
      .single();

    if (oldError) throw oldError;
    const oldStatus = oldApp?.status;

    // 更新報名狀態
    const { data, error } = await supabase
      .from('recruitment_applications')
      .update({ status })
      .eq('id', appId)
      .select('*, users:user_id (id, username, email, phone)')
      .single();

    if (error) throw error;

    // 如果狀態從非拒絕變成拒絕，減少隊員數量
    if (status === 'rejected' && oldStatus !== 'rejected') {
      const { data: recruitment } = await supabase
        .from('player_recruitments')
        .select('current_players')
        .eq('id', recruitmentId)
        .single();

      if (recruitment && recruitment.current_players > 1) {
        await supabase
          .from('player_recruitments')
          .update({ current_players: recruitment.current_players - 1 })
          .eq('id', recruitmentId);
      }
    }
    // 如果狀態從拒絕變成其他狀態，增加隊員數量
    else if (oldStatus === 'rejected' && status !== 'rejected') {
      const { data: recruitment } = await supabase
        .from('player_recruitments')
        .select('current_players')
        .eq('id', recruitmentId)
        .single();

      if (recruitment) {
        await supabase
          .from('player_recruitments')
          .update({ current_players: recruitment.current_players + 1 })
          .eq('id', recruitmentId);
      }
    }

    res.json(formatApplication(data));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 9. 檢查用戶是否已報名
router.get('/:id/check-application', async (req, res) => {
  try {
    const recruitmentId = req.params.id;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: '缺少 userId' });
    }

    const { data, error } = await supabase
      .from('recruitment_applications')
      .select('*')
      .eq('recruitment_id', recruitmentId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

    res.json({
      isApplied: !!data,
      application: data ? formatApplication(data) : null
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;