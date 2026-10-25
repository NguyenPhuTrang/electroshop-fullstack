"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState, type ChangeEvent } from "react";
import { useRouter } from "@/src/i18n/navigation";
import { toast } from "sonner";

import {
  changeMyPassword,
  updateMyProfile,
  uploadAvatar,
} from "@/src/features/user/services/user.service";

import type { User } from "@/src/features/user/types/user";
import { useUser } from "@/src/hooks/useUser";

const inputClassName =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

const primaryButtonClassName =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButtonClassName =
  "inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50";

const sectionClassName =
  "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6";

function SectionHeading({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 text-sm font-bold text-blue-700 ring-1 ring-blue-100">
        {number}
      </div>

      <div className="min-w-0">
        <h2 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
          {title}
        </h2>

        <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const t = useTranslations("AccountPage");
  const router = useRouter();
  const { user, setUser, loading } = useUser();

  // Profile
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Avatar
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const getRoleLabel = (role: string) => {
    switch (role.toUpperCase()) {
      case "ADMIN":
        return t("accountRole.admin");
      case "CUSTOMER":
        return t("accountRole.customer");
      case "USER":
        return t("accountRole.user");
      default:
        return role;
    }
  };

  const getAccountStatusLabel = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return t("accountStatus.active");
      case "INACTIVE":
        return t("accountStatus.inactive");
      case "SUSPENDED":
        return t("accountStatus.suspended");
      case "BANNED":
        return t("accountStatus.banned");
      default:
        return status.replaceAll("_", " ");
    }
  };

  // Loading State
  if (loading) {
    return (
      <main
        className="min-h-screen bg-[#f7f8fa]"
        aria-busy="true"
        aria-label={t("loading.ariaLabel")}
      >
        <div className="mx-auto max-w-6xl px-3 py-6 sm:px-5 lg:px-6">
          <div className="mb-6 space-y-3">
            <div className="h-3 w-28 animate-pulse rounded-full bg-cyan-100" />
            <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-4 w-64 max-w-full animate-pulse rounded bg-slate-100" />
          </div>

          <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-4">
              <div className="size-20 animate-pulse rounded-2xl bg-slate-100" />
              <div className="flex-1 space-y-3">
                <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-52 max-w-full animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
                <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
                <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
                <div className="h-10 w-32 animate-pulse rounded-xl bg-blue-50" />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // User Not Available
  if (!user) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#f7f8fa] px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-rose-50 text-lg font-semibold text-rose-600">
            !
          </div>

          <h1 className="mt-4 text-lg font-semibold text-slate-900">
            {t("accountUnavailable.title")}
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {t("accountUnavailable.description")}
          </p>
        </div>
      </main>
    );
  }

  // Update Profile
  const handleUpdateProfile = async () => {
    if (isSavingProfile) return;

    if (!name.trim() || !email.trim()) {
      toast.error(t("errors.profileRequired"));
      return;
    }

    setIsSavingProfile(true);

    const toastId = toast.loading(t("toasts.savingProfile"));

    try {
      const updatedUser = await updateMyProfile({
        name: name.trim(),
        email: email.trim(),
      });

      setUser(updatedUser);
      setIsEditing(false);

      toast.success(t("toasts.profileUpdated"), {
        id: toastId,
        description: t("toasts.profileUpdatedDescription"),
      });
    } catch (error) {
      console.error("Failed to update profile:", error);

      toast.error(t("errors.updateProfile"), {
        id: toastId,
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Change Password
  const handleChangePassword = async () => {
    if (isSavingPassword) return;

    if (!currentPassword || !newPassword) {
      toast.error(t("errors.passwordRequired"));
      return;
    }

    setIsSavingPassword(true);

    const toastId = toast.loading(t("toasts.updatingPassword"));

    try {
      await changeMyPassword({
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setIsChangingPassword(false);

      toast.success(t("toasts.passwordChanged"), {
        id: toastId,
        description: t("toasts.passwordChangedDescription"),
      });
    } catch (error) {
      console.error("Failed to change password:", error);

      toast.error(t("errors.changePassword"), {
        id: toastId,
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Select Avatar File
  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] ?? null;

    setSelectedFile(file);
    setImageUrl("");
  };

  // Upload Avatar
  const handleUploadAvatar = async () => {
    if (isUploadingAvatar) return;

    if (!selectedFile && !imageUrl.trim()) {
      toast.error(t("errors.avatarRequired"));
      return;
    }

    if (imageUrl.trim() && !selectedFile) {
      try {
        const parsedUrl = new URL(imageUrl.trim());

        if (
          parsedUrl.protocol !== "http:" &&
          parsedUrl.protocol !== "https:"
        ) {
          throw new Error("Invalid image URL");
        }
      } catch {
        toast.error(t("errors.invalidImageUrl"));
        return;
      }
    }

    setIsUploadingAvatar(true);

    const toastId = toast.loading(t("toasts.updatingAvatar"));

    try {
      let updatedUser: User;

      if (selectedFile) {
        updatedUser = await uploadAvatar(selectedFile);
      } else {
        updatedUser = await uploadAvatar(imageUrl.trim());
      }

      setUser(updatedUser);
      setSelectedFile(null);
      setImageUrl("");

      const fileInput = document.getElementById(
        "avatar-file"
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      toast.success(t("toasts.avatarUpdated"), {
        id: toastId,
        description: t("toasts.avatarUpdatedDescription"),
      });
    } catch (error) {
      console.error("Failed to upload avatar:", error);

      toast.error(t("errors.updateAvatar"), {
        id: toastId,
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Cancel Profile Editing
  const handleCancelProfileEdit = () => {
    setName(user.name);
    setEmail(user.email);
    setIsEditing(false);
  };

  // Cancel Password Editing
  const handleCancelPasswordChange = () => {
    setCurrentPassword("");
    setNewPassword("");
    setIsChangingPassword(false);
  };

  const roleLabel = getRoleLabel(String(user.role));
  const accountStatusLabel = getAccountStatusLabel(String(user.status));

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-5 sm:py-7 lg:px-6 lg:py-8">
        {/* Page Heading */}
        <section className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1">
              <span className="size-1.5 rounded-full bg-cyan-500" />

              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-800 sm:text-xs">
                {t("page.badge")}
              </p>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {t("page.title")}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              {t("page.description")}
            </p>
          </div>

          {/* Account Reminder */}
          <div className="flex shrink-0 items-center gap-2.5 rounded-xl border border-cyan-100 bg-cyan-50/70 p-3.5 lg:max-w-lg">
            <span
              className="shrink-0 text-cyan-700"
              aria-hidden="true"
            >
              ✦
            </span>

            <p className="text-xs leading-5 text-slate-600">
              {t("page.reminder")}
            </p>
          </div>
        </section>

        {/* Profile Avatar */}
        <section className={`${sectionClassName} mb-5 overflow-hidden`}>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-center gap-4 sm:gap-5">
              <div className="relative size-20 shrink-0 sm:size-24">
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={t("avatar.alt", { name: user.name })}
                    width={96}
                    height={96}
                    priority
                    className="size-full rounded-full border-2 border-white bg-slate-50 object-cover shadow-md ring-1 ring-slate-200"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 text-3xl font-semibold text-white shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <span
                  aria-hidden="true"
                  className="absolute -bottom-1 -right-1 size-5 rounded-full border-2 border-white bg-emerald-500"
                />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {t("avatar.label")}
                </p>

                <h2 className="mt-1 break-words text-lg font-semibold text-slate-900 sm:text-xl">
                  {user.name}
                </h2>

                <p className="mt-1 break-all text-sm text-slate-500">
                  {user.email}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                    {roleLabel}
                  </span>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                      user.status === "ACTIVE"
                        ? "border border-emerald-100 bg-emerald-50 text-emerald-700"
                        : "border border-amber-100 bg-amber-50 text-amber-700"
                    }`}
                  >
                    {accountStatusLabel}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 self-start rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
              <span className="size-2 rounded-full bg-emerald-500" />
              {t("avatar.accountOverview")}
            </div>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-800">
                {t("avatar.updateTitle")}
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                {t("avatar.updateDescription")}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Upload File */}
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-4 transition hover:border-blue-300 hover:bg-blue-50/30">
                <label
                  htmlFor="avatar-file"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  {t("avatar.fileLabel")}
                </label>

                <input
                  id="avatar-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploadingAvatar}
                  className="block w-full cursor-pointer text-xs text-slate-500 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100 disabled:cursor-not-allowed"
                />

                {selectedFile && (
                  <p className="mt-3 break-all text-xs text-slate-500">
                    {t("avatar.selectedFile", {
                      name: selectedFile.name,
                    })}
                  </p>
                )}
              </div>

              {/* Upload URL */}
              <div>
                <label
                  htmlFor="avatar-url"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  {t("avatar.urlLabel")}
                </label>

                <input
                  id="avatar-url"
                  type="url"
                  value={imageUrl}
                  onChange={(event) => {
                    setImageUrl(event.target.value);
                    setSelectedFile(null);
                  }}
                  disabled={isUploadingAvatar}
                  placeholder={t("avatar.urlPlaceholder")}
                  className={inputClassName}
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  {t("avatar.urlHint")}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => void handleUploadAvatar()}
                disabled={
                  isUploadingAvatar ||
                  (!selectedFile && !imageUrl.trim())
                }
                className={primaryButtonClassName}
              >
                {isUploadingAvatar ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    />
                    {t("buttons.uploading")}
                  </>
                ) : (
                  <>
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      className="size-4"
                    >
                      <path
                        d="M12 16V4m-5 5 5-5 5 5M4 16v4h16v-4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {t("buttons.uploadAvatar")}
                  </>
                )}
              </button>

              <p className="text-xs leading-5 text-slate-400">
                {t("avatar.uploadHint")}
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-5">
            {/* Profile Details */}
            <section className={sectionClassName}>
              <SectionHeading
                number="01"
                title={t("profile.sectionTitle")}
                description={t("profile.sectionDescription")}
              />

              <div className="mt-5 space-y-4">
                {/* Name */}
                <div>
                  <label
                    htmlFor="account-name"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    {t("profile.fields.fullName")}
                  </label>

                  {isEditing ? (
                    <input
                      id="account-name"
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder={t("profile.placeholders.fullName")}
                      autoComplete="name"
                      className={inputClassName}
                    />
                  ) : (
                    <div className="flex min-h-11 items-center rounded-xl border border-slate-100 bg-slate-50 px-3.5">
                      <p className="break-words text-sm font-medium text-slate-800">
                        {user.name}
                      </p>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="account-email"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    {t("profile.fields.email")}
                  </label>

                  {isEditing ? (
                    <input
                      id="account-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder={t("profile.placeholders.email")}
                      autoComplete="email"
                      className={inputClassName}
                    />
                  ) : (
                    <div className="flex min-h-11 items-center rounded-xl border border-slate-100 bg-slate-50 px-3.5">
                      <p className="break-all text-sm font-medium text-slate-800">
                        {user.email}
                      </p>
                    </div>
                  )}
                </div>

                {/* Role & Status */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                    <p className="text-xs font-medium text-slate-500">
                      {t("profile.accountRole")}
                    </p>

                    <p className="mt-1.5 text-sm font-semibold text-slate-800">
                      {roleLabel}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                    <p className="text-xs font-medium text-slate-500">
                      {t("profile.accountStatus")}
                    </p>

                    <div className="mt-1.5 flex items-center gap-2">
                      <span
                        className={`size-2 rounded-full ${
                          user.status === "ACTIVE"
                            ? "bg-emerald-500"
                            : "bg-amber-500"
                        }`}
                      />

                      <p className="text-sm font-semibold text-slate-800">
                        {accountStatusLabel}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <div className="flex flex-wrap gap-2">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void handleUpdateProfile()}
                        disabled={isSavingProfile}
                        className={primaryButtonClassName}
                      >
                        {isSavingProfile ? (
                          <>
                            <span
                              aria-hidden="true"
                              className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                            />
                            {t("buttons.saving")}
                          </>
                        ) : (
                          t("buttons.saveChanges")
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleCancelProfileEdit}
                        disabled={isSavingProfile}
                        className={secondaryButtonClassName}
                      >
                        {t("buttons.cancel")}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setName(user.name);
                        setEmail(user.email);
                        setIsEditing(true);
                      }}
                      className={primaryButtonClassName}
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        className="size-4"
                      >
                        <path
                          d="m14 6 4 4M4 20l4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                      {t("buttons.editProfile")}
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* Change Password */}
            <section className={sectionClassName}>
              <SectionHeading
                number="02"
                title={t("security.sectionTitle")}
                description={t("security.sectionDescription")}
              />

              {!isChangingPassword ? (
                <>
                  <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        className="size-5"
                      >
                        <rect
                          x="4"
                          y="10"
                          width="16"
                          height="11"
                          rx="2"
                        />
                        <path
                          d="M8 10V7a4 4 0 0 1 8 0v3"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800">
                        {t("security.protectionTitle")}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {t("security.protectionDescription")}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsChangingPassword(true)}
                    className={`${secondaryButtonClassName} mt-4`}
                  >
                    {t("buttons.changePassword")}
                  </button>
                </>
              ) : (
                <div className="mt-5 space-y-4">
                  <div>
                    <label
                      htmlFor="current-password"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      {t("security.fields.currentPassword")}
                    </label>

                    <input
                      id="current-password"
                      type="password"
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={(event) =>
                        setCurrentPassword(event.target.value)
                      }
                      placeholder={t("security.placeholders.currentPassword")}
                      disabled={isSavingPassword}
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="new-password"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      {t("security.fields.newPassword")}
                    </label>

                    <input
                      id="new-password"
                      type="password"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(event) =>
                        setNewPassword(event.target.value)
                      }
                      placeholder={t("security.placeholders.newPassword")}
                      disabled={isSavingPassword}
                      className={inputClassName}
                    />

                    <p className="mt-1.5 text-xs text-slate-400">
                      {t("security.passwordHint")}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void handleChangePassword()}
                      disabled={isSavingPassword}
                      className={primaryButtonClassName}
                    >
                      {isSavingPassword ? (
                        <>
                          <span
                            aria-hidden="true"
                            className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                          />
                          {t("buttons.updatingPassword")}
                        </>
                      ) : (
                        t("buttons.updatePassword")
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleCancelPasswordChange}
                      disabled={isSavingPassword}
                      className={secondaryButtonClassName}
                    >
                      {t("buttons.cancel")}
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Order History */}
          <section className={`${sectionClassName} relative overflow-hidden`}>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 -top-14 size-40 rounded-full"
            />

            <div className="relative">
              <SectionHeading
                number="03"
                title={t("orderHistory.sectionTitle")}
                description={t("orderHistory.sectionDescription")}
              />

              <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-white p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-600/15">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      className="size-6"
                    >
                      <path
                        d="M6 3h9l4 4v14H6zM15 3v5h4M9 12h7M9 16h7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                    {t("orderHistory.badge")}
                  </span>
                </div>

                <h3 className="mt-5 text-base font-semibold text-slate-900">
                  {t("orderHistory.cardTitle")}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {t("orderHistory.cardDescription")}
                </p>

                <button
                  type="button"
                  onClick={() => router.push("/account/orders/history")}
                  className={`${primaryButtonClassName} mt-5 w-full sm:w-auto`}
                >
                  {t("buttons.viewOrderHistory")}

                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="size-4"
                  >
                    <path
                      d="M5 12h14m-6-6 6 6-6 6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="h-5 sm:h-8" />
      </div>
    </main>
  );
}