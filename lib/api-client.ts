import axios from 'axios';

// Singleton instance to mimic base44.auth.me() state if needed, 
// though typically we'll rely on Clerk's useAuth() in components.
// For purely client-side API calls:

class Base44Client {
    private static instance: Base44Client;

    public auth = {
        me: async () => {
            // In the new architecture, we might check /api/auth/me or rely on Clerk
            // For compatibility, we'll fetch from our own endpoint
            const res = await axios.get('/api/auth/me');
            return res.data;
        },
        logout: async () => {
            // Clerk handles this via <SignOutButton /> usually, 
            // but if we need a programmatic way:
            window.location.href = '/api/auth/logout'; // Mock
        },
        redirectToLogin: () => {
            window.location.href = '/sign-in';
        }
    };

    public entities = {
        Candidate: {
            list: async (sort?: string) => {
                const res = await axios.get('/api/candidates', { params: { sort } });
                return res.data;
            },
            create: async (data: any) => {
                const res = await axios.post('/api/candidates', data);
                return res.data;
            },
            update: async (id: string, data: any) => {
                const res = await axios.patch(`/api/candidates/${id}`, data);
                return res.data;
            },
            filter: async (query: any) => {
                // Mock filter query
                const res = await axios.get('/api/candidates', { params: { ...query } });
                return res.data;
            }
        },
        JobPosition: {
            list: async () => {
                const res = await axios.get('/api/jobs');
                return res.data;
            },
            create: async (data: any) => {
                const res = await axios.post('/api/jobs', data);
                return res.data;
            }
        }
    };
}

export const base44 = new Base44Client();
