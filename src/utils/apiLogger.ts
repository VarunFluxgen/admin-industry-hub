
import { useAuth } from '@/contexts/AuthContext';

interface LogData {
    userName: string;
    api: string;
    json: Record<string, any>;
}

export const logApiCall = async (apiEndpoint: string, requestData: Record<string, any>) => {
    try {
        const adminUser = localStorage.getItem('adminUser');
        if (!adminUser) return;

        const userData = JSON.parse(adminUser);
        
        const logData: LogData = {
            userName: userData.username || 'unknown',
            api: apiEndpoint,
            json: requestData,
        };

        await fetch('https://admin-aquagen-api-bfckdag2aydtegc2.southindia-01.azurewebsites.net/api/admin/globallogs/adminapp', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(logData),
        });
    } catch (error) {
        console.error('Failed to log API call:', error);
    }
};
