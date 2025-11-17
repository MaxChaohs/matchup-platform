import express from 'express';
import mongoose from 'mongoose';
import PlayerRecruitment from '../models/PlayerRecruitment.js';

const router = express.Router();

// 獲取所有隊員招募（公開）
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

    let recruitments = await PlayerRecruitment.find(query)
      .populate('creatorId', 'username email')
      .sort({ createdAt: -1 });

    // 搜尋功能
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      recruitments = recruitments.filter(recruitment => 
        recruitment.title.match(searchRegex) ||
        recruitment.category.match(searchRegex) ||
        recruitment.region.match(searchRegex) ||
        recruitment.location.match(searchRegex) ||
        recruitment.description?.match(searchRegex) ||
        recruitment.creatorName.match(searchRegex) ||
        recruitment.teamName?.match(searchRegex)
      );
    }

    res.json(recruitments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 獲取單個隊員招募
router.get('/:id', async (req, res) => {
  try {
    const recruitment = await PlayerRecruitment.findById(req.params.id).populate('creatorId', 'username email');
    if (!recruitment) {
      return res.status(404).json({ error: '招募不存在' });
    }
    res.json(recruitment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 創建隊員招募
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
      neededPlayers,
      teamName,
    } = req.body;

    if (!title || !category || !region || !dayOfWeek || !time || !location || !creatorId || !creatorName || !neededPlayers) {
      return res.status(400).json({ error: '缺少必要欄位' });
    }

    // 驗證 creatorId 是否為有效的 ObjectId
    if (!mongoose.Types.ObjectId.isValid(creatorId)) {
      return res.status(400).json({ 
        error: '無效的用戶 ID。請重新登入以獲取有效的用戶 ID。',
        code: 'INVALID_USER_ID'
      });
    }

    const recruitment = new PlayerRecruitment({
      title,
      category,
      region,
      dayOfWeek,
      time,
      location,
      description,
      creatorId,
      creatorName,
      currentPlayers: 1,
      neededPlayers,
      teamName,
    });

    await recruitment.save();
    await recruitment.populate('creatorId', 'username email');
    res.status(201).json(recruitment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 更新隊員招募
router.put('/:id', async (req, res) => {
  try {
    const recruitment = await PlayerRecruitment.findById(req.params.id);
    if (!recruitment) {
      return res.status(404).json({ error: '招募不存在' });
    }

    const {
      title,
      category,
      region,
      dayOfWeek,
      time,
      location,
      description,
      neededPlayers,
      currentPlayers,
      teamName,
    } = req.body;

    if (title) recruitment.title = title;
    if (category) recruitment.category = category;
    if (region) recruitment.region = region;
    if (dayOfWeek) recruitment.dayOfWeek = dayOfWeek;
    if (time) recruitment.time = time;
    if (location) recruitment.location = location;
    if (description !== undefined) recruitment.description = description;
    if (neededPlayers) recruitment.neededPlayers = neededPlayers;
    if (currentPlayers) recruitment.currentPlayers = currentPlayers;
    if (teamName !== undefined) recruitment.teamName = teamName;

    await recruitment.save();
    await recruitment.populate('creatorId', 'username email');
    res.json(recruitment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 刪除隊員招募
router.delete('/:id', async (req, res) => {
  try {
    const recruitment = await PlayerRecruitment.findByIdAndDelete(req.params.id);
    if (!recruitment) {
      return res.status(404).json({ error: '招募不存在' });
    }
    res.json({ message: '招募已刪除' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

