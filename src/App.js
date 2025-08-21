import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './views/Login';
import Menu from './views/menu';
import Diario from './views/Diario';
import Semanal from './views/semanal';
import Reportes from './views/Reportes';
import Notificaciones from './views/notificacion'; 
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/menu" element={
          <ProtectedRoute>
            <Menu />
          </ProtectedRoute>
        } />
        <Route path="/diario" element={
          <ProtectedRoute>
            <Diario />
          </ProtectedRoute>
        } />
        <Route path="/reportes" element={   
          <ProtectedRoute>
            <Reportes />
          </ProtectedRoute>
        } />
        <Route path="/semanal" element={
          <ProtectedRoute>
            <Semanal />
          </ProtectedRoute>
          
} />

<Route path="/notificacion" element={   
          <ProtectedRoute>
            <Notificaciones />
          </ProtectedRoute>
        } />

      </Routes>
    </Router>
  );
}

export default App;
