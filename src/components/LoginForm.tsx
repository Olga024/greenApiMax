import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStateInstance } from '../api/greenApi';
import { useAuthStore } from '../store/authStore';

export const LoginForm = () => {
    const navigate = useNavigate();
    const setCredentials = useAuthStore((state) => state.setCredentials);

    const [formData, setFormData] = useState({
        apiUrl: 'https://3100.api.green-api.com',
        idInstance: '',
        apiTokenInstance: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setError(null);

        if (name === 'idInstance') {
            const numericValue = value.replace(/\D/g, '');
            setFormData({ ...formData, [name]: numericValue });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        if (formData.apiTokenInstance.length < 30) {
            setError('Токен выглядит слишком коротким');
            setIsLoading(false);
            return;
        }

        try {
            await getStateInstance(formData);
            setCredentials(formData);
            navigate('/chat');
        } catch (err: any) {
            setError(err.message || 'Произошла неизвестная ошибка при подключении');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="p-8 bg-white rounded-lg shadow-md w-96">
                <h1 className="mb-6 text-2xl font-bold text-center">Вход в GREEN-API</h1>

                {error && (
                    <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded border border-red-200">
                        {error}
                    </div>
                )}

                <div className="mb-4">
                    <label htmlFor="apiUrl" className="block mb-1 text-sm font-medium text-gray-700">API URL</label>
                    <input
                        id="apiUrl"
                        type="text"
                        name="apiUrl"
                        value={formData.apiUrl}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="idInstance" className="block mb-1 text-sm font-medium text-gray-700">ID Instance</label>
                    <input
                        id="idInstance"
                        type="text"
                        inputMode="numeric"
                        name="idInstance"
                        value={formData.idInstance}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none"
                        required
                        autoComplete='off'
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="apiTokenInstance" className="block mb-1 text-sm font-medium text-gray-700">API Token Instance</label>
                    <input
                        id="apiTokenInstance"
                        type="password"
                        name="apiTokenInstance"
                        value={formData.apiTokenInstance}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none"
                        required
                        autoComplete='off'
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2 text-white bg-green-600 rounded hover:bg-green-700 disabled:bg-green-300 transition-colors font-bold"
                >
                    {isLoading ? 'Проверка...' : 'Войти'}
                </button>
            </form>
        </div>
    );
};