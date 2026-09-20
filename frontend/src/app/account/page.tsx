"use client";

import Image from "next/image";
import { useState } from "react";

import {
  changeMyPassword,
  updateMyProfile,
  uploadAvatar,
} from "@/src/features/user/services/user.service";

import type { User } from "@/src/features/user/types/user";
import { useUser } from "@/src/hooks/useUser";

export default function AccountPage() {

  const { user, setUser, loading } = useUser();

  // Profile
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Avatar
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  if (loading) {
    return <p className="p-6">Loading...</p>;
  }

  if (!user) {
    return (
      <p className="p-6">
        Failed to load profile.
      </p>
    );
  }

  // Update Profile
  const handleUpdateProfile = async () => {
    try {
      const updatedUser = await updateMyProfile({
        name,
        email,
      });

      setUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  // Change Password
  const handleChangePassword = async () => {
    try {
      await changeMyPassword({
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setIsChangingPassword(false);

      console.log("Password changed successfully");
    } catch (error) {
      console.error("Failed to change password", error);
    }
  };

  // Chọn file
  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] ?? null;

    setSelectedFile(file);

    // Nếu chọn file thì xóa URL
    setImageUrl("");
  };

  // Upload Avatar
  const handleUploadAvatar = async () => {
    try {
      if (!selectedFile && !imageUrl.trim()) {
        return;
      }

      setIsUploadingAvatar(true);

      let updatedUser: User;

      if (selectedFile) {
        updatedUser = await uploadAvatar(selectedFile);
      } else {
        updatedUser = await uploadAvatar(imageUrl.trim());
      }

      setUser(updatedUser);

      // Reset form
      setSelectedFile(null);
      setImageUrl("");

      // Reset input file
      const fileInput = document.getElementById(
        "avatar-file"
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error("Failed to upload avatar:", error);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-3xl font-bold">
        My Account
      </h1>

      {/* Avatar */}
      <div className="mt-6 rounded border p-6">
        <h2 className="text-xl font-semibold">
          Profile Avatar
        </h2>

        <div className="mt-4 flex items-center gap-4">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.name}
              width={80}
              height={80}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 text-2xl font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <p className="font-semibold">
              {user.name}
            </p>

            <p className="text-sm text-gray-500">
              Upload your profile avatar
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {/* Upload file */}
          <div>
                <label
                    htmlFor="avatar-file"
                    className="inline-block cursor-pointer rounded border px-4 py-2 text-sm font-medium hover:bg-gray-100"
                  >
                    Choose File
                  </label>

                  <input
                    id="avatar-file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {selectedFile && (
                    <p className="mt-2 text-sm text-gray-500">
                      Selected: {selectedFile.name}
                    </p>
                )}
            {selectedFile && (
              <p className="mt-1 text-sm text-gray-500">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>

          {/* Upload URL */}
          <div>
            <label
              htmlFor="avatar-url"
              className="mb-1 block text-sm font-medium"
            >
              Or use image URL
            </label>

            <input
              id="avatar-url"
              type="url"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setSelectedFile(null);
              }}
              placeholder="https://example.com/avatar.jpg"
              className="w-full rounded border p-2"
            />
          </div>

          <button
            type="button"
            onClick={handleUploadAvatar}
            disabled={
              isUploadingAvatar ||
              (!selectedFile && !imageUrl.trim())
            }
            className="rounded bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploadingAvatar
              ? "Uploading..."
              : "Upload Avatar"}
          </button>
        </div>
      </div>

      {/* Profile */}
      <div className="mt-6 space-y-4 rounded border p-6">
        <h2 className="text-xl font-semibold">
          Profile
        </h2>

        <div>
          <p className="text-sm text-gray-500">
            Name
          </p>

          {isEditing ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded border p-2"
            />
          ) : (
            <p className="font-semibold">
              {user.name}
            </p>
          )}
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Email
          </p>

          {isEditing ? (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded border p-2"
            />
          ) : (
            <p className="font-semibold">
              {user.email}
            </p>
          )}
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Role
          </p>

          <p className="font-semibold">
            {user.role}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Status
          </p>

          <p className="font-semibold">
            {user.status}
          </p>
        </div>

        {isEditing ? (
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleUpdateProfile}
              className="rounded bg-black px-4 py-2 text-white"
            >
              Save
            </button>

            <button
              type="button"
              onClick={() => {
                setName(user.name);
                setEmail(user.email);
                setIsEditing(false);
              }}
              className="rounded border px-4 py-2"
            >
              Cancel
            </button>
          </div>
        ) : (
         <button
            type="button"
            onClick={() => {
                setName(user.name);
                setEmail(user.email);
                setIsEditing(true);
            }}
            className="rounded border px-4 py-2"
            >
            Edit Profile
            </button>
        )}
      </div>

      {/* Change Password */}
      <div className="mt-6 rounded border p-6">
        <h2 className="text-xl font-semibold">
          Change Password
        </h2>

        {isChangingPassword ? (
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block">
                Current Password
              </label>

              <input
                type="password"
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(e.target.value)
                }
                className="w-full rounded border p-2"
              />
            </div>

            <div>
              <label className="mb-1 block">
                New Password
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                className="w-full rounded border p-2"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleChangePassword}
                className="rounded bg-black px-4 py-2 text-white"
              >
                Change Password
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentPassword("");
                  setNewPassword("");
                  setIsChangingPassword(false);
                }}
                className="rounded border px-4 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsChangingPassword(true)}
            className="mt-4 rounded border px-4 py-2"
          >
            Change Password
          </button>
        )}
      </div>
    </main>
  );
}
