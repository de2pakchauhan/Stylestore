import { useNavigate } from 'react-router-dom';
import ProfileModal from './ProfileModal';
import { useAuth } from '../context/AuthContext';

export default function ProfileModalWrapper() {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    navigate('/', { replace: true });
    return null;
  }

  return (
    <ProfileModal
      isOpen={true}
      onClose={() => navigate(-1)}
    />
  );
}