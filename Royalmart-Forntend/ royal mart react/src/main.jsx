import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { StoreProvider } from './store/StoreContext';
import './assets/styles/index.css';
import './assets/styles/bag.css';
import './assets/styles/checkout.css';
import './assets/styles/auth.css';
import './assets/styles/wishlist.css';
import './assets/styles/admin/admin.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <StoreProvider>
      <App />
    </StoreProvider>
  </BrowserRouter>
);
