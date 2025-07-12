import React, { useState, useEffect, useCallback } from 'react';
import styles from './ProfilePage.module.css';
import { useAuth } from '../../hooks/useAuth';
import { getProfile, updateMyProfile } from '../../services/userService';
// import { changePassword } from '../../services/authService'; // For future

import InputField from '../../components/InputField/InputField';
import Button from '../../components/Button/Button';
import Spinner from '../../components/Spinner/Spinner';
import Alert from '../../components/Alert/Alert';
import Card from '../../components/Card/Card';
// import Modal from '../../components/Modal/Modal'; // For future
// import PasswordChangeForm from '../../components/auth/PasswordChangeForm'; // For future

const ProfilePage = () => {
  const { user: authUser, setUser: setAuthUser } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('');
  const [memberSince, setMemberSince] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false); // For future

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const profileData = await getProfile();
      if (profileData) {
        setName(profileData.name || '');
        setEmail(profileData.email || '');
        setPhoneNumber(profileData.phoneNumber || '');
        setRole(profileData.role || '');
        setMemberSince(profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'N/A');
      } else {
        throw new Error("No profile data returned.");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err.response?.data?.message || "Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleEditToggle = () => {
    if (isEditing) {
      fetchProfile(); // Reset changes if cancelling
    }
    setIsEditing(!isEditing);
    setError('');
    setSuccess('');
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    const updatedData = {
      name: name,
      phoneNumber: phoneNumber || undefined
    };

    try {
      const updatedUser = await updateMyProfile(updatedData);
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      setName(updatedUser.name || '');
      setPhoneNumber(updatedUser.phoneNumber || '');
      setAuthUser(prevUser => ({ ...prevUser, name: updatedUser.name, phoneNumber: updatedUser.phoneNumber }));
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSubmitting(false);
    }
  };

  // Future password change modal handlers
  // const openPasswordModal = () => setIsPasswordModalOpen(true);
  // const closePasswordModal = () => setIsPasswordModalOpen(false);
  // const handlePasswordChangeSuccess = () => { ... };

  if (loading) {
    return (
      <div className={styles.profilePage}>
        <h2>Your Profile</h2>
        <Spinner message="Loading profile..." />
      </div>
    );
  }

  return (
    <div className={styles.profilePage}>
      <h2>Your Profile</h2>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <Card className={styles.profileCard}>
        <form onSubmit={handleProfileUpdate}>
          <div className={styles.profileHeader}>
            <div className={styles.avatarPlaceholder}>👤</div>
            <div className={styles.userInfo}>
              <p className={styles.userEmail}>{email}</p>
              <p className={styles.userRole}>Role: {role}</p>
            </div>
            {!isEditing && (
              <Button onClick={handleEditToggle} variant="outline" size="small" className={styles.editButton}>
                Edit Profile
              </Button>
            )}
          </div>

          <h3 className={styles.sectionTitle}>Account Information</h3>
          <div className={styles.infoGrid}>
            <InputField
              label="Full Name"
              id="profileName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isEditing || submitting}
              readOnly={!isEditing}
              required
            />
            <InputField
              label="Email Address"
              id="profileEmail"
              type="email"
              value={email}
              readOnly
              disabled
            />
            <InputField
              label="Phone Number"
              id="profilePhone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={!isEditing || submitting}
              readOnly={!isEditing}
              placeholder="e.g., 123-456-7890"
            />
            <InputField
              label="Member Since"
              id="profileMemberSince"
              value={memberSince}
              readOnly
              disabled
            />
          </div>

          {isEditing && (
            <div className={styles.editActions}>
              <Button type="submit" disabled={submitting} variant="primary">
                {submitting ? <Spinner size="small" /> : 'Save Changes'}
              </Button>
              <Button type="button" onClick={handleEditToggle} variant="secondary" disabled={submitting}>
                Cancel
              </Button>
            </div>
          )}

          {!isEditing && (
            <>
              <h3 className={styles.sectionTitle}>Security</h3>
              <Button
                type="button"
                onClick={() => alert("Password change UI TBD")} // Placeholder
                variant="outline"
              >
                Change Password
              </Button>
            </>
          )}
        </form>
      </Card>

      {/* 
      <Modal isOpen={isPasswordModalOpen} onClose={closePasswordModal} title="Change Password">
          <PasswordChangeForm onSuccess={handlePasswordChangeSuccess} onCancel={closePasswordModal} />
      </Modal>
      */}
    </div>
  );
};

export default ProfilePage;