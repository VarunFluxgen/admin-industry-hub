import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import IndustryList from './pages/IndustryList';
import CreateIndustry from './pages/CreateIndustry';
import IndustryDetails from './pages/IndustryDetails';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                    <Routes>
                        <Route path='/login' element={<Login />} />
                        <Route
                            path='/*'
                            element={
                                <ProtectedRoute>
                                    <SidebarProvider>
                                        <div className='min-h-screen flex w-full'>
                                            <AppSidebar />
                                            <main className='flex-1 flex flex-col'>
                                                <Routes>
                                                    <Route
                                                        path='/'
                                                        element={<Dashboard />}
                                                    />
                                                    <Route
                                                        path='/industries'
                                                        element={
                                                            <IndustryList />
                                                        }
                                                    />
                                                    <Route
                                                        path='/industries/create'
                                                        element={
                                                            <CreateIndustry />
                                                        }
                                                    />
                                                    <Route
                                                        path='/industries/:industryId'
                                                        element={
                                                            <IndustryDetails />
                                                        }
                                                    />
                                                    <Route
                                                        path='*'
                                                        element={<NotFound />}
                                                    />
                                                </Routes>
                                            </main>
                                        </div>
                                    </SidebarProvider>
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </BrowserRouter>
            </TooltipProvider>
        </AuthProvider>
    </QueryClientProvider>
);

export default App;
