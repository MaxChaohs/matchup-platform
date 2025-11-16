import { Request, Response } from 'express';
import Match from '../models/Match';

export const createMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const {
      title,
      description,
      type,
      category,
      location,
      startTime,
      maxParticipants,
    } = req.body;

    const match = new Match({
      creatorId: userId,
      title,
      description,
      type,
      category,
      location,
      startTime,
      maxParticipants,
      currentParticipants: 1,
      participants: [userId],
      status: 'open',
    });

    await match.save();
    await match.populate('creatorId', 'username avatar');

    res.status(201).json({
      message: '比賽創建成功',
      match,
    });
  } catch (error) {
    console.error('創建比賽錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
};

export const getMatches = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, status, page = 1, limit = 10 } = req.query;
    const query: any = {};

    if (type) {
      query.type = type;
    }
    if (status) {
      query.status = status;
    }

    const matches = await Match.find(query)
      .populate('creatorId', 'username avatar')
      .populate('participants', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Match.countDocuments(query);

    res.json({
      matches,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    console.error('取得比賽列表錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
};

export const getMatchById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const match = await Match.findById(id)
      .populate('creatorId', 'username avatar')
      .populate('participants', 'username avatar');

    if (!match) {
      res.status(404).json({ message: '比賽不存在' });
      return;
    }

    res.json({ match });
  } catch (error) {
    console.error('取得比賽詳情錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
};

export const getUserMatches = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { type = 'created' } = req.query; // 'created' 或 'participated'

    let query: any = {};
    if (type === 'created') {
      query.creatorId = userId;
    } else if (type === 'participated') {
      query.participants = userId;
    }

    const matches = await Match.find(query)
      .populate('creatorId', 'username avatar')
      .populate('participants', 'username avatar')
      .sort({ createdAt: -1 });

    res.json({ matches });
  } catch (error) {
    console.error('取得使用者比賽錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
};

