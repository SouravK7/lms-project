import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import Navbar from "../components/Navbar";
import api from "../api/axios";

function ProfilePage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState({});

  const [profile, setProfile] = useState({
    username: "",
    email: "",
    role: "",
    bio: ""
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setErrors({});
        const response = await api.get("/api/auth/profile/");
        setProfile(response.data);
      } catch {
        setErrors({ general: "Unable to load profile." });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      setErrors({});
      setSuccess("");

      await api.patch("/api/auth/profile/", {
        email: profile.email,
        bio: profile.bio
      });

      setSuccess("Profile updated successfully.");
    } catch (error) {
      setErrors(error.response?.data || {});
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    try {
      setChangingPassword(true);
      setErrors({});
      setSuccess("");

      await api.post("/api/auth/change-password/", passwordData);

      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: ""
      });

      setSuccess("Password changed successfully.");
    } catch (error) {
      setErrors(error.response?.data || {});
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-container">Loading...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="page-container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          Back
        </button>

        <h1>Profile</h1>

        {success && <p className="success">{success}</p>}
        {errors.general && <p className="error">{errors.general}</p>}

        <div className="content-card">
          <label>Username</label>
          <input value={profile.username} disabled />

          <label>Email</label>
          <input
            name="email"
            value={profile.email}
            onChange={handleProfileChange}
          />

          {errors.email && (
            <p className="error">
              {Array.isArray(errors.email)
                ? errors.email[0]
                : errors.email}
            </p>
          )}

          <label>Role</label>
          <input
            value={
              profile.role
                ? profile.role.charAt(0).toUpperCase() +
                  profile.role.slice(1)
                : ""
            }
            disabled
          />

          <label>Bio</label>
          <textarea
            name="bio"
            rows={5}
            maxLength={300}
            value={profile.bio || ""}
            onChange={handleProfileChange}
          />

          <p className="counter">
            {(profile.bio || "").length}/300
          </p>

          <button onClick={saveProfile} disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>

        <div className="content-card">
          <h2>Change Password</h2>

          <input
            type="password"
            name="current_password"
            placeholder="Current Password"
            value={passwordData.current_password}
            onChange={handlePasswordChange}
          />

          <input
            type="password"
            name="new_password"
            placeholder="New Password"
            value={passwordData.new_password}
            onChange={handlePasswordChange}
          />

          <input
            type="password"
            name="confirm_password"
            placeholder="Confirm Password"
            value={passwordData.confirm_password}
            onChange={handlePasswordChange}
          />

          {errors.current_password && (
            <p className="error">
              {Array.isArray(errors.current_password)
                ? errors.current_password[0]
                : errors.current_password}
            </p>
          )}

          {errors.new_password && (
            <p className="error">
              {Array.isArray(errors.new_password)
                ? errors.new_password[0]
                : errors.new_password}
            </p>
          )}

          {errors.confirm_password && (
            <p className="error">
              {Array.isArray(errors.confirm_password)
                ? errors.confirm_password[0]
                : errors.confirm_password}
            </p>
          )}

          {errors.detail && (
            <p className="error">{errors.detail}</p>
          )}

          <button onClick={changePassword} disabled={changingPassword}>
            {changingPassword ? "Changing..." : "Change Password"}
          </button>
        </div>
      </div>
    </>
  );
}

export default ProfilePage;