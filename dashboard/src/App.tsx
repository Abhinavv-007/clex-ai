import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import Overview from './pages/Overview';
import ApiKeys from './pages/ApiKeys';
import UsageLogs from './pages/UsageLogs';
import Analytics from './pages/Analytics';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter basename="/dashboard">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<RequireAuth />}>
          <Route element={<Layout />}>
            <Route index element={<Overview />} />
            <Route path="keys" element={<ApiKeys />} />
            <Route path="usage" element={<UsageLogs />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
