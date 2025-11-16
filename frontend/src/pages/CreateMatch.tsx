import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { matchService } from '../services/matchService';

interface CreateMatchForm {
  title: string;
  description: string;
  type: 'sport' | 'esport';
  category: string;
  location: string;
  startTime: string;
  maxParticipants: number;
}

const CreateMatch = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<CreateMatchForm>();

  const onSubmit = async (data: CreateMatchForm) => {
    try {
      setError('');
      await matchService.createMatch({
        ...data,
        startTime: new Date(data.startTime).toISOString(),
      });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || '創建比賽失敗');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF5E6' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-black mb-6">創建比賽</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              標題 *
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              {...register('title', { required: '請輸入標題' })}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              描述
            </label>
            <textarea
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              {...register('description')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              類型 *
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              {...register('type', { required: '請選擇類型' })}
            >
              <option value="">請選擇</option>
              <option value="sport">運動</option>
              <option value="esport">電子競技</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              類別 *
            </label>
            <input
              type="text"
              placeholder="例如：籃球、英雄聯盟"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              {...register('category', { required: '請輸入類別' })}
            />
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              地點 *
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              {...register('location', { required: '請輸入地點' })}
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              開始時間 *
            </label>
            <input
              type="datetime-local"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              {...register('startTime', { required: '請選擇開始時間' })}
            />
            {errors.startTime && (
              <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              最大參與人數 *
            </label>
            <input
              type="number"
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              {...register('maxParticipants', {
                required: '請輸入最大參與人數',
                min: { value: 1, message: '至少需要 1 人' },
              })}
            />
            {errors.maxParticipants && (
              <p className="mt-1 text-sm text-red-600">{errors.maxParticipants.message}</p>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 py-3 rounded-lg text-white font-semibold"
              style={{ backgroundColor: '#10B981' }}
            >
              創建比賽
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMatch;

