import express from 'express';
import mongoose from 'mongoose';
import TeamMatch from '../models/TeamMatch.js';

const router = express.Router();

// 獲取所有隊伍對戰（公開）
router.get('/', async (req, res) => {
  try {
    // 檢查 MongoDB 連接狀態
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: '資料庫連接不可用，請稍後再試' });
    }

    const { category, region, dayOfWeek, search } = req.query;
    const query: any = {};

    if (category) query.category = category;
    if (region) query.region = region;
    if (dayOfWeek) query.dayOfWeek = dayOfWeek;

    let matches = await TeamMatch.find(query)
      .populate('creatorId', 'username email')
      .sort({ createdAt: -1 });

    // 搜尋功能
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      matches = matches.filter(match => 
        match.title.match(searchRegex) ||
        match.category.match(searchRegex) ||
        match.region.match(searchRegex) ||
        match.location.match(searchRegex) ||
        match.description?.match(searchRegex) ||
        match.creatorName.match(searchRegex) ||
        match.teamName?.match(searchRegex)
      );
    }

    res.json(matches);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 獲取單個隊伍對戰
router.get('/:id', async (req, res) => {
  try {
    const match = await TeamMatch.findById(req.params.id).populate('creatorId', 'username email');
    if (!match) {
      return res.status(404).json({ error: '對戰不存在' });
    }
    res.json(match);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 創建隊伍對戰
router.post('/', async (req, res) => {
  try {
    // 檢查 MongoDB 連接狀態
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: '資料庫連接不可用，請稍後再試' });
    }

    const {
      title,
      category,
      region,
      dayOfWeek,
      time,
      location,
      description,
      creatorId,
      creatorName,
      teamSize,
      maxTeams = 2, // 一對一，預設2隊
      teamName,
    } = req.body;

    if (!title || !category || !region || !dayOfWeek || !time || !location || !creatorId || !creatorName || !teamSize) {
      return res.status(400).json({ error: '缺少必要欄位' });
    }

    // 驗證 creatorId 是否為有效的 ObjectId
    if (!mongoose.Types.ObjectId.isValid(creatorId)) {
      return res.status(400).json({ 
        error: '無效的用戶 ID。請重新登入以獲取有效的用戶 ID。',
        code: 'INVALID_USER_ID'
      });
    }

    const match = new TeamMatch({
      title,
      category,
      region,
      dayOfWeek,
      time,
      location,
      description,
      creatorId,
      creatorName,
      teamSize,
      maxTeams,
      currentTeams: 1,
      teamName,
    });

    await match.save();
    await match.populate('creatorId', 'username email');
    res.status(201).json(match);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 更新隊伍對戰
router.put('/:id', async (req, res) => {
  try {
    const match = await TeamMatch.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ error: '對戰不存在' });
    }

    const {
      title,
      category,
      region,
      dayOfWeek,
      time,
      location,
      description,
      teamSize,
      maxTeams,
      teamName,
    } = req.body;

    if (title) match.title = title;
    if (category) match.category = category;
    if (region) match.region = region;
    if (dayOfWeek) match.dayOfWeek = dayOfWeek;
    if (time) match.time = time;
    if (location) match.location = location;
    if (description !== undefined) match.description = description;
    if (teamSize) match.teamSize = teamSize;
    if (maxTeams) match.maxTeams = maxTeams;
    if (teamName !== undefined) match.teamName = teamName;

    await match.save();
    await match.populate('creatorId', 'username email');
    res.json(match);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 刪除隊伍對戰
router.delete('/:id', async (req, res) => {
  try {
    const match = await TeamMatch.findByIdAndDelete(req.params.id);
    if (!match) {
      return res.status(404).json({ error: '對戰不存在' });
    }
    res.json({ message: '對戰已刪除' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

