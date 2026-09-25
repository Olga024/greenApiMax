import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStateInstance } from '../api/greenApi';
import { useAuthStore } from '../store/authStore';

export const LoginForm = () => {
    const navigate = useNavigate();
    const setCredentials = useAuthStore((state) => state.setCredentials);

    const [formData, setFormData] = useState({
        apiUrl: 'https://api.green-api.com',
        idInstance: '',
        apiTokenInstance: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // Проверяем валидность ключей
            await getStateInstance(formData);

            // Если всё ок, сохраняем в стейт и переходим в чат
            setCredentials(formData);
            navigate('/chat');
        } catch (err: any) {
            setError(err.message || 'Произошла ошибка при подключении');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="p-8 bg-white rounded-lg shadow-md w-96">
                <h1 className="mb-6 text-2xl font-bold text-center">Вход в GREEN-API</h1>

                {error && (
                    <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded">
                        {error}
                    </div>
                )}

                <div className="mb-4">
                    <label className="block mb-1 text-sm font-medium">API URL</label>
                    <input
                        type="text"
                        name="apiUrl"
                        value={formData.apiUrl}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-1 text-sm font-medium">ID Instance</label>
                    <input
                        type="text"
                        name="idInstance"
                        value={formData.idInstance}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none"
                        placeholder="Например: 1101"
                        autoComplete="off"
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="block mb-1 text-sm font-medium">API Token Instance</label>
                    <input
                        type="password"
                        name="apiTokenInstance"
                        value={formData.apiTokenInstance}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none"
                        placeholder="Ваш токен"
                        autoComplete="current-password"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2 text-white bg-green-600 rounded hover:bg-green-700 disabled:bg-green-300 transition-colors"
                >
                    {isLoading ? 'Проверка...' : 'Войти'}
                </button>
            </form>
        </div>
    );
};