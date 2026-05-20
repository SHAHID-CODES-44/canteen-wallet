import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStations } from '../../services/cashier';
import { useAuth } from '../../contexts/AuthContext';
import './StationSelection.css';

const StationSelection = () => {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    useEffect(() => {
        fetchStations();
    }, []);

    const fetchStations = async () => {
        try {
            const res = await getStations();
            setStations(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (station) => {
        setSelected(station);
        localStorage.setItem('station', JSON.stringify(station));
        setTimeout(() => navigate('/cashier/search'), 300);
    };

    return (
        <div className="station-page">
            <div className="station-header">
                <div className="station-logo">CW</div>
                <h1>Select Your Counter</h1>
                <p>Welcome, {user?.name}. Choose your station to begin.</p>
            </div>
            {loading ? (
                <div className="station-loader">Loading stations...</div>
            ) : (
                <div className="station-grid">
                    {stations.map((station) => (
                        <div
                            key={station.id}
                            className={`station-card ${selected?.id === station.id ? 'selected' : ''}`}
                            onClick={() => handleSelect(station)}
                        >
                            <div className="station-number">{station.id}</div>
                            <h3>{station.name}</h3>
                            <p>Tap to select</p>
                        </div>
                    ))}
                </div>
            )}
            <button className="station-logout" onClick={() => { logout(); navigate('/'); }}>
                Logout
            </button>
        </div>
    );
};

export default StationSelection;